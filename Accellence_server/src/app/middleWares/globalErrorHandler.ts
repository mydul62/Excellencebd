import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import ApiError from '../error/ApiError';

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Zod validation errors → 400 with a readable message
  if (err instanceof ZodError) {
    const message = err.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.errors : undefined,
    });
  }

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
