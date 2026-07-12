import { getEnrollments } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'

export default async function TeacherStudentsPage() {
  const enrollments = await getEnrollments()

  return (
    <SectionCard title="Students" description="Enrolled learners across your courses.">
      <DataTable
        columns={[
          { header: 'Student', accessor: (row) => row.student?.name ?? 'Unknown' },
          { header: 'Course', accessor: (row) => row.course?.title ?? 'Unknown' },
          { header: 'Status', accessor: (row) => <Badge variant={row.status === 'approved' ? 'default' : 'secondary'}>{row.status}</Badge> },
          { header: 'Payment', accessor: 'paymentStatus' },
        ]}
        data={enrollments.slice(0, 8)}
      />
    </SectionCard>
  )
}
