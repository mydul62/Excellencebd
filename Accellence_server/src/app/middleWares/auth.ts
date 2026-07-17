import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import { Role } from "@prisma/client";

import { Jwthelper } from "../helper/jwtHelper";
import config from "../config";
import ApiError from "../error/ApiError";

const auth = (...roles: Role[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Check Authorization Header or Cookie
      const authHeader = req.headers.authorization;
      const cookieToken = req.cookies?.bf_access_token;

      let token: string | undefined;

      if (authHeader) {
        token = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7)
          : authHeader;
      } else if (cookieToken) {
        token = cookieToken;
      }

      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Authentication required. Please provide a valid access token."
        );
      }

      // Verify token
      let verifiedUser: JwtPayload;
      try {
        verifiedUser = Jwthelper.verifyToken(
          token,
          config.jwt.jwt_scret as string
        ) as JwtPayload;
      } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Access token has expired. Please refresh your token."
          );
        } else if (err.name === 'JsonWebTokenError') {
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Invalid access token. Please login again."
          );
        }
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Token verification failed. Please login again."
        );
      }

      // Check role authorization
      if (roles.length && !roles.includes(verifiedUser.role as Role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Access denied. This route requires one of the following roles: ${roles.join(', ')}. Your role: ${verifiedUser.role}`
        );
      }

      req.user = verifiedUser;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;