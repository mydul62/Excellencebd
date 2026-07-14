'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getTeachers, type ServerTeacher } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<ServerTeacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTeachers()
      .then(setTeachers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <SectionCard
      title="Teachers"
      description="Review faculty profiles and assignments."
      action={
        <Button render={<Link href="/dashboard/admin/teachers/register" />}>
          <Plus className="mr-2 h-4 w-4" />Register Teacher
        </Button>
      }
    >
      {loading && <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="h-12 animate-pulse rounded-xl bg-muted"/>)}</div>}
      {!loading && error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && teachers.length === 0 && <p className="text-sm text-muted-foreground">No teachers found.</p>}
      {!loading && !error && teachers.length > 0 && (
        <DataTable
          columns={[
            {
              header: 'Teacher',
              accessor: (row) => (
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarImage src={row.user?.avatar ?? ''} alt={row.user?.name ?? ''} />
                    <AvatarFallback>{(row.user?.name ?? 'T').slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{row.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{row.subject}</p>
                  </div>
                </div>
              ),
            },
            { header: 'Email', accessor: (row) => row.user?.email ?? '—' },
            { header: 'Experience', accessor: (row) => `${row.experienceYears} yrs` },
            { header: 'Courses', accessor: (row) => row.courses?.length ?? 0 },
          ]}
          data={teachers}
        />
      )}
    </SectionCard>
  )
}
