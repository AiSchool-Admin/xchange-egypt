-- Reset the failed migration so new migrations can be applied
-- This removes the failed migration record from Prisma's migration tracking table

DELETE FROM "_prisma_migrations"
WHERE "migration_name" = '20250125000001_seed_3_level_categories'
AND "finished_at" IS NULL;

-- Log the cleanup
DO $$
BEGIN
  RAISE NOTICE 'Cleaned up failed migration: 20250125000001_seed_3_level_categories';
END $$;
