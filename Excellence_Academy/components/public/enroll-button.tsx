'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { checkEnrollment } from '@/serverdata/enrollments'
import type { ServerCourse } from '@/serverdata/courses'

interface EnrollButtonProps {
  course: ServerCourse
}

export function EnrollButton({ course }: EnrollButtonProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false)
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null)

  // Once user is known, check if already enrolled
  useEffect(() => {
    if (!user || authLoading) return
    if (user.role !== 'student') return

    setChecking(true)
    checkEnrollment(course.id)
      .then(({ enrolled, enrollment }) => {
        setAlreadyEnrolled(enrolled)
        if (enrollment) setEnrollmentStatus(enrollment.enrollmentStatus)
      })
      .catch(() => {
        // ignore — treat as not enrolled
      })
      .finally(() => setChecking(false))
  }, [user, authLoading, course.id])

  // Not logged in
  if (!user && !authLoading) {
    return (
      <Button
        render={<Link href={`/login?redirect=/courses/${course.slug}`} />}
        className="w-full"
      >
        Login to Enroll
      </Button>
    )
  }

  // Auth loading or enrollment check in progress
  if (authLoading || checking) {
    return (
      <Button className="w-full" disabled>
        Checking...
      </Button>
    )
  }

  // Non-students (admin/teacher) just see a disabled button
  if (user && user.role !== 'student') {
    return (
      <Button className="w-full" variant="outline" disabled>
        Only students can enroll
      </Button>
    )
  }

  // Already enrolled
  if (alreadyEnrolled) {
    const isPending = enrollmentStatus === 'pending'
    return (
      <Button
        className="w-full"
        variant={isPending ? 'outline' : 'default'}
        onClick={() => router.push('/dashboard/student/courses')}
      >
        {isPending ? '⏳ Pending Approval — View' : '✅ Enrolled — Go to My Courses'}
      </Button>
    )
  }

  // Not enrolled — go to enroll page
  return (
    <Button
      className="w-full"
      onClick={() => router.push(`/courses/${course.slug}/enroll`)}
    >
      Enroll Now — {new Intl.NumberFormat('en-US').format(course.price)}৳
    </Button>
  )
}
