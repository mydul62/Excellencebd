'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, Pencil, Trash2, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  getAdminEnrollments,
  approveEnrollment,
  rejectEnrollment,
  updateEnrollment,
  deleteEnrollment,
  type ServerEnrollment,
  type EnrollmentStatus,
  type PaymentStatus,
} from '@/serverdata/enrollments'
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
import { formatCurrency, formatDate } from '@/lib/format'

// ── Edit schema — mirrors PUT /api/enrollments/:id payload ────────────────────
const editSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  paymentStatus: z.enum(['unpaid', 'paid', 'partial']),
  amountPaid: z.coerce.number().min(0, 'Amount must be 0 or more'),
  notes: z.string().trim().optional(),
})

type EditFormValues = z.infer<typeof editSchema>

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

const STATUS_BADGE: Record<EnrollmentStatus, 'default' | 'destructive' | 'secondary'> = {
  approved: 'default',
  rejected: 'destructive',
  pending: 'secondary',
}

const PAYMENT_BADGE: Record<PaymentStatus, 'default' | 'secondary'> = {
  paid: 'default',
  unpaid: 'secondary',
  partial: 'secondary',
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<ServerEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<ServerEnrollment | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [studentDetailsTarget, setStudentDetailsTarget] = useState<ServerEnrollment | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) })

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchEnrollments = () => {
    setLoading(true)
    getAdminEnrollments({ limit: 200 })
      .then(({ data }) => setEnrollments(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEnrollments() }, [])

  // ── Derived state ──────────────────────────────────────────────────────────
  const filtered = enrollments.filter((e) =>
    statusFilter === 'all' ? true : e.status === statusFilter,
  )

  const counts = {
    all: enrollments.length,
    pending: enrollments.filter((e) => e.status === 'pending').length,
    approved: enrollments.filter((e) => e.status === 'approved').length,
    rejected: enrollments.filter((e) => e.status === 'rejected').length,
  }

  // ── Quick approve / reject ─────────────────────────────────────────────────
  async function handleStatusChange(
    enrollmentId: string,
    status: 'approved' | 'rejected',
  ) {
    setActionLoading(enrollmentId)
    try {
      if (status === 'approved') {
        await approveEnrollment(enrollmentId)
        toast.success('Enrollment approved successfully')
      } else {
        await rejectEnrollment(enrollmentId, 'Transaction ID is not valid. Please provide a valid TRX ID.')
        toast.success('Enrollment rejected successfully')
      }
      fetchEnrollments()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update enrollment')
    } finally {
      setActionLoading(null)
    }
  }

  // ── Open edit dialog ───────────────────────────────────────────────────────
  function openEdit(enrollment: ServerEnrollment) {
    setEditTarget(enrollment)
    reset({
      status: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
      amountPaid: enrollment.amountPaid,
      notes: enrollment.notes ?? '',
    })
  }

  // ── Submit edit — PUT /api/enrollments/:id ─────────────────────────────────
  async function onEditSubmit(values: EditFormValues) {
    if (!editTarget) return
    try {
      await updateEnrollment(editTarget.id, {
        status: values.status,
        paymentStatus: values.paymentStatus,
        amountPaid: values.amountPaid,
        notes: values.notes || undefined,
      })
      toast.success('Enrollment updated successfully')
      setEditTarget(null)
      fetchEnrollments()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update enrollment')
    }
  }

  // ── Delete — DELETE /api/enrollments/:id ──────────────────────────────────
  async function handleDelete(enrollment: ServerEnrollment) {
    const studentName = enrollment.user?.name ?? enrollment.name
    const courseName = enrollment.course?.title ?? 'this course'
    const confirmed = confirm(
      `Remove enrollment for "${studentName}" in "${courseName}"? This cannot be undone.`,
    )
    if (!confirmed) return

    setDeletingId(enrollment.id)
    try {
      await deleteEnrollment(enrollment.id)
      toast.success('Enrollment removed')
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollment.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove enrollment')
    } finally {
      setDeletingId(null)
    }
  }

  const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
    { key: 'all',      label: `All (${counts.all})` },
    { key: 'pending',  label: `Pending (${counts.pending})` },
    { key: 'approved', label: `Approved (${counts.approved})` },
    { key: 'rejected', label: `Rejected (${counts.rejected})` },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-3xl border border-border/60 bg-linear-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <BookOpen className="h-4 w-4" />Enrollment Management
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Course Enrollments
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Review, approve, reject, edit, and remove student enrollment requests.
            </p>
          </div>
          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <SectionCard
        title="Enrollments"
        description="Manage student course purchases and payment verification"
      >
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No {statusFilter === 'all' ? '' : statusFilter} enrollments found.
          </p>
        )}
        {!loading && !error && filtered.length > 0 && (
          <DataTable
            columns={[
              {
                header: 'Student',
                accessor: (row) => (
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarImage src={row.user?.avatar ?? ''} alt={row.user?.name ?? ''} />
                      <AvatarFallback>
                        {(row.user?.name ?? row.name ?? 'S').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{row.user?.name ?? row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.user?.email ?? row.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Course',
                accessor: (row) => (
                  <div>
                    <p className="font-medium text-foreground">{row.course?.title ?? 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{row.course?.category}</p>
                  </div>
                ),
              },
              {
                header: 'Payment',
                accessor: (row) => (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{formatCurrency(row.amountPaid)}</span>
                    <Badge
                      variant={PAYMENT_BADGE[row.paymentStatus]}
                      className="w-fit text-xs"
                    >
                      {row.paymentMethod} · {row.paymentStatus}
                    </Badge>
                    {row.transactionId && (
                      <span className="text-xs text-muted-foreground">TXN: {row.transactionId}</span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Status',
                accessor: (row) => (
                  <Badge variant={STATUS_BADGE[row.status]}>{row.status}</Badge>
                ),
              },
              {
                header: 'Date',
                accessor: (row) => (
                  <span className="text-xs text-muted-foreground">{formatDate(row.enrolledAt)}</span>
                ),
              },
              {
                header: 'Actions',
                accessor: (row) => (
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setStudentDetailsTarget(row)}
                    >
                      <Eye className="size-3 mr-1" />
                      Details
                    </Button>
                    {row.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 px-2 text-xs"
                          disabled={actionLoading === row.id}
                          onClick={() => handleStatusChange(row.id, 'approved')}
                        >
                          <CheckCircle2 className="size-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 text-xs"
                          disabled={actionLoading === row.id}
                          onClick={() => handleStatusChange(row.id, 'rejected')}
                        >
                          <XCircle className="size-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      disabled={actionLoading === row.id}
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="size-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      disabled={deletingId === row.id || actionLoading === row.id}
                      onClick={() => handleDelete(row)}
                    >
                      <Trash2 className="size-3 mr-1" />
                      {deletingId === row.id ? 'Removing…' : 'Delete'}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        )}
      </SectionCard>

      {/* ── Student Details Dialog ── */}
      <Dialog
        open={studentDetailsTarget !== null}
        onOpenChange={(open) => { if (!open) setStudentDetailsTarget(null) }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Purchase History</DialogTitle>
          </DialogHeader>

          {studentDetailsTarget && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                <p className="font-semibold text-foreground">
                  {studentDetailsTarget.user?.name ?? studentDetailsTarget.name}
                </p>
                <p className="text-sm text-muted-foreground">{studentDetailsTarget.user?.email ?? studentDetailsTarget.email}</p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-sm font-medium text-foreground">Purchased Course</p>
                  <p className="text-sm text-muted-foreground">{studentDetailsTarget.course?.title ?? 'Unknown course'}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-sm font-medium text-foreground">Transaction ID</p>
                  <p className="text-sm text-muted-foreground">{studentDetailsTarget.transactionId || '—'}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-sm font-medium text-foreground">Payment Status</p>
                  <p className="text-sm text-muted-foreground">{studentDetailsTarget.paymentStatus}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <p className="text-sm font-medium text-foreground">Enrollment Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(studentDetailsTarget.enrolledAt)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Enrollment</DialogTitle>
          </DialogHeader>

          {editTarget && (
            <div className="mb-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm">
              <p className="font-medium text-foreground">
                {editTarget.user?.name ?? editTarget.name}
              </p>
              <p className="text-muted-foreground">
                {editTarget.course?.title ?? 'Unknown course'} ·{' '}
                {formatDate(editTarget.enrolledAt)}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onEditSubmit)} className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="e-status">Enrollment Status</Label>
                <select
                  id="e-status"
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
                  {...register('status')}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="e-payment-status">Payment Status</Label>
                <select
                  id="e-payment-status"
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
                  {...register('paymentStatus')}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
                {errors.paymentStatus && (
                  <p className="text-sm text-destructive">{errors.paymentStatus.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="e-amount">Amount Paid (৳)</Label>
              <Input
                id="e-amount"
                type="number"
                min={0}
                step={1}
                {...register('amountPaid')}
              />
              {errors.amountPaid && (
                <p className="text-sm text-destructive">{errors.amountPaid.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="e-notes">Notes (optional)</Label>
              <Textarea
                id="e-notes"
                placeholder="Internal notes about this enrollment…"
                rows={3}
                {...register('notes')}
              />
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
