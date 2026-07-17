import { z } from 'zod';

const createReviewSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    avatar: z.string().url().optional().nullable(),
    role: z.string().optional().nullable(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1, 'Comment is required'),
    featured: z.boolean().optional(),
    userId: z.string().optional(),
    courseId: z.string().optional(),
  }),
});

const updateReviewSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    avatar: z.string().url().optional().nullable(),
    role: z.string().optional().nullable(),
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(1).optional(),
    featured: z.boolean().optional(),
  }),
});

export const ReviewValidation = {
  createReviewSchema,
  updateReviewSchema,
};
