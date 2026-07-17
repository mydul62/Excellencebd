'use client'

import { useEffect, useState } from 'react'
import { BookOpen, BellRing, Users } from 'lucide-react'
import { getTeacherDashboard, type TeacherDashboardData } from '@/services'
import { MetricCard } from '@/components/dashboard/metric-card'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'

export default function TeacherDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<TeacherDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    getTeacherDashboard(user.id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [user?.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-foreground">Teacher Overview</h1>
        <p className="text-sm text-muted-foreground">
          Keep your courses, students, and notices aligned with one streamlined view.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Assigned Courses" value={data.courses.length.toString()} description="Courses under your instruction" icon={BookOpen} trend="Active batches" />
        <MetricCard title="Total Students" value={data.totalStudents.toString()} description="Enrolled learners across your courses" icon={Users} trend="Across all courses" />
        <MetricCard title="Notices" value={data.notices.length.toString()} description="Latest center updates" icon={BellRing} trend="For teachers" />
      </div>

      <SectionCard title="My Courses" description="A quick glance at your teaching portfolio">
        {data.courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
        ) : (
          <DataTable
            columns={[
              { header: 'Course',   accessor: (row) => row.title },
              { header: 'Category', accessor: 'category' },
              { header: 'Level',    accessor: 'level' },
              { header: 'Seats',    accessor: (row) => `${row.seats} seats` },
            ]}
            data={data.courses}
          />
        )}
      </SectionCard>

      <SectionCard title="Recent Notices" description="Messages relevant to teachers and staff">
        {data.notices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notices yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {data.notices.map((notice) => (
              <div key={notice.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{notice.title}</p>
                  <Badge variant="secondary">{notice.category}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{notice.content}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
