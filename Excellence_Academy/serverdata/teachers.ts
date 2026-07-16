import { apiGet, apiPost, apiPut, apiDelete } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServerTeacherUser {
  id: string
  name: string
  email: string
  avatar: string | null
  phone: string | null
}

export interface ServerTeacherCourse {
  id: string
  title: string
  slug: string
  category: string
}

export interface ServerTeacher {
  id: string
  userId: string
  subject: string
  bio: string | null
  experienceYears: number
  qualification: string | null
  joinedAt: string
  createdAt: string
  updatedAt: string
  user: ServerTeacherUser
  courses: ServerTeacherCourse[]
}

export interface TeacherFilters {
  searchTerm?: string
  subject?: string
  page?: number
  limit?: number
}

export interface TeachersResult {
  data: ServerTeacher[]
  meta: { page: number; limit: number; total: number }
}

export interface CreateTeacherPayload {
  name: string
  email: string
  password: string
  subject: string
  bio?: string
  experienceYears?: number
  qualification?: string
  avatar?: string
  phone?: string
  joinedAt?: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET /api/teachers
 * Public — no auth required.
 */
export async function getTeachers(filters: TeacherFilters = {}): Promise<TeachersResult> {
  const params = new URLSearchParams()
  if (filters.searchTerm) params.set('searchTerm', filters.searchTerm)
  if (filters.subject)    params.set('subject', filters.subject)
  if (filters.page)       params.set('page', String(filters.page))
  if (filters.limit)      params.set('limit', String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerTeacher[]>(`/teachers${query ? `?${query}` : ''}`)

  return {
    data: res.data ?? [],
    meta: res.meta ?? { page: 1, limit: 10, total: 0 },
  }
}

/**
 * GET /api/teachers/:id
 * Public — no auth required.
 */
export async function getTeacher(id: string): Promise<ServerTeacher> {
  const res = await apiGet<ServerTeacher>(`/teachers/${id}`)
  return res.data
}

/**
 * Shorthand: fetch first N teachers for homepage featured section.
 */
export async function getFeaturedTeachers(limit = 4): Promise<ServerTeacher[]> {
  const result = await getTeachers({ limit })
  return result.data
}

/**
 * POST /api/teachers — ADMIN only.
 */
export async function createTeacher(payload: CreateTeacherPayload): Promise<ServerTeacher> {
  const res = await apiPost<ServerTeacher>('/teachers', payload)
  return res.data
}

/**
 * PUT /api/teachers/:id — ADMIN or TEACHER.
 */
export async function updateTeacher(
  id: string,
  payload: Partial<Omit<CreateTeacherPayload, 'email' | 'password'>>,
): Promise<ServerTeacher> {
  const res = await apiPut<ServerTeacher>(`/teachers/${id}`, payload)
  return res.data
}

/**
 * DELETE /api/teachers/:id — ADMIN only.
 */
export async function deleteTeacher(id: string): Promise<void> {
  await apiDelete<null>(`/teachers/${id}`)
}
