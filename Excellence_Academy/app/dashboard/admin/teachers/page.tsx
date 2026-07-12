import Link from 'next/link'
import { Plus } from 'lucide-react'

import { getTeachers } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export default async function AdminTeachersPage() {
  const teachers = await getTeachers()

  return (
    <SectionCard
      title="Teachers"
      description="Review faculty profiles and assignments."
      action={
        <Button render={<Link href="/dashboard/admin/teachers/register" />}>
          <Plus className="mr-2 h-4 w-4" />
          Register Teacher
        </Button>
      }
    >
      <DataTable
        columns={[
          {
            header: 'Teacher',
            accessor: (row) => (
              <div className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarImage src={row.avatar} alt={row.name} />
                  <AvatarFallback>
                    {row.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium text-foreground">
                    {row.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.subject}
                  </p>
                </div>
              </div>
            ),
          },
          {
            header: 'Email',
            accessor: 'email',
          },
          {
            header: 'Experience',
            accessor: (row) => `${row.experienceYears} years`,
          },
          {
            header: 'Courses',
            accessor: (row) => row.courseIds.length,
          },
        ]}
        data={teachers}
      />
    </SectionCard>
  )
}
