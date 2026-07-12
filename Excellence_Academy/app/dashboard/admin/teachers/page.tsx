import { getTeachers } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function AdminTeachersPage() {
  const teachers = await getTeachers()

  return (
    <SectionCard title="Teachers" description="Review faculty profiles and assignments.">
      <DataTable
        columns={[
          { header: 'Teacher', accessor: (row) => (
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarImage src={row.avatar} alt={row.name} />
                <AvatarFallback>{row.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.subject}</p>
              </div>
            </div>
          ) },
          { header: 'Email', accessor: 'email' },
          { header: 'Experience', accessor: (row) => `${row.experienceYears} years` },
          { header: 'Courses', accessor: (row) => row.courseIds.length },
        ]}
        data={teachers}
      />
    </SectionCard>
  )
}
