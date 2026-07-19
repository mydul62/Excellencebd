import express from 'express';
import { Role } from '@prisma/client';
import auth from '../../app/middleWares/auth';
import { validateRequest } from '../../app/middleWares/validationRequest';
import { CourseMaterialValidation } from './courseMaterial.validation';
import { CourseMaterialController } from './courseMaterial.controller';
import { pdfUpload } from './courseMaterial.multer';

const router = express.Router();

/**
 * POST /course-material/upload
 * Auth: TEACHER only
 * Body: multipart/form-data — file (PDF), courseId, title, description?
 */
router.post(
  '/upload',
  auth(Role.TEACHER),
  pdfUpload.single('file'),
  validateRequest(CourseMaterialValidation.uploadSchema),
  CourseMaterialController.uploadMaterial,
);

/**
 * GET /course-material/course/:courseId
 * Auth: ADMIN | TEACHER | STUDENT (with guards enforced in service)
 */
router.get(
  '/course/:courseId',
  auth(Role.ADMIN, Role.TEACHER, Role.STUDENT),
  CourseMaterialController.getMaterialsByCourse,
);

/**
 * GET /course-material/download/:id
 * Auth: ADMIN | TEACHER | STUDENT (with guards enforced in service)
 * Streams the PDF from Cloudinary via server-side signed URL — bypasses
 * any Cloudinary account-level access restrictions.
 */
router.get(
  '/download/:id',
  auth(Role.ADMIN, Role.TEACHER, Role.STUDENT),
  CourseMaterialController.downloadMaterial,
);

/**
 * DELETE /course-material/:id
 * Auth: ADMIN | TEACHER (with ownership guard enforced in service)
 */
router.delete(
  '/:id',
  auth(Role.ADMIN, Role.TEACHER),
  CourseMaterialController.deleteMaterial,
);

export const CourseMaterialRoutes = router;
