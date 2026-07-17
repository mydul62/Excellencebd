import { z } from 'zod'

const updateAdminProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().trim().optional().nullable(),
    avatar: z.string().trim().url('Must be a valid URL').optional().nullable(),
  }),
})

const changeAdminPasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  }),
})

export const AdminValidation = {
  updateAdminProfileSchema,
  changeAdminPasswordSchema,
}
