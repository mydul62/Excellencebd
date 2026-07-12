import Link from 'next/link'
import { ArrowLeft, BellRing, Plus } from 'lucide-react'

import { getNotices } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function AdminNoticesPage() {
  const notices = await getNotices()

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <BellRing className="h-4 w-4" />
              Admin Notices
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Notice center</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Browse the latest notices and open the publishing screen whenever you need to post a new update.</p>
          </div>

          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Button>
        </div>
      </div>

      <SectionCard
        title="Notices"
        description="Manage announcements from the list view and switch to the dedicated publishing route when needed."
        action={
          <Button render={<Link href="/dashboard/admin/notices/register" />}>
            <Plus className="mr-2 h-4 w-4" />
            Publish Notice
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          {notices.map((notice) => (
            <div key={notice.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground">{notice.title}</p>
                <Badge variant="secondary">{notice.category}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{notice.content}</p>
              <p className="mt-3 text-xs text-muted-foreground">By {notice.author} • {notice.date}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
