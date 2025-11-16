# تعليمات تشغيل Migration يدوياً على Supabase

## المشكلة
Railway لم يقم بتطبيق الـ migrations على قاعدة بيانات Supabase تلقائياً.

## الحل: تشغيل الـ SQL يدوياً

### الخطوات:

#### 1️⃣ افتح Supabase SQL Editor
1. اذهب إلى: https://supabase.com/dashboard
2. اضغط على مشروعك
3. من القائمة اليسرى، اضغط على **"SQL Editor"**

#### 2️⃣ انسخ محتوى ملف الـ Migration
افتح الملف التالي وانسخ كل محتوياته:
```
backend/prisma/migrations/20241116000000_init/migration.sql
```

أو استخدم هذا الأمر لعرض الملف كاملاً:
```bash
cat backend/prisma/migrations/20241116000000_init/migration.sql
```

#### 3️⃣ الصق في SQL Editor
1. في Supabase SQL Editor، الصق كل محتوى الملف (1,207 سطر)
2. اضغط **"RUN"** أو **Ctrl/Cmd + Enter**

#### 4️⃣ انتظر التنفيذ
- سيستغرق الأمر 5-10 ثوانٍ
- يجب أن ترى رسالة نجاح

#### 5️⃣ تحقق من النتيجة
افتح **Table Editor** في Supabase - يجب أن ترى:

**الجداول الأساسية:**
- ✅ users
- ✅ categories
- ✅ items
- ✅ listings

**جداول المزادات:**
- ✅ auctions
- ✅ auction_bids
- ✅ reverse_auctions
- ✅ reverse_auction_bids

**جداول المقايضة:**
- ✅ barter_offers
- ✅ barter_preference_sets
- ✅ barter_preference_items
- ✅ barter_chains
- ✅ barter_participants

**جداول المعاملات والمراجعات:**
- ✅ transactions
- ✅ reviews
- ✅ review_responses
- ✅ review_votes
- ✅ review_reports

**جداول الإشعارات والرسائل:**
- ✅ notifications
- ✅ notification_preferences
- ✅ email_queue
- ✅ conversations
- ✅ messages

**وأكثر...**
إجمالي: **32 جدول**

---

## ⚠️ ملاحظة هامة

بعد تشغيل الـ migration يدوياً، يجب تسجيل ذلك في جدول `_prisma_migrations`:

```sql
INSERT INTO _prisma_migrations (
    id,
    checksum,
    finished_at,
    migration_name,
    logs,
    rolled_back_at,
    started_at,
    applied_steps_count
) VALUES (
    '20241116000000-init',
    'manual-migration',
    NOW(),
    '20241116000000_init',
    NULL,
    NULL,
    NOW(),
    1
);
```

هذا يخبر Prisma أن الـ migration تم تطبيقها.

---

## 🔧 إذا واجهت مشكلة

إذا ظهر خطأ مثل "type already exists" أو "table already exists":
1. هذا يعني أن بعض الـ migration تم تطبيقه جزئياً
2. قد تحتاج إلى حذف القطع المكررة أولاً
3. أخبرني بالخطأ بالضبط وسأساعدك

---

## 🚀 بعد الانتهاء

بعد تشغيل الـ migration بنجاح:
1. ✅ قاعدة البيانات ستكون جاهزة
2. ✅ Railway سيتصل بـ Supabase وسيعمل بشكل صحيح
3. ✅ يمكنك البدء في استخدام التطبيق!

---

## 📞 الدعم

إذا احتجت مساعدة، أخبرني:
- نص الخطأ إذا ظهر
- أو screenshot من Supabase
