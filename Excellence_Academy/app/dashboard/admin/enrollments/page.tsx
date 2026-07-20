'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, BookOpen, CheckCircle2, XCircle, Pencil, Trash2, Eye, AlertTriangle,
} from 'lucide-react'
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

// ── Schemas ───────────────────────────────────────────────────────────────────

const editSchema = z.object({
  enrollmentStatus: z.enum(['pending', 'approved', 'rejected']),
  paymentStatus:    z.enum(['unpaid', 'paid', 'partial']),
  rejectionReason:  z.string().trim().optional(),
})

const rejectSchema = z.object({
  reason: z.string().trim().min(1, 'Please enter a rejection reason'),
})

type EditFormValues   = z.infer<typeof editSchema>
type RejectFormValues = z.infer<typeof rejectSchema>
type StatusFilter     = 'all' | 'pending' | 'approved' | 'rejected'

const ENROLLMENT_BADGE: Record<EnrollmentStatus, 'default' | 'destructive' | 'secondary'> = {
  approved: 'default',
  rejected: 'destructive',
  pending:  'secondary',
}

const PAYMENT_BADGE: Record<PaymentStatus, 'default' | 'secondary'> = {
  paid:    'default',
  unpaid:  'secondary',
  partial: 'secondary',
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminEnrollmentsPage() {
  const [enrollments,          setEnrollments]          = useState<ServerEnrollment[]>([])
  const [loading,              setLoading]              = useState(true)
  const [error,                setError]                = useState<string | null>(null)
  const [statusFilter,         setStatusFilter]         = useState<StatusFilter>('all')
  const [actionLoading,        setActionLoading]        = useState<string | null>(null)
  const [editTarget,           setEditTarget]           = useState<ServerEnrollment | null>(null)
  const [rejectTarget,         setRejectTarget]         = useState<ServerEnrollment | null>(null)
  const [detailsTarget,        setDetailsTarget]        = useState<ServerEnrollment | null>(null)
  const [deletingId,           setDeletingId]           = useState<string | null>(null)

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  })

  const rejectForm = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: '' },
  })

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchEnrollments = () => {
    setLoading(true)
    getAdminEnrollments({ limit: 200 })
      .then(({ data }) => setEnrollments(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEnrollments() }, [])

  // ── Derived state ─────────────────────────────────────────────────────────
  const filtered = enrollments.filter((e) =>
    statusFilter === 'all' ? true : e.enrollmentStatus === statusFilter,
  )

  const counts = {
    all:      enrollments.length,
    pending:  enrollments.filter((e) => e.enrollmentStatus === 'pending').length,
    approved: enrollments.filter((e) => e.enrollmentStatus === 'approved').length,
    rejected: enrollments.filter((e) => e.enrollmentStatus === 'rejected').length,
  }

  // ── Payment difference helper ─────────────────────────────────────────────
  const paymentDiff = (e: ServerEnrollment) => {
    const diff = e.amountSent - e.courseFee
    if (diff === 0) return { label: 'Exact', color: 'text-emerald-600' }
    if (diff > 0)   return { label: `+${formatCurrency(diff)} overpaid`, color: 'text-blue-600' }
    return           { label: `${formatCurrency(Math.abs(diff))} underpaid`, color: 'text-amber-600' }
  }

  // ── Approve ───────────────────────────────────────────────────────────────
  async function handleApprove(id: string) {
    setActionLoading(id)
    try {
      await approveEnrollment(id)
      toast.success('Enrollment approved')
      fetchEnrollments()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  // ── Reject (with reason dialog) ───────────────────────────────────────────
  function openReject(enrollment: ServerEnrollment) {
    setRejectTarget(enrollment)
    rejectForm.reset({ reason: '' })
  }

  async function onRejectSubmit(values: RejectFormValues) {
    if (!rejectTarget) return
    try {
      await rejectEnrollment(rejectTarget.id, values.reason)
      toast.success('Enrollment rejected')
      setRejectTarget(null)
      fetchEnrollments()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject')
    }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  function openEdit(enrollment: ServerEnrollment) {
    setEditTarget(enrollment)
    editForm.reset({
      enrollmentStatus: enrollment.enrollmentStatus,
      paymentStatus:    enrollment.paymentStatus,
      rejectionReason:  enrollment.rejectionReason ?? '',
    })
  }

  async function onEditSubmit(values: EditFormValues) {
    if (!editTarget) return
    try {
      await updateEnrollment(editTarget.id, {
        enrollmentStatus: values.enrollmentStatus,
        paymentStatus:    values.paymentStatus,
        rejectionReason:  values.rejectionReason || undefined,
      })
      toast.success('Enrollment updated')
      setEditTarget(null)
      fetchEnrollments()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(enrollment: ServerEnrollment) {
    const confirmed = confirm(
      `Remove enrollment for "${enrollment.user?.name}" in "${enrollment.course?.title}"? Cannot be undone.`,
    )
    if (!confirmed) return
    setDeletingId(enrollment.id)
    try {
      await deleteEnrollment(enrollment.id)
      toast.success('Enrollment removed')
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollment.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <BookOpen className="h-4 w-4" />Enrollment Management
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Course Enrollments</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Review, verify, approve or reject student enrollment requests.
            </p>
          </div>
          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back
          </Button>
        </div>
      </div>

      {/* Status tabs */}
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

      <SectionCard title="Enrollments" description="Student payment submissions awaiting review">
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
                      <AvatarFallback>{(row.user?.name ?? 'S').slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{row.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{row.user?.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Course',
                accessor: (row) => (
                  <div>
                    <p className="font-medium text-foreground">{row.course?.title ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{row.course?.category}</p>
                  </div>
                ),
              },
              {
                header: 'Payment Method',
                accessor: (row) => (
                  <div className="flex items-center gap-2">
                    {row.paymentMethod?.logo ? (
                      <Image src={row.paymentMethod.logo} alt={row.paymentMethod.name} width={24} height={24} className="rounded" unoptimized />
                    ) : null}
                    <div>
                      <p className="text-sm font-medium">{row.paymentMethod?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{row.paymentMethod?.accountType}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Amount',
                accessor: (row) => {
                  const diff = paymentDiff(row)
                  return (
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        Sent: <span className="text-foreground">{formatCurrency(row.amountSent)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fee: {formatCurrency(row.courseFee)}
                      </p>
                      <p className={`text-xs font-medium ${diff.color}`}>{diff.label}</p>
                    </div>
                  )
                },
              },
              {
                header: 'Sender No.',
                accessor: (row) => (
                  <div>
                    <p className="font-mono text-sm">{row.senderNumber}</p>
                    <p className="text-xs text-muted-foreground">TXN: {row.transactionId}</p>
                  </div>
                ),
              },
              {
                header: 'Payment',
                accessor: (row) => (
                  <Badge variant={PAYMENT_BADGE[row.paymentStatus]} className="text-xs">
                    {row.paymentStatus}
                  </Badge>
                ),
              },
              {
                header: 'Status',
                accessor: (row) => (
                  <div className="space-y-1">
                    <Badge variant={ENROLLMENT_BADGE[row.enrollmentStatus]} className="text-xs">
                      {row.enrollmentStatus}
                    </Badge>
                    {row.enrollmentStatus === 'rejected' && row.rejectionReason && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{row.rejectionReason}</p>
                    )}
                  </div>
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
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setDetailsTarget(row)}>
                      <Eye className="mr-1 size-3" />Details
                    </Button>
                    {row.enrollmentStatus === 'pending' && (
                      <>
                        <Button size="sm" variant="default" className="h-7 px-2 text-xs" disabled={actionLoading === row.id} onClick={() => handleApprove(row.id)}>
                          <CheckCircle2 className="mr-1 size-3" />Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" disabled={actionLoading === row.id} onClick={() => openReject(row)}>
                          <XCircle className="mr-1 size-3" />Reject
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openEdit(row)}>
                      <Pencil className="mr-1 size-3" />Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" disabled={deletingId === row.id} onClick={() => handleDelete(row)}>
                      <Trash2 className="mr-1 size-3" />{deletingId === row.id ? 'Removing…' : 'Delete'}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        )}
      </SectionCard>

      {/* ── Details Dialog ── */}
      <Dialog open={detailsTarget !== null} onOpenChange={(v) => { if (!v) setDetailsTarget(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Enrollment Details</DialogTitle></DialogHeader>
          {detailsTarget && (
            <div className="space-y-4">
              {/* Student */}
              <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
                <p className="font-semibold">{detailsTarget.user?.name}</p>
                <p className="text-sm text-muted-foreground">{detailsTarget.user?.email} · {detailsTarget.user?.phone ?? '—'}</p>
              </div>
              {/* Receiver info */}
              <div className="grid gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Course</p>
                  <p className="font-medium">{detailsTarget.course?.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Course Fee</p>
                    <p className="font-medium">{formatCurrency(detailsTarget.courseFee)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Amount Sent</p>
                    <p className="font-medium">{formatCurrency(detailsTarget.amountSent)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Difference</p>
                    <p className={`font-medium ${paymentDiff(detailsTarget).color}`}>
                      {paymentDiff(detailsTarget).label}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{detailsTarget.paymentMethod?.name ?? '—'}</p>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Sender Number</p>
                  <p className="font-mono font-medium">{detailsTarget.senderNumber}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Transaction ID</p>
                  <p className="font-mono font-medium">{detailsTarget.transactionId}</p>
                </div>
                {detailsTarget.paymentScreenshot && (
                  <div className="rounded-lg border p-3">
                    <p className="mb-2 text-xs text-muted-foreground">Payment Screenshot</p>
                    <a href={detailsTarget.paymentScreenshot} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
                      <Image src={detailsTarget.paymentScreenshot} alt="Payment screenshot" width={400} height={300} className="w-full object-contain" unoptimized />
                    </a>
                  </div>
                )}
                {detailsTarget.rejectionReason && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-xs text-muted-foreground">Rejection Reason</p>
                    <p className="text-sm text-destructive">{detailsTarget.rejectionReason}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Enrollment Status</p>
                    <Badge variant={ENROLLMENT_BADGE[detailsTarget.enrollmentStatus]} className="mt-1 text-xs">
                      {detailsTarget.enrollmentStatus}
                    </Badge>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Payment Status</p>
                    <Badge variant={PAYMENT_BADGE[detailsTarget.paymentStatus]} className="mt-1 text-xs">
                      {detailsTarget.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ── */}
      <Dialog open={rejectTarget !== null} onOpenChange={(v) => { if (!v) setRejectTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Reject Enrollment
            </DialogTitle>
          </DialogHeader>
          {rejectTarget && (
            <p className="text-sm text-muted-foreground">
              Rejecting enrollment for <strong>{rejectTarget.user?.name}</strong> in{' '}
              <strong>{rejectTarget.course?.title}</strong>. The student will be able to
              resubmit with corrected payment details.
            </p>
          )}
          <form onSubmit={rejectForm.handleSubmit(onRejectSubmit)} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="reject-reason">Rejection Reason <span className="text-destructive">*</span></Label>
              <Textarea
                id="reject-reason"
                placeholder="e.g. Transaction ID is invalid. Please resubmit with the correct TRX ID."
                rows={3}
                {...rejectForm.register('reason')}
              />
              {rejectForm.formState.errors.reason && (
                <p className="text-sm text-destructive">{rejectForm.formState.errors.reason.message}</p>
              )}
            </div>
            <DialogFooter showCloseButton>
              <Button type="submit" variant="destructive" disabled={rejectForm.formState.isSubmitting}>
                {rejectForm.formState.isSubmitting ? 'Rejecting…' : 'Confirm Reject'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={editTarget !== null} onOpenChange={(v) => { if (!v) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Enrollment</DialogTitle></DialogHeader>
          {editTarget && (
            <div className="mb-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm">
              <p className="font-medium">{editTarget.user?.name}</p>
              <p className="text-muted-foreground">{editTarget.course?.title} · {formatDate(editTarget.enrolledAt)}</p>
            </div>
          )}
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Enrollment Status</Label>
                <select className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none" {...editForm.register('enrollmentStatus')}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Payment Status</Label>
                <select className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none" {...editForm.register('paymentStatus')}>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Rejection Reason <span className="text-muted-foreground">(if rejecting)</span></Label>
              <Textarea rows={2} placeholder="Reason for rejection…" {...editForm.register('rejectionReason')} />
            </div>
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={editForm.formState.isSubmitting}>
                {editForm.formState.isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
