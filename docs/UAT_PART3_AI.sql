-- =====================================================
-- UAT PART 3: AI FEATURES - ميزات الذكاء الاصطناعي
-- =====================================================
-- Tests: Price Predictions, Smart Matching, Search, AI Assistant
-- Run this AFTER UAT_FULL_DATA.sql, PART1, and PART2
-- =====================================================

DO $$
DECLARE
    u1 TEXT; u2 TEXT; u3 TEXT; u4 TEXT; u5 TEXT;
    u6 TEXT; u7 TEXT; u8 TEXT; u9 TEXT; u10 TEXT;
    cat_electronics TEXT; cat_mobile TEXT; cat_furniture TEXT; cat_vehicles TEXT;
    item_ref1 TEXT; item_ref2 TEXT; item_ref3 TEXT; item_ref4 TEXT; item_ref5 TEXT;
    item_ref6 TEXT; item_ref7 TEXT; item_ref8 TEXT; item_ref9 TEXT; item_ref10 TEXT;
    ai_conv1 TEXT; ai_conv2 TEXT; ai_conv3 TEXT; ai_conv4 TEXT; ai_conv5 TEXT;
    search_sugg1 TEXT; search_sugg2 TEXT;
BEGIN
    -- =========== GET USERS ===========
    SELECT id INTO u1 FROM users WHERE email = 'test1@xchange.eg';
    SELECT id INTO u2 FROM users WHERE email = 'test2@xchange.eg';
    SELECT id INTO u3 FROM users WHERE email = 'test3@xchange.eg';
    SELECT id INTO u4 FROM users WHERE email = 'test4@xchange.eg';
    SELECT id INTO u5 FROM users WHERE email = 'test5@xchange.eg';
    SELECT id INTO u6 FROM users WHERE email = 'test6@xchange.eg';
    SELECT id INTO u7 FROM users WHERE email = 'test7@xchange.eg';
    SELECT id INTO u8 FROM users WHERE email = 'test8@xchange.eg';
    SELECT id INTO u9 FROM users WHERE email = 'test9@xchange.eg';
    SELECT id INTO u10 FROM users WHERE email = 'test10@xchange.eg';

    -- =========== GET CATEGORIES ===========
    SELECT id INTO cat_electronics FROM categories WHERE is_active = true LIMIT 1;
    SELECT id INTO cat_mobile FROM categories WHERE slug ILIKE '%mobile%' OR name_en ILIKE '%mobile%' LIMIT 1;
    SELECT id INTO cat_furniture FROM categories WHERE slug ILIKE '%furniture%' OR name_en ILIKE '%furniture%' LIMIT 1;
    SELECT id INTO cat_vehicles FROM categories WHERE slug ILIKE '%vehicle%' OR name_en ILIKE '%vehicle%' LIMIT 1;
    IF cat_mobile IS NULL THEN cat_mobile := cat_electronics; END IF;
    IF cat_furniture IS NULL THEN cat_furniture := cat_electronics; END IF;
    IF cat_vehicles IS NULL THEN cat_vehicles := cat_electronics; END IF;

    -- =========== GET ITEMS ===========
    SELECT id INTO item_ref1 FROM items WHERE seller_id = u1 LIMIT 1;
    SELECT id INTO item_ref2 FROM items WHERE seller_id = u2 LIMIT 1;
    SELECT id INTO item_ref3 FROM items WHERE seller_id = u3 LIMIT 1;
    SELECT id INTO item_ref4 FROM items WHERE seller_id = u4 LIMIT 1;
    SELECT id INTO item_ref5 FROM items WHERE seller_id = u5 LIMIT 1;
    SELECT id INTO item_ref6 FROM items WHERE seller_id = u6 LIMIT 1;
    SELECT id INTO item_ref7 FROM items WHERE seller_id = u7 LIMIT 1;
    SELECT id INTO item_ref8 FROM items WHERE seller_id = u8 LIMIT 1;
    SELECT id INTO item_ref9 FROM items WHERE seller_id = u9 LIMIT 1;
    SELECT id INTO item_ref10 FROM items WHERE seller_id = u10 LIMIT 1;

    RAISE NOTICE '=========== AI FEATURES TEST DATA ===========';

    -- =========== 1. PRICE PREDICTIONS (توقعات الأسعار) ===========
    RAISE NOTICE 'Creating price predictions...';

    INSERT INTO price_predictions (id, item_id, category_id, condition, predicted_price, confidence_score, price_range_min, price_range_max, market_trend, demand_level, seasonal_factor, price_strategy, recommendations, sample_size, data_quality, model_version, created_at) VALUES
    -- Mobile phone predictions
    (gen_random_uuid()::TEXT, item_ref1, cat_mobile, 'NEW', 73500, 0.92, 70000, 78000, 'STABLE', 'HIGH', 1.0, 'COMPETITIVE', '{"brand": "Apple", "model": "iPhone 15 Pro", "demand": "high", "competition": "medium"}', 150, 'EXCELLENT', 'v2.1', NOW()),
    (gen_random_uuid()::TEXT, item_ref8, cat_mobile, 'LIKE_NEW', 43000, 0.88, 40000, 46000, 'DOWN', 'MEDIUM', 0.95, 'VALUE', '{"brand": "Apple", "model": "iPhone 14 Pro", "battery": "92%", "age": "1 year"}', 120, 'GOOD', 'v2.1', NOW()),
    (gen_random_uuid()::TEXT, item_ref2, cat_mobile, 'LIKE_NEW', 58000, 0.85, 54000, 62000, 'STABLE', 'HIGH', 1.0, 'COMPETITIVE', '{"brand": "Samsung", "model": "S24 Ultra", "condition": "excellent"}', 100, 'GOOD', 'v2.1', NOW()),

    -- Electronics predictions
    (gen_random_uuid()::TEXT, item_ref3, cat_electronics, 'NEW', 44000, 0.90, 42000, 47000, 'STABLE', 'MEDIUM', 1.0, 'PREMIUM', '{"brand": "Apple", "model": "iPad Pro 12.9", "includes": "Apple Pencil"}', 80, 'GOOD', 'v2.1', NOW()),
    (gen_random_uuid()::TEXT, item_ref1, cat_electronics, 'NEW', 93000, 0.94, 90000, 98000, 'UP', 'HIGH', 1.05, 'PREMIUM', '{"brand": "Apple", "model": "MacBook Pro M3", "specs": "high-end"}', 200, 'EXCELLENT', 'v2.1', NOW()),

    -- Furniture predictions
    (gen_random_uuid()::TEXT, item_ref7, cat_furniture, 'NEW', 33000, 0.82, 30000, 38000, 'STABLE', 'MEDIUM', 1.0, 'COMPETITIVE', '{"type": "office", "material": "wood", "brand": "local"}', 60, 'GOOD', 'v2.1', NOW()),
    (gen_random_uuid()::TEXT, item_ref2, cat_furniture, 'LIKE_NEW', 23000, 0.78, 20000, 27000, 'DOWN', 'LOW', 0.9, 'VALUE', '{"type": "sofa", "material": "leather", "age": "2 years"}', 45, 'LIMITED', 'v2.1', NOW()),

    -- Vehicle predictions
    (gen_random_uuid()::TEXT, item_ref9, cat_vehicles, 'LIKE_NEW', 920000, 0.86, 880000, 980000, 'DOWN', 'MEDIUM', 0.95, 'COMPETITIVE', '{"brand": "Toyota", "model": "Camry 2022", "km": "30000"}', 90, 'GOOD', 'v2.1', NOW()),
    (gen_random_uuid()::TEXT, item_ref9, cat_vehicles, 'NEW', 1150000, 0.91, 1100000, 1250000, 'UP', 'HIGH', 1.1, 'PREMIUM', '{"brand": "Hyundai", "model": "Tucson 2023", "condition": "zero"}', 110, 'EXCELLENT', 'v2.1', NOW()),

    -- Luxury predictions
    (gen_random_uuid()::TEXT, item_ref5, cat_electronics, 'NEW', 82000, 0.75, 75000, 95000, 'STABLE', 'LOW', 1.0, 'PREMIUM', '{"brand": "Louis Vuitton", "type": "bag", "edition": "limited"}', 30, 'LIMITED', 'v2.1', NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ 10 Price Predictions created';

    -- =========== 2. SEARCH HISTORY (سجل البحث) ===========
    RAISE NOTICE 'Creating search history...';

    INSERT INTO search_history (id, user_id, query, filters, results_count, category, location, created_at) VALUES
    -- Arabic searches
    (gen_random_uuid()::TEXT, u1, 'ايفون 15 برو', '{"condition": "NEW", "price_max": 80000}', 25, 'mobile-phones', 'Cairo', NOW() - INTERVAL '1 hour'),
    (gen_random_uuid()::TEXT, u2, 'سامسونج جلاكسي للمقايضة', '{"listing_type": "BARTER"}', 18, 'mobile-phones', 'Alexandria', NOW() - INTERVAL '2 hours'),
    (gen_random_uuid()::TEXT, u3, 'كاميرا سوني احترافية', '{"condition": "LIKE_NEW", "price_min": 50000}', 12, 'electronics', 'Giza', NOW() - INTERVAL '3 hours'),
    (gen_random_uuid()::TEXT, u4, 'خردة نحاس سعر الكيلو', '{"market_type": "scrap"}', 8, 'scrap', 'Cairo', NOW() - INTERVAL '4 hours'),
    (gen_random_uuid()::TEXT, u5, 'شنطة لويس فيتون اصلية', '{"condition": "NEW"}', 5, 'fashion', 'Cairo', NOW() - INTERVAL '5 hours'),
    (gen_random_uuid()::TEXT, u6, 'لابتوب ديل للشركات', '{"listing_type": "REVERSE_AUCTION", "quantity_min": 10}', 15, 'computers', 'Cairo', NOW() - INTERVAL '6 hours'),
    (gen_random_uuid()::TEXT, u7, 'اثاث مكتبي مستعمل', '{"condition": "GOOD", "price_max": 50000}', 32, 'furniture', 'Cairo', NOW() - INTERVAL '1 day'),
    (gen_random_uuid()::TEXT, u8, 'موبايل شاومي 14', '{"brand": "Xiaomi", "condition": "NEW"}', 22, 'mobile-phones', 'Alexandria', NOW() - INTERVAL '1 day'),
    (gen_random_uuid()::TEXT, u9, 'سيارة تويوتا كامري', '{"year_min": 2020, "km_max": 50000}', 45, 'vehicles', 'Giza', NOW() - INTERVAL '2 days'),
    (gen_random_uuid()::TEXT, u10, 'ثلاجة سامسونج انفرتر', '{"brand": "Samsung", "condition": "NEW"}', 28, 'appliances', 'Cairo', NOW() - INTERVAL '2 days'),
    -- English searches
    (gen_random_uuid()::TEXT, u1, 'iPhone 15 Pro Max', '{"condition": "NEW"}', 30, 'mobile-phones', 'Cairo', NOW() - INTERVAL '3 days'),
    (gen_random_uuid()::TEXT, u3, 'MacBook Pro M3', '{"price_max": 100000}', 15, 'computers', 'Giza', NOW() - INTERVAL '3 days'),
    (gen_random_uuid()::TEXT, u5, 'Rolex Submariner', '{"condition": "LIKE_NEW"}', 3, 'luxury', 'Cairo', NOW() - INTERVAL '4 days'),
    (gen_random_uuid()::TEXT, u7, 'Gaming PC RTX 4080', '{"condition": "NEW"}', 8, 'computers', 'Cairo', NOW() - INTERVAL '5 days'),
    (gen_random_uuid()::TEXT, u9, 'BMW X3 2022', '{"price_max": 2500000}', 12, 'vehicles', 'Giza', NOW() - INTERVAL '5 days')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ 15 Search History entries created';

    -- =========== 3. SAVED SEARCHES (البحث المحفوظ) ===========
    RAISE NOTICE 'Creating saved searches...';

    INSERT INTO saved_searches (id, user_id, name, query, filters, notify_on_new, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, u1, 'ايفون 15 برو اقل من 75000', 'ايفون 15 برو', '{"condition": "NEW", "price_max": 75000}', true, NOW(), NOW()),
    (gen_random_uuid()::TEXT, u2, 'سامسونج للمقايضة', 'سامسونج S24', '{"listing_type": "BARTER"}', true, NOW(), NOW()),
    (gen_random_uuid()::TEXT, u3, 'كاميرات احترافية', 'كاميرا سوني كانون', '{"price_min": 50000, "condition": "LIKE_NEW"}', true, NOW(), NOW()),
    (gen_random_uuid()::TEXT, u6, 'لابتوبات للشركة', 'لابتوب ديل HP', '{"listing_type": "REVERSE_AUCTION"}', true, NOW(), NOW()),
    (gen_random_uuid()::TEXT, u9, 'سيارات SUV حديثة', 'SUV 2022 2023', '{"year_min": 2022, "km_max": 30000}', true, NOW(), NOW()),
    (gen_random_uuid()::TEXT, u10, 'اجهزة منزلية', 'ثلاجة غسالة', '{"condition": "NEW", "price_max": 30000}', false, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ 6 Saved Searches created';

    -- =========== 4. AI CONVERSATIONS (محادثات المساعد الذكي) ===========
    RAISE NOTICE 'Creating AI conversations...';

    INSERT INTO ai_conversations (id, user_id, context, title, status, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, u1, 'listing', 'مساعدة في إنشاء إعلان آيفون', 'CLOSED', NOW() - INTERVAL '1 day', NOW()),
    (gen_random_uuid()::TEXT, u2, 'barter', 'استفسار عن المقايضة الذكية', 'CLOSED', NOW() - INTERVAL '2 days', NOW()),
    (gen_random_uuid()::TEXT, u3, 'listing', 'Help creating camera listing', 'ACTIVE', NOW(), NOW()),
    (gen_random_uuid()::TEXT, u5, 'help', 'كيفية البيع بالمزاد', 'CLOSED', NOW() - INTERVAL '3 days', NOW()),
    (gen_random_uuid()::TEXT, u6, 'listing', 'إنشاء مناقصة لابتوبات', 'ACTIVE', NOW(), NOW())
    RETURNING id INTO ai_conv1;

    SELECT id INTO ai_conv1 FROM ai_conversations WHERE user_id = u1 ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO ai_conv2 FROM ai_conversations WHERE user_id = u2 ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO ai_conv3 FROM ai_conversations WHERE user_id = u3 ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO ai_conv4 FROM ai_conversations WHERE user_id = u5 ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO ai_conv5 FROM ai_conversations WHERE user_id = u6 ORDER BY created_at DESC LIMIT 1;

    RAISE NOTICE '✅ 5 AI Conversations created';

    -- =========== 5. AI MESSAGES (رسائل المساعد الذكي) ===========
    RAISE NOTICE 'Creating AI messages...';

    IF ai_conv1 IS NOT NULL THEN
        INSERT INTO ai_messages (id, conversation_id, role, content, created_at) VALUES
        -- Conversation 1: iPhone listing help (Arabic)
        (gen_random_uuid()::TEXT, ai_conv1, 'USER', 'مرحبا، أريد بيع آيفون 15 برو ماكس جديد', NOW() - INTERVAL '1 day' - INTERVAL '5 minutes'),
        (gen_random_uuid()::TEXT, ai_conv1, 'ASSISTANT', 'مرحباً! سأساعدك في إنشاء إعلان احترافي لآيفون 15 برو ماكس.

أولاً، هل يمكنك إخباري بالتالي:
1. ما هي سعة التخزين؟ (256GB / 512GB / 1TB)
2. ما هو اللون؟
3. هل الجهاز بالكرتونة الأصلية؟
4. هل عليه ضمان؟', NOW() - INTERVAL '1 day' - INTERVAL '4 minutes'),
        (gen_random_uuid()::TEXT, ai_conv1, 'USER', '256 جيجا تيتانيوم اسود جديد بالكرتونة ضمان سنة من ابل', NOW() - INTERVAL '1 day' - INTERVAL '3 minutes'),
        (gen_random_uuid()::TEXT, ai_conv1, 'ASSISTANT', 'ممتاز! بناءً على تحليل السوق الحالي، إليك اقتراحي:

📱 **عنوان الإعلان المقترح:**
"آيفون 15 برو ماكس 256GB تيتانيوم أسود - جديد بالكرتونة ضمان سنة"

💰 **السعر المقترح:** 73,000 - 78,000 جنيه
(بناءً على أسعار السوق الحالية والطلب المرتفع)

📝 **الوصف المقترح:**
- iPhone 15 Pro Max 256GB
- لون: Titanium Black
- جديد بالكرتونة الأصلية
- ضمان سنة من Apple
- جميع الملحقات الأصلية

هل تريد استخدام هذه البيانات لإنشاء الإعلان؟', NOW() - INTERVAL '1 day' - INTERVAL '2 minutes'),
        (gen_random_uuid()::TEXT, ai_conv1, 'USER', 'نعم ممتاز، أنشئ الإعلان بسعر 75000', NOW() - INTERVAL '1 day' - INTERVAL '1 minute'),
        (gen_random_uuid()::TEXT, ai_conv1, 'ASSISTANT', 'تم إنشاء الإعلان بنجاح! ✅

📋 **تفاصيل الإعلان:**
- رقم الإعلان: #12345
- العنوان: آيفون 15 برو ماكس 256GB تيتانيوم أسود
- السعر: 75,000 جنيه
- الحالة: نشط

💡 **نصائح لبيع أسرع:**
1. أضف صور واضحة للجهاز من جميع الزوايا
2. صورة للكرتونة وفاتورة الضمان
3. الرد السريع على الاستفسارات

هل تحتاج مساعدة في شيء آخر؟', NOW() - INTERVAL '1 day')
        ON CONFLICT DO NOTHING;
    END IF;

    IF ai_conv2 IS NOT NULL THEN
        INSERT INTO ai_messages (id, conversation_id, role, content, created_at) VALUES
        -- Conversation 2: Smart barter help (Arabic)
        (gen_random_uuid()::TEXT, ai_conv2, 'USER', 'ما هي المقايضة الذكية؟', NOW() - INTERVAL '2 days' - INTERVAL '3 minutes'),
        (gen_random_uuid()::TEXT, ai_conv2, 'ASSISTANT', 'المقايضة الذكية هي ميزة فريدة في منصة Xchange تستخدم الذكاء الاصطناعي لإيجاد فرص مقايضة مثالية!

🔄 **كيف تعمل؟**

1. **المطابقة الثنائية:** إذا كان لديك آيفون وتريد سامسونج، وشخص آخر لديه سامسونج ويريد آيفون - نجد هذا التطابق تلقائياً!

2. **سلسلة المقايضة:** أحياناً لا يوجد تطابق مباشر، لكن النظام يجد سلسلة:
   - أنت لديك A وتريد B
   - شخص 2 لديه B ويريد C
   - شخص 3 لديه C ويريد A
   = الجميع يحصل على ما يريد! 🎉

3. **نسبة التطابق:** نحسب نسبة تطابق (مثل 92%) بناءً على:
   - تقارب القيم
   - حالة المنتجات
   - الموقع الجغرافي

هل تريد تفعيل المقايضة الذكية لمنتجاتك؟', NOW() - INTERVAL '2 days' - INTERVAL '2 minutes'),
        (gen_random_uuid()::TEXT, ai_conv2, 'USER', 'نعم كيف أفعلها؟', NOW() - INTERVAL '2 days' - INTERVAL '1 minute'),
        (gen_random_uuid()::TEXT, ai_conv2, 'ASSISTANT', 'لتفعيل المقايضة الذكية:

1. ✅ اذهب لإعدادات المنتج
2. ✅ فعّل خيار "قبول المقايضة"
3. ✅ حدد ما تريده مقابل منتجك
4. ✅ فعّل "المقايضة الذكية"

سيقوم النظام تلقائياً بـ:
- البحث عن تطابقات مباشرة
- اقتراح سلاسل مقايضة
- إرسال إشعارات عند وجود فرص

تم تفعيل المقايضة الذكية لحسابك! ستصلك إشعارات عند وجود فرص مناسبة.', NOW() - INTERVAL '2 days')
        ON CONFLICT DO NOTHING;
    END IF;

    IF ai_conv5 IS NOT NULL THEN
        INSERT INTO ai_messages (id, conversation_id, role, content, created_at) VALUES
        -- Conversation 5: Creating tender (Arabic)
        (gen_random_uuid()::TEXT, ai_conv5, 'USER', 'أريد شراء 50 لابتوب للشركة', NOW() - INTERVAL '10 minutes'),
        (gen_random_uuid()::TEXT, ai_conv5, 'ASSISTANT', 'مرحباً! سأساعدك في إنشاء مناقصة (Reverse Auction) لشراء 50 لابتوب.

📋 **المناقصة** تتيح للموردين التنافس لتقديم أفضل عرض لك.

أحتاج بعض المعلومات:
1. ما هي المواصفات المطلوبة؟
   - المعالج (i5/i7/i9)
   - الرام (8GB/16GB/32GB)
   - التخزين (256GB/512GB/1TB)
2. ما هي الميزانية القصوى؟
3. متى تحتاج التسليم؟
4. هل تفضل ماركة معينة؟', NOW() - INTERVAL '9 minutes'),
        (gen_random_uuid()::TEXT, ai_conv5, 'USER', 'لابتوب ديل او HP كور i7 رام 16 SSD 512 الميزانية 750 الف والتسليم خلال اسبوعين', NOW() - INTERVAL '8 minutes'),
        (gen_random_uuid()::TEXT, ai_conv5, 'ASSISTANT', 'ممتاز! إليك ملخص المناقصة:

📢 **مناقصة: 50 لابتوب للشركة**

**المواصفات:**
- الكمية: 50 جهاز
- الماركة: Dell أو HP
- المعالج: Intel Core i7
- الرام: 16GB
- التخزين: 512GB SSD
- الحالة: جديد

**الشروط:**
- الميزانية القصوى: 750,000 جنيه
- مدة التسليم: 14 يوم
- مدة المناقصة: 20 يوم

**السعر المتوقع للجهاز:** 14,000 - 16,000 جنيه

هل تريد إنشاء هذه المناقصة؟ سيتم إرسالها للموردين المعتمدين.', NOW() - INTERVAL '7 minutes')
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE '✅ AI Messages created for conversations';

    -- =========== 6. AI LISTING DRAFTS (مسودات الإعلانات الذكية) ===========
    RAISE NOTICE 'Creating AI listing drafts...';

    INSERT INTO ai_listing_drafts (id, user_id, source_type, source_text, generated_title, generated_desc, generated_category, generated_tags, estimated_price, confidence, detected_brand, detected_model, detected_condition, status, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, u1, 'TEXT', 'بيع آيفون 15 برو ماكس 256 جيجا تيتانيوم أسود جديد بالكرتونة ضمان سنة', 'آيفون 15 برو ماكس 256GB تيتانيوم أسود - جديد بالكرتونة', 'iPhone 15 Pro Max 256GB Titanium Black
جديد بالكرتونة الأصلية
ضمان سنة من Apple
جميع الملحقات الأصلية متوفرة
لون: أسود تيتانيوم
الشاشة: 6.7 انش Super Retina XDR
الكاميرا: 48MP Pro camera system
البطارية: جديدة 100%', 'mobile-phones', ARRAY['iPhone', 'Apple', '15 Pro Max', 'Titanium', '256GB'], 75000, 0.95, 'Apple', 'iPhone 15 Pro Max', 'NEW', 'PUBLISHED', NOW() - INTERVAL '1 day', NOW()),

    (gen_random_uuid()::TEXT, u3, 'IMAGE', 'https://storage.xchange.eg/ai-uploads/camera-sony-a7iv.jpg', 'Sony A7IV Professional Camera with 24-70mm Lens', 'Sony Alpha A7IV Full Frame Mirrorless Camera
Includes: Sony FE 24-70mm f/2.8 GM Lens
Condition: Like New
Shutter Count: ~5000
Original Box & Accessories
Perfect for professional photography and videography
4K 60fps Video Recording
33MP Full Frame Sensor', 'electronics', ARRAY['Sony', 'Camera', 'A7IV', 'Mirrorless', 'Professional'], 120000, 0.88, 'Sony', 'Alpha A7IV', 'LIKE_NEW', 'DRAFT', NOW(), NOW()),

    (gen_random_uuid()::TEXT, u6, 'VOICE', 'https://storage.xchange.eg/ai-uploads/voice-tender-laptops.mp3', 'مناقصة: 50 لابتوب Dell/HP للشركة', 'مطلوب 50 لابتوب للشركة
المواصفات المطلوبة:
- الماركة: Dell أو HP
- المعالج: Intel Core i7 الجيل 12 أو أحدث
- الرام: 16GB DDR4
- التخزين: 512GB NVMe SSD
- الشاشة: 15.6 انش Full HD
- الضمان: سنتين على الأقل

الميزانية: 750,000 جنيه
التسليم: خلال 14 يوم', 'computers', ARRAY['Laptop', 'Dell', 'HP', 'Corporate', 'Bulk'], 750000, 0.92, 'Dell/HP', 'Business Laptop i7', 'NEW', 'DRAFT', NOW(), NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ 3 AI Listing Drafts created';

    -- =========== 7. SMART MATCHING NOTIFICATIONS (إشعارات المطابقة الذكية) ===========
    RAISE NOTICE 'Creating smart matching notifications...';

    INSERT INTO notifications (id, user_id, type, priority, title, message, entity_type, entity_id, is_read, created_at) VALUES
    -- Barter match notifications
    (gen_random_uuid()::TEXT, u1, 'BARTER_MATCH', 'HIGH', 'تطابق ذكي 95%! 🎯', 'وجدنا تطابق مثالي! سارة تريد آيفون وتعرض سامسونج S24 Ultra - القيمة متقاربة جداً', 'ITEM', item_ref1, false, NOW()),
    (gen_random_uuid()::TEXT, u2, 'BARTER_MATCH', 'HIGH', 'سلسلة مقايضة ذكية! ⛓️', 'يمكنك الحصول على ما تريد من خلال سلسلة مقايضة 3 أطراف - نسبة النجاح 92%', 'ITEM', item_ref2, false, NOW()),
    (gen_random_uuid()::TEXT, u3, 'BARTER_MATCH', 'HIGH', 'فرصة مقايضة نادرة! 💎', 'شخص مهتم بالكاميرا ويعرض ساعة رولكس - هل تريد الموافقة؟', 'ITEM', item_ref3, false, NOW()),

    -- Purchase request match
    (gen_random_uuid()::TEXT, u8, 'PURCHASE_REQUEST_MATCH', 'HIGH', 'مشتري يبحث عن منتجك! 🔍', 'هدى تبحث عن آيفون 14 برو بالضبط مثل منتجك - تواصل الآن', 'ITEM', item_ref8, false, NOW()),
    (gen_random_uuid()::TEXT, u1, 'PURCHASE_REQUEST_MATCH', 'HIGH', 'طلب شراء مطابق! 💰', 'شركة تبحث عن 10 أجهزة MacBook - منتجك مطابق للمواصفات', 'ITEM', item_ref1, false, NOW()),

    -- Sale to demand match
    (gen_random_uuid()::TEXT, u6, 'SALE_TO_DEMAND', 'HIGH', 'عرض مناسب لمناقصتك! 📢', 'أحمد يعرض 50 لابتوب Dell بسعر 700,000 - أقل من ميزانيتك!', 'ITEM', item_ref6, false, NOW()),
    (gen_random_uuid()::TEXT, u7, 'SALE_TO_DEMAND', 'HIGH', 'منتج مطابق لطلبك! ✅', 'وجدنا أثاث مكتبي مطابق لمواصفاتك بسعر ممتاز', 'ITEM', item_ref7, false, NOW()),

    -- Demand to supply match
    (gen_random_uuid()::TEXT, u4, 'DEMAND_TO_SUPPLY', 'MEDIUM', 'فرصة بيع! 🏷️', 'شركة تبحث عن خردة نحاس بكميات كبيرة - تواصل معهم', 'ITEM', item_ref4, false, NOW()),

    -- AI recommendations
    (gen_random_uuid()::TEXT, u5, 'ITEM_PRICE_DROP', 'MEDIUM', 'توصية الذكاء الاصطناعي 🤖', 'بناءً على تحليل السوق، ننصح بخفض سعر الشنطة 5% لبيع أسرع', 'ITEM', item_ref5, false, NOW()),
    (gen_random_uuid()::TEXT, u9, 'ITEM_PRICE_DROP', 'MEDIUM', 'تحليل السوق 📊', 'أسعار السيارات المستعملة في انخفاض - الوقت مناسب للبيع', 'ITEM', item_ref9, false, NOW()),

    -- Arabic AI notifications
    (gen_random_uuid()::TEXT, u1, 'BARTER_MATCH', 'HIGH', 'المساعد الذكي وجد فرصة! 🤖', 'بناءً على تفضيلاتك السابقة، وجدنا عرض مقايضة مناسب - نسبة التوافق 88%', 'ITEM', item_ref1, false, NOW()),
    (gen_random_uuid()::TEXT, u2, 'BARTER_MATCH', 'HIGH', 'تطابق تلقائي! ⚡', 'النظام الذكي وجد 3 فرص مقايضة لمنتجاتك - اطلع عليها الآن', 'ITEM', item_ref2, false, NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ 12 Smart Matching Notifications created';

    -- =========== 8. ADDITIONAL BARTER CHAINS (سلاسل المقايضة الذكية) ===========
    RAISE NOTICE 'Creating additional smart barter chains...';

    -- These chains represent AI-discovered matches
    INSERT INTO barter_chains (id, chain_type, participant_count, match_score, algorithm_version, description, status, expires_at, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, 'CYCLE', 3, 0.95, '2.1', 'سلسلة ذكية: آيفون ← سامسونج ← شاومي ← آيفون (AI Match)', 'PROPOSED', NOW() + INTERVAL '7 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, 'CYCLE', 4, 0.88, '2.1', 'سلسلة رباعية: لابتوب ← كاميرا ← PS5 ← موبايل ← لابتوب', 'PENDING', NOW() + INTERVAL '5 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, 'PATH', 2, 0.98, '2.1', 'تطابق مباشر: MacBook ↔ iPhone + فرق نقدي', 'ACCEPTED', NOW() + INTERVAL '3 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, 'CYCLE', 5, 0.82, '2.1', 'سلسلة خماسية معقدة - اكتشاف AI', 'PROPOSED', NOW() + INTERVAL '10 days', NOW(), NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ 4 Smart Barter Chains created';

    -- =========== SUMMARY ===========
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '     ✅ UAT PART 3: AI FEATURES CREATED SUCCESSFULLY                      ';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '  🤖 AI Features Tested:';
    RAISE NOTICE '';
    RAISE NOTICE '  1. 📊 Price Predictions (توقعات الأسعار)';
    RAISE NOTICE '      - 10 predictions with confidence scores';
    RAISE NOTICE '      - Market trends (UP/DOWN/STABLE)';
    RAISE NOTICE '      - Pricing strategies (COMPETITIVE/PREMIUM/VALUE)';
    RAISE NOTICE '';
    RAISE NOTICE '  2. 🔍 Smart Search (البحث الذكي)';
    RAISE NOTICE '      - 15 search history entries (Arabic & English)';
    RAISE NOTICE '      - 6 saved searches with alerts';
    RAISE NOTICE '';
    RAISE NOTICE '  3. 💬 AI Assistant (المساعد الذكي)';
    RAISE NOTICE '      - 5 AI conversations';
    RAISE NOTICE '      - Arabic language support';
    RAISE NOTICE '      - Listing creation help';
    RAISE NOTICE '      - Smart barter explanation';
    RAISE NOTICE '      - Tender creation assistance';
    RAISE NOTICE '';
    RAISE NOTICE '  4. 🔄 Smart Matching (التوفيق الذكي)';
    RAISE NOTICE '      - 12 matching notifications';
    RAISE NOTICE '      - 4 AI-discovered barter chains';
    RAISE NOTICE '      - Purchase request matching';
    RAISE NOTICE '      - Demand-supply matching';
    RAISE NOTICE '';
    RAISE NOTICE '  5. 📝 AI Listing Drafts (مسودات الإعلانات)';
    RAISE NOTICE '      - 3 AI-generated listing suggestions';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════════════';

END $$;
