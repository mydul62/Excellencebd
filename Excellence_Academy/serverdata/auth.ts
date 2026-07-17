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
}

export interface AuthRegisterResponse {
  user: ServerUser
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function loginApi(
  payload: LoginPayload
): Promise<AuthLoginResponse> {
  const res = await apiPost<AuthLoginResponse>('/auth/login', payload)
  return res.data
}

export async function registerApi(
  payload: RegisterPayload
): Promise<AuthRegisterResponse> {
  const res = await apiPost<AuthRegisterResponse>('/auth/register', payload)
  return res.data
}

export async function refreshTokenApi(): Promise<void> {
  await apiFetch('/auth/refresh-token', {
    method: 'POST',
  })
}

export async function changePasswordApi(
  payload: ChangePasswordPayload
): Promise<void> {
  await apiPost('/auth/change-password', payload)
}