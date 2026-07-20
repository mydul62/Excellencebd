'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { getCourses } from '@/serverdata/courses'
import { getTeachers } from '@/serverdata/teachers'
import type { ServerCourse } from '@/serverdata/courses'
import type { ServerTeacher } from '@/serverdata/teachers'
import { getCourseIcon } from '@/lib/course-icons'
import { formatCurrency } from '@/lib/format'
import { EnrollButton } from '@/components/public/enroll-button'
import { CourseReviewSection } from '@/components/public/course-review-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  ClockIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircle2Icon,
} from 'lucide-react'

export default function CourseDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [course, setCourse] = useState<ServerCourse | null>(null)
  const [instructor, setInstructor] = useState<ServerTeacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundFlag, setNotFoundFlag] = useState(false)

  useEffect(() => {
    if (!slug) return
    getCourses({ limit: 100 })
      .then(async ({ data }) => {
        const found = data.find((c) => c.slug === slug)
        if (!found) { setNotFoundFlag(true); return }
        setCourse(found)

        // fetch instructor if course has a teacherId
        if (found.teacherId) {
          try {
            const { data: teachers } = await getTeachers({ limit: 100 })
            const teacher = teachers.find((t) => t.id === found.teacherId)
            setInstructor(teacher ?? null)
          } catch {
            // instructor not critical
          }
        }
      })
      .catch(() => setNotFoundFlag(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 animate-pulse rounded-2xl bg-muted" />
              <div className="h-48 animate-pulse rounded-2xl bg-muted" />
            </div>
            <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (notFoundFlag || !course) return null

  const Icon = getCourseIcon(course.icon)
  const syllabus = [
    `Build strong fundamentals for ${course.title}`,
    `Practice through guided exercises and mentor support`,
    `Learn at a pace that fits your goals and schedule`,
    `Get personalized guidance from experienced instructors`,
  ]

  return (
    <>
      <section className="border-b border-border bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="flex flex-col gap-4">
            <Badge variant="secondary" className="w-fit">{course.category}</Badge>
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-7" />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="font-display text-3xl font-bold text-balance text-foreground md:text-4xl">
                  {course.title}
                </h1>
                <p className="max-w-2xl text-pretty text-muted-foreground">{course.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:px-6 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Course Overview</CardTitle></CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">{course.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>What You Will Learn</CardTitle></CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {syllabus.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-accent" />
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {instructor && (
              <Card>
                <CardHeader><CardTitle>Your Instructor</CardTitle></CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage src={instructor.user?.avatar ?? '/placeholder.svg'} alt={instructor.user?.name ?? ''} />
                    <AvatarFallback>{(instructor.user?.name ?? 'T').charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <span className="font-display font-semibold text-foreground">{instructor.user?.name}</span>
                    <span className="text-sm text-primary">{instructor.subject}</span>
                    <span className="text-sm text-muted-foreground">{instructor.experienceYears} years of experience</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24">
              <CardContent className="flex flex-col gap-5 p-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Course Fee</span>
                  <span className="font-display text-3xl font-bold text-foreground">
                    {formatCurrency(course.price)}
                  </span>
                </div>
                <Separator />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <ClockIcon className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-auto font-medium text-foreground">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <UsersIcon className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Batch Size:</span>
                    <span className="ml-auto font-medium text-foreground">{course.seats} students</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarIcon className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Level:</span>
                    <span className="ml-auto font-medium text-foreground">{course.level}</span>
                  </div>
                </div>
                <Separator />
                <EnrollButton course={course} />
                <Button render={<Link href="/contact" />} variant="outline" className="w-full">
                  Ask a Question
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Course Reviews ── */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <CourseReviewSection courseId={course.id} />
        </div>
      </section>
    </>
  )
}
