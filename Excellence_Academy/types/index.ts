export type Role = 'admin' | 'teacher' | 'student'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  phone?: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string | null
  subject: string
  bio: string
  experienceYears: number
  qualification: string
  courseIds: string[]
  joinedAt: string
}

export type StudentStatus = 'active' | 'inactive'

export interface Student {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string | null
  status: StudentStatus
  address: string
  guardian: string
  joinedAt: string
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Course {
  id: string
  title: string
  slug: string
  category: string
  description: string
  duration: string
  price: number
  level: CourseLevel
  teacherId: string
  icon: string
  seats: number
  rating: number
  popular?: boolean
}

export type EnrollmentStatus = 'approved' | 'pending' | 'rejected'
export type PaymentStatus = 'paid' | 'due' | 'partial'

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  status: EnrollmentStatus
  paymentStatus: PaymentStatus
  amountPaid: number
  enrolledAt: string
}

export type NoticeCategory = 'general' | 'exam' | 'event' | 'urgent'
export type NoticeAudience = 'all' | 'students' | 'teachers'

export interface Notice {
  id: string
  title: string
  content: string
  category: NoticeCategory
  audience: NoticeAudience
  date: string
  author: string
}

export interface Review {
  id: string
  name: string
  avatar?: string | null
  role: string
  rating: number
  featured?: boolean
  comment: string
}
