/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `Enrollment` table.
  - Added the required column `paymentMethodId` to the `Enrollment` table.

  Migration strategy for existing rows:
    1. Create the PaymentMethod table first.
    2. Insert a "Legacy / Manual" placeholder payment method so existing
       enrollment rows can be migrated to a valid FK.
    3. Add paymentMethodId as nullable, backfill, then set NOT NULL.
    4. Drop the old paymentMethod text column.
    5. Add the FK constraint.
*/

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "instructions" TEXT,
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- Insert a placeholder so existing enrollments can reference a valid ID
INSERT INTO "PaymentMethod" (
  "id", "name", "accountNumber", "accountName", "accountType",
  "instructions", "isActive", "createdAt", "updatedAt"
) VALUES (
  'legacy-payment-method-000000000001',
  'Manual / Legacy',
  'N/A',
  'N/A',
  'legacy',
  'Migrated from previous system. Please update or delete after reviewing existing enrollments.',
  false,
  NOW(),
  NOW()
);

-- Add paymentMethodId as nullable first
ALTER TABLE "Enrollment" ADD COLUMN "paymentMethodId" TEXT;

-- Backfill: point all existing rows to the legacy placeholder
UPDATE "Enrollment" SET "paymentMethodId" = 'legacy-payment-method-000000000001';

-- Now set NOT NULL
ALTER TABLE "Enrollment" ALTER COLUMN "paymentMethodId" SET NOT NULL;

-- Drop the old text column
ALTER TABLE "Enrollment" DROP COLUMN "paymentMethod";

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_paymentMethodId_fkey"
  FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
