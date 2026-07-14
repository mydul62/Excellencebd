import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { StudentService } from './students.service';
import httpStatus from 'http-status';

const createStudent = catchAsync(async (req, res) => {
  const result = await StudentService.createStudentInDb(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Student created successfully',
    data: result,
  });
});

const getAllStudents = catchAsync(async (req, res) => {
  const filters = {
    searchTerm: req.query.searchTerm as string,
    email: req.query.email as string,
    status: req.query.status as string,
  };
  const result = await StudentService.getAllStudentsFromDb(filters, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Students retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSingleStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StudentService.getSingleStudentFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Student retrieved successfully',
    data: result,
  });
});

const updateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StudentService.updateStudentInDb(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Student updated successfully',
    data: result,
  });
});

const deleteStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StudentService.deleteStudentFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Student deleted successfully',
    data: result,
  });
});

export const StudentController = {
  createStudent,
  getAllStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};
