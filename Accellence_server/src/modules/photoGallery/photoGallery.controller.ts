import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { PhotoGalleryService } from './photoGallery.service';
import httpStatus from 'http-status';

const createPhoto = catchAsync(async (req, res) => {
  const result = await PhotoGalleryService.createPhotoInDb(req as any);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Photo uploaded successfully',
    data: result,
  });
});

const getAllPhotos = catchAsync(async (req, res) => {
  const result = await PhotoGalleryService.getAllPhotosFromDb(req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Photos retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSinglePhoto = catchAsync(async (req, res) => {
  const result = await PhotoGalleryService.getSinglePhotoFromDb(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Photo retrieved successfully',
    data: result,
  });
});

const updatePhoto = catchAsync(async (req, res) => {
  const result = await PhotoGalleryService.updatePhotoInDb(req.params.id, req as any);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Photo updated successfully',
    data: result,
  });
});

const deletePhoto = catchAsync(async (req, res) => {
  const result = await PhotoGalleryService.deletePhotoFromDb(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Photo deleted successfully',
    data: result,
  });
});

export const PhotoGalleryController = {
  createPhoto,
  getAllPhotos,
  getSinglePhoto,
  updatePhoto,
  deletePhoto,
};
