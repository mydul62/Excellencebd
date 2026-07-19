import { z } from 'zod';

const createCourseReviewSchema = z.object({
  body: z.object({
    courseId: z.string().uuid('Invalid courseId'),
    rating: z
      .number({ required_error: 'Rating is required' })
      .int()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5'),
    comment: z
      .string({ required_error: 'Comment is required' })
      .trim()
      .min(5, 'Comment must be at least 5 characters')
      .max(1000, 'Comment must be at most 1000 characters'),
  }),
});

const updateCourseReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().trim().min(5).max(1000).optional(),
  }),
});

export const CourseReviewValidation = {
  createCourseReviewSchema,
  updateCourseReviewSchema,
};
