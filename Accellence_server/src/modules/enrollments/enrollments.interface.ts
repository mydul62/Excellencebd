import { EnrollmentStatus, PaymentStatus } from '@prisma/client';

// ─── Create payload (student submits) ────────────────────────────────────────

export interface IEnrollment {
  userId:           string;
  courseId:         string;
  paymentMethodId:  string;
  courseFee:        number;
  amountSent:       number;
  senderNumber:     string;
  transactionId:    string;
  paymentScreenshot?: string;
  // admin can override on creation
  paymentStatus?:    PaymentStatus;
  enrollmentStatus?: EnrollmentStatus;
}

// ─── Admin update payload ─────────────────────────────────────────────────────

export interface IEnrollmentUpdate {
  paymentStatus?:    PaymentStatus;
  enrollmentStatus?: EnrollmentStatus;
  rejectionReason?:  string;
}

// ─── Student resubmission payload ────────────────────────────────────────────

export interface IEnrollmentResubmit {
  transactionId:     string;
  senderNumber:      string;
  amountSent:        number;
  paymentScreenshot?: string;
}

// ─── Filter shape ─────────────────────────────────────────────────────────────

export interface IEnrollmentFilters {
  enrollmentStatus?: EnrollmentStatus;
  paymentStatus?:    PaymentStatus;
  userId?:           string;
  courseId?:         string;
  paymentMethodId?:  string;
}
