// ─── NOTE ─────────────────────────────────────────────────────────────────────
// ⚠️  MISSING ENDPOINT: The server (Accellence_server) has no /api/events route.
//     These functions will throw until the backend implements it.
//     To add: create src/modules/events in Accellence_server with the standard
//     CRUD pattern and register it in src/app/routers/index.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { apiGet, apiPost, apiPut, apiDelete } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServerEvent {
  id: string
  title: string
  description: string
  date: string
  location: string
  coverImage: string | null
  audience: 'all' | 'students' | 'teachers' | 'parents'
  category: string
  createdAt: string
  updatedAt: string
}

export interface EventFilters {
  searchTerm?: string
  audience?: string
  category?: string
  page?: number
  limit?: number
}

export interface EventsResult {
  data: ServerEvent[]
  meta: { page: number; limit: number; total: number }
}

export interface CreateEventPayload {
  title: string
  description: string
  date: string
  location: string
  coverImage?: string
  audience?: 'all' | 'students' | 'teachers' | 'parents'
  category?: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** GET /api/events */
export async function getEvents(filters: EventFilters = {}): Promise<EventsResult> {
  const params = new URLSearchParams()
  if (filters.searchTerm) params.set('searchTerm', filters.searchTerm)
  if (filters.audience)   params.set('audience', filters.audience)
  if (filters.category)   params.set('category', filters.category)
  if (filters.page)       params.set('page', String(filters.page))
  if (filters.limit)      params.set('limit', String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerEvent[]>(`/events${query ? `?${query}` : ''}`)

  return {
    data: res.data ?? [],
    meta: res.meta ?? { page: 1, limit: 10, total: 0 },
  }
}

/** GET /api/events/:id */
export async function getEvent(id: string): Promise<ServerEvent> {
  const res = await apiGet<ServerEvent>(`/events/${id}`)
  return res.data
}

/** POST /api/events — ADMIN only */
export async function createEvent(payload: CreateEventPayload): Promise<ServerEvent> {
  const res = await apiPost<ServerEvent>('/events', payload)
  return res.data
}

/** PUT /api/events/:id — ADMIN only */
export async function updateEvent(
  id: string,
  payload: Partial<CreateEventPayload>,
): Promise<ServerEvent> {
  const res = await apiPut<ServerEvent>(`/events/${id}`, payload)
  return res.data
}

/** DELETE /api/events/:id — ADMIN only */
export async function deleteEvent(id: string): Promise<void> {
  await apiDelete<null>(`/events/${id}`)
}
