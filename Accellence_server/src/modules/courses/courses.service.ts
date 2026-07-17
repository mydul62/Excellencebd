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
        select: { id: true, status: true, paymentStatus: true, enrolledAt: true },
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

export const CourseService = {
  createCourseInDb,
  getAllCoursesFromDb,
  getSingleCourseFromDb,
  updateCourseInDb,
  deleteCourseFromDb,
};
