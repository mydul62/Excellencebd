/**
 * Avatar upload utility.
 *
 * The backend's user / admin profile endpoints only accept JSON (no multer).
 * To upload a real image file we use a two-step approach:
 *
 *   1. POST the file to /photo-gallery (which has multer + Cloudinary) to
 *      receive a Cloudinary-hosted URL.
 *   2. PUT that URL as the `avatar` field on the user/admin profile endpoint.
 *
 * This keeps all Cloudinary work on the backend and never touches the frontend
 * directly — exactly as required.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('bf_access_token')
  } catch {
    return null
  }
}

async function multipartFetch<T>(path: string, method: 'POST' | 'PUT', body: FormData): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    body,
    headers,
    credentials: 'include',
  })

  if (!res.ok) {
    let message = `Upload failed: ${res.status} ${res.statusText}`
    try {
      const err = await res.json()
      message = err?.message ?? message
    } catch { /* ignore */ }
    throw new Error(message)
  }

  const json = await res.json()
  return json as T
}

/**
 * Upload an avatar image file and return the Cloudinary URL.
 *
 * Sends the file to the existing POST /photo-gallery endpoint (which handles
 * multer + Cloudinary), then retrieves the imageUrl from the first uploaded
 * item.
 */
export async function uploadAvatarToCloudinary(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('images', file)           // field name expected by POST /photo-gallery
  fd.append('title', 'Avatar upload') // title is optional; backend accepts null
  fd.append('category', 'avatars')

  const result = await multipartFetch<{ success: boolean; data: Array<{ imageUrl: string; id: string }> }>(
    '/photo-gallery',
    'POST',
    fd,
  )

  const url = result?.data?.[0]?.imageUrl
  if (!url) throw new Error('No image URL returned from upload.')
  return url
}
