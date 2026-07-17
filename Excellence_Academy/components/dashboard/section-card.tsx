'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SectionCardProps {
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
}

export function SectionCard({ title, description, children, action }: SectionCardProps) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.28)]">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="font-display text-lg">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <div className="w-full sm:w-auto">{action}</div> : null}
      </CardHeader>
      <CardContent className="overflow-x-auto">{children}</CardContent>
    </Card>
  )
}
