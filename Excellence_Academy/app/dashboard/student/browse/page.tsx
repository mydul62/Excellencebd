'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { getCourses } from '@/serverdata/courses'
import { getMyEnrollments } from '@/serverdata/enrollments'
import type { ServerCourse } from '@/serverdata/courses'
import type { ServerEnrollment } from '@/serverdata/enrollments'
import { SectionCard } from '@/components/dashboard/section-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/format'
import { getCourseIcon } from '@/lib/course-icons'
import { SearchIcon, BookXIcon } from 'lucide-react'

export default function StudentBrowsePage() {
  const [courses, setCourses] = useState<ServerCourse[]>([])
  const [myEnrollments, setMyEnrollments] = useState<ServerEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    Promise.all([
      getCourses({ limit: 100 }),
      getMyEnrollments({ limit: 100 }).catch(() => ({ data: [] as ServerEnrollment[], meta: { page:1, limit:100, total:0 } })),
    ])
      .then(([coursesRes, enrollmentsRes]) => {
        setCourses(coursesRes.data)
        setMyEnrollments(enrollmentsRes.data)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const enrolledCourseIds = useMemo(
    () => new Set(myEnrollments.map((e) => e.courseId)),
    [myEnrollments],
  )

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(courses.map((c) => c.category)))],
    [courses],
  )

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchQ =
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase())
      const matchCat = category === 'All' || c.category === category
      return matchQ && matchCat
    })
  }, [courses, query, category])

  return (
    <SectionCard title="Browse Courses" description="Explore all available courses and enroll">
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                category === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      )}
      {!loading && error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <BookXIcon className="size-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No courses match your search.</p>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => {
            const Icon = getCourseIcon(course.icon)
            const isEnrolled = enrolledCourseIds.has(course.id)
            return (
              <div
                key={course.id}
                className="flex flex-col rounded-2xl border border-border/60 bg-background/70 p-5 gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <Badge variant="secondary">{course.category}</Badge>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{course.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{course.description}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{course.level}</span>
                  <span>•</span>
                  <span>{course.duration}</span>
                  <span>•</span>
                  <span>{course.seats} seats</span>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
                  <span className="font-bold text-primary">{formatCurrency(course.price)}</span>
                  {isEnrolled ? (
                    <Badge variant="default">Enrolled</Badge>
                  ) : (
                    <Button
                      render={<Link href={`/courses/${course.slug}/enroll`} />}
                      size="sm"
                    >
                      Enroll Now
                    </Button>
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
