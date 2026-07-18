import prisma from '../../app/shared/prisma';
import ApiError from '../../app/error/ApiError';
import httpStatus from 'http-status';
import { Role } from "@prisma/client";
import { createToken } from '../../app/shared/createToken';
import bcrypt from 'bcryptjs';
import config from '../../app/config';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
  phone?: string | null;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

// ─── Public register — always creates a STUDENT ───────────────────────────────
const authRegisterInToDB = async (payload: IRegisterPayload) => {
  const { name, email, password, avatar, phone } = payload;

  // Check if user already exists
  const isExistUser = await prisma.user.findFirst({ where: { email } });
  if (isExistUser) {
    throw new ApiError(httpStatus.CONFLICT, 'User already exists with this email');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Use Prisma transaction to create User and Student atomically
  const result = await prisma.$transaction(async (tx) => {
    // Create User with STUDENT role
    const registeredUser = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.STUDENT, // always STUDENT on public register
        avatar: avatar ?? null,
        phone: phone ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
      },
    });

    // Create Student profile automatically
    await tx.student.create({
      data: {
        userId: registeredUser.id,
        guardian: null,
        address: null,
        status: 'active',
      },
    });

    return registeredUser;
  });

  // Generate JWT token
  const accessToken = createToken(
    {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
    },
    config.jwt.jwt_scret as string,
    config.jwt.expires_in as string
  );

  return { user: result, accessToken };
};

// ─── Login (all roles) ────────────────────────────────────────────────────────
const authLogingInToDb = async (payload: ILoginPayload) => {
    
  const { email, password } = payload;

  const isExistUser = await prisma.user.findFirst({ where: { email } });
  ;
  if (!isExistUser) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const checkPassword = await bcrypt.compare(password, isExistUser.password);
  if (!checkPassword) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const jwtPayload = {
    id: isExistUser.id,
    name: isExistUser.name,
    email: isExistUser.email,
    role: isExistUser.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.jwt_scret as string,
    config.jwt.expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt.refresh_token_secret as string,
    config.jwt.refresh_token_expires_in as string
  );

  const { password: _pw, ...userWithoutPassword } = isExistUser;

  return { user: userWithoutPassword, accessToken, refreshToken };
};

// ─── Refresh token ────────────────────────────────────────────────────────────
const refeshTokenInToForDb = async (token: string) => {
  let decode: JwtPayload;
  try {
    decode = jwt.verify(token, config.jwt.refresh_token_secret as string) as JwtPayload;
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired refresh token');
  }

  const isExistUser = await prisma.user.findUnique({ where: { email: decode.email } });

  if (!isExistUser) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const accessToken = createToken(
    {
      id: isExistUser.id,
      name: isExistUser.name,
      email: isExistUser.email,
      role: isExistUser.role,
    },
    config.jwt.jwt_scret as string,
    config.jwt.expires_in as string
  );

  return { accessToken };
};

// ─── Change password ──────────────────────────────────────────────────────────
const chengePasswordForDb = async (
  user: JwtPayload,
  payload: { newPassword: string; oldPassword: string }
) => {
  const isExistUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (!isExistUser) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const checkPassword = await bcrypt.compare(payload.oldPassword, isExistUser.password);
  if (!checkPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Old password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

  await prisma.user.update({
    where: { email: isExistUser.email },
    data: { password: hashedPassword },
  });
};

export const AuthService = {
  authRegisterInToDB,
  authLogingInToDb,
  refeshTokenInToForDb,
  chengePasswordForDb,
};
