-- =====================================================
-- 🧪 XChange Egypt - UAT Scenario 1: Direct Sale Journey
-- رحلة البيع المباشر - اختبار في Supabase SQL Editor
-- =====================================================

-- ⚠️ تنبيه: شغّل هذا السكريبت في Supabase SQL Editor
-- ⚠️ سيتم إنشاء بيانات اختبارية جديدة

DO $$
DECLARE
    -- معرفات المستخدمين
    v_seller_id TEXT;
    v_buyer_id TEXT;

    -- معرفات المحافظ
    v_seller_wallet_id TEXT;
    v_buyer_wallet_id TEXT;

    -- معرفات المنتجات
    v_category_id TEXT;
    v_item_id TEXT;
    v_listing_id TEXT;

    -- معرفات الطلب
    v_order_id TEXT;
    v_escrow_id TEXT;
    v_transaction_id TEXT;
    v_review_id TEXT;

    -- القيم
    v_item_price DECIMAL := 45000;
    v_platform_fee DECIMAL := 2250; -- 5% رسوم المنصة
    v_seller_amount DECIMAL := 42750; -- المبلغ للبائع بعد خصم الرسوم

BEGIN
    RAISE NOTICE '══════════════════════════════════════════════════════════';
    RAISE NOTICE '🧪 بدء تنفيذ السيناريو الأول: رحلة البيع المباشر';
    RAISE NOTICE '══════════════════════════════════════════════════════════';

    -- ═══════════════════════════════════════════════════════
    -- الخطوة 1.1: إنشاء/التحقق من البائع (أحمد)
    -- ═══════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.1: إنشاء البائع (أحمد)';

    -- التحقق من وجود البائع
    SELECT id INTO v_seller_id FROM users WHERE email = 'ahmed.uat@test.com' LIMIT 1;

    IF v_seller_id IS NULL THEN
        v_seller_id := 'uat-seller-' || gen_random_uuid()::TEXT;

        INSERT INTO users (
            id, email, name, phone,
            governorate, city,
            status, role, email_verified,
            created_at, updated_at
        ) VALUES (
            v_seller_id,
            'ahmed.uat@test.com',
            'أحمد محمد - UAT Seller',
            '01012345678',
            'القاهرة',
            'مدينة نصر',
            'ACTIVE',
            'USER',
            true,
            NOW(),
            NOW()
        );

        RAISE NOTICE '✅ تم إنشاء البائع: %', v_seller_id;
    ELSE
        RAISE NOTICE '✅ البائع موجود مسبقاً: %', v_seller_id;
    END IF;

    -- إنشاء محفظة البائع
    SELECT id INTO v_seller_wallet_id FROM wallets WHERE user_id = v_seller_id LIMIT 1;

    IF v_seller_wallet_id IS NULL THEN
        v_seller_wallet_id := 'uat-wallet-seller-' || gen_random_uuid()::TEXT;

        INSERT INTO wallets (id, user_id, balance, currency, created_at, updated_at)
        VALUES (v_seller_wallet_id, v_seller_id, 0, 'EGP', NOW(), NOW());

        RAISE NOTICE '✅ تم إنشاء محفظة البائع برصيد 0';
    ELSE
        RAISE NOTICE '✅ محفظة البائع موجودة: %', v_seller_wallet_id;
    END IF;

    -- ═══════════════════════════════════════════════════════
    -- الخطوة 1.1ب: إنشاء/التحقق من المشتري (فاطمة)
    -- ═══════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.1ب: إنشاء المشتري (فاطمة)';

    SELECT id INTO v_buyer_id FROM users WHERE email = 'fatma.uat@test.com' LIMIT 1;

    IF v_buyer_id IS NULL THEN
        v_buyer_id := 'uat-buyer-' || gen_random_uuid()::TEXT;

        INSERT INTO users (
            id, email, name, phone,
            governorate, city,
            status, role, email_verified,
            created_at, updated_at
        ) VALUES (
            v_buyer_id,
            'fatma.uat@test.com',
            'فاطمة علي - UAT Buyer',
            '01098765432',
            'الجيزة',
            'الدقي',
            'ACTIVE',
            'USER',
            true,
            NOW(),
            NOW()
        );

        RAISE NOTICE '✅ تم إنشاء المشتري: %', v_buyer_id;
    ELSE
        RAISE NOTICE '✅ المشتري موجود مسبقاً: %', v_buyer_id;
    END IF;

    -- إنشاء محفظة المشتري مع رصيد
    SELECT id INTO v_buyer_wallet_id FROM wallets WHERE user_id = v_buyer_id LIMIT 1;

    IF v_buyer_wallet_id IS NULL THEN
        v_buyer_wallet_id := 'uat-wallet-buyer-' || gen_random_uuid()::TEXT;

        INSERT INTO wallets (id, user_id, balance, currency, created_at, updated_at)
        VALUES (v_buyer_wallet_id, v_buyer_id, 100000, 'EGP', NOW(), NOW());

        RAISE NOTICE '✅ تم إنشاء محفظة المشتري برصيد 100,000 ج.م';
    ELSE
        -- تحديث الرصيد للاختبار
        UPDATE wallets SET balance = 100000 WHERE id = v_buyer_wallet_id;
        RAISE NOTICE '✅ تم تحديث رصيد المشتري إلى 100,000 ج.م';
    END IF;

    -- ═══════════════════════════════════════════════════════
    -- الخطوة 1.2: إنشاء المنتج (iPhone 14 Pro Max)
    -- ═══════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.2: إنشاء المنتج';

    -- الحصول على فئة الإلكترونيات
    SELECT id INTO v_category_id FROM categories
    WHERE name ILIKE '%إلكترونيات%' OR name ILIKE '%electronics%' OR name ILIKE '%هواتف%'
    LIMIT 1;

    IF v_category_id IS NULL THEN
        SELECT id INTO v_category_id FROM categories LIMIT 1;
    END IF;

    RAISE NOTICE 'ℹ️  الفئة المستخدمة: %', v_category_id;

    -- إنشاء المنتج
    v_item_id := 'uat-item-' || gen_random_uuid()::TEXT;

    INSERT INTO items (
        id, title, description,
        category_id, seller_id,
        estimated_value, condition,
        governorate, city,
        status, open_to_exchange,
        images,
        created_at, updated_at
    ) VALUES (
        v_item_id,
        'iPhone 14 Pro Max 256GB - UAT Test',
        'آيفون 14 برو ماكس، استخدام شهرين فقط، مع جميع الملحقات والضمان. لون Deep Purple. البطارية 98%. اختبار UAT للسيناريو الأول.',
        v_category_id,
        v_seller_id,
        v_item_price,
        'LIKE_NEW',
        'القاهرة',
        'مدينة نصر',
        'ACTIVE',
        false,
        ARRAY['https://example.com/iphone14-1.jpg', 'https://example.com/iphone14-2.jpg'],
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ تم إنشاء المنتج: %', v_item_id;
    RAISE NOTICE '   📱 العنوان: iPhone 14 Pro Max 256GB';
    RAISE NOTICE '   💰 القيمة: % ج.م', v_item_price;

    -- ═══════════════════════════════════════════════════════
    -- الخطوة 1.3: إنشاء قائمة البيع (Listing)
    -- ═══════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.3: إنشاء قائمة البيع';

    v_listing_id := 'uat-listing-' || gen_random_uuid()::TEXT;

    INSERT INTO listings (
        id, item_id, user_id,
        price, currency,
        status, allow_barter, allow_negotiation,
        minimum_price,
        views_count,
        created_at, updated_at
    ) VALUES (
        v_listing_id,
        v_item_id,
        v_seller_id,
        v_item_price,
        'EGP',
        'ACTIVE',
        false,
        true,
        40000, -- الحد الأدنى للتفاوض
        0,
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ تم إنشاء قائمة البيع: %', v_listing_id;
    RAISE NOTICE '   💵 السعر: % ج.م', v_item_price;
    RAISE NOTICE '   📉 الحد الأدنى: 40,000 ج.م';

    -- ═══════════════════════════════════════════════════════
    -- الخطوة 1.4: محاكاة البحث (تحديث عداد المشاهدات)
    -- ═══════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.4: محاكاة بحث المشتري';

    UPDATE listings SET views_count = views_count + 1 WHERE id = v_listing_id;

    RAISE NOTICE '✅ تم زيادة عداد المشاهدات';
    RAISE NOTICE '   🔍 المشتري شاهد المنتج';

    -- ═══════════════════════════════════════════════════════
    -- الخطوة 1.5 + 1.6: إنشاء الطلب مباشرة
    -- ═══════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.5 + 1.6: إنشاء الطلب';

    v_order_id := 'uat-order-' || gen_random_uuid()::TEXT;

    INSERT INTO orders (
        id, buyer_id, seller_id,
        listing_id, item_id,
        total_amount, currency,
        status, payment_method, payment_status,
        shipping_address,
        created_at, updated_at
    ) VALUES (
        v_order_id,
        v_buyer_id,
        v_seller_id,
        v_listing_id,
        v_item_id,
        v_item_price,
        'EGP',
        'PENDING',
        'WALLET',
        'PENDING',
        jsonb_build_object(
            'governorate', 'الجيزة',
            'city', 'الدقي',
            'street', 'شارع التحرير',
            'building', '15',
            'floor', '3',
            'phone', '01098765432'
        ),
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ تم إنشاء الطلب: %', v_order_id;
    RAISE NOTICE '   📦 الحالة: PENDING';

    -- خصم المبلغ من محفظة المشتري
    UPDATE wallets
    SET balance = balance - v_item_price,
        updated_at = NOW()
    WHERE id = v_buyer_wallet_id;

    RAISE NOTICE '✅ تم خصم % ج.م من محفظة المشتري', v_item_price;

    -- إنشاء سجل Escrow
    v_escrow_id := 'uat-escrow-' || gen_random_uuid()::TEXT;

    INSERT INTO escrow_transactions (
        id, order_id,
        buyer_id, seller_id,
        amount, currency,
        status,
        created_at, updated_at
    ) VALUES (
        v_escrow_id,
        v_order_id,
        v_buyer_id,
        v_seller_id,
        v_item_price,
        'EGP',
        'HELD',
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ تم حجز المبلغ في Escrow: %', v_escrow_id;

    -- تحديث حالة الدفع
    UPDATE orders
    SET payment_status = 'ESCROW',
        updated_at = NOW()
    WHERE id = v_order_id;

    -- ═══════════════════════════════════════════════════════
    -- الخطوة 1.7: تأكيد الطلب من البائع
    -- ═══════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.7: تأكيد الطلب من البائع';

    UPDATE orders
    SET status = 'CONFIRMED',
        estimated_delivery = NOW() + INTERVAL '3 days',
        updated_at = NOW()
    WHERE id = v_order_id;

    RAISE NOTICE '✅ تم تأكيد الطلب من البائع';
    RAISE NOTICE '   📦 الحالة الجديدة: CONFIRMED';
    RAISE NOTICE '   📅 موعد التسليم المتوقع: خلال 3 أيام';

    -- إنشاء إشعار للمشتري
    INSERT INTO notifications (
        id, user_id, type, title, message,
        data, read, created_at
    ) VALUES (
        'uat-notif-' || gen_random_uuid()::TEXT,
        v_buyer_id,
        'ORDER_CONFIRMED',
        'تم تأكيد طلبك',
        'قام البائع بتأكيد طلبك رقم ' || v_order_id || '. سيتم الشحن قريباً.',
        jsonb_build_object('orderId', v_order_id),
        false,
        NOW()
    );

    RAISE NOTICE '✅ تم إرسال إشعار للمشتري';

    -- ═══════════════════════════════════════════════════════
    -- الخطوة 1.8: شحن الطلب
    -- ═══════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.8: شحن الطلب';

    UPDATE orders
    SET status = 'SHIPPED',
        tracking_number = 'EGY-UAT-' || SUBSTRING(v_order_id, 1, 8),
        shipping_company = 'Aramex',
        shipped_at = NOW(),
        updated_at = NOW()
    WHERE id = v_order_id;

    RAISE NOTICE '✅ تم شحن الطلب';
    RAISE NOTICE '   🚚 شركة الشحن: Aramex';
    RAISE NOTICE '   📦 رقم التتبع: EGY-UAT-%', SUBSTRING(v_order_id, 1, 8);

    -- إشعار المشتري بالشحن
    INSERT INTO notifications (
        id, user_id, type, title, message,
        data, read, created_at
    ) VALUES (
        'uat-notif-' || gen_random_uuid()::TEXT,
        v_buyer_id,
        'ORDER_SHIPPED',
        'تم شحن طلبك',
        'طلبك في الطريق إليك! رقم التتبع: EGY-UAT-' || SUBSTRING(v_order_id, 1, 8),
        jsonb_build_object('orderId', v_order_id, 'trackingNumber', 'EGY-UAT-' || SUBSTRING(v_order_id, 1, 8)),
        false,
        NOW()
    );

    RAISE NOTICE '✅ تم إرسال إشعار الشحن للمشتري';

    -- ═══════════════════════════════════════════════════════
    -- الخطوة 1.9: استلام الطلب والتقييم
    -- ═══════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '📌 الخطوة 1.9: استلام الطلب والتقييم';

    -- تحديث حالة الطلب
    UPDATE orders
    SET status = 'DELIVERED',
        payment_status = 'COMPLETED',
        delivered_at = NOW(),
        updated_at = NOW()
    WHERE id = v_order_id;

    RAISE NOTICE '✅ تم تأكيد الاستلام';
    RAISE NOTICE '   📦 الحالة النهائية: DELIVERED';

    -- تحديث Escrow - تحرير المبلغ
    UPDATE escrow_transactions
    SET status = 'RELEASED',
        released_at = NOW(),
        updated_at = NOW()
    WHERE id = v_escrow_id;

    RAISE NOTICE '✅ تم تحرير المبلغ من Escrow';

    -- تحويل المبلغ للبائع (بعد خصم الرسوم)
    UPDATE wallets
    SET balance = balance + v_seller_amount,
        updated_at = NOW()
    WHERE id = v_seller_wallet_id;

    RAISE NOTICE '✅ تم تحويل % ج.م للبائع (بعد خصم 5%% رسوم)', v_seller_amount;

    -- إنشاء سجل المعاملة
    v_transaction_id := 'uat-trans-' || gen_random_uuid()::TEXT;

    INSERT INTO transactions (
        id, order_id,
        from_user_id, to_user_id,
        amount, currency,
        type, status,
        platform_fee,
        created_at
    ) VALUES (
        v_transaction_id,
        v_order_id,
        v_buyer_id,
        v_seller_id,
        v_item_price,
        'EGP',
        'PURCHASE',
        'COMPLETED',
        v_platform_fee,
        NOW()
    );

    RAISE NOTICE '✅ تم تسجيل المعاملة: %', v_transaction_id;

    -- تحديث حالة المنتج والقائمة
    UPDATE items SET status = 'SOLD', updated_at = NOW() WHERE id = v_item_id;
    UPDATE listings SET status = 'SOLD', updated_at = NOW() WHERE id = v_listing_id;

    RAISE NOTICE '✅ تم تحديث حالة المنتج إلى SOLD';

    -- إضافة التقييم
    v_review_id := 'uat-review-' || gen_random_uuid()::TEXT;

    INSERT INTO reviews (
        id, order_id,
        reviewer_id, reviewed_id,
        rating, comment,
        created_at
    ) VALUES (
        v_review_id,
        v_order_id,
        v_buyer_id,
        v_seller_id,
        5,
        'منتج ممتاز والبائع متعاون جداً. التوصيل سريع والمنتج مطابق للوصف تماماً. أنصح بالتعامل معه. - UAT Test',
        NOW()
    );

    RAISE NOTICE '✅ تم إضافة التقييم: 5 نجوم';

    -- منح نقاط XChange للمشتري
    INSERT INTO exchange_points (
        id, user_id,
        points, type, description,
        reference_id,
        created_at
    ) VALUES (
        'uat-points-' || gen_random_uuid()::TEXT,
        v_buyer_id,
        450, -- 1% من قيمة الطلب
        'PURCHASE_REWARD',
        'مكافأة شراء - طلب UAT',
        v_order_id,
        NOW()
    );

    RAISE NOTICE '✅ تم منح 450 نقطة XChange للمشتري';

    -- إشعار البائع
    INSERT INTO notifications (
        id, user_id, type, title, message,
        data, read, created_at
    ) VALUES (
        'uat-notif-' || gen_random_uuid()::TEXT,
        v_seller_id,
        'ORDER_COMPLETED',
        'تم إتمام البيع بنجاح!',
        'تهانينا! تم استلام طلبك وتحويل ' || v_seller_amount || ' ج.م إلى محفظتك.',
        jsonb_build_object('orderId', v_order_id, 'amount', v_seller_amount),
        false,
        NOW()
    );

    -- ═══════════════════════════════════════════════════════
    -- ملخص النتائج
    -- ═══════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════';
    RAISE NOTICE '📊 ملخص نتائج السيناريو الأول';
    RAISE NOTICE '══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '👤 البائع (أحمد):';
    RAISE NOTICE '   ID: %', v_seller_id;
    RAISE NOTICE '   الرصيد النهائي: % ج.م', v_seller_amount;
    RAISE NOTICE '';
    RAISE NOTICE '👤 المشتري (فاطمة):';
    RAISE NOTICE '   ID: %', v_buyer_id;
    RAISE NOTICE '   الرصيد النهائي: % ج.م', (100000 - v_item_price);
    RAISE NOTICE '   النقاط المكتسبة: 450';
    RAISE NOTICE '';
    RAISE NOTICE '📱 المنتج:';
    RAISE NOTICE '   ID: %', v_item_id;
    RAISE NOTICE '   الحالة: SOLD';
    RAISE NOTICE '';
    RAISE NOTICE '📋 القائمة:';
    RAISE NOTICE '   ID: %', v_listing_id;
    RAISE NOTICE '   الحالة: SOLD';
    RAISE NOTICE '';
    RAISE NOTICE '📦 الطلب:';
    RAISE NOTICE '   ID: %', v_order_id;
    RAISE NOTICE '   الحالة: DELIVERED';
    RAISE NOTICE '   المبلغ: % ج.م', v_item_price;
    RAISE NOTICE '';
    RAISE NOTICE '💰 المعاملة المالية:';
    RAISE NOTICE '   ID: %', v_transaction_id;
    RAISE NOTICE '   رسوم المنصة: % ج.م (5%%)', v_platform_fee;
    RAISE NOTICE '   صافي البائع: % ج.م', v_seller_amount;
    RAISE NOTICE '';
    RAISE NOTICE '⭐ التقييم:';
    RAISE NOTICE '   ID: %', v_review_id;
    RAISE NOTICE '   النجوم: 5/5';
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ اكتمل السيناريو الأول بنجاح!';
    RAISE NOTICE '══════════════════════════════════════════════════════════';

END $$;

-- ═══════════════════════════════════════════════════════
-- استعلامات للتحقق من النتائج
-- ═══════════════════════════════════════════════════════

-- عرض المستخدمين المنشأين
SELECT '👥 المستخدمون:' as section;
SELECT id, name, email, governorate, city
FROM users
WHERE email LIKE '%uat@test.com'
ORDER BY created_at DESC;

-- عرض المحافظ
SELECT '💰 المحافظ:' as section;
SELECT w.id, u.name, w.balance, w.currency
FROM wallets w
JOIN users u ON w.user_id = u.id
WHERE u.email LIKE '%uat@test.com';

-- عرض الطلبات
SELECT '📦 الطلبات:' as section;
SELECT id, status, payment_status, total_amount, tracking_number
FROM orders
WHERE id LIKE 'uat-order-%'
ORDER BY created_at DESC
LIMIT 5;

-- عرض المعاملات
SELECT '💳 المعاملات:' as section;
SELECT id, type, status, amount, platform_fee
FROM transactions
WHERE id LIKE 'uat-trans-%'
ORDER BY created_at DESC
LIMIT 5;

-- عرض التقييمات
SELECT '⭐ التقييمات:' as section;
SELECT r.id, r.rating, r.comment, u.name as reviewer
FROM reviews r
JOIN users u ON r.reviewer_id = u.id
WHERE r.id LIKE 'uat-review-%';
