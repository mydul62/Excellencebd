import { BookOpen, BellRing, Users, UserCircle2 } from 'lucide-react'
import { getTeacherDashboard } from '@/services'
import { MetricCard } from '@/components/dashboard/metric-card'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function TeacherDashboardPage() {
  const data = await getTeacherDashboard('t1')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-foreground">Teacher Overview</h1>
        <p className="text-sm text-muted-foreground">Keep your courses, students, and notices aligned with one streamlined view.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Assigned Courses" value={data.courses.length.toString()} description="Courses under your instruction" icon={BookOpen} trend="3 active batches" />
        <MetricCard title="Total Students" value={data.totalStudents.toString()} description="Enrolled learners across your courses" icon={Users} trend="↑ 8 this month" />
        <MetricCard title="Notices" value={data.notices.length.toString()} description="Latest center updates" icon={BellRing} trend="2 urgent" />
      </div>

      <SectionCard title="My Courses" description="A quick glance at your teaching portfolio">
        <DataTable
          columns={[
            { header: 'Course', accessor: (row) => row.title },
            { header: 'Category', accessor: 'category' },
            { header: 'Level', accessor: 'level' },
            { header: 'Students', accessor: (row) => `${row.seats} seats` },
          ]}
          data={data.courses}
        />
      </SectionCard>

      <SectionCard title="Recent Notices" description="Messages relevant to teachers and staff">
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
