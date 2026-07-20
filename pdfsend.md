You are a Senior Full Stack Engineer working on the **Bright Future Coaching Center** project.

---

## IMPORTANT — READ FIRST

This project already has existing modules for:
- Photo Gallery (Cloudinary image upload)
- Enrollments (student enrollment per course)
- Teachers (teacher profile, my courses)
- Courses (course CRUD)

**DO NOT modify any of these existing modules.**
**DO NOT change any existing database tables.**
**DO NOT reuse existing upload infrastructure — build a clean, isolated module.**

---

## Feature: Course PDF Materials

### Concept

A teacher should be able to upload PDF files (study materials, notes, assignments, etc.) to any course that is assigned to them. Students who are **enrolled and approved** in that course can then view and download those PDFs from their dashboard.

---

## PART 1 — BACKEND

### New Prisma Model

```
CourseMaterial

Fields:
  id          String   @id @default(uuid())
  courseId    String
  uploadedBy  String        (userId of the teacher who uploaded)
  title       String        (display name, e.g. "Chapter 1 Notes")
  description String?       (optional short description)
  fileUrl     String        (Cloudinary secure URL)
  publicId    String        (Cloudinary publicId for deletion)
  fileSize    Int?          (bytes, optional)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

Relations:
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  uploader    User     @relation("UploadedMaterials", fields: [uploadedBy], references: [id])
```

Add back-relations:
- `Course.materials  CourseMaterial[]`
- `User.uploadedMaterials  CourseMaterial[]  @relation("UploadedMaterials")`

Run: `npx prisma migrate dev --name add_course_material`

---

### Module Structure

Create a new module at:
`Accellence_server/src/modules/courseMaterial/`

Files to create (follow the exact same pattern as the `photoGallery` or `enrollments` module):

```
courseMaterial.interface.ts
courseMaterial.constant.ts
courseMaterial.validation.ts
courseMaterial.service.ts
courseMaterial.controller.ts
courseMaterial.routes.ts
```

---

### File Upload Setup

- Use **Cloudinary** for storage (same as photoGallery module)
- Configure a **Multer** instance that accepts only `application/pdf` (MIME type check)
- Max file size: **20 MB**
- Upload to Cloudinary folder: `course-materials`
- Use `resource_type: 'raw'` so Cloudinary stores it as a raw file (not image)
- Store the returned `secure_url` as `fileUrl` and `public_id` as `publicId`

---

### Permissions

| Action | Who |
|---|---|
| Upload PDF to a course | TEACHER (only if that course is assigned to them) |
| List materials for a course | TEACHER (own courses) + STUDENT (if enrolled and approved) + ADMIN |
| Delete a material | TEACHER (own upload) + ADMIN |
| Download (just reads the fileUrl) | TEACHER + STUDENT (enrolled + approved) + ADMIN |

---

### API Endpoints

Register all routes under `/api/course-material`

```
POST   /course-material/upload
  Auth: TEACHER
  Body: multipart/form-data
    - file (PDF, required)
    - courseId (string, required)
    - title (string, required, min 3 chars, max 200)
    - description (string, optional, max 500)
  Guard: Verify the course's teacherId matches req.user.id
         (find teacher profile by userId, then check course.teacherId)
  Action: Upload to Cloudinary, save record to DB
  Returns: Created CourseMaterial record

GET    /course-material/course/:courseId
  Auth: TEACHER + STUDENT + ADMIN
  Guard:
    - ADMIN: unrestricted
    - TEACHER: must be the assigned teacher of the course
    - STUDENT: must have an approved enrollment for the course
  Returns: Array of CourseMaterial for that course (newest first)

DELETE /course-material/:id
  Auth: TEACHER + ADMIN
  Guard:
    - TEACHER: must be the uploader (uploadedBy === req.user.id)
    - ADMIN: unrestricted
  Action: Delete from Cloudinary (by publicId, resource_type: 'raw'), delete from DB
  Returns: Deleted record
```

---

### Validation

**Upload schema (Zod):**
```
body.courseId   — required, UUID
body.title      — required, string, min 3, max 200
body.description — optional, string, max 500
```

**File validation (Multer fileFilter):**
- Only allow `application/pdf`
- Reject with error message: `"Only PDF files are allowed"`

---

### Service Logic (key guards)

```typescript
// Upload guard — teacher must own the course
const teacher = await prisma.teacher.findFirst({ where: { userId } })
const course  = await prisma.course.findUniqueOrThrow({ where: { id: courseId } })
if (course.teacherId !== teacher.id) {
  throw ApiError(403, 'You can only upload materials to your own courses')
}

// View guard — student must be approved enrolled
if (role === 'STUDENT') {
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId, enrollmentStatus: 'approved' }
  })
  if (!enrollment) {
    throw ApiError(403, 'You must be enrolled in this course to view materials')
  }
}
```

---

### Register Route

Add to `Accellence_server/src/app/routers/index.ts`:
```typescript
import { CourseMaterialRoutes } from '../../modules/courseMaterial/courseMaterial.routes'
// ...
{ path: '/course-material', route: CourseMaterialRoutes }
```

---

## PART 2 — FRONTEND

### Teacher Dashboard Page

**Location:** `Excellence_Academy/app/dashboard/teacher/materials/page.tsx`

**Features:**
- Dropdown to select one of the teacher's assigned courses
- PDF upload form:
  - Title input (required)
  - Description textarea (optional)
  - File picker (accept=".pdf" only)
  - Submit button with loading state
- List of already-uploaded materials for the selected course:
  - Title
  - Description (if any)
  - Upload date
  - File size (if available)
  - Download button (opens `fileUrl` in new tab)
  - Delete button (with confirmation)
- Skeleton loading state
- Empty state: "No materials uploaded yet for this course."

**Add to teacher nav** in `components/dashboard/dashboard-shell.tsx`:
```
{ label: 'কোর্স ম্যাটেরিয়াল', href: '/dashboard/teacher/materials', icon: FileText }
```

---

### Student Dashboard Page

**Location:** `Excellence_Academy/app/dashboard/student/materials/page.tsx`

**Features:**
- Lists all courses the student is enrolled and approved in
- For each course: shows a collapsible section (or tabs) with the PDFs available
- Each PDF item shows:
  - PDF icon
  - Title
  - Description (if any)
  - Upload date
  - Download button → opens `fileUrl` in new tab (no custom download needed — browser handles it)
- Skeleton loading
- Empty state per course: "No materials available for this course yet."

**Add to student nav** in `components/dashboard/dashboard-shell.tsx`:
```
{ label: 'ম্যাটেরিয়ালস', href: '/dashboard/student/materials', icon: FileText }
```

---

### Frontend API Client

**Location:** `Excellence_Academy/serverdata/courseMaterials.ts`

Create typed API functions:
```typescript
uploadCourseMaterial(formData: FormData): Promise<ServerCourseMaterial>
  → POST /course-material/upload  (multipart/form-data, uses apiFetchFormData)

getCourseMaterials(courseId: string): Promise<ServerCourseMaterial[]>
  → GET /course-material/course/:courseId

deleteCourseMaterial(id: string): Promise<void>
  → DELETE /course-material/:id
```

Types to export:
```typescript
interface ServerCourseMaterial {
  id: string
  courseId: string
  uploadedBy: string
  title: string
  description: string | null
  fileUrl: string
  publicId: string
  fileSize: number | null
  createdAt: string
  updatedAt: string
  course?: { id: string; title: string; slug: string } | null
  uploader?: { id: string; name: string } | null
}
```

---

## PART 3 — UI STYLE RULES

Match the existing project style exactly:

- **Cards:** `rounded-2xl border border-border/60 bg-card shadow-sm`
- **Page header:** gradient header with icon badge (same as enrollment and course-review admin pages)
- **Skeleton:** `animate-pulse rounded-xl bg-muted` blocks
- **Empty state:** dashed border card with centered icon + message
- **Toast:** `sonner` — `toast.success()` / `toast.error()`
- **Forms:** `react-hook-form` + `zod` resolver
- **Buttons:** use existing `Button` component from `@/components/ui/button`
- **File input:** native `<input type="file" accept=".pdf">` styled as a card drop zone
- **Download:** `<a href={fileUrl} target="_blank" rel="noreferrer">` — no custom fetch needed
- **Icons:** `lucide-react` — use `FileText`, `Upload`, `Trash2`, `Download`, `BookOpen`
- **Dark mode:** all classes must support dark mode via Tailwind `dark:` variants

---

## FINAL RULES

❌ Never modify existing modules (photoGallery, enrollments, courses, teachers).
❌ Never share Cloudinary upload config with photoGallery — create a separate multer instance for PDFs.
❌ Never allow non-PDF uploads.
❌ Never allow a teacher to upload to a course not assigned to them.
❌ Never allow a student to access materials if their enrollment is pending or rejected.

✅ Everything in a new isolated `courseMaterial` module.
✅ Proper ownership and enrollment guards in every service method.
✅ Clean TypeScript with no `any` except where Prisma requires it.
✅ Run `tsc --noEmit` after completion — zero errors.
✅ Production-ready code with error handling, validation, and clean architecture.
