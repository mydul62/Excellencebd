import { z } from 'zod';
import { EnrollmentStatus, PaymentStatus } from '@prisma/client';

// ─── Create (student submits enrollment) ─────────────────────────────────────

const createEnrollmentSchema = z.object({
  body: z.object({
    userId:           z.string().min(1, 'User ID is required'),
    courseId:         z.string().min(1, 'Course ID is required'),
    paymentMethodId:  z.string().min(1, 'Payment method ID is required'),
    courseFee:        z.coerce.number().nonnegative('Course fee must be 0 or more'),
    amountSent:       z.coerce.number().nonnegative('Amount sent must be 0 or more'),
    senderNumber:     z.string().min(1, 'Sender number is required'),
    transactionId:    z.string().min(1, 'Transaction ID is required'),
    paymentScreenshot: z.string().optional(),
    // admin overrides — optional
    paymentStatus:    z.nativeEnum(PaymentStatus).optional(),
    enrollmentStatus: z.nativeEnum(EnrollmentStatus).optional(),
  }),
});

// ─── Admin update (patch status / reason) ────────────────────────────────────

const updateEnrollmentSchema = z.object({
  body: z.object({
    paymentStatus:    z.nativeEnum(PaymentStatus).optional(),
    enrollmentStatus: z.nativeEnum(EnrollmentStatus).optional(),
    rejectionReason:  z.string().optional(),
  }),
});

// ─── Student resubmission ─────────────────────────────────────────────────────

const resubmitEnrollmentSchema = z.object({
  body: z.object({
    transactionId:     z.string().min(1, 'Transaction ID is required'),
    senderNumber:      z.string().min(1, 'Sender number is required'),
    amountSent:        z.coerce.number().nonnegative('Amount must be 0 or more'),
    paymentScreenshot: z.string().optional(),
  }),
});

// ─── Admin reject (reason required) ──────────────────────────────────────────

const rejectEnrollmentSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Rejection reason is required'),
  }),
});

export const EnrollmentValidation = {
  createEnrollmentSchema,
  updateEnrollmentSchema,
  resubmitEnrollmentSchema,
  rejectEnrollmentSchema,
};
