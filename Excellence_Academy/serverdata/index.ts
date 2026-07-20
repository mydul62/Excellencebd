// Base fetch helper + token utilities
export * from './api'

// Auth
export {
  loginApi,
  registerApi,
  refreshTokenApi,
  changePasswordApi,
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

// Payment Methods
export * from './paymentMethods'

// Users — ServerUser is the canonical type; ServerRole imported from users only
export {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  type UserFilters,
  type UsersResult,
  type UpdateUserPayload,
  type ServerUser,
  type ServerRole as UsersServerRole,
} from './users'

// Contact
export * from './contact'

// Categories
export * from './categories'

// Stubs for missing backend endpoints
export * from './blogs'
export * from './events'
