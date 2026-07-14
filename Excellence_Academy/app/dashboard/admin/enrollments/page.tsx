'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { getEnrollments, updateEnrollment } from '@/serverdata/enrollments'
import type { ServerEnrollment } from '@/serverdata/enrollments'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/format'
import { toast } from 'sonner'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<ServerEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchEnrollments = () => {
    setLoading(true)
    getEnrollments({ limit: 200 })
      .then(({ data }) => setEnrollments(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEnrollments() }, [])

  const filtered = enrollments.filter((e) =>
    statusFilter === 'all' ? true : e.status === statusFilter
  )

  const counts = {
    all: enrollments.length,
    pending: enrollments.filter((e) => e.status === 'pending').length,
    approved: enrollments.filter((e) => e.status === 'approved').length,
    rejected: enrollments.filter((e) => e.status === 'rejected').length,
  }

  async function handleStatusChange(
    enrollmentId: string,
    status: 'approved' | 'rejected',
    paymentStatus?: 'paid' | 'unpaid',
  ) {
    setActionLoading(enrollmentId)
    try {
      await updateEnrollment(enrollmentId, {
        status,
        ...(paymentStatus && { paymentStatus }),
      })
      toast.success(`Enrollment ${status}`)
      fetchEnrollments()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update enrollment')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(enrollmentId: string) {
    if (!confirm('Remove this enrollment? This cannot be undone.')) return
    setActionLoading(enrollmentId)
    try {
      const { deleteEnrollment } = await import('@/serverdata/enrollments')
      await deleteEnrollment(enrollmentId)
      toast.success('Enrollment removed')
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove enrollment')
    } finally {
      setActionLoading(null)
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
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <BookOpen className="h-4 w-4" />
              Enrollment Management
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Course Enrollments
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Review, approve or reject student enrollment requests and manage payment status.
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
                      <AvatarFallback>{(row.user?.name ?? 'S').slice(0, 2).toUpperCase()}</AvatarFallback>
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
                      variant={row.paymentStatus === 'paid' ? 'default' : 'secondary'}
                      className="text-xs w-fit"
                    >
                      {row.paymentMethod} · {row.paymentStatus}
                    </Badge>
                    <span className="text-xs text-muted-foreground">TXN: {row.transactionId}</span>
                  </div>
                ),
              },
              {
                header: 'Status',
                accessor: (row) => (
                  <Badge
                    variant={
                      row.status === 'approved'
                        ? 'default'
                        : row.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {row.status}
                  </Badge>
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
                  <div className="flex items-center gap-1">
                    {row.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 px-2 text-xs"
                          disabled={actionLoading === row.id}
                          onClick={() => handleStatusChange(row.id, 'approved', 'paid')}
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
                    {row.status !== 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        disabled={actionLoading === row.id}
                        onClick={() => handleDelete(row.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        )}
      </SectionCard>
    </div>
  )
}
