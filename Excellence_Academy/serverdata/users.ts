import { apiGet, apiPut, apiDelete } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServerRole = 'ADMIN' | 'STUDENT' | 'TEACHER'

export interface ServerUser {
  id: string
  name: string
  email: string
  role: ServerRole
  avatar: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
}

export interface UserFilters {
  searchTerm?: string
  role?: ServerRole
  page?: number
  limit?: number
}

export interface UsersResult {
  data: ServerUser[]
  meta: { page: number; limit: number; total: number }
}

export interface UpdateUserPayload {
  name?: string
  avatar?: string
  phone?: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET /api/users — ADMIN only.
 */
export async function getUsers(filters: UserFilters = {}): Promise<UsersResult> {
  const params = new URLSearchParams()
  if (filters.searchTerm) params.set('searchTerm', filters.searchTerm)
  if (filters.role)       params.set('role', filters.role)
  if (filters.page)       params.set('page', String(filters.page))
  if (filters.limit)      params.set('limit', String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerUser[]>(`/users${query ? `?${query}` : ''}`)

  return {
    data: res.data ?? [],
    meta: res.meta ?? { page: 1, limit: 10, total: 0 },
  }
}

/**
 * GET /api/users/:id — ADMIN, STUDENT, or TEACHER (own profile).
 */
export async function getUser(id: string): Promise<ServerUser> {
  const res = await apiGet<ServerUser>(`/users/${id}`)
  return res.data
}

/**
 * PUT /api/users/:id — ADMIN or own account.
 * Note: password and role cannot be changed via this endpoint.
 */
export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<ServerUser> {
  const res = await apiPut<ServerUser>(`/users/${id}`, payload)
  return res.data
}

/**
 * DELETE /api/users/:id — ADMIN only.
 */
export async function deleteUser(id: string): Promise<void> {
  await apiDelete<null>(`/users/${id}`)
}
