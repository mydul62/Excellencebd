import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { TeacherService } from './teachers.service';
import { teacherFilterableFields } from './teachers.constant';
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
  const result = await TeacherService.getSingleTeacherFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Teacher retrieved successfully',
    data: result,
  });
});

const updateTeacher = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TeacherService.updateTeacherInDb(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Teacher updated successfully',
    data: result,
  });
});

const deleteTeacher = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TeacherService.deleteTeacherFromDb(id);
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
  updateTeacher,
  deleteTeacher,
};
