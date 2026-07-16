import express from 'express'
import auth from '../../app/middleWares/auth'
import { Role } from '../../generated/prisma'
import { EnrollmentController } from '../enrollments/enrollments.controller'
import { AdminController } from './admin.controller'
import { validateRequest } from '../../app/middleWares/validationRequest'
import { AdminValidation } from './admin.validation'

const router = express.Router()

router.get('/enrollments', auth(Role.ADMIN), EnrollmentController.getAllEnrollments)
router.get('/enrollments/:id', auth(Role.ADMIN), EnrollmentController.getSingleEnrollment)
router.patch('/enrollments/:id/approve', auth(Role.ADMIN), EnrollmentController.approveEnrollment)
router.patch('/enrollments/:id/reject', auth(Role.ADMIN), EnrollmentController.rejectEnrollment)

router.get('/profile', auth(Role.ADMIN), AdminController.getAdminProfile)
router.put('/profile', auth(Role.ADMIN), validateRequest(AdminValidation.updateAdminProfileSchema), AdminController.updateAdminProfile)
router.put('/change-password', auth(Role.ADMIN), validateRequest(AdminValidation.changeAdminPasswordSchema), AdminController.changeAdminPassword)

export const AdminRoutes = router

