'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, BookOpen, CheckCircle2, XCircle, Pencil, Trash2, Eye, AlertTriangle, Search, X,
  GraduationCap, CreditCard, Hash, Phone, CalendarDays, BadgeCheck, Ban, Clock,
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
  const [searchInput,          setSearchInput]          = useState('')
  const [searchTerm,           setSearchTerm]           = useState('')
  const [actionLoading,        setActionLoading]        = useState<string | null>(null)
  const [editTarget,           setEditTarget]           = useState<ServerEnrollment | null>(null)
  const [rejectTarget,         setRejectTarget]         = useState<ServerEnrollment | null>(null)
  const [detailsTarget,        setDetailsTarget]        = useState<ServerEnrollment | null>(null)
  const [deletingId,           setDeletingId]           = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  })

  const rejectForm = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: '' },
  })

  // ── Debounce search input (400 ms) ────────────────────────────────────────
  function handleSearchChange(value: string) {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchTerm(value.trim())
    }, 400)
  }

  function clearSearch() {
    setSearchInput('')
    setSearchTerm('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  // Cleanup timeout on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchEnrollments = (term = searchTerm) => {
    setLoading(true)
    setError(null)
    getAdminEnrollments({ limit: 200, ...(term ? { searchTerm: term } : {}) })
      .then(({ data }) => setEnrollments(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  // Re-fetch whenever the debounced search term changes
  useEffect(() => { fetchEnrollments(searchTerm) }, [searchTerm]) // eslint-disable-line react-hooks/exhaustive-deps

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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search by student name, mobile number, or TXN ID…"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 pr-9"
          aria-label="Search enrollments"
        />
        {searchInput && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
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
            {searchTerm
              ? `No enrollments found matching "${searchTerm}".`
              : `No ${statusFilter === 'all' ? '' : statusFilter} enrollments found.`}
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
                accessor: (row) => {
                  const logo = row.paymentMethod?.logo?.trim() || null
                  return (
                    <div className="flex items-center gap-2">
                      {logo ? (
                        <img
                          src={logo}
                          alt={row.paymentMethod?.name ?? 'logo'}
                          width={28}
                          height={28}
                          className="rounded object-contain shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div className="flex size-7 shrink-0 items-center justify-center rounded bg-muted">
                          <CreditCard className="size-3.5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{row.paymentMethod?.name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{row.paymentMethod?.accountType}</p>
                      </div>
                    </div>
                  )
                },
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">

          {detailsTarget && (() => {
            const diff = paymentDiff(detailsTarget)
            const enrollStatus = detailsTarget.enrollmentStatus
            const payStatus    = detailsTarget.paymentStatus

            const enrollIcon =
              enrollStatus === 'approved' ? <BadgeCheck className="size-4" /> :
              enrollStatus === 'rejected' ? <Ban className="size-4" /> :
              <Clock className="size-4" />

            const enrollColor =
              enrollStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
              enrollStatus === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
              'bg-amber-500/10 text-amber-600 border-amber-500/20'

            const payColor =
              payStatus === 'paid'    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
              payStatus === 'partial' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
              'bg-muted text-muted-foreground border-border'

            return (
              <>
                {/* ── Hero header ── */}
                <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 pt-6 pb-5 border-b border-border/60">
                  <div className="flex items-start gap-4">
                    <Avatar size="lg" className="size-16 ring-2 ring-primary/20 ring-offset-2 ring-offset-background shrink-0">
                      <AvatarImage src={detailsTarget.user?.avatar ?? ''} alt={detailsTarget.user?.name ?? ''} />
                      <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                        {(detailsTarget.user?.name ?? 'S').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-semibold text-foreground truncate">
                        {detailsTarget.user?.name}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">{detailsTarget.user?.email}</p>
                      {detailsTarget.user?.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="size-3" />{detailsTarget.user.phone}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${enrollColor}`}>
                          {enrollIcon}{enrollStatus}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${payColor}`}>
                          <CreditCard className="size-3" />{payStatus}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                          <CalendarDays className="size-3" />{formatDate(detailsTarget.enrolledAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Close affordance label */}
                  <p className="mt-1 text-[11px] text-muted-foreground/60 text-right">Enrollment Details</p>
                </div>

                <div className="px-6 py-5 space-y-5">

                  {/* ── Course info ── */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="size-4 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course</h3>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                      <p className="font-semibold text-foreground">{detailsTarget.course?.title ?? '—'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {detailsTarget.course?.category} · {detailsTarget.course?.level} · {detailsTarget.course?.duration}
                      </p>
                    </div>
                  </section>

                  {/* ── Payment summary ── */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="size-4 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Summary</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-center">
                        <p className="text-[11px] text-muted-foreground mb-1">Course Fee</p>
                        <p className="font-semibold text-foreground">{formatCurrency(detailsTarget.courseFee)}</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-center">
                        <p className="text-[11px] text-muted-foreground mb-1">Amount Sent</p>
                        <p className="font-semibold text-foreground">{formatCurrency(detailsTarget.amountSent)}</p>
                      </div>
                      <div className={`rounded-xl border px-4 py-3 text-center ${
                        diff.color === 'text-emerald-600' ? 'border-emerald-500/20 bg-emerald-500/5' :
                        diff.color === 'text-blue-600'    ? 'border-blue-500/20 bg-blue-500/5' :
                        'border-amber-500/20 bg-amber-500/5'
                      }`}>
                        <p className="text-[11px] text-muted-foreground mb-1">Difference</p>
                        <p className={`font-semibold text-sm ${diff.color}`}>{diff.label}</p>
                      </div>
                    </div>
                  </section>

                  {/* ── Payment method & transaction ── */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Hash className="size-4 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaction Info</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Payment method */}
                      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 flex items-center gap-3">
                        {detailsTarget.paymentMethod?.logo?.trim() ? (
                          <img
                            src={detailsTarget.paymentMethod.logo}
                            alt={detailsTarget.paymentMethod.name}
                            width={40}
                            height={40}
                            className="rounded-lg object-contain shrink-0 size-10"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement
                              el.style.display = 'none'
                              const next = el.nextElementSibling as HTMLElement | null
                              if (next) next.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div
                          className="size-9 rounded-lg bg-muted items-center justify-center shrink-0"
                          style={{ display: detailsTarget.paymentMethod?.logo?.trim() ? 'none' : 'flex' }}
                        >
                          <CreditCard className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] text-muted-foreground">Payment Method</p>
                          <p className="font-medium text-sm truncate">{detailsTarget.paymentMethod?.name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{detailsTarget.paymentMethod?.accountType ?? ''}</p>
                        </div>
                      </div>
                      {/* Sender number */}
                      <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                        <p className="text-[11px] text-muted-foreground mb-1">Sender Number</p>
                        <p className="font-mono font-semibold text-sm">{detailsTarget.senderNumber}</p>
                      </div>
                      {/* Transaction ID */}
                      <div className="sm:col-span-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                        <p className="text-[11px] text-muted-foreground mb-1">Transaction ID</p>
                        <p className="font-mono font-semibold text-sm break-all">{detailsTarget.transactionId}</p>
                      </div>
                    </div>
                  </section>

                  {/* ── Payment screenshot ── */}
                  {detailsTarget.paymentScreenshot && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="size-4 text-primary" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Screenshot</h3>
                      </div>
                      <a
                        href={detailsTarget.paymentScreenshot}
                        target="_blank"
                        rel="noreferrer"
                        className="group block overflow-hidden rounded-xl border border-border/60 bg-muted/30 relative"
                        title="Click to open full size"
                      >
                        <img
                          src={detailsTarget.paymentScreenshot}
                          alt="Payment screenshot"
                          className="w-full max-h-64 object-contain transition-opacity group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
                          <span className="bg-background/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow">
                            Open full size ↗
                          </span>
                        </div>
                      </a>
                    </section>
                  )}

                  {/* ── Rejection reason ── */}
                  {detailsTarget.rejectionReason && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="size-4 text-destructive" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-destructive/70">Rejection Reason</h3>
                      </div>
                      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
                        <p className="text-sm text-destructive leading-relaxed">{detailsTarget.rejectionReason}</p>
                      </div>
                    </section>
                  )}

                </div>

                {/* ── Footer close button ── */}
                <div className="px-6 pb-5">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setDetailsTarget(null)}
                  >
                    Close
                  </Button>
                </div>
              </>
            )
          })()}

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
