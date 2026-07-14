import { EnrollmentStatus, PaymentStatus } from '../../generated/prisma';

export interface IEnrollment {
  // relations
  userId: string;
  courseId: string;
  // form data
  name: string;
  email: string;
  phone: string;
  paymentMethod: string;
  transactionId: string;
  notes?: string;
  screenshotUrl?: string;
  // admin-managed
  status?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  enrolledAt?: Date;
}

export interface IEnrollmentFilters {
  status?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
  courseId?: string;
  paymentMethod?: string;
}
