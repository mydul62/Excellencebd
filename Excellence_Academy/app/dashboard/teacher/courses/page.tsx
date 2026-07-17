'use client'

import { useEffect, useState } from 'react'
import { getTeacherDashboard, type CourseWithTeacher } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'

export default function TeacherCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<CourseWithTeacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    getTeacherDashboard(user.id)
      .then((d) => setCourses(d.courses))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user?.id])

  return (
    <SectionCard title="My Courses" description="The courses assigned to you for delivery and mentorship.">
      {loading && <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-12 animate-pulse rounded-xl bg-muted"/>)}</div>}
      {!loading && error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && courses.length === 0 && <p className="text-sm text-muted-foreground">No courses assigned yet.</p>}
      {!loading && !error && courses.length > 0 && (
        <DataTable
          columns={[
            { header: 'Course',   accessor: (row) => row.title },
            { header: 'Category', accessor: 'category' },
            { header: 'Level',    accessor: 'level' },
            { header: 'Seats',    accessor: 'seats' },
            { header: 'Status',   accessor: () => <Badge variant="default">Live</Badge> },
          ]}
          data={courses}
        />
      )}
    </SectionCard>
  )
}
