'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Pencil, Trash2, StarHalf } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  getReviews,
  updateReview,
  deleteReview,
  type ServerReview,
} from '@/serverdata/testimonials'
import { SectionCard } from '@/components/dashboard/section-card'
import { DataTable } from '@/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

// ── Edit schema — mirrors PUT /api/reviews/:id ────────────────────────────────
const editSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  role: z.string().trim().optional(),
  rating: z.coerce.number().int().min(1, 'Min 1').max(5, 'Max 5'),
  comment: z.string().trim().min(1, 'Comment is required'),
  featured: z.boolean(),
})

type EditFormValues = z.infer<typeof editSchema>

// ── Star display ──────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating}/5</span>
    </div>
  )
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ServerReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<ServerReview | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) as any })

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchReviews = () => {
    setLoading(true)
    getReviews({ limit: 100 })
      .then((res) =>
        setReviews(
          [...res.data].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        ),
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [])

  // ── Open edit dialog ───────────────────────────────────────────────────────
  function openEdit(review: ServerReview) {
    setEditTarget(review)
    reset({
      name: review.name,
      role: review.role ?? '',
      rating: review.rating,
      comment: review.comment,
      featured: review.featured,
    })
  }

  // ── Submit edit — PUT /api/reviews/:id ─────────────────────────────────────
  async function onEditSubmit(values: EditFormValues) {
    if (!editTarget) return
    try {
      await updateReview(editTarget.id, {
        name: values.name,
        role: values.role || undefined,
        rating: values.rating,
        comment: values.comment,
        featured: values.featured,
      })
      toast.success('Review updated successfully')
      setEditTarget(null)
      fetchReviews()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update review')
    }
  }

  // ── Delete — DELETE /api/reviews/:id ──────────────────────────────────────
  async function handleDelete(review: ServerReview) {
    const confirmed = confirm(
      `Delete review by "${review.name}"? This cannot be undone.`,
    )
    if (!confirmed) return

    setDeletingId(review.id)
    try {
      await deleteReview(review.id)
      toast.success('Review deleted')
      setReviews((prev) => prev.filter((r) => r.id !== review.id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete review')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Toggle featured ────────────────────────────────────────────────────────
  async function toggleFeatured(review: ServerReview) {
    try {
      await updateReview(review.id, { featured: !review.featured })
      toast.success(review.featured ? 'Removed from featured' : 'Marked as featured')
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, featured: !r.featured } : r)),
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update review')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Star className="h-4 w-4" />Review Management
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Reviews</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Moderate student reviews, feature testimonials, and remove inappropriate content.
            </p>
          </div>
          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to dashboard
          </Button>
        </div>
      </div>

      <SectionCard
        title={`Reviews (${reviews.length})`}
        description="All submitted reviews, newest first."
      >
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        )}
        {!loading && !error && reviews.length > 0 && (
          <DataTable
            columns={[
              {
                header: 'Reviewer',
                accessor: (row) => (
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarImage src={row.avatar ?? ''} alt={row.name} />
                      <AvatarFallback>{row.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.role ?? '—'}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Rating',
                accessor: (row) => <StarRating rating={row.rating} />,
              },
              {
                header: 'Comment',
                accessor: (row) => (
                  <p className="max-w-xs truncate text-sm text-muted-foreground">{row.comment}</p>
                ),
              },
              {
                header: 'Featured',
                accessor: (row) => (
                  <button
                    type="button"
                    onClick={() => toggleFeatured(row)}
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors"
                  >
                    <Badge variant={row.featured ? 'default' : 'secondary'}>
                      {row.featured ? '★ Featured' : 'Not featured'}
                    </Badge>
                  </button>
                ),
              },
              {
                header: 'Date',
                accessor: (row) => (
                  <span className="text-xs text-muted-foreground">{formatDate(row.createdAt)}</span>
                ),
              },
              {
                header: 'Actions',
                accessor: (row) => (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="size-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      disabled={deletingId === row.id}
                      onClick={() => handleDelete(row)}
                    >
                      <Trash2 className="size-3 mr-1" />
                      {deletingId === row.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={reviews}
          />
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

          <form onSubmit={handleSubmit(onEditSubmit)} className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="r-name">Reviewer Name</Label>
              <Input id="r-name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="r-role">Role / Title (optional)</Label>
              <Input id="r-role" placeholder="e.g. Student, Parent" {...register('role')} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="r-rating">Rating (1–5)</Label>
              <Input
                id="r-rating"
                type="number"
                min={1}
                max={5}
                step={1}
                {...register('rating')}
              />
              {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="r-comment">Comment</Label>
              <Textarea id="r-comment" rows={4} {...register('comment')} />
              {errors.comment && <p className="text-sm text-destructive">{errors.comment.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="r-featured"
                type="checkbox"
                className="size-4 rounded border-input"
                {...register('featured')}
              />
              <Label htmlFor="r-featured">Show on homepage (featured)</Label>
            </div>

            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
