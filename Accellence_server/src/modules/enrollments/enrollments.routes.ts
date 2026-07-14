import express from 'express';
import { EnrollmentController } from './enrollments.controller';
import { validateRequest } from '../../app/middleWares/validationRequest';
import { EnrollmentValidation } from './enrollments.validation';
import auth from '../../app/middleWares/auth';
import { Role } from '../../generated/prisma';

const router = express.Router();

// ── Student-scoped routes (MUST come before /:id to avoid route collision) ────
// GET /enrollments/mine — student sees only their own enrollments
router.get(
  '/mine',
  auth(Role.ADMIN, Role.STUDENT, Role.TEACHER),
  EnrollmentController.getMyEnrollments
);

// GET /enrollments/check/:courseId — check if logged-in user is enrolled
router.get(
  '/check/:courseId',
  auth(Role.ADMIN, Role.STUDENT, Role.TEACHER),
  EnrollmentController.checkEnrollment
);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/', auth(Role.ADMIN), EnrollmentController.getAllEnrollments);
router.get('/:id', auth(Role.ADMIN, Role.STUDENT, Role.TEACHER), EnrollmentController.getSingleEnrollment);

// ── Shared routes ─────────────────────────────────────────────────────────────
router.post(
  '/',
  auth(Role.ADMIN, Role.STUDENT),
  validateRequest(EnrollmentValidation.createEnrollmentSchema),
  EnrollmentController.createEnrollment
);
router.put(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(EnrollmentValidation.updateEnrollmentSchema),
  EnrollmentController.updateEnrollment
);
router.delete('/:id', auth(Role.ADMIN), EnrollmentController.deleteEnrollment);

export const EnrollmentRoutes = router;
