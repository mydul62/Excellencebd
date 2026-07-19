'use client'

/**
 * CourseReviewStats
 * Fetches live averageRating + totalReviews for a specific course
 * and renders them inline inside CourseCard.
 */

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { getCourseReviews } from '@/serverdata/courseReviews'
import { cn } from '@/lib/utils'

interface ReviewStats {
  averageRating: number
  totalReviews: number
}

interface CourseReviewStatsProps {
  courseId: string
  /** Fallback rating from the Course record (shown while loading) */
  fallbackRating?: number
}

export function CourseReviewStats({ courseId, fallbackRating = 0 }: CourseReviewStatsProps) {
  const [stats, setStats]       = useState<ReviewStats | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    let cancelled = false
    getCourseReviews(courseId, 1, 1)
      .then((res) => {
        if (!cancelled) {
          setStats({
            averageRating: res.averageRating,
            totalReviews:  res.totalReviews,
          })
        }
      })
      .catch(() => {
        // silently fall back — don't crash the card
        if (!cancelled) setStats(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [courseId])

  // While loading, show the DB fallback rating as skeleton
  if (loading) {
    return (
      <div className="flex items-center gap-1.5">
        <StarRow rating={fallbackRating} muted />
        <span className="h-3.5 w-12 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  // No reviews yet
  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <StarRow rating={0} muted />
        <span className="text-xs text-muted-foreground">No reviews yet</span>
      </div>
    )
  }

  const { averageRating, totalReviews } = stats

  return (
    <div className="flex items-center gap-1.5">
      <StarRow rating={averageRating} />
      <span className="text-sm font-medium text-muted-foreground">
        {averageRating.toFixed(1)}
      </span>
      <span className="text-xs text-muted-foreground/70">
        ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  )
}

// ─── Internal star row ────────────────────────────────────────────────────────

function StarRow({ rating, muted = false }: { rating: number; muted?: boolean }) {
  const rounded = Math.round(rating)
  return (
    <span className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'size-3.5',
            muted
              ? 'fill-muted text-muted'
              : i < rounded
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted',
          )}
        />
      ))}
    </span>
  )
}
