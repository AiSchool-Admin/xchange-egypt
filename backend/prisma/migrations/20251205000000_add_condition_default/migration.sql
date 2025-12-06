-- AlterTable: Add default value for condition column in items table
-- This fixes the NOT NULL constraint violation when condition is not provided

ALTER TABLE "items" ALTER COLUMN "condition" SET DEFAULT 'GOOD';
