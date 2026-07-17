import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { NoticeService } from './notices.service';
import { noticeFilterableFields } from './notices.constant';
import httpStatus from 'http-status';

const createNotice = catchAsync(async (req, res) => {
  const result = await NoticeService.createNoticeInDb(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Notice created successfully',
    data: result,
  });
});

const getAllNotices = catchAsync(async (req, res) => {
  const filters: Record<string, any> = {};
  noticeFilterableFields.forEach((field) => {
    if (req.query[field] !== undefined) {
      filters[field] = req.query[field];
    }
  });

  const result = await NoticeService.getAllNoticesFromDb(filters, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Notices retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSingleNotice = catchAsync(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await NoticeService.getSingleNoticeFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Notice retrieved successfully',
    data: result,
  });
});

const updateNotice = catchAsync(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await NoticeService.updateNoticeInDb(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Notice updated successfully',
    data: result,
  });
});

const deleteNotice = catchAsync(async (req, res) => {
  const { id } = req.params as { id: string };
  const result = await NoticeService.deleteNoticeFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Notice deleted successfully',
    data: result,
  });
});

export const NoticeController = {
  createNotice,
  getAllNotices,
  getSingleNotice,
  updateNotice,
  deleteNotice,
};


