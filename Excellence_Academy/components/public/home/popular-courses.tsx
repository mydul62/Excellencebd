'use client'

import { useEffect, useState } from 'react'
import { CourseCard } from '@/components/cards/course-card'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, BookXIcon } from 'lucide-react'
import Link from 'next/link'
import { getPopularCourses, type ServerCourse } from '@/serverdata/courses'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

export function PopularCourses() {
  const [courses, setCourses] = useState<ServerCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPopularCourses(4)
      .then(setCourses)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load courses'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-16 md:py-24 ">
      <div className="container mx-auto w-[95%] px-4 md:px-6">
        <SectionHeading
          eyebrow="আমাদের কোর্সসমূহ"
          title="আমাদের জনপ্রিয় কোর্সসমূহ"
          description="একাডেমিক সাফল্য ও দক্ষতা উন্নয়নের জন্য আমাদের সবচেয়ে জনপ্রিয় ও অধিক ভর্তি হওয়া কোর্সগুলো ঘুরে দেখুন।"
        />

        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-sm text-muted-foreground">{error}</p>
        )}

        {!loading && !error && courses.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><BookXIcon /></EmptyMedia>
              <EmptyTitle>No popular courses yet</EmptyTitle>
              <EmptyDescription>Check back soon for featured courses.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={{ ...course, teacher: undefined }} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button render={<Link href="/courses" />} size="lg" variant="outline">
            সকল কোর্স দেখুন
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
