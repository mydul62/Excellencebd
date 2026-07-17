import express from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../app/middleWares/validationRequest';
import { AuthValidation } from './auth.validation';
import auth from '../../app/middleWares/auth';
import { Role } from "@prisma/client";

const router = express.Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerUserSchema),
  AuthController.registerUser
);
router.post(
  '/login',
  validateRequest(AuthValidation.loginUserSchema),
  AuthController.logingUser
);
router.post('/refresh-token', AuthController.refeshToken);
router.post(
  '/change-password',
  auth(Role.ADMIN, Role.STUDENT, Role.TEACHER),
  validateRequest(AuthValidation.changePasswordSchema),
  AuthController.cheangePassword
);

export const AuthRoutes = router;


