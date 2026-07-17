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
      // Authorization Header অথবা Cookie — যেটা আছে সেটাই ব্যবহার করবে
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
          "You are not authorized"
        );
      }

      const verifiedUser = Jwthelper.verifyToken(
        token,
        config.jwt.jwt_scret as string
      ) as JwtPayload;

      if (
        roles.length &&
        !roles.includes(verifiedUser.role as Role)
      ) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "You are forbidden"
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