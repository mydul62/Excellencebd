'use client'

import { useEffect, useState } from 'react'
import { getNotices, type ServerNotice } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { Badge } from '@/components/ui/badge'

export default function TeacherNoticesPage() {
  const [notices, setNotices] = useState<ServerNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getNotices('teachers')
      .then(setNotices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <SectionCard title="Notices" description="Institution updates for your teaching team.">
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}
      {!loading && error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && notices.length === 0 && (
        <p className="text-sm text-muted-foreground">No notices for teachers yet toukir  .</p>
      )}
      {!loading && !error && notices.length > 0 && (
        <div className="flex flex-col gap-3">
          {notices.map((notice) => (
            <div key={notice.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground">{notice.title}</p>
                <Badge variant="secondary">{notice.category}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{notice.content}</p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}
