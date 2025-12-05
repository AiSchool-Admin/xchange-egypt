-- ============================================
-- FIX: Resolve failed migration, add condition default, and fix test data
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Remove the failed migration record
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20251204100000_add_scrap_marketplace';

-- Step 2: Add default value for condition column (fixes NOT NULL constraint violation)
ALTER TABLE "items" ALTER COLUMN "condition" SET DEFAULT 'GOOD';

-- Step 3: Create test categories if they don't exist (fixes foreign key violations)
-- These are placeholder categories for test/demo data
INSERT INTO "categories" (id, "name_en", "name_ar", slug, icon, "is_active", "created_at", "updated_at")
VALUES
    ('cat-electronics', 'Test Electronics', 'إلكترونيات تجريبية', 'test-electronics', '📱', true, NOW(), NOW()),
    ('cat-computers', 'Test Computers', 'كمبيوترات تجريبية', 'test-computers', '💻', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Also try inserting by slug in case id format is different
INSERT INTO "categories" (id, "name_en", "name_ar", slug, icon, "is_active", "created_at", "updated_at")
SELECT
    gen_random_uuid()::text,
    'Test Electronics',
    'إلكترونيات تجريبية',
    'cat-electronics',
    '📱',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE slug = 'cat-electronics' OR id = 'cat-electronics');

INSERT INTO "categories" (id, "name_en", "name_ar", slug, icon, "is_active", "created_at", "updated_at")
SELECT
    gen_random_uuid()::text,
    'Test Computers',
    'كمبيوترات تجريبية',
    'cat-computers',
    '💻',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE slug = 'cat-computers' OR id = 'cat-computers');

-- Step 4: Mark the condition default migration as applied (if not already)
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

-- Step 5: Verify the fixes
SELECT 'Condition default:' as check_type, column_default as value
FROM information_schema.columns
WHERE table_name = 'items' AND column_name = 'condition'
UNION ALL
SELECT 'Test categories count:' as check_type, COUNT(*)::text as value
FROM "categories"
WHERE id IN ('cat-electronics', 'cat-computers') OR slug IN ('cat-electronics', 'cat-computers');

-- Step 6: Create test user if it doesn't exist (for demo-user-001)
INSERT INTO "users" (id, email, "password_hash", "full_name", "user_type", status, "email_verified", "created_at", "updated_at")
SELECT
    'demo-user-001',
    'demo@test.xchange.eg',
    '$2b$10$dummy.hash.for.test.user.only',
    'Demo User',
    'INDIVIDUAL',
    'ACTIVE',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "users" WHERE id = 'demo-user-001');

-- Step 7: Show failed migrations status
SELECT migration_name, started_at, finished_at
FROM "_prisma_migrations"
ORDER BY started_at DESC
LIMIT 5;
