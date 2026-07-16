import prisma from '../../app/shared/prisma';
import ApiError from '../../app/error/ApiError';
import httpStatus from 'http-status';
import { IEnrollment, IEnrollmentFilters } from './enrollments.interface';

const enrollmentInclude = {
  user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
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

const createEnrollmentInDb = async (payload: IEnrollment) => {
  const result = await prisma.enrollment.create({
    data: payload,
    include: enrollmentInclude,
  });
  return result;
};

const getAllEnrollmentsFromDb = async (
  filters: IEnrollmentFilters,
  query: Record<string, unknown>
) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 100;
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];
  if (filters.status) andConditions.push({ status: filters.status });
  if (filters.paymentStatus) andConditions.push({ paymentStatus: filters.paymentStatus });
  if (filters.userId) andConditions.push({ userId: filters.userId });
  if (filters.courseId) andConditions.push({ courseId: filters.courseId });
  if (filters.paymentMethod)
    andConditions.push({ paymentMethod: { contains: filters.paymentMethod, mode: 'insensitive' } });

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
  const result = await prisma.enrollment.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
      course: {
        include: {
          teacher: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
        },
      },
    },
  });
  return result;
};

const updateEnrollmentInDb = async (id: string, payload: Partial<IEnrollment>) => {
  const result = await prisma.enrollment.update({
    where: { id },
    data: payload,
    include: enrollmentInclude,
  });
  return result;
};

const INVALID_TRANSACTION_ID_MESSAGE = 'Transaction ID is not valid. Please provide a valid TRX ID.';

const isValidTransactionId = (transactionId?: string | null) => {
  const value = transactionId?.trim();
  if (!value) return false;

  const normalized = value.toLowerCase();
  if (['pending', 'unpaid', 'n/a', 'na', 'null', 'undefined', 'none'].includes(normalized)) {
    return false;
  }

  return /^[A-Za-z0-9._-]{3,}$/.test(value);
};

const approveEnrollmentInDb = async (id: string, reason?: string) => {
  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: { id },
    include: { course: true },
  });

  if (enrollment.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only pending enrollments can be approved');
  }

  if (!isValidTransactionId(enrollment.transactionId)) {
    return rejectEnrollmentInDb(id, reason ?? INVALID_TRANSACTION_ID_MESSAGE);
  }

  const amountPaid = enrollment.amountPaid >= enrollment.course.price ? enrollment.amountPaid : enrollment.course.price;

  const result = await prisma.enrollment.update({
    where: { id },
    data: {
      status: 'approved',
      paymentStatus: 'paid',
      amountPaid,
      notes: enrollment.notes || 'Payment verified by admin',
    },
    include: enrollmentInclude,
  });
  return result;
};

const rejectEnrollmentInDb = async (id: string, reason?: string) => {
  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: { id },
  });

  if (enrollment.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only pending enrollments can be rejected');
  }

  const result = await prisma.enrollment.update({
    where: { id },
    data: {
      status: 'rejected',
      paymentStatus: 'unpaid',
      notes: reason || 'Enrollment rejected by admin',
    },
    include: enrollmentInclude,
  });
  return result;
};

const deleteEnrollmentFromDb = async (id: string) => {
  const result = await prisma.enrollment.delete({ where: { id } });
  return result;
};

// Check if a specific user is already enrolled in a course
const checkEnrollmentExists = async (userId: string, courseId: string) => {
  const existing = await prisma.enrollment.findFirst({
    where: { userId, courseId },
    select: { id: true, status: true, paymentStatus: true },
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
  deleteEnrollmentFromDb,
  checkEnrollmentExists,
};
