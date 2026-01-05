-- ═══════════════════════════════════════════════════════════════
-- 🧹 سكريبت تنظيف قاعدة البيانات - Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════
-- تشغيل في: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ============================================
-- 1. عرض الإحصائيات قبل التنظيف
-- ============================================
SELECT '📊 إحصائيات قبل التنظيف' as info;

SELECT
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM items) as total_items,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM notifications) as total_notifications,
  (SELECT COUNT(*) FROM refresh_tokens) as total_tokens;

-- ============================================
-- 2. حذف الفئات المتكررة (بنفس الاسم العربي والأب)
-- ============================================
SELECT '📁 حذف الفئات المتكررة...' as step;

-- عرض الفئات المتكررة أولاً
SELECT name_ar, parent_id, COUNT(*) as duplicates
FROM categories
GROUP BY name_ar, parent_id
HAVING COUNT(*) > 1;

-- حذف الفئات المتكررة (الاحتفاظ بالأقدم)
DELETE FROM categories
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY name_ar, parent_id ORDER BY created_at ASC) as rn
    FROM categories
  ) sub
  WHERE rn > 1
);

-- ============================================
-- 3. حذف العناصر المتكررة (نفس العنوان + البائع)
-- ============================================
SELECT '📦 حذف العناصر المتكررة...' as step;

-- عرض العناصر المتكررة
SELECT title, seller_id, COUNT(*) as duplicates
FROM items
GROUP BY title, seller_id
HAVING COUNT(*) > 1;

-- حذف العناصر المتكررة (الاحتفاظ بالأقدم)
DELETE FROM items
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY title, seller_id ORDER BY created_at ASC) as rn
    FROM items
  ) sub
  WHERE rn > 1
);

-- ============================================
-- 4. حذف المستخدمين التجريبيين
-- ============================================
SELECT '👤 حذف المستخدمين التجريبيين...' as step;

-- عرض المستخدمين التجريبيين
SELECT email, full_name FROM users
WHERE email ILIKE '%test%'
   OR email ILIKE '%demo%'
   OR email ILIKE '%example%'
   OR email ILIKE '%fake%';

-- حذف الإشعارات المرتبطة أولاً
DELETE FROM notifications WHERE user_id IN (
  SELECT id FROM users
  WHERE email ILIKE '%test%'
     OR email ILIKE '%demo%'
     OR email ILIKE '%example%'
     OR email ILIKE '%fake%'
);

-- حذف التوكنات المرتبطة
DELETE FROM refresh_tokens WHERE user_id IN (
  SELECT id FROM users
  WHERE email ILIKE '%test%'
     OR email ILIKE '%demo%'
     OR email ILIKE '%example%'
     OR email ILIKE '%fake%'
);

-- حذف العناصر المرتبطة
DELETE FROM items WHERE seller_id IN (
  SELECT id FROM users
  WHERE email ILIKE '%test%'
     OR email ILIKE '%demo%'
     OR email ILIKE '%example%'
     OR email ILIKE '%fake%'
);

-- حذف المستخدمين التجريبيين
DELETE FROM users
WHERE email ILIKE '%test%'
   OR email ILIKE '%demo%'
   OR email ILIKE '%example%'
   OR email ILIKE '%fake%';

-- ============================================
-- 5. حذف الإشعارات القديمة المقروءة (أكثر من 30 يوم)
-- ============================================
SELECT '🔔 حذف الإشعارات القديمة...' as step;

DELETE FROM notifications
WHERE is_read = true
  AND created_at < NOW() - INTERVAL '30 days';

-- ============================================
-- 6. حذف التوكنات المنتهية
-- ============================================
SELECT '🔑 حذف التوكنات المنتهية...' as step;

DELETE FROM refresh_tokens
WHERE expires_at < NOW();

-- ============================================
-- 7. حذف سجل البحث القديم (أكثر من 90 يوم)
-- ============================================
SELECT '🔍 حذف سجل البحث القديم...' as step;

DELETE FROM search_history
WHERE created_at < NOW() - INTERVAL '90 days';

-- ============================================
-- 8. إصلاح العلاقات المعطلة
-- ============================================
SELECT '🔗 إصلاح العلاقات المعطلة...' as step;

-- إصلاح العناصر بفئات غير موجودة
UPDATE items SET category_id = NULL
WHERE category_id IS NOT NULL
  AND category_id NOT IN (SELECT id FROM categories);

UPDATE items SET desired_category_id = NULL
WHERE desired_category_id IS NOT NULL
  AND desired_category_id NOT IN (SELECT id FROM categories);

-- ============================================
-- 9. عرض الإحصائيات بعد التنظيف
-- ============================================
SELECT '📊 إحصائيات بعد التنظيف' as info;

SELECT
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM items) as total_items,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM notifications) as total_notifications,
  (SELECT COUNT(*) FROM refresh_tokens) as total_tokens;

SELECT '✅ تم التنظيف بنجاح!' as result;
