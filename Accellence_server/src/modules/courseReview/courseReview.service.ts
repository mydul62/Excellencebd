import prisma from '../../app/shared/prisma';
import ApiError from '../../app/error/ApiError';
import httpStatus from 'http-status';
import { ICourseReview, ICourseReviewFilters, ICourseReviewUpdate } from './courseReview.interface';
import { courseReviewSearchableFields } from './courseReview.constant';

// ─── Shared select ────────────────────────────────────────────────────────────

const courseReviewInclude = {
  user: {
    select: { id: true, name: true, avatar: true, role: true },
  },
  course: {
    select: { id: true, title: true, slug: true, category: true },
  },
};

// ─── Create ───────────────────────────────────────────────────────────────────

const createCourseReviewInDb = async (payload: ICourseReview) => {
  // Guard: one user can review a course only once
  const existing = await prisma.courseReview.findUnique({
    where: { courseId_userId: { courseId: payload.courseId, userId: payload.userId } },
  });
  if (existing) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'You have already reviewed this course. You can edit your existing review.',
    );
  }

  // Guard: course must exist
  await prisma.course.findUniqueOrThrow({
    where: { id: payload.courseId },
    select: { id: true },
  });

  const result = await prisma.courseReview.create({
    data: {
      courseId: payload.courseId,
      userId:   payload.userId,
      rating:   payload.rating,
      comment:  payload.comment,
    },
    include: courseReviewInclude,
  });

  return result;
};

// ─── Get all reviews for a specific course (public) ──────────────────────────

const getCourseReviewsByCourseId = async (
  courseId: string,
  query: Record<string, unknown>,
) => {
  const page  = Number(query?.page)  || 1;
  const limit = Number(query?.limit) || 10;
  const skip  = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.courseReview.findMany({
      where:   { courseId },
      skip,
      take:    limit,
      include: courseReviewInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.courseReview.count({ where: { courseId } }),
  ]);

  // Rating distribution  { 5: n, 4: n, 3: n, 2: n, 1: n }
  const distribution = await prisma.courseReview.groupBy({
    by:    ['rating'],
    where: { courseId },
    _count: { rating: true },
  });

  const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  distribution.forEach((d) => {
    ratingDistribution[d.rating] = d._count.rating;
  });

  const averageRating =
    total > 0
      ? Math.round(
          (distribution.reduce((sum, d) => sum + d.rating * d._count.rating, 0) / total) * 10,
        ) / 10
      : 0;

  return {
    meta: { page, limit, total },
    averageRating,
    totalReviews: total,
    ratingDistribution,
    data: reviews,
  };
};

// ─── Get all reviews (admin) ─────────────────────────────────────────────────

const getAllCourseReviewsFromDb = async (
  filters: ICourseReviewFilters,
  query: Record<string, unknown>,
) => {
  const page  = Number(query?.page)  || 1;
  const limit = Number(query?.limit) || 10;
  const skip  = (page - 1) * limit;

  const andConditions: any[] = [];

  if (filters.searchTerm) {
    andConditions.push({
      OR: courseReviewSearchableFields.map((field) => ({
        [field]: { contains: filters.searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (filters.courseId) andConditions.push({ courseId: filters.courseId });
  if (filters.userId)   andConditions.push({ userId:   filters.userId });
  if (filters.rating)   andConditions.push({ rating:   Number(filters.rating) });

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [result, total] = await Promise.all([
    prisma.courseReview.findMany({
      where,
      skip,
      take:    limit,
      include: courseReviewInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.courseReview.count({ where }),
  ]);

  return { meta: { page, limit, total }, data: result };
};

// ─── Get single ───────────────────────────────────────────────────────────────

const getSingleCourseReviewFromDb = async (id: string) => {
  return prisma.courseReview.findUniqueOrThrow({
    where:   { id },
    include: courseReviewInclude,
  });
};

// ─── Update (owner only — enforced in controller) ────────────────────────────

const updateCourseReviewInDb = async (
  id: string,
  userId: string,
  payload: ICourseReviewUpdate,
) => {
  const review = await prisma.courseReview.findUniqueOrThrow({ where: { id } });

  if (review.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only edit your own review.');
  }

  return prisma.courseReview.update({
    where:   { id },
    data:    payload,
    include: courseReviewInclude,
  });
};

// ─── Delete (owner or admin — ownership enforced in controller) ───────────────

const deleteCourseReviewFromDb = async (id: string, userId: string, isAdmin: boolean) => {
  const review = await prisma.courseReview.findUniqueOrThrow({ where: { id } });

  if (!isAdmin && review.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only delete your own review.');
  }

  return prisma.courseReview.delete({ where: { id } });
};

// ─── Admin delete (any review) ────────────────────────────────────────────────

const adminDeleteCourseReviewFromDb = async (id: string) => {
  await prisma.courseReview.findUniqueOrThrow({ where: { id } });
  return prisma.courseReview.delete({ where: { id } });
};

export const CourseReviewService = {
  createCourseReviewInDb,
  getCourseReviewsByCourseId,
  getAllCourseReviewsFromDb,
  getSingleCourseReviewFromDb,
  updateCourseReviewInDb,
  deleteCourseReviewFromDb,
  adminDeleteCourseReviewFromDb,
};
