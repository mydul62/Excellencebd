import { JwtPayload } from 'jsonwebtoken';
import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { AuthService } from './auth.service';
import httpStatus from 'http-status';
import { ClientPageRoot } from 'next/dist/client/components/client-page';

const registerUser = catchAsync(async (req, res) => {
  const result = await AuthService.authRegisterInToDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Student registered successfully',
    data: result,
  });
});

const logingUser = catchAsync(async (req, res) => {
   console.log("req.body", req.body);
  const result = await AuthService.authLogingInToDb(req.body);

  res.cookie('refreshToken', result.refreshToken, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

const refeshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthService.refeshTokenInToForDb(refreshToken);

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
