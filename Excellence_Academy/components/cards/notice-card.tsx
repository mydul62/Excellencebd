import { CalendarDays, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { NoticeCategoryBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/format'
import type { Notice } from '@/types'

export function NoticeCard({ notice }: { notice: Notice }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-semibold text-foreground text-pretty">
            {notice.title}
          </h3>
          <NoticeCategoryBadge category={notice.category} />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{notice.content}</p>
        <div className="flex flex-wrap items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatDate(notice.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="size-3.5" />
            {notice.author}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
