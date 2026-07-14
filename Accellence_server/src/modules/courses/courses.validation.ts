import { z } from 'zod';
import { CourseLevel } from '../../generated/prisma';

const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().min(1, 'Description is required'),
    duration: z.string().min(1, 'Duration is required'),
    price: z.number().nonnegative('Price must be non-negative'),
    level: z.nativeEnum(CourseLevel).default(CourseLevel.Beginner),
    icon: z.string().optional(),
    seats: z.number().int().positive().default(30),
    rating: z.number().min(0).max(5).optional(),
    popular: z.boolean().optional(),
  }),
});

const updateCourseSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    duration: z.string().min(1).optional(),
    price: z.number().nonnegative().optional(),
    level: z.nativeEnum(CourseLevel).optional(),
    icon: z.string().optional(),
    seats: z.number().int().positive().optional(),
    rating: z.number().min(0).max(5).optional(),
    popular: z.boolean().optional(),
  }),
});

export const CourseValidation = {
  createCourseSchema,
  updateCourseSchema,
};


