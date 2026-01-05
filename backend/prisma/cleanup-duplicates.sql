-- ═══════════════════════════════════════════════════════════════
-- 🧹 سكريبت تنظيف قاعدة البيانات - Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════
-- تشغيل في: Supabase Dashboard → SQL Editor → New Query
-- آخر تحديث: تم اختباره ويعمل بنجاح
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
-- 2. تنظيف العناصر المتكررة (مع كل العلاقات)
-- ============================================

-- تحديد العناصر المتكررة
CREATE TEMP TABLE items_to_delete AS
SELECT id FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY title, seller_id ORDER BY created_at) as rn
  FROM items
) sub WHERE rn > 1;

-- تحديد الإعلانات المرتبطة
CREATE TEMP TABLE listings_to_delete AS
SELECT id FROM listings WHERE item_id IN (SELECT id FROM items_to_delete);

-- حذف order_items
DELETE FROM order_items WHERE listing_id IN (SELECT id FROM listings_to_delete);

-- حذف المعاملات
DELETE FROM transactions WHERE listing_id IN (SELECT id FROM listings_to_delete);

-- حذف الإعلانات
DELETE FROM listings WHERE id IN (SELECT id FROM listings_to_delete);

-- حذف barter_participants
DELETE FROM barter_participants WHERE giving_item_id IN (SELECT id FROM items_to_delete);
DELETE FROM barter_participants WHERE receiving_item_id IN (SELECT id FROM items_to_delete);

-- حذف عروض المقايضة
DELETE FROM barter_offers WHERE linked_item_id IN (SELECT id FROM items_to_delete);

-- حذف العناصر المتكررة
DELETE FROM items WHERE id IN (SELECT id FROM items_to_delete);

-- تنظيف الجداول المؤقتة
DROP TABLE listings_to_delete;
DROP TABLE items_to_delete;

-- ============================================
-- 3. حذف الفئات المتكررة
-- ============================================
DELETE FROM categories WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name_ar, parent_id ORDER BY created_at) as rn
    FROM categories
  ) sub WHERE rn > 1
);

-- ============================================
-- 4. حذف الإشعارات القديمة المقروءة (أكثر من 30 يوم)
-- ============================================
DELETE FROM notifications
WHERE is_read = true
  AND created_at < NOW() - INTERVAL '30 days';

-- ============================================
-- 5. حذف التوكنات المنتهية
-- ============================================
DELETE FROM refresh_tokens WHERE expires_at < NOW();

-- ============================================
-- 6. عرض الإحصائيات بعد التنظيف
-- ============================================
SELECT '✅ تم التنظيف بنجاح!' as result;

SELECT
  (SELECT COUNT(*) FROM categories) as الفئات,
  (SELECT COUNT(*) FROM items) as العناصر,
  (SELECT COUNT(*) FROM users) as المستخدمين,
  (SELECT COUNT(*) FROM notifications) as الإشعارات,
  (SELECT COUNT(*) FROM refresh_tokens) as التوكنات;
