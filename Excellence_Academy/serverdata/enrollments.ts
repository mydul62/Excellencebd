import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected'
export type PaymentStatus    = 'unpaid'  | 'paid'     | 'partial'

export interface ServerEnrollmentUser {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
}

export interface ServerEnrollmentCourse {
  id: string
  title: string
  slug: string
  category: string
  price: number
  icon: string | null
  level: string
  duration: string
  seats: number
  rating: number
  description: string
  teacherId: string | null
}

export interface ServerEnrollment {
  id: string
  userId: string
  courseId: string
  name: string
  email: string
  phone: string
  paymentMethod: string
  transactionId: string
  notes: string | null
  screenshotUrl: string | null
  status: EnrollmentStatus
  paymentStatus: PaymentStatus
  amountPaid: number
  enrolledAt: string
  createdAt: string
  updatedAt: string
  user: ServerEnrollmentUser
  course: ServerEnrollmentCourse
}

export interface EnrollmentCheckResult {
  enrolled: boolean
  enrollment: { id: string; status: EnrollmentStatus; paymentStatus: PaymentStatus } | null
}

export interface EnrollmentFilters {
  status?: EnrollmentStatus
  paymentStatus?: PaymentStatus
  userId?: string
  courseId?: string
  paymentMethod?: string
  page?: number
  limit?: number
}

export interface EnrollmentsResult {
  data: ServerEnrollment[]
  meta: { page: number; limit: number; total: number }
}

export interface CreateEnrollmentPayload {
  userId: string
  courseId: string
  name: string
  email: string
  phone: string
  paymentMethod: string
  transactionId: string
  notes?: string
  screenshotUrl?: string
}

export interface UpdateEnrollmentPayload {
  status?: EnrollmentStatus
  paymentStatus?: PaymentStatus
  amountPaid?: number
  notes?: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** GET /api/admin/enrollments — ADMIN only */
export async function getAdminEnrollments(filters: EnrollmentFilters = {}): Promise<EnrollmentsResult> {
  const params = new URLSearchParams()
  if (filters.status)        params.set('status', filters.status)
  if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus)
  if (filters.userId)        params.set('userId', filters.userId)
  if (filters.courseId)      params.set('courseId', filters.courseId)
  if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod)
  if (filters.page)          params.set('page', String(filters.page))
  if (filters.limit)         params.set('limit', String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerEnrollment[]>(`/admin/enrollments${query ? `?${query}` : ''}`)
  return { data: res.data ?? [], meta: res.meta ?? { page: 1, limit: 10, total: 0 } }
}

/** GET /api/enrollments — ADMIN only */
export async function getEnrollments(filters: EnrollmentFilters = {}): Promise<EnrollmentsResult> {
  const params = new URLSearchParams()
  if (filters.status)        params.set('status', filters.status)
  if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus)
  if (filters.userId)        params.set('userId', filters.userId)
  if (filters.courseId)      params.set('courseId', filters.courseId)
  if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod)
  if (filters.page)          params.set('page', String(filters.page))
  if (filters.limit)         params.set('limit', String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerEnrollment[]>(`/enrollments${query ? `?${query}` : ''}`)
  return { data: res.data ?? [], meta: res.meta ?? { page: 1, limit: 10, total: 0 } }
}

/** GET /api/enrollments/mine — logged-in user's own enrollments (STUDENT/ADMIN/TEACHER) */
export async function getMyEnrollments(filters: Omit<EnrollmentFilters, 'userId'> = {}): Promise<EnrollmentsResult> {
  const params = new URLSearchParams()
  if (filters.status)        params.set('status', filters.status)
  if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus)
  if (filters.page)          params.set('page', String(filters.page))
  if (filters.limit)         params.set('limit', String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerEnrollment[]>(`/enrollments/mine${query ? `?${query}` : ''}`)
  return { data: res.data ?? [], meta: res.meta ?? { page: 1, limit: 10, total: 0 } }
}

/** GET /api/enrollments/check/:courseId — check if logged-in user is enrolled */
export async function checkEnrollment(courseId: string): Promise<EnrollmentCheckResult> {
  const res = await apiGet<EnrollmentCheckResult>(`/enrollments/check/${courseId}`)
  return res.data
}

/** GET /api/admin/enrollments/:id — ADMIN only */
export async function getAdminEnrollment(id: string): Promise<ServerEnrollment> {
  const res = await apiGet<ServerEnrollment>(`/admin/enrollments/${id}`)
  return res.data
}

/** GET /api/enrollments/:id — ADMIN, STUDENT, or TEACHER */
export async function getEnrollment(id: string): Promise<ServerEnrollment> {
  const res = await apiGet<ServerEnrollment>(`/enrollments/${id}`)
  return res.data
}

/** POST /api/enrollments — ADMIN or STUDENT */
export async function createEnrollment(payload: CreateEnrollmentPayload): Promise<ServerEnrollment> {
  const res = await apiPost<ServerEnrollment>('/enrollments', payload)
  return res.data
}

/** PUT /api/enrollments/:id — ADMIN only */
export async function updateEnrollment(id: string, payload: UpdateEnrollmentPayload): Promise<ServerEnrollment> {
  const res = await apiPut<ServerEnrollment>(`/enrollments/${id}`, payload)
  return res.data
}

/** PATCH /api/admin/enrollments/:id/approve — ADMIN only */
export async function approveEnrollment(id: string, reason?: string): Promise<ServerEnrollment> {
  const res = await apiPatch<ServerEnrollment>(`/admin/enrollments/${id}/approve`, reason ? { reason } : {})
  return res.data
}

/** PATCH /api/admin/enrollments/:id/reject — ADMIN only */
export async function rejectEnrollment(id: string, reason?: string): Promise<ServerEnrollment> {
  const res = await apiPatch<ServerEnrollment>(`/admin/enrollments/${id}/reject`, reason ? { reason } : {})
  return res.data
}

/** DELETE /api/enrollments/:id — ADMIN only */
export async function deleteEnrollment(id: string): Promise<void> {
  await apiDelete<null>(`/enrollments/${id}`)
}
