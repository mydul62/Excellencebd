import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  tone?: 'primary' | 'accent' | 'amber' | 'blue'
}

const toneStyles: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-accent',
  amber: 'bg-amber-100 text-amber-600',
  blue: 'bg-blue-100 text-blue-600',
}

export function StatCard({ label, value, icon: Icon, hint, tone = 'primary' }: StatCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <span
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-xl',
            toneStyles[tone],
          )}
        >
          <Icon className="size-6" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="font-display text-2xl font-bold leading-none text-foreground">
            {value}
          </span>
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
