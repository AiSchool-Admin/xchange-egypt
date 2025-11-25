-- Professional 3-Level Category Seeding using PostgreSQL CTEs
-- This migration properly handles UUID generation and foreign key constraints

-- Only seed if categories table is empty (idempotent)
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM "categories") = 0 THEN

    -- Step 1: Insert Root Categories and capture their IDs
    WITH root_cats AS (
      INSERT INTO "categories" ("name_en", "name_ar", "slug", "icon", "parent_id", "order", "is_active", "created_at", "updated_at")
      VALUES
        ('Electronics', 'الإلكترونيات', 'electronics', '📱', NULL, 0, true, NOW(), NOW()),
        ('Home Appliances', 'الأجهزة المنزلية', 'home-appliances', '🏠', NULL, 1, true, NOW(), NOW()),
        ('Furniture', 'الأثاث', 'furniture', '🛋️', NULL, 2, true, NOW(), NOW()),
        ('Vehicles', 'المركبات', 'vehicles', '🚗', NULL, 3, true, NOW(), NOW()),
        ('Fashion & Clothing', 'الأزياء والملابس', 'fashion-clothing', '👔', NULL, 4, true, NOW(), NOW()),
        ('Sports & Fitness', 'الرياضة واللياقة', 'sports-fitness', '⚽', NULL, 5, true, NOW(), NOW()),
        ('Books & Media', 'الكتب والوسائط', 'books-media', '📚', NULL, 6, true, NOW(), NOW()),
        ('Kids & Baby', 'الأطفال والرضع', 'kids-baby', '👶', NULL, 7, true, NOW(), NOW())
      RETURNING "id", "slug"
    ),

    -- Step 2: Insert Level 2 Categories (Sub-Categories)
    level2_cats AS (
      INSERT INTO "categories" ("name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at")
      SELECT * FROM (
        -- Electronics Sub-Categories
        SELECT 'Smartphones', 'الهواتف الذكية', 'smartphones', (SELECT id FROM root_cats WHERE slug='electronics'), 0, true, NOW(), NOW() UNION ALL
        SELECT 'Laptops', 'أجهزة الكمبيوتر المحمولة', 'laptops', (SELECT id FROM root_cats WHERE slug='electronics'), 1, true, NOW(), NOW() UNION ALL
        SELECT 'Tablets', 'الأجهزة اللوحية', 'tablets', (SELECT id FROM root_cats WHERE slug='electronics'), 2, true, NOW(), NOW() UNION ALL
        SELECT 'Cameras', 'الكاميرات', 'cameras', (SELECT id FROM root_cats WHERE slug='electronics'), 3, true, NOW(), NOW() UNION ALL
        SELECT 'TVs', 'أجهزة التلفزيون', 'tvs', (SELECT id FROM root_cats WHERE slug='electronics'), 4, true, NOW(), NOW() UNION ALL

        -- Home Appliances Sub-Categories
        SELECT 'Refrigerators', 'الثلاجات', 'refrigerators', (SELECT id FROM root_cats WHERE slug='home-appliances'), 0, true, NOW(), NOW() UNION ALL
        SELECT 'Washing Machines', 'الغسالات', 'washing-machines', (SELECT id FROM root_cats WHERE slug='home-appliances'), 1, true, NOW(), NOW() UNION ALL
        SELECT 'Air Conditioners', 'مكيفات الهواء', 'air-conditioners', (SELECT id FROM root_cats WHERE slug='home-appliances'), 2, true, NOW(), NOW() UNION ALL
        SELECT 'Microwaves', 'الميكروويف', 'microwaves', (SELECT id FROM root_cats WHERE slug='home-appliances'), 3, true, NOW(), NOW() UNION ALL
        SELECT 'Vacuum Cleaners', 'المكانس الكهربائية', 'vacuum-cleaners', (SELECT id FROM root_cats WHERE slug='home-appliances'), 4, true, NOW(), NOW() UNION ALL

        -- Furniture Sub-Categories
        SELECT 'Living Room', 'غرفة المعيشة', 'living-room', (SELECT id FROM root_cats WHERE slug='furniture'), 0, true, NOW(), NOW() UNION ALL
        SELECT 'Bedroom', 'غرفة النوم', 'bedroom', (SELECT id FROM root_cats WHERE slug='furniture'), 1, true, NOW(), NOW() UNION ALL
        SELECT 'Dining Room', 'غرفة الطعام', 'dining-room', (SELECT id FROM root_cats WHERE slug='furniture'), 2, true, NOW(), NOW() UNION ALL
        SELECT 'Office', 'المكتب', 'office', (SELECT id FROM root_cats WHERE slug='furniture'), 3, true, NOW(), NOW() UNION ALL

        -- Vehicles Sub-Categories
        SELECT 'Cars', 'السيارات', 'cars', (SELECT id FROM root_cats WHERE slug='vehicles'), 0, true, NOW(), NOW() UNION ALL
        SELECT 'Motorcycles', 'الدراجات النارية', 'motorcycles', (SELECT id FROM root_cats WHERE slug='vehicles'), 1, true, NOW(), NOW() UNION ALL
        SELECT 'Bicycles', 'الدراجات', 'bicycles', (SELECT id FROM root_cats WHERE slug='vehicles'), 2, true, NOW(), NOW() UNION ALL

        -- Fashion Sub-Categories
        SELECT 'Men''s Clothing', 'ملابس رجالية', 'mens-clothing', (SELECT id FROM root_cats WHERE slug='fashion-clothing'), 0, true, NOW(), NOW() UNION ALL
        SELECT 'Women''s Clothing', 'ملابس نسائية', 'womens-clothing', (SELECT id FROM root_cats WHERE slug='fashion-clothing'), 1, true, NOW(), NOW() UNION ALL
        SELECT 'Shoes', 'الأحذية', 'shoes', (SELECT id FROM root_cats WHERE slug='fashion-clothing'), 2, true, NOW(), NOW() UNION ALL
        SELECT 'Bags', 'الحقائب', 'bags', (SELECT id FROM root_cats WHERE slug='fashion-clothing'), 3, true, NOW(), NOW() UNION ALL

        -- Sports Sub-Categories
        SELECT 'Gym Equipment', 'معدات الجيم', 'gym-equipment', (SELECT id FROM root_cats WHERE slug='sports-fitness'), 0, true, NOW(), NOW() UNION ALL
        SELECT 'Outdoor Sports', 'رياضات خارجية', 'outdoor-sports', (SELECT id FROM root_cats WHERE slug='sports-fitness'), 1, true, NOW(), NOW() UNION ALL

        -- Books Sub-Categories
        SELECT 'Books', 'الكتب', 'books', (SELECT id FROM root_cats WHERE slug='books-media'), 0, true, NOW(), NOW() UNION ALL
        SELECT 'Video Games', 'ألعاب الفيديو', 'video-games', (SELECT id FROM root_cats WHERE slug='books-media'), 1, true, NOW(), NOW() UNION ALL

        -- Kids Sub-Categories
        SELECT 'Baby Gear', 'معدات الأطفال', 'baby-gear', (SELECT id FROM root_cats WHERE slug='kids-baby'), 0, true, NOW(), NOW() UNION ALL
        SELECT 'Toys', 'الألعاب', 'toys', (SELECT id FROM root_cats WHERE slug='kids-baby'), 1, true, NOW(), NOW()
      ) AS sub_data
      RETURNING "id", "slug"
    )

    -- Step 3: Insert Level 3 Categories (Sub-Sub-Categories)
    INSERT INTO "categories" ("name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at")
    SELECT * FROM (
      -- Smartphones (Level 3)
      SELECT 'iPhone', 'آيفون', 'iphone', (SELECT id FROM level2_cats WHERE slug='smartphones'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Samsung', 'سامسونج', 'samsung', (SELECT id FROM level2_cats WHERE slug='smartphones'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Xiaomi', 'شاومي', 'xiaomi', (SELECT id FROM level2_cats WHERE slug='smartphones'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Oppo', 'أوبو', 'oppo', (SELECT id FROM level2_cats WHERE slug='smartphones'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Vivo', 'فيفو', 'vivo', (SELECT id FROM level2_cats WHERE slug='smartphones'), 4, true, NOW(), NOW() UNION ALL
      SELECT 'Huawei', 'هواوي', 'huawei', (SELECT id FROM level2_cats WHERE slug='smartphones'), 5, true, NOW(), NOW() UNION ALL
      SELECT 'Other Brands', 'ماركات أخرى', 'other-phone-brands', (SELECT id FROM level2_cats WHERE slug='smartphones'), 6, true, NOW(), NOW() UNION ALL

      -- Laptops (Level 3)
      SELECT 'MacBook', 'ماك بوك', 'macbook', (SELECT id FROM level2_cats WHERE slug='laptops'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Gaming Laptops', 'أجهزة الألعاب', 'gaming-laptops', (SELECT id FROM level2_cats WHERE slug='laptops'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Business Laptops', 'أجهزة الأعمال', 'business-laptops', (SELECT id FROM level2_cats WHERE slug='laptops'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Ultrabooks', 'الترابوك', 'ultrabooks', (SELECT id FROM level2_cats WHERE slug='laptops'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Budget Laptops', 'أجهزة اقتصادية', 'budget-laptops', (SELECT id FROM level2_cats WHERE slug='laptops'), 4, true, NOW(), NOW() UNION ALL

      -- Tablets (Level 3)
      SELECT 'iPad', 'آيباد', 'ipad', (SELECT id FROM level2_cats WHERE slug='tablets'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Samsung Tablets', 'سامسونج', 'samsung-tablets', (SELECT id FROM level2_cats WHERE slug='tablets'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Other Tablets', 'أجهزة أخرى', 'other-tablets', (SELECT id FROM level2_cats WHERE slug='tablets'), 2, true, NOW(), NOW() UNION ALL

      -- Cameras (Level 3)
      SELECT 'DSLR', 'دي إس إل آر', 'dslr', (SELECT id FROM level2_cats WHERE slug='cameras'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Mirrorless', 'ميرورليس', 'mirrorless', (SELECT id FROM level2_cats WHERE slug='cameras'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Action Cameras', 'كاميرات الأكشن', 'action-cameras', (SELECT id FROM level2_cats WHERE slug='cameras'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Point & Shoot', 'كاميرات صغيرة', 'point-shoot', (SELECT id FROM level2_cats WHERE slug='cameras'), 3, true, NOW(), NOW() UNION ALL

      -- TVs (Level 3)
      SELECT 'Smart TVs', 'تلفزيون ذكي', 'smart-tvs', (SELECT id FROM level2_cats WHERE slug='tvs'), 0, true, NOW(), NOW() UNION ALL
      SELECT '32 Inch', '32 بوصة', '32-inch', (SELECT id FROM level2_cats WHERE slug='tvs'), 1, true, NOW(), NOW() UNION ALL
      SELECT '43 Inch', '43 بوصة', '43-inch', (SELECT id FROM level2_cats WHERE slug='tvs'), 2, true, NOW(), NOW() UNION ALL
      SELECT '55 Inch', '55 بوصة', '55-inch', (SELECT id FROM level2_cats WHERE slug='tvs'), 3, true, NOW(), NOW() UNION ALL
      SELECT '65 Inch & Above', '65 بوصة وأكثر', '65-inch-above', (SELECT id FROM level2_cats WHERE slug='tvs'), 4, true, NOW(), NOW() UNION ALL

      -- ===== HOME APPLIANCES LEVEL 3 (INCLUDING USER'S EXAMPLE!) =====
      -- Refrigerators (Level 3) - THIS IS THE USER'S EXAMPLE!
      SELECT '16 Feet', '16 قدم', '16-feet', (SELECT id FROM level2_cats WHERE slug='refrigerators'), 0, true, NOW(), NOW() UNION ALL
      SELECT '18 Feet', '18 قدم', '18-feet', (SELECT id FROM level2_cats WHERE slug='refrigerators'), 1, true, NOW(), NOW() UNION ALL
      SELECT '20 Feet', '20 قدم', '20-feet', (SELECT id FROM level2_cats WHERE slug='refrigerators'), 2, true, NOW(), NOW() UNION ALL
      SELECT '24 Feet', '24 قدم', '24-feet', (SELECT id FROM level2_cats WHERE slug='refrigerators'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Side by Side', 'جنب إلى جنب', 'side-by-side', (SELECT id FROM level2_cats WHERE slug='refrigerators'), 4, true, NOW(), NOW() UNION ALL

      -- Washing Machines (Level 3)
      SELECT 'Top Load', 'تحميل علوي', 'top-load', (SELECT id FROM level2_cats WHERE slug='washing-machines'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Front Load', 'تحميل أمامي', 'front-load', (SELECT id FROM level2_cats WHERE slug='washing-machines'), 1, true, NOW(), NOW() UNION ALL
      SELECT '7 KG', '7 كيلو', '7-kg', (SELECT id FROM level2_cats WHERE slug='washing-machines'), 2, true, NOW(), NOW() UNION ALL
      SELECT '8-10 KG', '8-10 كيلو', '8-10-kg', (SELECT id FROM level2_cats WHERE slug='washing-machines'), 3, true, NOW(), NOW() UNION ALL
      SELECT '11 KG & Above', '11 كيلو وأكثر', '11-kg-above', (SELECT id FROM level2_cats WHERE slug='washing-machines'), 4, true, NOW(), NOW() UNION ALL

      -- Air Conditioners (Level 3)
      SELECT '1.5 HP', '1.5 حصان', '1-5-hp', (SELECT id FROM level2_cats WHERE slug='air-conditioners'), 0, true, NOW(), NOW() UNION ALL
      SELECT '2.25 HP', '2.25 حصان', '2-25-hp', (SELECT id FROM level2_cats WHERE slug='air-conditioners'), 1, true, NOW(), NOW() UNION ALL
      SELECT '3 HP', '3 حصان', '3-hp', (SELECT id FROM level2_cats WHERE slug='air-conditioners'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Split AC', 'سبليت', 'split-ac', (SELECT id FROM level2_cats WHERE slug='air-conditioners'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Window AC', 'شباك', 'window-ac', (SELECT id FROM level2_cats WHERE slug='air-conditioners'), 4, true, NOW(), NOW() UNION ALL

      -- Microwaves (Level 3)
      SELECT 'Solo', 'عادي', 'solo', (SELECT id FROM level2_cats WHERE slug='microwaves'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Grill', 'شواية', 'grill', (SELECT id FROM level2_cats WHERE slug='microwaves'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Convection', 'حراري', 'convection', (SELECT id FROM level2_cats WHERE slug='microwaves'), 2, true, NOW(), NOW() UNION ALL

      -- Vacuum Cleaners (Level 3)
      SELECT 'Upright', 'عمودي', 'upright', (SELECT id FROM level2_cats WHERE slug='vacuum-cleaners'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Canister', 'أسطواني', 'canister', (SELECT id FROM level2_cats WHERE slug='vacuum-cleaners'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Handheld', 'محمول', 'handheld', (SELECT id FROM level2_cats WHERE slug='vacuum-cleaners'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Robot', 'روبوت', 'robot', (SELECT id FROM level2_cats WHERE slug='vacuum-cleaners'), 3, true, NOW(), NOW() UNION ALL

      -- Furniture Level 3
      SELECT 'Sofas', 'الكنب', 'sofas', (SELECT id FROM level2_cats WHERE slug='living-room'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Coffee Tables', 'طاولات القهوة', 'coffee-tables', (SELECT id FROM level2_cats WHERE slug='living-room'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'TV Units', 'وحدات التلفزيون', 'tv-units', (SELECT id FROM level2_cats WHERE slug='living-room'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Bookshelves', 'رفوف الكتب', 'bookshelves', (SELECT id FROM level2_cats WHERE slug='living-room'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Beds', 'الأسرة', 'beds', (SELECT id FROM level2_cats WHERE slug='bedroom'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Wardrobes', 'الخزائن', 'wardrobes', (SELECT id FROM level2_cats WHERE slug='bedroom'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Dressers', 'التسريحات', 'dressers', (SELECT id FROM level2_cats WHERE slug='bedroom'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Nightstands', 'الكوميدينو', 'nightstands', (SELECT id FROM level2_cats WHERE slug='bedroom'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Dining Tables', 'طاولات الطعام', 'dining-tables', (SELECT id FROM level2_cats WHERE slug='dining-room'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Chairs', 'الكراسي', 'chairs', (SELECT id FROM level2_cats WHERE slug='dining-room'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Buffets', 'البوفيهات', 'buffets', (SELECT id FROM level2_cats WHERE slug='dining-room'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Desks', 'المكاتب', 'desks', (SELECT id FROM level2_cats WHERE slug='office'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Office Chairs', 'كراسي المكتب', 'office-chairs', (SELECT id FROM level2_cats WHERE slug='office'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Filing Cabinets', 'خزائن الملفات', 'filing-cabinets', (SELECT id FROM level2_cats WHERE slug='office'), 2, true, NOW(), NOW() UNION ALL

      -- Vehicles Level 3
      SELECT 'Sedans', 'سيدان', 'sedans', (SELECT id FROM level2_cats WHERE slug='cars'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'SUVs', 'دفع رباعي', 'suvs', (SELECT id FROM level2_cats WHERE slug='cars'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Hatchbacks', 'هاتشباك', 'hatchbacks', (SELECT id FROM level2_cats WHERE slug='cars'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Pickup Trucks', 'شاحنات صغيرة', 'pickup-trucks', (SELECT id FROM level2_cats WHERE slug='cars'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Vans', 'ميكروباص', 'vans', (SELECT id FROM level2_cats WHERE slug='cars'), 4, true, NOW(), NOW() UNION ALL
      SELECT 'Sport Bikes', 'رياضية', 'sport-bikes', (SELECT id FROM level2_cats WHERE slug='motorcycles'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Cruisers', 'كروزر', 'cruisers', (SELECT id FROM level2_cats WHERE slug='motorcycles'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Scooters', 'سكوتر', 'scooters', (SELECT id FROM level2_cats WHERE slug='motorcycles'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Touring', 'للرحلات', 'touring', (SELECT id FROM level2_cats WHERE slug='motorcycles'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Mountain Bikes', 'جبلية', 'mountain-bikes', (SELECT id FROM level2_cats WHERE slug='bicycles'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Road Bikes', 'طريق', 'road-bikes', (SELECT id FROM level2_cats WHERE slug='bicycles'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Electric Bikes', 'كهربائية', 'electric-bikes', (SELECT id FROM level2_cats WHERE slug='bicycles'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Kids Bikes', 'للأطفال', 'kids-bikes', (SELECT id FROM level2_cats WHERE slug='bicycles'), 3, true, NOW(), NOW() UNION ALL

      -- Fashion, Sports, Books, Kids (Remaining)
      SELECT 'Shirts', 'قمصان', 'shirts', (SELECT id FROM level2_cats WHERE slug='mens-clothing'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'T-Shirts', 'تيشرتات', 't-shirts', (SELECT id FROM level2_cats WHERE slug='mens-clothing'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Pants', 'بناطيل', 'pants', (SELECT id FROM level2_cats WHERE slug='mens-clothing'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Suits', 'بدل', 'suits', (SELECT id FROM level2_cats WHERE slug='mens-clothing'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Jackets', 'جاكيتات', 'jackets', (SELECT id FROM level2_cats WHERE slug='mens-clothing'), 4, true, NOW(), NOW() UNION ALL
      SELECT 'Dresses', 'فساتين', 'dresses', (SELECT id FROM level2_cats WHERE slug='womens-clothing'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Tops', 'بلوزات', 'tops', (SELECT id FROM level2_cats WHERE slug='womens-clothing'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Skirts', 'تنانير', 'skirts', (SELECT id FROM level2_cats WHERE slug='womens-clothing'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Pants', 'بناطيل', 'womens-pants', (SELECT id FROM level2_cats WHERE slug='womens-clothing'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Abayas', 'عبايات', 'abayas', (SELECT id FROM level2_cats WHERE slug='womens-clothing'), 4, true, NOW(), NOW() UNION ALL
      SELECT 'Sneakers', 'أحذية رياضية', 'sneakers', (SELECT id FROM level2_cats WHERE slug='shoes'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Formal Shoes', 'أحذية رسمية', 'formal-shoes', (SELECT id FROM level2_cats WHERE slug='shoes'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Sandals', 'صنادل', 'sandals', (SELECT id FROM level2_cats WHERE slug='shoes'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Boots', 'أحذية طويلة', 'boots', (SELECT id FROM level2_cats WHERE slug='shoes'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Handbags', 'حقائب يد', 'handbags', (SELECT id FROM level2_cats WHERE slug='bags'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Backpacks', 'حقائب ظهر', 'backpacks', (SELECT id FROM level2_cats WHERE slug='bags'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Wallets', 'محافظ', 'wallets', (SELECT id FROM level2_cats WHERE slug='bags'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Travel Bags', 'حقائب سفر', 'travel-bags', (SELECT id FROM level2_cats WHERE slug='bags'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Treadmills', 'جهاز المشي', 'treadmills', (SELECT id FROM level2_cats WHERE slug='gym-equipment'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Dumbbells', 'دمبلز', 'dumbbells', (SELECT id FROM level2_cats WHERE slug='gym-equipment'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Benches', 'مقاعد', 'benches', (SELECT id FROM level2_cats WHERE slug='gym-equipment'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Exercise Bikes', 'دراجات التمرين', 'exercise-bikes', (SELECT id FROM level2_cats WHERE slug='gym-equipment'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Football', 'كرة القدم', 'football', (SELECT id FROM level2_cats WHERE slug='outdoor-sports'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Basketball', 'كرة السلة', 'basketball', (SELECT id FROM level2_cats WHERE slug='outdoor-sports'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Tennis', 'التنس', 'tennis', (SELECT id FROM level2_cats WHERE slug='outdoor-sports'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Swimming', 'السباحة', 'swimming', (SELECT id FROM level2_cats WHERE slug='outdoor-sports'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Fiction', 'روايات', 'fiction', (SELECT id FROM level2_cats WHERE slug='books'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Non-Fiction', 'غير روائية', 'non-fiction', (SELECT id FROM level2_cats WHERE slug='books'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Educational', 'تعليمية', 'educational', (SELECT id FROM level2_cats WHERE slug='books'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Religious', 'دينية', 'religious', (SELECT id FROM level2_cats WHERE slug='books'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Children', 'للأطفال', 'children-books', (SELECT id FROM level2_cats WHERE slug='books'), 4, true, NOW(), NOW() UNION ALL
      SELECT 'PlayStation', 'بلايستيشن', 'playstation', (SELECT id FROM level2_cats WHERE slug='video-games'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Xbox', 'إكس بوكس', 'xbox', (SELECT id FROM level2_cats WHERE slug='video-games'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Nintendo', 'نينتندو', 'nintendo', (SELECT id FROM level2_cats WHERE slug='video-games'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'PC Games', 'ألعاب كمبيوتر', 'pc-games', (SELECT id FROM level2_cats WHERE slug='video-games'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Strollers', 'عربات الأطفال', 'strollers', (SELECT id FROM level2_cats WHERE slug='baby-gear'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Car Seats', 'مقاعد السيارة', 'car-seats', (SELECT id FROM level2_cats WHERE slug='baby-gear'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Cribs', 'أسرة الأطفال', 'cribs', (SELECT id FROM level2_cats WHERE slug='baby-gear'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'High Chairs', 'كراسي الطعام', 'high-chairs', (SELECT id FROM level2_cats WHERE slug='baby-gear'), 3, true, NOW(), NOW() UNION ALL
      SELECT 'Educational Toys', 'ألعاب تعليمية', 'educational-toys', (SELECT id FROM level2_cats WHERE slug='toys'), 0, true, NOW(), NOW() UNION ALL
      SELECT 'Dolls', 'عرائس', 'dolls', (SELECT id FROM level2_cats WHERE slug='toys'), 1, true, NOW(), NOW() UNION ALL
      SELECT 'Action Figures', 'شخصيات', 'action-figures', (SELECT id FROM level2_cats WHERE slug='toys'), 2, true, NOW(), NOW() UNION ALL
      SELECT 'Building Blocks', 'مكعبات', 'building-blocks', (SELECT id FROM level2_cats WHERE slug='toys'), 3, true, NOW(), NOW()
    ) AS level3_data;

    RAISE NOTICE 'Successfully seeded % categories', (SELECT COUNT(*) FROM "categories");

  ELSE
    RAISE NOTICE 'Categories table already contains data, skipping seed';
  END IF;
END $$;
