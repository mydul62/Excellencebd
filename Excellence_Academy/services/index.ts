/**
 * services/index.ts
 * ─────────────────
 * All data-fetching functions used by pages and components.
 * Previously used static dummy data — now calls the real Accellence_server API
 * via the serverdata layer.
 */

import {
  getCourses as apiGetCourses,
  getPopularCourses as apiGetPopularCourses,
  type ServerCourse,
} from '@/serverdata/courses'
import {
  getTeachers as apiGetTeachers,
  getMyTeacherProfile as apiGetMyTeacherProfile,
  getMyCourses as apiGetMyCourses,
  getMyStudents as apiGetMyStudents,
  type ServerTeacher,
} from '@/serverdata/teachers'
import {
  getUsers as apiGetUsers,
  type ServerUser,
} from '@/serverdata/users'
import {
  getEnrollments as apiGetEnrollments,
  getMyEnrollments as apiGetMyEnrollments,
  type ServerEnrollment,
} from '@/serverdata/enrollments'
import {
  getNotices as apiGetNotices,
  type ServerNotice,
  type NoticeAudience,
} from '@/serverdata/notices'
import {
  getReviews as apiGetReviews,
  type ServerReview,
} from '@/serverdata/testimonials'

// ─── Re-exported server types used by consumers ───────────────────────────────

export type { ServerCourse, ServerTeacher, ServerUser, ServerEnrollment, ServerNotice, ServerReview }

// ─── Enriched / derived types (kept for backward compat with existing pages) ──

export interface CourseWithTeacher extends ServerCourse {
  teacher: ServerTeacher | undefined
}

export interface EnrollmentDetail extends ServerEnrollment {
  // user and course are already included from the server
}

export interface AdminStats {
  totalStudents: number
  totalTeachers: number
  totalCourses: number
  totalEnrollments: number
  totalRevenue: number
  pendingEnrollments: number
}

export interface TrendPoint {
  month: string
  enrollments: number
}

export interface CourseStat {
  course: string
  students: number
}

export interface TeacherDashboardData {
  teacher: ServerTeacher | undefined
  courses: CourseWithTeacher[]
  totalStudents: number
  notices: ServerNotice[]
  courseStudentCounts: { course: string; students: number }[]
}

export interface StudentDashboardData {
  student: ServerUser | undefined
  enrollments: EnrollmentDetail[]
  approvedCount: number
  pendingCount: number
  dueAmount: number
  notices: ServerNotice[]
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export async function getCourses(): Promise<CourseWithTeacher[]> {
  const result = await apiGetCourses({ limit: 100 })
  // Teacher detail is not included in the list endpoint — attach undefined for now
  return result.data.map((c) => ({ ...c, teacher: undefined }))
}

export async function getCourseBySlug(slug: string): Promise<CourseWithTeacher | undefined> {
  const result = await apiGetCourses({ limit: 100 })
  const course = result.data.find((c) => c.slug === slug)
  return course ? { ...course, teacher: undefined } : undefined
}

// ─── Teachers ─────────────────────────────────────────────────────────────────

export async function getTeachers(): Promise<ServerTeacher[]> {
  const result = await apiGetTeachers({ limit: 100 })
  return result.data
}

export async function getTeacherById(id: string): Promise<ServerTeacher | undefined> {
  const result = await apiGetTeachers({ limit: 100 })
  return result.data.find((t) => t.id === id)
}

// ─── Students (users with STUDENT role) ───────────────────────────────────────

export async function getStudents(): Promise<ServerUser[]> {
  const result = await apiGetUsers({ role: 'STUDENT', limit: 100 })
  return result.data
}

// ─── Enrollments ──────────────────────────────────────────────────────────────

export async function getEnrollments(): Promise<EnrollmentDetail[]> {
  const result = await apiGetEnrollments({ limit: 100 })
  return result.data
}

// ─── Notices ─────────────────────────────────────────────────────────────────

export async function getNotices(audience?: NoticeAudience): Promise<ServerNotice[]> {
  const result = await apiGetNotices({ limit: 100 })
  const sorted = [...result.data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  if (!audience || audience === 'all') return sorted
  return sorted.filter((n) => n.audience === 'all' || n.audience === audience)
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function getReviews(): Promise<ServerReview[]> {
  const result = await apiGetReviews({ limit: 50 })
  return result.data
}

// ─── Admin stats ──────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const [studentsRes, teachersRes, coursesRes, enrollmentsRes] = await Promise.all([
    apiGetUsers({ role: 'STUDENT', limit: 1 }),
    apiGetTeachers({ limit: 1 }),
    apiGetCourses({ limit: 1 }),
    apiGetEnrollments({ limit: 1 }),
  ])

  // Fetch pending enrollments count separately
  const pendingRes = await apiGetEnrollments({ enrollmentStatus: 'pending', limit: 1 })

  // Revenue: sum amountSent across all approved enrollments (fetch full list)
  const allEnrollments = await apiGetEnrollments({ limit: 200 })
  const totalRevenue = allEnrollments.data.reduce((sum, e) => sum + (e.amountSent ?? 0), 0)

  return {
    totalStudents: studentsRes.meta.total,
    totalTeachers: teachersRes.meta.total,
    totalCourses: coursesRes.meta.total,
    totalEnrollments: enrollmentsRes.meta.total,
    totalRevenue,
    pendingEnrollments: pendingRes.meta.total,
  }
}

export async function getEnrollmentTrend(): Promise<TrendPoint[]> {
  const result = await apiGetEnrollments({ limit: 200 })
  const buckets = new Map<string, number>()
  const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  order.forEach((m) => buckets.set(m, 0))
  result.data.forEach((e) => {
    const m = new Date(e.enrolledAt).toLocaleDateString('en-US', { month: 'short' })
    if (buckets.has(m)) buckets.set(m, (buckets.get(m) ?? 0) + 1)
  })
  return order.map((month) => ({ month, enrollments: buckets.get(month) ?? 0 }))
}

export async function getCourseStats(): Promise<CourseStat[]> {
  const [coursesResult, enrollmentsResult] = await Promise.all([
    apiGetCourses({ limit: 100 }),
    apiGetEnrollments({ limit: 200 }),
  ])
  return coursesResult.data
    .map((c) => ({
      course: c.title,
      students: enrollmentsResult.data.filter((e) => e.courseId === c.id).length,
    }))
    .filter((s) => s.students > 0)
    .sort((a, b) => b.students - a.students)
    .slice(0, 6)
}

export async function getRecentStudents(limit = 5): Promise<ServerUser[]> {
  const result = await apiGetUsers({ role: 'STUDENT', limit })
  return result.data
}

export async function getRecentEnrollments(limit = 5): Promise<EnrollmentDetail[]> {
  const result = await apiGetEnrollments({ limit })
  return result.data
}

// ─── Teacher dashboard ────────────────────────────────────────────────────────

export async function getTeacherDashboard(teacherId: string): Promise<TeacherDashboardData> {
  // Use the authenticated endpoint to get teacher profile
  const teacher = await apiGetMyTeacherProfile()
  
  // Use teacher-specific endpoints that don't require ADMIN role
  const [myCourses, myStudents, noticesResult] = await Promise.all([
    apiGetMyCourses(),
    apiGetMyStudents(),
    apiGetNotices({ limit: 50 }),
  ])

  // Transform courses to match CourseWithTeacher interface
  const teacherCourses: CourseWithTeacher[] = myCourses.map((c: any) => ({ 
    ...c, 
    teacher 
  }))

  // Count unique students from the students list
  const uniqueStudents = new Set(myStudents.map((s: any) => s.id))

  // Calculate course student counts from enrollment data
  const courseStudentCounts = teacherCourses.map((c) => {
    const studentsInCourse = myStudents.filter((s: any) => 
      s.enrollments?.some((e: any) => e.course.id === c.id)
    )
    return {
      course: c.title,
      students: studentsInCourse.length,
    }
  })

  const teacherNotices = [...noticesResult.data]
    .filter((n) => n.audience === 'all' || n.audience === 'teachers')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    teacher,
    courses: teacherCourses,
    totalStudents: uniqueStudents.size,
    notices: teacherNotices,
    courseStudentCounts,
  }
}

// ─── Student dashboard ────────────────────────────────────────────────────────

export async function getStudentDashboard(studentId: string): Promise<StudentDashboardData> {
  const [enrollmentsResult, noticesResult] = await Promise.all([
    apiGetMyEnrollments({ limit: 100 }),   // uses /enrollments/mine — no ADMIN needed
    apiGetNotices({ limit: 50 }),
  ])

  // Fetch the student's own profile
  let student: ServerUser | undefined
  try {
    const { getUser } = await import('@/serverdata/users')
    student = await getUser(studentId)
  } catch {
    student = undefined
  }

  const studentEnrollments = enrollmentsResult.data

  const approvedCount = studentEnrollments.filter((e) => e.enrollmentStatus === 'approved').length
  const pendingCount  = studentEnrollments.filter((e) => e.enrollmentStatus === 'pending').length
  const dueAmount     = studentEnrollments.reduce((sum, e) => {
    const fee = e.courseFee ?? e.course?.price ?? 0
    return sum + Math.max(fee - (e.amountSent ?? 0), 0)
  }, 0)

  const studentNotices = [...noticesResult.data]
    .filter((n) => n.audience === 'all' || n.audience === 'students')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    student,
    enrollments: studentEnrollments,
    approvedCount,
    pendingCount,
    dueAmount,
    notices: studentNotices,
  }
}
