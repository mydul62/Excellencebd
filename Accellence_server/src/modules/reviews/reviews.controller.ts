import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { ReviewService } from './reviews.service';
import { reviewFilterableFields } from './reviews.constant';
import httpStatus from 'http-status';

const createReview = catchAsync(async (req, res) => {
  const result = await ReviewService.createReviewInDb(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Review created successfully',
    data: result,
  });
});

const getAllReviews = catchAsync(async (req, res) => {
  const filters: Record<string, any> = {};
  reviewFilterableFields.forEach((field) => {
    if (req.query[field] !== undefined) {
      if (field === 'featured') {
        filters[field] = req.query[field] === 'true';
      } else {
        filters[field] = req.query[field];
      }
    }
  });

  const result = await ReviewService.getAllReviewsFromDb(filters, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Reviews retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSingleReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReviewService.getSingleReviewFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Review retrieved successfully',
    data: result,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReviewService.updateReviewInDb(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Review updated successfully',
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReviewService.deleteReviewFromDb(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Review deleted successfully',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};


