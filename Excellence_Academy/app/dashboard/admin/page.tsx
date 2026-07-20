'use client'

import { useEffect, useState } from 'react'
import { BookOpen, GraduationCap, Users, Wallet2 } from 'lucide-react'
import {
  getAdminStats,
  getCourseStats,
  getEnrollmentTrend,
  getRecentEnrollments,
  getRecentStudents,
  type AdminStats,
  type TrendPoint,
  type CourseStat,
  type ServerUser,
  type EnrollmentDetail,
} from '@/services'
import { MetricCard } from '@/components/dashboard/metric-card'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [enrollmentTrend, setEnrollmentTrend] = useState<TrendPoint[]>([])
  const [courseStats, setCourseStats] = useState<CourseStat[]>([])
  const [recentStudents, setRecentStudents] = useState<ServerUser[]>([])
  const [recentEnrollments, setRecentEnrollments] = useState<EnrollmentDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getAdminStats(),
      getEnrollmentTrend(),
      getCourseStats(),
      getRecentStudents(5),
      getRecentEnrollments(5),
    ])
      .then(([s, trend, cs, students, enrollments]) => {
        setStats(s)
        setEnrollmentTrend(trend)
        setCourseStats(cs)
        setRecentStudents(students)
        setRecentEnrollments(enrollments)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
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

  if (!stats) return null

  const maxEnrollment = Math.max(...enrollmentTrend.map((item) => item.enrollments), 1)
  const maxCourseStudents = Math.max(...courseStats.map((item) => item.students), 1)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-foreground">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">
          Monitor everything from student growth to course enrollments in one premium workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Students" value={stats.totalStudents.toString()} description="Active learners enrolled" icon={Users} trend="↑ 12% this month" />
        <MetricCard title="Total Teachers" value={stats.totalTeachers.toString()} description="Experienced mentors" icon={GraduationCap} trend="↑ 3 new hires" />
        <MetricCard title="Total Courses" value={stats.totalCourses.toString()} description="Programs available" icon={BookOpen} trend="↑ 2 new batches" />
        <MetricCard title="Total Enrollments" value={stats.totalEnrollments.toString()} description="All application records" icon={Wallet2} trend="₹ 5.4L collected" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Enrollment Trend" description="Monthly enrollment activity for the current year">
          <div className="flex h-72 items-end gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
            {enrollmentTrend.map((item) => {
              const height = Math.max(14, (item.enrollments / maxEnrollment) * 100)
              return (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-48 w-full items-end rounded-2xl bg-background/80 p-2">
                    <div className="w-full rounded-xl bg-primary" style={{ height: `${height}%` }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-foreground">{item.month}</p>
                    <p className="text-[11px] text-muted-foreground">{item.enrollments}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard title="Course Statistics" description="How many students are enrolled per course">
          <div className="space-y-4">
            {courseStats.length === 0 && (
              <p className="text-sm text-muted-foreground">No enrollment data yet.</p>
            )}
            {courseStats.map((item) => {
              const width = Math.max(16, (item.students / maxCourseStudents) * 100)
              return (
                <div key={item.course} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{item.course}</span>
                    <span className="text-muted-foreground">{item.students} students</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-secondary">
                    <div className="h-2.5 rounded-full bg-primary" style={{ width: `${width}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Students" description="Newest registrations in your center">
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
              {
                header: 'Role',
                accessor: (row) => (
                  <Badge variant="secondary">{row.role}</Badge>
                ),
              },
              { header: 'Joined', accessor: (row) => new Date(row.createdAt).toLocaleDateString() },
            ]}
            data={recentStudents}
          />
        </SectionCard>

        <SectionCard title="Recent Enrollments" description="Latest initiated enrollments">
          <DataTable
            columns={[
              { header: 'Student', accessor: (row) => row.user?.name ?? 'Unknown' },
              { header: 'Course',  accessor: (row) => row.course?.title ?? 'Unknown' },
              {
                header: 'Status',
                accessor: (row) => (
                  <Badge variant={row.enrollmentStatus === 'approved' ? 'default' : 'secondary'}>
                    {row.enrollmentStatus}
                  </Badge>
                ),
              },
            ]}
            data={recentEnrollments}
          />
        </SectionCard>
      </div>

      <div className="flex justify-end">
        <Button render={<Link href="/dashboard/admin/students" />} variant="outline">
          Manage all records
        </Button>
      </div>
    </div>
  )
}
