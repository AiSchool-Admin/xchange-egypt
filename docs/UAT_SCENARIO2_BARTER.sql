-- =====================================================
-- XChange Egypt - UAT Scenario 2: Barter Journey
-- رحلة المقايضة - اختبار في Supabase SQL Editor
-- =====================================================
-- المستخدمون:
-- المستخدم أ: test2@xchange.eg (يريد مبادلة PlayStation)
-- المستخدم ب: test3@xchange.eg (يريد مبادلة iPhone)
-- =====================================================
-- Enums المستخدمة:
-- BarterOfferStatus: PENDING, COUNTER_OFFERED, ACCEPTED, REJECTED, EXPIRED, COMPLETED, CANCELLED
-- EscrowType: SALE, BARTER, BARTER_CHAIN, SERVICE
-- EscrowStatus: CREATED, FUNDED, PENDING_DELIVERY, DELIVERED, INSPECTION, RELEASED, DISPUTED, REFUNDED, CANCELLED, EXPIRED
-- ItemStatus: DRAFT, ACTIVE, SOLD, TRADED, ARCHIVED, DELETED
-- ListingType: DIRECT_SALE, AUCTION, REVERSE_AUCTION, BARTER
-- ListingStatus: ACTIVE, COMPLETED, CANCELLED, EXPIRED
-- TransactionType: DIRECT_SALE, AUCTION, REVERSE_AUCTION, BARTER
-- PaymentStatus: PENDING, COMPLETED, FAILED, REFUNDED
-- DeliveryStatus: PENDING, SHIPPED, DELIVERED, RETURNED
-- =====================================================

DO $$
DECLARE
    -- المستخدم أ (صاحب PlayStation)
    v_user_a_id TEXT;
    v_user_a_name TEXT;
    v_user_a_wallet_id TEXT;

    -- المستخدم ب (صاحب iPhone)
    v_user_b_id TEXT;
    v_user_b_name TEXT;
    v_user_b_wallet_id TEXT;

    -- الفئات
    v_electronics_category_id TEXT;
    v_gaming_category_id TEXT;
    v_category_id TEXT;

    -- منتجات المقايضة
    v_item_a_id TEXT; -- PlayStation من المستخدم أ
    v_item_b_id TEXT; -- iPhone من المستخدم ب
    v_listing_a_id TEXT;
    v_listing_b_id TEXT;

    -- عرض المقايضة
    v_barter_offer_id TEXT;
    v_preference_set_id TEXT;

    -- المعاملة و Escrow
    v_transaction_id TEXT;
    v_escrow_id TEXT;

    -- التقييمات
    v_review_a_id TEXT;
    v_review_b_id TEXT;

    -- القيم
    v_item_a_value DECIMAL := 25000; -- قيمة PlayStation
    v_item_b_value DECIMAL := 30000; -- قيمة iPhone
    v_value_difference DECIMAL := 5000; -- فرق القيمة

BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'السيناريو الثاني: رحلة المقايضة (Barter Journey)';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.1: جلب المستخدمين
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.1: التحقق من المستخدمين';

    -- المستخدم أ
    SELECT id, COALESCE(full_name, 'محمد الألعاب') INTO v_user_a_id, v_user_a_name
    FROM users WHERE email = 'test2@xchange.eg' LIMIT 1;

    IF v_user_a_id IS NULL THEN
        RAISE EXCEPTION 'المستخدم test2@xchange.eg غير موجود!';
    END IF;
    RAISE NOTICE 'المستخدم أ: % (يملك PlayStation)', v_user_a_name;

    -- المستخدم ب
    SELECT id, COALESCE(full_name, 'سارة التقنية') INTO v_user_b_id, v_user_b_name
    FROM users WHERE email = 'test3@xchange.eg' LIMIT 1;

    IF v_user_b_id IS NULL THEN
        RAISE EXCEPTION 'المستخدم test3@xchange.eg غير موجود!';
    END IF;
    RAISE NOTICE 'المستخدم ب: % (يملك iPhone)', v_user_b_name;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.2: التحقق من المحافظ
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.2: التحقق من المحافظ';

    -- محفظة المستخدم أ
    SELECT id INTO v_user_a_wallet_id FROM wallets WHERE user_id = v_user_a_id LIMIT 1;
    IF v_user_a_wallet_id IS NULL THEN
        v_user_a_wallet_id := 'uat2-wallet-a-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
        INSERT INTO wallets (id, user_id, balance, frozen_balance, lifetime_earned, lifetime_spent, created_at, updated_at)
        VALUES (v_user_a_wallet_id, v_user_a_id, 10000, 0, 0, 0, NOW(), NOW());
        RAISE NOTICE 'تم إنشاء محفظة للمستخدم أ برصيد 10,000 ج.م';
    END IF;

    -- محفظة المستخدم ب
    SELECT id INTO v_user_b_wallet_id FROM wallets WHERE user_id = v_user_b_id LIMIT 1;
    IF v_user_b_wallet_id IS NULL THEN
        v_user_b_wallet_id := 'uat2-wallet-b-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
        INSERT INTO wallets (id, user_id, balance, frozen_balance, lifetime_earned, lifetime_spent, created_at, updated_at)
        VALUES (v_user_b_wallet_id, v_user_b_id, 10000, 0, 0, 0, NOW(), NOW());
        RAISE NOTICE 'تم إنشاء محفظة للمستخدم ب برصيد 10,000 ج.م';
    END IF;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.3: الحصول على الفئات
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.3: جلب الفئات';

    SELECT id INTO v_category_id FROM categories LIMIT 1;
    IF v_category_id IS NULL THEN
        RAISE EXCEPTION 'لا توجد فئات!';
    END IF;
    RAISE NOTICE 'تم جلب الفئة';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.4: إنشاء المنتجات
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.4: إنشاء المنتجات للمقايضة';

    -- منتج المستخدم أ (PlayStation 5)
    v_item_a_id := 'uat2-item-ps5-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, location, images, status, created_at, updated_at)
    VALUES (
        v_item_a_id,
        v_user_a_id,
        'PlayStation 5 Digital Edition - UAT Barter',
        'بلايستيشن 5 النسخة الرقمية، استخدام 6 أشهر، مع يدين تحكم',
        v_category_id,
        'LIKE_NEW',
        v_item_a_value,
        'الإسكندرية - سموحة',
        ARRAY['https://example.com/ps5.jpg'],
        'ACTIVE',
        NOW(),
        NOW()
    );
    RAISE NOTICE 'تم إنشاء منتج PlayStation 5 بقيمة % ج.م', v_item_a_value;

    -- منتج المستخدم ب (iPhone 13)
    v_item_b_id := 'uat2-item-iphone-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, location, images, status, created_at, updated_at)
    VALUES (
        v_item_b_id,
        v_user_b_id,
        'iPhone 13 Pro 128GB - UAT Barter',
        'آيفون 13 برو 128 جيجا، لون أزرق، حالة ممتازة مع الكرتونة',
        v_category_id,
        'LIKE_NEW',
        v_item_b_value,
        'القاهرة - المعادي',
        ARRAY['https://example.com/iphone13.jpg'],
        'ACTIVE',
        NOW(),
        NOW()
    );
    RAISE NOTICE 'تم إنشاء منتج iPhone 13 بقيمة % ج.م', v_item_b_value;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.5: إنشاء قوائم البيع/المقايضة
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.5: إنشاء قوائم المقايضة';

    -- قائمة المستخدم أ (ListingType: BARTER)
    v_listing_a_id := 'uat2-listing-ps5-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO listings (id, item_id, user_id, listing_type, price, currency, status, views, created_at, updated_at)
    VALUES (v_listing_a_id, v_item_a_id, v_user_a_id, 'BARTER', v_item_a_value, 'EGP', 'ACTIVE', 0, NOW(), NOW());
    RAISE NOTICE 'تم إنشاء قائمة مقايضة لـ PlayStation';

    -- قائمة المستخدم ب (ListingType: BARTER)
    v_listing_b_id := 'uat2-listing-iphone-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO listings (id, item_id, user_id, listing_type, price, currency, status, views, created_at, updated_at)
    VALUES (v_listing_b_id, v_item_b_id, v_user_b_id, 'BARTER', v_item_b_value, 'EGP', 'ACTIVE', 0, NOW(), NOW());
    RAISE NOTICE 'تم إنشاء قائمة مقايضة لـ iPhone';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.6: إنشاء عرض المقايضة
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.6: المستخدم أ يرسل عرض مقايضة للمستخدم ب';

    v_barter_offer_id := 'uat2-barter-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

    -- BarterOfferStatus: PENDING, COUNTER_OFFERED, ACCEPTED, REJECTED, EXPIRED, COMPLETED, CANCELLED
    INSERT INTO barter_offers (
        id, initiator_id, recipient_id,
        offered_item_ids, offered_bundle_value,
        notes, expires_at, is_open_offer, status,
        created_at, updated_at
    ) VALUES (
        v_barter_offer_id,
        v_user_a_id,
        v_user_b_id,
        ARRAY[v_item_a_id],
        v_item_a_value,
        'أريد مبادلة PlayStation 5 بـ iPhone 13، مستعد لدفع فرق القيمة 5000 ج.م',
        NOW() + INTERVAL '7 days',
        false,
        'PENDING',
        NOW(),
        NOW()
    );
    RAISE NOTICE 'تم إنشاء عرض المقايضة: %', v_barter_offer_id;

    -- إنشاء preference set (ما يريده المستخدم أ مقابل عرضه)
    v_preference_set_id := 'uat2-prefset-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO barter_preference_sets (
        id, barter_offer_id, priority, total_value, value_difference, is_balanced, description, created_at, updated_at
    ) VALUES (
        v_preference_set_id,
        v_barter_offer_id,
        1,
        v_item_b_value,
        v_value_difference,
        false,
        'يريد iPhone 13 Pro',
        NOW(),
        NOW()
    );

    -- ربط المنتج المطلوب بـ preference set
    INSERT INTO barter_preference_items (id, preference_set_id, item_id, item_value, created_at)
    VALUES (
        'uat2-prefitem-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        v_preference_set_id,
        v_item_b_id,
        v_item_b_value,
        NOW()
    );

    -- إشعار المستخدم ب
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES (
        'uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        v_user_b_id,
        'BARTER',
        'عرض مقايضة جديد!',
        v_user_a_name || ' يريد مبادلة PlayStation 5 بـ iPhone 13 الخاص بك',
        jsonb_build_object('barterOfferId', v_barter_offer_id),
        false,
        NOW()
    );
    RAISE NOTICE 'تم إرسال إشعار للمستخدم ب';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.7: قبول العرض
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.7: المستخدم ب يقبل عرض المقايضة';

    UPDATE barter_offers
    SET status = 'ACCEPTED',
        matched_preference_set_id = v_preference_set_id,
        responded_at = NOW(),
        updated_at = NOW()
    WHERE id = v_barter_offer_id;
    RAISE NOTICE 'تم قبول عرض المقايضة';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.8: إنشاء المعاملة
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.8: إنشاء معاملة المقايضة';

    v_transaction_id := 'uat2-trans-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

    -- TransactionType: DIRECT_SALE, AUCTION, REVERSE_AUCTION, BARTER
    INSERT INTO transactions (
        id, listing_id, buyer_id, seller_id,
        transaction_type, amount, currency,
        payment_method, payment_status, delivery_status,
        created_at, updated_at
    ) VALUES (
        v_transaction_id,
        v_listing_a_id,
        v_user_b_id,  -- المستخدم ب يحصل على PlayStation
        v_user_a_id,  -- المستخدم أ يعطي PlayStation
        'BARTER',
        v_value_difference, -- فرق القيمة فقط
        'EGP',
        'WALLET',
        'PENDING',
        'PENDING',
        NOW(),
        NOW()
    );
    RAISE NOTICE 'تم إنشاء معاملة المقايضة';

    -- خصم فرق القيمة من المستخدم أ (لأن منتجه أقل قيمة)
    UPDATE wallets SET balance = balance - v_value_difference WHERE id = v_user_a_wallet_id;
    RAISE NOTICE 'تم خصم فرق القيمة % ج.م من المستخدم أ', v_value_difference;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.9: إنشاء Escrow للمقايضة
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.9: حجز فرق القيمة في Escrow';

    v_escrow_id := 'uat2-escrow-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);

    -- EscrowType: SALE, BARTER, BARTER_CHAIN, SERVICE
    INSERT INTO escrows (
        id, escrow_type, buyer_id, seller_id,
        amount, currency, transaction_id, item_id,
        status, funded_at, created_at, updated_at
    ) VALUES (
        v_escrow_id,
        'BARTER',
        v_user_a_id,  -- من يدفع الفرق
        v_user_b_id,  -- من يستلم الفرق
        v_value_difference,
        'EGP',
        v_transaction_id,
        v_item_a_id,
        'FUNDED',
        NOW(),
        NOW(),
        NOW()
    );
    RAISE NOTICE 'تم حجز فرق القيمة في Escrow';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.10: تبادل المنتجات
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.10: تبادل المنتجات';

    -- تحديث حالة الشحن
    UPDATE transactions SET delivery_status = 'SHIPPED' WHERE id = v_transaction_id;
    RAISE NOTICE 'تم شحن المنتجات';

    -- تأكيد الاستلام
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

    -- تحويل فرق القيمة للمستخدم ب
    UPDATE wallets SET balance = balance + v_value_difference WHERE id = v_user_b_wallet_id;
    RAISE NOTICE 'تم تحويل فرق القيمة % ج.م للمستخدم ب', v_value_difference;

    -- تحديث حالة المنتجات (TRADED)
    UPDATE items SET status = 'TRADED', updated_at = NOW() WHERE id = v_item_a_id;
    UPDATE items SET status = 'TRADED', updated_at = NOW() WHERE id = v_item_b_id;

    -- تحديث حالة القوائم (COMPLETED)
    UPDATE listings SET status = 'COMPLETED', updated_at = NOW() WHERE id = v_listing_a_id;
    UPDATE listings SET status = 'COMPLETED', updated_at = NOW() WHERE id = v_listing_b_id;

    -- تحديث حالة عرض المقايضة
    UPDATE barter_offers SET status = 'COMPLETED', updated_at = NOW() WHERE id = v_barter_offer_id;

    RAISE NOTICE 'تم إتمام تبادل المنتجات بنجاح';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.11: التقييمات المتبادلة
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.11: إضافة التقييمات';

    -- تقييم المستخدم أ للمستخدم ب
    v_review_a_id := 'uat2-review-a-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO reviews (id, transaction_id, reviewer_id, reviewed_id, review_type, overall_rating, comment, is_verified_purchase, created_at, updated_at)
    VALUES (v_review_a_id, v_transaction_id, v_user_a_id, v_user_b_id, 'SELLER_REVIEW', 5, 'مقايضة ممتازة! iPhone بحالة رائعة كما وصف', true, NOW(), NOW());
    RAISE NOTICE 'المستخدم أ قيّم المستخدم ب: 5 نجوم';

    -- تقييم المستخدم ب للمستخدم أ
    v_review_b_id := 'uat2-review-b-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO reviews (id, transaction_id, reviewer_id, reviewed_id, review_type, overall_rating, comment, is_verified_purchase, created_at, updated_at)
    VALUES (v_review_b_id, v_transaction_id, v_user_b_id, v_user_a_id, 'BUYER_REVIEW', 5, 'PlayStation ممتاز! شكراً على المقايضة العادلة', true, NOW(), NOW());
    RAISE NOTICE 'المستخدم ب قيّم المستخدم أ: 5 نجوم';

    -- إشعارات إتمام المقايضة
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES
    (
        'uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        v_user_a_id,
        'BARTER',
        'تمت المقايضة بنجاح!',
        'تهانينا! حصلت على iPhone 13 Pro مقابل PlayStation 5',
        jsonb_build_object('barterOfferId', v_barter_offer_id, 'transactionId', v_transaction_id),
        false,
        NOW()
    ),
    (
        'uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
        v_user_b_id,
        'BARTER',
        'تمت المقايضة بنجاح!',
        'تهانينا! حصلت على PlayStation 5 مقابل iPhone 13 Pro + 5000 ج.م',
        jsonb_build_object('barterOfferId', v_barter_offer_id, 'transactionId', v_transaction_id),
        false,
        NOW()
    );

    -- ═══════════════════════════════════════════════════════════════
    -- ملخص النتائج
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'ملخص نتائج السيناريو الثاني';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'المستخدم أ (%): أعطى PlayStation (% ج.م) + % ج.م فرق', v_user_a_name, v_item_a_value, v_value_difference;
    RAISE NOTICE 'المستخدم أ حصل على: iPhone 13 Pro (% ج.م)', v_item_b_value;
    RAISE NOTICE '---';
    RAISE NOTICE 'المستخدم ب (%): أعطى iPhone (% ج.م)', v_user_b_name, v_item_b_value;
    RAISE NOTICE 'المستخدم ب حصل على: PlayStation 5 (% ج.م) + % ج.م فرق', v_item_a_value, v_value_difference;
    RAISE NOTICE '---';
    RAISE NOTICE 'عرض المقايضة: % - الحالة: COMPLETED', v_barter_offer_id;
    RAISE NOTICE 'المعاملة: % - الحالة: COMPLETED', v_transaction_id;
    RAISE NOTICE 'التقييمات: 5/5 نجوم متبادلة';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'اكتمل السيناريو الثاني بنجاح!';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';

END $$;

-- ═══════════════════════════════════════════════════════════════════
-- استعلامات التحقق
-- ═══════════════════════════════════════════════════════════════════

SELECT 'عروض المقايضة:' as section;
SELECT id, status, offered_bundle_value, notes
FROM barter_offers WHERE id LIKE 'uat2-%';

SELECT 'المنتجات المتبادلة:' as section;
SELECT id, title, status, estimated_value
FROM items WHERE id LIKE 'uat2-%';

SELECT 'المعاملات:' as section;
SELECT id, transaction_type, payment_status, delivery_status, amount
FROM transactions WHERE id LIKE 'uat2-%';

SELECT 'Escrow:' as section;
SELECT id, escrow_type, amount, status
FROM escrows WHERE id LIKE 'uat2-%';

SELECT 'التقييمات:' as section;
SELECT id, review_type, overall_rating, comment
FROM reviews WHERE id LIKE 'uat2-%';
