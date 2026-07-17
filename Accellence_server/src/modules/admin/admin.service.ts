import prisma from '../../app/shared/prisma'
import bcrypt from 'bcryptjs'
import ApiError from '../../app/error/ApiError'
import httpStatus from 'http-status'
import { JwtPayload } from 'jsonwebtoken'

const getAdminProfileInDb = async (user: JwtPayload) => {
  const admin = await prisma.user.findUniqueOrThrow({
    where: { email: user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      adminProfile: {
        select: { id: true, createdAt: true, updatedAt: true },
      },
    },
  })

  return {
    ...admin,
    status: 'Active',
  }
}

const updateAdminProfileInDb = async (user: JwtPayload, payload: { name?: string; avatar?: string | null; phone?: string | null }) => {
  const currentUser = await prisma.user.findUnique({ where: { email: user.email } })
  if (!currentUser || currentUser.role !== 'ADMIN') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can update this profile')
  }

  const safePayload: Record<string, unknown> = {}
  if (payload.name) safePayload.name = payload.name.trim()
  if (payload.phone !== undefined) safePayload.phone = payload.phone?.trim() || null
  if (payload.avatar !== undefined) safePayload.avatar = payload.avatar?.trim() || null

  const updated = await prisma.user.update({
    where: { email: user.email },
    data: safePayload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return {
    ...updated,
    status: 'Active',
  }
}

const changeAdminPasswordInDb = async (
  user: JwtPayload,
  payload: { oldPassword: string; newPassword: string; confirmPassword: string },
) => {
  if (payload.newPassword !== payload.confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'New password and confirmation do not match')
  }

  const currentUser = await prisma.user.findUnique({ where: { email: user.email } })
  if (!currentUser) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized')
  }

  const isPasswordValid = await bcrypt.compare(payload.oldPassword, currentUser.password)
  if (!isPasswordValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Current password is incorrect')
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, 10)

  await prisma.user.update({
    where: { email: user.email },
    data: { password: hashedPassword },
  })
}

export const AdminService = {
  getAdminProfileInDb,
  updateAdminProfileInDb,
  changeAdminPasswordInDb,
}
