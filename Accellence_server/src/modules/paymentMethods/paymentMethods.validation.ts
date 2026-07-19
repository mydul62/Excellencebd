import { z } from 'zod';

const createPaymentMethodSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    accountNumber: z.string().trim().min(1, 'Account number is required'),
    accountName: z.string().trim().min(1, 'Account name is required'),
    accountType: z.string().trim().min(1, 'Account type is required'),
    instructions: z.string().trim().optional(),
    isActive: z
      .union([z.boolean(), z.string()])
      .transform((v) => {
        if (typeof v === 'string') return v === 'true';
        return v;
      })
      .optional(),
  }),
});

const updatePaymentMethodSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    accountNumber: z.string().trim().min(1).optional(),
    accountName: z.string().trim().min(1).optional(),
    accountType: z.string().trim().min(1).optional(),
    instructions: z.string().trim().optional(),
    isActive: z
      .union([z.boolean(), z.string()])
      .transform((v) => {
        if (typeof v === 'string') return v === 'true';
        return v;
      })
      .optional(),
  }),
});

export const PaymentMethodValidation = {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
};
