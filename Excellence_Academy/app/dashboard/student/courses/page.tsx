'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMyEnrollments } from '@/serverdata/enrollments'
import type { ServerEnrollment } from '@/serverdata/enrollments'
import { SectionCard } from '@/components/dashboard/section-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/format'
import { getCourseIcon } from '@/lib/course-icons'
import { BookOpen, ArrowRight } from 'lucide-react'

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<ServerEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyEnrollments({ limit: 100 })
      .then(({ data }) => setEnrollments(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <SectionCard
      title="My Courses"
      description="All your enrolled courses and payment status"
      action={
        <Button render={<Link href="/dashboard/student/browse" />} variant="outline" size="sm">
          Browse More <ArrowRight className="ml-1 size-3" />
        </Button>
      }
    >
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      )}
      {!loading && error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && enrollments.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <BookOpen className="size-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">You haven't enrolled in any courses yet.</p>
          <Button render={<Link href="/courses" />} size="sm">Explore Courses</Button>
        </div>
      )}
      {!loading && !error && enrollments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {enrollments.map((enrollment) => {
            const course = enrollment.course
            const Icon = getCourseIcon(course?.icon ?? '')
            const isApproved = enrollment.enrollmentStatus === 'approved'
            const isRejected = enrollment.enrollmentStatus === 'rejected'
            const diff = enrollment.courseFee - enrollment.amountSent
            return (
              <div
                key={enrollment.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/70 p-5"
              >
                {/* Course header */}
                <div className="flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{course?.title ?? 'Unknown Course'}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {course?.category} · {course?.level} · {course?.duration}
                    </p>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={isApproved ? 'default' : isRejected ? 'destructive' : 'secondary'}>
                    {isApproved ? '✓ Approved' : isRejected ? '✗ Rejected' : '⏳ Pending'}
                  </Badge>
                  <Badge variant={enrollment.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                    {enrollment.paymentStatus === 'paid' ? '💳 Paid'
                      : enrollment.paymentStatus === 'partial' ? '⚡ Partial' : '⏸ Unpaid'}
                  </Badge>
                </div>

                {/* Rejection reason */}
                {isRejected && enrollment.rejectionReason && (
                  <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    {enrollment.rejectionReason}
                  </p>
                )}

                {/* Payment info */}
                <div className="space-y-1 border-t border-border/40 pt-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Course Fee</span>
                    <span className="font-medium">{formatCurrency(enrollment.courseFee)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Amount Sent</span>
                    <span className="font-semibold text-foreground">{formatCurrency(enrollment.amountSent)}</span>
                  </div>
                  {diff > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Balance Due</span>
                      <span className="font-semibold text-amber-600">{formatCurrency(diff)}</span>
                    </div>
                  )}
                  {diff < 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Overpaid</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(Math.abs(diff))}</span>
                    </div>
                  )}
                </div>

                {/* TXN */}
                <p className="text-xs text-muted-foreground">TXN: {enrollment.transactionId}</p>
                <p className="text-xs text-muted-foreground">Enrolled: {formatDate(enrollment.enrolledAt)}</p>

                {/* Actions */}
                <div className="mt-1 flex gap-2">
                  <Button render={<Link href={`/courses/${course?.slug ?? ''}`} />} variant="outline" size="sm" className="flex-1">
                    View Course
                  </Button>
                  {isRejected && (
                    <Button render={<Link href={`/courses/${course?.slug ?? ''}/enroll`} />} size="sm" variant="destructive" className="flex-1">
                      Resubmit
                    </Button>
                  )}
                  {isApproved && (
                    <Button size="sm" className="flex-1">Continue Learning</Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}
