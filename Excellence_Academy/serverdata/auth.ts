import { apiFetch, apiPost } from './api'

// ─── Server-side types ────────────────────────────────────────────────────────

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

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
  avatar?: string | null
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface AuthLoginResponse {
  user: ServerUser
  accessToken: string
}

export interface AuthRegisterResponse {
  user: ServerUser
  accessToken: string
}

// ─── Token storage helpers ────────────────────────────────────────────────────

const TOKEN_KEY = 'bf_access_token'

export function saveAccessToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

export function clearAccessToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Returns user + accessToken. Refresh token is set as httpOnly cookie by the server.
 */
export async function loginApi(payload: LoginPayload): Promise<AuthLoginResponse> {
  const res = await apiPost<AuthLoginResponse>('/auth/login', payload)
  return res.data
}

/**
 * POST /api/auth/register
 * Always creates a STUDENT account.
 */
export async function registerApi(payload: RegisterPayload): Promise<AuthRegisterResponse> {
  const res = await apiPost<AuthRegisterResponse>('/auth/register', payload)
  return res.data
}

/**
 * POST /api/auth/refresh-token
 * Uses the httpOnly refreshToken cookie automatically (credentials: 'include').
 */
export async function refreshTokenApi(): Promise<{ accessToken: string }> {
  const res = await apiFetch<{ accessToken: string }>('/auth/refresh-token', {
    method: 'POST',
  })
  return res.data
}

/**
 * POST /api/auth/change-password
 * Requires a valid access token in localStorage.
 */
export async function changePasswordApi(payload: ChangePasswordPayload): Promise<void> {
  await apiPost<null>('/auth/change-password', payload)
}
