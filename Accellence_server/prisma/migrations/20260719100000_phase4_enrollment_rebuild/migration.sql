/*
  Phase 4 — Enrollment table rebuild
  ────────────────────────────────────────────────────────────────────────────
  Strategy for existing rows:
    1. Add all new columns as nullable first (so no NOT NULL violation).
    2. Backfill senderNumber from existing `phone` column (which still exists).
    3. Backfill courseFee from the related course.price.
    4. Backfill amountSent from existing `amountPaid` column.
    5. Rename `status` → `enrollmentStatus` (PostgreSQL column rename).
    6. Rename `screenshotUrl` → `paymentScreenshot`.
    7. Set senderNumber NOT NULL after backfill.
    8. Drop old columns: name, email, phone, notes, amountPaid.
*/

-- ── Step 1: add new columns as nullable ──────────────────────────────────────

ALTER TABLE "Enrollment"
  ADD COLUMN IF NOT EXISTS "courseFee"         DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "amountSent"        DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "senderNumber"      TEXT,
  ADD COLUMN IF NOT EXISTS "paymentScreenshot" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectionReason"   TEXT,
  ADD COLUMN IF NOT EXISTS "enrollmentStatus"  "EnrollmentStatus";

-- ── Step 2: backfill enrollmentStatus from existing status column ─────────────
UPDATE "Enrollment" SET "enrollmentStatus" = "status";

-- ── Step 3: backfill senderNumber from existing phone column ─────────────────
UPDATE "Enrollment" SET "senderNumber" = COALESCE("phone", 'N/A');

-- ── Step 4: backfill courseFee from the related Course.price ─────────────────
UPDATE "Enrollment" e
SET "courseFee" = c.price
FROM "Course" c
WHERE e."courseId" = c.id;

-- ── Step 5: backfill amountSent from existing amountPaid ─────────────────────
UPDATE "Enrollment" SET "amountSent" = COALESCE("amountPaid", 0);

-- ── Step 6: copy screenshotUrl → paymentScreenshot ───────────────────────────
UPDATE "Enrollment" SET "paymentScreenshot" = "screenshotUrl"
WHERE "screenshotUrl" IS NOT NULL;

-- ── Step 7: set defaults / NOT NULL where needed ─────────────────────────────
UPDATE "Enrollment" SET "courseFee"  = 0 WHERE "courseFee"  IS NULL;
UPDATE "Enrollment" SET "amountSent" = 0 WHERE "amountSent" IS NULL;
UPDATE "Enrollment" SET "enrollmentStatus" = 'pending' WHERE "enrollmentStatus" IS NULL;

ALTER TABLE "Enrollment"
  ALTER COLUMN "courseFee"        SET NOT NULL,
  ALTER COLUMN "courseFee"        SET DEFAULT 0,
  ALTER COLUMN "amountSent"       SET NOT NULL,
  ALTER COLUMN "amountSent"       SET DEFAULT 0,
  ALTER COLUMN "senderNumber"     SET NOT NULL,
  ALTER COLUMN "enrollmentStatus" SET NOT NULL,
  ALTER COLUMN "enrollmentStatus" SET DEFAULT 'pending';

-- ── Step 8: drop old columns that are no longer needed ───────────────────────
ALTER TABLE "Enrollment"
  DROP COLUMN IF EXISTS "name",
  DROP COLUMN IF EXISTS "email",
  DROP COLUMN IF EXISTS "phone",
  DROP COLUMN IF EXISTS "notes",
  DROP COLUMN IF EXISTS "amountPaid",
  DROP COLUMN IF EXISTS "screenshotUrl",
  DROP COLUMN IF EXISTS "status";
