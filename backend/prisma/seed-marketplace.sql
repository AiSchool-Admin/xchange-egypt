-- ============================================
-- XChange Egypt - Marketplace Seed Data
-- Uses existing users and categories from the database
-- ============================================

-- ============================================
-- 1. DIRECT SALE ITEMS (اصناف البيع المباشر)
-- ============================================

-- iPhone 15 Pro Max
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'f65fc633-c4fe-4348-9d75-96e99163aa74',
    'cat-electronics',
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
    gen_random_uuid(),
    'f65fc633-c4fe-4348-9d75-96e99163aa74',
    'cat-electronics',
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
    gen_random_uuid(),
    'f65fc633-c4fe-4348-9d75-96e99163aa74',
    'cat-electronics',
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
    gen_random_uuid(),
    'f65fc633-c4fe-4348-9d75-96e99163aa74',
    'cat-electronics',
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
    gen_random_uuid(),
    'e43722ef-30b0-4cba-8500-de07489d4e73',
    'cat-electronics',
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

-- LG OLED TV
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'f65fc633-c4fe-4348-9d75-96e99163aa74',
    'cat-electronics',
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
    gen_random_uuid(),
    'f65fc633-c4fe-4348-9d75-96e99163aa74',
    'cat-furniture',
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
    gen_random_uuid(),
    'f65fc633-c4fe-4348-9d75-96e99163aa74',
    'cat-furniture',
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

-- Samsung Refrigerator
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '0b67a54d-2cdd-4938-8085-5a4cdffa79b7',
    'cat-appliances',
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

-- Toyota Camry
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '15707fd5-9339-4b43-aa9f-6c7d18aa5775',
    'cat-vehicles',
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

-- ============================================
-- 2. WANTED/DIRECT BUY ITEMS (مطلوب للشراء)
-- ============================================

-- مطلوب BMW
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '0325cb63-c59c-417e-bccd-d2544e11ac0e',
    'cat-vehicles',
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

-- مطلوب iPhone
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'cae1c966-21f6-4183-9879-f49d8f4c0602',
    'cat-electronics',
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

-- مطلوب غرفة نوم
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '0b67a54d-2cdd-4938-8085-5a4cdffa79b7',
    'cat-furniture',
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

-- مطلوب MacBook
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'e93292b9-4755-425f-8502-23e140784c38',
    'cat-electronics',
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

-- ============================================
-- 3. BARTER ITEMS (للمقايضة)
-- ============================================

-- iPhone للمقايضة
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, desired_item_title, desired_value_min, desired_value_max, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'e43722ef-30b0-4cba-8500-de07489d4e73',
    'cat-electronics',
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

-- كنبة للمقايضة
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, desired_item_title, desired_value_min, desired_value_max, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'e43722ef-30b0-4cba-8500-de07489d4e73',
    'cat-furniture',
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

-- PS5 للمقايضة
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, desired_item_title, desired_value_min, desired_value_max, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'e43722ef-30b0-4cba-8500-de07489d4e73',
    'cat-electronics',
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

-- ============================================
-- 4. SCRAP ITEMS (سوق التوالف) - Basic fields only
-- ============================================

-- خردة إلكترونيات
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_scrap, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'fc397ec4-baad-442e-b870-bfa4f453405d',
    'cat-electronics',
    'خردة إلكترونيات - لوحات كمبيوتر',
    '50 كيلو لوحات إلكترونية من كمبيوترات قديمة. تحتوي على معادن ثمينة (ذهب، فضة، نحاس). مناسبة لشركات إعادة التدوير. السعر 300 جنيه للكيلو.',
    'POOR',
    15000,
    ARRAY['https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80', 'https://images.unsplash.com/photo-1591243315780-978fd00ff9db?w=800&q=80'],
    'Cairo',
    'New Cairo',
    'DIRECT_SALE',
    true,
    'ACTIVE',
    NOW(),
    NOW()
);

-- سيارة تالفة
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_scrap, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'fc397ec4-baad-442e-b870-bfa4f453405d',
    'cat-vehicles',
    'سيارة تالفة للبيع كقطع غيار',
    'سيارة هيونداي اكسنت 2015، تالفة من حادث أمامي. الموتور والجيربوكس سليمين. مناسبة للفك وبيع القطع أو كخردة حديد.',
    'POOR',
    45000,
    ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80', 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80'],
    'Alexandria',
    'El-Manshia',
    'DIRECT_SALE',
    true,
    'ACTIVE',
    NOW(),
    NOW()
);

-- كابلات نحاس
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_scrap, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'fc397ec4-baad-442e-b870-bfa4f453405d',
    'cat-electronics',
    'كابلات نحاس - 100 كيلو',
    '100 كيلو كابلات نحاسية من مشاريع كهرباء. النحاس نقي بنسبة 95%. السعر 350 جنيه للكيلو قابل للتفاوض للكميات الكبيرة.',
    'FAIR',
    35000,
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80'],
    'Cairo',
    'New Cairo',
    'DIRECT_SALE',
    true,
    'ACTIVE',
    NOW(),
    NOW()
);

-- أجهزة منزلية تالفة
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_scrap, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'fc397ec4-baad-442e-b870-bfa4f453405d',
    'cat-appliances',
    'أجهزة منزلية تالفة للتدوير',
    'مجموعة أجهزة منزلية تالفة: 2 غسالة + 3 ثلاجات + 5 ميكروويف. مناسبة للفك وإعادة التدوير. البيع جملة واحدة فقط.',
    'POOR',
    8000,
    ARRAY['https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80', 'https://images.unsplash.com/photo-1591243315780-978fd00ff9db?w=800&q=80'],
    'Cairo',
    'Heliopolis',
    'DIRECT_SALE',
    true,
    'ACTIVE',
    NOW(),
    NOW()
);

-- ============================================
-- 5. LUXURY ITEMS (السوق الفاخر)
-- ============================================

-- ساعة Rolex
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '84696012-b58d-49c0-a940-173078de15c3',
    '516cbe98-eb69-4d5c-a0e1-021c3a3aa608',
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

-- حقيبة Louis Vuitton
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '84696012-b58d-49c0-a940-173078de15c3',
    '516cbe98-eb69-4d5c-a0e1-021c3a3aa608',
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

-- ساعة Omega
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '84696012-b58d-49c0-a940-173078de15c3',
    '516cbe98-eb69-4d5c-a0e1-021c3a3aa608',
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

-- طقم مجوهرات
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '84696012-b58d-49c0-a940-173078de15c3',
    '516cbe98-eb69-4d5c-a0e1-021c3a3aa608',
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

-- Mercedes S-Class
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '15707fd5-9339-4b43-aa9f-6c7d18aa5775',
    'cat-vehicles',
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

-- حقيبة Hermes
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '84696012-b58d-49c0-a940-173078de15c3',
    '516cbe98-eb69-4d5c-a0e1-021c3a3aa608',
    'حقيبة Hermes Birkin 30 - نادرة',
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

-- ============================================
-- 6. REVERSE AUCTIONS (المناقصات)
-- ============================================

INSERT INTO reverse_auctions (id, buyer_id, title, description, category_id, condition, quantity, max_budget, location, status, start_date, end_date, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '727d2d0e-0968-4aa9-afd6-ec0b52047ac2',
    'مناقصة: 10 لابتوبات للشركة',
    'نبحث عن 10 لابتوبات للموظفين. المواصفات المطلوبة: Core i5 أو أعلى، 16GB RAM، 512GB SSD، شاشة 15 بوصة. نقبل ماركات Dell, HP, Lenovo.',
    'cat-electronics',
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

INSERT INTO reverse_auctions (id, buyer_id, title, description, category_id, condition, quantity, max_budget, location, status, start_date, end_date, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '727d2d0e-0968-4aa9-afd6-ec0b52047ac2',
    'مناقصة: أثاث مكتبي لـ 20 موظف',
    'نحتاج أثاث مكتبي كامل لـ 20 موظف: مكاتب + كراسي مريحة + أدراج. التسليم خلال أسبوعين. نرحب بعروض المصنعين والموردين.',
    'cat-furniture',
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

INSERT INTO reverse_auctions (id, buyer_id, title, description, category_id, condition, quantity, max_budget, location, status, start_date, end_date, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '727d2d0e-0968-4aa9-afd6-ec0b52047ac2',
    'مناقصة: شاشات عرض للمحل',
    'نبحث عن 5 شاشات عرض تجارية مقاس 55 بوصة أو أكبر، دقة 4K، مناسبة للعمل المتواصل. نفضل ماركات LG أو Samsung التجارية.',
    'cat-electronics',
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

INSERT INTO reverse_auctions (id, buyer_id, title, description, category_id, condition, quantity, max_budget, location, status, start_date, end_date, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '0b67a54d-2cdd-4938-8085-5a4cdffa79b7',
    'مناقصة: تجهيز مطبخ كامل',
    'أبحث عن عروض لتجهيز مطبخ كامل: ثلاجة + بوتاجاز + غسالة أطباق + ميكروويف + خلاط. أفضل الأجهزة الموفرة للطاقة.',
    'cat-appliances',
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

-- ============================================
-- DONE!
-- ============================================
-- Summary:
--    Direct Sale Items: 10
--    Wanted Items: 4
--    Barter Items: 3
--    Scrap Items: 4
--    Luxury Items: 6
--    Reverse Auctions: 4
--    Total: 31 items
