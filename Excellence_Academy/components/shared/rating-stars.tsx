import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RatingStars({
  rating,
  className,
  showValue = false,
}: {
  rating: number
  className?: string
  showValue?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'size-4',
              i < Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-muted text-muted',
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}
