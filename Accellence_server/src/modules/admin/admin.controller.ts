import { catchAsync } from '../../app/helper/catchAsync'
import { sendResponse } from '../../app/shared/sendResponse'
import httpStatus from 'http-status'
import { AdminService } from './admin.service'
import { JwtPayload } from 'jsonwebtoken'

const getAdminProfile = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload
  const result = await AdminService.getAdminProfileInDb(user)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Admin profile retrieved successfully',
    data: result,
  })
})

const updateAdminProfile = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload
  const result = await AdminService.updateAdminProfileInDb(user, req.body)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Admin profile updated successfully',
    data: result,
  })
})

const changeAdminPassword = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload
  await AdminService.changeAdminPasswordInDb(user, req.body)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
  })
})

export const AdminController = {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
}
