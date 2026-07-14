import { z } from 'zod';
import { EnrollmentStatus, PaymentStatus } from '../../generated/prisma';

const createEnrollmentSchema = z.object({
  body: z.object({
    // relations
    userId: z.string().min(1, 'User ID is required'),
    courseId: z.string().min(1, 'Course ID is required'),
    // form data
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(1, 'Phone is required'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    transactionId: z.string().min(1, 'Transaction ID is required'),
    notes: z.string().optional(),
    screenshotUrl: z.string().optional(),
    // optional overrides
    status: z.nativeEnum(EnrollmentStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    amountPaid: z.number().nonnegative().optional(),
    enrolledAt: z.string().datetime().optional(),
  }),
});

const updateEnrollmentSchema = z.object({
  body: z.object({
    status: z.nativeEnum(EnrollmentStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    amountPaid: z.number().nonnegative().optional(),
    notes: z.string().optional(),
  }),
});

export const EnrollmentValidation = {
  createEnrollmentSchema,
  updateEnrollmentSchema,
};
