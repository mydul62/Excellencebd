'use client'

import { useEffect, useState } from 'react'
import { TeacherCard } from '@/components/cards/teacher-card'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { getFeaturedTeachers, type ServerTeacher } from '@/serverdata/teachers'

/** Map ServerTeacher → shape expected by TeacherCard */
function toCardTeacher(t: ServerTeacher) {
  return {
    id: t.id,
    name: t.user.name,
    email: t.user.email ?? '',
    phone: t.user.phone ?? '',
    avatar: t.user.avatar ?? '',
    subject: t.subject,
    bio: t.bio ?? '',
    experienceYears: t.experienceYears,
    qualification: t.qualification ?? '',
    courseIds: t.courses.map((c) => c.id),
    joinedAt: t.joinedAt,
  }
}

export function FeaturedTeachers() {
  const [teachers, setTeachers] = useState<ServerTeacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getFeaturedTeachers(4)
      .then(setTeachers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load teachers'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <SectionHeading
          eyebrow="আমাদের শিক্ষকবৃন্দ"
          title="আমাদের অভিজ্ঞ ও দক্ষ শিক্ষকগণের সাথে পরিচিত হোন"
          description="দক্ষ, অভিজ্ঞ ও আন্তরিক শিক্ষকবৃন্দ প্রতিটি শিক্ষার্থীর সর্বোচ্চ সাফল্য নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ।"
        />

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-sm text-muted-foreground">{error}</p>
        )}

        {!loading && !error && teachers.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No teachers found.</p>
        )}

        {!loading && !error && teachers.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={toCardTeacher(teacher)} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button
            render={<Link href="/teachers" />}
            size="lg"
            variant="outline"
            className="rounded-full border-[#146373] bg-white text-[#146373] hover:bg-[#EAF2F4]"
          >
            সকল শিক্ষক দেখুন
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
