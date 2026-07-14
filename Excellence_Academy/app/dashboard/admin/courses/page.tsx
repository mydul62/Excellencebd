'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Plus } from 'lucide-react'
import { getCourses, type CourseWithTeacher } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseWithTeacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <BookOpen className="h-4 w-4" />Admin Courses
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Course management</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Review the current course catalog and add new courses.</p>
          </div>
          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      <SectionCard
        title="Courses"
        description="All available courses."
        action={
          <Button render={<Link href="/dashboard/admin/courses/register" />}>
            <Plus className="mr-2 h-4 w-4" />Add Course
          </Button>
        }
      >
        {loading && <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="h-12 animate-pulse rounded-xl bg-muted"/>)}</div>}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && courses.length === 0 && <p className="text-sm text-muted-foreground">No courses found.</p>}
        {!loading && !error && courses.length > 0 && (
          <DataTable
            columns={[
              { header: 'Course',    accessor: (row) => row.title },
              { header: 'Category', accessor: 'category' },
              { header: 'Level',    accessor: 'level' },
              { header: 'Seats',    accessor: 'seats' },
              { header: 'Price',    accessor: (row) => `৳${row.price}` },
              { header: 'Rating',   accessor: (row) => <Badge variant="secondary">{row.rating.toFixed(1)}</Badge> },
            ]}
            data={courses}
          />
        )}
      </SectionCard>
    </div>
  )
}
