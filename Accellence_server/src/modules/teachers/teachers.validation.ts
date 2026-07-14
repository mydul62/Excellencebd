import { z } from 'zod';

const createTeacherSchema = z.object({
  body: z.object({
    // User account
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    avatar: z.string().url().optional().nullable(),
    phone: z.string().optional().nullable(),
    // Teacher profile
    subject: z.string().min(1, 'Subject is required'),
    bio: z.string().optional().nullable(),
    experienceYears: z.number().int().nonnegative().optional(),
    qualification: z.string().optional().nullable(),
    joinedAt: z.string().datetime().optional(),
  }),
});

const updateTeacherSchema = z.object({
  body: z.object({
    // User account
    name: z.string().min(1).optional(),
    avatar: z.string().url().optional().nullable(),
    phone: z.string().optional().nullable(),
    // Teacher profile
    subject: z.string().min(1).optional(),
    bio: z.string().optional().nullable(),
    experienceYears: z.number().int().nonnegative().optional(),
    qualification: z.string().optional().nullable(),
  }),
});

export const TeacherValidation = {
  createTeacherSchema,
  updateTeacherSchema,
};
