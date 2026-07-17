import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({
  href = '/',
  className,
  compact = false,
}: {
  href?: string
  className?: string
  compact?: boolean
}) {
  return (
    <Link href={href} className={cn('flex items-center gap-2.5', className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <GraduationCap className="size-5" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold text-foreground">Exellence Academy</span>
          <span className="text-[11px] font-medium text-muted-foreground">কোচিং সেন্টার</span>
        </span>
      )}
    </Link>
  )
}
