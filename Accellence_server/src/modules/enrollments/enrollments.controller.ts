import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { EnrollmentService } from './enrollments.service';
import { enrollmentFilterableFields } from './enrollments.constant';
import httpStatus from 'http-status';

// ─── Create ───────────────────────────────────────────────────────────────────

const createEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.createEnrollmentInDb(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Enrollment submitted successfully. Awaiting admin approval.',
    data: result,
  });
});

// ─── List all (admin) or own (student/teacher) ───────────────────────────────

const getAllEnrollments = catchAsync(async (req, res) => {
  const user = (req as any).user;
  const filters: Record<string, any> = {};
  enrollmentFilterableFields.forEach((field) => {
    if (req.query[field] !== undefined) filters[field] = req.query[field];
  });

  // Non-admin users can only see their own enrollments
  if (user.role !== 'ADMIN') {
    filters.userId = user.id;
  }

  const result = await EnrollmentService.getAllEnrollmentsFromDb(filters, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollments retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// ─── Single ───────────────────────────────────────────────────────────────────

const getSingleEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.getSingleEnrollmentFromDb(
    req.params.id as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollment retrieved successfully',
    data: result,
  });
});

// ─── Admin update (manual patch) ─────────────────────────────────────────────

const updateEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.updateEnrollmentInDb(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollment updated successfully',
    data: result,
  });
});

// ─── Approve ─────────────────────────────────────────────────────────────────

const approveEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.approveEnrollmentInDb(
    req.params.id as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollment approved successfully',
    data: result,
  });
});

// ─── Reject ───────────────────────────────────────────────────────────────────

const rejectEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.rejectEnrollmentInDb(
    req.params.id as string,
    req.body.reason,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollment rejected',
    data: result,
  });
});

// ─── Student resubmit ────────────────────────────────────────────────────────

const resubmitEnrollment = catchAsync(async (req, res) => {
  const user = (req as any).user;
  const result = await EnrollmentService.resubmitEnrollmentInDb(
    req.params.id as string,
    user.id,
    req.body,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollment resubmitted successfully. Awaiting admin review.',
    data: result,
  });
});

// ─── Delete ───────────────────────────────────────────────────────────────────

const deleteEnrollment = catchAsync(async (req, res) => {
  const result = await EnrollmentService.deleteEnrollmentFromDb(
    req.params.id as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Enrollment deleted successfully',
    data: result,
  });
});

// ─── Mine (student) ───────────────────────────────────────────────────────────

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

// ─── Check ────────────────────────────────────────────────────────────────────

const checkEnrollment = catchAsync(async (req, res) => {
  const user = (req as any).user;
  const result = await EnrollmentService.checkEnrollmentExists(
    user.id,
    req.params.courseId as string,
  );
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
  resubmitEnrollment,
  deleteEnrollment,
};
