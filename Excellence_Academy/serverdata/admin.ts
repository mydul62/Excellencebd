import { apiGet, apiPut } from './api'
import { uploadAvatarToCloudinary } from './avatar-upload'

export type ServerRole = 'ADMIN' | 'STUDENT' | 'TEACHER'

export interface AdminProfile {
  id: string
  name: string
  email: string
  role: ServerRole
  avatar: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
  status: string
}

export interface UpdateAdminProfilePayload {
  name?: string
  /** URL string or a File to upload first */
  avatar?: string | File | null
  phone?: string | null
}

export interface ChangeAdminPasswordPayload {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export async function getAdminProfile(): Promise<AdminProfile> {
  const res = await apiGet<AdminProfile>('/admin/profile')
  return res.data
}

export async function updateAdminProfile(payload: UpdateAdminProfilePayload): Promise<AdminProfile> {
  let avatarUrl: string | null | undefined

  if (payload.avatar instanceof File) {
    avatarUrl = await uploadAvatarToCloudinary(payload.avatar)
  } else {
    avatarUrl = payload.avatar
  }

  const res = await apiPut<AdminProfile>('/admin/profile', {
    name: payload.name,
    phone: payload.phone,
    avatar: avatarUrl,
  })
  return res.data
}

export async function changeAdminPassword(payload: ChangeAdminPasswordPayload): Promise<void> {
  await apiPut<null>('/admin/change-password', payload)
}
