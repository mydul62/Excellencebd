import { Inbox } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-border/70 bg-background/60">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="rounded-full bg-muted p-3 text-muted-foreground">
          <Inbox className="size-5" />
        </div>
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
