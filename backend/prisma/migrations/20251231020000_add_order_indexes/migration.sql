-- Add missing composite indexes to orders table for query performance

-- Composite index for filtering by user and status together
CREATE INDEX IF NOT EXISTS "orders_user_id_status_idx" ON "orders"("user_id", "status");

-- Composite index for filtering/sorting by status and creation date
CREATE INDEX IF NOT EXISTS "orders_status_created_at_idx" ON "orders"("status", "created_at");
