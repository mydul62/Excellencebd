import { apiGet, apiPost } from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface ServerAttendanceCourse {
  id: string
  title: string
  slug: string
  category: string
}

export interface ServerAttendanceStudent {
  id: string
  name: string
  email: string
}

export interface ServerAttendance {
  id: string
  studentId: string
  courseId: string
  date: string
  status: AttendanceStatus
  createdAt: string
  updatedAt: string
  course: ServerAttendanceCourse | null
  student: ServerAttendanceStudent | null
}

export interface CreateAttendancePayload {
  studentId: string   // User ID of the student
  courseId: string
  date: string        // ISO date string  e.g. "2024-07-15"
  status: AttendanceStatus
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * POST /api/attendance — ADMIN or TEACHER only
 */
export async function createAttendance(
  payload: CreateAttendancePayload,
): Promise<ServerAttendance> {
  const res = await apiPost<ServerAttendance>('/attendance', payload)
  return res.data
}

/**
 * GET /api/attendance/student/:studentId — ADMIN, TEACHER, STUDENT
 */
export async function getStudentAttendance(studentId: string): Promise<ServerAttendance[]> {
  const res = await apiGet<ServerAttendance[]>(`/attendance/student/${studentId}`)
  return res.data ?? []
}
