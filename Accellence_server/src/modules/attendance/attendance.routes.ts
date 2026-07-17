import express from 'express';
import { AttendanceController } from './attendance.controller';
import auth from '../../app/middleWares/auth';
import { Role } from "@prisma/client";

const router = express.Router();

// Teacher and Admin can create attendance records
router.post(
  '/',
  auth(Role.ADMIN, Role.TEACHER),
  AttendanceController.createAttendance
);

// Admin, Teacher, and Student themselves can view attendance records
router.get(
  '/student/:studentId',
  auth(Role.ADMIN, Role.TEACHER, Role.STUDENT),
  AttendanceController.getStudentAttendance
);

export const AttendanceRoutes = router;
