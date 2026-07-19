You are a Senior Full Stack Engineer.

Tech Stack:
- Next.js
- Express.js
- Prisma ORM
- PostgreSQL
- TypeScript

IMPORTANT RULES

- Follow the existing project architecture.
- Reuse existing components.
- Do NOT break any existing functionality.
- Do NOT remove existing features.
- Keep UI consistent with the current dashboard.
- Write production-ready, reusable code.
- Before modifying any file, understand the existing implementation.
- Complete one phase fully before starting the next phase.
- If the response reaches the token limit, STOP immediately after completing the current phase.
- Do NOT start the next phase automatically.
- Wait for my "Continue" command before proceeding.

PHASE 1 ONLY

Implement only the backend and database.

Tasks

1. Create PaymentMethod Prisma model

Fields

- id
- name
- accountNumber
- accountName
- accountType
- instructions
- logo
- isActive
- createdAt
- updatedAt

Relationship

PaymentMethod

↓

Many Enrollments

Enrollment stores only

paymentMethodId

Never store receiver number.

------------------------------------------------

Create Payment Method Module

- Validation
- DTO
- Service
- Controller
- Routes

REST APIs

GET
GET by ID
POST
PATCH
DELETE

Authorization

Admin

Create
Update
Delete

Students

Can fetch active payment methods only.

------------------------------------------------

IMPORTANT

Do NOT use Image URL.

Use multipart/form-data.

Admin uploads logo file.

Store uploaded file path only.

------------------------------------------------

After finishing PHASE 1

STOP.

Do not continue.
Wait for my "Continue".


PHASE 2 ONLY

Create Admin Payment Methods Dashboard.

Sidebar

Payment Methods

Features

- Table
- Search
- Pagination
- Loading
- Empty State
- Create
- Edit
- Delete
- Enable Disable
- Confirmation Dialog
- Toast

------------------------------------------------

Logo

Remove Image URL.

Use Image Upload.

Features

- Drag Drop
- Preview
- Replace
- Remove

------------------------------------------------

Do NOT use Image URL anywhere.

After finishing PHASE 2

STOP.
Wait for Continue.

PHASE 3 ONLY

Remove every hardcoded payment number.

Fetch payment methods dynamically.

Do NOT use Select dropdown.

Instead

Display modern clickable cards.

Each card

- Logo
- Name
- Account Number
- Account Type

Selection

- Border
- Check Icon
- Animation

Only one card selected.

------------------------------------------------

After selection show

Receiver Number

Account Name

Account Type

Instructions

------------------------------------------------

Student inputs

- Sender Number
- Transaction ID
- Amount Sent

Optional

Payment Screenshot

------------------------------------------------

Remove Image URL.

Use Image Upload.

Use FormData.

Preview image.

Replace image.

------------------------------------------------

STOP after finishing.

Wait for Continue.

PHASE 4 ONLY

Update Enrollment.

Store

- paymentMethodId
- courseFee
- amountSent
- senderNumber
- transactionId
- paymentScreenshot
- paymentStatus
- enrollmentStatus
- rejectionReason

Never store receiver number.

------------------------------------------------

Admin Table

Student

Course

Payment Method

Amount

Sender Number

Transaction ID

Payment Status

Enrollment Status

------------------------------------------------

Enrollment Details

Receiver Information

Course Fee

Amount

Difference

Screenshot

------------------------------------------------

Verification

Equal

Fully Paid

Less

Underpaid

Greater

Overpaid

------------------------------------------------

Approve

Enrollment Active

Course appears in My Courses.

Reject

Inactive

Store rejection reason.

------------------------------------------------

Resubmission

Student updates

Transaction

Sender Number

Amount

Screenshot

------------------------------------------------

STOP.

Wait for Continue.

PHASE 5 ONLY

Complete remaining work.

Review entire implementation.

Fix

- Bugs
- TypeScript errors
- API errors
- Prisma errors
- Validation
- UI issues

Improve

- Responsiveness
- Reusability
- Loading
- Empty State
- Error Handling

Verify

No Image URL exists.

Only Image Upload.

Payment Cards.

No hardcoded payment numbers.

No broken routes.

No broken functionality.

Production Ready.

STOP.