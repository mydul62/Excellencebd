import { apiGet, apiFetchFormData, apiDelete } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServerPaymentMethod {
  id: string
  name: string
  accountNumber: string
  accountName: string
  accountType: string
  instructions: string | null
  logo: string | null
  /** Resolved Cloudinary URL — returned by the service's withLogoUrl() helper */
  logoUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PaymentMethodsResult {
  data: ServerPaymentMethod[]
  meta: { page: number; limit: number; total: number }
}

export interface CreatePaymentMethodPayload {
  name: string
  accountNumber: string
  accountName: string
  accountType: string
  instructions?: string
  isActive?: boolean
  logo?: File
}

export interface UpdatePaymentMethodPayload {
  name?: string
  accountNumber?: string
  accountName?: string
  accountType?: string
  instructions?: string
  isActive?: boolean
  logo?: File
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET /api/payment-methods/active
 * Authenticated — ADMIN, STUDENT, TEACHER.
 * Returns only isActive=true payment methods (what students see when enrolling).
 */
export async function getActivePaymentMethods(): Promise<ServerPaymentMethod[]> {
  const res = await apiGet<ServerPaymentMethod[]>('/payment-methods/active')
  return res.data ?? []
}

/**
 * GET /api/payment-methods
 * ADMIN only — returns all payment methods including inactive ones.
 */
export async function getAllPaymentMethods(filters: {
  isActive?: boolean
  page?: number
  limit?: number
} = {}): Promise<PaymentMethodsResult> {
  const params = new URLSearchParams()
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive))
  if (filters.page)  params.set('page',  String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  const query = params.toString()
  const res = await apiGet<ServerPaymentMethod[]>(`/payment-methods${query ? `?${query}` : ''}`)
  return {
    data: res.data ?? [],
    meta: res.meta ?? { page: 1, limit: 20, total: 0 },
  }
}

/**
 * GET /api/payment-methods/:id
 * ADMIN, STUDENT, TEACHER.
 */
export async function getPaymentMethod(id: string): Promise<ServerPaymentMethod> {
  const res = await apiGet<ServerPaymentMethod>(`/payment-methods/${id}`)
  return res.data
}

/**
 * POST /api/payment-methods — ADMIN only.
 * Sends multipart/form-data so the logo file can be uploaded.
 */
export async function createPaymentMethod(
  payload: CreatePaymentMethodPayload,
): Promise<ServerPaymentMethod> {
  const form = new FormData()
  form.append('name',          payload.name)
  form.append('accountNumber', payload.accountNumber)
  form.append('accountName',   payload.accountName)
  form.append('accountType',   payload.accountType)
  if (payload.instructions) form.append('instructions', payload.instructions)
  form.append('isActive', String(payload.isActive ?? true))
  if (payload.logo) form.append('logo', payload.logo)

  const res = await apiFetchFormData<ServerPaymentMethod>('/payment-methods', 'POST', form)
  return res.data
}

/**
 * PATCH /api/payment-methods/:id — ADMIN only.
 * Sends multipart/form-data so a new logo can optionally be uploaded.
 */
export async function updatePaymentMethod(
  id: string,
  payload: UpdatePaymentMethodPayload,
): Promise<ServerPaymentMethod> {
  const form = new FormData()
  if (payload.name !== undefined)          form.append('name',          payload.name)
  if (payload.accountNumber !== undefined) form.append('accountNumber', payload.accountNumber)
  if (payload.accountName !== undefined)   form.append('accountName',   payload.accountName)
  if (payload.accountType !== undefined)   form.append('accountType',   payload.accountType)
  if (payload.instructions !== undefined)  form.append('instructions',  payload.instructions)
  if (payload.isActive !== undefined)      form.append('isActive',      String(payload.isActive))
  if (payload.logo)                        form.append('logo',          payload.logo)

  const res = await apiFetchFormData<ServerPaymentMethod>(`/payment-methods/${id}`, 'PATCH', form)
  return res.data
}

/**
 * Toggle isActive only (no file needed) — ADMIN only.
 */
export async function togglePaymentMethodActive(
  id: string,
  isActive: boolean,
): Promise<ServerPaymentMethod> {
  const form = new FormData()
  form.append('isActive', String(isActive))
  const res = await apiFetchFormData<ServerPaymentMethod>(`/payment-methods/${id}`, 'PATCH', form)
  return res.data
}

/**
 * DELETE /api/payment-methods/:id — ADMIN only.
 */
export async function deletePaymentMethod(id: string): Promise<void> {
  await apiDelete<null>(`/payment-methods/${id}`)
}
