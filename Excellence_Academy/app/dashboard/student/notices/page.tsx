import { getNotices } from '@/services'
import { SectionCard } from '@/components/dashboard/section-card'
import { Badge } from '@/components/ui/badge'

export default async function StudentNoticesPage() {
  const notices = await getNotices('students')

  return (
    <SectionCard title="Notices" description="Latest updates for your learning journey.">
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
    </SectionCard>
  )
}
