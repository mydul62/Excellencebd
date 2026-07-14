'use client'

import { useEffect, useState } from 'react'
import { getTeacherDashboard, type ServerTeacher } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'

export default function TeacherProfilePage() {
  const { user } = useAuth()
  const [teacher, setTeacher] = useState<ServerTeacher | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    getTeacherDashboard(user.id)
      .then((d) => setTeacher(d.teacher))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user?.id])

  return (
    <SectionCard title="Profile" description="Your teaching profile and credentials.">
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
      {!loading && !error && !teacher && (
        <p className="text-sm text-muted-foreground">Profile not found.</p>
      )}
      {!loading && !error && teacher && (
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <Avatar size="lg">
            <AvatarImage src={teacher.user?.avatar ?? ''} alt={teacher.user?.name ?? ''} />
            <AvatarFallback>{(teacher.user?.name ?? 'T').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h2 className="font-display text-xl font-semibold text-foreground">{teacher.user?.name}</h2>
            <p className="text-sm text-muted-foreground">{teacher.subject} • {teacher.qualification ?? '—'}</p>
            <p className="text-sm text-muted-foreground">{teacher.bio ?? '—'}</p>
            <p className="text-sm text-muted-foreground">Experience: {teacher.experienceYears} years</p>
            <p className="text-sm text-muted-foreground">Email: {teacher.user?.email}</p>
            <p className="text-sm text-muted-foreground">Phone: {teacher.user?.phone ?? '—'}</p>
          </div>
        </div>
      )}
    </SectionCard>
  )
}
