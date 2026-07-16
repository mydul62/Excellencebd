import prisma from '../../app/shared/prisma';
import { IReview, IReviewFilters } from './reviews.interface';
import { reviewSearchableFields } from './reviews.constant';

const createReviewInDb = async (payload: IReview) => {
  const result = await prisma.review.create({
    data: {
      name: payload.name,
      avatar: payload.avatar ?? null,
      role: payload.role ?? null,
      rating: payload.rating,
      comment: payload.comment,
      featured: payload.featured ?? false,
      ...(payload.userId && { userId: payload.userId }),
      ...(payload.courseId && { courseId: payload.courseId }),
    },
  });
  return result;
};

const getAllReviewsFromDb = async (
  filters: IReviewFilters,
  query: Record<string, unknown>
) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: reviewSearchableFields.map((field) => ({
        [field]: { contains: filters.searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (filters.featured !== undefined) andConditions.push({ featured: filters.featured });
  if (filters.courseId) andConditions.push({ courseId: filters.courseId });
  if (filters.userId) andConditions.push({ userId: filters.userId });

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where }),
  ]);

  return { meta: { page, limit, total }, data: result };
};

const getSingleReviewFromDb = async (id: string) => {
  const result = await prisma.review.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      course: { select: { id: true, title: true, slug: true } },
    },
  });
  return result;
};

const updateReviewInDb = async (id: string, payload: Partial<IReview>) => {
  const result = await prisma.review.update({ where: { id }, data: payload as any });
  return result;
};

const deleteReviewFromDb = async (id: string) => {
  const result = await prisma.review.delete({ where: { id } });
  return result;
};

export const ReviewService = {
  createReviewInDb,
  getAllReviewsFromDb,
  getSingleReviewFromDb,
  updateReviewInDb,
  deleteReviewFromDb,
};
