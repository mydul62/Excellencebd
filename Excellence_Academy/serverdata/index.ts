// Base fetch helper
export * from './api'

// Auth — export carefully to avoid name collisions
export {
  loginApi,
  registerApi,
  refreshTokenApi,
  changePasswordApi,
  saveAccessToken,
  getAccessToken,
  clearAccessToken,
  type LoginPayload,
  type RegisterPayload,
  type ChangePasswordPayload,
  type AuthLoginResponse,
  type AuthRegisterResponse,
  type ServerRole,
  type ServerUser as AuthServerUser,
} from './auth'

// Courses
export * from './courses'

// Teachers
export * from './teachers'

// Notices
export * from './notices'

// Testimonials / Reviews
export * from './testimonials'

// Enrollments
export * from './enrollments'

// Users — ServerUser is the canonical one; ServerRole from users
export {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  type UserFilters,
  type UsersResult,
  type UpdateUserPayload,
  type ServerUser,
  type ServerRole,
} from './users'

// Contact
export * from './contact'

// Categories
export * from './categories'

// ⚠️ Stubs for missing backend endpoints (blogs, events)
export * from './blogs'
export * from './events'
