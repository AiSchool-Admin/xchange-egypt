-- Add BARTER_MATCH to NotificationType enum
-- This value is needed for proximity/barter match notifications

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BARTER_MATCH';
