import { JwtPayload } from 'jsonwebtoken';
import { catchAsync } from '../../app/helper/catchAsync';
import ApiError from '../../app/error/ApiError';
import { sendResponse } from '../../app/shared/sendResponse';
import { TeacherService } from './teachers.service';
import { teacherFilterableFields } from './teachers.constant';
import { Role } from "@prisma/client";
import httpStatus from 'http-status';

const createTeacher = catchAsync(async (req, res) => {
  const result = await TeacherService.createTeacherInDb(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Teacher created successfully',
    data: result,
  });
});

const getAllTeachers = catchAsync(async (req, res) => {
  const filters: Record<string, any> = {};
  teacherFilterableFields.forEach((field) => {
    if (req.query[field] !== undefined) {
      filters[field] = req.query[field];
    }
  });

  const result = await TeacherService.getAllTeachersFromDb(filters, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Teachers retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSingleTeacher = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TeacherService.getSingleTeacherFromDb(id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Teacher retrieved successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const currentUser = req.user as JwtPayload;
  
  // Find teacher by userId
  const result = await TeacherService.getTeacherByUserIdFromDb(currentUser.id);
  
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Teacher profile not found');
  }
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Teacher profile retrieved successfully',
    data: result,
  });
});

const getMyCourses = catchAsync(async (req, res) => {
  const currentUser = req.user as JwtPayload;
  
  // Find teacher by userId
  const teacher = await TeacherService.getTeacherByUserIdFromDb(currentUser.id);
  
  if (!teacher) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Teacher profile not found');
  }
  
  const result = await TeacherService.getTeacherCoursesFromDb(teacher.id);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Teacher courses retrieved successfully',
    data: result,
  });
});

const getMyStudents = catchAsync(async (req, res) => {
  const currentUser = req.user as JwtPayload;
  
  // Find teacher by userId
  const teacher = await TeacherService.getTeacherByUserIdFromDb(currentUser.id);
  
  if (!teacher) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Teacher profile not found');
  }
  
  const result = await TeacherService.getTeacherStudentsFromDb(teacher.id);
  
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Teacher students retrieved successfully',
    data: result,
  });
});

const updateTeacher = catchAsync(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user as JwtPayload;

  if (currentUser.role === Role.TEACHER) {
    const teacher = await TeacherService.getSingleTeacherFromDb(id as string);
    if (teacher.userId !== currentUser.id) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You can only update your own teacher profile');
    }
  }

  const result = await TeacherService.updateTeacherInDb(id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Teacher updated successfully',
    data: result,
  });
});

const deleteTeacher = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TeacherService.deleteTeacherFromDb(id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Teacher deleted successfully',
    data: result,
  });
});

export const TeacherController = {
  createTeacher,
  getAllTeachers,
  getSingleTeacher,
  getMyProfile,
  getMyCourses,
  getMyStudents,
  updateTeacher,
  deleteTeacher,
};
