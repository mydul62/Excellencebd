'use client'

import { useEffect, useState } from 'react'
import { getStudentDashboard, type ServerUser } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [student, setStudent] = useState<ServerUser | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    getStudentDashboard(user.id)
      .then((d) => setStudent(d.student))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user?.id])

  return (
    <SectionCard title="Profile" description="Your student profile and contact information.">
      {loading && (
        <div className="flex gap-6">
          <div className="size-20 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
      )}
      {!loading && error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && !student && (
        <p className="text-sm text-muted-foreground">Profile not found.</p>
      )}
      {!loading && !error && student && (
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <Avatar size="lg">
            <AvatarImage src={student.avatar ?? ''} alt={student.name} />
            <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h2 className="font-display text-xl font-semibold text-foreground">{student.name}</h2>
            <p className="text-sm text-muted-foreground">Email: {student.email}</p>
            <p className="text-sm text-muted-foreground">Phone: {student.phone ?? '—'}</p>
            <p className="text-sm text-muted-foreground">Role: {student.role}</p>
            <p className="text-sm text-muted-foreground">
              Joined: {new Date(student.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </SectionCard>
  )
}
