import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { CourseService } from './courses.service';
import { courseFilterableFields } from './courses.constant';
import httpStatus from 'http-status';

const createCourse = catchAsync(async (req, res) => {
  const result = await CourseService.createCourseInDb(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Course created successfully',
    data: result,
  });
});

const getAllCourses = catchAsync(async (req, res) => {
  const filters: Record<string, any> = {};
  courseFilterableFields.forEach((field) => {
    if (req.query[field] !== undefined) {
      if (field === 'popular') {
        filters[field] = req.query[field] === 'true';
      } else {
        filters[field] = req.query[field];
      }
    }
  });

  const result = await CourseService.getAllCoursesFromDb(filters, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Courses retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSingleCourse = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await CourseService.getSingleCourseFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Course retrieved successfully',
    data: result,
  });
});

const updateCourse = catchAsync(async (req, res) => {
const id = req.params.id as string;
  const result = await CourseService.updateCourseInDb(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Course updated successfully',
    data: result,
  });
});

const deleteCourse = catchAsync(async (req, res) => {
const id = req.params.id as string;
  const result = await CourseService.deleteCourseFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Course deleted successfully',
    data: result,
  });
});

const assignTeacherToCourse = catchAsync(async (req, res) => {
  const courseId = req.params.id as string;
  const { teacherId } = req.body;
  
  const result = await CourseService.assignTeacherToCourseInDb(courseId, teacherId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Teacher assigned successfully',
    data: result,
  });
});

export const CourseController = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
  assignTeacherToCourse,
};


