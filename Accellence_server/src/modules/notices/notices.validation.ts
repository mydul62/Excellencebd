import { z } from 'zod';
import { NoticeCategory, NoticeAudience } from '@prisma/client';

const createNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    category: z.nativeEnum(NoticeCategory).optional(),
    audience: z.nativeEnum(NoticeAudience).optional(),
    date: z.string().datetime().optional(),
    author: z.string().min(1, 'Author is required'),
  }),
});

const updateNoticeSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    category: z.nativeEnum(NoticeCategory).optional(),
    audience: z.nativeEnum(NoticeAudience).optional(),
    date: z.string().datetime().optional(),
    author: z.string().min(1).optional(),
  }),
});

export const NoticeValidation = {
  createNoticeSchema,
  updateNoticeSchema,
};


