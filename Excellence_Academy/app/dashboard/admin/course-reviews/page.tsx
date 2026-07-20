'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Star,
  Trash2,
  Search,
  SlidersHorizontal,
  ExternalLink,
  MessageSquareDot,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  getAllCourseReviewsAdmin,
  adminDeleteCourseReview,
  type ServerCourseReview,
} from '@/serverdata/courseReviews'
import { SectionCard }  from '@/components/dashboard/section-card'
import { DataTable }    from '@/components/dashboard/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge }    from '@/components/ui/badge'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatDate, initials } from '@/lib/format'

// ─── Star display ──────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/25'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground tabular-nums">{rating}/5</span>
    </span>
  )
}

// ─── Skeleton rows ─────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const LIMIT = 10

export default function AdminCourseReviewsPage() {
  const [reviews, setReviews]     = useState<ServerCourseReview[]>([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  // Filters
  const [search, setSearch]             = useState('')
  const [searchInput, setSearchInput]   = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [sortOrder, setSortOrder]       = useState<string>('newest')

  // View dialog
  const [viewTarget, setViewTarget]   = useState<ServerCourseReview | null>(null)
  // Delete state
  const [deletingId, setDeletingId]   = useState<string | null>(null)

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchReviews = useCallback(
    async (p: number) => {
      setLoading(true)
      setError(null)
      try {
        const filters: Record<string, any> = {
          page:  p,
          limit: LIMIT,
        }
        if (search)                           filters.searchTerm = search
        if (ratingFilter !== 'all')           filters.rating     = Number(ratingFilter)

        const result = await getAllCourseReviewsAdmin(filters)

        let sorted = [...result.data]
        if (sortOrder === 'oldest') {
          sorted = sorted.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )
        }
        // 'newest' is already default from API

        setReviews(sorted)
        setTotal(result.meta.total)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load reviews')
      } finally {
        setLoading(false)
      }
    },
    [search, ratingFilter, sortOrder],
  )

  useEffect(() => {
    setPage(1)
    fetchReviews(1)
  }, [search, ratingFilter, sortOrder])

  useEffect(() => {
    fetchReviews(page)
  }, [page])

  // ── Delete ───────────────────────────────────────────────────────────────────

  async function handleDelete(review: ServerCourseReview) {
    const name   = review.user?.name ?? 'this student'
    const course = review.course?.title ?? 'this course'
    if (!confirm(`Delete ${name}'s review for "${course}"? This cannot be undone.`)) return

    setDeletingId(review.id)
    try {
      await adminDeleteCourseReview(review.id)
      toast.success('Review deleted')
      setReviews((prev) => prev.filter((r) => r.id !== review.id))
      setTotal((prev) => prev - 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete review')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Search submit ────────────────────────────────────────────────────────────

  function applySearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  const totalPages = Math.ceil(total / LIMIT)

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <MessageSquareDot className="h-4 w-4" />
              Course Review Management
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Course Reviews
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Manage all student course reviews. Search, filter, view details, or remove
              inappropriate content.
            </p>
          </div>
          <Button render={<Link href="/dashboard/admin" />} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Reviews',   value: total },
          { label: 'Showing',         value: reviews.length },
          { label: 'Page',            value: `${page} / ${totalPages || 1}` },
          { label: 'Filter',          value: ratingFilter === 'all' ? 'All ratings' : `★ ${ratingFilter}` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground tabular-nums">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <form onSubmit={applySearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by comment…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0 gap-1.5">
            <Search className="size-4" />
            Search
          </Button>
        </form>

        {/* Rating filter */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground shrink-0" />
          <Select value={ratingFilter} onValueChange={(v) => setRatingFilter(v ?? 'all')}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              {[5, 4, 3, 2, 1].map((r) => (
                <SelectItem key={r} value={String(r)}>
                  {'★'.repeat(r)} ({r})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v ?? 'newest')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      <SectionCard
        title={`Course Reviews (${total})`}
        description="All student course reviews, newest first."
      >
        {loading && <SkeletonRows />}

        {!loading && error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {!loading && !error && (
          <DataTable
            data={reviews}
            emptyMessage="No course reviews found."
            columns={[
              {
                header: 'Student',
                accessor: (row) => {
                  const name = row.user?.name ?? 'Unknown'
                  return (
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src={row.user?.avatar ?? ''} alt={name} />
                        <AvatarFallback className="text-xs">
                          {initials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{name}</p>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5">
                          {row.user?.role ?? 'student'}
                        </Badge>
                      </div>
                    </div>
                  )
                },
              },
              {
                header: 'Course',
                accessor: (row) =>
                  row.course ? (
                    <div className="min-w-0">
                      <p className="truncate max-w-[160px] text-sm font-medium text-foreground">
                        {row.course.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {row.course.category}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  ),
              },
              {
                header: 'Rating',
                accessor: (row) => <StarRating rating={row.rating} />,
              },
              {
                header: 'Comment',
                accessor: (row) => (
                  <p className="max-w-xs truncate text-sm text-muted-foreground">
                    {row.comment}
                  </p>
                ),
              },
              {
                header: 'Date',
                accessor: (row) => (
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </span>
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
                      onClick={() => setViewTarget(row)}
                    >
                      <ExternalLink className="size-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      disabled={deletingId === row.id}
                      onClick={() => handleDelete(row)}
                    >
                      {deletingId === row.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3 mr-1" />
                      )}
                      {deletingId === row.id ? '' : 'Delete'}
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} — {total} reviews total
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── View Dialog ── */}
      <Dialog open={viewTarget !== null} onOpenChange={(open) => { if (!open) setViewTarget(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>Full view of this course review.</DialogDescription>
          </DialogHeader>

          {viewTarget && (
            <div className="space-y-5 py-2">
              {/* Student */}
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={viewTarget.user?.avatar ?? ''} alt={viewTarget.user?.name ?? ''} />
                  <AvatarFallback>{initials(viewTarget.user?.name ?? 'S')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{viewTarget.user?.name ?? '—'}</p>
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    {viewTarget.user?.role ?? 'student'}
                  </Badge>
                </div>
              </div>

              {/* Course */}
              {viewTarget.course && (
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Course</p>
                    <p className="font-medium text-sm text-foreground">{viewTarget.course.title}</p>
                    <p className="text-xs text-muted-foreground">{viewTarget.course.category}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href={`/courses/${viewTarget.course.slug}`} target="_blank" />}
                    className="shrink-0 gap-1"
                  >
                    <ExternalLink className="size-3" />
                    View
                  </Button>
                </div>
              )}

              {/* Rating */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rating</p>
                <StarRating rating={viewTarget.rating} />
              </div>

              {/* Comment */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Comment</p>
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {viewTarget.comment}
                </p>
              </div>

              {/* Date */}
              <p className="text-xs text-muted-foreground">
                Submitted {formatDate(viewTarget.createdAt)}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 flex-row justify-end">
            {viewTarget && (
              <Button
                variant="destructive"
                size="sm"
                disabled={deletingId === viewTarget.id}
                onClick={async () => {
                  await handleDelete(viewTarget)
                  setViewTarget(null)
                }}
                className="gap-1.5"
              >
                {deletingId === viewTarget.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                Delete Review
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setViewTarget(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
