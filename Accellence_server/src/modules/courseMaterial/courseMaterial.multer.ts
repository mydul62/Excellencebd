import multer from 'multer';
import { COURSE_MATERIAL_MAX_FILE_SIZE_BYTES, COURSE_MATERIAL_ALLOWED_MIME } from './courseMaterial.constant';

/**
 * Use memory storage — we upload to Cloudinary manually in the service
 * so we can set resource_type: 'raw' correctly and get back the real URL.
 * multer-storage-cloudinary silently ignores resource_type in the URL it builds,
 * so we bypass it entirely for PDFs.
 */
const pdfFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  if (file.mimetype === COURSE_MATERIAL_ALLOWED_MIME) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

export const pdfUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: COURSE_MATERIAL_MAX_FILE_SIZE_BYTES,
    files: 1,
  },
});
