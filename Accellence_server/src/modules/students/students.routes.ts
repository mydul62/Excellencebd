import express from 'express';
import { StudentController } from './students.controller';
import { validateRequest } from '../../app/middleWares/validationRequest';
import { StudentValidation } from './students.validation';
import auth from '../../app/middleWares/auth';
import { Role } from "@prisma/client";

const router = express.Router();

// ADMIN only — create student account
router.post(
  '/',
  auth(Role.ADMIN),
  validateRequest(StudentValidation.createStudentSchema),
  StudentController.createStudent
);

// ADMIN only — list all students
router.get(
  '/',
  auth(Role.ADMIN),
  StudentController.getAllStudents
);

// Authenticated users can view a student profile
router.get(
  '/:id',
  auth(Role.ADMIN, Role.STUDENT, Role.TEACHER),
  StudentController.getSingleStudent
);

// ADMIN or the STUDENT themselves can update
router.put(
  '/:id',
  auth(Role.ADMIN, Role.STUDENT),
  validateRequest(StudentValidation.updateStudentSchema),
  StudentController.updateStudent
);

// ADMIN only — delete student
router.delete(
  '/:id',
  auth(Role.ADMIN),
  StudentController.deleteStudent
);

export const StudentRoutes = router;
