-- =====================================================
-- 🧪 XChange Egypt - UAT Scenario 1: Direct Sale Journey
-- رحلة البيع المباشر - اختبار في Supabase SQL Editor
-- =====================================================
-- يستخدم المستخدمين الموجودين:
-- البائع: test1@xchange.eg (أحمد التاجر)
-- المشتري: test10@xchange.eg (هدى المشتريات)
-- =====================================================

DO $$
DECLARE
    -- معرفات المستخدمين الموجودين
    v_seller_id TEXT;
    v_buyer_id TEXT;
    v_seller_name TEXT;
    v_buyer_name TEXT;

    -- معرفات المحافظ
    v_seller_wallet_id TEXT;
    v_buyer_wallet_id TEXT;
    v_seller_balance DECIMAL;
    v_buyer_balance DECIMAL;

    -- معرفات المنتجات
    v_category_id TEXT;
    v_category_name TEXT;
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
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE '🧪 السيناريو الأول: رحلة البيع المباشر (Direct Sale Journey)';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.1: جلب البائع (أحمد التاجر - test1@xchange.eg)
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📌 الخطوة 1.1: التحقق من البائع (أحمد التاجر)';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    SELECT id, COALESCE(full_name, 'أحمد التاجر') INTO v_seller_id, v_seller_name
    FROM users WHERE email = 'test1@xchange.eg' LIMIT 1;

    IF v_seller_id IS NULL THEN
        RAISE EXCEPTION '❌ البائع test1@xchange.eg غير موجود! شغّل UAT_SEED_DATA.sql أولاً';
    END IF;

    RAISE NOTICE '✅ البائع: % (ID: %)', v_seller_name, v_seller_id;

    -- التحقق من محفظة البائع أو إنشاؤها
    SELECT id, balance INTO v_seller_wallet_id, v_seller_balance
    FROM wallets WHERE user_id = v_seller_id LIMIT 1;

    IF v_seller_wallet_id IS NULL THEN
        v_seller_wallet_id := 'wallet-seller-' || gen_random_uuid()::TEXT;
        INSERT INTO wallets (id, user_id, balance, currency, created_at, updated_at)
        VALUES (v_seller_wallet_id, v_seller_id, 0, 'EGP', NOW(), NOW());
        v_seller_balance := 0;
        RAISE NOTICE '✅ تم إنشاء محفظة للبائع برصيد 0';
    ELSE
        RAISE NOTICE '✅ محفظة البائع موجودة - الرصيد: % ج.م', v_seller_balance;
    END IF;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.1ب: جلب المشتري (هدى المشتريات - test10@xchange.eg)
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📌 الخطوة 1.1ب: التحقق من المشتري (هدى المشتريات)';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    SELECT id, COALESCE(full_name, 'هدى المشتريات') INTO v_buyer_id, v_buyer_name
    FROM users WHERE email = 'test10@xchange.eg' LIMIT 1;

    IF v_buyer_id IS NULL THEN
        RAISE EXCEPTION '❌ المشتري test10@xchange.eg غير موجود! شغّل UAT_SEED_DATA.sql أولاً';
    END IF;

    RAISE NOTICE '✅ المشتري: % (ID: %)', v_buyer_name, v_buyer_id;

    -- التحقق من محفظة المشتري أو إنشاؤها مع رصيد
    SELECT id, balance INTO v_buyer_wallet_id, v_buyer_balance
    FROM wallets WHERE user_id = v_buyer_id LIMIT 1;

    IF v_buyer_wallet_id IS NULL THEN
        v_buyer_wallet_id := 'wallet-buyer-' || gen_random_uuid()::TEXT;
        INSERT INTO wallets (id, user_id, balance, currency, created_at, updated_at)
        VALUES (v_buyer_wallet_id, v_buyer_id, 100000, 'EGP', NOW(), NOW());
        v_buyer_balance := 100000;
        RAISE NOTICE '✅ تم إنشاء محفظة للمشتري برصيد 100,000 ج.م';
    ELSE
        -- تأكد من وجود رصيد كافي
        IF v_buyer_balance < v_item_price THEN
            UPDATE wallets SET balance = 100000, updated_at = NOW() WHERE id = v_buyer_wallet_id;
            v_buyer_balance := 100000;
            RAISE NOTICE '✅ تم تعديل رصيد المشتري إلى 100,000 ج.م';
        ELSE
            RAISE NOTICE '✅ محفظة المشتري موجودة - الرصيد: % ج.م', v_buyer_balance;
        END IF;
    END IF;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.2: إنشاء المنتج (iPhone 14 Pro Max)
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📌 الخطوة 1.2: إنشاء المنتج (iPhone 14 Pro Max)';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    -- الحصول على فئة الإلكترونيات
    SELECT id, name INTO v_category_id, v_category_name FROM categories
    WHERE name ILIKE '%إلكترونيات%' OR name ILIKE '%electronics%' OR name ILIKE '%هواتف%' OR name ILIKE '%phones%'
    LIMIT 1;

    IF v_category_id IS NULL THEN
        SELECT id, name INTO v_category_id, v_category_name FROM categories LIMIT 1;
    END IF;

    RAISE NOTICE 'ℹ️  الفئة: % (ID: %)', v_category_name, v_category_id;

    -- إنشاء المنتج
    v_item_id := 'uat1-item-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

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
        'iPhone 14 Pro Max 256GB - Deep Purple',
        'آيفون 14 برو ماكس 256 جيجا، لون بنفسجي غامق (Deep Purple).
استخدام شهرين فقط، حالة ممتازة مثل الجديد.
البطارية 98% - بدون أي خدوش.
يشمل:
- العلبة الأصلية
- الشاحن والكابل
- فاتورة الشراء
- ضمان أبل حتى نوفمبر 2025

📍 المعاينة متاحة في مدينة نصر
📞 التواصل واتساب فقط',
        v_category_id,
        v_seller_id,
        v_item_price,
        'LIKE_NEW',
        'القاهرة',
        'مدينة نصر',
        'ACTIVE',
        false,
        ARRAY[
            'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800',
            'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800'
        ],
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ تم إنشاء المنتج بنجاح';
    RAISE NOTICE '   📱 المنتج: iPhone 14 Pro Max 256GB';
    RAISE NOTICE '   💰 السعر: % ج.م', v_item_price;
    RAISE NOTICE '   🏷️  الحالة: LIKE_NEW';
    RAISE NOTICE '   🆔 ID: %', v_item_id;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.3: إنشاء قائمة البيع (Listing)
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📌 الخطوة 1.3: إنشاء قائمة البيع (Listing)';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    v_listing_id := 'uat1-listing-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

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
        40000,
        0,
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ تم إنشاء قائمة البيع';
    RAISE NOTICE '   💵 السعر: % ج.م', v_item_price;
    RAISE NOTICE '   📉 أقل سعر للتفاوض: 40,000 ج.م';
    RAISE NOTICE '   🔄 المقايضة: غير متاحة';
    RAISE NOTICE '   🆔 ID: %', v_listing_id;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.4: محاكاة بحث المشتري ومشاهدة المنتج
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📌 الخطوة 1.4: المشتري يبحث ويشاهد المنتج';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    UPDATE listings SET views_count = views_count + 1 WHERE id = v_listing_id;

    RAISE NOTICE '✅ % شاهد المنتج', v_buyer_name;
    RAISE NOTICE '   🔍 بحث عن: iPhone 14';
    RAISE NOTICE '   👁️  المشاهدات: 1';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.5 + 1.6: إنشاء الطلب مع Escrow
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📌 الخطوة 1.5 + 1.6: المشتري يُنشئ الطلب';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    v_order_id := 'uat1-order-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

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
            'name', v_buyer_name,
            'governorate', 'القاهرة',
            'city', 'مصر الجديدة',
            'street', '30 شارع الميرغني',
            'building', '15',
            'floor', '3',
            'apartment', '5',
            'phone', '+201000000010',
            'notes', 'برجاء الاتصال قبل الوصول'
        ),
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ تم إنشاء الطلب';
    RAISE NOTICE '   🆔 Order ID: %', v_order_id;
    RAISE NOTICE '   📦 الحالة: PENDING';

    -- خصم المبلغ من محفظة المشتري
    UPDATE wallets
    SET balance = balance - v_item_price, updated_at = NOW()
    WHERE id = v_buyer_wallet_id;

    RAISE NOTICE '✅ تم خصم % ج.م من محفظة المشتري', v_item_price;
    RAISE NOTICE '   💰 الرصيد الجديد: % ج.م', (v_buyer_balance - v_item_price);

    -- إنشاء سجل Escrow
    v_escrow_id := 'uat1-escrow-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

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

    RAISE NOTICE '✅ تم حجز المبلغ في Escrow';
    RAISE NOTICE '   🔒 Escrow ID: %', v_escrow_id;
    RAISE NOTICE '   💵 المبلغ المحجوز: % ج.م', v_item_price;

    UPDATE orders SET payment_status = 'ESCROW', updated_at = NOW() WHERE id = v_order_id;

    -- إشعار للبائع
    INSERT INTO notifications (id, user_id, type, title, message, data, read, created_at)
    VALUES (
        'uat1-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        v_seller_id,
        'NEW_ORDER',
        '🎉 طلب جديد!',
        'لديك طلب شراء جديد لـ iPhone 14 Pro Max من ' || v_buyer_name,
        jsonb_build_object('orderId', v_order_id, 'amount', v_item_price),
        false, NOW()
    );

    RAISE NOTICE '✅ تم إرسال إشعار للبائع';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.7: تأكيد الطلب من البائع
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📌 الخطوة 1.7: البائع يؤكد الطلب';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    UPDATE orders
    SET status = 'CONFIRMED',
        estimated_delivery = NOW() + INTERVAL '3 days',
        updated_at = NOW()
    WHERE id = v_order_id;

    RAISE NOTICE '✅ % أكد الطلب', v_seller_name;
    RAISE NOTICE '   📦 الحالة: PENDING → CONFIRMED';
    RAISE NOTICE '   📅 التسليم المتوقع: خلال 3 أيام';

    -- إشعار للمشتري
    INSERT INTO notifications (id, user_id, type, title, message, data, read, created_at)
    VALUES (
        'uat1-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        v_buyer_id,
        'ORDER_CONFIRMED',
        '✅ تم تأكيد طلبك',
        'قام ' || v_seller_name || ' بتأكيد طلبك. سيتم الشحن خلال 24-48 ساعة.',
        jsonb_build_object('orderId', v_order_id),
        false, NOW()
    );

    RAISE NOTICE '✅ تم إرسال إشعار للمشتري';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.8: شحن الطلب
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📌 الخطوة 1.8: البائع يشحن الطلب';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    UPDATE orders
    SET status = 'SHIPPED',
        tracking_number = 'ARX-EG-' || UPPER(SUBSTRING(v_order_id, 12, 8)),
        shipping_company = 'Aramex',
        shipped_at = NOW(),
        updated_at = NOW()
    WHERE id = v_order_id;

    RAISE NOTICE '✅ تم شحن الطلب';
    RAISE NOTICE '   📦 الحالة: CONFIRMED → SHIPPED';
    RAISE NOTICE '   🚚 شركة الشحن: Aramex';
    RAISE NOTICE '   📋 رقم التتبع: ARX-EG-%', UPPER(SUBSTRING(v_order_id, 12, 8));

    -- إشعار المشتري بالشحن
    INSERT INTO notifications (id, user_id, type, title, message, data, read, created_at)
    VALUES (
        'uat1-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        v_buyer_id,
        'ORDER_SHIPPED',
        '🚚 طلبك في الطريق!',
        'تم شحن طلبك عبر Aramex. رقم التتبع: ARX-EG-' || UPPER(SUBSTRING(v_order_id, 12, 8)),
        jsonb_build_object('orderId', v_order_id, 'trackingNumber', 'ARX-EG-' || UPPER(SUBSTRING(v_order_id, 12, 8)), 'carrier', 'Aramex'),
        false, NOW()
    );

    RAISE NOTICE '✅ تم إرسال إشعار الشحن للمشتري';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 1.9: استلام الطلب والتقييم
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📌 الخطوة 1.9: المشتري يستلم ويُقيّم';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    -- تحديث حالة الطلب
    UPDATE orders
    SET status = 'DELIVERED',
        payment_status = 'COMPLETED',
        delivered_at = NOW(),
        updated_at = NOW()
    WHERE id = v_order_id;

    RAISE NOTICE '✅ % أكد الاستلام', v_buyer_name;
    RAISE NOTICE '   📦 الحالة: SHIPPED → DELIVERED';

    -- تحرير Escrow
    UPDATE escrow_transactions
    SET status = 'RELEASED',
        released_at = NOW(),
        updated_at = NOW()
    WHERE id = v_escrow_id;

    RAISE NOTICE '✅ تم تحرير المبلغ من Escrow';

    -- تحويل المبلغ للبائع
    UPDATE wallets
    SET balance = balance + v_seller_amount,
        updated_at = NOW()
    WHERE id = v_seller_wallet_id;

    RAISE NOTICE '✅ تم تحويل % ج.م إلى محفظة البائع', v_seller_amount;
    RAISE NOTICE '   💰 رسوم المنصة (5%%): % ج.م', v_platform_fee;

    -- تسجيل المعاملة
    v_transaction_id := 'uat1-trans-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

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

    -- تحديث حالة المنتج
    UPDATE items SET status = 'SOLD', updated_at = NOW() WHERE id = v_item_id;
    UPDATE listings SET status = 'SOLD', updated_at = NOW() WHERE id = v_listing_id;

    RAISE NOTICE '✅ تم تحديث حالة المنتج إلى SOLD';

    -- إضافة التقييم
    v_review_id := 'uat1-review-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

    INSERT INTO reviews (id, order_id, reviewer_id, reviewed_id, rating, comment, created_at)
    VALUES (
        v_review_id,
        v_order_id,
        v_buyer_id,
        v_seller_id,
        5,
        'تجربة شراء ممتازة! 🌟
المنتج وصل بحالة ممتازة ومطابق للوصف تماماً.
البائع متعاون جداً والتوصيل كان سريع.
أنصح بالتعامل معه بشدة!',
        NOW()
    );

    RAISE NOTICE '✅ تم إضافة التقييم';
    RAISE NOTICE '   ⭐ التقييم: 5/5 نجوم';

    -- منح نقاط XChange
    INSERT INTO exchange_points (id, user_id, points, type, description, reference_id, created_at)
    VALUES (
        'uat1-points-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        v_buyer_id,
        450,
        'PURCHASE_REWARD',
        'مكافأة شراء ناجح - iPhone 14 Pro Max',
        v_order_id,
        NOW()
    );

    RAISE NOTICE '✅ تم منح 450 نقطة XChange للمشتري';

    -- إشعار البائع بإتمام البيع
    INSERT INTO notifications (id, user_id, type, title, message, data, read, created_at)
    VALUES (
        'uat1-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        v_seller_id,
        'ORDER_COMPLETED',
        '💰 تم إتمام البيع!',
        'تهانينا! تم تحويل ' || v_seller_amount || ' ج.م إلى محفظتك. حصلت على تقييم 5 نجوم!',
        jsonb_build_object('orderId', v_order_id, 'amount', v_seller_amount, 'rating', 5),
        false, NOW()
    );

    -- ═══════════════════════════════════════════════════════════════
    -- ملخص النتائج
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '';
    RAISE NOTICE '╔══════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║            📊 ملخص نتائج السيناريو الأول                         ║';
    RAISE NOTICE '╠══════════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║                                                                  ║';
    RAISE NOTICE '║  👤 البائع: % (%)', v_seller_name, 'test1@xchange.eg';
    RAISE NOTICE '║     💰 الرصيد السابق: % ج.م', COALESCE(v_seller_balance, 0);
    RAISE NOTICE '║     💰 الرصيد الحالي: % ج.م (+%)', COALESCE(v_seller_balance, 0) + v_seller_amount, v_seller_amount;
    RAISE NOTICE '║                                                                  ║';
    RAISE NOTICE '║  👤 المشتري: % (%)', v_buyer_name, 'test10@xchange.eg';
    RAISE NOTICE '║     💰 الرصيد السابق: % ج.م', v_buyer_balance;
    RAISE NOTICE '║     💰 الرصيد الحالي: % ج.م (-% ج.م)', v_buyer_balance - v_item_price, v_item_price;
    RAISE NOTICE '║     🏆 نقاط XChange: +450 نقطة';
    RAISE NOTICE '║                                                                  ║';
    RAISE NOTICE '║  📱 المنتج: iPhone 14 Pro Max 256GB';
    RAISE NOTICE '║     🆔 Item ID: %', v_item_id;
    RAISE NOTICE '║     📋 Listing ID: %', v_listing_id;
    RAISE NOTICE '║     🏷️  الحالة: SOLD';
    RAISE NOTICE '║                                                                  ║';
    RAISE NOTICE '║  📦 الطلب:';
    RAISE NOTICE '║     🆔 Order ID: %', v_order_id;
    RAISE NOTICE '║     📋 الحالة: DELIVERED ✅';
    RAISE NOTICE '║     💵 المبلغ: % ج.م', v_item_price;
    RAISE NOTICE '║                                                                  ║';
    RAISE NOTICE '║  💰 المعاملة المالية:';
    RAISE NOTICE '║     🆔 Transaction ID: %', v_transaction_id;
    RAISE NOTICE '║     💵 إجمالي: % ج.م', v_item_price;
    RAISE NOTICE '║     🏦 رسوم المنصة (5%%): % ج.م', v_platform_fee;
    RAISE NOTICE '║     💸 صافي البائع: % ج.م', v_seller_amount;
    RAISE NOTICE '║                                                                  ║';
    RAISE NOTICE '║  ⭐ التقييم: 5/5 نجوم';
    RAISE NOTICE '║                                                                  ║';
    RAISE NOTICE '╚══════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE '✅ اكتمل السيناريو الأول بنجاح!';
    RAISE NOTICE '';

END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 🔍 استعلامات للتحقق من النتائج
-- ═══════════════════════════════════════════════════════════════════

-- 1. عرض المستخدمين المستخدمين في الاختبار
SELECT '👥 المستخدمون:' as section;
SELECT id, email, full_name, governorate, city
FROM users
WHERE email IN ('test1@xchange.eg', 'test10@xchange.eg');

-- 2. عرض أرصدة المحافظ
SELECT '💰 المحافظ:' as section;
SELECT w.id, u.email, u.full_name, w.balance, w.currency
FROM wallets w
JOIN users u ON w.user_id = u.id
WHERE u.email IN ('test1@xchange.eg', 'test10@xchange.eg');

-- 3. عرض الطلب الذي تم إنشاؤه
SELECT '📦 الطلبات الأخيرة:' as section;
SELECT
    o.id,
    o.status,
    o.payment_status,
    o.total_amount,
    o.tracking_number,
    o.created_at
FROM orders o
WHERE o.id LIKE 'uat1-%'
ORDER BY o.created_at DESC
LIMIT 3;

-- 4. عرض المعاملات
SELECT '💳 المعاملات:' as section;
SELECT id, type, status, amount, platform_fee, created_at
FROM transactions
WHERE id LIKE 'uat1-%'
ORDER BY created_at DESC
LIMIT 3;

-- 5. عرض التقييمات
SELECT '⭐ التقييمات:' as section;
SELECT
    r.id,
    r.rating,
    LEFT(r.comment, 50) || '...' as comment_preview,
    u.email as reviewer
FROM reviews r
JOIN users u ON r.reviewer_id = u.id
WHERE r.id LIKE 'uat1-%';

-- 6. عرض الإشعارات
SELECT '🔔 الإشعارات:' as section;
SELECT
    n.id,
    u.email,
    n.type,
    n.title,
    n.read,
    n.created_at
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.id LIKE 'uat1-%'
ORDER BY n.created_at DESC;
