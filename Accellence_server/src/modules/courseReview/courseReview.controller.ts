import httpStatus from 'http-status';
import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { CourseReviewService } from './courseReview.service';
import { courseReviewFilterableFields } from './courseReview.constant';

// ─── Create review (authenticated user) ──────────────────────────────────────

const createCourseReview = catchAsync(async (req, res) => {
  const user = (req as any).user;
  const result = await CourseReviewService.createCourseReviewInDb({
    ...req.body,
    userId: user.id,
  });
  sendResponse(res, {
    success:    true,
    statusCode: httpStatus.CREATED,
    message:    'Course review submitted successfully',
    data:       result,
  });
});

// ─── Get reviews for a course (public) ───────────────────────────────────────

const getCourseReviews = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const result = await CourseReviewService.getCourseReviewsByCourseId(
    courseId as string,
    req.query,
  );
  sendResponse(res, {
    success:    true,
    statusCode: httpStatus.OK,
    message:    'Course reviews retrieved successfully',
    data:       result,
    meta:       result.meta,
  });
});

// ─── Get all reviews (admin) ─────────────────────────────────────────────────

const getAllCourseReviews = catchAsync(async (req, res) => {
  const filters: Record<string, any> = {};
  courseReviewFilterableFields.forEach((field) => {
    if (req.query[field] !== undefined) filters[field] = req.query[field];
  });

  const result = await CourseReviewService.getAllCourseReviewsFromDb(filters, req.query);
  sendResponse(res, {
    success:    true,
    statusCode: httpStatus.OK,
    message:    'All course reviews retrieved successfully',
    data:       result.data,
    meta:       result.meta,
  });
});

// ─── Get single review (admin) ────────────────────────────────────────────────

const getSingleCourseReview = catchAsync(async (req, res) => {
  const result = await CourseReviewService.getSingleCourseReviewFromDb(
    req.params.id as string,
  );
  sendResponse(res, {
    success:    true,
    statusCode: httpStatus.OK,
    message:    'Course review retrieved successfully',
    data:       result,
  });
});

// ─── Update review (owner only) ──────────────────────────────────────────────

const updateCourseReview = catchAsync(async (req, res) => {
  const user = (req as any).user;
  const result = await CourseReviewService.updateCourseReviewInDb(
    req.params.id as string,
    user.id,
    req.body,
  );
  sendResponse(res, {
    success:    true,
    statusCode: httpStatus.OK,
    message:    'Course review updated successfully',
    data:       result,
  });
});

// ─── Delete review (owner or admin) ──────────────────────────────────────────

const deleteCourseReview = catchAsync(async (req, res) => {
  const user = (req as any).user;
  const result = await CourseReviewService.deleteCourseReviewFromDb(
    req.params.id as string,
    user.id,
    user.role === 'ADMIN',
  );
  sendResponse(res, {
    success:    true,
    statusCode: httpStatus.OK,
    message:    'Course review deleted successfully',
    data:       result,
  });
});

// ─── Admin delete any review ──────────────────────────────────────────────────

const adminDeleteCourseReview = catchAsync(async (req, res) => {
  const result = await CourseReviewService.adminDeleteCourseReviewFromDb(
    req.params.id as string,
  );
  sendResponse(res, {
    success:    true,
    statusCode: httpStatus.OK,
    message:    'Course review deleted by admin',
    data:       result,
  });
});

export const CourseReviewController = {
  createCourseReview,
  getCourseReviews,
  getAllCourseReviews,
  getSingleCourseReview,
  updateCourseReview,
  deleteCourseReview,
  adminDeleteCourseReview,
};
