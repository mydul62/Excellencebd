import express from 'express';
import { CourseController } from './courses.controller';
import { validateRequest } from '../../app/middleWares/validationRequest';
import { CourseValidation } from './courses.validation';
import auth from '../../app/middleWares/auth';
import { Role } from "@prisma/client";

const router = express.Router();

router.get('/', CourseController.getAllCourses);
router.get('/:id', CourseController.getSingleCourse);
router.post(
  '/',
  auth(Role.ADMIN),
  validateRequest(CourseValidation.createCourseSchema),
  CourseController.createCourse
);
router.put(
  '/:id',
  auth(Role.ADMIN),
  validateRequest(CourseValidation.updateCourseSchema),
  CourseController.updateCourse
);
router.delete('/:id', auth(Role.ADMIN), CourseController.deleteCourse);
router.patch('/:id/assign-teacher', auth(Role.ADMIN), CourseController.assignTeacherToCourse);

export const CourseRoutes = router;


