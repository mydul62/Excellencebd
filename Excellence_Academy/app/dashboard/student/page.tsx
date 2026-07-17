'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, BellRing, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { getStudentDashboard, type StudentDashboardData } from '@/services'
import { MetricCard } from '@/components/dashboard/metric-card'
import { SectionCard } from '@/components/dashboard/section-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatCurrency, formatDate } from '@/lib/format'
import { getCourseIcon } from '@/lib/course-icons'
import { useAuth } from '@/hooks/use-auth'

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<StudentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    getStudentDashboard(user.id)
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
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your course journey, fee status, and latest announcements.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="My Courses"
          value={data.enrollments.length.toString()}
          description="Total enrollments"
          icon={BookOpen}
          trend={`${data.approvedCount} approved`}
        />
        <MetricCard
          title="Approved"
          value={data.approvedCount.toString()}
          description="Active course access"
          icon={CheckCircle2}
          trend={`${data.pendingCount} pending`}
        />
        <MetricCard
          title="Amount Due"
          value={formatCurrency(data.dueAmount)}
          description="Outstanding balance"
          icon={Clock}
          trend={data.dueAmount > 0 ? 'Payment needed' : 'All paid up'}
        />
      </div>

      {/* Enrolled Courses */}
      <SectionCard
        title="My Courses"
        description="Your enrolled courses and payment status"
        action={
          <Button render={<Link href="/dashboard/student/browse" />} variant="outline" size="sm">
            Browse Courses <ArrowRight className="ml-1 size-3" />
          </Button>
        }
      >
        {data.enrollments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <BookOpen className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">You haven't enrolled in any courses yet.</p>
            <Button render={<Link href="/courses" />} size="sm">Explore Courses</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.enrollments.map((enrollment) => {
              const course = enrollment.course
              const Icon = getCourseIcon(course?.icon ?? null)
              return (
                <div
                  key={enrollment.id}
                  className="flex gap-4 rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{course?.title ?? 'Unknown Course'}</p>
                    <p className="text-xs text-muted-foreground">{course?.category} • {course?.duration}</p>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <Badge variant={enrollment.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                        {enrollment.status}
                      </Badge>
                      <Badge variant={enrollment.paymentStatus === 'paid' ? 'default' : 'secondary'} className="text-xs">
                        {enrollment.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enrolled: {formatDate(enrollment.enrolledAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/* Notices */}
      <SectionCard title="Latest Notices" description="Updates tailored for students">
        {data.notices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notices yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {data.notices.slice(0, 4).map((notice) => (
              <div key={notice.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{notice.title}</p>
                  <Badge variant="secondary">{notice.category}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(notice.date)}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
