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
-- Using professional AI-generated avatars from UI Avatars API with consistent style

-- CEO - كريم (Male, Blue theme)
UPDATE "board_members"
SET "avatar" = 'https://api.dicebear.com/7.x/personas/svg?seed=Karim&backgroundColor=1e40af&clothingColor=1e40af'
WHERE "role" = 'CEO';

-- CTO - نادية (Female, Purple theme)
UPDATE "board_members"
SET "avatar" = 'https://api.dicebear.com/7.x/personas/svg?seed=Nadia&backgroundColor=7c3aed&clothingColor=7c3aed'
WHERE "role" = 'CTO';

-- CFO - ليلى (Female, Green theme)
UPDATE "board_members"
SET "avatar" = 'https://api.dicebear.com/7.x/personas/svg?seed=Laila&backgroundColor=059669&clothingColor=059669'
WHERE "role" = 'CFO';

-- CMO - يوسف (Male, Orange theme)
UPDATE "board_members"
SET "avatar" = 'https://api.dicebear.com/7.x/personas/svg?seed=Youssef&backgroundColor=ea580c&clothingColor=ea580c'
WHERE "role" = 'CMO';

-- COO - عمر (Male, Teal theme)
UPDATE "board_members"
SET "avatar" = 'https://api.dicebear.com/7.x/personas/svg?seed=Omar&backgroundColor=0d9488&clothingColor=0d9488'
WHERE "role" = 'COO';

-- CLO - هنا (Female, Pink theme)
UPDATE "board_members"
SET "avatar" = 'https://api.dicebear.com/7.x/personas/svg?seed=Hana&backgroundColor=db2777&clothingColor=db2777'
WHERE "role" = 'CLO';

-- 3. Also update founder name if needed
UPDATE "founders"
SET "full_name" = 'ممدوح'
WHERE "full_name" = 'المؤسس';

COMMIT;

-- Verify the updates
SELECT "name", "name_ar", "role", "avatar" FROM "board_members" ORDER BY "role";
SELECT "full_name", "email" FROM "founders";
