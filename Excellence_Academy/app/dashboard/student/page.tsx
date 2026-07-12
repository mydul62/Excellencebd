import { BookOpen, BellRing, CreditCard, CheckCircle2 } from 'lucide-react'
import { getStudentDashboard } from '@/services'
import { MetricCard } from '@/components/dashboard/metric-card'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/format'

export default async function StudentDashboardPage() {
  const data = await getStudentDashboard('s1')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-foreground">Student Overview</h1>
        <p className="text-sm text-muted-foreground">Track your course journey, fee status, and latest announcements from one place.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="My Courses" value={data.enrollments.length.toString()} description="Current enrollments" icon={BookOpen} trend="2 active" />
        <MetricCard title="Enrollment Status" value={`${data.approvedCount} approved`} description="Pending requests tracked" icon={CheckCircle2} trend={`${data.pendingCount} pending`} />
        <MetricCard title="Notices" value={data.notices.length.toString()} description="Important updates" icon={BellRing} trend={`Due ${formatCurrency(data.dueAmount)}`} />
      </div>

      <SectionCard title="My Enrollments" description="Your course stream and payment progress">
        <DataTable
          columns={[
            { header: 'Course', accessor: (row) => row.course?.title ?? 'Unknown' },
            { header: 'Status', accessor: (row) => <Badge variant={row.status === 'approved' ? 'default' : 'secondary'}>{row.status}</Badge> },
            { header: 'Payment', accessor: (row) => row.paymentStatus },
            { header: 'Paid', accessor: (row) => formatCurrency(row.amountPaid) },
          ]}
          data={data.enrollments}
        />
      </SectionCard>

      <SectionCard title="Latest Notices" description="Updates tailored for students">
        <div className="flex flex-col gap-3">
          {data.notices.map((notice) => (
            <div key={notice.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground">{notice.title}</p>
                <Badge variant="secondary">{notice.category}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{notice.content}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
