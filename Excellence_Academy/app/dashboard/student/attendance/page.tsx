'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

import { getStudentAttendance, type ServerAttendance } from '@/serverdata/attendance'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { useAuth } from '@/hooks/use-auth'

const STATUS_ICON = {
  present: <CheckCircle2 className="size-4 text-green-500" />,
  absent: <XCircle className="size-4 text-destructive" />,
  late: <Clock className="size-4 text-amber-500" />,
  excused: <AlertCircle className="size-4 text-blue-500" />,
}

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary'> = {
  present: 'default',
  absent: 'destructive',
  late: 'secondary',
  excused: 'secondary',
}

export default function StudentAttendancePage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<ServerAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    getStudentAttendance(user.id)
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user?.id])

  // ── Summary stats ──────────────────────────────────────────────────────────
  const summary = {
    present: logs.filter((a) => a.status === 'present').length,
    absent: logs.filter((a) => a.status === 'absent').length,
    late: logs.filter((a) => a.status === 'late').length,
    excused: logs.filter((a) => a.status === 'excused').length,
    total: logs.length,
  }

  const attendanceRate =
    summary.total > 0
      ? Math.round(((summary.present + summary.late) / summary.total) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <CalendarCheck className="h-4 w-4" />My Attendance
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Attendance Record</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              View your full attendance history across all enrolled courses.
            </p>
          </div>
          <Button render={<Link href="/dashboard/student" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && !error && logs.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4 text-center shadow-sm">
            <CheckCircle2 className="mx-auto mb-1 size-6 text-green-500" />
            <p className="text-2xl font-semibold text-foreground">{summary.present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4 text-center shadow-sm">
            <XCircle className="mx-auto mb-1 size-6 text-destructive" />
            <p className="text-2xl font-semibold text-foreground">{summary.absent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4 text-center shadow-sm">
            <Clock className="mx-auto mb-1 size-6 text-amber-500" />
            <p className="text-2xl font-semibold text-foreground">{summary.late}</p>
            <p className="text-xs text-muted-foreground">Late</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4 text-center shadow-sm">
            <CalendarCheck className="mx-auto mb-1 size-6 text-primary" />
            <p className="text-2xl font-semibold text-foreground">{attendanceRate}%</p>
            <p className="text-xs text-muted-foreground">Attendance Rate</p>
          </div>
        </div>
      )}

      {/* Attendance table */}
      <SectionCard
        title={`Attendance Log (${logs.length})`}
        description="Your complete attendance record sorted by most recent."
      >
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && logs.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CalendarCheck className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No attendance records found. Your teacher will mark your attendance here.
            </p>
          </div>
        )}
        {!loading && !error && logs.length > 0 && (
          <DataTable
            columns={[
              { header: 'Date', accessor: (row) => formatDate(row.date) },
              { header: 'Course', accessor: (row) => row.course?.title ?? '—' },
              {
                header: 'Status',
                accessor: (row) => (
                  <div className="flex items-center gap-2">
                    {STATUS_ICON[row.status]}
                    <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
                  </div>
                ),
              },
            ]}
            data={logs}
          />
        )}
      </SectionCard>
    </div>
  )
}
