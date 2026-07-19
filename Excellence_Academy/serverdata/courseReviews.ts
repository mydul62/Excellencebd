import { apiGet, apiPost, apiPatch, apiDelete } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServerCourseReview {
  id: string
  courseId: string
  userId: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    avatar: string | null
    role: string
  } | null
  course: {
    id: string
    title: string
    slug: string
    category: string
  } | null
}

export interface CourseReviewsResult {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
  data: ServerCourseReview[]
  meta: { page: number; limit: number; total: number }
}

export interface AdminCourseReviewsResult {
  data: ServerCourseReview[]
  meta: { page: number; limit: number; total: number }
}

export interface CreateCourseReviewPayload {
  courseId: string
  rating: number
  comment: string
}

export interface UpdateCourseReviewPayload {
  rating?: number
  comment?: string
}

export interface AdminCourseReviewFilters {
  searchTerm?: string
  courseId?: string
  userId?: string
  rating?: number
  page?: number
  limit?: number
}

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * GET /api/course-review/course/:courseId
 * Returns average rating, distribution, and paginated reviews.
 */
export async function getCourseReviews(
  courseId: string,
  page = 1,
  limit = 10,
): Promise<CourseReviewsResult> {
  const res = await apiGet<CourseReviewsResult>(
    `/course-review/course/${courseId}?page=${page}&limit=${limit}`,
  )
  return res.data
}

// ─── Authenticated ────────────────────────────────────────────────────────────

/**
 * POST /api/course-review
 */
export async function createCourseReview(
  payload: CreateCourseReviewPayload,
): Promise<ServerCourseReview> {
  const res = await apiPost<ServerCourseReview>('/course-review', payload)
  return res.data
}

/**
 * PATCH /api/course-review/:id
 */
export async function updateCourseReview(
  id: string,
  payload: UpdateCourseReviewPayload,
): Promise<ServerCourseReview> {
  const res = await apiPatch<ServerCourseReview>(`/course-review/${id}`, payload)
  return res.data
}

/**
 * DELETE /api/course-review/:id  (owner or admin)
 */
export async function deleteCourseReview(id: string): Promise<void> {
  await apiDelete<null>(`/course-review/${id}`)
}

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * GET /api/course-review  — all reviews (admin)
 */
export async function getAllCourseReviewsAdmin(
  filters: AdminCourseReviewFilters = {},
): Promise<AdminCourseReviewsResult> {
  const params = new URLSearchParams()
  if (filters.searchTerm) params.set('searchTerm', filters.searchTerm)
  if (filters.courseId)   params.set('courseId',   filters.courseId)
  if (filters.userId)     params.set('userId',      filters.userId)
  if (filters.rating)     params.set('rating',      String(filters.rating))
  if (filters.page)       params.set('page',        String(filters.page))
  if (filters.limit)      params.set('limit',       String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerCourseReview[]>(
    `/course-review${query ? `?${query}` : ''}`,
  )

  return {
    data: res.data ?? [],
    meta: res.meta ?? { page: 1, limit: 10, total: 0 },
  }
}

/**
 * DELETE /api/course-review/admin/:id  — admin deletes any review
 */
export async function adminDeleteCourseReview(id: string): Promise<void> {
  await apiDelete<null>(`/course-review/admin/${id}`)
}
