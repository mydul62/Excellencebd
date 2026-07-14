import { apiGet, apiPost, apiPut, apiDelete } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface ServerCourse {
  id: string
  title: string
  slug: string
  category: string
  description: string
  duration: string
  price: number
  level: CourseLevel
  icon: string | null
  seats: number
  rating: number
  popular: boolean
  teacherId: string | null
  createdAt: string
  updatedAt: string
}

export interface CourseFilters {
  searchTerm?: string
  category?: string
  level?: CourseLevel
  popular?: boolean
  page?: number
  limit?: number
}

export interface CoursesResult {
  data: ServerCourse[]
  meta: { page: number; limit: number; total: number }
}

export interface CreateCoursePayload {
  title: string
  slug: string
  category: string
  description: string
  duration: string
  price: number
  level?: CourseLevel
  icon?: string
  seats?: number
  teacherId?: string
  popular?: boolean
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET /api/courses
 * Public — no auth required.
 */
export async function getCourses(filters: CourseFilters = {}): Promise<CoursesResult> {
  const params = new URLSearchParams()
  if (filters.searchTerm) params.set('searchTerm', filters.searchTerm)
  if (filters.category)   params.set('category', filters.category)
  if (filters.level)      params.set('level', filters.level)
  if (filters.popular !== undefined) params.set('popular', String(filters.popular))
  if (filters.page)       params.set('page', String(filters.page))
  if (filters.limit)      params.set('limit', String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerCourse[]>(`/courses${query ? `?${query}` : ''}`)

  return {
    data: res.data ?? [],
    meta: res.meta ?? { page: 1, limit: 10, total: 0 },
  }
}

/**
 * GET /api/courses/:id
 * Public — no auth required.
 */
export async function getCourse(id: string): Promise<ServerCourse> {
  const res = await apiGet<ServerCourse>(`/courses/${id}`)
  return res.data
}

/**
 * Shorthand: fetch popular courses for homepage.
 */
export async function getPopularCourses(limit = 4): Promise<ServerCourse[]> {
  const result = await getCourses({ popular: true, limit })
  return result.data
}

/**
 * POST /api/courses — ADMIN only.
 */
export async function createCourse(payload: CreateCoursePayload): Promise<ServerCourse> {
  const res = await apiPost<ServerCourse>('/courses', payload)
  return res.data
}

/**
 * PUT /api/courses/:id — ADMIN only.
 */
export async function updateCourse(
  id: string,
  payload: Partial<CreateCoursePayload>,
): Promise<ServerCourse> {
  const res = await apiPut<ServerCourse>(`/courses/${id}`, payload)
  return res.data
}

/**
 * DELETE /api/courses/:id — ADMIN only.
 */
export async function deleteCourse(id: string): Promise<void> {
  await apiDelete<null>(`/courses/${id}`)
}
