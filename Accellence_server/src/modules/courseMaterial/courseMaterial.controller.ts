import httpStatus from 'http-status';
import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { CourseMaterialService } from './courseMaterial.service';

const uploadMaterial = catchAsync(async (req, res) => {
  const result = await CourseMaterialService.uploadMaterial(req);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Course material uploaded successfully',
    data: result,
  });
});

const getMaterialsByCourse = catchAsync(async (req, res) => {
  const courseId = req.params.courseId as string;
  const user = req.user as { id: string; role: string };
  const result = await CourseMaterialService.getMaterialsByCourse(courseId, user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Course materials retrieved successfully',
    data: result,
  });
});

const deleteMaterial = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const user = req.user as { id: string; role: string };
  const result = await CourseMaterialService.deleteMaterial(id, user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Course material deleted successfully',
    data: result,
  });
});

const downloadMaterial = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const user = req.user as { id: string; role: string };
  // Service streams the response directly — nothing to sendResponse
  await CourseMaterialService.downloadMaterial(id, user, res);
});

export const CourseMaterialController = {
  uploadMaterial,
  getMaterialsByCourse,
  deleteMaterial,
  downloadMaterial,
};
