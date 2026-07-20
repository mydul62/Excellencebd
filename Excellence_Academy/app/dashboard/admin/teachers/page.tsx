'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, GraduationCap, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { getTeachers, type ServerTeacher } from '@/services'
import { updateTeacher, deleteTeacher } from '@/serverdata/teachers'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

// ── Edit schema — only fields that PUT /api/teachers/:id accepts ──────────────
const editSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(1, 'Subject is required'),
  bio: z.string().trim().optional(),
  experienceYears: z.coerce.number().min(0, 'Must be 0 or more'),
  qualification: z.string().trim().optional(),
})

type EditFormValues = z.infer<typeof editSchema>

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<ServerTeacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<ServerTeacher | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) as any })

  // ── Data fetch ─────────────────────────────────────────────────────────────
  const fetchTeachers = () => {
    setLoading(true)
    getTeachers()
      .then(setTeachers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTeachers() }, [])

  // ── Open edit dialog with pre-filled values ────────────────────────────────
  function openEdit(teacher: ServerTeacher) {
    setEditTarget(teacher)
    reset({
      name: teacher.user?.name ?? '',
      phone: teacher.user?.phone ?? '',
      subject: teacher.subject ?? '',
      bio: teacher.bio ?? '',
      experienceYears: teacher.experienceYears ?? 0,
      qualification: teacher.qualification ?? '',
    })
  }

  // ── Submit edit — PUT /api/teachers/:id ────────────────────────────────────
  async function onEditSubmit(values: EditFormValues) {
    if (!editTarget) return
    try {
      await updateTeacher(editTarget.id, {
        name: values.name,
        phone: values.phone || undefined,
        subject: values.subject,
        bio: values.bio || undefined,
        experienceYears: values.experienceYears,
        qualification: values.qualification || undefined,
      })
      toast.success('Teacher updated successfully')
      setEditTarget(null)
      fetchTeachers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update teacher')
    }
  }

  // ── Delete — DELETE /api/teachers/:id ──────────────────────────────────────
  async function handleDelete(teacher: ServerTeacher) {
    const confirmed = confirm(
      `Delete teacher "${teacher.user?.name}"? This will also remove their user account and cannot be undone.`,
    )
    if (!confirmed) return

    setDeletingId(teacher.id)
    try {
      await deleteTeacher(teacher.id)
      toast.success('Teacher deleted')
      setTeachers((prev) => prev.filter((t) => t.id !== teacher.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete teacher')
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
              <GraduationCap className="h-4 w-4" />Teacher Management
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Teachers</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Review faculty profiles, edit details, and manage accounts.
            </p>
          </div>
          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      <SectionCard
        title={`Teachers (${teachers.length})`}
        description="All registered teaching staff."
        action={
          <Button render={<Link href="/dashboard/admin/teachers/register" />}>
            <Plus className="mr-2 h-4 w-4" />Register Teacher
          </Button>
        }
      >
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && teachers.length === 0 && (
          <p className="text-sm text-muted-foreground">No teachers found.</p>
        )}
        {!loading && !error && teachers.length > 0 && (
          <DataTable
            columns={[
              {
                header: 'Teacher',
                accessor: (row) => (
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarImage src={row.user?.avatar ?? ''} alt={row.user?.name ?? ''} />
                      <AvatarFallback>{(row.user?.name ?? 'T').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{row.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{row.subject}</p>
                    </div>
                  </div>
                ),
              },
              { header: 'Email', accessor: (row) => row.user?.email ?? '—' },
              { header: 'Experience', accessor: (row) => `${row.experienceYears} yrs` },
              { header: 'Courses', accessor: (row) => row.courses?.length ?? 0 },
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
            data={teachers}
          />
        )}
      </SectionCard>

      {/* ── Edit Dialog ── */}
      <Dialog open={editTarget !== null} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onEditSubmit as any)} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" placeholder="01XXXXXXXXX" {...register('phone')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-subject">Subject</Label>
              <Input id="edit-subject" placeholder="Mathematics" {...register('subject')} />
              {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-exp">Experience (Years)</Label>
              <Input id="edit-exp" type="number" min={0} {...register('experienceYears')} />
              {errors.experienceYears && (
                <p className="text-sm text-destructive">{errors.experienceYears.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-qual">Qualification</Label>
              <Input id="edit-qual" placeholder="M.Sc in Mathematics" {...register('qualification')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea id="edit-bio" placeholder="Short biography…" rows={3} {...register('bio')} />
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
