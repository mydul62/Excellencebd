import express from 'express';
import { TeacherController } from './teachers.controller';
import { validateRequest } from '../../app/middleWares/validationRequest';
import { TeacherValidation } from './teachers.validation';
import auth from '../../app/middleWares/auth';
import { Role } from "@prisma/client";

const router = express.Router();

// Public — anyone can browse teachers
router.get('/', TeacherController.getAllTeachers);
router.get('/:id', TeacherController.getSingleTeacher);

// ADMIN only — create teacher account (creates User + Teacher profile)
router.post(
  '/',
  auth(Role.ADMIN),
  validateRequest(TeacherValidation.createTeacherSchema),
  TeacherController.createTeacher
);

// ADMIN or the TEACHER themselves can update
router.put(
  '/:id',
  auth(Role.ADMIN, Role.TEACHER),
  validateRequest(TeacherValidation.updateTeacherSchema),
  TeacherController.updateTeacher
);

// ADMIN only — delete teacher (cascades to User account)
router.delete('/:id', auth(Role.ADMIN), TeacherController.deleteTeacher);

export const TeacherRoutes = router;
