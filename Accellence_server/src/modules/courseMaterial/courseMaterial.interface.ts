export interface ICourseMaterialUpload {
  courseId: string;
  title: string;
  description?: string;
}

export interface ICourseMaterialFile {
  path: string;       // Cloudinary secure_url (from multer-storage-cloudinary)
  filename: string;   // Cloudinary public_id
  size?: number;
  mimetype?: string;
}
