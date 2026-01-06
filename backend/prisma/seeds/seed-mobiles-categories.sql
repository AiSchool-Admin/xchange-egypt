-- Seed Mobile Categories (3-Level Hierarchy)
-- الموبايلات ← الماركة ← الموديل

-- First, check if Mobiles category already exists
DO $$
DECLARE
    mobiles_id UUID;
    apple_id UUID;
    samsung_id UUID;
    xiaomi_id UUID;
    oppo_id UUID;
    vivo_id UUID;
    huawei_id UUID;
    honor_id UUID;
    realme_id UUID;
    infinix_id UUID;
    tecno_id UUID;
    oneplus_id UUID;
    google_id UUID;
    nokia_id UUID;
    motorola_id UUID;
    other_brands_id UUID;
BEGIN
    -- Delete existing mobiles category and its children (if exists)
    DELETE FROM categories WHERE slug LIKE '%mobiles%' OR slug LIKE 'iphone-%' OR slug LIKE 'galaxy-%'
        OR slug LIKE 'xiaomi-%' OR slug LIKE 'redmi-%' OR slug LIKE 'poco-%'
        OR slug LIKE 'oppo-%' OR slug LIKE 'vivo-%' OR slug LIKE 'huawei-%'
        OR slug LIKE 'honor-%' OR slug LIKE 'realme-%' OR slug LIKE 'infinix-%'
        OR slug LIKE 'tecno-%' OR slug LIKE 'oneplus-%' OR slug LIKE 'pixel-%'
        OR slug LIKE 'nokia-%' OR slug LIKE 'motorola-%';

    -- Level 1: Main Mobiles Category
    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'الموبايلات', 'Mobiles', 'mobiles', 'هواتف ذكية جديدة ومستعملة', '📱', NULL, 0, true, NOW(), NOW())
    RETURNING id INTO mobiles_id;

    -- Level 2: Apple
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'آبل', 'Apple', 'apple-mobiles', mobiles_id, 0, true, NOW(), NOW())
    RETURNING id INTO apple_id;

    -- Level 3: Apple Models
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'آيفون 16 برو ماكس', 'iPhone 16 Pro Max', 'iphone-16-pro-max', apple_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 16 برو', 'iPhone 16 Pro', 'iphone-16-pro', apple_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 16 بلس', 'iPhone 16 Plus', 'iphone-16-plus', apple_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 16', 'iPhone 16', 'iphone-16', apple_id, 3, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 15 برو ماكس', 'iPhone 15 Pro Max', 'iphone-15-pro-max', apple_id, 4, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 15 برو', 'iPhone 15 Pro', 'iphone-15-pro', apple_id, 5, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 15 بلس', 'iPhone 15 Plus', 'iphone-15-plus', apple_id, 6, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 15', 'iPhone 15', 'iphone-15', apple_id, 7, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 14 برو ماكس', 'iPhone 14 Pro Max', 'iphone-14-pro-max', apple_id, 8, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 14 برو', 'iPhone 14 Pro', 'iphone-14-pro', apple_id, 9, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 14 بلس', 'iPhone 14 Plus', 'iphone-14-plus', apple_id, 10, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 14', 'iPhone 14', 'iphone-14', apple_id, 11, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 13 برو ماكس', 'iPhone 13 Pro Max', 'iphone-13-pro-max', apple_id, 12, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 13 برو', 'iPhone 13 Pro', 'iphone-13-pro', apple_id, 13, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 13', 'iPhone 13', 'iphone-13', apple_id, 14, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 12 برو ماكس', 'iPhone 12 Pro Max', 'iphone-12-pro-max', apple_id, 15, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 12 برو', 'iPhone 12 Pro', 'iphone-12-pro', apple_id, 16, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 12', 'iPhone 12', 'iphone-12', apple_id, 17, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 11 برو ماكس', 'iPhone 11 Pro Max', 'iphone-11-pro-max', apple_id, 18, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 11 برو', 'iPhone 11 Pro', 'iphone-11-pro', apple_id, 19, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون 11', 'iPhone 11', 'iphone-11', apple_id, 20, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون SE', 'iPhone SE', 'iphone-se', apple_id, 21, true, NOW(), NOW()),
    (gen_random_uuid(), 'آيفون آخر', 'Other iPhone', 'other-iphone', apple_id, 22, true, NOW(), NOW());

    -- Level 2: Samsung
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'سامسونج', 'Samsung', 'samsung-mobiles', mobiles_id, 1, true, NOW(), NOW())
    RETURNING id INTO samsung_id;

    -- Level 3: Samsung Models
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'جالاكسي S24 ألترا', 'Galaxy S24 Ultra', 'galaxy-s24-ultra', samsung_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'جالاكسي S24+', 'Galaxy S24+', 'galaxy-s24-plus', samsung_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'جالاكسي S24', 'Galaxy S24', 'galaxy-s24', samsung_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'جالاكسي S23 ألترا', 'Galaxy S23 Ultra', 'galaxy-s23-ultra', samsung_id, 3, true, NOW(), NOW()),
    (gen_random_uuid(), 'جالاكسي S23+', 'Galaxy S23+', 'galaxy-s23-plus', samsung_id, 4, true, NOW(), NOW()),
    (gen_random_uuid(), 'جالاكسي S23', 'Galaxy S23', 'galaxy-s23', samsung_id, 5, true, NOW(), NOW()),
    (gen_random_uuid(), 'جالاكسي Z فولد 5', 'Galaxy Z Fold 5', 'galaxy-z-fold-5', samsung_id, 6, true, NOW(), NOW()),
    (gen_random_uuid(), 'جالاكسي Z فليب 5', 'Galaxy Z Flip 5', 'galaxy-z-flip-5', samsung_id, 7, true, NOW(), NOW()),
    (gen_random_uuid(), 'جالاكسي A54', 'Galaxy A54', 'galaxy-a54', samsung_id, 8, true, NOW(), NOW()),
    (gen_random_uuid(), 'جالاكسي A34', 'Galaxy A34', 'galaxy-a34', samsung_id, 9, true, NOW(), NOW()),
    (gen_random_uuid(), 'جالاكسي A24', 'Galaxy A24', 'galaxy-a24', samsung_id, 10, true, NOW(), NOW()),
    (gen_random_uuid(), 'جالاكسي A14', 'Galaxy A14', 'galaxy-a14', samsung_id, 11, true, NOW(), NOW()),
    (gen_random_uuid(), 'سلسلة جالاكسي M', 'Galaxy M Series', 'galaxy-m-series', samsung_id, 12, true, NOW(), NOW()),
    (gen_random_uuid(), 'سامسونج آخر', 'Other Samsung', 'other-samsung', samsung_id, 13, true, NOW(), NOW());

    -- Level 2: Xiaomi
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'شاومي', 'Xiaomi', 'xiaomi-mobiles', mobiles_id, 2, true, NOW(), NOW())
    RETURNING id INTO xiaomi_id;

    -- Level 3: Xiaomi Models
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'شاومي 14 ألترا', 'Xiaomi 14 Ultra', 'xiaomi-14-ultra', xiaomi_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'شاومي 14 برو', 'Xiaomi 14 Pro', 'xiaomi-14-pro', xiaomi_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'شاومي 14', 'Xiaomi 14', 'xiaomi-14', xiaomi_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'ريدمي نوت 13 برو+', 'Redmi Note 13 Pro+', 'redmi-note-13-pro-plus', xiaomi_id, 3, true, NOW(), NOW()),
    (gen_random_uuid(), 'ريدمي نوت 13 برو', 'Redmi Note 13 Pro', 'redmi-note-13-pro', xiaomi_id, 4, true, NOW(), NOW()),
    (gen_random_uuid(), 'ريدمي نوت 13', 'Redmi Note 13', 'redmi-note-13', xiaomi_id, 5, true, NOW(), NOW()),
    (gen_random_uuid(), 'ريدمي نوت 12 برو', 'Redmi Note 12 Pro', 'redmi-note-12-pro', xiaomi_id, 6, true, NOW(), NOW()),
    (gen_random_uuid(), 'بوكو X6 برو', 'Poco X6 Pro', 'poco-x6-pro', xiaomi_id, 7, true, NOW(), NOW()),
    (gen_random_uuid(), 'بوكو X6', 'Poco X6', 'poco-x6', xiaomi_id, 8, true, NOW(), NOW()),
    (gen_random_uuid(), 'بوكو F5', 'Poco F5', 'poco-f5', xiaomi_id, 9, true, NOW(), NOW()),
    (gen_random_uuid(), 'شاومي آخر', 'Other Xiaomi', 'other-xiaomi', xiaomi_id, 10, true, NOW(), NOW());

    -- Level 2: OPPO
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'أوبو', 'OPPO', 'oppo-mobiles', mobiles_id, 3, true, NOW(), NOW())
    RETURNING id INTO oppo_id;

    -- Level 3: OPPO Models
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'أوبو فايند X7 ألترا', 'OPPO Find X7 Ultra', 'oppo-find-x7-ultra', oppo_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'أوبو رينو 11 برو', 'OPPO Reno 11 Pro', 'oppo-reno-11-pro', oppo_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'أوبو رينو 11', 'OPPO Reno 11', 'oppo-reno-11', oppo_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'أوبو رينو 10 برو', 'OPPO Reno 10 Pro', 'oppo-reno-10-pro', oppo_id, 3, true, NOW(), NOW()),
    (gen_random_uuid(), 'سلسلة أوبو A', 'OPPO A Series', 'oppo-a-series', oppo_id, 4, true, NOW(), NOW()),
    (gen_random_uuid(), 'أوبو آخر', 'Other OPPO', 'other-oppo', oppo_id, 5, true, NOW(), NOW());

    -- Level 2: Vivo
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'فيفو', 'Vivo', 'vivo-mobiles', mobiles_id, 4, true, NOW(), NOW())
    RETURNING id INTO vivo_id;

    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'فيفو X100 برو', 'Vivo X100 Pro', 'vivo-x100-pro', vivo_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'فيفو X100', 'Vivo X100', 'vivo-x100', vivo_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'فيفو V29 برو', 'Vivo V29 Pro', 'vivo-v29-pro', vivo_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'سلسلة فيفو Y', 'Vivo Y Series', 'vivo-y-series', vivo_id, 3, true, NOW(), NOW()),
    (gen_random_uuid(), 'فيفو آخر', 'Other Vivo', 'other-vivo', vivo_id, 4, true, NOW(), NOW());

    -- Level 2: Huawei
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'هواوي', 'Huawei', 'huawei-mobiles', mobiles_id, 5, true, NOW(), NOW())
    RETURNING id INTO huawei_id;

    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'هواوي ميت 60 برو', 'Huawei Mate 60 Pro', 'huawei-mate-60-pro', huawei_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'هواوي P60 برو', 'Huawei P60 Pro', 'huawei-p60-pro', huawei_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'هواوي نوفا 12', 'Huawei Nova 12', 'huawei-nova-12', huawei_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'سلسلة هواوي Y', 'Huawei Y Series', 'huawei-y-series', huawei_id, 3, true, NOW(), NOW()),
    (gen_random_uuid(), 'هواوي آخر', 'Other Huawei', 'other-huawei', huawei_id, 4, true, NOW(), NOW());

    -- Level 2: Infinix
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'إنفينكس', 'Infinix', 'infinix-mobiles', mobiles_id, 6, true, NOW(), NOW())
    RETURNING id INTO infinix_id;

    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'إنفينكس زيرو 30', 'Infinix Zero 30', 'infinix-zero-30', infinix_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'إنفينكس نوت 30 برو', 'Infinix Note 30 Pro', 'infinix-note-30-pro', infinix_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'إنفينكس هوت 40 برو', 'Infinix Hot 40 Pro', 'infinix-hot-40-pro', infinix_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'سلسلة إنفينكس سمارت', 'Infinix Smart Series', 'infinix-smart-series', infinix_id, 3, true, NOW(), NOW()),
    (gen_random_uuid(), 'إنفينكس آخر', 'Other Infinix', 'other-infinix', infinix_id, 4, true, NOW(), NOW());

    -- Level 2: Tecno
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'تكنو', 'Tecno', 'tecno-mobiles', mobiles_id, 7, true, NOW(), NOW())
    RETURNING id INTO tecno_id;

    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'تكنو فانتوم V فولد', 'Tecno Phantom V Fold', 'tecno-phantom-v-fold', tecno_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'تكنو كامون 20 برو', 'Tecno Camon 20 Pro', 'tecno-camon-20-pro', tecno_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'تكنو سبارك 20 برو', 'Tecno Spark 20 Pro', 'tecno-spark-20-pro', tecno_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'سلسلة تكنو سبارك', 'Tecno Spark Series', 'tecno-spark-series', tecno_id, 3, true, NOW(), NOW()),
    (gen_random_uuid(), 'سلسلة تكنو بوب', 'Tecno Pop Series', 'tecno-pop-series', tecno_id, 4, true, NOW(), NOW()),
    (gen_random_uuid(), 'تكنو آخر', 'Other Tecno', 'other-tecno', tecno_id, 5, true, NOW(), NOW());

    -- Level 2: Realme
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'ريلمي', 'Realme', 'realme-mobiles', mobiles_id, 8, true, NOW(), NOW())
    RETURNING id INTO realme_id;

    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'ريلمي GT 5 برو', 'Realme GT 5 Pro', 'realme-gt-5-pro', realme_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'ريلمي 12 برو+', 'Realme 12 Pro+', 'realme-12-pro-plus', realme_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'ريلمي 11 برو', 'Realme 11 Pro', 'realme-11-pro', realme_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'سلسلة ريلمي C', 'Realme C Series', 'realme-c-series', realme_id, 3, true, NOW(), NOW()),
    (gen_random_uuid(), 'ريلمي آخر', 'Other Realme', 'other-realme', realme_id, 4, true, NOW(), NOW());

    -- Level 2: Honor
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'هونر', 'Honor', 'honor-mobiles', mobiles_id, 9, true, NOW(), NOW())
    RETURNING id INTO honor_id;

    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'هونر ماجيك 6 برو', 'Honor Magic 6 Pro', 'honor-magic-6-pro', honor_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'هونر 90 برو', 'Honor 90 Pro', 'honor-90-pro', honor_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'سلسلة هونر X', 'Honor X Series', 'honor-x-series', honor_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'هونر آخر', 'Other Honor', 'other-honor', honor_id, 3, true, NOW(), NOW());

    -- Level 2: OnePlus
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'ون بلس', 'OnePlus', 'oneplus-mobiles', mobiles_id, 10, true, NOW(), NOW())
    RETURNING id INTO oneplus_id;

    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'ون بلس 12', 'OnePlus 12', 'oneplus-12', oneplus_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'ون بلس 11', 'OnePlus 11', 'oneplus-11', oneplus_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'ون بلس أوبن', 'OnePlus Open', 'oneplus-open', oneplus_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'سلسلة ون بلس نورد', 'OnePlus Nord Series', 'oneplus-nord-series', oneplus_id, 3, true, NOW(), NOW()),
    (gen_random_uuid(), 'ون بلس آخر', 'Other OnePlus', 'other-oneplus', oneplus_id, 4, true, NOW(), NOW());

    -- Level 2: Google
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'جوجل', 'Google', 'google-mobiles', mobiles_id, 11, true, NOW(), NOW())
    RETURNING id INTO google_id;

    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'بيكسل 8 برو', 'Pixel 8 Pro', 'pixel-8-pro', google_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'بيكسل 8', 'Pixel 8', 'pixel-8', google_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'بيكسل 7 برو', 'Pixel 7 Pro', 'pixel-7-pro', google_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'بيكسل آخر', 'Other Pixel', 'other-pixel', google_id, 3, true, NOW(), NOW());

    -- Level 2: Nokia
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'نوكيا', 'Nokia', 'nokia-mobiles', mobiles_id, 12, true, NOW(), NOW())
    RETURNING id INTO nokia_id;

    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'سلسلة نوكيا G', 'Nokia G Series', 'nokia-g-series', nokia_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'سلسلة نوكيا X', 'Nokia X Series', 'nokia-x-series', nokia_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'نوكيا آخر', 'Other Nokia', 'other-nokia', nokia_id, 2, true, NOW(), NOW());

    -- Level 2: Motorola
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'موتورولا', 'Motorola', 'motorola-mobiles', mobiles_id, 13, true, NOW(), NOW())
    RETURNING id INTO motorola_id;

    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'موتورولا إيدج', 'Motorola Edge', 'motorola-edge', motorola_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'موتورولا ريزر', 'Motorola Razr', 'motorola-razr', motorola_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'سلسلة موتورولا G', 'Motorola G Series', 'motorola-g-series', motorola_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'موتورولا آخر', 'Other Motorola', 'other-motorola', motorola_id, 3, true, NOW(), NOW());

    -- Level 2: Other Brands
    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at)
    VALUES (gen_random_uuid(), 'ماركات أخرى', 'Other Brands', 'other-mobile-brands', mobiles_id, 14, true, NOW(), NOW())
    RETURNING id INTO other_brands_id;

    INSERT INTO categories (id, name_ar, name_en, slug, parent_id, "order", is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'أسوس', 'Asus', 'asus-mobiles', other_brands_id, 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'سوني', 'Sony', 'sony-mobiles', other_brands_id, 1, true, NOW(), NOW()),
    (gen_random_uuid(), 'إل جي', 'LG', 'lg-mobiles', other_brands_id, 2, true, NOW(), NOW()),
    (gen_random_uuid(), 'زد تي إي', 'ZTE', 'zte-mobiles', other_brands_id, 3, true, NOW(), NOW()),
    (gen_random_uuid(), 'أخرى', 'Other', 'other-mobiles', other_brands_id, 4, true, NOW(), NOW());

    RAISE NOTICE 'Successfully seeded mobile categories!';
END $$;

-- Verify the categories were created
SELECT
    c1.name_ar as "الفئة الرئيسية",
    c2.name_ar as "الماركة",
    COUNT(c3.id) as "عدد الموديلات"
FROM categories c1
LEFT JOIN categories c2 ON c2.parent_id = c1.id
LEFT JOIN categories c3 ON c3.parent_id = c2.id
WHERE c1.slug = 'mobiles'
GROUP BY c1.name_ar, c2.name_ar, c2."order"
ORDER BY c2."order";
