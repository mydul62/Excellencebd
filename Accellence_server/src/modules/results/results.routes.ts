import express from 'express';
import { ResultController } from './results.controller';
import auth from '../../app/middleWares/auth';
import { Role } from '../../generated/prisma';

const router = express.Router();

// Teacher and Admin can upload results
router.post(
  '/',
  auth(Role.ADMIN, Role.TEACHER),
  ResultController.createResult
);

// Admin, Teacher, and Student themselves can view student's results
router.get(
  '/student/:studentId',
  auth(Role.ADMIN, Role.TEACHER, Role.STUDENT),
  ResultController.getStudentResults
);

export const ResultRoutes = router;
