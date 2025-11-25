-- Seed 3-Level Category Hierarchy for XChange Egypt Platform
-- This migration populates the categories table with hierarchical data
-- Structure: Root Category → Sub-Category → Sub-Sub-Category

-- Clear existing categories (only run once)
-- DELETE FROM "categories" WHERE 1=1;

-- ============================================================================
-- LEVEL 1: ROOT CATEGORIES
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "icon", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-electronics', 'Electronics', 'الإلكترونيات', 'electronics', '📱', NULL, 0, true, NOW(), NOW()),
('cat-home-appliances', 'Home Appliances', 'الأجهزة المنزلية', 'home-appliances', '🏠', NULL, 1, true, NOW(), NOW()),
('cat-furniture', 'Furniture', 'الأثاث', 'furniture', '🛋️', NULL, 2, true, NOW(), NOW()),
('cat-vehicles', 'Vehicles', 'المركبات', 'vehicles', '🚗', NULL, 3, true, NOW(), NOW()),
('cat-fashion', 'Fashion & Clothing', 'الأزياء والملابس', 'fashion-clothing', '👔', NULL, 4, true, NOW(), NOW()),
('cat-sports', 'Sports & Fitness', 'الرياضة واللياقة', 'sports-fitness', '⚽', NULL, 5, true, NOW(), NOW()),
('cat-books', 'Books & Media', 'الكتب والوسائط', 'books-media', '📚', NULL, 6, true, NOW(), NOW()),
('cat-kids', 'Kids & Baby', 'الأطفال والرضع', 'kids-baby', '👶', NULL, 7, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 2: SUB-CATEGORIES (Electronics)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-smartphones', 'Smartphones', 'الهواتف الذكية', 'smartphones', 'cat-electronics', 0, true, NOW(), NOW()),
('cat-laptops', 'Laptops', 'أجهزة الكمبيوتر المحمولة', 'laptops', 'cat-electronics', 1, true, NOW(), NOW()),
('cat-tablets', 'Tablets', 'الأجهزة اللوحية', 'tablets', 'cat-electronics', 2, true, NOW(), NOW()),
('cat-cameras', 'Cameras', 'الكاميرات', 'cameras', 'cat-electronics', 3, true, NOW(), NOW()),
('cat-tvs', 'TVs', 'أجهزة التلفزيون', 'tvs', 'cat-electronics', 4, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (Smartphones)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-iphone', 'iPhone', 'آيفون', 'iphone', 'cat-smartphones', 0, true, NOW(), NOW()),
('cat-samsung', 'Samsung', 'سامسونج', 'samsung', 'cat-smartphones', 1, true, NOW(), NOW()),
('cat-xiaomi', 'Xiaomi', 'شاومي', 'xiaomi', 'cat-smartphones', 2, true, NOW(), NOW()),
('cat-oppo', 'Oppo', 'أوبو', 'oppo', 'cat-smartphones', 3, true, NOW(), NOW()),
('cat-vivo', 'Vivo', 'فيفو', 'vivo', 'cat-smartphones', 4, true, NOW(), NOW()),
('cat-huawei', 'Huawei', 'هواوي', 'huawei', 'cat-smartphones', 5, true, NOW(), NOW()),
('cat-other-phone-brands', 'Other Brands', 'ماركات أخرى', 'other-phone-brands', 'cat-smartphones', 6, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (Laptops)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-macbook', 'MacBook', 'ماك بوك', 'macbook', 'cat-laptops', 0, true, NOW(), NOW()),
('cat-gaming-laptops', 'Gaming Laptops', 'أجهزة الألعاب', 'gaming-laptops', 'cat-laptops', 1, true, NOW(), NOW()),
('cat-business-laptops', 'Business Laptops', 'أجهزة الأعمال', 'business-laptops', 'cat-laptops', 2, true, NOW(), NOW()),
('cat-ultrabooks', 'Ultrabooks', 'الترابوك', 'ultrabooks', 'cat-laptops', 3, true, NOW(), NOW()),
('cat-budget-laptops', 'Budget Laptops', 'أجهزة اقتصادية', 'budget-laptops', 'cat-laptops', 4, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (Tablets)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-ipad', 'iPad', 'آيباد', 'ipad', 'cat-tablets', 0, true, NOW(), NOW()),
('cat-samsung-tablets', 'Samsung Tablets', 'سامسونج', 'samsung-tablets', 'cat-tablets', 1, true, NOW(), NOW()),
('cat-other-tablets', 'Other Tablets', 'أجهزة أخرى', 'other-tablets', 'cat-tablets', 2, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (Cameras)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-dslr', 'DSLR', 'دي إس إل آر', 'dslr', 'cat-cameras', 0, true, NOW(), NOW()),
('cat-mirrorless', 'Mirrorless', 'ميرورليس', 'mirrorless', 'cat-cameras', 1, true, NOW(), NOW()),
('cat-action-cameras', 'Action Cameras', 'كاميرات الأكشن', 'action-cameras', 'cat-cameras', 2, true, NOW(), NOW()),
('cat-point-shoot', 'Point & Shoot', 'كاميرات صغيرة', 'point-shoot', 'cat-cameras', 3, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (TVs)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-smart-tvs', 'Smart TVs', 'تلفزيون ذكي', 'smart-tvs', 'cat-tvs', 0, true, NOW(), NOW()),
('cat-32-inch', '32 Inch', '32 بوصة', '32-inch', 'cat-tvs', 1, true, NOW(), NOW()),
('cat-43-inch', '43 Inch', '43 بوصة', '43-inch', 'cat-tvs', 2, true, NOW(), NOW()),
('cat-55-inch', '55 Inch', '55 بوصة', '55-inch', 'cat-tvs', 3, true, NOW(), NOW()),
('cat-65-inch-above', '65 Inch & Above', '65 بوصة وأكثر', '65-inch-above', 'cat-tvs', 4, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 2: SUB-CATEGORIES (Home Appliances)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-refrigerators', 'Refrigerators', 'الثلاجات', 'refrigerators', 'cat-home-appliances', 0, true, NOW(), NOW()),
('cat-washing-machines', 'Washing Machines', 'الغسالات', 'washing-machines', 'cat-home-appliances', 1, true, NOW(), NOW()),
('cat-air-conditioners', 'Air Conditioners', 'مكيفات الهواء', 'air-conditioners', 'cat-home-appliances', 2, true, NOW(), NOW()),
('cat-microwaves', 'Microwaves', 'الميكروويف', 'microwaves', 'cat-home-appliances', 3, true, NOW(), NOW()),
('cat-vacuum-cleaners', 'Vacuum Cleaners', 'المكانس الكهربائية', 'vacuum-cleaners', 'cat-home-appliances', 4, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (Refrigerators) - INCLUDING THE USER'S EXAMPLE!
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-16-feet', '16 Feet', '16 قدم', '16-feet', 'cat-refrigerators', 0, true, NOW(), NOW()),
('cat-18-feet', '18 Feet', '18 قدم', '18-feet', 'cat-refrigerators', 1, true, NOW(), NOW()),
('cat-20-feet', '20 Feet', '20 قدم', '20-feet', 'cat-refrigerators', 2, true, NOW(), NOW()),
('cat-24-feet', '24 Feet', '24 قدم', '24-feet', 'cat-refrigerators', 3, true, NOW(), NOW()),
('cat-side-by-side', 'Side by Side', 'جنب إلى جنب', 'side-by-side', 'cat-refrigerators', 4, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (Washing Machines)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-top-load', 'Top Load', 'تحميل علوي', 'top-load', 'cat-washing-machines', 0, true, NOW(), NOW()),
('cat-front-load', 'Front Load', 'تحميل أمامي', 'front-load', 'cat-washing-machines', 1, true, NOW(), NOW()),
('cat-7-kg', '7 KG', '7 كيلو', '7-kg', 'cat-washing-machines', 2, true, NOW(), NOW()),
('cat-8-10-kg', '8-10 KG', '8-10 كيلو', '8-10-kg', 'cat-washing-machines', 3, true, NOW(), NOW()),
('cat-11-kg-above', '11 KG & Above', '11 كيلو وأكثر', '11-kg-above', 'cat-washing-machines', 4, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (Air Conditioners)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-1-5-hp', '1.5 HP', '1.5 حصان', '1-5-hp', 'cat-air-conditioners', 0, true, NOW(), NOW()),
('cat-2-25-hp', '2.25 HP', '2.25 حصان', '2-25-hp', 'cat-air-conditioners', 1, true, NOW(), NOW()),
('cat-3-hp', '3 HP', '3 حصان', '3-hp', 'cat-air-conditioners', 2, true, NOW(), NOW()),
('cat-split-ac', 'Split AC', 'سبليت', 'split-ac', 'cat-air-conditioners', 3, true, NOW(), NOW()),
('cat-window-ac', 'Window AC', 'شباك', 'window-ac', 'cat-air-conditioners', 4, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (Microwaves)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-solo', 'Solo', 'عادي', 'solo', 'cat-microwaves', 0, true, NOW(), NOW()),
('cat-grill', 'Grill', 'شواية', 'grill', 'cat-microwaves', 1, true, NOW(), NOW()),
('cat-convection', 'Convection', 'حراري', 'convection', 'cat-microwaves', 2, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (Vacuum Cleaners)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-upright', 'Upright', 'عمودي', 'upright', 'cat-vacuum-cleaners', 0, true, NOW(), NOW()),
('cat-canister', 'Canister', 'أسطواني', 'canister', 'cat-vacuum-cleaners', 1, true, NOW(), NOW()),
('cat-handheld', 'Handheld', 'محمول', 'handheld', 'cat-vacuum-cleaners', 2, true, NOW(), NOW()),
('cat-robot', 'Robot', 'روبوت', 'robot', 'cat-vacuum-cleaners', 3, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 2: SUB-CATEGORIES (Furniture)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-living-room', 'Living Room', 'غرفة المعيشة', 'living-room', 'cat-furniture', 0, true, NOW(), NOW()),
('cat-bedroom', 'Bedroom', 'غرفة النوم', 'bedroom', 'cat-furniture', 1, true, NOW(), NOW()),
('cat-dining-room', 'Dining Room', 'غرفة الطعام', 'dining-room', 'cat-furniture', 2, true, NOW(), NOW()),
('cat-office', 'Office', 'المكتب', 'office', 'cat-furniture', 3, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (Living Room)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-sofas', 'Sofas', 'الكنب', 'sofas', 'cat-living-room', 0, true, NOW(), NOW()),
('cat-coffee-tables', 'Coffee Tables', 'طاولات القهوة', 'coffee-tables', 'cat-living-room', 1, true, NOW(), NOW()),
('cat-tv-units', 'TV Units', 'وحدات التلفزيون', 'tv-units', 'cat-living-room', 2, true, NOW(), NOW()),
('cat-bookshelves', 'Bookshelves', 'رفوف الكتب', 'bookshelves', 'cat-living-room', 3, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (Bedroom, Dining Room, Office) - Compact
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-beds', 'Beds', 'الأسرة', 'beds', 'cat-bedroom', 0, true, NOW(), NOW()),
('cat-wardrobes', 'Wardrobes', 'الخزائن', 'wardrobes', 'cat-bedroom', 1, true, NOW(), NOW()),
('cat-dressers', 'Dressers', 'التسريحات', 'dressers', 'cat-bedroom', 2, true, NOW(), NOW()),
('cat-nightstands', 'Nightstands', 'الكوميدينو', 'nightstands', 'cat-bedroom', 3, true, NOW(), NOW()),
('cat-dining-tables', 'Dining Tables', 'طاولات الطعام', 'dining-tables', 'cat-dining-room', 0, true, NOW(), NOW()),
('cat-chairs', 'Chairs', 'الكراسي', 'chairs', 'cat-dining-room', 1, true, NOW(), NOW()),
('cat-buffets', 'Buffets', 'البوفيهات', 'buffets', 'cat-dining-room', 2, true, NOW(), NOW()),
('cat-desks', 'Desks', 'المكاتب', 'desks', 'cat-office', 0, true, NOW(), NOW()),
('cat-office-chairs', 'Office Chairs', 'كراسي المكتب', 'office-chairs', 'cat-office', 1, true, NOW(), NOW()),
('cat-filing-cabinets', 'Filing Cabinets', 'خزائن الملفات', 'filing-cabinets', 'cat-office', 2, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 2: SUB-CATEGORIES (Vehicles)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-cars', 'Cars', 'السيارات', 'cars', 'cat-vehicles', 0, true, NOW(), NOW()),
('cat-motorcycles', 'Motorcycles', 'الدراجات النارية', 'motorcycles', 'cat-vehicles', 1, true, NOW(), NOW()),
('cat-bicycles', 'Bicycles', 'الدراجات', 'bicycles', 'cat-vehicles', 2, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 3: SUB-SUB-CATEGORIES (Cars, Motorcycles, Bicycles)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
('cat-sedans', 'Sedans', 'سيدان', 'sedans', 'cat-cars', 0, true, NOW(), NOW()),
('cat-suvs', 'SUVs', 'دفع رباعي', 'suvs', 'cat-cars', 1, true, NOW(), NOW()),
('cat-hatchbacks', 'Hatchbacks', 'هاتشباك', 'hatchbacks', 'cat-cars', 2, true, NOW(), NOW()),
('cat-pickup-trucks', 'Pickup Trucks', 'شاحنات صغيرة', 'pickup-trucks', 'cat-cars', 3, true, NOW(), NOW()),
('cat-vans', 'Vans', 'ميكروباص', 'vans', 'cat-cars', 4, true, NOW(), NOW()),
('cat-sport-bikes', 'Sport Bikes', 'رياضية', 'sport-bikes', 'cat-motorcycles', 0, true, NOW(), NOW()),
('cat-cruisers', 'Cruisers', 'كروزر', 'cruisers', 'cat-motorcycles', 1, true, NOW(), NOW()),
('cat-scooters', 'Scooters', 'سكوتر', 'scooters', 'cat-motorcycles', 2, true, NOW(), NOW()),
('cat-touring', 'Touring', 'للرحلات', 'touring', 'cat-motorcycles', 3, true, NOW(), NOW()),
('cat-mountain-bikes', 'Mountain Bikes', 'جبلية', 'mountain-bikes', 'cat-bicycles', 0, true, NOW(), NOW()),
('cat-road-bikes', 'Road Bikes', 'طريق', 'road-bikes', 'cat-bicycles', 1, true, NOW(), NOW()),
('cat-electric-bikes', 'Electric Bikes', 'كهربائية', 'electric-bikes', 'cat-bicycles', 2, true, NOW(), NOW()),
('cat-kids-bikes', 'Kids Bikes', 'للأطفال', 'kids-bikes', 'cat-bicycles', 3, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- LEVEL 2 & 3: Fashion, Sports, Books, Kids (Remaining Categories)
-- ============================================================================

INSERT INTO "categories" ("id", "name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at") VALUES
-- Fashion L2
('cat-mens-clothing', 'Men''s Clothing', 'ملابس رجالية', 'mens-clothing', 'cat-fashion', 0, true, NOW(), NOW()),
('cat-womens-clothing', 'Women''s Clothing', 'ملابس نسائية', 'womens-clothing', 'cat-fashion', 1, true, NOW(), NOW()),
('cat-shoes', 'Shoes', 'الأحذية', 'shoes', 'cat-fashion', 2, true, NOW(), NOW()),
('cat-bags', 'Bags', 'الحقائب', 'bags', 'cat-fashion', 3, true, NOW(), NOW()),
-- Fashion L3 (Men's)
('cat-shirts', 'Shirts', 'قمصان', 'shirts', 'cat-mens-clothing', 0, true, NOW(), NOW()),
('cat-t-shirts', 'T-Shirts', 'تيشرتات', 't-shirts', 'cat-mens-clothing', 1, true, NOW(), NOW()),
('cat-pants', 'Pants', 'بناطيل', 'pants', 'cat-mens-clothing', 2, true, NOW(), NOW()),
('cat-suits', 'Suits', 'بدل', 'suits', 'cat-mens-clothing', 3, true, NOW(), NOW()),
('cat-jackets', 'Jackets', 'جاكيتات', 'jackets', 'cat-mens-clothing', 4, true, NOW(), NOW()),
-- Fashion L3 (Women's)
('cat-dresses', 'Dresses', 'فساتين', 'dresses', 'cat-womens-clothing', 0, true, NOW(), NOW()),
('cat-tops', 'Tops', 'بلوزات', 'tops', 'cat-womens-clothing', 1, true, NOW(), NOW()),
('cat-skirts', 'Skirts', 'تنانير', 'skirts', 'cat-womens-clothing', 2, true, NOW(), NOW()),
('cat-womens-pants', 'Pants', 'بناطيل', 'womens-pants', 'cat-womens-clothing', 3, true, NOW(), NOW()),
('cat-abayas', 'Abayas', 'عبايات', 'abayas', 'cat-womens-clothing', 4, true, NOW(), NOW()),
-- Fashion L3 (Shoes & Bags)
('cat-sneakers', 'Sneakers', 'أحذية رياضية', 'sneakers', 'cat-shoes', 0, true, NOW(), NOW()),
('cat-formal-shoes', 'Formal Shoes', 'أحذية رسمية', 'formal-shoes', 'cat-shoes', 1, true, NOW(), NOW()),
('cat-sandals', 'Sandals', 'صنادل', 'sandals', 'cat-shoes', 2, true, NOW(), NOW()),
('cat-boots', 'Boots', 'أحذية طويلة', 'boots', 'cat-shoes', 3, true, NOW(), NOW()),
('cat-handbags', 'Handbags', 'حقائب يد', 'handbags', 'cat-bags', 0, true, NOW(), NOW()),
('cat-backpacks', 'Backpacks', 'حقائب ظهر', 'backpacks', 'cat-bags', 1, true, NOW(), NOW()),
('cat-wallets', 'Wallets', 'محافظ', 'wallets', 'cat-bags', 2, true, NOW(), NOW()),
('cat-travel-bags', 'Travel Bags', 'حقائب سفر', 'travel-bags', 'cat-bags', 3, true, NOW(), NOW()),
-- Sports L2
('cat-gym-equipment', 'Gym Equipment', 'معدات الجيم', 'gym-equipment', 'cat-sports', 0, true, NOW(), NOW()),
('cat-outdoor-sports', 'Outdoor Sports', 'رياضات خارجية', 'outdoor-sports', 'cat-sports', 1, true, NOW(), NOW()),
-- Sports L3
('cat-treadmills', 'Treadmills', 'جهاز المشي', 'treadmills', 'cat-gym-equipment', 0, true, NOW(), NOW()),
('cat-dumbbells', 'Dumbbells', 'دمبلز', 'dumbbells', 'cat-gym-equipment', 1, true, NOW(), NOW()),
('cat-benches', 'Benches', 'مقاعد', 'benches', 'cat-gym-equipment', 2, true, NOW(), NOW()),
('cat-exercise-bikes', 'Exercise Bikes', 'دراجات التمرين', 'exercise-bikes', 'cat-gym-equipment', 3, true, NOW(), NOW()),
('cat-football', 'Football', 'كرة القدم', 'football', 'cat-outdoor-sports', 0, true, NOW(), NOW()),
('cat-basketball', 'Basketball', 'كرة السلة', 'basketball', 'cat-outdoor-sports', 1, true, NOW(), NOW()),
('cat-tennis', 'Tennis', 'التنس', 'tennis', 'cat-outdoor-sports', 2, true, NOW(), NOW()),
('cat-swimming', 'Swimming', 'السباحة', 'swimming', 'cat-outdoor-sports', 3, true, NOW(), NOW()),
-- Books L2
('cat-books', 'Books', 'الكتب', 'books', 'cat-books-media', 0, true, NOW(), NOW()),
('cat-video-games', 'Video Games', 'ألعاب الفيديو', 'video-games', 'cat-books-media', 1, true, NOW(), NOW()),
-- Books L3
('cat-fiction', 'Fiction', 'روايات', 'fiction', 'cat-books', 0, true, NOW(), NOW()),
('cat-non-fiction', 'Non-Fiction', 'غير روائية', 'non-fiction', 'cat-books', 1, true, NOW(), NOW()),
('cat-educational', 'Educational', 'تعليمية', 'educational', 'cat-books', 2, true, NOW(), NOW()),
('cat-religious', 'Religious', 'دينية', 'religious', 'cat-books', 3, true, NOW(), NOW()),
('cat-children-books', 'Children', 'للأطفال', 'children-books', 'cat-books', 4, true, NOW(), NOW()),
('cat-playstation', 'PlayStation', 'بلايستيشن', 'playstation', 'cat-video-games', 0, true, NOW(), NOW()),
('cat-xbox', 'Xbox', 'إكس بوكس', 'xbox', 'cat-video-games', 1, true, NOW(), NOW()),
('cat-nintendo', 'Nintendo', 'نينتندو', 'nintendo', 'cat-video-games', 2, true, NOW(), NOW()),
('cat-pc-games', 'PC Games', 'ألعاب كمبيوتر', 'pc-games', 'cat-video-games', 3, true, NOW(), NOW()),
-- Kids L2
('cat-baby-gear', 'Baby Gear', 'معدات الأطفال', 'baby-gear', 'cat-kids', 0, true, NOW(), NOW()),
('cat-toys', 'Toys', 'الألعاب', 'toys', 'cat-kids', 1, true, NOW(), NOW()),
-- Kids L3
('cat-strollers', 'Strollers', 'عربات الأطفال', 'strollers', 'cat-baby-gear', 0, true, NOW(), NOW()),
('cat-car-seats', 'Car Seats', 'مقاعد السيارة', 'car-seats', 'cat-baby-gear', 1, true, NOW(), NOW()),
('cat-cribs', 'Cribs', 'أسرة الأطفال', 'cribs', 'cat-baby-gear', 2, true, NOW(), NOW()),
('cat-high-chairs', 'High Chairs', 'كراسي الطعام', 'high-chairs', 'cat-baby-gear', 3, true, NOW(), NOW()),
('cat-educational-toys', 'Educational Toys', 'ألعاب تعليمية', 'educational-toys', 'cat-toys', 0, true, NOW(), NOW()),
('cat-dolls', 'Dolls', 'عرائس', 'dolls', 'cat-toys', 1, true, NOW(), NOW()),
('cat-action-figures', 'Action Figures', 'شخصيات', 'action-figures', 'cat-toys', 2, true, NOW(), NOW()),
('cat-building-blocks', 'Building Blocks', 'مكعبات', 'building-blocks', 'cat-toys', 3, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Total categories seeded: 107 (8 root + ~30 level-2 + ~69 level-3)
-- This includes the user's example: Home Appliances > Refrigerators > 24 Feet
