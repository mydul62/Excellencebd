import { apiGet, apiPost, apiPut, apiDelete } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServerReview {
  id: string
  name: string
  avatar: string | null
  role: string | null
  rating: number
  comment: string
  featured: boolean
  userId: string | null
  courseId: string | null
  createdAt: string
  updatedAt: string
}

export interface ReviewFilters {
  searchTerm?: string
  featured?: boolean
  courseId?: string
  userId?: string
  page?: number
  limit?: number
}

export interface ReviewsResult {
  data: ServerReview[]
  meta: { page: number; limit: number; total: number }
}

export interface CreateReviewPayload {
  name: string
  avatar?: string
  role?: string
  rating: number
  comment: string
  featured?: boolean
  userId?: string
  courseId?: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET /api/reviews
 * Public — no auth required.
 */
export async function getReviews(filters: ReviewFilters = {}): Promise<ReviewsResult> {
  const params = new URLSearchParams()
  if (filters.searchTerm) params.set('searchTerm', filters.searchTerm)
  if (filters.featured !== undefined) params.set('featured', String(filters.featured))
  if (filters.courseId)   params.set('courseId', filters.courseId)
  if (filters.userId)     params.set('userId', filters.userId)
  if (filters.page)       params.set('page', String(filters.page))
  if (filters.limit)      params.set('limit', String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerReview[]>(`/reviews${query ? `?${query}` : ''}`)

  return {
    data: res.data ?? [],
    meta: res.meta ?? { page: 1, limit: 10, total: 0 },
  }
}

/**
 * GET /api/reviews/:id
 */
export async function getReview(id: string): Promise<ServerReview> {
  const res = await apiGet<ServerReview>(`/reviews/${id}`)
  return res.data
}

/**
 * Shorthand: fetch featured reviews for the homepage Testimonials section.
 */
export async function getFeaturedTestimonials(limit = 3): Promise<ServerReview[]> {
  const result = await getReviews({limit })
  return result.data
}

/**
 * POST /api/reviews — ADMIN or STUDENT.
 */
export async function createReview(payload: CreateReviewPayload): Promise<ServerReview> {
  const res = await apiPost<ServerReview>('/reviews', payload)
  return res.data
}

/**
 * PUT /api/reviews/:id — ADMIN only.
 */
export async function updateReview(
  id: string,
  payload: Partial<CreateReviewPayload>,
): Promise<ServerReview> {
  const res = await apiPut<ServerReview>(`/reviews/${id}`, payload)
  return res.data
}

/**
 * DELETE /api/reviews/:id — ADMIN only.
 */
export async function deleteReview(id: string): Promise<void> {
  await apiDelete<null>(`/reviews/${id}`)
}
