import { z } from 'zod';

const createStudentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
    guardian: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    bloodGroup: z.string().optional().nullable(),
    emergencyContact: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    subject: z.string().optional().nullable(),
  }),
});

const updateStudentSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
    guardian: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    bloodGroup: z.string().optional().nullable(),
    emergencyContact: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    subject: z.string().optional().nullable(),
  }),
});

export const StudentValidation = {
  createStudentSchema,
  updateStudentSchema,
};
