'use client'

import { useEffect, useState } from 'react'
import { getMyStudents } from '@/serverdata/teachers'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'

interface StudentWithEnrollments {
  id: string
  name: string
  email: string
  avatar: string | null
  phone: string | null
  role: string
  enrollments: Array<{
    id: string
    course: { id: string; title: string; slug: string }
    enrolledAt: string
    status: string
  }>
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<StudentWithEnrollments[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyStudents()
      .then((data) => setStudents(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Flatten students with their enrollments for table display
  const tableData = students.flatMap((student) =>
    student.enrollments.map((enrollment) => ({
      id: enrollment.id,
      studentName: student.name,
      studentEmail: student.email,
      courseName: enrollment.course.title,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
    }))
  )

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-foreground">My Students</h1>
        <p className="text-sm text-muted-foreground">
          Students enrolled in your courses
        </p>
      </div>

      <SectionCard 
        title={`Total Students: ${students.length}`} 
        description={`${tableData.length} total enrollments across your courses`}
      >
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && students.length === 0 && (
          <p className="text-sm text-muted-foreground">No enrolled students found.</p>
        )}
        {!loading && !error && students.length > 0 && (
          <DataTable
            columns={[
              { header: 'Student', accessor: 'studentName' },
              { header: 'Email', accessor: 'studentEmail' },
              { header: 'Course', accessor: 'courseName' },
              {
                header: 'Status',
                accessor: (row) => (
                  <Badge variant={row.status === 'approved' ? 'default' : 'secondary'}>
                    {row.status}
                  </Badge>
                ),
              },
              { 
                header: 'Enrolled', 
                accessor: (row) => new Date(row.enrolledAt).toLocaleDateString()
              },
            ]}
            data={tableData}
          />
        )}
      </SectionCard>
    </div>
  )
}
