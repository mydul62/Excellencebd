import prisma from '../../app/shared/prisma';
import { cloudinaryUpload } from '../../app/config/cloudinary.config';

const getOptimizedImageUrl = (publicId: string) => {
  return cloudinaryUpload.url(publicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
    crop: 'limit',
  });
};

const createPhotoInDb = async (req: any) => {
  const files = req.files as Array<{ path?: string; filename?: string; size?: number; mimetype?: string }> | undefined;
  const body = req.body ?? {};

  if (!files || files.length === 0) {
    throw new Error('At least one image is required');
  }

  const uploadedItems = await Promise.all(
    files.map(async (file) => {
      const publicId = file.filename || '';
      const imageUrl = publicId ? getOptimizedImageUrl(publicId) : (file.path || '');

      return prisma.photoGallery.create({
        data: {
          title: body.title ?? null,
          description: body.description ?? null,
          category: body.category ?? 'memories',
          imageUrl,
          publicId,
        },
      });
    })
  );

  return uploadedItems;
};

const getAllPhotosFromDb = async (query: Record<string, unknown>) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 12;
  const skip = (page - 1) * limit;
  const searchTerm = String(query?.searchTerm || '');
  const category = String(query?.category || '');

  const where: any = {};
  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const [data, total] = await Promise.all([
    prisma.photoGallery.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.photoGallery.count({ where }),
  ]);

  return {
    meta: { page, limit, total },
    data,
  };
};

const getSinglePhotoFromDb = async (id: string) => {
  return prisma.photoGallery.findUniqueOrThrow({ where: { id } });
};

const updatePhotoInDb = async (id: string, req: any) => {
  const body = req.body ?? {};
  const file = req.file as { path?: string; filename?: string } | undefined;

  const data: Record<string, unknown> = {
    title: body.title ?? undefined,
    description: body.description ?? undefined,
    category: body.category ?? undefined,
  };

  if (file?.path) {
    const existing = await prisma.photoGallery.findUniqueOrThrow({ where: { id } });
    if (existing.publicId) {
      await cloudinaryUpload.uploader.destroy(existing.publicId);
    }
    data.imageUrl = file.filename ? getOptimizedImageUrl(file.filename) : file.path;
    data.publicId = file.filename;
  }

  return prisma.photoGallery.update({ where: { id }, data });
};

const deletePhotoFromDb = async (id: string) => {
  const existing = await prisma.photoGallery.findUniqueOrThrow({ where: { id } });
  if (existing.publicId) {
    await cloudinaryUpload.uploader.destroy(existing.publicId);
  }
  return prisma.photoGallery.delete({ where: { id } });
};

export const PhotoGalleryService = {
  createPhotoInDb,
  getAllPhotosFromDb,
  getSinglePhotoFromDb,
  updatePhotoInDb,
  deletePhotoFromDb,
};
