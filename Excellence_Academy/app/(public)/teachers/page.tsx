'use client'

import { useEffect, useState } from 'react'
import { TeacherCard } from '@/components/cards/teacher-card'
import { PageBanner } from '@/components/public/page-banner'
import { getTeachers, type ServerTeacher } from '@/serverdata/teachers'

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

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<ServerTeacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTeachers({ limit: 100 })
      .then(({ data }) => setTeachers(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load teachers'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageBanner
        title="আমাদের অভিজ্ঞ শিক্ষকবৃন্দ"
        description="দক্ষ, অভিজ্ঞ ও আন্তরিক শিক্ষকবৃন্দ প্রতিটি শিক্ষার্থীকে তার লক্ষ্যে পৌঁছাতে সর্বদা প্রতিশ্রুতিবদ্ধ।"
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto container w-[95%] px-4 md:px-6">
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
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
        </div>
      </section>
    </>
  )
}
