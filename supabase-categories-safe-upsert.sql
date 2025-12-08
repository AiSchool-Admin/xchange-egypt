-- ============================================================
-- Xchange Egypt - Comprehensive Categories Catalog
-- Safe UPSERT - Generates UUIDs for new categories
-- ============================================================

-- MAIN CATEGORIES (Level 1)
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Electronics & Computers', 'الإلكترونيات والكمبيوتر', 'electronics-computers', '💻', 'Electronic devices, computers, and accessories', NULL, 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Fashion & Clothing', 'الأزياء والملابس', 'fashion-clothing', '👗', 'Clothing, shoes, and fashion accessories', NULL, 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Home & Garden', 'المنزل والحديقة', 'home-garden', '🏠', 'Home decor, furniture, and garden supplies', NULL, 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Vehicles & Parts', 'السيارات وقطع الغيار', 'vehicles-parts', '🚗', 'Cars, motorcycles, and automotive parts', NULL, 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Sports & Outdoors', 'الرياضة والأنشطة الخارجية', 'sports-outdoors', '⚽', 'Sports equipment and outdoor gear', NULL, 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Toys & Games', 'الألعاب والهوايات', 'toys-games', '🎮', 'Toys, games, and hobbies', NULL, 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Health & Beauty', 'الصحة والجمال', 'health-beauty', '💄', 'Health products and beauty items', NULL, 7, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Books & Media', 'الكتب والوسائط', 'books-media', '📚', 'Books, music, movies, and digital media', NULL, 8, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Baby & Kids', 'الأطفال والرضع', 'baby-kids', '👶', 'Baby products and kids items', NULL, 9, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Pets & Animals', 'الحيوانات الأليفة', 'pets-animals', '🐕', 'Pet supplies and animal products', NULL, 10, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Food & Beverages', 'الأغذية والمشروبات', 'food-beverages', '🍎', 'Food products and drinks', NULL, 11, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Jewelry & Watches', 'المجوهرات والساعات', 'jewelry-watches', '💎', 'Jewelry, watches, and accessories', NULL, 12, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Art & Collectibles', 'الفن والمقتنيات', 'art-collectibles', '🎨', 'Art, antiques, and collectible items', NULL, 13, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Office & Business', 'المكتب والأعمال', 'office-business', '🏢', 'Office supplies and business equipment', NULL, 14, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Industrial & Scientific', 'الصناعي والعلمي', 'industrial-scientific', '🔧', 'Industrial equipment and scientific tools', NULL, 15, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Real Estate', 'العقارات', 'real-estate', '🏘️', 'Properties and real estate', NULL, 16, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Services', 'الخدمات', 'services', '🛠️', 'Professional and personal services', NULL, 17, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Musical Instruments', 'الآلات الموسيقية', 'musical-instruments', '🎸', 'Musical instruments and audio equipment', NULL, 18, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Travel & Luggage', 'السفر والحقائب', 'travel-luggage', '🧳', 'Travel accessories and luggage', NULL, 19, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Other', 'أخرى', 'other', '📦', 'Miscellaneous items', NULL, 20, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Electronics
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Mobile Phones', 'الهواتف المحمولة', 'mobile-phones', '📱', 'Smartphones and mobile devices', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Laptops', 'الحواسيب المحمولة', 'laptops', '💻', 'Laptop computers', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Desktop Computers', 'الحواسيب المكتبية', 'desktop-computers', '🖥️', 'Desktop PCs and workstations', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Tablets', 'الأجهزة اللوحية', 'tablets', '📲', 'Tablet devices', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'TVs & Monitors', 'التلفزيونات والشاشات', 'tvs-monitors', '📺', 'Televisions and display monitors', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Cameras & Photography', 'الكاميرات والتصوير', 'cameras-photography', '📷', 'Digital cameras and photography equipment', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Audio & Headphones', 'الصوتيات والسماعات', 'audio-headphones', '🎧', 'Audio equipment and headphones', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 7, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Gaming & Consoles', 'الألعاب والأجهزة', 'gaming-consoles', '🎮', 'Gaming consoles and accessories', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 8, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Wearables & Smartwatches', 'الأجهزة القابلة للارتداء', 'wearables-smartwatches', '⌚', 'Smartwatches and fitness trackers', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 9, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Electronics Accessories', 'إكسسوارات إلكترونية', 'electronics-accessories', '🔌', 'Cables, chargers, and accessories', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 10, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Fashion
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Mens Clothing', 'ملابس رجالية', 'mens-clothing', '👔', 'Clothing for men', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Womens Clothing', 'ملابس نسائية', 'womens-clothing', '👗', 'Clothing for women', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Kids Clothing', 'ملابس أطفال', 'kids-clothing', '🧒', 'Clothing for children', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Shoes & Footwear', 'الأحذية', 'shoes-footwear', '👟', 'Shoes and footwear', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Bags & Handbags', 'الحقائب', 'bags-handbags', '👜', 'Bags and handbags', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Fashion Accessories', 'إكسسوارات الموضة', 'fashion-accessories', '🧣', 'Scarves, belts, and accessories', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Sportswear', 'الملابس الرياضية', 'sportswear', '🏃', 'Athletic and sports clothing', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 7, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Traditional Clothing', 'الملابس التقليدية', 'traditional-clothing', '🥻', 'Traditional and cultural clothing', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 8, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Home & Garden
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Furniture', 'الأثاث', 'furniture', '🛋️', 'Home furniture', (SELECT id FROM categories WHERE slug = 'home-garden'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Kitchen & Dining', 'المطبخ والطعام', 'kitchen-dining', '🍳', 'Kitchen appliances and dining', (SELECT id FROM categories WHERE slug = 'home-garden'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Bedding & Bath', 'المفروشات والحمام', 'bedding-bath', '🛏️', 'Bedding, linens, and bath items', (SELECT id FROM categories WHERE slug = 'home-garden'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Home Decor', 'ديكور المنزل', 'home-decor', '🖼️', 'Decorative items for home', (SELECT id FROM categories WHERE slug = 'home-garden'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Lighting', 'الإضاءة', 'lighting', '💡', 'Lamps and lighting fixtures', (SELECT id FROM categories WHERE slug = 'home-garden'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Garden & Outdoor', 'الحديقة والخارج', 'garden-outdoor', '🌳', 'Garden supplies and outdoor furniture', (SELECT id FROM categories WHERE slug = 'home-garden'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Home Appliances', 'الأجهزة المنزلية', 'home-appliances', '🔌', 'Major and small appliances', (SELECT id FROM categories WHERE slug = 'home-garden'), 7, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Tools & Hardware', 'الأدوات والمعدات', 'tools-hardware', '🔨', 'Hand tools and hardware', (SELECT id FROM categories WHERE slug = 'home-garden'), 8, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Vehicles
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Cars', 'السيارات', 'cars', '🚗', 'Automobiles and cars', (SELECT id FROM categories WHERE slug = 'vehicles-parts'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Motorcycles', 'الدراجات النارية', 'motorcycles', '🏍️', 'Motorcycles and scooters', (SELECT id FROM categories WHERE slug = 'vehicles-parts'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Auto Parts', 'قطع غيار السيارات', 'auto-parts', '🔧', 'Car parts and accessories', (SELECT id FROM categories WHERE slug = 'vehicles-parts'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Bicycles', 'الدراجات الهوائية', 'bicycles', '🚲', 'Bikes and cycling gear', (SELECT id FROM categories WHERE slug = 'vehicles-parts'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Boats & Marine', 'القوارب والبحرية', 'boats-marine', '🚤', 'Boats and marine equipment', (SELECT id FROM categories WHERE slug = 'vehicles-parts'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Trucks & Commercial', 'الشاحنات والتجارية', 'trucks-commercial', '🚛', 'Trucks and commercial vehicles', (SELECT id FROM categories WHERE slug = 'vehicles-parts'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Sports
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Fitness Equipment', 'معدات اللياقة', 'fitness-equipment', '🏋️', 'Gym and fitness gear', (SELECT id FROM categories WHERE slug = 'sports-outdoors'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Team Sports', 'الرياضات الجماعية', 'team-sports', '⚽', 'Football, basketball, etc.', (SELECT id FROM categories WHERE slug = 'sports-outdoors'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Water Sports', 'الرياضات المائية', 'water-sports', '🏊', 'Swimming and water activities', (SELECT id FROM categories WHERE slug = 'sports-outdoors'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Camping & Hiking', 'التخييم والمشي', 'camping-hiking', '⛺', 'Outdoor camping gear', (SELECT id FROM categories WHERE slug = 'sports-outdoors'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Cycling', 'ركوب الدراجات', 'cycling', '🚴', 'Cycling gear and accessories', (SELECT id FROM categories WHERE slug = 'sports-outdoors'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Fishing', 'الصيد', 'fishing', '🎣', 'Fishing equipment', (SELECT id FROM categories WHERE slug = 'sports-outdoors'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Health & Beauty
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Skincare', 'العناية بالبشرة', 'skincare', '🧴', 'Skin care products', (SELECT id FROM categories WHERE slug = 'health-beauty'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Makeup', 'المكياج', 'makeup', '💄', 'Cosmetics and makeup', (SELECT id FROM categories WHERE slug = 'health-beauty'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Hair Care', 'العناية بالشعر', 'hair-care', '💇', 'Hair care products', (SELECT id FROM categories WHERE slug = 'health-beauty'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Fragrances', 'العطور', 'fragrances', '🌸', 'Perfumes and fragrances', (SELECT id FROM categories WHERE slug = 'health-beauty'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Personal Care', 'العناية الشخصية', 'personal-care', '🪥', 'Personal hygiene products', (SELECT id FROM categories WHERE slug = 'health-beauty'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Medical Supplies', 'المستلزمات الطبية', 'medical-supplies', '💊', 'Health and medical items', (SELECT id FROM categories WHERE slug = 'health-beauty'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Books & Media
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Fiction Books', 'كتب الروايات', 'fiction-books', '📖', 'Fiction and novels', (SELECT id FROM categories WHERE slug = 'books-media'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Non-Fiction Books', 'كتب غير روائية', 'nonfiction-books', '📚', 'Non-fiction and educational', (SELECT id FROM categories WHERE slug = 'books-media'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Textbooks', 'الكتب الدراسية', 'textbooks', '📕', 'Educational textbooks', (SELECT id FROM categories WHERE slug = 'books-media'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Magazines', 'المجلات', 'magazines', '📰', 'Magazines and periodicals', (SELECT id FROM categories WHERE slug = 'books-media'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Movies & DVDs', 'الأفلام', 'movies-dvds', '🎬', 'Movies and video content', (SELECT id FROM categories WHERE slug = 'books-media'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Music', 'الموسيقى', 'music', '🎵', 'Music albums and CDs', (SELECT id FROM categories WHERE slug = 'books-media'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Baby & Kids
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Baby Gear', 'مستلزمات الرضع', 'baby-gear', '🍼', 'Strollers, car seats, etc.', (SELECT id FROM categories WHERE slug = 'baby-kids'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Baby Clothing', 'ملابس الرضع', 'baby-clothing', '👶', 'Clothes for babies', (SELECT id FROM categories WHERE slug = 'baby-kids'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Baby Toys', 'ألعاب الرضع', 'baby-toys', '🧸', 'Toys for babies', (SELECT id FROM categories WHERE slug = 'baby-kids'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Nursery & Furniture', 'غرفة الطفل والأثاث', 'nursery-furniture', '🛒', 'Baby room furniture', (SELECT id FROM categories WHERE slug = 'baby-kids'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Feeding', 'التغذية', 'feeding', '🍽️', 'Bottles, feeding accessories', (SELECT id FROM categories WHERE slug = 'baby-kids'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Pets
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Dogs', 'الكلاب', 'dogs', '🐕', 'Dog supplies', (SELECT id FROM categories WHERE slug = 'pets-animals'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Cats', 'القطط', 'cats', '🐈', 'Cat supplies', (SELECT id FROM categories WHERE slug = 'pets-animals'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Birds', 'الطيور', 'birds', '🦜', 'Bird supplies', (SELECT id FROM categories WHERE slug = 'pets-animals'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Fish & Aquariums', 'الأسماك وأحواض السمك', 'fish-aquariums', '🐠', 'Fish and aquarium supplies', (SELECT id FROM categories WHERE slug = 'pets-animals'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Small Pets', 'الحيوانات الصغيرة', 'small-pets', '🐹', 'Hamsters, rabbits, etc.', (SELECT id FROM categories WHERE slug = 'pets-animals'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Toys & Games
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Action Figures', 'شخصيات الأكشن', 'action-figures', '🦸', 'Action figures and dolls', (SELECT id FROM categories WHERE slug = 'toys-games'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Board Games', 'ألعاب الطاولة', 'board-games', '🎲', 'Board games and puzzles', (SELECT id FROM categories WHERE slug = 'toys-games'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Building Toys', 'ألعاب البناء', 'building-toys', '🧱', 'LEGO and building sets', (SELECT id FROM categories WHERE slug = 'toys-games'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Educational Toys', 'الألعاب التعليمية', 'educational-toys', '🔬', 'Learning and educational toys', (SELECT id FROM categories WHERE slug = 'toys-games'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Video Games', 'ألعاب الفيديو', 'video-games', '🕹️', 'Video games for all platforms', (SELECT id FROM categories WHERE slug = 'toys-games'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Outdoor Toys', 'ألعاب خارجية', 'outdoor-toys', '🪁', 'Outdoor play equipment', (SELECT id FROM categories WHERE slug = 'toys-games'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Jewelry & Watches
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Fine Jewelry', 'المجوهرات الفاخرة', 'fine-jewelry', '💍', 'Gold, silver, precious stones', (SELECT id FROM categories WHERE slug = 'jewelry-watches'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Costume Jewelry', 'مجوهرات الأزياء', 'costume-jewelry', '📿', 'Fashion jewelry', (SELECT id FROM categories WHERE slug = 'jewelry-watches'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Watches', 'الساعات', 'watches', '⌚', 'Wrist watches', (SELECT id FROM categories WHERE slug = 'jewelry-watches'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Rings', 'الخواتم', 'rings', '💎', 'Rings and bands', (SELECT id FROM categories WHERE slug = 'jewelry-watches'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Necklaces', 'القلائد', 'necklaces', '📿', 'Necklaces and pendants', (SELECT id FROM categories WHERE slug = 'jewelry-watches'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Art & Collectibles
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Paintings', 'اللوحات', 'paintings', '🖼️', 'Original paintings', (SELECT id FROM categories WHERE slug = 'art-collectibles'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Sculptures', 'المنحوتات', 'sculptures', '🗿', 'Sculptural art', (SELECT id FROM categories WHERE slug = 'art-collectibles'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Antiques', 'التحف', 'antiques', '🏺', 'Antique items', (SELECT id FROM categories WHERE slug = 'art-collectibles'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Coins & Currency', 'العملات', 'coins-currency', '🪙', 'Collectible coins', (SELECT id FROM categories WHERE slug = 'art-collectibles'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Stamps', 'الطوابع', 'stamps', '📮', 'Collectible stamps', (SELECT id FROM categories WHERE slug = 'art-collectibles'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Memorabilia', 'التذكارات', 'memorabilia', '🎖️', 'Sports and entertainment memorabilia', (SELECT id FROM categories WHERE slug = 'art-collectibles'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Office & Business
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Office Supplies', 'مستلزمات المكتب', 'office-supplies', '📎', 'General office supplies', (SELECT id FROM categories WHERE slug = 'office-business'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Office Furniture', 'أثاث المكتب', 'office-furniture', '🪑', 'Desks, chairs, etc.', (SELECT id FROM categories WHERE slug = 'office-business'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Printers & Scanners', 'الطابعات والماسحات', 'printers-scanners', '🖨️', 'Printing equipment', (SELECT id FROM categories WHERE slug = 'office-business'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Presentation Equipment', 'معدات العرض', 'presentation-equipment', '📽️', 'Projectors and presentation tools', (SELECT id FROM categories WHERE slug = 'office-business'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Musical Instruments
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Guitars', 'الجيتارات', 'guitars', '🎸', 'Acoustic and electric guitars', (SELECT id FROM categories WHERE slug = 'musical-instruments'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Pianos & Keyboards', 'البيانو والكيبورد', 'pianos-keyboards', '🎹', 'Pianos and keyboard instruments', (SELECT id FROM categories WHERE slug = 'musical-instruments'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Drums & Percussion', 'الطبول والإيقاع', 'drums-percussion', '🥁', 'Drums and percussion instruments', (SELECT id FROM categories WHERE slug = 'musical-instruments'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Wind Instruments', 'آلات النفخ', 'wind-instruments', '🎷', 'Woodwind and brass instruments', (SELECT id FROM categories WHERE slug = 'musical-instruments'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'String Instruments', 'الآلات الوترية', 'string-instruments', '🎻', 'Violins, cellos, etc.', (SELECT id FROM categories WHERE slug = 'musical-instruments'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'DJ Equipment', 'معدات الدي جي', 'dj-equipment', '🎚️', 'DJ and mixing equipment', (SELECT id FROM categories WHERE slug = 'musical-instruments'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Services
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Home Services', 'خدمات المنزل', 'home-services', '🏠', 'Cleaning, repairs, etc.', (SELECT id FROM categories WHERE slug = 'services'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Professional Services', 'خدمات مهنية', 'professional-services', '💼', 'Legal, financial, consulting', (SELECT id FROM categories WHERE slug = 'services'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Tutoring & Lessons', 'الدروس الخصوصية', 'tutoring-lessons', '📚', 'Education and tutoring', (SELECT id FROM categories WHERE slug = 'services'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Events & Entertainment', 'الفعاليات والترفيه', 'events-entertainment', '🎉', 'Event planning, DJs, etc.', (SELECT id FROM categories WHERE slug = 'services'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Tech Services', 'خدمات تقنية', 'tech-services', '💻', 'IT support, web development', (SELECT id FROM categories WHERE slug = 'services'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Real Estate
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Apartments', 'الشقق', 'apartments', '🏢', 'Apartments for sale/rent', (SELECT id FROM categories WHERE slug = 'real-estate'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Villas & Houses', 'الفلل والمنازل', 'villas-houses', '🏡', 'Villas and houses', (SELECT id FROM categories WHERE slug = 'real-estate'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Commercial Properties', 'العقارات التجارية', 'commercial-properties', '🏬', 'Offices and commercial spaces', (SELECT id FROM categories WHERE slug = 'real-estate'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES (gen_random_uuid()::TEXT, 'Land', 'الأراضي', 'land', '🌍', 'Land plots', (SELECT id FROM categories WHERE slug = 'real-estate'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- ============================================================
-- Done! 20 Main + 85 Sub = 105 Categories
-- Uses gen_random_uuid()::TEXT for new IDs
-- ============================================================
