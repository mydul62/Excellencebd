// ─── NOTE ─────────────────────────────────────────────────────────────────────
// ⚠️  MISSING ENDPOINT: The server (Accellence_server) has no /api/blogs route.
//     These functions will throw until the backend implements it.
//     To add: create src/modules/blogs in Accellence_server with the standard
//     CRUD pattern and register it in src/app/routers/index.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { apiGet, apiPost, apiPut, apiDelete } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServerBlog {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage: string | null
  author: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface BlogFilters {
  searchTerm?: string
  tag?: string
  published?: boolean
  page?: number
  limit?: number
}

export interface BlogsResult {
  data: ServerBlog[]
  meta: { page: number; limit: number; total: number }
}

export interface CreateBlogPayload {
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  author: string
  tags?: string[]
  published?: boolean
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** GET /api/blogs */
export async function getBlogs(filters: BlogFilters = {}): Promise<BlogsResult> {
  const params = new URLSearchParams()
  if (filters.searchTerm) params.set('searchTerm', filters.searchTerm)
  if (filters.tag)        params.set('tag', filters.tag)
  if (filters.published !== undefined) params.set('published', String(filters.published))
  if (filters.page)       params.set('page', String(filters.page))
  if (filters.limit)      params.set('limit', String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerBlog[]>(`/blogs${query ? `?${query}` : ''}`)

  return {
    data: res.data ?? [],
    meta: res.meta ?? { page: 1, limit: 10, total: 0 },
  }
}

/** GET /api/blogs/:id */
export async function getBlog(id: string): Promise<ServerBlog> {
  const res = await apiGet<ServerBlog>(`/blogs/${id}`)
  return res.data
}

/** POST /api/blogs — ADMIN only */
export async function createBlog(payload: CreateBlogPayload): Promise<ServerBlog> {
  const res = await apiPost<ServerBlog>('/blogs', payload)
  return res.data
}

/** PUT /api/blogs/:id — ADMIN only */
export async function updateBlog(
  id: string,
  payload: Partial<CreateBlogPayload>,
): Promise<ServerBlog> {
  const res = await apiPut<ServerBlog>(`/blogs/${id}`, payload)
  return res.data
}

/** DELETE /api/blogs/:id — ADMIN only */
export async function deleteBlog(id: string): Promise<void> {
  await apiDelete<null>(`/blogs/${id}`)
}
