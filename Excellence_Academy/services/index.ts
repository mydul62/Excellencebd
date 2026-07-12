import { courses } from '@/data/courses'
import { teachers } from '@/data/teachers'
import { students } from '@/data/students'
import { enrollments } from '@/data/enrollments'
import { notices } from '@/data/notices'
import { reviews } from '@/data/reviews'
import type {
  Course,
  Enrollment,
  Notice,
  NoticeAudience,
  Review,
  Student,
  Teacher,
} from '@/types'

/**
 * Simulated latency so the UI exercises loading states.
 * Swap the bodies of these functions with real fetch() calls to connect a backend.
 */
const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms))

/* ----------------------------- Enriched types ----------------------------- */

export interface CourseWithTeacher extends Course {
  teacher: Teacher | undefined
}

export interface EnrollmentDetail extends Enrollment {
  student: Student | undefined
  course: Course | undefined
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
  teacher: Teacher | undefined
  courses: CourseWithTeacher[]
  totalStudents: number
  notices: Notice[]
  courseStudentCounts: { course: string; students: number }[]
}

export interface StudentDashboardData {
  student: Student | undefined
  enrollments: EnrollmentDetail[]
  approvedCount: number
  pendingCount: number
  dueAmount: number
  notices: Notice[]
}

/* --------------------------------- Helpers -------------------------------- */

function enrichCourse(course: Course): CourseWithTeacher {
  return { ...course, teacher: teachers.find((t) => t.id === course.teacherId) }
}

function enrichEnrollment(e: Enrollment): EnrollmentDetail {
  return {
    ...e,
    student: students.find((s) => s.id === e.studentId),
    course: courses.find((c) => c.id === e.courseId),
  }
}

/* ------------------------------- Courses ---------------------------------- */

export async function getCourses(): Promise<CourseWithTeacher[]> {
  await delay()
  return courses.map(enrichCourse)
}

export async function getCourseBySlug(slug: string): Promise<CourseWithTeacher | undefined> {
  await delay(300)
  const course = courses.find((c) => c.slug === slug)
  return course ? enrichCourse(course) : undefined
}

/* ------------------------------- Teachers --------------------------------- */

export async function getTeachers(): Promise<Teacher[]> {
  await delay()
  return teachers
}

export async function getTeacherById(id: string): Promise<Teacher | undefined> {
  await delay(300)
  return teachers.find((t) => t.id === id)
}

/* ------------------------------- Students --------------------------------- */

export async function getStudents(): Promise<Student[]> {
  await delay()
  return students
}

/* ------------------------------ Enrollments ------------------------------- */

export async function getEnrollments(): Promise<EnrollmentDetail[]> {
  await delay()
  return enrollments.map(enrichEnrollment)
}

/* -------------------------------- Notices --------------------------------- */

export async function getNotices(audience?: NoticeAudience): Promise<Notice[]> {
  await delay()
  const sorted = [...notices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  if (!audience || audience === 'all') return sorted
  return sorted.filter((n) => n.audience === 'all' || n.audience === audience)
}

/* -------------------------------- Reviews --------------------------------- */

export async function getReviews(): Promise<Review[]> {
  await delay(300)
  return reviews
}

/* ------------------------------ Admin stats ------------------------------- */

export async function getAdminStats(): Promise<AdminStats> {
  await delay()
  return {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalCourses: courses.length,
    totalEnrollments: enrollments.length,
    totalRevenue: enrollments.reduce((sum, e) => sum + e.amountPaid, 0),
    pendingEnrollments: enrollments.filter((e) => e.status === 'pending').length,
  }
}

export async function getEnrollmentTrend(): Promise<TrendPoint[]> {
  await delay()
  const buckets = new Map<string, number>()
  const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  order.forEach((m) => buckets.set(m, 0))
  enrollments.forEach((e) => {
    const m = new Date(e.enrolledAt).toLocaleDateString('en-US', { month: 'short' })
    if (buckets.has(m)) buckets.set(m, (buckets.get(m) ?? 0) + 1)
  })
  return order.map((month) => ({ month, enrollments: buckets.get(month) ?? 0 }))
}

export async function getCourseStats(): Promise<CourseStat[]> {
  await delay()
  return courses
    .map((c) => ({
      course: c.title,
      students: enrollments.filter((e) => e.courseId === c.id).length,
    }))
    .filter((s) => s.students > 0)
    .sort((a, b) => b.students - a.students)
    .slice(0, 6)
}

export async function getRecentStudents(limit = 5): Promise<Student[]> {
  await delay()
  return [...students]
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
    .slice(0, limit)
}

export async function getRecentEnrollments(limit = 5): Promise<EnrollmentDetail[]> {
  await delay()
  return [...enrollments]
    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
    .slice(0, limit)
    .map(enrichEnrollment)
}

/* --------------------------- Teacher dashboard ---------------------------- */

export async function getTeacherDashboard(teacherId: string): Promise<TeacherDashboardData> {
  await delay()
  const teacher = teachers.find((t) => t.id === teacherId)
  const teacherCourses = courses
    .filter((c) => c.teacherId === teacherId)
    .map(enrichCourse)
  const courseIds = teacherCourses.map((c) => c.id)
  const relevantEnrollments = enrollments.filter((e) => courseIds.includes(e.courseId))
  const uniqueStudents = new Set(relevantEnrollments.map((e) => e.studentId))
  const courseStudentCounts = teacherCourses.map((c) => ({
    course: c.title,
    students: enrollments.filter((e) => e.courseId === c.id).length,
  }))
  const teacherNotices = [...notices]
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

/* --------------------------- Student dashboard ---------------------------- */

export async function getStudentDashboard(studentId: string): Promise<StudentDashboardData> {
  await delay()
  const student = students.find((s) => s.id === studentId)
  const studentEnrollments = enrollments
    .filter((e) => e.studentId === studentId)
    .map(enrichEnrollment)
  const approvedCount = studentEnrollments.filter((e) => e.status === 'approved').length
  const pendingCount = studentEnrollments.filter((e) => e.status === 'pending').length
  const dueAmount = studentEnrollments.reduce((sum, e) => {
    const price = e.course?.price ?? 0
    return sum + Math.max(price - e.amountPaid, 0)
  }, 0)
  const studentNotices = [...notices]
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
