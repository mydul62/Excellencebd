import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../error/ApiError';

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Use the statusCode from ApiError if available, otherwise default to 500
  const statusCode =
    err instanceof ApiError
      ? err.statusCode
      : err.statusCode ?? httpStatus.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
};

export default globalErrorHandler;
