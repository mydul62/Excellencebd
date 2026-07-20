import httpStatus from 'http-status';
import { catchAsync } from '../../app/helper/catchAsync';
import { sendResponse } from '../../app/shared/sendResponse';
import { PaymentMethodService } from './paymentMethods.service';
import { IPaymentMethodFilters } from './paymentMethods.interface';

const filterableFields = ['searchTerm', 'isActive', 'accountType'];

// ─── Admin: create ────────────────────────────────────────────────────────────

const createPaymentMethod = catchAsync(async (req, res) => {
  const file = req.file as Express.Multer.File | undefined;
  const result = await PaymentMethodService.createPaymentMethodInDb(
    req.body,
    file,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Payment method created successfully',
    data: result,
  });
});

// ─── Public / Student: list active only ──────────────────────────────────────

const getActivePaymentMethods = catchAsync(async (req, res) => {
  const filters: IPaymentMethodFilters = {};
  filterableFields.forEach((field) => {
    if (req.query[field] !== undefined) {
      (filters as any)[field] = req.query[field];
    }
  });

  const result = await PaymentMethodService.getAllPaymentMethodsFromDb(
    filters,
    req.query,
    true, // onlyActive = true
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Active payment methods retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// ─── Admin: list all ─────────────────────────────────────────────────────────

const getAllPaymentMethods = catchAsync(async (req, res) => {
  const filters: IPaymentMethodFilters = {};
  filterableFields.forEach((field) => {
    if (req.query[field] !== undefined) {
      (filters as any)[field] = req.query[field];
    }
  });

  // Parse isActive query param string → boolean
  if (typeof filters.isActive === 'string') {
    (filters as any).isActive = filters.isActive === 'true';
  }

  const result = await PaymentMethodService.getAllPaymentMethodsFromDb(
    filters,
    req.query,
    false,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment methods retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// ─── Shared: single record ────────────────────────────────────────────────────

const getSinglePaymentMethod = catchAsync(async (req, res) => {
  const result = await PaymentMethodService.getSinglePaymentMethodFromDb(
    req.params.id as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment method retrieved successfully',
    data: result,
  });
});

// ─── Admin: update ────────────────────────────────────────────────────────────

const updatePaymentMethod = catchAsync(async (req, res) => {
  const file = req.file as Express.Multer.File | undefined;
  const result = await PaymentMethodService.updatePaymentMethodInDb(
    req.params.id as string,
    req.body,
    file,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment method updated successfully',
    data: result,
  });
});

// ─── Admin: delete ────────────────────────────────────────────────────────────

const deletePaymentMethod = catchAsync(async (req, res) => {
  const result = await PaymentMethodService.deletePaymentMethodInDb(
    req.params.id as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment method deleted successfully',
    data: result,
  });
});

export const PaymentMethodController = {
  createPaymentMethod,
  getActivePaymentMethods,
  getAllPaymentMethods,
  getSinglePaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
};
