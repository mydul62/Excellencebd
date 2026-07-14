'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BellRing, Plus } from 'lucide-react'
import { getNotices, type ServerNotice } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<ServerNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getNotices()
      .then(setNotices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <BellRing className="h-4 w-4" />Admin Notices
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Notice center</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Browse and publish notices for students and teachers.</p>
          </div>
          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      <SectionCard
        title="Notices"
        description="All published notices."
        action={
          <Button render={<Link href="/dashboard/admin/notices/register" />}>
            <Plus className="mr-2 h-4 w-4" />Publish Notice
          </Button>
        }
      >
        {loading && <div className="space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="h-20 animate-pulse rounded-xl bg-muted"/>)}</div>}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && notices.length === 0 && <p className="text-sm text-muted-foreground">No notices yet.</p>}
        {!loading && !error && notices.length > 0 && (
          <div className="flex flex-col gap-3">
            {notices.map((notice) => (
              <div key={notice.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{notice.title}</p>
                  <Badge variant="secondary">{notice.category}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{notice.content}</p>
                <p className="mt-3 text-xs text-muted-foreground">By {notice.author} • {new Date(notice.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
