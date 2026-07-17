import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  trend?: string
}

export function MetricCard({ title, value, description, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.28)]">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
      {trend ? (
        <div className="border-t border-border/60 px-5 py-3 text-sm text-emerald-600">{trend}</div>
      ) : null}
    </Card>
  )
}
