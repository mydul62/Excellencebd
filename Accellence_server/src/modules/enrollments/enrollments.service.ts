import prisma from '../../app/shared/prisma';
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
  deleteEnrollmentFromDb,
  checkEnrollmentExists,
};
