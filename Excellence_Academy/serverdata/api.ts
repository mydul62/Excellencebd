/**
 * Base API helper — thin wrapper around fetch.
 * Works in both server components (Node) and client components (browser).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'

export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('bf_access_token')
  } catch {
    return null
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // send cookies (refreshToken)
  })

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`
    try {
      const err = await res.json()
      message = err?.message ?? message
    } catch {
      // ignore parse error
    }
    throw new Error(message)
  }

  return res.json() as Promise<ApiResponse<T>>
}

/** GET helper */
export function apiGet<T>(path: string) {
  return apiFetch<T>(path, { method: 'GET' })
}

/** POST helper */
export function apiPost<T>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** PUT helper */
export function apiPut<T>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

/** PATCH helper */
export function apiPatch<T>(path: string, body: unknown) {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

/** DELETE helper */
export function apiDelete<T>(path: string) {
  return apiFetch<T>(path, { method: 'DELETE' })
}

/**
 * Multipart/form-data fetch helper.
 * Do NOT pass Content-Type — the browser sets it automatically with the correct
 * boundary when body is a FormData instance.
 */
export async function apiFetchFormData<T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH',
  body: FormData,
): Promise<ApiResponse<T>> {
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
    let message = `Request failed: ${res.status} ${res.statusText}`
    try {
      const err = await res.json()
      message = err?.message ?? message
    } catch {
      // ignore parse error
    }
    throw new Error(message)
  }

  return res.json() as Promise<ApiResponse<T>>
}
