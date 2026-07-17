'use client'

import { useEffect, useState } from 'react'
import { getEnrollments, type EnrollmentDetail } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'

export default function TeacherStudentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getEnrollments()
      .then((data) => setEnrollments(data.slice(0, 8)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <SectionCard title="Students" description="Enrolled learners across your courses.">
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}
      {!loading && error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && enrollments.length === 0 && (
        <p className="text-sm text-muted-foreground">No enrolled students found.</p>
      )}
      {!loading && !error && enrollments.length > 0 && (
        <DataTable
          columns={[
            { header: 'Student', accessor: (row) => row.user?.name ?? 'Unknown' },
            { header: 'Course',  accessor: (row) => row.course?.title ?? 'Unknown' },
            {
              header: 'Status',
              accessor: (row) => (
                <Badge variant={row.status === 'approved' ? 'default' : 'secondary'}>
                  {row.status}
                </Badge>
              ),
            },
            { header: 'Payment', accessor: (row) => row.paymentStatus },
          ]}
          data={enrollments}
        />
      )}
    </SectionCard>
  )
}
