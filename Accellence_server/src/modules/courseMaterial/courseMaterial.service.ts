import { CourseMaterial } from '@prisma/client';
import { Request, Response } from 'express';
import { Readable } from 'stream';
import https from 'https';
import http from 'http';
import prisma from '../../app/shared/prisma';
import ApiError from '../../app/error/ApiError';
import { cloudinaryUpload } from '../../app/config/cloudinary.config';
import { COURSE_MATERIAL_CLOUDINARY_FOLDER } from './courseMaterial.constant';

// ─── types ───────────────────────────────────────────────────────────────────

type AuthUser = { id: string; role: string };

interface UploadedPdf {
  secureUrl: string;
  publicId: string;
  bytes: number | null;
}

// ─── upload buffer to Cloudinary as raw ──────────────────────────────────────

function uploadBufferToCloudinary(
  buffer: Buffer,
  originalName: string,
): Promise<UploadedPdf> {
  return new Promise((resolve, reject) => {
    // Strip extension from filename to use as public_id prefix, Cloudinary appends extension
    const baseName = originalName.replace(/\.[^.]+$/, '');
    const sanitized = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);

    const uploadStream = cloudinaryUpload.uploader.upload_stream(
      {
        folder: COURSE_MATERIAL_CLOUDINARY_FOLDER,
        resource_type: 'raw',
        public_id: sanitized,
        format: 'pdf',
        type: 'upload',          // ensure public (not authenticated) delivery
        access_mode: 'public',   // explicitly mark as publicly accessible
      },
      (error, result) => {
        if (error || !result) {
          reject(new ApiError(500, error?.message ?? 'Cloudinary upload failed'));
          return;
        }
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes ?? null,
        });
      },
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

// ─── uploadMaterial ──────────────────────────────────────────────────────────

const uploadMaterial = async (req: Request): Promise<CourseMaterial> => {
  const user = req.user as AuthUser;
  const { courseId, title, description } = req.body as {
    courseId: string;
    title: string;
    description?: string;
  };

  // multer memoryStorage puts the file in req.file.buffer
  const multerFile = req.file as
    | { buffer?: Buffer; originalname?: string }
    | undefined;

  if (!multerFile?.buffer) {
    throw new ApiError(400, 'PDF file is required');
  }

  // Guard: teacher profile must exist
  const teacher = await prisma.teacher.findFirst({
    where: { userId: user.id },
  });
  if (!teacher) {
    throw new ApiError(403, 'Teacher profile not found');
  }

  // Guard: course must exist and be assigned to this teacher
  const course = await prisma.course.findUniqueOrThrow({
    where: { id: courseId },
  });
  if (course.teacherId !== teacher.id) {
    throw new ApiError(403, 'You can only upload materials to your own courses');
  }

  // Upload to Cloudinary with correct resource_type: 'raw'
  const uploaded = await uploadBufferToCloudinary(
    multerFile.buffer,
    multerFile.originalname ?? 'material.pdf',
  );

  const material = await prisma.courseMaterial.create({
    data: {
      courseId,
      uploadedBy: user.id,
      title,
      description: description ?? null,
      fileUrl: uploaded.secureUrl,
      publicId: uploaded.publicId,
      fileSize: uploaded.bytes,
    },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      uploader: { select: { id: true, name: true } },
    },
  });

  return material;
};

// ─── getMaterialsByCourse ────────────────────────────────────────────────────

const getMaterialsByCourse = async (
  courseId: string,
  user: AuthUser,
): Promise<CourseMaterial[]> => {
  const { id: userId, role } = user;

  if (role === 'ADMIN') {
    // Admin: unrestricted access
  } else if (role === 'TEACHER') {
    // Teacher: must be the assigned teacher of the course
    const teacher = await prisma.teacher.findFirst({ where: { userId } });
    if (!teacher) {
      throw new ApiError(403, 'Teacher profile not found');
    }
    const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId } });
    if (course.teacherId !== teacher.id) {
      throw new ApiError(403, 'You can only view materials for your own courses');
    }
  } else if (role === 'STUDENT') {
    // Student: must have an approved enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId, enrollmentStatus: 'approved' },
    });
    if (!enrollment) {
      throw new ApiError(403, 'You must be enrolled in this course to view materials');
    }
  } else {
    throw new ApiError(403, 'Access denied');
  }

  return prisma.courseMaterial.findMany({
    where: { courseId },
    orderBy: { createdAt: 'desc' },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      uploader: { select: { id: true, name: true } },
    },
  });
};

// ─── deleteMaterial ──────────────────────────────────────────────────────────

const deleteMaterial = async (
  id: string,
  user: AuthUser,
): Promise<CourseMaterial> => {
  const material = await prisma.courseMaterial.findUniqueOrThrow({ where: { id } });

  if (user.role === 'TEACHER') {
    // Teacher can only delete their own uploads
    if (material.uploadedBy !== user.id) {
      throw new ApiError(403, 'You can only delete your own uploaded materials');
    }
  } else if (user.role !== 'ADMIN') {
    throw new ApiError(403, 'Access denied');
  }

  // Delete the raw file from Cloudinary
  if (material.publicId) {
    await cloudinaryUpload.uploader.destroy(material.publicId, {
      resource_type: 'raw',
    });
  }

  return prisma.courseMaterial.delete({ where: { id } });
};

// ─── downloadMaterial ────────────────────────────────────────────────────────

/**
 * Proxy-download: fetch the PDF from Cloudinary server-side using a signed URL,
 * then stream it to the browser. This bypasses Cloudinary's account-level
 * access restrictions because the server authenticates with the Cloudinary API.
 */
const downloadMaterial = async (
  id: string,
  user: AuthUser,
  res: Response,
): Promise<void> => {
  const material = await prisma.courseMaterial.findUniqueOrThrow({ where: { id } });

  // Same access guards as getMaterialsByCourse
  if (user.role === 'ADMIN') {
    // unrestricted
  } else if (user.role === 'TEACHER') {
    const teacher = await prisma.teacher.findFirst({ where: { userId: user.id } });
    if (!teacher) throw new ApiError(403, 'Teacher profile not found');
    const course = await prisma.course.findUniqueOrThrow({ where: { id: material.courseId } });
    if (course.teacherId !== teacher.id) throw new ApiError(403, 'Access denied');
  } else if (user.role === 'STUDENT') {
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: user.id, courseId: material.courseId, enrollmentStatus: 'approved' },
    });
    if (!enrollment) throw new ApiError(403, 'You must be enrolled to download this material');
  } else {
    throw new ApiError(403, 'Access denied');
  }

  // Generate a signed download URL valid for 60 seconds
  const signedUrl = cloudinaryUpload.utils.private_download_url(
    material.publicId,
    'pdf',
    {
      resource_type: 'raw',
      type: 'upload',
      expires_at: Math.floor(Date.now() / 1000) + 60,
      attachment: true,
    },
  );

  // Proxy the file to the client
  const protocol = signedUrl.startsWith('https') ? https : http;
  await new Promise<void>((resolve, reject) => {
    protocol.get(signedUrl, (upstream) => {
      if (upstream.statusCode && upstream.statusCode >= 400) {
        reject(new ApiError(upstream.statusCode, 'Failed to fetch file from storage'));
        return;
      }
      const filename = material.publicId.split('/').pop() ?? 'material.pdf';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      if (upstream.headers['content-length']) {
        res.setHeader('Content-Length', upstream.headers['content-length']);
      }
      upstream.pipe(res);
      upstream.on('end', resolve);
      upstream.on('error', reject);
    }).on('error', reject);
  });
};

// ─── export ─────────────────────────────────────────────────────────────────

export const CourseMaterialService = {
  uploadMaterial,
  getMaterialsByCourse,
  deleteMaterial,
  downloadMaterial,
};
