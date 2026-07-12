import Link from 'next/link'
import { ArrowLeft, Plus, Users } from 'lucide-react'

import { getStudents } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function AdminStudentsPage() {
  const students = await getStudents()

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Users className="h-4 w-4" />
              Admin Students
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Student management</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Review the learner roster and open the registration screen when you need to add a new student.</p>
          </div>

          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Button>
        </div>
      </div>

      <SectionCard
        title="Students"
        description="Browse all learners and add new registrations from the dedicated route."
        action={
          <Button render={<Link href="/dashboard/admin/students/register" />}>
            <Plus className="mr-2 h-4 w-4" />
            Register Student
          </Button>
        }
      >
        <DataTable
          columns={[
            {
              header: 'Student',
              accessor: (row) => (
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
              ),
            },
            { header: 'Phone', accessor: 'phone' },
            { header: 'Status', accessor: (row) => <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>{row.status}</Badge> },
            { header: 'Joined', accessor: 'joinedAt' },
          ]}
          data={students}
        />
      </SectionCard>
    </div>
  )
}
