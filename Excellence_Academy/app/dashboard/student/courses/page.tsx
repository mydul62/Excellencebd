import { getStudentDashboard } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/format'

export default async function StudentCoursesPage() {
  const data = await getStudentDashboard('s1')

  return (
    <SectionCard title="My Courses" description="Your academic schedule and fee status.">
      <DataTable
        columns={[
          { header: 'Course', accessor: (row) => row.course?.title ?? 'Unknown' },
          { header: 'Status', accessor: (row) => <Badge variant={row.status === 'approved' ? 'default' : 'secondary'}>{row.status}</Badge> },
          { header: 'Payment', accessor: 'paymentStatus' },
          { header: 'Amount Paid', accessor: (row) => formatCurrency(row.amountPaid) },
        ]}
        data={data.enrollments}
      />
    </SectionCard>
  )
}
