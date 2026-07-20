import { apiFetchFormData, apiGet, apiDelete } from './api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ServerCourseMaterial {
  id: string;
  courseId: string;
  uploadedBy: string;
  title: string;
  description: string | null;
  fileUrl: string;
  publicId: string;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
  course?: { id: string; title: string; slug: string } | null;
  uploader?: { id: string; name: string } | null;
}

// ─── API functions ───────────────────────────────────────────────────────────

/**
 * Upload a PDF material for a course.
 * FormData fields: file (PDF), courseId, title, description?
 */
export async function uploadCourseMaterial(
  formData: FormData,
): Promise<ServerCourseMaterial> {
  const res = await apiFetchFormData<ServerCourseMaterial>(
    '/course-material/upload',
    'POST',
    formData,
  );
  return res.data;
}

/**
 * Fetch all materials for a given course.
 * Access: ADMIN | TEACHER (own course) | STUDENT (approved enrollment)
 */
export async function getCourseMaterials(
  courseId: string,
): Promise<ServerCourseMaterial[]> {
  const res = await apiGet<ServerCourseMaterial[]>(
    `/course-material/course/${courseId}`,
  );
  return res.data;
}

/**
 * Delete a material by id.
 * Access: TEACHER (own upload) | ADMIN
 */
export async function deleteCourseMaterial(id: string): Promise<void> {
  await apiDelete<ServerCourseMaterial>(`/course-material/${id}`);
}

/**
 * Download a material via backend proxy.
 * Returns the absolute URL to hit — opens in a new tab, backend streams the file.
 * This bypasses Cloudinary account-level access restrictions.
 */
export function getCourseMaterialDownloadUrl(id: string): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
  return `${base}/course-material/download/${id}`;
}
