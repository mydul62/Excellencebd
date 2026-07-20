import express from 'express';
import { Role } from '@prisma/client';
import auth from '../../app/middleWares/auth';
import { validateRequest } from '../../app/middleWares/validationRequest';
import { CourseReviewController } from './courseReview.controller';
import { CourseReviewValidation } from './courseReview.validation';

const router = express.Router();

// ─── Public ───────────────────────────────────────────────────────────────────

// GET /course-review/course/:courseId  — reviews + stats for a course
router.get('/course/:courseId', CourseReviewController.getCourseReviews);

// ─── Admin-only routes (must come before /:id to avoid param collision) ───────

// GET  /course-review            — all reviews
router.get('/', auth(Role.ADMIN), CourseReviewController.getAllCourseReviews);

// GET  /course-review/admin/:id  — single review detail
router.get('/admin/:id', auth(Role.ADMIN), CourseReviewController.getSingleCourseReview);

// DELETE /course-review/admin/:id — admin deletes any review
router.delete('/admin/:id', auth(Role.ADMIN), CourseReviewController.adminDeleteCourseReview);

// ─── Authenticated user routes ────────────────────────────────────────────────

// POST /course-review  — create
router.post(
  '/',
  auth(Role.ADMIN, Role.STUDENT),
  validateRequest(CourseReviewValidation.createCourseReviewSchema),
  CourseReviewController.createCourseReview,
);

// PATCH /course-review/:id  — owner edits their review
router.patch(
  '/:id',
  auth(Role.ADMIN, Role.STUDENT),
  validateRequest(CourseReviewValidation.updateCourseReviewSchema),
  CourseReviewController.updateCourseReview,
);

// DELETE /course-review/:id  — owner or admin deletes
router.delete(
  '/:id',
  auth(Role.ADMIN, Role.STUDENT),
  CourseReviewController.deleteCourseReview,
);

export const CourseReviewRoutes = router;
