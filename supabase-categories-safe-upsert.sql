-- ============================================================
-- Xchange Egypt - Comprehensive Categories Catalog
-- Safe UPSERT - Updates existing categories, adds new ones
-- Does NOT delete any existing data
-- ============================================================
-- Instructions:
-- 1. Open Supabase SQL Editor
-- 2. Copy this entire file
-- 3. Paste and click "Run"
-- ============================================================

-- MAIN CATEGORIES (Level 1)
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-electronics', 'Electronics & Computers', 'الإلكترونيات والكمبيوتر', 'electronics-computers', '💻', 'Electronic devices, computers, and accessories', NULL, 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-fashion', 'Fashion & Clothing', 'الأزياء والملابس', 'fashion-clothing', '👗', 'Clothing, shoes, and fashion accessories', NULL, 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-home', 'Home & Garden', 'المنزل والحديقة', 'home-garden', '🏠', 'Home decor, furniture, and garden supplies', NULL, 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-vehicles', 'Vehicles & Parts', 'السيارات وقطع الغيار', 'vehicles-parts', '🚗', 'Cars, motorcycles, and automotive parts', NULL, 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-sports', 'Sports & Outdoors', 'الرياضة والأنشطة الخارجية', 'sports-outdoors', '⚽', 'Sports equipment and outdoor gear', NULL, 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-toys', 'Toys & Games', 'الألعاب والهوايات', 'toys-games', '🎮', 'Toys, games, and hobbies', NULL, 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-health', 'Health & Beauty', 'الصحة والجمال', 'health-beauty', '💄', 'Health products and beauty items', NULL, 7, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-books', 'Books & Media', 'الكتب والوسائط', 'books-media', '📚', 'Books, music, movies, and digital media', NULL, 8, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-baby', 'Baby & Kids', 'الأطفال والرضع', 'baby-kids', '👶', 'Baby products and kids items', NULL, 9, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-pets', 'Pets & Animals', 'الحيوانات الأليفة', 'pets-animals', '🐕', 'Pet supplies and animal products', NULL, 10, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-food', 'Food & Beverages', 'الأغذية والمشروبات', 'food-beverages', '🍎', 'Food products and drinks', NULL, 11, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-jewelry', 'Jewelry & Watches', 'المجوهرات والساعات', 'jewelry-watches', '💎', 'Jewelry, watches, and accessories', NULL, 12, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-art', 'Art & Collectibles', 'الفن والمقتنيات', 'art-collectibles', '🎨', 'Art, antiques, and collectible items', NULL, 13, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-office', 'Office & Business', 'المكتب والأعمال', 'office-business', '🏢', 'Office supplies and business equipment', NULL, 14, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-industrial', 'Industrial & Scientific', 'الصناعي والعلمي', 'industrial-scientific', '🔧', 'Industrial equipment and scientific tools', NULL, 15, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-real-estate', 'Real Estate', 'العقارات', 'real-estate', '🏘️', 'Properties and real estate', NULL, 16, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-services', 'Services', 'الخدمات', 'services', '🛠️', 'Professional and personal services', NULL, 17, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-musical', 'Musical Instruments', 'الآلات الموسيقية', 'musical-instruments', '🎸', 'Musical instruments and audio equipment', NULL, 18, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-travel', 'Travel & Luggage', 'السفر والحقائب', 'travel-luggage', '🧳', 'Travel accessories and luggage', NULL, 19, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-other', 'Other', 'أخرى', 'other', '📦', 'Miscellaneous items', NULL, 20, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Electronics
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-phones', 'Mobile Phones', 'الهواتف المحمولة', 'mobile-phones', '📱', 'Smartphones and mobile devices', 'cat-electronics', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-laptops', 'Laptops', 'الحواسيب المحمولة', 'laptops', '💻', 'Laptop computers', 'cat-electronics', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-desktops', 'Desktop Computers', 'الحواسيب المكتبية', 'desktop-computers', '🖥️', 'Desktop PCs and workstations', 'cat-electronics', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-tablets', 'Tablets', 'الأجهزة اللوحية', 'tablets', '📲', 'Tablet devices', 'cat-electronics', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-tvs', 'TVs & Monitors', 'التلفزيونات والشاشات', 'tvs-monitors', '📺', 'Televisions and display monitors', 'cat-electronics', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-cameras', 'Cameras & Photography', 'الكاميرات والتصوير', 'cameras-photography', '📷', 'Digital cameras and photography equipment', 'cat-electronics', 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-audio', 'Audio & Headphones', 'الصوتيات والسماعات', 'audio-headphones', '🎧', 'Audio equipment and headphones', 'cat-electronics', 7, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-gaming', 'Gaming & Consoles', 'الألعاب والأجهزة', 'gaming-consoles', '🎮', 'Gaming consoles and accessories', 'cat-electronics', 8, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-wearables', 'Wearables & Smartwatches', 'الأجهزة القابلة للارتداء', 'wearables-smartwatches', '⌚', 'Smartwatches and fitness trackers', 'cat-electronics', 9, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-accessories-elec', 'Electronics Accessories', 'إكسسوارات إلكترونية', 'electronics-accessories', '🔌', 'Cables, chargers, and accessories', 'cat-electronics', 10, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Fashion
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-mens-clothing', 'Mens Clothing', 'ملابس رجالية', 'mens-clothing', '👔', 'Clothing for men', 'cat-fashion', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-womens-clothing', 'Womens Clothing', 'ملابس نسائية', 'womens-clothing', '👗', 'Clothing for women', 'cat-fashion', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-kids-clothing', 'Kids Clothing', 'ملابس أطفال', 'kids-clothing', '🧒', 'Clothing for children', 'cat-fashion', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-shoes', 'Shoes & Footwear', 'الأحذية', 'shoes-footwear', '👟', 'Shoes and footwear', 'cat-fashion', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-bags', 'Bags & Handbags', 'الحقائب', 'bags-handbags', '👜', 'Bags and handbags', 'cat-fashion', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-accessories-fashion', 'Fashion Accessories', 'إكسسوارات الموضة', 'fashion-accessories', '🧣', 'Scarves, belts, and accessories', 'cat-fashion', 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-sportswear', 'Sportswear', 'الملابس الرياضية', 'sportswear', '🏃', 'Athletic and sports clothing', 'cat-fashion', 7, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-traditional', 'Traditional Clothing', 'الملابس التقليدية', 'traditional-clothing', '🥻', 'Traditional and cultural clothing', 'cat-fashion', 8, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Home & Garden
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-furniture', 'Furniture', 'الأثاث', 'furniture', '🛋️', 'Home furniture', 'cat-home', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-kitchen', 'Kitchen & Dining', 'المطبخ والطعام', 'kitchen-dining', '🍳', 'Kitchen appliances and dining', 'cat-home', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-bedding', 'Bedding & Bath', 'المفروشات والحمام', 'bedding-bath', '🛏️', 'Bedding, linens, and bath items', 'cat-home', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-decor', 'Home Decor', 'ديكور المنزل', 'home-decor', '🖼️', 'Decorative items for home', 'cat-home', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-lighting', 'Lighting', 'الإضاءة', 'lighting', '💡', 'Lamps and lighting fixtures', 'cat-home', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-garden', 'Garden & Outdoor', 'الحديقة والخارج', 'garden-outdoor', '🌳', 'Garden supplies and outdoor furniture', 'cat-home', 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-appliances', 'Home Appliances', 'الأجهزة المنزلية', 'home-appliances', '🔌', 'Major and small appliances', 'cat-home', 7, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-tools', 'Tools & Hardware', 'الأدوات والمعدات', 'tools-hardware', '🔨', 'Hand tools and hardware', 'cat-home', 8, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Vehicles
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-cars', 'Cars', 'السيارات', 'cars', '🚗', 'Automobiles and cars', 'cat-vehicles', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-motorcycles', 'Motorcycles', 'الدراجات النارية', 'motorcycles', '🏍️', 'Motorcycles and scooters', 'cat-vehicles', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-auto-parts', 'Auto Parts', 'قطع غيار السيارات', 'auto-parts', '🔧', 'Car parts and accessories', 'cat-vehicles', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-bicycles', 'Bicycles', 'الدراجات الهوائية', 'bicycles', '🚲', 'Bikes and cycling gear', 'cat-vehicles', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-boats', 'Boats & Marine', 'القوارب والبحرية', 'boats-marine', '🚤', 'Boats and marine equipment', 'cat-vehicles', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-trucks', 'Trucks & Commercial', 'الشاحنات والتجارية', 'trucks-commercial', '🚛', 'Trucks and commercial vehicles', 'cat-vehicles', 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Sports
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-fitness', 'Fitness Equipment', 'معدات اللياقة', 'fitness-equipment', '🏋️', 'Gym and fitness gear', 'cat-sports', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-team-sports', 'Team Sports', 'الرياضات الجماعية', 'team-sports', '⚽', 'Football, basketball, etc.', 'cat-sports', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-water-sports', 'Water Sports', 'الرياضات المائية', 'water-sports', '🏊', 'Swimming and water activities', 'cat-sports', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-camping', 'Camping & Hiking', 'التخييم والمشي', 'camping-hiking', '⛺', 'Outdoor camping gear', 'cat-sports', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-cycling', 'Cycling', 'ركوب الدراجات', 'cycling', '🚴', 'Cycling gear and accessories', 'cat-sports', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-fishing', 'Fishing', 'الصيد', 'fishing', '🎣', 'Fishing equipment', 'cat-sports', 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Health & Beauty
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-skincare', 'Skincare', 'العناية بالبشرة', 'skincare', '🧴', 'Skin care products', 'cat-health', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-makeup', 'Makeup', 'المكياج', 'makeup', '💄', 'Cosmetics and makeup', 'cat-health', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-haircare', 'Hair Care', 'العناية بالشعر', 'hair-care', '💇', 'Hair care products', 'cat-health', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-fragrances', 'Fragrances', 'العطور', 'fragrances', '🌸', 'Perfumes and fragrances', 'cat-health', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-personal-care', 'Personal Care', 'العناية الشخصية', 'personal-care', '🪥', 'Personal hygiene products', 'cat-health', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-medical', 'Medical Supplies', 'المستلزمات الطبية', 'medical-supplies', '💊', 'Health and medical items', 'cat-health', 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Books & Media
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-books-fiction', 'Fiction Books', 'كتب الروايات', 'fiction-books', '📖', 'Fiction and novels', 'cat-books', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-books-nonfiction', 'Non-Fiction Books', 'كتب غير روائية', 'nonfiction-books', '📚', 'Non-fiction and educational', 'cat-books', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-textbooks', 'Textbooks', 'الكتب الدراسية', 'textbooks', '📕', 'Educational textbooks', 'cat-books', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-magazines', 'Magazines', 'المجلات', 'magazines', '📰', 'Magazines and periodicals', 'cat-books', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-movies', 'Movies & DVDs', 'الأفلام', 'movies-dvds', '🎬', 'Movies and video content', 'cat-books', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-music', 'Music', 'الموسيقى', 'music', '🎵', 'Music albums and CDs', 'cat-books', 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Baby & Kids
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-baby-gear', 'Baby Gear', 'مستلزمات الرضع', 'baby-gear', '🍼', 'Strollers, car seats, etc.', 'cat-baby', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-baby-clothing', 'Baby Clothing', 'ملابس الرضع', 'baby-clothing', '👶', 'Clothes for babies', 'cat-baby', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-baby-toys', 'Baby Toys', 'ألعاب الرضع', 'baby-toys', '🧸', 'Toys for babies', 'cat-baby', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-nursery', 'Nursery & Furniture', 'غرفة الطفل والأثاث', 'nursery-furniture', '🛒', 'Baby room furniture', 'cat-baby', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-feeding', 'Feeding', 'التغذية', 'feeding', '🍽️', 'Bottles, feeding accessories', 'cat-baby', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Pets
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-dogs', 'Dogs', 'الكلاب', 'dogs', '🐕', 'Dog supplies', 'cat-pets', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-cats', 'Cats', 'القطط', 'cats', '🐈', 'Cat supplies', 'cat-pets', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-birds', 'Birds', 'الطيور', 'birds', '🦜', 'Bird supplies', 'cat-pets', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-fish', 'Fish & Aquariums', 'الأسماك وأحواض السمك', 'fish-aquariums', '🐠', 'Fish and aquarium supplies', 'cat-pets', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-small-pets', 'Small Pets', 'الحيوانات الصغيرة', 'small-pets', '🐹', 'Hamsters, rabbits, etc.', 'cat-pets', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Toys & Games
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-action-figures', 'Action Figures', 'شخصيات الأكشن', 'action-figures', '🦸', 'Action figures and dolls', 'cat-toys', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-board-games', 'Board Games', 'ألعاب الطاولة', 'board-games', '🎲', 'Board games and puzzles', 'cat-toys', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-building-toys', 'Building Toys', 'ألعاب البناء', 'building-toys', '🧱', 'LEGO and building sets', 'cat-toys', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-educational-toys', 'Educational Toys', 'الألعاب التعليمية', 'educational-toys', '🔬', 'Learning and educational toys', 'cat-toys', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-video-games', 'Video Games', 'ألعاب الفيديو', 'video-games', '🕹️', 'Video games for all platforms', 'cat-toys', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-outdoor-toys', 'Outdoor Toys', 'ألعاب خارجية', 'outdoor-toys', '🪁', 'Outdoor play equipment', 'cat-toys', 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Jewelry & Watches
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-fine-jewelry', 'Fine Jewelry', 'المجوهرات الفاخرة', 'fine-jewelry', '💍', 'Gold, silver, precious stones', 'cat-jewelry', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-costume-jewelry', 'Costume Jewelry', 'مجوهرات الأزياء', 'costume-jewelry', '📿', 'Fashion jewelry', 'cat-jewelry', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-watches', 'Watches', 'الساعات', 'watches', '⌚', 'Wrist watches', 'cat-jewelry', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-rings', 'Rings', 'الخواتم', 'rings', '💎', 'Rings and bands', 'cat-jewelry', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-necklaces', 'Necklaces', 'القلائد', 'necklaces', '📿', 'Necklaces and pendants', 'cat-jewelry', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Art & Collectibles
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-paintings', 'Paintings', 'اللوحات', 'paintings', '🖼️', 'Original paintings', 'cat-art', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-sculptures', 'Sculptures', 'المنحوتات', 'sculptures', '🗿', 'Sculptural art', 'cat-art', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-antiques', 'Antiques', 'التحف', 'antiques', '🏺', 'Antique items', 'cat-art', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-coins', 'Coins & Currency', 'العملات', 'coins-currency', '🪙', 'Collectible coins', 'cat-art', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-stamps', 'Stamps', 'الطوابع', 'stamps', '📮', 'Collectible stamps', 'cat-art', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-memorabilia', 'Memorabilia', 'التذكارات', 'memorabilia', '🎖️', 'Sports and entertainment memorabilia', 'cat-art', 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Office & Business
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-office-supplies', 'Office Supplies', 'مستلزمات المكتب', 'office-supplies', '📎', 'General office supplies', 'cat-office', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-office-furniture', 'Office Furniture', 'أثاث المكتب', 'office-furniture', '🪑', 'Desks, chairs, etc.', 'cat-office', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-printers', 'Printers & Scanners', 'الطابعات والماسحات', 'printers-scanners', '🖨️', 'Printing equipment', 'cat-office', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-presentation', 'Presentation Equipment', 'معدات العرض', 'presentation-equipment', '📽️', 'Projectors and presentation tools', 'cat-office', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Musical Instruments
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-guitars', 'Guitars', 'الجيتارات', 'guitars', '🎸', 'Acoustic and electric guitars', 'cat-musical', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-pianos', 'Pianos & Keyboards', 'البيانو والكيبورد', 'pianos-keyboards', '🎹', 'Pianos and keyboard instruments', 'cat-musical', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-drums', 'Drums & Percussion', 'الطبول والإيقاع', 'drums-percussion', '🥁', 'Drums and percussion instruments', 'cat-musical', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-wind', 'Wind Instruments', 'آلات النفخ', 'wind-instruments', '🎷', 'Woodwind and brass instruments', 'cat-musical', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-string', 'String Instruments', 'الآلات الوترية', 'string-instruments', '🎻', 'Violins, cellos, etc.', 'cat-musical', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-dj-equipment', 'DJ Equipment', 'معدات الدي جي', 'dj-equipment', '🎚️', 'DJ and mixing equipment', 'cat-musical', 6, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Services
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-home-services', 'Home Services', 'خدمات المنزل', 'home-services', '🏠', 'Cleaning, repairs, etc.', 'cat-services', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-professional', 'Professional Services', 'خدمات مهنية', 'professional-services', '💼', 'Legal, financial, consulting', 'cat-services', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-tutoring', 'Tutoring & Lessons', 'الدروس الخصوصية', 'tutoring-lessons', '📚', 'Education and tutoring', 'cat-services', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-events', 'Events & Entertainment', 'الفعاليات والترفيه', 'events-entertainment', '🎉', 'Event planning, DJs, etc.', 'cat-services', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-tech-services', 'Tech Services', 'خدمات تقنية', 'tech-services', '💻', 'IT support, web development', 'cat-services', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- SUB-CATEGORIES (Level 2) - Real Estate
-- ============================================================

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-apartments', 'Apartments', 'الشقق', 'apartments', '🏢', 'Apartments for sale/rent', 'cat-real-estate', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-villas', 'Villas & Houses', 'الفلل والمنازل', 'villas-houses', '🏡', 'Villas and houses', 'cat-real-estate', 2, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-commercial-re', 'Commercial Properties', 'العقارات التجارية', 'commercial-properties', '🏬', 'Offices and commercial spaces', 'cat-real-estate', 3, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

INSERT INTO categories (id, name_en, name_ar, slug, icon, description, parent_id, "order", is_active, created_at, updated_at)
VALUES ('cat-land', 'Land', 'الأراضي', 'land', '🌍', 'Land plots', 'cat-real-estate', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon, description = EXCLUDED.description, parent_id = EXCLUDED.parent_id, "order" = EXCLUDED."order", updated_at = NOW();

-- ============================================================
-- Summary: 20 Main Categories + 85 Sub-Categories = 105 Total
-- All use ON CONFLICT (slug) for safe upsert
-- ============================================================
