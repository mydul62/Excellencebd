import { JwtPayload } from 'jsonwebtoken';
import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { AuthService } from './auth.service';
import httpStatus from 'http-status';
const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
};

const registerUser = catchAsync(async (req, res) => {
  const result = await AuthService.authRegisterInToDB(req.body);

  res.cookie('bf_access_token', result.accessToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Student registered successfully',
    data: {
      user: result.user,
    },
  });
});

const logingUser = catchAsync(async (req, res) => {
  const result = await AuthService.authLogingInToDb(req.body);

  res.cookie('bf_access_token', result.accessToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('refreshToken', result.refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Login successful',
    data: {
      user: result.user,
    },
  });
});


const refeshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refeshTokenInToForDb(refreshToken);

  res.cookie('bf_access_token', result.accessToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Access token refreshed',
    data: result,
  });
});

const cheangePassword = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  await AuthService.chengePasswordForDb(user, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
  });
});

export const AuthController = {
  registerUser,
  logingUser,
  refeshToken,
  cheangePassword,
};
