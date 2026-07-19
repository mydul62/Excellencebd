import prisma from '../../app/shared/prisma';
import { ICourse, ICourseFilters } from './courses.interface';
import { courseSearchableFields } from './courses.constant';

const createCourseInDb = async (payload: ICourse) => {
  const result = await prisma.course.create({
    data: payload,
  });
  return result;
};

const getAllCoursesFromDb = async (
  filters: ICourseFilters,
  query: Record<string, unknown>
) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: courseSearchableFields.map((field) => ({
        [field]: { contains: filters.searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (filters.category) {
    andConditions.push({ category: { equals: filters.category, mode: 'insensitive' } });
  }

  if (filters.level) {
    andConditions.push({ level: filters.level });
  }

  if (filters.popular !== undefined) {
    andConditions.push({ popular: filters.popular });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getSingleCourseFromDb = async (id: string) => {
  const result = await prisma.course.findUniqueOrThrow({
    where: { id },
    include: {
      enrollments: {
        select: { id: true, enrollmentStatus: true, paymentStatus: true, enrolledAt: true },
      },
      reviews: {
        select: { id: true, name: true, rating: true, comment: true, featured: true },
      },
    },
  });
  return result;
};

const updateCourseInDb = async (id: string, payload: Partial<ICourse>) => {
  const result = await prisma.course.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteCourseFromDb = async (id: string) => {
  const result = await prisma.course.delete({ where: { id } });
  return result;
};

const assignTeacherToCourseInDb = async (courseId: string, teacherId: string | null) => {
  // Validate course exists
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new Error('Course not found');
  }

  // If teacherId provided, validate teacher exists
  if (teacherId) {
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) {
      throw new Error('Teacher not found');
    }
  }

  // Update course with new teacherId (or null to unassign)
  const result = await prisma.course.update({
    where: { id: courseId },
    data: { teacherId },
    include: {
      teacher: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true, phone: true },
          },
        },
      },
    },
  });

  return result;
};

export const CourseService = {
  createCourseInDb,
  getAllCoursesFromDb,
  getSingleCourseFromDb,
  updateCourseInDb,
  deleteCourseFromDb,
  assignTeacherToCourseInDb,
};
