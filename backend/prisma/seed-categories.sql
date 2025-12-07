-- ============================================
-- XChange Egypt - Categories Seed Data
-- Run this SECOND in Supabase SQL Editor (after users)
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '🌱 Seeding categories...';

    -- ============================================
    -- Main Categories (الفئات الرئيسية)
    -- ============================================

    -- Electronics (إلكترونيات)
    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, "order", is_active, created_at, updated_at)
    VALUES (
        'cat-electronics',
        'إلكترونيات',
        'Electronics',
        'electronics',
        'أجهزة إلكترونية ومنتجات تقنية',
        '📱',
        1,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Vehicles (سيارات ومركبات)
    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, "order", is_active, created_at, updated_at)
    VALUES (
        'cat-vehicles',
        'سيارات ومركبات',
        'Vehicles',
        'vehicles',
        'سيارات، دراجات، وقطع غيار',
        '🚗',
        2,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Furniture (أثاث)
    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, "order", is_active, created_at, updated_at)
    VALUES (
        'cat-furniture',
        'أثاث',
        'Furniture',
        'furniture',
        'أثاث منزلي ومكتبي',
        '🛋️',
        3,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Fashion (أزياء وموضة)
    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, "order", is_active, created_at, updated_at)
    VALUES (
        'cat-fashion',
        'أزياء وموضة',
        'Fashion',
        'fashion',
        'ملابس، أحذية، إكسسوارات',
        '👕',
        4,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Home Appliances (أجهزة منزلية)
    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, "order", is_active, created_at, updated_at)
    VALUES (
        'cat-home-appliances',
        'أجهزة منزلية',
        'Home Appliances',
        'home-appliances',
        'ثلاجات، غسالات، مكيفات',
        '🏠',
        5,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    RAISE NOTICE '✅ Main categories created';

    -- ============================================
    -- Subcategories (الفئات الفرعية)
    -- ============================================

    -- Electronics Subcategories
    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, parent_id, "order", is_active, created_at, updated_at)
    VALUES (
        'cat-mobile-phones',
        'هواتف محمولة',
        'Mobile Phones',
        'mobile-phones',
        'هواتف ذكية وإكسسوارات',
        '📱',
        'cat-electronics',
        1,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, parent_id, "order", is_active, created_at, updated_at)
    VALUES (
        'cat-computers',
        'كمبيوترات ولابتوب',
        'Computers',
        'computers',
        'أجهزة كمبيوتر ولابتوب',
        '💻',
        'cat-electronics',
        2,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, parent_id, "order", is_active, created_at, updated_at)
    VALUES (
        'cat-cameras',
        'كاميرات',
        'Cameras',
        'cameras',
        'كاميرات تصوير وفيديو',
        '📷',
        'cat-electronics',
        3,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Vehicles Subcategories
    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, parent_id, "order", is_active, created_at, updated_at)
    VALUES (
        'cat-cars',
        'سيارات',
        'Cars',
        'cars',
        'سيارات جديدة ومستعملة',
        '🚙',
        'cat-vehicles',
        1,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, parent_id, "order", is_active, created_at, updated_at)
    VALUES (
        'cat-motorcycles',
        'دراجات نارية',
        'Motorcycles',
        'motorcycles',
        'دراجات نارية وسكوتر',
        '🏍️',
        'cat-vehicles',
        2,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    -- Furniture Subcategories
    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, parent_id, "order", is_active, created_at, updated_at)
    VALUES (
        'cat-living-room',
        'غرف معيشة',
        'Living Room',
        'living-room',
        'أثاث غرف المعيشة والصالون',
        '🛋️',
        'cat-furniture',
        1,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO categories (id, name_ar, name_en, slug, description, icon, parent_id, "order", is_active, created_at, updated_at)
    VALUES (
        'cat-bedroom',
        'غرف نوم',
        'Bedroom',
        'bedroom',
        'أثاث غرف النوم',
        '🛏️',
        'cat-furniture',
        2,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;

    RAISE NOTICE '✅ Subcategories created';

    -- ============================================
    -- Summary
    -- ============================================
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✨ CATEGORIES SEEDING COMPLETED! ✨';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '📁 Main Categories: 5';
    RAISE NOTICE '📂 Subcategories: 7';
    RAISE NOTICE '';

END $$;
