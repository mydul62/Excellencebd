import { getStudents } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function AdminStudentsPage() {
  const students = await getStudents()

  return (
    <SectionCard title="Students" description="Manage the learner roster and their active status.">
      <DataTable
        columns={[
          { header: 'Student', accessor: (row) => (
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarImage src={row.avatar} alt={row.name} />
                <AvatarFallback>{row.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.email}</p>
              </div>
            </div>
          ) },
          { header: 'Phone', accessor: 'phone' },
          { header: 'Status', accessor: (row) => <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{row.status}</Badge> },
          { header: 'Joined', accessor: 'joinedAt' },
        ]}
        data={students}
      />
    </SectionCard>
  )
}
