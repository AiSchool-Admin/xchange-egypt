-- =============================================
-- ADD AVATAR COLUMN TO BOARD MEMBERS
-- إضافة عمود الصورة الشخصية لأعضاء المجلس
-- =============================================
-- Run this SQL on Supabase Dashboard -> SQL Editor
-- =============================================

BEGIN;

-- 1. Add avatar column if not exists
ALTER TABLE "board_members"
ADD COLUMN IF NOT EXISTS "avatar" TEXT;

-- 2. Update avatars for all board members
-- Using professional business avatars from UI Faces API with proper gender representation

-- CEO - كريم (Male, Executive Blue)
UPDATE "board_members"
SET "avatar" = 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Karim&backgroundColor=1e40af&glassesProbability=30'
WHERE "role" = 'CEO';

-- CTO - نادية (Female, Tech Purple)
UPDATE "board_members"
SET "avatar" = 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Nadia&backgroundColor=7c3aed&glassesProbability=50&lips=variant01,variant02'
WHERE "role" = 'CTO';

-- CFO - ليلى (Female, Finance Green)
UPDATE "board_members"
SET "avatar" = 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Laila&backgroundColor=059669&glassesProbability=40&lips=variant01,variant03'
WHERE "role" = 'CFO';

-- CMO - يوسف (Male, Marketing Orange)
UPDATE "board_members"
SET "avatar" = 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Youssef&backgroundColor=ea580c&glassesProbability=20'
WHERE "role" = 'CMO';

-- COO - عمر (Male, Operations Teal)
UPDATE "board_members"
SET "avatar" = 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Omar&backgroundColor=0d9488&glassesProbability=30'
WHERE "role" = 'COO';

-- CLO - هنا (Female, Legal Rose)
UPDATE "board_members"
SET "avatar" = 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Hana&backgroundColor=be185d&glassesProbability=60&lips=variant02,variant03'
WHERE "role" = 'CLO';

-- 3. Update founder name to ممدوح
UPDATE "founders"
SET "full_name" = 'ممدوح'
WHERE "full_name" = 'المؤسس' OR "full_name" = 'أحمد';

COMMIT;

-- Verify the updates
SELECT "name", "name_ar", "role", "avatar" FROM "board_members" ORDER BY "role";
SELECT "full_name", "email" FROM "founders";
