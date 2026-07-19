# Bright Future Coaching Center — Project Overview

> Full-stack coaching center management system with separate admin, teacher, and student portals.

---

## Table of Contents

1. [Project Identity](#1-project-identity)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Technology Stack](#3-technology-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Database Schema](#5-database-schema)
6. [Backend — Module Reference](#6-backend--module-reference)
7. [API Routes](#7-api-routes)
8. [Frontend — Pages & Routes](#8-frontend--pages--routes)
9. [Frontend — Component Architecture](#9-frontend--component-architecture)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Role-Based Access Control](#11-role-based-access-control)
12. [Feature Catalogue](#12-feature-catalogue)
13. [Data Flow](#13-data-flow)
14. [Environment Variables](#14-environment-variables)
15. [Key Design Decisions](#15-key-design-decisions)

---

## 1. Project Identity

| Field | Value |
|---|---|
| Platform name | Bright Future Coaching Center |
| Bengali name | ব্রাইট ফিউচার কোচিং সেন্টার |
| Purpose | Manage students, teachers, courses, enrollments, attendance, results, notices, and reviews for a coaching institute |
| Deployment | Frontend → Vercel (`eaac.vercel.app`) / Backend → Vercel serverless |
| Development URL | Frontend: `http://localhost:3000` / Backend: `http://localhost:5000` |

---

## 2. Monorepo Structure

```
Excellencebd/
├── Excellence_Academy/        # Next.js 16 frontend
└── Accellence_server/         # Express + Prisma backend
```

Both projects live in the same Git repository and are deployed independently.

---

## 3. Technology Stack

### Backend (`Accellence_server`)

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| ORM | Prisma 6 |
| Database | PostgreSQL |
| Auth | JWT (access token in localStorage + refresh token in httpOnly cookie) |
| Validation | Zod |
| Password hashing | bcryptjs |
| File uploads | Multer + Cloudinary |
| Email | Nodemailer |
| Dev server | ts-node-dev |

### Frontend (`Excellence_Academy`)

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Base UI) |
| Forms | react-hook-form + Zod |
| State | React context (AuthContext) |
| Data fetching | Custom fetch wrappers (no React Query in most pages) |
| Charts | Recharts |
| Animations | Framer Motion |
| Toasts | Sonner |
| Icons | Lucide React |
| Analytics | Vercel Analytics |

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│               Next.js Frontend                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Public  │  │Dashboard │  │  Auth Pages  │  │
│  │  Pages   │  │  Pages   │  │ /login       │  │
│  └──────────┘  └──────────┘  │ /register    │  │
│       │              │       └──────────────┘  │
│       └──────────────┼──────────────────────── │
│              serverdata/ (API client layer)     │
│              fetch → Bearer token               │
└─────────────────────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────┐
│          Express Backend  /api/*                │
│  ┌─────────────────────────────────────────┐   │
│  │  auth middleware → role guard           │   │
│  │  validateRequest (Zod)                  │   │
│  │  catchAsync wrapper                     │   │
│  └─────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐  │
│  │  15 modules (controller / service /      │  │
│  │  routes / validation / interface)        │  │
│  └──────────────────────────────────────────┘  │
│                       │                         │
│  ┌────────────────────▼────────────────────┐   │
│  │  Prisma ORM  ←→  PostgreSQL             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Cloudinary  ←  File uploads (avatar, gallery) │
│  Nodemailer  ←  Contact & password reset email │
└─────────────────────────────────────────────────┘
```

### Backend folder layout

```
Accellence_server/src/
├── app/
│   ├── config/          # Env config, Cloudinary, Multer
│   ├── error/           # ApiError class
│   ├── helper/          # catchAsync, fileUploader, jwtHelper, paginationHelper
│   ├── interface/       # Shared TS interfaces (pagination, file, etc.)
│   ├── middleWares/     # auth, globalErrorHandler, validationRequest
│   ├── routers/         # Central route aggregator
│   └── shared/          # sendResponse, pick, prisma client, sendEmail, createToken
├── modules/             # 15 feature modules (see §6)
├── app.ts               # Express app setup, CORS, middleware
└── server.ts            # HTTP server entry point
```

---

## 5. Database Schema

### Models

| Model | Key Fields | Relations |
|---|---|---|
| **User** | id, name, email, password, role (ADMIN/STUDENT/TEACHER), avatar, phone | → Admin, Student, Teacher, Profile, Enrollment, Attendance, Result, Review, CourseReview |
| **Teacher** | id, userId, subject, bio, experienceYears, qualification, department, designation | → User, Course[] |
| **Student** | id, userId, guardian, address, status | → User |
| **Admin** | id, userId | → User |
| **Profile** | id, userId, address, gender, dateOfBirth, bloodGroup, emergencyContact, department | → User |
| **Course** | id, title, slug (unique), category, description, duration, price, level, icon, seats, rating, popular | → Teacher, Enrollment[], Attendance[], Result[], Review[], CourseReview[] |
| **Enrollment** | id, userId, courseId, paymentMethodId, courseFee, amountSent, senderNumber, transactionId, paymentScreenshot, paymentStatus, enrollmentStatus, rejectionReason | → User, Course, PaymentMethod |
| **PaymentMethod** | id, name, accountNumber, accountName, accountType, instructions, logo, isActive | → Enrollment[] |
| **Attendance** | id, studentId, courseId, date, status | → User, Course |
| **Result** | id, studentId, courseId, marks, grade, remarks, examDate | → User, Course |
| **Notice** | id, title, content, category, audience, date, author | — |
| **Review** | id, userId?, courseId?, name, avatar, role, rating, comment, featured | → User?, Course? |
| **CourseReview** | id, courseId, userId, rating (1-5), comment | → Course, User — `@@unique([courseId, userId])` |
| **PhotoGallery** | id, title, description, category, imageUrl, publicId | — |

### Enums

| Enum | Values |
|---|---|
| `Role` | ADMIN, STUDENT, TEACHER |
| `CourseLevel` | Beginner, Intermediate, Advanced |
| `EnrollmentStatus` | pending, approved, rejected |
| `PaymentStatus` | unpaid, paid, partial |
| `NoticeCategory` | general, academic, exam, holiday, event |
| `NoticeAudience` | all, students, teachers, parents |

---

## 6. Backend — Module Reference

Each module follows the pattern: `interface → constant → validation → service → controller → routes`

| Module | Path | Responsibility |
|---|---|---|
| **auth** | `/api/auth` | Register, login, logout, refresh token, change password, forgot/reset password |
| **users** | `/api/users` | List users, get/update own profile, avatar upload |
| **admin** | `/api/admin` | Admin profile management, password change |
| **students** | `/api/students` | Student CRUD, student profile, register by admin |
| **teachers** | `/api/teachers` | Teacher CRUD, my profile, my courses, my students |
| **courses** | `/api/courses` | Course CRUD, slug lookup, popular courses |
| **enrollments** | `/api/enrollments` | Submit enrollment, approve/reject/edit, student resubmit after rejection, enrollment check |
| **paymentMethods** | `/api/payment-methods` | CRUD for payment methods (bKash, Nagad, etc.) with logo upload |
| **attendance** | `/api/attendance` | Mark/view attendance per course and student |
| **results** | `/api/results` | Record and retrieve exam results |
| **notices** | `/api/notices` | Publish and view notices with category and audience filtering |
| **reviews** | `/api/reviews` | General testimonial reviews (name, role, featured flag) — homepage testimonials |
| **courseReview** | `/api/course-review` | Course-specific student reviews with rating distribution and average — isolated from reviews module |
| **photoGallery** | `/api/photo-gallery` | Gallery image upload/delete via Cloudinary |
| **contact** | `/api/sendMail` | Contact form → sends email via Nodemailer |

---

## 7. API Routes

All routes are prefixed with `/api`.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login, returns accessToken + sets cookie |
| POST | `/auth/logout` | Public | Clear refresh cookie |
| POST | `/auth/refresh-token` | Cookie | Issue new access token |
| POST | `/auth/change-password` | Any | Change own password |
| POST | `/auth/forgot-password` | Public | Send reset email |
| POST | `/auth/reset-password` | Public | Reset password via token |

### Courses
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/courses` | Public | List all courses (with filters) |
| GET | `/courses/popular` | Public | Popular courses |
| GET | `/courses/:id` | Public | Single course |
| POST | `/courses` | ADMIN | Create course |
| PUT | `/courses/:id` | ADMIN | Update course |
| DELETE | `/courses/:id` | ADMIN | Delete course |

### Enrollments
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/enrollments` | STUDENT | Submit enrollment with payment details |
| GET | `/enrollments` | ADMIN/STUDENT/TEACHER | List enrollments (admin sees all, student sees own) |
| GET | `/enrollments/mine` | STUDENT | Own enrollments only |
| GET | `/enrollments/check/:courseId` | STUDENT | Check if enrolled in a course |
| GET | `/enrollments/:id` | Auth | Single enrollment |
| PATCH | `/enrollments/:id` | ADMIN | Update enrollment status/payment |
| POST | `/enrollments/:id/approve` | ADMIN | Approve enrollment |
| POST | `/enrollments/:id/reject` | ADMIN | Reject with reason |
| PATCH | `/enrollments/:id/resubmit` | STUDENT | Resubmit after rejection |
| DELETE | `/enrollments/:id` | ADMIN | Delete enrollment |

### Course Reviews (isolated from Reviews)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/course-review/course/:courseId` | Public | Reviews + averageRating + ratingDistribution for a course |
| POST | `/course-review` | STUDENT/ADMIN | Create review (one per user per course) |
| PATCH | `/course-review/:id` | STUDENT/ADMIN | Edit own review |
| DELETE | `/course-review/:id` | STUDENT/ADMIN | Delete own review |
| GET | `/course-review` | ADMIN | All reviews with filters |
| GET | `/course-review/admin/:id` | ADMIN | Single review detail |
| DELETE | `/course-review/admin/:id` | ADMIN | Delete any review |

### Other notable routes
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/reviews` | Public | Testimonial reviews |
| POST | `/reviews` | ADMIN/STUDENT | Create testimonial |
| GET | `/photo-gallery` | Public | Gallery images |
| POST | `/photo-gallery` | ADMIN | Upload photo |
| DELETE | `/photo-gallery/:id` | ADMIN | Delete photo |
| GET | `/notices` | Public | Notices (filterable by audience/category) |
| POST | `/notices` | ADMIN | Publish notice |
| GET | `/payment-methods` | Public | Active payment methods |
| POST | `/payment-methods` | ADMIN | Create payment method |
| POST | `/sendMail` | Public | Contact form email |

---

## 8. Frontend — Pages & Routes

### Public pages (`app/(public)/`)

| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero, popular courses, photo gallery section, testimonials, notices |
| `/courses` | Courses | Browse all courses with search and category filter |
| `/courses/[slug]` | Course Detail | Full course info + instructor + CourseReview section at bottom |
| `/courses/[slug]/enroll` | Enroll | Payment form — select method, upload screenshot |
| `/about` | About | About the coaching center |
| `/teachers` | Teachers | Teacher profiles |
| `/notice` | Notices | Public notice board |
| `/photo-gallery` | Gallery | Photo gallery |
| `/contact` | Contact | Contact form |

### Auth pages

| Route | Description |
|---|---|
| `/login` | Email + password login |
| `/register` | Student self-registration |
| `/admin/register` | Admin-seeded admin access |

### Admin Dashboard (`app/dashboard/admin/`)

| Route | Page |
|---|---|
| `/dashboard/admin` | Overview + stats |
| `/dashboard/admin/students` | Student list + register |
| `/dashboard/admin/students/register` | Register new student |
| `/dashboard/admin/teachers` | Teacher management |
| `/dashboard/admin/courses` | Course management |
| `/dashboard/admin/course-assign` | Assign teacher to course |
| `/dashboard/admin/attendance` | Attendance tracking |
| `/dashboard/admin/enrollments` | Enrollment review, approve/reject |
| `/dashboard/admin/payment-methods` | Manage payment methods |
| `/dashboard/admin/notices` | Publish and manage notices |
| `/dashboard/admin/photo-gallery` | Upload/delete gallery photos |
| `/dashboard/admin/reviews` | Testimonial review management |
| `/dashboard/admin/course-reviews` | Course-specific review management |
| `/dashboard/admin/profile` | Admin profile settings |
| `/dashboard/admin/contact` | Send bulk emails |

### Teacher Dashboard (`app/dashboard/teacher/`)

| Route | Page |
|---|---|
| `/dashboard/teacher` | Overview |
| `/dashboard/teacher/courses` | My assigned courses |
| `/dashboard/teacher/students` | Students in my courses |
| `/dashboard/teacher/attendance` | Manage attendance |
| `/dashboard/teacher/notices` | View notices |
| `/dashboard/teacher/profile` | Profile settings |
| `/dashboard/teacher/contact` | Contact admin |

### Student Dashboard (`app/dashboard/student/`)

| Route | Page |
|---|---|
| `/dashboard/student` | Overview + enrolled courses |
| `/dashboard/student/courses` | My enrolled courses |
| `/dashboard/student/browse` | Browse & enroll in courses |
| `/dashboard/student/attendance` | View own attendance |
| `/dashboard/student/reviews` | My testimonial reviews |
| `/dashboard/student/notices` | View notices |
| `/dashboard/student/profile` | Profile settings |
| `/dashboard/student/contact` | Contact page |

---

## 9. Frontend — Component Architecture

### Directory layout

```
Excellence_Academy/
├── app/                        # Next.js App Router pages
├── components/
│   ├── cards/                  # CourseCard, CourseReviewStats
│   ├── dashboard/              # DashboardShell, SectionCard, DataTable
│   ├── forms/                  # AdminManagementForms, etc.
│   ├── public/                 # Public-facing components
│   │   ├── home/               # Hero, PopularCourses, PhotoGallerySection, etc.
│   │   ├── course-review-section.tsx  # Full review section for course detail page
│   │   ├── courses-browser.tsx
│   │   ├── enroll-button.tsx
│   │   └── register-page.tsx
│   ├── shared/                 # RatingStars, SectionHeading
│   └── ui/                     # shadcn/ui primitives (Button, Card, Dialog, etc.)
├── hooks/
│   └── use-auth.tsx            # AuthProvider + useAuth hook
├── lib/
│   ├── course-icons.ts
│   ├── format.ts               # formatCurrency, formatDate, initials
│   └── utils.ts                # cn() helper
├── serverdata/                 # Typed API client modules
│   ├── api.ts                  # Base fetch wrapper, token management
│   ├── auth.ts
│   ├── courses.ts
│   ├── enrollments.ts
│   ├── courseReviews.ts        # Course-review specific API client
│   ├── testimonials.ts         # General reviews API client
│   ├── teachers.ts / students.ts / users.ts
│   ├── notices.ts / attendance.ts / paymentMethods.ts
│   └── photo-gallery.ts
├── services/
│   └── index.ts                # Enriched composite data types and service functions
└── types/                      # Shared TypeScript types (Role, User, etc.)
```

### Key reusable components

| Component | Location | Purpose |
|---|---|---|
| `DashboardShell` | `components/dashboard/` | Sidebar nav, header, layout for all dashboard roles |
| `SectionCard` | `components/dashboard/` | Consistent card wrapper for dashboard sections |
| `DataTable` | `components/dashboard/` | Generic table with typed column definitions |
| `CourseCard` | `components/cards/` | Course listing card with live review stats |
| `CourseReviewStats` | `components/cards/` | Fetches + displays live averageRating + review count per course |
| `CourseReviewSection` | `components/public/` | Full reviews section on course detail page (summary, form, list) |
| `RatingStars` | `components/shared/` | Star display component |
| `EnrollButton` | `components/public/` | Smart enroll button (redirects to login if not authenticated) |

---

## 10. Authentication & Authorization

### Token strategy

- **Access token** — JWT, short-lived, stored in `localStorage` under key `bf_access_token`
- **Refresh token** — JWT, longer-lived, stored in httpOnly cookie `bf_refresh_token`

### Auth flow

```
Login → POST /api/auth/login
      ← accessToken (body) + refreshToken (httpOnly cookie)

Frontend stores accessToken in localStorage.
Every API request sends: Authorization: Bearer <accessToken>

On 401 → localStorage token cleared, user redirected to /login
Refresh → POST /api/auth/refresh-token (cookie sent automatically)
```

### Backend auth middleware

```typescript
auth(...roles: Role[])
// Reads Bearer token from Authorization header or bf_access_token cookie
// Verifies JWT, checks role, attaches req.user = { id, email, role, ... }
// Throws 401 / 403 with descriptive messages on failure
```

---

## 11. Role-Based Access Control

| Feature | PUBLIC | STUDENT | TEACHER | ADMIN |
|---|---|---|---|---|
| Browse courses | ✓ | ✓ | ✓ | ✓ |
| View course details | ✓ | ✓ | ✓ | ✓ |
| Enroll in course | — | ✓ | — | — |
| View own enrollments | — | ✓ | — | ✓ |
| Approve/reject enrollments | — | — | — | ✓ |
| View notices | ✓ | ✓ | ✓ | ✓ |
| Publish notices | — | — | — | ✓ |
| Mark attendance | — | — | ✓ | ✓ |
| View own attendance | — | ✓ | — | — |
| View results | — | ✓ | ✓ | ✓ |
| Enter results | — | — | — | ✓ |
| Submit course review | — | ✓ | — | ✓ |
| Edit/delete own course review | — | ✓ | — | ✓ |
| Delete any course review | — | — | — | ✓ |
| Submit testimonial review | — | ✓ | — | ✓ |
| Manage testimonial reviews | — | — | — | ✓ |
| Upload photo gallery | — | — | — | ✓ |
| Manage courses | — | — | — | ✓ |
| Manage teachers/students | — | — | — | ✓ |
| Manage payment methods | — | — | — | ✓ |

---

## 12. Feature Catalogue

### Authentication
- Email/password registration and login
- JWT-based session (access + refresh token)
- Password change (authenticated)
- Forgot password → email reset link → reset page

### User Profiles
- Extended profile: address, gender, date of birth, blood group, department, emergency contact
- Avatar upload via Cloudinary
- Role-specific profile pages (Admin, Teacher, Student)

### Courses
- Full CRUD with slug-based URLs
- Course levels: Beginner / Intermediate / Advanced
- Category and popularity flags
- Teacher assignment
- Icon mapping system
- Live review rating pulled from `CourseReview` table

### Enrollment System
- Student submits enrollment with: selected payment method, course fee, amount sent, sender number, transaction ID, optional payment screenshot
- Admin reviews and can approve, reject (with reason), or manually edit
- Rejected enrollments can be resubmitted by the student with corrected payment details
- Payment status auto-resolved: `paid` (≥ fee), `partial` (< fee)
- Duplicate enrollment guard per student per course

### Payment Methods
- Admin manages supported methods (bKash, Nagad, Rocket, bank, etc.)
- Each method has: name, account number, account name, account type, instructions, logo (Cloudinary), active flag
- Logo shown on enrollment page, admin enrollment table, and enrollment detail dialog

### Attendance
- Per-course, per-student daily attendance
- Teacher marks attendance for their assigned courses
- Admin sees all attendance
- Student sees own attendance per course

### Results
- Admin enters marks and grade per student per course
- Student views own results

### Notices
- Admin publishes notices with category (general, academic, exam, holiday, event) and audience (all, students, teachers, parents)
- Public notice board visible without login

### Reviews (Testimonials)
- General review with name, role, rating, comment, featured flag
- Used on the homepage testimonials section
- Admin can feature/unfeature, edit, delete

### Course Reviews (isolated feature)
- Student submits a review tied to a specific course and their user account
- One review per student per course enforced at DB level (`@@unique`)
- Public endpoint returns: `averageRating`, `totalReviews`, `ratingDistribution` (stars 1–5), paginated review list
- Student can edit or delete their own review
- Admin can delete any review
- Shown on course detail page bottom section
- Live stats shown on every course card

### Photo Gallery
- Admin uploads images to Cloudinary with title, description, category
- Public gallery page with category browsing
- Homepage photo gallery section

### Contact
- Public contact form sends email to the owner via Nodemailer
- Dashboard contact pages for students and teachers

### Dashboard
- Role-aware sidebar navigation (Bengali labels)
- Responsive with mobile drawer
- Admin: full management of all entities
- Teacher: own courses, students, attendance
- Student: enrolled courses, attendance, results, browse, review

---

## 13. Data Flow

### Enrollment submission flow

```
Student fills enrollment form
  → POST /api/enrollments
  → Guard: one enrollment per course
  → Create Enrollment (status: pending, payment: unpaid)

Admin reviews in /dashboard/admin/enrollments
  → POST /api/enrollments/:id/approve
  → Validates transaction ID format
  → Resolves paymentStatus (paid/partial based on amounts)
  → Sets enrollmentStatus: approved

  OR → POST /api/enrollments/:id/reject (with reason)
  → Student sees rejection reason in their dashboard
  → Student can resubmit via PATCH /api/enrollments/:id/resubmit
  → Status resets to pending for re-review
```

### Course review flow

```
Student visits /courses/[slug]
  → GET /api/course-review/course/:courseId (public, limit=5)
  → Section shows: averageRating, distribution bars, review list

Logged-in student submits review
  → POST /api/course-review
  → Guard: @@unique([courseId, userId]) prevents duplicates
  → Section refreshes

Student edits review → PATCH /api/course-review/:id (ownership checked in service)
Student deletes review → DELETE /api/course-review/:id

Admin manages at /dashboard/admin/course-reviews
  → GET /api/course-review (with search/filter/pagination)
  → DELETE /api/course-review/admin/:id (delete any)
```

### Image upload flow

```
Admin uploads image (gallery / payment method logo / avatar)
  → Multer processes multipart/form-data
  → multer-storage-cloudinary streams to Cloudinary
  → Cloudinary returns imageUrl + publicId
  → URL saved to DB
  → Frontend uses native <img> tag (no Next.js Image restrictions)
```

---

## 14. Environment Variables

### Backend (`.env`)

```
DATABASE_URL=           # PostgreSQL connection string
PORT=5000
NODE_ENV=development

JWT_SECRET=
EXPIRES_IN=            # e.g. 1d
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=  # e.g. 30d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_USER=
EMAIL_PASS=
APP_PASSWORD=
OWNER_EMAIL=

RESET_PASS_TOKEN=
RESET_PASS_TOKEN_EXPIRES_IN=
RESET_PASSWORD_LINK=
```

### Frontend (`.env`)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
# Production: https://accellence-server.vercel.app/api
```

---

## 15. Key Design Decisions

### Two review systems, fully isolated

The project has two review features that share no code, routes, or DB tables:

| System | Model | Route prefix | Purpose |
|---|---|---|---|
| `Review` (testimonials) | `Review` | `/api/reviews` | General reviews with name/role/featured — homepage use |
| `CourseReview` | `CourseReview` | `/api/course-review` | Per-course, per-student structured reviews |

This was intentional to avoid breaking existing testimonial functionality while adding course-specific reviews.

### Token storage

Access token in `localStorage` (key: `bf_access_token`), not in memory, so it persists across page reloads without a round-trip to the server. Refresh token is in an httpOnly cookie.

### Native `<img>` over Next.js `<Image>` for external URLs

Cloudinary-hosted images (logos, gallery, avatars) use native `<img>` tags to avoid Next.js domain allowlist friction and silent rendering failures from empty URL strings.

### Enrollment payment status resolution

The backend automatically determines `paymentStatus` from a comparison of `amountSent` vs `courseFee`:
- `amountSent >= courseFee` → `paid` (overpayments are accepted)
- `amountSent < courseFee` → `partial`

No manual payment status setting is needed during approval.

### Module pattern (backend)

Every backend module is self-contained with 5–6 files: `interface → constant → validation → service → controller → routes`. This makes each feature independently testable and removable.

### Frontend API client layer

All backend calls go through `serverdata/*.ts` typed wrapper files rather than being scattered in components. Each file exports typed functions like `getCourseReviews()`, `createEnrollment()`, etc., built on top of a single `api.ts` base that handles auth headers and token clearing on 401.
