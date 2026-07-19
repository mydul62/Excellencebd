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

export interface ServerEnrollmentPaymentMethod {
  id: string
  name: string
  accountNumber: string
  accountName: string
  accountType: string
  logo: string | null
}

export interface ServerEnrollment {
  id: string
  userId: string
  courseId: string
  paymentMethodId: string
  // payment submission fields
  courseFee: number
  amountSent: number
  senderNumber: string
  transactionId: string
  paymentScreenshot: string | null
  // admin-managed
  paymentStatus: PaymentStatus
  enrollmentStatus: EnrollmentStatus
  rejectionReason: string | null
  enrolledAt: string
  createdAt: string
  updatedAt: string
  // relations
  user: ServerEnrollmentUser
  course: ServerEnrollmentCourse
  paymentMethod: ServerEnrollmentPaymentMethod | null
}

export interface EnrollmentCheckResult {
  enrolled: boolean
  enrollment: {
    id: string
    enrollmentStatus: EnrollmentStatus
    paymentStatus: PaymentStatus
    rejectionReason?: string | null
  } | null
}

export interface EnrollmentFilters {
  enrollmentStatus?: EnrollmentStatus
  paymentStatus?: PaymentStatus
  userId?: string
  courseId?: string
  paymentMethodId?: string
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
  paymentMethodId: string
  courseFee: number
  amountSent: number
  senderNumber: string
  transactionId: string
  paymentScreenshot?: string
}

export interface UpdateEnrollmentPayload {
  paymentStatus?: PaymentStatus
  enrollmentStatus?: EnrollmentStatus
  rejectionReason?: string
}

export interface ResubmitEnrollmentPayload {
  transactionId: string
  senderNumber: string
  amountSent: number
  paymentScreenshot?: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** GET /api/enrollments — ADMIN only, full list with filters */
export async function getAdminEnrollments(filters: EnrollmentFilters = {}): Promise<EnrollmentsResult> {
  return getEnrollments(filters)
}

/** GET /api/enrollments — ADMIN only */
export async function getEnrollments(filters: EnrollmentFilters = {}): Promise<EnrollmentsResult> {
  const params = new URLSearchParams()
  if (filters.enrollmentStatus) params.set('enrollmentStatus', filters.enrollmentStatus)
  if (filters.paymentStatus)    params.set('paymentStatus',    filters.paymentStatus)
  if (filters.userId)           params.set('userId',           filters.userId)
  if (filters.courseId)         params.set('courseId',         filters.courseId)
  if (filters.paymentMethodId)  params.set('paymentMethodId',  filters.paymentMethodId)
  if (filters.page)             params.set('page',             String(filters.page))
  if (filters.limit)            params.set('limit',            String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerEnrollment[]>(`/enrollments${query ? `?${query}` : ''}`)
  return { data: res.data ?? [], meta: res.meta ?? { page: 1, limit: 10, total: 0 } }
}

/** GET /api/enrollments/mine — authenticated user's own enrollments */
export async function getMyEnrollments(
  filters: Omit<EnrollmentFilters, 'userId'> = {},
): Promise<EnrollmentsResult> {
  const params = new URLSearchParams()
  if (filters.enrollmentStatus) params.set('enrollmentStatus', filters.enrollmentStatus)
  if (filters.paymentStatus)    params.set('paymentStatus',    filters.paymentStatus)
  if (filters.page)             params.set('page',             String(filters.page))
  if (filters.limit)            params.set('limit',            String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerEnrollment[]>(`/enrollments/mine${query ? `?${query}` : ''}`)
  return { data: res.data ?? [], meta: res.meta ?? { page: 1, limit: 10, total: 0 } }
}

/** GET /api/enrollments/check/:courseId */
export async function checkEnrollment(courseId: string): Promise<EnrollmentCheckResult> {
  const res = await apiGet<EnrollmentCheckResult>(`/enrollments/check/${courseId}`)
  return res.data
}

/** GET /api/enrollments/:id */
export async function getAdminEnrollment(id: string): Promise<ServerEnrollment> {
  return getEnrollment(id)
}

/** GET /api/enrollments/:id */
export async function getEnrollment(id: string): Promise<ServerEnrollment> {
  const res = await apiGet<ServerEnrollment>(`/enrollments/${id}`)
  return res.data
}

/** POST /api/enrollments */
export async function createEnrollment(payload: CreateEnrollmentPayload): Promise<ServerEnrollment> {
  const res = await apiPost<ServerEnrollment>('/enrollments', payload)
  return res.data
}

/** PUT /api/enrollments/:id — ADMIN manual patch */
export async function updateEnrollment(
  id: string,
  payload: UpdateEnrollmentPayload,
): Promise<ServerEnrollment> {
  const res = await apiPut<ServerEnrollment>(`/enrollments/${id}`, payload)
  return res.data
}

/** PATCH /api/enrollments/:id/approve — ADMIN only */
export async function approveEnrollment(id: string): Promise<ServerEnrollment> {
  const res = await apiPatch<ServerEnrollment>(`/enrollments/${id}/approve`, {})
  return res.data
}

/** PATCH /api/enrollments/:id/reject — ADMIN only, reason required */
export async function rejectEnrollment(id: string, reason: string): Promise<ServerEnrollment> {
  const res = await apiPatch<ServerEnrollment>(`/enrollments/${id}/reject`, { reason })
  return res.data
}

/** PATCH /api/enrollments/:id/resubmit — STUDENT only */
export async function resubmitEnrollment(
  id: string,
  payload: ResubmitEnrollmentPayload,
): Promise<ServerEnrollment> {
  const res = await apiPatch<ServerEnrollment>(`/enrollments/${id}/resubmit`, payload)
  return res.data
}

/** DELETE /api/enrollments/:id — ADMIN only */
export async function deleteEnrollment(id: string): Promise<void> {
  await apiDelete<null>(`/enrollments/${id}`)
}
