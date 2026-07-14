'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Users } from 'lucide-react'
import { getStudents } from '@/services'
import { getEnrollments } from '@/serverdata/enrollments'
import type { ServerUser } from '@/serverdata/users'
import type { ServerEnrollment } from '@/serverdata/enrollments'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<ServerUser[]>([])
  const [enrollments, setEnrollments] = useState<ServerEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getStudents(),
      getEnrollments({ limit: 200 }),
    ])
      .then(([studentData, enrollmentsRes]) => {
        setStudents(studentData)
        setEnrollments(enrollmentsRes.data)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Count enrollments per student
  const enrollmentCount = (userId: string) =>
    enrollments.filter((e) => e.userId === userId).length

  const approvedCount = (userId: string) =>
    enrollments.filter((e) => e.userId === userId && e.status === 'approved').length

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Users className="h-4 w-4" />
              Student Management
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Students</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              All registered students with their enrollment summary.
            </p>
          </div>
          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      <SectionCard
        title={`Students (${students.length})`}
        description="View student profiles and their enrolled courses"
        action={
          <Button render={<Link href="/dashboard/admin/students/register" />}>
            <Plus className="mr-2 h-4 w-4" />Register Student
          </Button>
        }
      >
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && students.length === 0 && (
          <p className="text-sm text-muted-foreground">No students found.</p>
        )}
        {!loading && !error && students.length > 0 && (
          <DataTable
            columns={[
              {
                header: 'Student',
                accessor: (row) => (
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarImage src={row.avatar ?? ''} alt={row.name} />
                      <AvatarFallback>{row.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                  </div>
                ),
              },
              { header: 'Phone', accessor: (row) => row.phone ?? '—' },
              {
                header: 'Enrollments',
                accessor: (row) => (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{enrollmentCount(row.id)}</span>
                    {approvedCount(row.id) > 0 && (
                      <Badge variant="default" className="text-xs">
                        {approvedCount(row.id)} approved
                      </Badge>
                    )}
                  </div>
                ),
              },
              {
                header: 'Joined',
                accessor: (row) => formatDate(row.createdAt),
              },
            ]}
            data={students}
          />
        )}
      </SectionCard>
    </div>
  )
}
