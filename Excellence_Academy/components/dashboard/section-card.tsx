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
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="font-display text-lg">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
