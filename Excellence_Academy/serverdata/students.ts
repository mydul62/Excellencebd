import { apiGet, apiPost, apiPut, apiDelete } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServerStudentProfile {
  id: string
  userId: string
  address: string | null
  gender: string | null
  dateOfBirth: string | null
  department: string | null
  subject: string | null
  bloodGroup: string | null
  emergencyContact: string | null
}

export interface ServerStudent {
  id: string                     // User ID (backend maps id → userId)
  studentProfileId: string       // Student table PK
  name: string
  email: string
  avatar: string | null
  phone: string | null
  role: string
  createdAt: string
  updatedAt: string
  guardian: string | null
  address: string | null
  status: string
  profile: ServerStudentProfile | null
}

export interface StudentFilters {
  searchTerm?: string
  status?: string
  email?: string
  page?: number
  limit?: number
}

export interface StudentsResult {
  data: ServerStudent[]
  meta: { page: number; limit: number; total: number }
}

export interface CreateStudentPayload {
  name: string
  email: string
  password: string
  phone?: string
  avatar?: string
  guardian?: string
  address?: string
  status?: string
  gender?: string
  dateOfBirth?: string
  bloodGroup?: string
  emergencyContact?: string
  department?: string
  subject?: string
}

export interface UpdateStudentPayload {
  name?: string
  phone?: string
  avatar?: string
  guardian?: string
  address?: string
  status?: string
  gender?: string
  dateOfBirth?: string
  bloodGroup?: string
  emergencyContact?: string
  department?: string
  subject?: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** GET /api/students — ADMIN only */
export async function getStudentsFromApi(filters: StudentFilters = {}): Promise<StudentsResult> {
  const params = new URLSearchParams()
  if (filters.searchTerm) params.set('searchTerm', filters.searchTerm)
  if (filters.status)     params.set('status', filters.status)
  if (filters.email)      params.set('email', filters.email)
  if (filters.page)       params.set('page', String(filters.page))
  if (filters.limit)      params.set('limit', String(filters.limit))

  const query = params.toString()
  const res = await apiGet<ServerStudent[]>(`/students${query ? `?${query}` : ''}`)
  return { data: res.data ?? [], meta: res.meta ?? { page: 1, limit: 10, total: 0 } }
}

/** GET /api/students/:id — ADMIN, STUDENT, TEACHER */
export async function getStudentById(id: string): Promise<ServerStudent> {
  const res = await apiGet<ServerStudent>(`/students/${id}`)
  return res.data
}

/** POST /api/students — ADMIN only */
export async function createStudent(payload: CreateStudentPayload): Promise<ServerStudent> {
  const res = await apiPost<ServerStudent>('/students', payload)
  return res.data
}

/** PUT /api/students/:id — ADMIN or STUDENT */
export async function updateStudent(
  id: string,
  payload: UpdateStudentPayload,
): Promise<ServerStudent> {
  const res = await apiPut<ServerStudent>(`/students/${id}`, payload)
  return res.data
}

/** DELETE /api/students/:id — ADMIN only */
export async function deleteStudent(id: string): Promise<void> {
  await apiDelete<null>(`/students/${id}`)
}
