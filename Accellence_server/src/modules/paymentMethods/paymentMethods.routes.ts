import express from 'express';
import { Role } from '@prisma/client';
import auth from '../../app/middleWares/auth';
import { validateRequest } from '../../app/middleWares/validationRequest';
import { multerUpload } from '../../app/config/multer-config';
import { PaymentMethodController } from './paymentMethods.controller';
import { PaymentMethodValidation } from './paymentMethods.validation';

const router = express.Router();

// ─── Public / Student: active methods only ────────────────────────────────────
// GET /api/payment-methods/active
router.get(
  '/active',
  auth(Role.ADMIN, Role.STUDENT, Role.TEACHER),
  PaymentMethodController.getActivePaymentMethods,
);

// ─── Admin: list all (including inactive) ────────────────────────────────────
// GET /api/payment-methods
router.get(
  '/',
  auth(Role.ADMIN),
  PaymentMethodController.getAllPaymentMethods,
);

// ─── Shared: single record ────────────────────────────────────────────────────
// GET /api/payment-methods/:id
router.get(
  '/:id',
  auth(Role.ADMIN, Role.STUDENT, Role.TEACHER),
  PaymentMethodController.getSinglePaymentMethod,
);

// ─── Admin: create (multipart/form-data with optional logo file) ──────────────
// POST /api/payment-methods
router.post(
  '/',
  auth(Role.ADMIN),
  multerUpload.single('logo'),
  validateRequest(PaymentMethodValidation.createPaymentMethodSchema),
  PaymentMethodController.createPaymentMethod,
);

// ─── Admin: update (multipart/form-data, logo optional) ──────────────────────
// PATCH /api/payment-methods/:id
router.patch(
  '/:id',
  auth(Role.ADMIN),
  multerUpload.single('logo'),
  validateRequest(PaymentMethodValidation.updatePaymentMethodSchema),
  PaymentMethodController.updatePaymentMethod,
);

// ─── Admin: delete ────────────────────────────────────────────────────────────
// DELETE /api/payment-methods/:id
router.delete(
  '/:id',
  auth(Role.ADMIN),
  PaymentMethodController.deletePaymentMethod,
);

export const PaymentMethodRoutes = router;
