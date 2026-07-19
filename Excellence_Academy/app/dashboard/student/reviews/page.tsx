'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Plus, Trash2, Pencil } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  type ServerReview,
} from '@/serverdata/testimonials'
import { getCourses } from '@/serverdata/courses'
import type { ServerCourse } from '@/serverdata/courses'
import { SectionCard } from '@/components/dashboard/section-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/format'
import { useAuth } from '@/hooks/use-auth'

// ── Schemas ───────────────────────────────────────────────────────────────────
const submitSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Min rating is 1').max(5, 'Max rating is 5'),
  comment: z.string().trim().min(10, 'Please write at least 10 characters'),
  courseId: z.string().trim().optional(),
})

const editSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Min rating is 1').max(5, 'Max rating is 5'),
  comment: z.string().trim().min(10, 'Please write at least 10 characters'),
})

type SubmitFormValues = z.infer<typeof submitSchema>
type EditFormValues = z.infer<typeof editSchema>

// ── Interactive star picker ───────────────────────────────────────────────────
function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (val: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1
        const active = star <= (hovered || value)
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="focus:outline-none"
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`size-6 transition-colors ${
                active ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
              }`}
            />
          </button>
        )
      })}
      <span className="ml-2 text-sm text-muted-foreground">{value > 0 ? `${value}/5` : 'Select rating'}</span>
    </div>
  )
}

// ── Static star display ───────────────────────────────────────────────────────
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

export default function StudentReviewsPage() {
  const { user } = useAuth()
  const [myReviews, setMyReviews] = useState<ServerReview[]>([])
  const [courses, setCourses] = useState<ServerCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<ServerReview | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [submitRating, setSubmitRating] = useState(0)
  const [editRating, setEditRating] = useState(0)

  // ── Submit form ───────────────────────────────────────────────────────────
  const submitForm = useForm<SubmitFormValues>({
    resolver: zodResolver(submitSchema) as any,
    defaultValues: { rating: 0, comment: '', courseId: '' },
  })

  // ── Edit form ─────────────────────────────────────────────────────────────
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema) as any,
    defaultValues: { rating: 0, comment: '' },
  })

  // ── Fetch own reviews + courses ───────────────────────────────────────────
  const fetchMyReviews = () => {
    if (!user?.id) return
    getReviews({ userId: user.id, limit: 50 })
      .then((res) => setMyReviews(res.data))
      .catch((e) => toast.error(e.message))
  }

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    Promise.all([
      getReviews({ userId: user.id, limit: 50 }),
      getCourses({ limit: 100 }),
    ])
      .then(([reviewsRes, coursesRes]) => {
        setMyReviews(reviewsRes.data)
        setCourses(coursesRes.data)
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [user?.id])

  // ── Submit new review — POST /api/reviews ─────────────────────────────────
  async function onSubmit(values: SubmitFormValues) {
    if (submitRating === 0) {
      submitForm.setError('rating', { message: 'Please select a rating' })
      return
    }
    if (!user) return
    try {
      await createReview({
        name: user.name,
        avatar: user.avatar || undefined,
        role: 'Student',
        rating: submitRating,
        comment: values.comment,
        userId: user.id,
        courseId: values.courseId || undefined,
      })
      toast.success('Review submitted successfully!')
      submitForm.reset()
      setSubmitRating(0)
      fetchMyReviews()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review')
    }
  }

  // ── Open edit dialog ──────────────────────────────────────────────────────
  function openEdit(review: ServerReview) {
    setEditTarget(review)
    setEditRating(review.rating)
    editForm.reset({ rating: review.rating, comment: review.comment })
  }

  // ── Submit edit — PUT /api/reviews/:id (student can only edit their own) ──
  async function onEditSubmit(values: EditFormValues) {
    if (!editTarget) return
    if (editRating === 0) {
      editForm.setError('rating', { message: 'Please select a rating' })
      return
    }
    try {
      await updateReview(editTarget.id, {
        rating: editRating,
        comment: values.comment,
      })
      toast.success('Review updated successfully')
      setEditTarget(null)
      fetchMyReviews()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update review')
    }
  }

  // ── Delete own review ─────────────────────────────────────────────────────
  async function handleDelete(review: ServerReview) {
    const confirmed = confirm('Delete this review? This cannot be undone.')
    if (!confirmed) return

    setDeletingId(review.id)
    try {
      await deleteReview(review.id)
      toast.success('Review deleted')
      setMyReviews((prev) => prev.filter((r) => r.id !== review.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete review')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Star className="h-4 w-4" />My Reviews
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Reviews</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Share your learning experience and manage your submitted reviews.
            </p>
          </div>
          <Button render={<Link href="/dashboard/student" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      {/* ── Submit New Review ── */}
      <SectionCard
        title="Write a Review"
        description="Share your experience to help other students."
      >
        <form onSubmit={submitForm.handleSubmit(onSubmit as any)} className="grid max-w-lg gap-4">
          {/* Star rating picker */}
          <div className="grid gap-2">
            <Label>Rating</Label>
            <StarPicker
              value={submitRating}
              onChange={(val) => {
                setSubmitRating(val)
                submitForm.setValue('rating', val)
                submitForm.clearErrors('rating')
              }}
            />
            {submitForm.formState.errors.rating && (
              <p className="text-sm text-destructive">
                {submitForm.formState.errors.rating.message}
              </p>
            )}
          </div>

          {/* Course (optional) */}
          <div className="grid gap-2">
            <Label htmlFor="s-course">Course (optional)</Label>
            <select
              id="s-course"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...submitForm.register('courseId')}
            >
              <option value="">General review (no specific course)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Comment */}
          <div className="grid gap-2">
            <Label htmlFor="s-comment">Your Review</Label>
            <Textarea
              id="s-comment"
              placeholder="Share what you found most valuable about this coaching center…"
              rows={4}
              {...submitForm.register('comment')}
            />
            {submitForm.formState.errors.comment && (
              <p className="text-sm text-destructive">
                {submitForm.formState.errors.comment.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitForm.formState.isSubmitting}
            className="w-fit"
          >
            <Plus className="mr-2 size-4" />
            {submitForm.formState.isSubmitting ? 'Submitting…' : 'Submit Review'}
          </Button>
        </form>
      </SectionCard>

      {/* ── My Reviews List ── */}
      <SectionCard
        title={`My Reviews (${myReviews.length})`}
        description="Reviews you have submitted."
      >
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}
        {!loading && myReviews.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Star className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              You haven't submitted any reviews yet. Share your experience above!
            </p>
          </div>
        )}
        {!loading && myReviews.length > 0 && (
          <div className="flex flex-col gap-3">
            {myReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-border/60 bg-background/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <StarDisplay rating={review.rating} />
                    <p className="text-sm text-foreground">{review.comment}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {review.featured && (
                        <Badge variant="default" className="text-xs">★ Featured</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => openEdit(review)}
                    >
                      <Pencil className="size-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      disabled={deletingId === review.id}
                      onClick={() => handleDelete(review)}
                    >
                      <Trash2 className="size-3 mr-1" />
                      {deletingId === review.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => { if (!open) setEditTarget(null) }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(onEditSubmit as any)} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Rating</Label>
              <StarPicker
                value={editRating}
                onChange={(val) => {
                  setEditRating(val)
                  editForm.setValue('rating', val)
                  editForm.clearErrors('rating')
                }}
              />
              {editForm.formState.errors.rating && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.rating.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="e-comment">Comment</Label>
              <Textarea
                id="e-comment"
                rows={4}
                {...editForm.register('comment')}
              />
              {editForm.formState.errors.comment && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.comment.message}
                </p>
              )}
            </div>

            <DialogFooter showCloseButton>
              <Button type="submit" disabled={editForm.formState.isSubmitting}>
                {editForm.formState.isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
