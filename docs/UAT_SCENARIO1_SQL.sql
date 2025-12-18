-- =====================================================
-- 🧪 XChange Egypt - UAT Scenario 1: Direct Sale Journey
-- رحلة البيع المباشر - اختبار في Supabase SQL Editor
-- =====================================================
-- يستخدم المستخدمين الموجودين:
-- البائع: test1@xchange.eg (أحمد التاجر)
-- المشتري: test10@xchange.eg (هدى المشتريات)
-- =====================================================
-- تم التحقق من أسماء الأعمدة في: 2024-12-18
-- =====================================================

DO $$
DECLARE
    -- معرفات المستخدمين
    v_seller_id TEXT;
    v_buyer_id TEXT;
    v_seller_name TEXT;
    v_buyer_name TEXT;

    -- معرفات المحافظ
    v_seller_wallet_id TEXT;
    v_buyer_wallet_id TEXT;
    v_seller_balance DECIMAL := 0;
    v_buyer_balance DECIMAL := 0;

    -- معرفات المنتجات
    v_category_id TEXT;
    v_category_name TEXT;
    v_item_id TEXT;
    v_listing_id TEXT;

    -- معرفات الطلب والمعاملات
    v_transaction_id TEXT;
    v_escrow_id TEXT;
    v_review_id TEXT;

    -- القيم
    v_item_price DECIMAL := 45000;
    v_platform_fee DECIMAL := 2250; -- 5% رسوم المنصة
    v_seller_amount DECIMAL := 42750; -- المبلغ للبائع بعد خصم الرسوم

BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '🧪 السيناريو الأول: رحلة البيع المباشر (Direct Sale Journey)';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.1: جلب البائع (أحمد التاجر - test1@xchange.eg)
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.1: التحقق من البائع';

    SELECT id, COALESCE(full_name, 'أحمد التاجر') INTO v_seller_id, v_seller_name
    FROM users WHERE email = 'test1@xchange.eg' LIMIT 1;

    IF v_seller_id IS NULL THEN
        RAISE EXCEPTION '❌ البائع test1@xchange.eg غير موجود!';
    END IF;

    RAISE NOTICE '✅ البائع: % (ID: %)', v_seller_name, v_seller_id;

    -- التحقق من محفظة البائع
    SELECT id, balance INTO v_seller_wallet_id, v_seller_balance
    FROM wallets WHERE user_id = v_seller_id LIMIT 1;

    IF v_seller_wallet_id IS NULL THEN
        v_seller_wallet_id := 'uat1-wallet-s-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
        INSERT INTO wallets (id, user_id, balance, frozen_balance, lifetime_earned, lifetime_spent, created_at, updated_at)
        VALUES (v_seller_wallet_id, v_seller_id, 0, 0, 0, 0, NOW(), NOW());
        v_seller_balance := 0;
        RAISE NOTICE '✅ تم إنشاء محفظة للبائع';
    ELSE
        RAISE NOTICE '✅ محفظة البائع موجودة - الرصيد: % ج.م', v_seller_balance;
    END IF;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.1ب: جلب المشتري (هدى المشتريات)
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.1ب: التحقق من المشتري';

    SELECT id, COALESCE(full_name, 'هدى المشتريات') INTO v_buyer_id, v_buyer_name
    FROM users WHERE email = 'test10@xchange.eg' LIMIT 1;

    IF v_buyer_id IS NULL THEN
        RAISE EXCEPTION '❌ المشتري test10@xchange.eg غير موجود!';
    END IF;

    RAISE NOTICE '✅ المشتري: % (ID: %)', v_buyer_name, v_buyer_id;

    -- التحقق من محفظة المشتري
    SELECT id, balance INTO v_buyer_wallet_id, v_buyer_balance
    FROM wallets WHERE user_id = v_buyer_id LIMIT 1;

    IF v_buyer_wallet_id IS NULL THEN
        v_buyer_wallet_id := 'uat1-wallet-b-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
        INSERT INTO wallets (id, user_id, balance, frozen_balance, lifetime_earned, lifetime_spent, created_at, updated_at)
        VALUES (v_buyer_wallet_id, v_buyer_id, 100000, 0, 0, 0, NOW(), NOW());
        v_buyer_balance := 100000;
        RAISE NOTICE '✅ تم إنشاء محفظة للمشتري برصيد 100,000 ج.م';
    ELSE
        IF v_buyer_balance < v_item_price THEN
            UPDATE wallets SET balance = 100000, updated_at = NOW() WHERE id = v_buyer_wallet_id;
            v_buyer_balance := 100000;
            RAISE NOTICE '✅ تم تعديل رصيد المشتري إلى 100,000 ج.م';
        ELSE
            RAISE NOTICE '✅ محفظة المشتري موجودة - الرصيد: % ج.م', v_buyer_balance;
        END IF;
    END IF;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.2: إنشاء المنتج
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.2: إنشاء المنتج';

    -- الحصول على فئة (باستخدام name_ar و name_en)
    SELECT id, name_ar INTO v_category_id, v_category_name FROM categories
    WHERE name_ar ILIKE '%إلكترونيات%' OR name_en ILIKE '%electronics%'
       OR name_ar ILIKE '%هواتف%' OR name_en ILIKE '%phones%'
    LIMIT 1;

    IF v_category_id IS NULL THEN
        SELECT id, name_ar INTO v_category_id, v_category_name FROM categories LIMIT 1;
    END IF;

    IF v_category_id IS NULL THEN
        RAISE EXCEPTION '❌ لا توجد فئات في قاعدة البيانات!';
    END IF;

    RAISE NOTICE '✅ الفئة: % (ID: %)', v_category_name, v_category_id;

    -- إنشاء المنتج (بدون governorate/city - يستخدم location)
    v_item_id := 'uat1-item-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

    INSERT INTO items (
        id, seller_id, title, description,
        category_id, condition, estimated_value,
        location, images, status,
        created_at, updated_at
    ) VALUES (
        v_item_id,
        v_seller_id,
        'iPhone 14 Pro Max 256GB - UAT Test',
        'آيفون 14 برو ماكس 256 جيجا، لون بنفسجي غامق. استخدام شهرين فقط، حالة ممتازة.',
        v_category_id,
        'LIKE_NEW',
        v_item_price,
        'القاهرة - مدينة نصر',
        ARRAY['https://example.com/iphone1.jpg'],
        'ACTIVE',
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ تم إنشاء المنتج: %', v_item_id;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.3: إنشاء قائمة البيع (Listing)
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.3: إنشاء قائمة البيع';

    v_listing_id := 'uat1-listing-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

    -- listings تستخدم listing_type و views (وليس status و views_count)
    INSERT INTO listings (
        id, item_id, user_id,
        listing_type, price, currency,
        status, views,
        created_at, updated_at
    ) VALUES (
        v_listing_id,
        v_item_id,
        v_seller_id,
        'DIRECT_SALE',
        v_item_price,
        'EGP',
        'ACTIVE',
        0,
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ تم إنشاء القائمة: % - السعر: % ج.م', v_listing_id, v_item_price;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.4: محاكاة مشاهدة المنتج
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.4: المشتري يشاهد المنتج';

    UPDATE listings SET views = views + 1 WHERE id = v_listing_id;
    UPDATE items SET views = views + 1 WHERE id = v_item_id;

    RAISE NOTICE '✅ تم تسجيل المشاهدة';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.5: إنشاء المعاملة (Transaction)
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.5: إنشاء معاملة الشراء';

    v_transaction_id := 'uat1-trans-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

    -- transactions تستخدم listing_id, transaction_type, payment_status, delivery_status
    INSERT INTO transactions (
        id, listing_id,
        buyer_id, seller_id,
        transaction_type, amount, currency,
        payment_method, payment_status, delivery_status,
        created_at, updated_at
    ) VALUES (
        v_transaction_id,
        v_listing_id,
        v_buyer_id,
        v_seller_id,
        'DIRECT_SALE',
        v_item_price,
        'EGP',
        'WALLET',
        'PENDING',
        'PENDING',
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ تم إنشاء المعاملة: %', v_transaction_id;

    -- خصم المبلغ من محفظة المشتري
    UPDATE wallets SET balance = balance - v_item_price, updated_at = NOW()
    WHERE id = v_buyer_wallet_id;

    RAISE NOTICE '✅ تم خصم % ج.م من محفظة المشتري', v_item_price;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.6: إنشاء Escrow
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.6: حجز المبلغ في Escrow';

    v_escrow_id := 'uat1-escrow-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

    -- escrows (وليس escrow_transactions)
    -- EscrowType enum: SALE, BARTER, BARTER_CHAIN, SERVICE
    INSERT INTO escrows (
        id, escrow_type,
        buyer_id, seller_id,
        amount, currency,
        transaction_id, item_id,
        status, funded_at,
        created_at, updated_at
    ) VALUES (
        v_escrow_id,
        'SALE',
        v_buyer_id,
        v_seller_id,
        v_item_price,
        'EGP',
        v_transaction_id,
        v_item_id,
        'FUNDED',
        NOW(),
        NOW(),
        NOW()
    );

    -- ملاحظة: PaymentStatus يبقى PENDING حتى يتم التسليم ثم يصبح COMPLETED
    -- (لا يوجد HELD في PaymentStatus enum)

    RAISE NOTICE '✅ تم حجز المبلغ في Escrow: %', v_escrow_id;

    -- إشعار للبائع (notifications تستخدم is_read و metadata)
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES (
        'uat1-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        v_seller_id,
        'TRANSACTION',
        'طلب شراء جديد!',
        'لديك طلب شراء جديد لـ iPhone 14 Pro Max',
        jsonb_build_object('transactionId', v_transaction_id, 'amount', v_item_price),
        false,
        NOW()
    );

    RAISE NOTICE '✅ تم إرسال إشعار للبائع';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.7: تأكيد وشحن الطلب
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.7: البائع يؤكد ويشحن';

    UPDATE transactions
    SET delivery_status = 'SHIPPED',
        tracking_number = 'ARX-EG-' || UPPER(SUBSTRING(v_transaction_id, 12, 8)),
        updated_at = NOW()
    WHERE id = v_transaction_id;

    -- إشعار المشتري
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES (
        'uat1-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        v_buyer_id,
        'TRANSACTION',
        'تم شحن طلبك!',
        'طلبك في الطريق - رقم التتبع: ARX-EG-' || UPPER(SUBSTRING(v_transaction_id, 12, 8)),
        jsonb_build_object('transactionId', v_transaction_id),
        false,
        NOW()
    );

    RAISE NOTICE '✅ تم شحن الطلب';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.8: استلام الطلب
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.8: المشتري يستلم';

    -- تحديث المعاملة
    UPDATE transactions
    SET delivery_status = 'DELIVERED',
        payment_status = 'COMPLETED',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = v_transaction_id;

    -- تحرير Escrow
    UPDATE escrows
    SET status = 'RELEASED',
        released_at = NOW(),
        updated_at = NOW()
    WHERE id = v_escrow_id;

    -- تحويل المبلغ للبائع
    UPDATE wallets SET balance = balance + v_seller_amount, updated_at = NOW()
    WHERE id = v_seller_wallet_id;

    RAISE NOTICE '✅ تم تحويل % ج.م للبائع', v_seller_amount;

    -- تحديث حالة المنتج والقائمة
    -- ItemStatus: DRAFT, ACTIVE, SOLD, TRADED, ARCHIVED, DELETED
    -- ListingStatus: ACTIVE, COMPLETED, CANCELLED, EXPIRED
    UPDATE items SET status = 'SOLD', updated_at = NOW() WHERE id = v_item_id;
    UPDATE listings SET status = 'COMPLETED', updated_at = NOW() WHERE id = v_listing_id;

    RAISE NOTICE '✅ تم تحديث حالة المنتج إلى SOLD';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.9: التقييم
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.9: إضافة التقييم';

    v_review_id := 'uat1-review-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

    -- reviews تستخدم transaction_id و overall_rating
    INSERT INTO reviews (
        id, transaction_id,
        reviewer_id, reviewed_id,
        review_type, overall_rating,
        comment, is_verified_purchase,
        created_at, updated_at
    ) VALUES (
        v_review_id,
        v_transaction_id,
        v_buyer_id,
        v_seller_id,
        'SELLER_REVIEW',
        5,
        'تجربة شراء ممتازة! المنتج مطابق للوصف والبائع متعاون.',
        true,
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ تم إضافة تقييم 5 نجوم';

    -- إشعار البائع بإتمام البيع
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES (
        'uat1-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        v_seller_id,
        'TRANSACTION',
        'تم إتمام البيع!',
        'تهانينا! تم تحويل ' || v_seller_amount || ' ج.م إلى محفظتك',
        jsonb_build_object('transactionId', v_transaction_id, 'amount', v_seller_amount),
        false,
        NOW()
    );

    -- ═══════════════════════════════════════════════════════════════
    -- ملخص النتائج
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '📊 ملخص نتائج السيناريو الأول';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '👤 البائع: % - رصيد جديد: % ج.م', v_seller_name, v_seller_balance + v_seller_amount;
    RAISE NOTICE '👤 المشتري: % - رصيد جديد: % ج.م', v_buyer_name, v_buyer_balance - v_item_price;
    RAISE NOTICE '📱 المنتج: % - الحالة: SOLD', v_item_id;
    RAISE NOTICE '💳 المعاملة: % - المبلغ: % ج.م', v_transaction_id, v_item_price;
    RAISE NOTICE '🏦 رسوم المنصة: % ج.م (5%%)', v_platform_fee;
    RAISE NOTICE '⭐ التقييم: 5/5 نجوم';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ اكتمل السيناريو الأول بنجاح!';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';

END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 🔍 استعلامات التحقق
-- ═══════════════════════════════════════════════════════════════════

SELECT '👥 المستخدمون:' as section;
SELECT id, email, full_name, governorate, city
FROM users WHERE email IN ('test1@xchange.eg', 'test10@xchange.eg');

SELECT '💰 المحافظ:' as section;
SELECT w.id, u.email, u.full_name, w.balance
FROM wallets w JOIN users u ON w.user_id = u.id
WHERE u.email IN ('test1@xchange.eg', 'test10@xchange.eg');

SELECT '📦 المعاملات الأخيرة:' as section;
SELECT id, transaction_type, payment_status, delivery_status, amount
FROM transactions WHERE id LIKE 'uat1-%' ORDER BY created_at DESC LIMIT 5;

SELECT '⭐ التقييمات:' as section;
SELECT id, overall_rating, LEFT(comment, 40) as comment_preview
FROM reviews WHERE id LIKE 'uat1-%';

SELECT '🔔 الإشعارات:' as section;
SELECT id, type, title, is_read FROM notifications WHERE id LIKE 'uat1-%';
