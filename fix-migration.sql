-- Run this SQL directly on your Supabase database to fix the failed migration
-- This will mark the failed migration as rolled back so new migrations can run

-- Step 1: Check the failed migration
SELECT migration_name, started_at, finished_at, rolled_back_at
FROM "_prisma_migrations"
WHERE migration_name = '20250125000001_seed_3_level_categories';

-- Step 2: Mark it as rolled back
UPDATE "_prisma_migrations"
SET rolled_back_at = NOW(),
    finished_at = NULL
WHERE migration_name = '20250125000001_seed_3_level_categories'
  AND rolled_back_at IS NULL;

-- Step 3: Or completely delete it (cleaner approach)
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20250125000001_seed_3_level_categories';

-- Step 4: Verify it's gone
SELECT migration_name, started_at, finished_at, rolled_back_at
FROM "_prisma_migrations"
ORDER BY started_at DESC
LIMIT 5;
