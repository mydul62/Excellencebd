import { getNotices } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { Badge } from '@/components/ui/badge'

export default async function AdminNoticesPage() {
  const notices = await getNotices()

  return (
    <SectionCard title="Notices" description="Publish updates for all audiences from one place.">
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
  )
}
