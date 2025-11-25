-- ============================================================================
-- COMPLETE CATEGORY SEED - All Levels with "Other" Options
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- LEVEL 2: Sub-Categories (with "Other" options)
-- ============================================================================

INSERT INTO "categories" ("name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at")
SELECT * FROM (
  -- Electronics Sub-Categories
  SELECT 'Smartphones', 'الهواتف الذكية', 'smartphones', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Laptops', 'أجهزة الكمبيوتر المحمولة', 'laptops', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Tablets', 'الأجهزة اللوحية', 'tablets', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Cameras', 'الكاميرات', 'cameras', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 3, true, NOW(), NOW() UNION ALL
  SELECT 'TVs', 'أجهزة التلفزيون', 'tvs', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 4, true, NOW(), NOW() UNION ALL
  SELECT 'Other Electronics', 'إلكترونيات أخرى', 'other-electronics', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 99, true, NOW(), NOW() UNION ALL

  -- Home Appliances Sub-Categories
  SELECT 'Refrigerators', 'الثلاجات', 'refrigerators', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Washing Machines', 'الغسالات', 'washing-machines', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Air Conditioners', 'مكيفات الهواء', 'air-conditioners', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Microwaves', 'الميكروويف', 'microwaves', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Vacuum Cleaners', 'المكانس الكهربائية', 'vacuum-cleaners', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 4, true, NOW(), NOW() UNION ALL
  SELECT 'Other Appliances', 'أجهزة أخرى', 'other-appliances', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 99, true, NOW(), NOW() UNION ALL

  -- Furniture Sub-Categories
  SELECT 'Living Room', 'غرفة المعيشة', 'living-room', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Bedroom', 'غرفة النوم', 'bedroom', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Dining Room', 'غرفة الطعام', 'dining-room', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Office', 'المكتب', 'office', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Furniture', 'أثاث آخر', 'other-furniture', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 99, true, NOW(), NOW() UNION ALL

  -- Vehicles Sub-Categories
  SELECT 'Cars', 'السيارات', 'cars', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Motorcycles', 'الدراجات النارية', 'motorcycles', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Bicycles', 'الدراجات', 'bicycles', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Other Vehicles', 'مركبات أخرى', 'other-vehicles', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 99, true, NOW(), NOW() UNION ALL

  -- Fashion Sub-Categories
  SELECT 'Men''s Clothing', 'ملابس رجالية', 'mens-clothing', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Women''s Clothing', 'ملابس نسائية', 'womens-clothing', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Shoes', 'الأحذية', 'shoes', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Bags', 'الحقائب', 'bags', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Fashion', 'أزياء أخرى', 'other-fashion', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 99, true, NOW(), NOW() UNION ALL

  -- Sports Sub-Categories
  SELECT 'Gym Equipment', 'معدات الجيم', 'gym-equipment', (SELECT id FROM "categories" WHERE slug='sports-fitness' AND parent_id IS NULL), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Outdoor Sports', 'رياضات خارجية', 'outdoor-sports', (SELECT id FROM "categories" WHERE slug='sports-fitness' AND parent_id IS NULL), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Other Sports', 'رياضات أخرى', 'other-sports', (SELECT id FROM "categories" WHERE slug='sports-fitness' AND parent_id IS NULL), 99, true, NOW(), NOW() UNION ALL

  -- Books Sub-Categories
  SELECT 'Books', 'الكتب', 'books', (SELECT id FROM "categories" WHERE slug='books-media' AND parent_id IS NULL), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Video Games', 'ألعاب الفيديو', 'video-games', (SELECT id FROM "categories" WHERE slug='books-media' AND parent_id IS NULL), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Other Media', 'وسائط أخرى', 'other-media', (SELECT id FROM "categories" WHERE slug='books-media' AND parent_id IS NULL), 99, true, NOW(), NOW() UNION ALL

  -- Kids Sub-Categories
  SELECT 'Baby Gear', 'معدات الأطفال', 'baby-gear', (SELECT id FROM "categories" WHERE slug='kids-baby' AND parent_id IS NULL), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Toys', 'الألعاب', 'toys', (SELECT id FROM "categories" WHERE slug='kids-baby' AND parent_id IS NULL), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Other Kids Items', 'مستلزمات أطفال أخرى', 'other-kids', (SELECT id FROM "categories" WHERE slug='kids-baby' AND parent_id IS NULL), 99, true, NOW(), NOW()
) AS level2
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- LEVEL 3: Sub-Sub-Categories (with "Other" options)
-- ============================================================================

INSERT INTO "categories" ("name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at")
SELECT * FROM (
  -- Smartphones (Level 3)
  SELECT 'iPhone', 'آيفون', 'iphone', (SELECT id FROM "categories" WHERE slug='smartphones'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Samsung', 'سامسونج', 'samsung', (SELECT id FROM "categories" WHERE slug='smartphones'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Xiaomi', 'شاومي', 'xiaomi', (SELECT id FROM "categories" WHERE slug='smartphones'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Oppo', 'أوبو', 'oppo', (SELECT id FROM "categories" WHERE slug='smartphones'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Vivo', 'فيفو', 'vivo', (SELECT id FROM "categories" WHERE slug='smartphones'), 4, true, NOW(), NOW() UNION ALL
  SELECT 'Huawei', 'هواوي', 'huawei', (SELECT id FROM "categories" WHERE slug='smartphones'), 5, true, NOW(), NOW() UNION ALL
  SELECT 'Other Smartphones', 'هواتف أخرى', 'other-smartphones', (SELECT id FROM "categories" WHERE slug='smartphones'), 99, true, NOW(), NOW() UNION ALL

  -- Laptops (Level 3)
  SELECT 'MacBook', 'ماك بوك', 'macbook', (SELECT id FROM "categories" WHERE slug='laptops'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Gaming Laptops', 'أجهزة الألعاب', 'gaming-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Business Laptops', 'أجهزة الأعمال', 'business-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Ultrabooks', 'الترابوك', 'ultrabooks', (SELECT id FROM "categories" WHERE slug='laptops'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Budget Laptops', 'أجهزة اقتصادية', 'budget-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 4, true, NOW(), NOW() UNION ALL
  SELECT 'Other Laptops', 'أجهزة كمبيوتر أخرى', 'other-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 99, true, NOW(), NOW() UNION ALL

  -- Tablets (Level 3)
  SELECT 'iPad', 'آيباد', 'ipad', (SELECT id FROM "categories" WHERE slug='tablets'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Samsung Tablets', 'سامسونج', 'samsung-tablets', (SELECT id FROM "categories" WHERE slug='tablets'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Other Tablets', 'أجهزة لوحية أخرى', 'other-tablets', (SELECT id FROM "categories" WHERE slug='tablets'), 99, true, NOW(), NOW() UNION ALL

  -- Cameras (Level 3)
  SELECT 'DSLR', 'دي إس إل آر', 'dslr', (SELECT id FROM "categories" WHERE slug='cameras'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Mirrorless', 'ميرورليس', 'mirrorless', (SELECT id FROM "categories" WHERE slug='cameras'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Action Cameras', 'كاميرات الأكشن', 'action-cameras', (SELECT id FROM "categories" WHERE slug='cameras'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Point & Shoot', 'كاميرات صغيرة', 'point-shoot', (SELECT id FROM "categories" WHERE slug='cameras'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Cameras', 'كاميرات أخرى', 'other-cameras', (SELECT id FROM "categories" WHERE slug='cameras'), 99, true, NOW(), NOW() UNION ALL

  -- TVs (Level 3)
  SELECT 'Smart TVs', 'تلفزيون ذكي', 'smart-tvs', (SELECT id FROM "categories" WHERE slug='tvs'), 0, true, NOW(), NOW() UNION ALL
  SELECT '32 Inch', '32 بوصة', '32-inch', (SELECT id FROM "categories" WHERE slug='tvs'), 1, true, NOW(), NOW() UNION ALL
  SELECT '43 Inch', '43 بوصة', '43-inch', (SELECT id FROM "categories" WHERE slug='tvs'), 2, true, NOW(), NOW() UNION ALL
  SELECT '55 Inch', '55 بوصة', '55-inch', (SELECT id FROM "categories" WHERE slug='tvs'), 3, true, NOW(), NOW() UNION ALL
  SELECT '65 Inch & Above', '65 بوصة وأكثر', '65-inch-above', (SELECT id FROM "categories" WHERE slug='tvs'), 4, true, NOW(), NOW() UNION ALL
  SELECT 'Other TVs', 'تلفزيونات أخرى', 'other-tvs', (SELECT id FROM "categories" WHERE slug='tvs'), 99, true, NOW(), NOW() UNION ALL

  -- Refrigerators (Level 3) - YOUR EXAMPLE: 24 Feet!
  SELECT '16 Feet', '16 قدم', '16-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 0, true, NOW(), NOW() UNION ALL
  SELECT '18 Feet', '18 قدم', '18-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 1, true, NOW(), NOW() UNION ALL
  SELECT '20 Feet', '20 قدم', '20-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 2, true, NOW(), NOW() UNION ALL
  SELECT '24 Feet', '24 قدم', '24-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Side by Side', 'جنب إلى جنب', 'side-by-side', (SELECT id FROM "categories" WHERE slug='refrigerators'), 4, true, NOW(), NOW() UNION ALL
  SELECT 'Other Refrigerators', 'ثلاجات أخرى', 'other-refrigerators', (SELECT id FROM "categories" WHERE slug='refrigerators'), 99, true, NOW(), NOW() UNION ALL

  -- Washing Machines (Level 3)
  SELECT 'Top Load', 'تحميل علوي', 'top-load', (SELECT id FROM "categories" WHERE slug='washing-machines'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Front Load', 'تحميل أمامي', 'front-load', (SELECT id FROM "categories" WHERE slug='washing-machines'), 1, true, NOW(), NOW() UNION ALL
  SELECT '7 KG', '7 كيلو', '7-kg', (SELECT id FROM "categories" WHERE slug='washing-machines'), 2, true, NOW(), NOW() UNION ALL
  SELECT '8-10 KG', '8-10 كيلو', '8-10-kg', (SELECT id FROM "categories" WHERE slug='washing-machines'), 3, true, NOW(), NOW() UNION ALL
  SELECT '11 KG & Above', '11 كيلو وأكثر', '11-kg-above', (SELECT id FROM "categories" WHERE slug='washing-machines'), 4, true, NOW(), NOW() UNION ALL
  SELECT 'Other Washing Machines', 'غسالات أخرى', 'other-washing-machines', (SELECT id FROM "categories" WHERE slug='washing-machines'), 99, true, NOW(), NOW() UNION ALL

  -- Air Conditioners (Level 3)
  SELECT '1.5 HP', '1.5 حصان', '1-5-hp', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 0, true, NOW(), NOW() UNION ALL
  SELECT '2.25 HP', '2.25 حصان', '2-25-hp', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 1, true, NOW(), NOW() UNION ALL
  SELECT '3 HP', '3 حصان', '3-hp', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Split AC', 'سبليت', 'split-ac', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Window AC', 'شباك', 'window-ac', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 4, true, NOW(), NOW() UNION ALL
  SELECT 'Other ACs', 'مكيفات أخرى', 'other-acs', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 99, true, NOW(), NOW() UNION ALL

  -- Microwaves (Level 3)
  SELECT 'Solo', 'عادي', 'solo', (SELECT id FROM "categories" WHERE slug='microwaves'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Grill', 'شواية', 'grill', (SELECT id FROM "categories" WHERE slug='microwaves'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Convection', 'حراري', 'convection', (SELECT id FROM "categories" WHERE slug='microwaves'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Other Microwaves', 'ميكروويف آخر', 'other-microwaves', (SELECT id FROM "categories" WHERE slug='microwaves'), 99, true, NOW(), NOW() UNION ALL

  -- Vacuum Cleaners (Level 3)
  SELECT 'Upright', 'عمودي', 'upright', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Canister', 'أسطواني', 'canister', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Handheld', 'محمول', 'handheld', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Robot', 'روبوت', 'robot', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Vacuum Cleaners', 'مكانس أخرى', 'other-vacuums', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 99, true, NOW(), NOW() UNION ALL

  -- Furniture: Living Room (Level 3)
  SELECT 'Sofas', 'الكنب', 'sofas', (SELECT id FROM "categories" WHERE slug='living-room'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Coffee Tables', 'طاولات القهوة', 'coffee-tables', (SELECT id FROM "categories" WHERE slug='living-room'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'TV Units', 'وحدات التلفزيون', 'tv-units', (SELECT id FROM "categories" WHERE slug='living-room'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Bookshelves', 'رفوف الكتب', 'bookshelves', (SELECT id FROM "categories" WHERE slug='living-room'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Living Room', 'أثاث صالة آخر', 'other-living-room', (SELECT id FROM "categories" WHERE slug='living-room'), 99, true, NOW(), NOW() UNION ALL

  -- Furniture: Bedroom (Level 3)
  SELECT 'Beds', 'الأسرة', 'beds', (SELECT id FROM "categories" WHERE slug='bedroom'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Wardrobes', 'الخزائن', 'wardrobes', (SELECT id FROM "categories" WHERE slug='bedroom'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Dressers', 'التسريحات', 'dressers', (SELECT id FROM "categories" WHERE slug='bedroom'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Nightstands', 'الكوميدينو', 'nightstands', (SELECT id FROM "categories" WHERE slug='bedroom'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Bedroom', 'أثاث غرفة نوم آخر', 'other-bedroom', (SELECT id FROM "categories" WHERE slug='bedroom'), 99, true, NOW(), NOW() UNION ALL

  -- Furniture: Dining Room (Level 3)
  SELECT 'Dining Tables', 'طاولات الطعام', 'dining-tables', (SELECT id FROM "categories" WHERE slug='dining-room'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Chairs', 'الكراسي', 'chairs', (SELECT id FROM "categories" WHERE slug='dining-room'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Buffets', 'البوفيهات', 'buffets', (SELECT id FROM "categories" WHERE slug='dining-room'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Other Dining', 'أثاث طعام آخر', 'other-dining', (SELECT id FROM "categories" WHERE slug='dining-room'), 99, true, NOW(), NOW() UNION ALL

  -- Furniture: Office (Level 3)
  SELECT 'Desks', 'المكاتب', 'desks', (SELECT id FROM "categories" WHERE slug='office'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Office Chairs', 'كراسي المكتب', 'office-chairs', (SELECT id FROM "categories" WHERE slug='office'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Filing Cabinets', 'خزائن الملفات', 'filing-cabinets', (SELECT id FROM "categories" WHERE slug='office'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Other Office', 'أثاث مكتب آخر', 'other-office', (SELECT id FROM "categories" WHERE slug='office'), 99, true, NOW(), NOW() UNION ALL

  -- Vehicles: Cars (Level 3)
  SELECT 'Sedans', 'سيدان', 'sedans', (SELECT id FROM "categories" WHERE slug='cars'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'SUVs', 'دفع رباعي', 'suvs', (SELECT id FROM "categories" WHERE slug='cars'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Hatchbacks', 'هاتشباك', 'hatchbacks', (SELECT id FROM "categories" WHERE slug='cars'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Pickup Trucks', 'شاحنات صغيرة', 'pickup-trucks', (SELECT id FROM "categories" WHERE slug='cars'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Vans', 'ميكروباص', 'vans', (SELECT id FROM "categories" WHERE slug='cars'), 4, true, NOW(), NOW() UNION ALL
  SELECT 'Other Cars', 'سيارات أخرى', 'other-cars', (SELECT id FROM "categories" WHERE slug='cars'), 99, true, NOW(), NOW() UNION ALL

  -- Vehicles: Motorcycles (Level 3)
  SELECT 'Sport Bikes', 'رياضية', 'sport-bikes', (SELECT id FROM "categories" WHERE slug='motorcycles'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Cruisers', 'كروزر', 'cruisers', (SELECT id FROM "categories" WHERE slug='motorcycles'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Scooters', 'سكوتر', 'scooters', (SELECT id FROM "categories" WHERE slug='motorcycles'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Touring', 'للرحلات', 'touring', (SELECT id FROM "categories" WHERE slug='motorcycles'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Motorcycles', 'دراجات نارية أخرى', 'other-motorcycles', (SELECT id FROM "categories" WHERE slug='motorcycles'), 99, true, NOW(), NOW() UNION ALL

  -- Vehicles: Bicycles (Level 3)
  SELECT 'Mountain Bikes', 'جبلية', 'mountain-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Road Bikes', 'طريق', 'road-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Electric Bikes', 'كهربائية', 'electric-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Kids Bikes', 'للأطفال', 'kids-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Bicycles', 'دراجات أخرى', 'other-bicycles', (SELECT id FROM "categories" WHERE slug='bicycles'), 99, true, NOW(), NOW() UNION ALL

  -- Fashion: Men's Clothing (Level 3)
  SELECT 'Shirts', 'قمصان', 'shirts', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'T-Shirts', 'تيشرتات', 't-shirts', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Pants', 'بناطيل', 'pants', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Suits', 'بدل', 'suits', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Jackets', 'جاكيتات', 'jackets', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 4, true, NOW(), NOW() UNION ALL
  SELECT 'Other Men''s Clothing', 'ملابس رجالية أخرى', 'other-mens-clothing', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 99, true, NOW(), NOW() UNION ALL

  -- Fashion: Women's Clothing (Level 3)
  SELECT 'Dresses', 'فساتين', 'dresses', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Tops', 'بلوزات', 'tops', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Skirts', 'تنانير', 'skirts', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Pants', 'بناطيل', 'womens-pants', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Abayas', 'عبايات', 'abayas', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 4, true, NOW(), NOW() UNION ALL
  SELECT 'Other Women''s Clothing', 'ملابس نسائية أخرى', 'other-womens-clothing', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 99, true, NOW(), NOW() UNION ALL

  -- Fashion: Shoes (Level 3)
  SELECT 'Sneakers', 'أحذية رياضية', 'sneakers', (SELECT id FROM "categories" WHERE slug='shoes'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Formal Shoes', 'أحذية رسمية', 'formal-shoes', (SELECT id FROM "categories" WHERE slug='shoes'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Sandals', 'صنادل', 'sandals', (SELECT id FROM "categories" WHERE slug='shoes'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Boots', 'أحذية طويلة', 'boots', (SELECT id FROM "categories" WHERE slug='shoes'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Shoes', 'أحذية أخرى', 'other-shoes', (SELECT id FROM "categories" WHERE slug='shoes'), 99, true, NOW(), NOW() UNION ALL

  -- Fashion: Bags (Level 3)
  SELECT 'Handbags', 'حقائب يد', 'handbags', (SELECT id FROM "categories" WHERE slug='bags'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Backpacks', 'حقائب ظهر', 'backpacks', (SELECT id FROM "categories" WHERE slug='bags'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Wallets', 'محافظ', 'wallets', (SELECT id FROM "categories" WHERE slug='bags'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Travel Bags', 'حقائب سفر', 'travel-bags', (SELECT id FROM "categories" WHERE slug='bags'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Bags', 'حقائب أخرى', 'other-bags', (SELECT id FROM "categories" WHERE slug='bags'), 99, true, NOW(), NOW() UNION ALL

  -- Sports: Gym Equipment (Level 3)
  SELECT 'Treadmills', 'جهاز المشي', 'treadmills', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Dumbbells', 'دمبلز', 'dumbbells', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Benches', 'مقاعد', 'benches', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Exercise Bikes', 'دراجات التمرين', 'exercise-bikes', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Gym Equipment', 'معدات جيم أخرى', 'other-gym-equipment', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 99, true, NOW(), NOW() UNION ALL

  -- Sports: Outdoor Sports (Level 3)
  SELECT 'Football', 'كرة القدم', 'football', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Basketball', 'كرة السلة', 'basketball', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Tennis', 'التنس', 'tennis', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Swimming', 'السباحة', 'swimming', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Sports', 'رياضات أخرى', 'other-outdoor-sports', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 99, true, NOW(), NOW() UNION ALL

  -- Books (Level 3)
  SELECT 'Fiction', 'روايات', 'fiction', (SELECT id FROM "categories" WHERE slug='books'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Non-Fiction', 'غير روائية', 'non-fiction', (SELECT id FROM "categories" WHERE slug='books'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Educational', 'تعليمية', 'educational', (SELECT id FROM "categories" WHERE slug='books'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Religious', 'دينية', 'religious', (SELECT id FROM "categories" WHERE slug='books'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Children Books', 'كتب أطفال', 'children-books', (SELECT id FROM "categories" WHERE slug='books'), 4, true, NOW(), NOW() UNION ALL
  SELECT 'Other Books', 'كتب أخرى', 'other-books', (SELECT id FROM "categories" WHERE slug='books'), 99, true, NOW(), NOW() UNION ALL

  -- Video Games (Level 3)
  SELECT 'PlayStation', 'بلايستيشن', 'playstation', (SELECT id FROM "categories" WHERE slug='video-games'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Xbox', 'إكس بوكس', 'xbox', (SELECT id FROM "categories" WHERE slug='video-games'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Nintendo', 'نينتندو', 'nintendo', (SELECT id FROM "categories" WHERE slug='video-games'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'PC Games', 'ألعاب كمبيوتر', 'pc-games', (SELECT id FROM "categories" WHERE slug='video-games'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Games', 'ألعاب أخرى', 'other-games', (SELECT id FROM "categories" WHERE slug='video-games'), 99, true, NOW(), NOW() UNION ALL

  -- Kids: Baby Gear (Level 3)
  SELECT 'Strollers', 'عربات الأطفال', 'strollers', (SELECT id FROM "categories" WHERE slug='baby-gear'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Car Seats', 'مقاعد السيارة', 'car-seats', (SELECT id FROM "categories" WHERE slug='baby-gear'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Cribs', 'أسرة الأطفال', 'cribs', (SELECT id FROM "categories" WHERE slug='baby-gear'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'High Chairs', 'كراسي الطعام', 'high-chairs', (SELECT id FROM "categories" WHERE slug='baby-gear'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Baby Gear', 'معدات أطفال أخرى', 'other-baby-gear', (SELECT id FROM "categories" WHERE slug='baby-gear'), 99, true, NOW(), NOW() UNION ALL

  -- Kids: Toys (Level 3)
  SELECT 'Educational Toys', 'ألعاب تعليمية', 'educational-toys', (SELECT id FROM "categories" WHERE slug='toys'), 0, true, NOW(), NOW() UNION ALL
  SELECT 'Dolls', 'عرائس', 'dolls', (SELECT id FROM "categories" WHERE slug='toys'), 1, true, NOW(), NOW() UNION ALL
  SELECT 'Action Figures', 'شخصيات', 'action-figures', (SELECT id FROM "categories" WHERE slug='toys'), 2, true, NOW(), NOW() UNION ALL
  SELECT 'Building Blocks', 'مكعبات', 'building-blocks', (SELECT id FROM "categories" WHERE slug='toys'), 3, true, NOW(), NOW() UNION ALL
  SELECT 'Other Toys', 'ألعاب أخرى', 'other-toys', (SELECT id FROM "categories" WHERE slug='toys'), 99, true, NOW(), NOW()
) AS level3
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT
  'Root Categories' as level, COUNT(*) as count FROM "categories" WHERE "parent_id" IS NULL
UNION ALL
SELECT
  'Sub Categories' as level, COUNT(*) as count FROM "categories"
  WHERE "parent_id" IS NOT NULL
  AND EXISTS (SELECT 1 FROM "categories" p WHERE p."id" = "categories"."parent_id" AND p."parent_id" IS NULL)
UNION ALL
SELECT
  'Sub-Sub Categories' as level, COUNT(*) as count FROM "categories"
  WHERE "parent_id" IS NOT NULL
  AND EXISTS (SELECT 1 FROM "categories" p WHERE p."id" = "categories"."parent_id" AND p."parent_id" IS NOT NULL)
UNION ALL
SELECT
  'TOTAL' as level, COUNT(*) as count FROM "categories";
