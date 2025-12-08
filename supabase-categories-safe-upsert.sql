-- ============================================================
-- Xchange Egypt - Comprehensive Categories Catalog
-- Safe UPSERT - No hardcoded IDs
-- ============================================================

-- STEP 1: Main Categories (Level 1)
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Electronics & Computers', 'الإلكترونيات والكمبيوتر', 'electronics-computers', '💻', 'Electronic devices, computers, and accessories', NULL, 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Fashion & Clothing', 'الأزياء والملابس', 'fashion-clothing', '👗', 'Clothing, shoes, and fashion accessories', NULL, 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Home & Garden', 'المنزل والحديقة', 'home-garden', '🏠', 'Home decor, furniture, and garden supplies', NULL, 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Vehicles & Parts', 'السيارات وقطع الغيار', 'vehicles-parts', '🚗', 'Cars, motorcycles, and automotive parts', NULL, 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Sports & Outdoors', 'الرياضة والأنشطة الخارجية', 'sports-outdoors', '⚽', 'Sports equipment and outdoor gear', NULL, 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Toys & Games', 'الألعاب والهوايات', 'toys-games', '🎮', 'Toys, games, and hobbies', NULL, 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Health & Beauty', 'الصحة والجمال', 'health-beauty', '💄', 'Health products and beauty items', NULL, 7, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Books & Media', 'الكتب والوسائط', 'books-media', '📚', 'Books, music, movies, and digital media', NULL, 8, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Baby & Kids', 'الأطفال والرضع', 'baby-kids', '👶', 'Baby products and kids items', NULL, 9, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Pets & Animals', 'الحيوانات الأليفة', 'pets-animals', '🐕', 'Pet supplies and animal products', NULL, 10, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Food & Beverages', 'الأغذية والمشروبات', 'food-beverages', '🍎', 'Food products and drinks', NULL, 11, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Jewelry & Watches', 'المجوهرات والساعات', 'jewelry-watches', '💎', 'Jewelry, watches, and accessories', NULL, 12, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Art & Collectibles', 'الفن والمقتنيات', 'art-collectibles', '🎨', 'Art, antiques, and collectible items', NULL, 13, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Office & Business', 'المكتب والأعمال', 'office-business', '🏢', 'Office supplies and business equipment', NULL, 14, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Industrial & Scientific', 'الصناعي والعلمي', 'industrial-scientific', '🔧', 'Industrial equipment and scientific tools', NULL, 15, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Real Estate', 'العقارات', 'real-estate', '🏘️', 'Properties and real estate', NULL, 16, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Services', 'الخدمات', 'services', '🛠️', 'Professional and personal services', NULL, 17, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Musical Instruments', 'الآلات الموسيقية', 'musical-instruments', '🎸', 'Musical instruments and audio equipment', NULL, 18, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Travel & Luggage', 'السفر والحقائب', 'travel-luggage', '🧳', 'Travel accessories and luggage', NULL, 19, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Other', 'أخرى', 'other', '📦', 'Miscellaneous items', NULL, 20, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

-- STEP 2: Sub-Categories (Level 2) - Electronics
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Mobile Phones', 'الهواتف المحمولة', 'mobile-phones', '📱', 'Smartphones and mobile devices', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Laptops', 'الحواسيب المحمولة', 'laptops', '💻', 'Laptop computers', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Desktop Computers', 'الحواسيب المكتبية', 'desktop-computers', '🖥️', 'Desktop PCs and workstations', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Tablets', 'الأجهزة اللوحية', 'tablets', '📲', 'Tablet devices', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('TVs & Monitors', 'التلفزيونات والشاشات', 'tvs-monitors', '📺', 'Televisions and display monitors', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Cameras & Photography', 'الكاميرات والتصوير', 'cameras-photography', '📷', 'Digital cameras and photography equipment', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Audio & Headphones', 'الصوتيات والسماعات', 'audio-headphones', '🎧', 'Audio equipment and headphones', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 7, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Gaming & Consoles', 'الألعاب والأجهزة', 'gaming-consoles', '🎮', 'Gaming consoles and accessories', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 8, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Wearables & Smartwatches', 'الأجهزة القابلة للارتداء', 'wearables-smartwatches', '⌚', 'Smartwatches and fitness trackers', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 9, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Electronics Accessories', 'إكسسوارات إلكترونية', 'electronics-accessories', '🔌', 'Cables, chargers, and accessories', (SELECT id FROM categories WHERE slug = 'electronics-computers'), 10, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Fashion
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Mens Clothing', 'ملابس رجالية', 'mens-clothing', '👔', 'Clothing for men', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Womens Clothing', 'ملابس نسائية', 'womens-clothing', '👗', 'Clothing for women', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Kids Clothing', 'ملابس أطفال', 'kids-clothing', '🧒', 'Clothing for children', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Shoes & Footwear', 'الأحذية', 'shoes-footwear', '👟', 'Shoes and footwear', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Bags & Handbags', 'الحقائب', 'bags-handbags', '👜', 'Bags and handbags', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Fashion Accessories', 'إكسسوارات الموضة', 'fashion-accessories', '🧣', 'Scarves, belts, and accessories', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Sportswear', 'الملابس الرياضية', 'sportswear', '🏃', 'Athletic and sports clothing', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 7, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Traditional Clothing', 'الملابس التقليدية', 'traditional-clothing', '🥻', 'Traditional and cultural clothing', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 8, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Home & Garden
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Furniture', 'الأثاث', 'furniture', '🛋️', 'Home furniture', (SELECT id FROM categories WHERE slug = 'home-garden'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Kitchen & Dining', 'المطبخ والطعام', 'kitchen-dining', '🍳', 'Kitchen appliances and dining', (SELECT id FROM categories WHERE slug = 'home-garden'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Bedding & Bath', 'المفروشات والحمام', 'bedding-bath', '🛏️', 'Bedding, linens, and bath items', (SELECT id FROM categories WHERE slug = 'home-garden'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Home Decor', 'ديكور المنزل', 'home-decor', '🖼️', 'Decorative items for home', (SELECT id FROM categories WHERE slug = 'home-garden'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Lighting', 'الإضاءة', 'lighting', '💡', 'Lamps and lighting fixtures', (SELECT id FROM categories WHERE slug = 'home-garden'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Garden & Outdoor', 'الحديقة والخارج', 'garden-outdoor', '🌳', 'Garden supplies and outdoor furniture', (SELECT id FROM categories WHERE slug = 'home-garden'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Home Appliances', 'الأجهزة المنزلية', 'home-appliances', '🔌', 'Major and small appliances', (SELECT id FROM categories WHERE slug = 'home-garden'), 7, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Tools & Hardware', 'الأدوات والمعدات', 'tools-hardware', '🔨', 'Hand tools and hardware', (SELECT id FROM categories WHERE slug = 'home-garden'), 8, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Vehicles
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Cars', 'السيارات', 'cars', '🚗', 'Automobiles and cars', (SELECT id FROM categories WHERE slug = 'vehicles-parts'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Motorcycles', 'الدراجات النارية', 'motorcycles', '🏍️', 'Motorcycles and scooters', (SELECT id FROM categories WHERE slug = 'vehicles-parts'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Auto Parts', 'قطع غيار السيارات', 'auto-parts', '🔧', 'Car parts and accessories', (SELECT id FROM categories WHERE slug = 'vehicles-parts'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Bicycles', 'الدراجات الهوائية', 'bicycles', '🚲', 'Bikes and cycling gear', (SELECT id FROM categories WHERE slug = 'vehicles-parts'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Boats & Marine', 'القوارب والبحرية', 'boats-marine', '🚤', 'Boats and marine equipment', (SELECT id FROM categories WHERE slug = 'vehicles-parts'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Trucks & Commercial', 'الشاحنات والتجارية', 'trucks-commercial', '🚛', 'Trucks and commercial vehicles', (SELECT id FROM categories WHERE slug = 'vehicles-parts'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Sports
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Fitness Equipment', 'معدات اللياقة', 'fitness-equipment', '🏋️', 'Gym and fitness gear', (SELECT id FROM categories WHERE slug = 'sports-outdoors'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Team Sports', 'الرياضات الجماعية', 'team-sports', '⚽', 'Football, basketball, etc.', (SELECT id FROM categories WHERE slug = 'sports-outdoors'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Water Sports', 'الرياضات المائية', 'water-sports', '🏊', 'Swimming and water activities', (SELECT id FROM categories WHERE slug = 'sports-outdoors'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Camping & Hiking', 'التخييم والمشي', 'camping-hiking', '⛺', 'Outdoor camping gear', (SELECT id FROM categories WHERE slug = 'sports-outdoors'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Cycling', 'ركوب الدراجات', 'cycling', '🚴', 'Cycling gear and accessories', (SELECT id FROM categories WHERE slug = 'sports-outdoors'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Fishing', 'الصيد', 'fishing', '🎣', 'Fishing equipment', (SELECT id FROM categories WHERE slug = 'sports-outdoors'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Health & Beauty
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Skincare', 'العناية بالبشرة', 'skincare', '🧴', 'Skin care products', (SELECT id FROM categories WHERE slug = 'health-beauty'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Makeup', 'المكياج', 'makeup', '💄', 'Cosmetics and makeup', (SELECT id FROM categories WHERE slug = 'health-beauty'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Hair Care', 'العناية بالشعر', 'hair-care', '💇', 'Hair care products', (SELECT id FROM categories WHERE slug = 'health-beauty'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Fragrances', 'العطور', 'fragrances', '🌸', 'Perfumes and fragrances', (SELECT id FROM categories WHERE slug = 'health-beauty'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Personal Care', 'العناية الشخصية', 'personal-care', '🪥', 'Personal hygiene products', (SELECT id FROM categories WHERE slug = 'health-beauty'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Medical Supplies', 'المستلزمات الطبية', 'medical-supplies', '💊', 'Health and medical items', (SELECT id FROM categories WHERE slug = 'health-beauty'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Books & Media
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Fiction Books', 'كتب الروايات', 'fiction-books', '📖', 'Fiction and novels', (SELECT id FROM categories WHERE slug = 'books-media'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Non-Fiction Books', 'كتب غير روائية', 'nonfiction-books', '📚', 'Non-fiction and educational', (SELECT id FROM categories WHERE slug = 'books-media'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Textbooks', 'الكتب الدراسية', 'textbooks', '📕', 'Educational textbooks', (SELECT id FROM categories WHERE slug = 'books-media'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Magazines', 'المجلات', 'magazines', '📰', 'Magazines and periodicals', (SELECT id FROM categories WHERE slug = 'books-media'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Movies & DVDs', 'الأفلام', 'movies-dvds', '🎬', 'Movies and video content', (SELECT id FROM categories WHERE slug = 'books-media'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Music', 'الموسيقى', 'music', '🎵', 'Music albums and CDs', (SELECT id FROM categories WHERE slug = 'books-media'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Baby & Kids
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Baby Gear', 'مستلزمات الرضع', 'baby-gear', '🍼', 'Strollers, car seats, etc.', (SELECT id FROM categories WHERE slug = 'baby-kids'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Baby Clothing', 'ملابس الرضع', 'baby-clothing', '👶', 'Clothes for babies', (SELECT id FROM categories WHERE slug = 'baby-kids'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Baby Toys', 'ألعاب الرضع', 'baby-toys', '🧸', 'Toys for babies', (SELECT id FROM categories WHERE slug = 'baby-kids'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Nursery & Furniture', 'غرفة الطفل والأثاث', 'nursery-furniture', '🛒', 'Baby room furniture', (SELECT id FROM categories WHERE slug = 'baby-kids'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Feeding', 'التغذية', 'feeding', '🍽️', 'Bottles, feeding accessories', (SELECT id FROM categories WHERE slug = 'baby-kids'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Pets
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Dogs', 'الكلاب', 'dogs', '🐕', 'Dog supplies', (SELECT id FROM categories WHERE slug = 'pets-animals'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Cats', 'القطط', 'cats', '🐈', 'Cat supplies', (SELECT id FROM categories WHERE slug = 'pets-animals'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Birds', 'الطيور', 'birds', '🦜', 'Bird supplies', (SELECT id FROM categories WHERE slug = 'pets-animals'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Fish & Aquariums', 'الأسماك وأحواض السمك', 'fish-aquariums', '🐠', 'Fish and aquarium supplies', (SELECT id FROM categories WHERE slug = 'pets-animals'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Small Pets', 'الحيوانات الصغيرة', 'small-pets', '🐹', 'Hamsters, rabbits, etc.', (SELECT id FROM categories WHERE slug = 'pets-animals'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Toys & Games
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Action Figures', 'شخصيات الأكشن', 'action-figures', '🦸', 'Action figures and dolls', (SELECT id FROM categories WHERE slug = 'toys-games'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Board Games', 'ألعاب الطاولة', 'board-games', '🎲', 'Board games and puzzles', (SELECT id FROM categories WHERE slug = 'toys-games'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Building Toys', 'ألعاب البناء', 'building-toys', '🧱', 'LEGO and building sets', (SELECT id FROM categories WHERE slug = 'toys-games'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Educational Toys', 'الألعاب التعليمية', 'educational-toys', '🔬', 'Learning and educational toys', (SELECT id FROM categories WHERE slug = 'toys-games'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Video Games', 'ألعاب الفيديو', 'video-games', '🕹️', 'Video games for all platforms', (SELECT id FROM categories WHERE slug = 'toys-games'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Outdoor Toys', 'ألعاب خارجية', 'outdoor-toys', '🪁', 'Outdoor play equipment', (SELECT id FROM categories WHERE slug = 'toys-games'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Jewelry & Watches
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Fine Jewelry', 'المجوهرات الفاخرة', 'fine-jewelry', '💍', 'Gold, silver, precious stones', (SELECT id FROM categories WHERE slug = 'jewelry-watches'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Costume Jewelry', 'مجوهرات الأزياء', 'costume-jewelry', '📿', 'Fashion jewelry', (SELECT id FROM categories WHERE slug = 'jewelry-watches'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Watches', 'الساعات', 'watches', '⌚', 'Wrist watches', (SELECT id FROM categories WHERE slug = 'jewelry-watches'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Rings', 'الخواتم', 'rings', '💎', 'Rings and bands', (SELECT id FROM categories WHERE slug = 'jewelry-watches'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Necklaces', 'القلائد', 'necklaces', '📿', 'Necklaces and pendants', (SELECT id FROM categories WHERE slug = 'jewelry-watches'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Art & Collectibles
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Paintings', 'اللوحات', 'paintings', '🖼️', 'Original paintings', (SELECT id FROM categories WHERE slug = 'art-collectibles'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Sculptures', 'المنحوتات', 'sculptures', '🗿', 'Sculptural art', (SELECT id FROM categories WHERE slug = 'art-collectibles'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Antiques', 'التحف', 'antiques', '🏺', 'Antique items', (SELECT id FROM categories WHERE slug = 'art-collectibles'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Coins & Currency', 'العملات', 'coins-currency', '🪙', 'Collectible coins', (SELECT id FROM categories WHERE slug = 'art-collectibles'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Stamps', 'الطوابع', 'stamps', '📮', 'Collectible stamps', (SELECT id FROM categories WHERE slug = 'art-collectibles'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Memorabilia', 'التذكارات', 'memorabilia', '🎖️', 'Sports and entertainment memorabilia', (SELECT id FROM categories WHERE slug = 'art-collectibles'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Office & Business
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Office Supplies', 'مستلزمات المكتب', 'office-supplies', '📎', 'General office supplies', (SELECT id FROM categories WHERE slug = 'office-business'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Office Furniture', 'أثاث المكتب', 'office-furniture', '🪑', 'Desks, chairs, etc.', (SELECT id FROM categories WHERE slug = 'office-business'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Printers & Scanners', 'الطابعات والماسحات', 'printers-scanners', '🖨️', 'Printing equipment', (SELECT id FROM categories WHERE slug = 'office-business'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Presentation Equipment', 'معدات العرض', 'presentation-equipment', '📽️', 'Projectors and presentation tools', (SELECT id FROM categories WHERE slug = 'office-business'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Musical Instruments
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Guitars', 'الجيتارات', 'guitars', '🎸', 'Acoustic and electric guitars', (SELECT id FROM categories WHERE slug = 'musical-instruments'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Pianos & Keyboards', 'البيانو والكيبورد', 'pianos-keyboards', '🎹', 'Pianos and keyboard instruments', (SELECT id FROM categories WHERE slug = 'musical-instruments'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Drums & Percussion', 'الطبول والإيقاع', 'drums-percussion', '🥁', 'Drums and percussion instruments', (SELECT id FROM categories WHERE slug = 'musical-instruments'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Wind Instruments', 'آلات النفخ', 'wind-instruments', '🎷', 'Woodwind and brass instruments', (SELECT id FROM categories WHERE slug = 'musical-instruments'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('String Instruments', 'الآلات الوترية', 'string-instruments', '🎻', 'Violins, cellos, etc.', (SELECT id FROM categories WHERE slug = 'musical-instruments'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('DJ Equipment', 'معدات الدي جي', 'dj-equipment', '🎚️', 'DJ and mixing equipment', (SELECT id FROM categories WHERE slug = 'musical-instruments'), 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Services
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Home Services', 'خدمات المنزل', 'home-services', '🏠', 'Cleaning, repairs, etc.', (SELECT id FROM categories WHERE slug = 'services'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Professional Services', 'خدمات مهنية', 'professional-services', '💼', 'Legal, financial, consulting', (SELECT id FROM categories WHERE slug = 'services'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Tutoring & Lessons', 'الدروس الخصوصية', 'tutoring-lessons', '📚', 'Education and tutoring', (SELECT id FROM categories WHERE slug = 'services'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Events & Entertainment', 'الفعاليات والترفيه', 'events-entertainment', '🎉', 'Event planning, DJs, etc.', (SELECT id FROM categories WHERE slug = 'services'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Tech Services', 'خدمات تقنية', 'tech-services', '💻', 'IT support, web development', (SELECT id FROM categories WHERE slug = 'services'), 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- Sub-Categories - Real Estate
-- ============================================================

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Apartments', 'الشقق', 'apartments', '🏢', 'Apartments for sale/rent', (SELECT id FROM categories WHERE slug = 'real-estate'), 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Villas & Houses', 'الفلل والمنازل', 'villas-houses', '🏡', 'Villas and houses', (SELECT id FROM categories WHERE slug = 'real-estate'), 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Commercial Properties', 'العقارات التجارية', 'commercial-properties', '🏬', 'Offices and commercial spaces', (SELECT id FROM categories WHERE slug = 'real-estate'), 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('Land', 'الأراضي', 'land', '🌍', 'Land plots', (SELECT id FROM categories WHERE slug = 'real-estate'), 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- ============================================================
-- Done! 20 Main + 85 Sub = 105 Categories
-- No hardcoded IDs - uses database auto-generation
-- ============================================================
