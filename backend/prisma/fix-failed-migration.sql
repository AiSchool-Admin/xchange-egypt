-- ============================================
-- FIX: Resolve failed migration and add condition default
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Remove the failed migration record
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20251204100000_add_scrap_marketplace';

-- Step 2: Add default value for condition column (fixes NOT NULL constraint violation)
ALTER TABLE "items" ALTER COLUMN "condition" SET DEFAULT 'GOOD';

-- Step 3: Mark the condition default migration as applied (if not already)
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
SELECT
    gen_random_uuid()::text,
    'manual_fix',
    NOW(),
    '20251205000000_add_condition_default',
    NULL,
    NULL,
    NOW(),
    1
WHERE NOT EXISTS (
    SELECT 1 FROM "_prisma_migrations"
    WHERE migration_name = '20251205000000_add_condition_default'
);

-- Step 4: Verify the fix
SELECT
    column_name,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'items' AND column_name = 'condition';

-- Expected output: column_default should show 'GOOD'::\"ItemCondition\"
