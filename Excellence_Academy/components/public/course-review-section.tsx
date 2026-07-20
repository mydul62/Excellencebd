'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Star, Pencil, Trash2, MessageSquare, Loader2 } from 'lucide-react'

import {
  getCourseReviews,
  createCourseReview,
  updateCourseReview,
  deleteCourseReview,
  type ServerCourseReview,
  type CourseReviewsResult,
} from '@/serverdata/courseReviews'
import { useAuth } from '@/hooks/use-auth'
import { formatDate, initials } from '@/lib/format'
import { Button }   from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ─── Zod schema ───────────────────────────────────────────────────────────────

const reviewSchema = z.object({
  rating:  z.number().int().min(1, 'Please select a rating').max(5),
  comment: z
    .string()
    .trim()
    .min(5, 'Comment must be at least 5 characters')
    .max(1000, 'Comment must be at most 1000 characters'),
})
type ReviewFormValues = z.infer<typeof reviewSchema>

// ─── Star selector ────────────────────────────────────────────────────────────

function StarSelector({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className={cn(
            'transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <Star
            className={cn(
              'size-7',
              (hover || value) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-muted-foreground/40',
            )}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Static star display ──────────────────────────────────────────────────────

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'size-6' : 'size-4'
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(cls, s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/25 fill-none')}
        />
      ))}
    </span>
  )
}

// ─── Rating bar ───────────────────────────────────────────────────────────────

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 shrink-0 text-right text-muted-foreground">{star}</span>
      <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-xs text-muted-foreground">{count}</span>
    </div>
  )
}

// ─── Skeleton cards ───────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="size-10 shrink-0 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-16 rounded-xl bg-muted" />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CourseReviewSectionProps {
  courseId: string
}

export function CourseReviewSection({ courseId }: CourseReviewSectionProps) {
  const { user } = useAuth()

  const [reviewData, setReviewData]   = useState<CourseReviewsResult | null>(null)
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage]               = useState(1)
  const [hasMore, setHasMore]         = useState(false)

  // Which review the current user already submitted (if any)
  const [myReview, setMyReview]       = useState<ServerCourseReview | null>(null)
  // Edit mode
  const [editing, setEditing]         = useState(false)
  const [deleting, setDeleting]       = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  })

  const ratingValue = watch('rating')

  // ── Fetch reviews ──────────────────────────────────────────────────────────

  const fetchReviews = useCallback(
    async (p = 1, append = false) => {
      if (!append) setLoading(true)
      else setLoadingMore(true)

      try {
        const result = await getCourseReviews(courseId, p, 5)
        setReviewData((prev) => {
          if (!append || !prev) return result
          return {
            ...result,
            data: [...prev.data, ...result.data],
          }
        })
        setHasMore(result.data.length > 0 && result.meta.total > p * 5)

        // Detect user's own review
        if (user) {
          const mine = result.data.find((r) => r.userId === user.id)
          if (mine) {
            setMyReview(mine)
          } else if (append) {
            // already checked on first load; keep existing myReview
          }
        }
      } catch {
        toast.error('Failed to load reviews')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [courseId, user],
  )

  useEffect(() => {
    fetchReviews(1, false)
    setPage(1)
  }, [courseId, user?.id]) // re-fetch when user logs in/out

  // ── Submit new review ──────────────────────────────────────────────────────

  async function onSubmit(values: ReviewFormValues) {
    if (!user) return
    try {
      const created = await createCourseReview({
        courseId,
        rating:  values.rating,
        comment: values.comment,
      })
      toast.success('Review submitted!')
      setMyReview(created)
      reset({ rating: 0, comment: '' })
      await fetchReviews(1, false)
      setPage(1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review')
    }
  }

  // ── Submit edit ────────────────────────────────────────────────────────────

  async function onEditSubmit(values: ReviewFormValues) {
    if (!myReview) return
    try {
      const updated = await updateCourseReview(myReview.id, {
        rating:  values.rating,
        comment: values.comment,
      })
      toast.success('Review updated!')
      setMyReview(updated)
      setEditing(false)
      await fetchReviews(1, false)
      setPage(1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update review')
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!myReview) return
    if (!confirm('Delete your review? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteCourseReview(myReview.id)
      toast.success('Review deleted')
      setMyReview(null)
      setEditing(false)
      reset({ rating: 0, comment: '' })
      await fetchReviews(1, false)
      setPage(1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete review')
    } finally {
      setDeleting(false)
    }
  }

  function openEdit() {
    if (!myReview) return
    setValue('rating',  myReview.rating)
    setValue('comment', myReview.comment)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    reset({ rating: 0, comment: '' })
  }

  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchReviews(nextPage, true)
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const summary = reviewData

  return (
    <section className="mt-4" id="course-reviews" aria-labelledby="course-reviews-heading">
      <div className="mb-6 flex items-center gap-3">
        <h2
          id="course-reviews-heading"
          className="font-display text-2xl font-bold text-foreground"
        >
          Course Reviews
        </h2>
        {summary && (
          <span className="rounded-full border border-border bg-muted px-3 py-0.5 text-sm text-muted-foreground">
            {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
          </span>
        )}
      </div>

      {/* ── Rating Summary ── */}
      {summary && summary.totalReviews > 0 && (
        <Card className="mb-8 overflow-hidden border-border/60">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Big number */}
              <div className="flex flex-col items-center gap-1 sm:w-36 sm:shrink-0">
                <span className="font-display text-6xl font-bold tabular-nums text-foreground leading-none">
                  {summary.averageRating.toFixed(1)}
                </span>
                <StarDisplay rating={Math.round(summary.averageRating)} size="lg" />
                <span className="text-sm text-muted-foreground mt-1">
                  {summary.totalReviews} {summary.totalReviews === 1 ? 'rating' : 'ratings'}
                </span>
              </div>

              <Separator orientation="vertical" className="hidden h-auto sm:block" />

              {/* Bars */}
              <div className="flex flex-1 flex-col gap-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <RatingBar
                    key={star}
                    star={star}
                    count={summary.ratingDistribution[star] ?? 0}
                    total={summary.totalReviews}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Write / Edit review form ── */}
      {user ? (
        <Card className="mb-8 border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            {myReview && !editing ? (
              /* Already reviewed — show edit/delete buttons */
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Your Review</p>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={myReview.rating} />
                  <span className="text-xs text-muted-foreground">{formatDate(myReview.createdAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{myReview.comment}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={openEdit} className="gap-1.5">
                    <Pencil className="size-3.5" />
                    Edit Review
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="gap-1.5"
                  >
                    {deleting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    Delete Review
                  </Button>
                </div>
              </div>
            ) : (
              /* New review or editing form */
              <form
                onSubmit={handleSubmit(editing ? onEditSubmit : onSubmit)}
                className="space-y-4"
              >
                <p className="text-sm font-medium text-foreground">
                  {editing ? 'Edit Your Review' : 'Write a Review'}
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Your Rating
                  </label>
                  <StarSelector
                    value={ratingValue}
                    onChange={(v) => setValue('rating', v, { shouldValidate: true })}
                    disabled={isSubmitting}
                  />
                  {errors.rating && (
                    <p className="text-xs text-destructive">{errors.rating.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cr-comment" className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Comment
                  </label>
                  <Textarea
                    id="cr-comment"
                    rows={4}
                    placeholder="Share your experience with this course…"
                    className="resize-none"
                    {...register('comment')}
                    disabled={isSubmitting}
                  />
                  {errors.comment && (
                    <p className="text-xs text-destructive">{errors.comment.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {editing ? 'Save Changes' : 'Submit Review'}
                  </Button>
                  {editing && (
                    <Button type="button" variant="outline" onClick={cancelEdit} disabled={isSubmitting}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-border/60 bg-muted/30">
          <CardContent className="flex items-center justify-center gap-3 p-6 text-center">
            <MessageSquare className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <a href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                Log in
              </a>{' '}
              to leave a review for this course.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Review list ── */}
      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => <ReviewSkeleton key={i} />)}
        </div>
      ) : !summary || summary.totalReviews === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Star className="size-7 text-muted-foreground/50" />
          </div>
          <p className="font-medium text-foreground">No course reviews yet.</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Be the first student to review this course.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(summary.data ?? []).map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwn={user?.id === review.userId}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="gap-2"
              >
                {loadingMore && <Loader2 className="size-4 animate-spin" />}
                Load More Reviews
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// ─── Review card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  isOwn,
}: {
  review: ServerCourseReview
  isOwn: boolean
}) {
  const name = review.user?.name ?? 'Student'
  return (
    <Card
      className={cn(
        'border-border/60 transition-shadow hover:shadow-md',
        isOwn && 'ring-1 ring-primary/30',
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={review.user?.avatar ?? ''} alt={name} />
            <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-medium text-sm text-foreground">{name}</span>
              {isOwn && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  You
                </span>
              )}
              <span className="ml-auto text-xs text-muted-foreground shrink-0">
                {formatDate(review.createdAt)}
              </span>
            </div>
            <StarDisplay rating={review.rating} />
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {review.comment}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
