-- ============================================
-- XChange Egypt - Comprehensive Marketplace Seed Data
-- Run this in Supabase SQL Editor
-- ============================================

-- First, let's get the user IDs and category IDs we need
DO $$
DECLARE
    ahmed_id TEXT;
    fatma_id TEXT;
    khaled_id TEXT;
    mona_id TEXT;
    omar_id TEXT;
    tech_store_id TEXT;
    furniture_hub_id TEXT;
    auto_parts_id TEXT;
    green_cycle_id TEXT;

    electronics_id TEXT;
    mobile_phones_id TEXT;
    computers_id TEXT;
    cameras_id TEXT;
    furniture_id TEXT;
    bedroom_id TEXT;
    living_room_id TEXT;
    vehicles_id TEXT;
    cars_id TEXT;
    home_appliances_id TEXT;
    fashion_id TEXT;
BEGIN
    -- Get user IDs
    SELECT id::TEXT INTO ahmed_id FROM users WHERE email = 'ahmed.mohamed@example.com';
    SELECT id::TEXT INTO fatma_id FROM users WHERE email = 'fatma.ali@example.com';
    SELECT id::TEXT INTO khaled_id FROM users WHERE email = 'khaled.hassan@example.com';
    SELECT id::TEXT INTO mona_id FROM users WHERE email = 'mona.ibrahim@example.com';
    SELECT id::TEXT INTO omar_id FROM users WHERE email = 'omar.saeed@example.com';
    SELECT id::TEXT INTO tech_store_id FROM users WHERE email = 'contact@techstore.eg';
    SELECT id::TEXT INTO furniture_hub_id FROM users WHERE email = 'info@furniturehub.eg';
    SELECT id::TEXT INTO auto_parts_id FROM users WHERE email = 'sales@autoparts.eg';
    SELECT id::TEXT INTO green_cycle_id FROM users WHERE email = 'support@greencycle.eg';

    -- Get category IDs
    SELECT id::TEXT INTO electronics_id FROM categories WHERE slug = 'electronics';
    SELECT id::TEXT INTO mobile_phones_id FROM categories WHERE slug = 'mobile-phones';
    SELECT id::TEXT INTO computers_id FROM categories WHERE slug = 'computers';
    SELECT id::TEXT INTO cameras_id FROM categories WHERE slug = 'cameras';
    SELECT id::TEXT INTO furniture_id FROM categories WHERE slug = 'furniture';
    SELECT id::TEXT INTO bedroom_id FROM categories WHERE slug = 'bedroom';
    SELECT id::TEXT INTO living_room_id FROM categories WHERE slug = 'living-room';
    SELECT id::TEXT INTO vehicles_id FROM categories WHERE slug = 'vehicles';
    SELECT id::TEXT INTO cars_id FROM categories WHERE slug = 'cars';
    SELECT id::TEXT INTO home_appliances_id FROM categories WHERE slug = 'home-appliances';
    SELECT id::TEXT INTO fashion_id FROM categories WHERE slug = 'fashion';

    -- Use electronics as fallback
    IF mobile_phones_id IS NULL THEN mobile_phones_id := electronics_id; END IF;
    IF computers_id IS NULL THEN computers_id := electronics_id; END IF;
    IF cameras_id IS NULL THEN cameras_id := electronics_id; END IF;
    IF bedroom_id IS NULL THEN bedroom_id := furniture_id; END IF;
    IF living_room_id IS NULL THEN living_room_id := furniture_id; END IF;
    IF cars_id IS NULL THEN cars_id := vehicles_id; END IF;
    IF home_appliances_id IS NULL THEN home_appliances_id := electronics_id; END IF;
    IF fashion_id IS NULL THEN fashion_id := electronics_id; END IF;

    -- Check if we have the required data
    IF ahmed_id IS NULL THEN
        RAISE EXCEPTION 'User ahmed.mohamed@example.com not found. Please seed users first.';
    END IF;

    IF electronics_id IS NULL THEN
        RAISE EXCEPTION 'Category electronics not found. Please seed categories first.';
    END IF;

    RAISE NOTICE 'Starting marketplace data seeding...';
    RAISE NOTICE 'Ahmed ID: %', ahmed_id;
    RAISE NOTICE 'Electronics ID: %', electronics_id;

    -- ============================================
    -- 1. DIRECT SALE ITEMS (اصناف البيع المباشر)
    -- ============================================
    RAISE NOTICE '💰 Creating Direct Sale Items...';

    -- iPhone 15 Pro Max
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        tech_store_id,
        mobile_phones_id,
        'iPhone 15 Pro Max 256GB - جديد بالكرتونة',
        'آيفون 15 برو ماكس الجديد كلياً، سعة 256 جيجابايت، لون تيتانيوم أزرق. ضمان أبل الرسمي لمدة عام كامل. الجهاز مغلف ولم يفتح. شحن مجاني لجميع المحافظات.',
        'NEW',
        75000,
        ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80'],
        'Cairo',
        'Downtown',
        'DIRECT_SALE',
        true,
        'GOLD',
        'ACTIVE',
        NOW(),
        NOW()
    );

    -- Samsung Galaxy S24 Ultra
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        tech_store_id,
        mobile_phones_id,
        'Samsung Galaxy S24 Ultra 512GB',
        'سامسونج جالاكسي S24 ألترا، أحدث إصدار، سعة 512 جيجابايت، لون بنفسجي تيتانيوم. يأتي مع قلم S Pen وشاحن سريع 45 واط. ضمان سنتين.',
        'NEW',
        65000,
        ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80', 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&q=80'],
        'Cairo',
        'Downtown',
        'DIRECT_SALE',
        true,
        'PREMIUM',
        'ACTIVE',
        NOW(),
        NOW()
    );

    -- MacBook Pro M3
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        ahmed_id,
        computers_id,
        'MacBook Pro 14" M3 Pro - حالة ممتازة',
        'ماك بوك برو 14 إنش بمعالج M3 Pro، ذاكرة 18 جيجابايت، تخزين 512 جيجابايت SSD. استخدام شخصي خفيف لمدة 3 أشهر فقط. البطارية 98%. يأتي مع الكرتونة الأصلية والشاحن.',
        'LIKE_NEW',
        85000,
        ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80'],
        'Cairo',
        'Nasr City',
        'DIRECT_SALE',
        true,
        'GOLD',
        'ACTIVE',
        NOW(),
        NOW()
    );

    -- PlayStation 5
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        tech_store_id,
        electronics_id,
        'PlayStation 5 + 2 Controllers + 3 Games',
        'بلايستيشن 5 النسخة الرقمية مع 2 دراعات DualSense و3 ألعاب (FIFA 24, Spider-Man 2, God of War). حالة ممتازة، ضمان المحل 6 أشهر.',
        'LIKE_NEW',
        28000,
        ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80', 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80'],
        'Cairo',
        'Downtown',
        'DIRECT_SALE',
        'ACTIVE',
        NOW(),
        NOW()
    );

    -- Canon Camera
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        fatma_id,
        cameras_id,
        'Canon EOS R6 Mark II + عدسة 24-105mm',
        'كاميرا كانون EOS R6 Mark II الاحترافية مع عدسة RF 24-105mm f/4L. مثالية للتصوير الفوتوغرافي والفيديو 4K. استخدام خفيف، عدد الشتر أقل من 5000.',
        'LIKE_NEW',
        95000,
        ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80'],
        'Alexandria',
        'Smouha',
        'DIRECT_SALE',
        true,
        'PREMIUM',
        'ACTIVE',
        NOW(),
        NOW()
    );

    -- AirPods Pro
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        tech_store_id,
        electronics_id,
        'Apple AirPods Pro 2 - جديد بالضمان',
        'سماعات أبل إيربودز برو الجيل الثاني مع علبة شحن MagSafe. خاصية إلغاء الضوضاء النشطة وصوت مكاني. ضمان أبل الرسمي سنة كاملة.',
        'NEW',
        9500,
        ARRAY['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80', 'https://images.unsplash.com/photo-1588423771073-b8903fba77ac?w=800&q=80'],
        'Cairo',
        'Downtown',
        'DIRECT_SALE',
        'ACTIVE',
        NOW(),
        NOW()
    );

    -- LG OLED TV
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        tech_store_id,
        electronics_id,
        'LG OLED 65" C3 Smart TV 4K',
        'شاشة LG OLED مقاس 65 بوصة، موديل C3 الأحدث. دقة 4K مع تقنية Dolby Vision و Dolby Atmos. مثالية للأفلام والألعاب مع معدل تحديث 120Hz.',
        'NEW',
        55000,
        ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80', 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80'],
        'Cairo',
        'Downtown',
        'DIRECT_SALE',
        true,
        'GOLD',
        'ACTIVE',
        NOW(),
        NOW()
    );

    -- Leather Sofa Set
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        furniture_hub_id,
        living_room_id,
        'طقم كنب مودرن 7 مقاعد - جلد إيطالي',
        'طقم كنب فاخر من الجلد الإيطالي الأصلي، 7 مقاعد (3+2+1+1). تصميم عصري أنيق، لون رمادي داكن. التوصيل والتركيب مجاناً داخل القاهرة الكبرى.',
        'NEW',
        85000,
        ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80'],
        'Giza',
        '6th October City',
        'DIRECT_SALE',
        true,
        'PREMIUM',
        'ACTIVE',
        NOW(),
        NOW()
    );

    -- Bedroom Set
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        furniture_hub_id,
        bedroom_id,
        'غرفة نوم كاملة خشب زان طبيعي',
        'غرفة نوم كاملة من خشب الزان الطبيعي: سرير كينج سايز + دولاب 6 أبواب + 2 كومودينو + تسريحة بمرآة. صناعة مصرية فاخرة بضمان 5 سنوات.',
        'NEW',
        65000,
        ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', 'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=800&q=80'],
        'Giza',
        '6th October City',
        'DIRECT_SALE',
        true,
        'GOLD',
        'ACTIVE',
        NOW(),
        NOW()
    );

    -- Dining Table
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        furniture_hub_id,
        furniture_id,
        'سفرة 8 كراسي خشب أوك أمريكي',
        'طاولة سفرة فاخرة من خشب الأوك الأمريكي مع 8 كراسي مبطنة. التصميم كلاسيكي عصري، مقاس الطاولة 220×100 سم. مناسبة للفيلات والشقق الكبيرة.',
        'NEW',
        45000,
        ARRAY['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80'],
        'Giza',
        '6th October City',
        'DIRECT_SALE',
        'ACTIVE',
        NOW(),
        NOW()
    );

    -- Samsung Refrigerator
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        mona_id,
        home_appliances_id,
        'ثلاجة سامسونج 28 قدم - French Door',
        'ثلاجة سامسونج الذكية بنظام French Door، سعة 28 قدم مكعب. شاشة تحكم ذكية، موزع ماء وثلج، نظام Twin Cooling+. استخدام سنة واحدة، حالة ممتازة.',
        'LIKE_NEW',
        45000,
        ARRAY['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80', 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80'],
        'Cairo',
        'Heliopolis',
        'DIRECT_SALE',
        'ACTIVE',
        NOW(),
        NOW()
    );

    -- LG Washer
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        mona_id,
        home_appliances_id,
        'غسالة LG 12 كيلو - AI Direct Drive',
        'غسالة LG بتقنية الذكاء الاصطناعي، سعة 12 كيلو، موتور Direct Drive بضمان 10 سنوات. خاصية البخار للتعقيم، استهلاك طاقة منخفض.',
        'LIKE_NEW',
        22000,
        ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80', 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&q=80'],
        'Cairo',
        'Heliopolis',
        'DIRECT_SALE',
        'ACTIVE',
        NOW(),
        NOW()
    );

    -- Toyota Camry
    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        khaled_id,
        cars_id,
        'Toyota Camry 2023 - فبريكة بالكامل',
        'تويوتا كامري 2023، موديل GLE هايبرد، لون أبيض لؤلؤي. عداد 15,000 كم فقط، فبريكة بالكامل، صيانة الوكالة. سيارة أول مالك، رخصة سارية.',
        'LIKE_NEW',
        1450000,
        ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80'],
        'Giza',
        'Dokki',
        'DIRECT_SALE',
        true,
        'GOLD',
        'ACTIVE',
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ Direct Sale Items created';

    -- ============================================
    -- 2. WANTED/DIRECT BUY ITEMS (اصناف الشراء المباشر)
    -- ============================================
    RAISE NOTICE '🔍 Creating Wanted Items...';

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        ahmed_id,
        cars_id,
        'مطلوب: BMW X5 2020 أو أحدث',
        'أبحث عن BMW X5 موديل 2020 أو أحدث، لون أبيض أو أسود. الميزانية تصل إلى 2.5 مليون جنيه. يفضل أن تكون فبريكة من الوكيل مع سجل صيانة كامل.',
        'LIKE_NEW',
        2500000,
        ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80'],
        'Cairo',
        'New Cairo',
        'DIRECT_BUY',
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        fatma_id,
        mobile_phones_id,
        'مطلوب: iPhone 15 Pro Max بسعر معقول',
        'أبحث عن iPhone 15 Pro Max سعة 256GB أو أكثر. أقبل الجديد أو المستعمل بحالة ممتازة. الميزانية: 55,000 - 65,000 جنيه.',
        'LIKE_NEW',
        60000,
        ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80'],
        'Alexandria',
        'Smouha',
        'DIRECT_BUY',
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        mona_id,
        furniture_id,
        'مطلوب: غرفة نوم أطفال كاملة',
        'أبحث عن غرفة نوم أطفال كاملة، تصميم عصري، ألوان فاتحة. تشمل سريرين أو سرير بدورين، دولاب، ومكتب. الميزانية: 25,000 - 40,000 جنيه.',
        'GOOD',
        35000,
        ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', 'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=800&q=80'],
        'Cairo',
        'Heliopolis',
        'DIRECT_BUY',
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        khaled_id,
        computers_id,
        'مطلوب: MacBook Pro M2/M3 للبرمجة',
        'مبرمج يبحث عن MacBook Pro بمعالج M2 Pro أو M3، ذاكرة 16GB على الأقل. أفضل الشاشة 14 إنش. الميزانية حتى 70,000 جنيه.',
        'LIKE_NEW',
        70000,
        ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80'],
        'Giza',
        'Dokki',
        'DIRECT_BUY',
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        omar_id,
        home_appliances_id,
        'مطلوب: تكييف 2.25 حصان انفرتر',
        'أبحث عن تكييف سبليت 2.25 حصان، يفضل انفرتر لتوفير الكهرباء. ماركات مقبولة: شارب، كاريير، LG، سامسونج. جديد أو مستعمل بحالة ممتازة.',
        'GOOD',
        25000,
        ARRAY['https://images.unsplash.com/photo-1631567091574-5ba9f55efb25?w=800&q=80', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80'],
        'Cairo',
        'Maadi',
        'DIRECT_BUY',
        'ACTIVE',
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ Wanted Items created';

    -- ============================================
    -- 3. BARTER ITEMS (اصناف المقايضات)
    -- ============================================
    RAISE NOTICE '🔄 Creating Barter Items...';

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, desired_item_title, desired_value_min, desired_value_max, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        ahmed_id,
        mobile_phones_id,
        'iPhone 13 Pro للمقايضة بـ Samsung S24',
        'آيفون 13 برو 256GB، حالة ممتازة، البطارية 90%. أبحث عن Samsung Galaxy S24 أو S24+ للمقايضة المباشرة. مستعد لدفع فرق إذا لزم الأمر.',
        'GOOD',
        35000,
        ARRAY['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&q=80', 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80'],
        'Cairo',
        'Nasr City',
        'BARTER',
        'Samsung Galaxy S24',
        30000,
        45000,
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, desired_item_title, desired_value_min, desired_value_max, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        fatma_id,
        furniture_id,
        'كنبة جلد إيطالي للمقايضة بغرفة سفرة',
        'كنبة 4 مقاعد جلد إيطالي أصلي، لون كحلي، حالة ممتازة جداً. قيمتها حوالي 25,000 جنيه. أبحث عن سفرة 6 كراسي خشب للمقايضة.',
        'LIKE_NEW',
        25000,
        ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80'],
        'Alexandria',
        'Smouha',
        'BARTER',
        'سفرة خشب 6 كراسي',
        20000,
        30000,
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, desired_item_title, desired_value_min, desired_value_max, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        omar_id,
        electronics_id,
        'PS5 + ألعاب للمقايضة بـ Nintendo Switch',
        'بلايستيشن 5 مع 5 ألعاب أصلية (FIFA 24, Spider-Man 2, Hogwarts Legacy, الخ). أبحث عن Nintendo Switch OLED مع ألعاب. أفضل المقايضة المباشرة.',
        'GOOD',
        22000,
        ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80', 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&q=80'],
        'Cairo',
        'Maadi',
        'BARTER',
        'Nintendo Switch OLED',
        15000,
        25000,
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, desired_item_title, desired_value_min, desired_value_max, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        khaled_id,
        cameras_id,
        'كاميرا Canon للمقايضة بدرون DJI',
        'كاميرا Canon EOS 90D مع عدسة 18-135mm، حالة ممتازة. أبحث عن درون DJI (Mini 3 Pro أو Air 2S) للمقايضة. مهتم بالتصوير الجوي.',
        'GOOD',
        30000,
        ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80'],
        'Giza',
        'Dokki',
        'BARTER',
        'DJI Drone',
        25000,
        40000,
        'ACTIVE',
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ Barter Items created';

    -- ============================================
    -- 4. SCRAP ITEMS (اصناف التوالف)
    -- ============================================
    RAISE NOTICE '♻️ Creating Scrap Items...';

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_scrap, scrap_type, scrap_condition, scrap_pricing_type, weight_kg, price_per_kg, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        COALESCE(green_cycle_id, ahmed_id),
        electronics_id,
        'خردة إلكترونيات - لوحات كمبيوتر',
        '50 كيلو لوحات إلكترونية من كمبيوترات قديمة. تحتوي على معادن ثمينة (ذهب، فضة، نحاس). مناسبة لشركات إعادة التدوير.',
        'POOR',
        15000,
        ARRAY['https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80', 'https://images.unsplash.com/photo-1591243315780-978fd00ff9db?w=800&q=80'],
        'Cairo',
        'New Cairo',
        'DIRECT_SALE',
        true,
        'ELECTRONICS',
        'NOT_WORKING',
        'PER_KG',
        50,
        300,
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_scrap, scrap_type, scrap_condition, is_repairable, working_parts_desc, defect_description, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        COALESCE(auto_parts_id, khaled_id),
        vehicles_id,
        'سيارة تالفة للبيع كقطع غيار',
        'سيارة هيونداي اكسنت 2015، تالفة من حادث أمامي. الموتور والجيربوكس سليمين. مناسبة للفك وبيع القطع أو كخردة حديد.',
        'POOR',
        45000,
        ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80', 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80'],
        'Alexandria',
        'El-Manshia',
        'DIRECT_SALE',
        true,
        'CAR_PARTS',
        'PARTIALLY_WORKING',
        false,
        'الموتور، الجيربوكس، الأبواب الخلفية، المقاعد',
        'الجزء الأمامي كامل تالف من الحادث',
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_scrap, scrap_type, scrap_condition, scrap_pricing_type, weight_kg, price_per_kg, metal_type, metal_purity, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        COALESCE(green_cycle_id, omar_id),
        electronics_id,
        'كابلات نحاس - 100 كيلو',
        '100 كيلو كابلات نحاسية من مشاريع كهرباء. النحاس نقي بنسبة 95%. السعر قابل للتفاوض للكميات الكبيرة.',
        'FAIR',
        35000,
        ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80'],
        'Cairo',
        'New Cairo',
        'DIRECT_SALE',
        true,
        'CABLES_WIRES',
        'NOT_WORKING',
        'PER_KG',
        100,
        350,
        'COPPER',
        95,
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_scrap, scrap_type, scrap_condition, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        COALESCE(green_cycle_id, mona_id),
        home_appliances_id,
        'أجهزة منزلية تالفة للتدوير',
        'مجموعة أجهزة منزلية تالفة: 2 غسالة + 3 ثلاجات + 5 ميكروويف. مناسبة للفك وإعادة التدوير. البيع جملة واحدة فقط.',
        'POOR',
        8000,
        ARRAY['https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80', 'https://images.unsplash.com/photo-1591243315780-978fd00ff9db?w=800&q=80'],
        'Cairo',
        'Heliopolis',
        'DIRECT_SALE',
        true,
        'HOME_APPLIANCES',
        'TOTALLY_DAMAGED',
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_scrap, scrap_type, scrap_condition, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        COALESCE(auto_parts_id, khaled_id),
        vehicles_id,
        'بطاريات سيارات مستعملة - 20 قطعة',
        '20 بطارية سيارة مستعملة، ماركات متنوعة. بعضها يعمل لفترة قصيرة، والباقي للتدوير. مناسبة لمحلات البطاريات أو مصانع التدوير.',
        'POOR',
        6000,
        ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80'],
        'Alexandria',
        'El-Manshia',
        'DIRECT_SALE',
        true,
        'BATTERIES',
        'PARTIALLY_WORKING',
        'ACTIVE',
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ Scrap Items created';

    -- ============================================
    -- 5. LUXURY ITEMS (اصناف الفاخرة)
    -- ============================================
    RAISE NOTICE '👑 Creating Luxury Items...';

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        fatma_id,
        fashion_id,
        'ساعة Rolex Submariner أصلية',
        'ساعة رولكس سبمارينر موديل 2022، ستانلس ستيل مع قرص أسود. أصلية 100% مع شهادة الأصالة والكرتونة والفاتورة الأصلية من الوكيل.',
        'LIKE_NEW',
        850000,
        ARRAY['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80', 'https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=800&q=80'],
        'Cairo',
        'Zamalek',
        'DIRECT_SALE',
        true,
        'GOLD',
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        mona_id,
        fashion_id,
        'حقيبة Louis Vuitton Neverfull MM',
        'حقيبة لويس فيتون Neverfull MM أصلية، كانفاس مونوجرام مع بطانة وردية. حالة ممتازة، استخدام خفيف جداً. معها الفاتورة والداست باج.',
        'LIKE_NEW',
        65000,
        ARRAY['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80'],
        'Cairo',
        'Heliopolis',
        'DIRECT_SALE',
        true,
        'PREMIUM',
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        tech_store_id,
        fashion_id,
        'ساعة Omega Seamaster Professional',
        'ساعة أوميغا سيماستر بروفيشنال 300M، موديل جيمس بوند. حركة أوتوماتيكية، مقاومة للماء 300 متر. أصلية مع الأوراق والضمان.',
        'LIKE_NEW',
        280000,
        ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80'],
        'Cairo',
        'Downtown',
        'DIRECT_SALE',
        true,
        'GOLD',
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        fatma_id,
        fashion_id,
        'طقم مجوهرات ذهب عيار 21',
        'طقم مجوهرات ذهب عيار 21 قيراط: سلسلة + أقراط + خاتم + إسورة. التصميم عصري أنيق، الوزن الإجمالي 45 جرام. صناعة مصرية فاخرة.',
        'NEW',
        180000,
        ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'],
        'Alexandria',
        'Smouha',
        'DIRECT_SALE',
        true,
        'PREMIUM',
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        khaled_id,
        cars_id,
        'Mercedes-Benz S-Class 2023',
        'مرسيدس S500 موديل 2023، لون أسود ميتاليك مع جلد بيج. فل الفل، كل الكماليات. عداد 8,000 كم فقط، حالة الزيرو. ضمان الوكيل ساري.',
        'LIKE_NEW',
        6500000,
        ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80', 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80'],
        'Giza',
        'Sheikh Zayed',
        'DIRECT_SALE',
        true,
        'GOLD',
        'ACTIVE',
        NOW(),
        NOW()
    );

    INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        omar_id,
        fashion_id,
        'حقيبة Hermès Birkin 30 - نادرة',
        'حقيبة هيرميس بيركن 30 سم، جلد Togo لون أسود مع إكسسوارات ذهبية. الحقيبة أصلية 100% مع شهادة الأصالة. نادرة ومحدودة.',
        'LIKE_NEW',
        1200000,
        ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'],
        'Cairo',
        'Garden City',
        'DIRECT_SALE',
        true,
        'GOLD',
        'ACTIVE',
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ Luxury Items created';

    -- ============================================
    -- 6. REVERSE AUCTIONS / TENDERS (المناقصات)
    -- ============================================
    RAISE NOTICE '📋 Creating Reverse Auctions...';

    INSERT INTO reverse_auctions (id, buyer_id, title, description, category_id, condition, quantity, max_budget, location, status, start_time, end_time, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        ahmed_id,
        'مناقصة: 10 لابتوبات للشركة',
        'نبحث عن 10 لابتوبات للموظفين. المواصفات المطلوبة: Core i5 أو أعلى، 16GB RAM، 512GB SSD، شاشة 15 بوصة. نقبل ماركات Dell, HP, Lenovo.',
        computers_id,
        'NEW',
        10,
        180000,
        'Cairo',
        'ACTIVE',
        NOW(),
        NOW() + INTERVAL '14 days',
        NOW(),
        NOW()
    );

    INSERT INTO reverse_auctions (id, buyer_id, title, description, category_id, condition, quantity, max_budget, location, status, start_time, end_time, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        furniture_hub_id,
        'مناقصة: أثاث مكتبي لـ 20 موظف',
        'نحتاج أثاث مكتبي كامل لـ 20 موظف: مكاتب + كراسي مريحة + أدراج. التسليم خلال أسبوعين. نرحب بعروض المصنعين والموردين.',
        furniture_id,
        'NEW',
        20,
        150000,
        'Giza',
        'ACTIVE',
        NOW(),
        NOW() + INTERVAL '14 days',
        NOW(),
        NOW()
    );

    INSERT INTO reverse_auctions (id, buyer_id, title, description, category_id, condition, quantity, max_budget, location, status, start_time, end_time, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        tech_store_id,
        'مناقصة: شاشات عرض للمحل',
        'نبحث عن 5 شاشات عرض تجارية مقاس 55 بوصة أو أكبر، دقة 4K، مناسبة للعمل المتواصل. نفضل ماركات LG أو Samsung التجارية.',
        electronics_id,
        'NEW',
        5,
        100000,
        'Cairo',
        'ACTIVE',
        NOW(),
        NOW() + INTERVAL '14 days',
        NOW(),
        NOW()
    );

    INSERT INTO reverse_auctions (id, buyer_id, title, description, category_id, condition, quantity, max_budget, location, status, start_time, end_time, created_at, updated_at)
    VALUES (
        gen_random_uuid()::TEXT,
        mona_id,
        'مناقصة: تجهيز مطبخ كامل',
        'أبحث عن عروض لتجهيز مطبخ كامل: ثلاجة + بوتاجاز + غسالة أطباق + ميكروويف + خلاط. أفضل الأجهزة الموفرة للطاقة.',
        home_appliances_id,
        'NEW',
        1,
        80000,
        'Cairo',
        'ACTIVE',
        NOW(),
        NOW() + INTERVAL '14 days',
        NOW(),
        NOW()
    );

    RAISE NOTICE '✅ Reverse Auctions created';

    -- ============================================
    -- Summary
    -- ============================================
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✨ MARKETPLACE DATA SEEDING COMPLETED! ✨';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   💰 Direct Sale Items: 13';
    RAISE NOTICE '   🔍 Wanted Items: 5';
    RAISE NOTICE '   🔄 Barter Items: 4';
    RAISE NOTICE '   ♻️ Scrap Items: 5';
    RAISE NOTICE '   👑 Luxury Items: 6';
    RAISE NOTICE '   📋 Reverse Auctions: 4';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Total Items: 33';
    RAISE NOTICE '';

END $$;
