import { z } from 'zod';

export const PhotoGalleryValidation = {
  createPhotoSchema: z.object({
    body: z.object({
      title: z.string().trim().max(120).optional(),
      description: z.string().trim().max(500).optional(),
      category: z.string().trim().optional(),
    }),
  }),
  updatePhotoSchema: z.object({
    body: z.object({
      title: z.string().trim().max(120).optional(),
      description: z.string().trim().max(500).optional(),
      category: z.string().trim().optional(),
    }),
  }),
};
