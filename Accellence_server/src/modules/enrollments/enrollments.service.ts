import prisma from '../../app/shared/prisma';
import ApiError from '../../app/error/ApiError';
import httpStatus from 'http-status';
import {
  IEnrollment,
  IEnrollmentUpdate,
  IEnrollmentResubmit,
  IEnrollmentFilters,
} from './enrollments.interface';

// ─── Shared include for list / single responses ───────────────────────────────

const enrollmentInclude = {
  user: {
    select: { id: true, name: true, email: true, phone: true, avatar: true },
  },
  paymentMethod: {
    select: {
      id: true,
      name: true,
      accountNumber: true,
      accountName: true,
      accountType: true,
      logo: true,
    },
  },
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      price: true,
      icon: true,
      level: true,
      duration: true,
      seats: true,
      rating: true,
      description: true,
      teacherId: true,
    },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isValidTransactionId = (transactionId?: string | null): boolean => {
  const value = transactionId?.trim();
  if (!value) return false;
  const blocked = ['pending', 'unpaid', 'n/a', 'na', 'null', 'undefined', 'none'];
  if (blocked.includes(value.toLowerCase())) return false;
  return /^[A-Za-z0-9._-]{3,}$/.test(value);
};

/**
 * Determine payment status by comparing amountSent vs courseFee.
 *   equal   → paid
 *   less    → partial  (underpaid)
 *   greater → paid     (overpaid — accepted, treat as fully paid)
 */
const resolvePaymentStatus = (
  amountSent: number,
  courseFee: number,
): 'paid' | 'partial' => {
  if (amountSent >= courseFee) return 'paid';
  return 'partial';
};

// ─── CRUD ─────────────────────────────────────────────────────────────────────

const createEnrollmentInDb = async (payload: IEnrollment) => {
  // Guard: one enrollment per student per course
  const existing = await prisma.enrollment.findFirst({
    where: { userId: payload.userId, courseId: payload.courseId },
  });
  if (existing) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'You are already enrolled in this course.',
    );
  }

  const result = await prisma.enrollment.create({
    data: {
      userId:           payload.userId,
      courseId:         payload.courseId,
      paymentMethodId:  payload.paymentMethodId,
      courseFee:        payload.courseFee,
      amountSent:       payload.amountSent,
      senderNumber:     payload.senderNumber,
      transactionId:    payload.transactionId,
      paymentScreenshot: payload.paymentScreenshot ?? null,
      paymentStatus:    payload.paymentStatus   ?? 'unpaid',
      enrollmentStatus: payload.enrollmentStatus ?? 'pending',
    },
    include: enrollmentInclude,
  });
  return result;
};

const getAllEnrollmentsFromDb = async (
  filters: IEnrollmentFilters,
  query: Record<string, unknown>,
) => {
  const page  = Number(query?.page)  || 1;
  const limit = Number(query?.limit) || 100;
  const skip  = (page - 1) * limit;

  const andConditions: any[] = [];
  if (filters.enrollmentStatus) andConditions.push({ enrollmentStatus: filters.enrollmentStatus });
  if (filters.paymentStatus)    andConditions.push({ paymentStatus:    filters.paymentStatus });
  if (filters.userId)           andConditions.push({ userId:           filters.userId });
  if (filters.courseId)         andConditions.push({ courseId:         filters.courseId });
  if (filters.paymentMethodId)  andConditions.push({ paymentMethodId:  filters.paymentMethodId });

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip,
      take: limit,
      include: enrollmentInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.enrollment.count({ where }),
  ]);

  return { meta: { page, limit, total }, data: result };
};

const getSingleEnrollmentFromDb = async (id: string) => {
  return prisma.enrollment.findUniqueOrThrow({
    where: { id },
    include: {
      ...enrollmentInclude,
      course: {
        include: {
          teacher: {
            include: {
              user: { select: { id: true, name: true, avatar: true } },
            },
          },
        },
      },
    },
  });
};

const updateEnrollmentInDb = async (id: string, payload: IEnrollmentUpdate) => {
  return prisma.enrollment.update({
    where: { id },
    data: {
      paymentStatus:    payload.paymentStatus,
      enrollmentStatus: payload.enrollmentStatus,
      rejectionReason:  payload.rejectionReason,
    },
    include: enrollmentInclude,
  });
};

// ─── Approve ─────────────────────────────────────────────────────────────────

const approveEnrollmentInDb = async (id: string) => {
  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: { id },
  });

  if (enrollment.enrollmentStatus !== 'pending') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Only pending enrollments can be approved.',
    );
  }

  if (!isValidTransactionId(enrollment.transactionId)) {
    // Auto-reject with clear reason
    return rejectEnrollmentInDb(
      id,
      'Transaction ID is not valid. Please resubmit with a correct TRX ID.',
    );
  }

  // Determine payment status based on amount comparison
  const paymentStatus = resolvePaymentStatus(
    enrollment.amountSent,
    enrollment.courseFee,
  );

  return prisma.enrollment.update({
    where: { id },
    data: {
      enrollmentStatus: 'approved',
      paymentStatus,
      rejectionReason: null,
    },
    include: enrollmentInclude,
  });
};

// ─── Reject ───────────────────────────────────────────────────────────────────

const rejectEnrollmentInDb = async (id: string, reason: string) => {
  const enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { id } });

  if (enrollment.enrollmentStatus !== 'pending') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Only pending enrollments can be rejected.',
    );
  }

  return prisma.enrollment.update({
    where: { id },
    data: {
      enrollmentStatus: 'rejected',
      paymentStatus:    'unpaid',
      rejectionReason:  reason,
    },
    include: enrollmentInclude,
  });
};

// ─── Resubmit (student corrects payment details after rejection) ──────────────

const resubmitEnrollmentInDb = async (
  id: string,
  userId: string,
  payload: IEnrollmentResubmit,
) => {
  const enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { id } });

  // Only the owning student can resubmit
  if (enrollment.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only resubmit your own enrollment.');
  }

  if (enrollment.enrollmentStatus !== 'rejected') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Only rejected enrollments can be resubmitted.',
    );
  }

  return prisma.enrollment.update({
    where: { id },
    data: {
      transactionId:     payload.transactionId,
      senderNumber:      payload.senderNumber,
      amountSent:        payload.amountSent,
      paymentScreenshot: payload.paymentScreenshot ?? null,
      enrollmentStatus:  'pending',   // reset to pending for admin review
      paymentStatus:     'unpaid',
      rejectionReason:   null,        // clear previous rejection reason
    },
    include: enrollmentInclude,
  });
};

// ─── Delete ───────────────────────────────────────────────────────────────────

const deleteEnrollmentFromDb = async (id: string) => {
  return prisma.enrollment.delete({ where: { id } });
};

// ─── Enrollment check ─────────────────────────────────────────────────────────

const checkEnrollmentExists = async (userId: string, courseId: string) => {
  const existing = await prisma.enrollment.findFirst({
    where: { userId, courseId },
    select: {
      id: true,
      enrollmentStatus: true,
      paymentStatus: true,
    },
  });
  return { enrolled: !!existing, enrollment: existing };
};

export const EnrollmentService = {
  createEnrollmentInDb,
  getAllEnrollmentsFromDb,
  getSingleEnrollmentFromDb,
  updateEnrollmentInDb,
  approveEnrollmentInDb,
  rejectEnrollmentInDb,
  resubmitEnrollmentInDb,
  deleteEnrollmentFromDb,
  checkEnrollmentExists,
};
