import express from 'express';
import { EnrollmentController } from './enrollments.controller';
import { validateRequest } from '../../app/middleWares/validationRequest';
import { EnrollmentValidation } from './enrollments.validation';
import auth from '../../app/middleWares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

// ── Static student routes (must come before /:id) ────────────────────────────

// GET  /enrollments/mine
router.get(
  '/mine',
  auth(Role.ADMIN, Role.STUDENT, Role.TEACHER),
  EnrollmentController.getMyEnrollments,
);

// GET  /enrollments/check/:courseId
router.get(
  '/check/:courseId',
  auth(Role.ADMIN, Role.STUDENT, Role.TEACHER),
  EnrollmentController.checkEnrollment,
);

// ── Admin list / detail ───────────────────────────────────────────────────────

// GET  /enrollments — ADMIN sees all; STUDENT/TEACHER see only their own
router.get(
  '/',
  auth(Role.ADMIN, Role.STUDENT, Role.TEACHER),
  EnrollmentController.getAllEnrollments,
);

// GET  /enrollments/:id
router.get(
  '/:id',
  auth(Role.ADMIN, Role.STUDENT, Role.TEACHER),
  EnrollmentController.getSingleEnrollment,
);

// ── Admin approve / reject ────────────────────────────────────────────────────

// PATCH /enrollments/:id/approve
router.patch(
  '/:id/approve',
  auth(Role.ADMIN),
  EnrollmentController.approveEnrollment,
);

// PATCH /enrollments/:id/reject  — body: { reason: string }
router.patch(
  '/:id/reject',
  auth(Role.ADMIN),
  validateRequest(EnrollmentValidation.rejectEnrollmentSchema),
  EnrollmentController.rejectEnrollment,
);

// ── Student resubmit ─────────────────────────────────────────────────────────

// PATCH /enrollments/:id/resubmit  — student corrects rejected enrollment
router.patch(
  '/:id/resubmit',
  auth(Role.STUDENT),
  validateRequest(EnrollmentValidation.resubmitEnrollmentSchema),
  EnrollmentController.resubmitEnrollment,
);

// ── Create / update / delete ─────────────────────────────────────────────────

// POST /enrollments — student self-enroll OR admin registers a student
router.post(
  '/',
  auth(Role.ADMIN, Role.STUDENT),
  validateRequest(EnrollmentValidation.createEnrollmentSchema),
  EnrollmentController.createEnrollment,
);

// PUT  /enrollments/:id  — admin manual patch
router.put(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(EnrollmentValidation.updateEnrollmentSchema),
  EnrollmentController.updateEnrollment,
);

// DELETE /enrollments/:id
router.delete(
  '/:id',
  auth(Role.ADMIN),
  EnrollmentController.deleteEnrollment,
);

export const EnrollmentRoutes = router;
