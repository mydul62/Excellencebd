'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { ArrowRightIcon } from 'lucide-react'

interface CourseEnrollButtonProps {
  slug: string
}

export function CourseEnrollButton({ slug }: CourseEnrollButtonProps) {
  const { user } = useAuth()
  const enrollHref = `/courses/${slug}/enroll`
  const loginHref = `/login?redirect=${encodeURIComponent(enrollHref)}`

  return (
    <Button render={<Link href={user ? enrollHref : loginHref} />} size="lg" className="w-full">
      Enroll Now
      <ArrowRightIcon data-icon="inline-end" />
    </Button>
  )
}
