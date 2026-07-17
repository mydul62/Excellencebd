import { apiDelete, apiGet, apiPost, apiPut } from './api'

export interface ServerPhotoGalleryItem {
  id: string
  title: string | null
  description: string | null
  category: string
  imageUrl: string
  publicId: string
  createdAt: string
  updatedAt: string
}

export interface PhotoGalleryFilters {
  searchTerm?: string
  category?: string
  page?: number
  limit?: number
}

export interface PhotoGalleryResult {
  data: ServerPhotoGalleryItem[]
  meta: { page: number; limit: number; total: number }
}

export async function getPhotoGallery(filters: PhotoGalleryFilters = {}): Promise<PhotoGalleryResult> {
  const params = new URLSearchParams()
  if (filters.searchTerm) params.set('searchTerm', filters.searchTerm)
  if (filters.category) params.set('category', filters.category)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerPhotoGalleryItem[]>(`/photo-gallery${query ? `?${query}` : ''}`)

  return {
    data: res.data ?? [],
    meta: res.meta ?? { page: 1, limit: 12, total: 0 },
  }
}

export async function getPhotoGalleryItem(id: string): Promise<ServerPhotoGalleryItem> {
  const res = await apiGet<ServerPhotoGalleryItem>(`/photo-gallery/${id}`)
  return res.data
}

export async function createPhotoGallery(payload: FormData): Promise<ServerPhotoGalleryItem[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bf_access_token') : null

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/photo-gallery`, {
    method: 'POST',
    body: payload,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.message ?? 'Failed to upload photo')
  }

  const data = await res.json()
  return data.data
}

export async function updatePhotoGallery(id: string, payload: FormData): Promise<ServerPhotoGalleryItem> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bf_access_token') : null

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/photo-gallery/${id}`, {
    method: 'PUT',
    body: payload,
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.message ?? 'Failed to update photo')
  }

  const data = await res.json()
  return data.data
}

export async function deletePhotoGallery(id: string): Promise<void> {
  await apiDelete<null>(`/photo-gallery/${id}`)
}
