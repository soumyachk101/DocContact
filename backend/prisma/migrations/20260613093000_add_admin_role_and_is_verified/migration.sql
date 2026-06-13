-- Add 'admin' value to the Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'admin';

-- Add is_verified column to doctors table
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN NOT NULL DEFAULT true;
