import { NextFunction, Request, Response } from 'express';
import { Jwthelper } from '../helper/jwtHelper';
import config from '../config';
import ApiError from '../error/ApiError';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { Role } from '../../generated/prisma';

const auth = (...roles: Role[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      // Support both "Bearer <token>" and raw token
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      const verifiedUser = Jwthelper.verifyToken(
        token,
        config.jwt.jwt_scret as string
      ) as JwtPayload;

      if (roles.length && !roles.includes(verifiedUser.role as Role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You are forbidden');
      }

      req.user = verifiedUser;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;

