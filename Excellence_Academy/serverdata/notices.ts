import { apiGet, apiPost, apiPut, apiDelete } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export type NoticeCategory = 'general' | 'academic' | 'exam' | 'holiday' | 'event'
export type NoticeAudience = 'all' | 'students' | 'teachers' | 'parents'

export interface ServerNotice {
  id: string
  title: string
  content: string
  category: NoticeCategory
  audience: NoticeAudience
  date: string
  author: string
  createdAt: string
  updatedAt: string
}

export interface NoticeFilters {
  searchTerm?: string
  category?: NoticeCategory
  audience?: NoticeAudience
  page?: number
  limit?: number
}

export interface NoticesResult {
  data: ServerNotice[]
  meta: { page: number; limit: number; total: number }
}

export interface CreateNoticePayload {
  title: string
  content: string
  category?: NoticeCategory
  audience?: NoticeAudience
  date?: string
  author: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET /api/notices
 * Public — no auth required.
 */
export async function getNotices(filters: NoticeFilters = {}): Promise<NoticesResult> {
  const params = new URLSearchParams()
  if (filters.searchTerm) params.set('searchTerm', filters.searchTerm)
  if (filters.category)   params.set('category', filters.category)
  if (filters.audience)   params.set('audience', filters.audience)
  if (filters.page)       params.set('page', String(filters.page))
  if (filters.limit)      params.set('limit', String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerNotice[]>(`/notices${query ? `?${query}` : ''}`)

  return {
    data: res.data ?? [],
    meta: res.meta ?? { page: 1, limit: 10, total: 0 },
  }
}

/**
 * Shorthand: fetch public notices (audience = all or students).
 */
export async function getPublicNotices(limit = 50): Promise<ServerNotice[]> {
  // Fetch a large set and filter client-side since server supports audience filter
  const result = await getNotices({ limit })
  return result.data
    .filter((n) => n.audience === 'all' || n.audience === 'students')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * GET /api/notices/:id
 */
export async function getNotice(id: string): Promise<ServerNotice> {
  const res = await apiGet<ServerNotice>(`/notices/${id}`)
  return res.data
}

/**
 * POST /api/notices — ADMIN only.
 */
export async function createNotice(payload: CreateNoticePayload): Promise<ServerNotice> {
  const res = await apiPost<ServerNotice>('/notices', payload)
  return res.data
}

/**
 * PUT /api/notices/:id — ADMIN only.
 */
export async function updateNotice(
  id: string,
  payload: Partial<CreateNoticePayload>,
): Promise<ServerNotice> {
  const res = await apiPut<ServerNotice>(`/notices/${id}`, payload)
  return res.data
}

/**
 * DELETE /api/notices/:id — ADMIN only.
 */
export async function deleteNotice(id: string): Promise<void> {
  await apiDelete<null>(`/notices/${id}`)
}
