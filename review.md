You are a Senior Full Stack Engineer.

IMPORTANT (READ FIRST)

This project already has an existing Review System.

DO NOT modify it.
DO NOT rename it.
DO NOT reuse its routes.
DO NOT change its database schema.
DO NOT import anything from it.
DO NOT break any existing functionality.

The existing Review System must continue working exactly as before.

This task is to build a completely NEW and INDEPENDENT feature called:

course-review

Everything must be isolated from the existing review system.

====================================================
PART 1 — BACKEND
====================================================

Create a brand new module

course-review

Structure

controller
service
route
validation
interface
constant

Prisma Model

CourseReview

Fields

id
courseId
userId
rating (1-5)
comment
createdAt
updatedAt

Relations

Course -> CourseReview[]
User -> CourseReview[]

Unique Constraint

(courseId,userId)

Meaning

One user can review one course only once.

====================================================
Permissions
====================================================

Authenticated users

✔ Create review

✔ Edit own review

✔ Delete own review

Admin

✔ View all course reviews

✔ Delete any review

✔ Hide/Unhide review (optional)

✔ Manage all reviews

====================================================
API
====================================================

POST
/course-review

Create review

GET
/course-review/course/:courseId

Return

averageRating

totalReviews

ratingDistribution

reviews

Newest First

PATCH
/course-review/:id

Owner only

DELETE
/course-review/:id

Owner or Admin

Admin APIs

GET
/course-review

Get all reviews

GET
/course-review/:id

Review Details

DELETE
/course-review/admin/:id

Delete any review

PATCH
/course-review/admin/:id

Admin update status (if moderation is implemented)

====================================================
Validation
====================================================

Rating

Minimum 1

Maximum 5

Comment

Required

5-1000 characters

Reject duplicate review.

====================================================
PART 2 — FRONTEND
====================================================

DO NOT touch the existing Review feature.

Create a completely separate UI.

Location

Course Details Page

Place it at the bottom.

Section Title

Course Reviews

====================================================
Top Summary
====================================================

Large Rating

★★★★★

4.8

324 Reviews

Rating Distribution

★★★★★ ███████

★★★★ █████

★★★ ██

★★ █

★

====================================================
Write Review
====================================================

Only logged-in users.

Star Rating

Textarea

Submit Button

If already reviewed

Show

Edit Review

Delete Review

instead of Submit.

====================================================
Review List
====================================================

Each Review Card

Avatar

User Name

Rating Stars

Review Date

Comment

Edit/Delete if owner

Newest First

Load More or Pagination

====================================================
Empty State
====================================================

Illustration/Icon

"No course reviews yet."

"Be the first student to review this course."

====================================================
Admin Dashboard
====================================================

Create a dedicated admin page

Course Reviews

Features

Search

Filter

Pagination

Sort

Delete Review

View Review

View User

View Course

Filter by

Course

Rating

Newest

Oldest

User

Columns

Student

Course

Rating

Comment

Created At

Actions

Admin can manage ALL course reviews without affecting the existing Review System.

====================================================
UI
====================================================

Modern

Apple

Stripe

Vercel

Rounded Cards

Soft Shadows

Responsive

Dark Mode

Skeleton Loading

Smooth Animation

Hover Effects

====================================================
FINAL RULES
====================================================

❌ Never modify the existing Review System.

❌ Never reuse existing review APIs.

❌ Never rename existing review files.

❌ Never share database tables with the old review system.

✅ Everything must be a completely separate "course-review" feature.

✅ Existing Review System must continue working exactly as it does now.

✅ Produce production-ready code with clean architecture, proper validation, authorization, reusable components, and optimized queries.