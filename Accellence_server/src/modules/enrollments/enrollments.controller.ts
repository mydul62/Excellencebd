import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { EnrollmentService } from './enrollments.service';
import { enrollmentFilterableFields } from './enrollments.constant';
import httpStatus from 'http-status';

const createEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.createEnrollmentInDb(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Enrollment created successfully',
    data: result,
  });
});

const getAllEnrollments = catchAsync(async (req, res) => {
  const filters: Record<string, any> = {};
  enrollmentFilterableFields.forEach((field) => {
    if (req.query[field] !== undefined) filters[field] = req.query[field];
  });

  const result = await EnrollmentService.getAllEnrollmentsFromDb(filters, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollments retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSingleEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.getSingleEnrollmentFromDb(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollment retrieved successfully',
    data: result,
  });
});

const updateEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.updateEnrollmentInDb(req.params.id as string, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollment updated successfully',
    data: result,
  });
});

const approveEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.approveEnrollmentInDb(req.params.id as string, req.body?.reason);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollment approved successfully',
    data: result,
  });
});

const rejectEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.rejectEnrollmentInDb(req.params.id as string, req.body?.reason);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: req.body?.reason || 'Enrollment rejected successfully',
    data: result,
  });
});

const deleteEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.deleteEnrollmentFromDb(req.params.id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollment deleted successfully',
    data: result,
  });
});

// GET /enrollments/mine — returns the logged-in student's own enrollments
const getMyEnrollments = catchAsync(async (req, res) => {
  const user = (req as any).user;
  const filters: Record<string, any> = { userId: user.id };

  enrollmentFilterableFields.forEach((field) => {
    if (req.query[field] !== undefined && field !== 'userId') {
      filters[field] = req.query[field];
    }
  });

  const result = await EnrollmentService.getAllEnrollmentsFromDb(filters, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'My enrollments retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// GET /enrollments/check/:courseId — check if logged-in user is enrolled in a course
const checkEnrollment = catchAsync(async (req, res) => {
  const user = (req as any).user;
  const { courseId } = req.params;
  const result = await EnrollmentService.checkEnrollmentExists(user.id, courseId as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollment check complete',
    data: result,
  });
});

export const EnrollmentController = {
  createEnrollment,
  getAllEnrollments,
  getMyEnrollments,
  checkEnrollment,
  getSingleEnrollment,
  updateEnrollment,
  approveEnrollment,
  rejectEnrollment,
  deleteEnrollment,
};
