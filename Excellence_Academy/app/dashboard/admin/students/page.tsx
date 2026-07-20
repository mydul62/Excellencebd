'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Users, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  getStudentsFromApi,
  updateStudent,
  deleteStudent,
  type ServerStudent,
} from '@/serverdata/students'
import { getEnrollments } from '@/serverdata/enrollments'
import type { ServerEnrollment } from '@/serverdata/enrollments'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/format'

// ── Edit schema ───────────────────────────────────────────────────────────────
const editSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  phone: z.string().trim().optional(),
  guardian: z.string().trim().optional(),
  address: z.string().trim().optional(),
  status: z.enum(['active', 'inactive']),
})

type EditFormValues = z.infer<typeof editSchema>

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<ServerStudent[]>([])
  const [enrollments, setEnrollments] = useState<ServerEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<ServerStudent | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) })

  // ── Data fetch ─────────────────────────────────────────────────────────────
  const fetchData = () => {
    setLoading(true)
    Promise.all([
      getStudentsFromApi({ limit: 200 }),
      getEnrollments({ limit: 200 }),
    ])
      .then(([studentsRes, enrollmentsRes]) => {
        setStudents(studentsRes.data)
        setEnrollments(enrollmentsRes.data)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const enrollmentCount = (userId: string) =>
    enrollments.filter((e) => e.userId === userId).length

  const approvedCount = (userId: string) =>
    enrollments.filter((e) => e.userId === userId && e.enrollmentStatus === 'approved').length

  // ── Open edit dialog ───────────────────────────────────────────────────────
  function openEdit(student: ServerStudent) {
    setEditTarget(student)
    reset({
      name: student.name ?? '',
      phone: student.phone ?? '',
      guardian: student.guardian ?? '',
      address: student.address ?? '',
      status: (student.status as 'active' | 'inactive') ?? 'active',
    })
  }

  // ── Submit edit — PUT /api/students/:id ────────────────────────────────────
  async function onEditSubmit(values: EditFormValues) {
    if (!editTarget) return
    try {
      await updateStudent(editTarget.id, {
        name: values.name,
        phone: values.phone || undefined,
        guardian: values.guardian || undefined,
        address: values.address || undefined,
        status: values.status,
      })
      toast.success('Student updated successfully')
      setEditTarget(null)
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update student')
    }
  }

  // ── Delete — DELETE /api/students/:id ─────────────────────────────────────
  async function handleDelete(student: ServerStudent) {
    const confirmed = confirm(
      `Delete student "${student.name}"? This will remove their account and all associated data permanently.`,
    )
    if (!confirmed) return

    setDeletingId(student.id)
    try {
      await deleteStudent(student.id)
      toast.success('Student deleted')
      setStudents((prev) => prev.filter((s) => s.id !== student.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete student')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Users className="h-4 w-4" />Student Management
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Students</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              All registered students with their enrollment summary.
            </p>
          </div>
          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      <SectionCard
        title={`Students (${students.length})`}
        description="View and manage student profiles"
        action={
          <Button render={<Link href="/dashboard/admin/students/register" />}>
            <Plus className="mr-2 h-4 w-4" />Register Student
          </Button>
        }
      >
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && students.length === 0 && (
          <p className="text-sm text-muted-foreground">No students found.</p>
        )}
        {!loading && !error && students.length > 0 && (
          <DataTable
            columns={[
              {
                header: 'Student',
                accessor: (row) => (
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarImage src={row.avatar ?? ''} alt={row.name} />
                      <AvatarFallback>{row.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                  </div>
                ),
              },
              { header: 'Phone', accessor: (row) => row.phone ?? '—' },
              {
                header: 'Status',
                accessor: (row) => (
                  <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                    {row.status}
                  </Badge>
                ),
              },
              {
                header: 'Enrollments',
                accessor: (row) => (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{enrollmentCount(row.id)}</span>
                    {approvedCount(row.id) > 0 && (
                      <Badge variant="default" className="text-xs">
                        {approvedCount(row.id)} approved
                      </Badge>
                    )}
                  </div>
                ),
              },
              {
                header: 'Joined',
                accessor: (row) => formatDate(row.createdAt),
              },
              {
                header: 'Actions',
                accessor: (row) => (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="size-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      disabled={deletingId === row.id}
                      onClick={() => handleDelete(row)}
                    >
                      <Trash2 className="size-3 mr-1" />
                      {deletingId === row.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={students}
          />
        )}
      </SectionCard>

      {/* ── Edit Dialog ── */}
      <Dialog open={editTarget !== null} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onEditSubmit)} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="s-name">Full Name</Label>
              <Input id="s-name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="s-phone">Phone</Label>
              <Input id="s-phone" placeholder="01XXXXXXXXX" {...register('phone')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="s-guardian">Guardian</Label>
              <Input id="s-guardian" placeholder="Parent / Guardian name" {...register('guardian')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="s-address">Address</Label>
              <Textarea id="s-address" placeholder="Student address" rows={2} {...register('address')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="s-status">Status</Label>
              <select
                id="s-status"
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
                {...register('status')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
            </div>

            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
