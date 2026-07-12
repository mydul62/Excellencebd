import { getTeacherDashboard } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'

export default async function TeacherCoursesPage() {
  const data = await getTeacherDashboard('t1')

  return (
    <SectionCard title="My Courses" description="The courses assigned to you for delivery and mentorship.">
      <DataTable
        columns={[
          { header: 'Course', accessor: (row) => row.title },
          { header: 'Category', accessor: 'category' },
          { header: 'Level', accessor: 'level' },
          { header: 'Seats', accessor: 'seats' },
          { header: 'Status', accessor: () => <Badge variant="default">Live</Badge> },
        ]}
        data={data.courses}
      />
    </SectionCard>
  )
}
