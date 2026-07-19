import { z } from 'zod';

const uploadSchema = z.object({
  body: z.object({
    courseId: z
      .string({ required_error: 'courseId is required' })
      .uuid({ message: 'courseId must be a valid UUID' }),
    title: z
      .string({ required_error: 'title is required' })
      .min(3, 'title must be at least 3 characters')
      .max(200, 'title must be at most 200 characters'),
    description: z
      .string()
      .max(500, 'description must be at most 500 characters')
      .optional(),
  }),
});

export const CourseMaterialValidation = {
  uploadSchema,
};
