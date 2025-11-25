-- ============================================================================
-- COMPLETE CATEGORY SEED - All Levels with "Other" Options
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- LEVEL 2: Sub-Categories (with "Other" options)
-- ============================================================================

INSERT INTO "categories" ("name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at")
VALUES
  -- Electronics Sub-Categories
  ('Smartphones', 'الهواتف الذكية', 'smartphones', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  ('Laptops', 'أجهزة الكمبيوتر المحمولة', 'laptops', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  ('Tablets', 'الأجهزة اللوحية', 'tablets', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 2, true, NOW(), NOW()),
  ('Cameras', 'الكاميرات', 'cameras', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 3, true, NOW(), NOW()),
  ('TVs', 'أجهزة التلفزيون', 'tvs', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 4, true, NOW(), NOW()),
  ('Other Electronics', 'إلكترونيات أخرى', 'other-electronics', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Home Appliances Sub-Categories
  ('Refrigerators', 'الثلاجات', 'refrigerators', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  ('Washing Machines', 'الغسالات', 'washing-machines', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  ('Air Conditioners', 'مكيفات الهواء', 'air-conditioners', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 2, true, NOW(), NOW()),
  ('Microwaves', 'الميكروويف', 'microwaves', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 3, true, NOW(), NOW()),
  ('Vacuum Cleaners', 'المكانس الكهربائية', 'vacuum-cleaners', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 4, true, NOW(), NOW()),
  ('Other Appliances', 'أجهزة أخرى', 'other-appliances', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Furniture Sub-Categories
  ('Living Room', 'غرفة المعيشة', 'living-room', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  ('Bedroom', 'غرفة النوم', 'bedroom', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  ('Dining Room', 'غرفة الطعام', 'dining-room', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 2, true, NOW(), NOW()),
  ('Office', 'المكتب', 'office', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 3, true, NOW(), NOW()),
  ('Other Furniture', 'أثاث آخر', 'other-furniture', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Vehicles Sub-Categories
  ('Cars', 'السيارات', 'cars', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  ('Motorcycles', 'الدراجات النارية', 'motorcycles', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  ('Bicycles', 'الدراجات', 'bicycles', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 2, true, NOW(), NOW()),
  ('Other Vehicles', 'مركبات أخرى', 'other-vehicles', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Fashion Sub-Categories
  ('Men''s Clothing', 'ملابس رجالية', 'mens-clothing', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  ('Women''s Clothing', 'ملابس نسائية', 'womens-clothing', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  ('Shoes', 'الأحذية', 'shoes', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 2, true, NOW(), NOW()),
  ('Bags', 'الحقائب', 'bags', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 3, true, NOW(), NOW()),
  ('Other Fashion', 'أزياء أخرى', 'other-fashion', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Sports Sub-Categories
  ('Gym Equipment', 'معدات الجيم', 'gym-equipment', (SELECT id FROM "categories" WHERE slug='sports-fitness' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  ('Outdoor Sports', 'رياضات خارجية', 'outdoor-sports', (SELECT id FROM "categories" WHERE slug='sports-fitness' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  ('Other Sports', 'رياضات أخرى', 'other-sports', (SELECT id FROM "categories" WHERE slug='sports-fitness' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Books & Media Sub-Categories
  ('Books', 'الكتب', 'books', (SELECT id FROM "categories" WHERE slug='books-media' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  ('Video Games', 'ألعاب الفيديو', 'video-games', (SELECT id FROM "categories" WHERE slug='books-media' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  ('Other Media', 'وسائط أخرى', 'other-media', (SELECT id FROM "categories" WHERE slug='books-media' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Kids & Baby Sub-Categories
  ('Baby Gear', 'معدات الأطفال', 'baby-gear', (SELECT id FROM "categories" WHERE slug='kids-baby' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  ('Toys', 'الألعاب', 'toys', (SELECT id FROM "categories" WHERE slug='kids-baby' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  ('Other Kids Items', 'مستلزمات أطفال أخرى', 'other-kids', (SELECT id FROM "categories" WHERE slug='kids-baby' AND parent_id IS NULL), 99, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- LEVEL 3: Sub-Sub-Categories (with "Other" options)
-- ============================================================================

INSERT INTO "categories" ("name_en", "name_ar", "slug", "parent_id", "order", "is_active", "created_at", "updated_at")
VALUES
  -- Smartphones (Level 3)
  ('iPhone', 'آيفون', 'iphone', (SELECT id FROM "categories" WHERE slug='smartphones'), 0, true, NOW(), NOW()),
  ('Samsung', 'سامسونج', 'samsung', (SELECT id FROM "categories" WHERE slug='smartphones'), 1, true, NOW(), NOW()),
  ('Xiaomi', 'شاومي', 'xiaomi', (SELECT id FROM "categories" WHERE slug='smartphones'), 2, true, NOW(), NOW()),
  ('Oppo', 'أوبو', 'oppo', (SELECT id FROM "categories" WHERE slug='smartphones'), 3, true, NOW(), NOW()),
  ('Vivo', 'فيفو', 'vivo', (SELECT id FROM "categories" WHERE slug='smartphones'), 4, true, NOW(), NOW()),
  ('Huawei', 'هواوي', 'huawei', (SELECT id FROM "categories" WHERE slug='smartphones'), 5, true, NOW(), NOW()),
  ('Other Smartphones', 'هواتف أخرى', 'other-smartphones', (SELECT id FROM "categories" WHERE slug='smartphones'), 99, true, NOW(), NOW()),

  -- Laptops (Level 3)
  ('MacBook', 'ماك بوك', 'macbook', (SELECT id FROM "categories" WHERE slug='laptops'), 0, true, NOW(), NOW()),
  ('Gaming Laptops', 'أجهزة الألعاب', 'gaming-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 1, true, NOW(), NOW()),
  ('Business Laptops', 'أجهزة الأعمال', 'business-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 2, true, NOW(), NOW()),
  ('Ultrabooks', 'الترابوك', 'ultrabooks', (SELECT id FROM "categories" WHERE slug='laptops'), 3, true, NOW(), NOW()),
  ('Budget Laptops', 'أجهزة اقتصادية', 'budget-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 4, true, NOW(), NOW()),
  ('Other Laptops', 'أجهزة كمبيوتر أخرى', 'other-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 99, true, NOW(), NOW()),

  -- Tablets (Level 3)
  ('iPad', 'آيباد', 'ipad', (SELECT id FROM "categories" WHERE slug='tablets'), 0, true, NOW(), NOW()),
  ('Samsung Tablets', 'سامسونج', 'samsung-tablets', (SELECT id FROM "categories" WHERE slug='tablets'), 1, true, NOW(), NOW()),
  ('Other Tablets', 'أجهزة لوحية أخرى', 'other-tablets', (SELECT id FROM "categories" WHERE slug='tablets'), 99, true, NOW(), NOW()),

  -- Cameras (Level 3)
  ('DSLR', 'دي إس إل آر', 'dslr', (SELECT id FROM "categories" WHERE slug='cameras'), 0, true, NOW(), NOW()),
  ('Mirrorless', 'ميرورليس', 'mirrorless', (SELECT id FROM "categories" WHERE slug='cameras'), 1, true, NOW(), NOW()),
  ('Action Cameras', 'كاميرات الأكشن', 'action-cameras', (SELECT id FROM "categories" WHERE slug='cameras'), 2, true, NOW(), NOW()),
  ('Point & Shoot', 'كاميرات صغيرة', 'point-shoot', (SELECT id FROM "categories" WHERE slug='cameras'), 3, true, NOW(), NOW()),
  ('Other Cameras', 'كاميرات أخرى', 'other-cameras', (SELECT id FROM "categories" WHERE slug='cameras'), 99, true, NOW(), NOW()),

  -- TVs (Level 3)
  ('Smart TVs', 'تلفزيون ذكي', 'smart-tvs', (SELECT id FROM "categories" WHERE slug='tvs'), 0, true, NOW(), NOW()),
  ('32 Inch', '32 بوصة', '32-inch', (SELECT id FROM "categories" WHERE slug='tvs'), 1, true, NOW(), NOW()),
  ('43 Inch', '43 بوصة', '43-inch', (SELECT id FROM "categories" WHERE slug='tvs'), 2, true, NOW(), NOW()),
  ('55 Inch', '55 بوصة', '55-inch', (SELECT id FROM "categories" WHERE slug='tvs'), 3, true, NOW(), NOW()),
  ('65 Inch & Above', '65 بوصة وأكثر', '65-inch-above', (SELECT id FROM "categories" WHERE slug='tvs'), 4, true, NOW(), NOW()),
  ('Other TVs', 'تلفزيونات أخرى', 'other-tvs', (SELECT id FROM "categories" WHERE slug='tvs'), 99, true, NOW(), NOW()),

  -- Refrigerators (Level 3) - YOUR EXAMPLE: 24 Feet!
  ('16 Feet', '16 قدم', '16-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 0, true, NOW(), NOW()),
  ('18 Feet', '18 قدم', '18-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 1, true, NOW(), NOW()),
  ('20 Feet', '20 قدم', '20-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 2, true, NOW(), NOW()),
  ('24 Feet', '24 قدم', '24-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 3, true, NOW(), NOW()),
  ('Side by Side', 'جنب إلى جنب', 'side-by-side', (SELECT id FROM "categories" WHERE slug='refrigerators'), 4, true, NOW(), NOW()),
  ('Other Refrigerators', 'ثلاجات أخرى', 'other-refrigerators', (SELECT id FROM "categories" WHERE slug='refrigerators'), 99, true, NOW(), NOW()),

  -- Washing Machines (Level 3)
  ('Top Load', 'تحميل علوي', 'top-load', (SELECT id FROM "categories" WHERE slug='washing-machines'), 0, true, NOW(), NOW()),
  ('Front Load', 'تحميل أمامي', 'front-load', (SELECT id FROM "categories" WHERE slug='washing-machines'), 1, true, NOW(), NOW()),
  ('7 KG', '7 كيلو', '7-kg', (SELECT id FROM "categories" WHERE slug='washing-machines'), 2, true, NOW(), NOW()),
  ('8-10 KG', '8-10 كيلو', '8-10-kg', (SELECT id FROM "categories" WHERE slug='washing-machines'), 3, true, NOW(), NOW()),
  ('11 KG & Above', '11 كيلو وأكثر', '11-kg-above', (SELECT id FROM "categories" WHERE slug='washing-machines'), 4, true, NOW(), NOW()),
  ('Other Washing Machines', 'غسالات أخرى', 'other-washing-machines', (SELECT id FROM "categories" WHERE slug='washing-machines'), 99, true, NOW(), NOW()),

  -- Air Conditioners (Level 3)
  ('1.5 HP', '1.5 حصان', '1-5-hp', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 0, true, NOW(), NOW()),
  ('2.25 HP', '2.25 حصان', '2-25-hp', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 1, true, NOW(), NOW()),
  ('3 HP', '3 حصان', '3-hp', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 2, true, NOW(), NOW()),
  ('Split AC', 'سبليت', 'split-ac', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 3, true, NOW(), NOW()),
  ('Window AC', 'شباك', 'window-ac', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 4, true, NOW(), NOW()),
  ('Other ACs', 'مكيفات أخرى', 'other-acs', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 99, true, NOW(), NOW()),

  -- Microwaves (Level 3)
  ('Solo', 'عادي', 'solo', (SELECT id FROM "categories" WHERE slug='microwaves'), 0, true, NOW(), NOW()),
  ('Grill', 'شواية', 'grill', (SELECT id FROM "categories" WHERE slug='microwaves'), 1, true, NOW(), NOW()),
  ('Convection', 'حراري', 'convection', (SELECT id FROM "categories" WHERE slug='microwaves'), 2, true, NOW(), NOW()),
  ('Other Microwaves', 'ميكروويف آخر', 'other-microwaves', (SELECT id FROM "categories" WHERE slug='microwaves'), 99, true, NOW(), NOW()),

  -- Vacuum Cleaners (Level 3)
  ('Upright', 'عمودي', 'upright', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 0, true, NOW(), NOW()),
  ('Canister', 'أسطواني', 'canister', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 1, true, NOW(), NOW()),
  ('Handheld', 'محمول', 'handheld', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 2, true, NOW(), NOW()),
  ('Robot', 'روبوت', 'robot', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 3, true, NOW(), NOW()),
  ('Other Vacuum Cleaners', 'مكانس أخرى', 'other-vacuums', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 99, true, NOW(), NOW()),

  -- Furniture: Living Room (Level 3)
  ('Sofas', 'الكنب', 'sofas', (SELECT id FROM "categories" WHERE slug='living-room'), 0, true, NOW(), NOW()),
  ('Coffee Tables', 'طاولات القهوة', 'coffee-tables', (SELECT id FROM "categories" WHERE slug='living-room'), 1, true, NOW(), NOW()),
  ('TV Units', 'وحدات التلفزيون', 'tv-units', (SELECT id FROM "categories" WHERE slug='living-room'), 2, true, NOW(), NOW()),
  ('Bookshelves', 'رفوف الكتب', 'bookshelves', (SELECT id FROM "categories" WHERE slug='living-room'), 3, true, NOW(), NOW()),
  ('Other Living Room', 'أثاث صالة آخر', 'other-living-room', (SELECT id FROM "categories" WHERE slug='living-room'), 99, true, NOW(), NOW()),

  -- Furniture: Bedroom (Level 3)
  ('Beds', 'الأسرة', 'beds', (SELECT id FROM "categories" WHERE slug='bedroom'), 0, true, NOW(), NOW()),
  ('Wardrobes', 'الخزائن', 'wardrobes', (SELECT id FROM "categories" WHERE slug='bedroom'), 1, true, NOW(), NOW()),
  ('Dressers', 'التسريحات', 'dressers', (SELECT id FROM "categories" WHERE slug='bedroom'), 2, true, NOW(), NOW()),
  ('Nightstands', 'الكوميدينو', 'nightstands', (SELECT id FROM "categories" WHERE slug='bedroom'), 3, true, NOW(), NOW()),
  ('Other Bedroom', 'أثاث غرفة نوم آخر', 'other-bedroom', (SELECT id FROM "categories" WHERE slug='bedroom'), 99, true, NOW(), NOW()),

  -- Furniture: Dining Room (Level 3)
  ('Dining Tables', 'طاولات الطعام', 'dining-tables', (SELECT id FROM "categories" WHERE slug='dining-room'), 0, true, NOW(), NOW()),
  ('Chairs', 'الكراسي', 'chairs', (SELECT id FROM "categories" WHERE slug='dining-room'), 1, true, NOW(), NOW()),
  ('Buffets', 'البوفيهات', 'buffets', (SELECT id FROM "categories" WHERE slug='dining-room'), 2, true, NOW(), NOW()),
  ('Other Dining', 'أثاث طعام آخر', 'other-dining', (SELECT id FROM "categories" WHERE slug='dining-room'), 99, true, NOW(), NOW()),

  -- Furniture: Office (Level 3)
  ('Desks', 'المكاتب', 'desks', (SELECT id FROM "categories" WHERE slug='office'), 0, true, NOW(), NOW()),
  ('Office Chairs', 'كراسي المكتب', 'office-chairs', (SELECT id FROM "categories" WHERE slug='office'), 1, true, NOW(), NOW()),
  ('Filing Cabinets', 'خزائن الملفات', 'filing-cabinets', (SELECT id FROM "categories" WHERE slug='office'), 2, true, NOW(), NOW()),
  ('Other Office', 'أثاث مكتب آخر', 'other-office', (SELECT id FROM "categories" WHERE slug='office'), 99, true, NOW(), NOW()),

  -- Vehicles: Cars (Level 3)
  ('Sedans', 'سيدان', 'sedans', (SELECT id FROM "categories" WHERE slug='cars'), 0, true, NOW(), NOW()),
  ('SUVs', 'دفع رباعي', 'suvs', (SELECT id FROM "categories" WHERE slug='cars'), 1, true, NOW(), NOW()),
  ('Hatchbacks', 'هاتشباك', 'hatchbacks', (SELECT id FROM "categories" WHERE slug='cars'), 2, true, NOW(), NOW()),
  ('Pickup Trucks', 'شاحنات صغيرة', 'pickup-trucks', (SELECT id FROM "categories" WHERE slug='cars'), 3, true, NOW(), NOW()),
  ('Vans', 'ميكروباص', 'vans', (SELECT id FROM "categories" WHERE slug='cars'), 4, true, NOW(), NOW()),
  ('Other Cars', 'سيارات أخرى', 'other-cars', (SELECT id FROM "categories" WHERE slug='cars'), 99, true, NOW(), NOW()),

  -- Vehicles: Motorcycles (Level 3)
  ('Sport Bikes', 'رياضية', 'sport-bikes', (SELECT id FROM "categories" WHERE slug='motorcycles'), 0, true, NOW(), NOW()),
  ('Cruisers', 'كروزر', 'cruisers', (SELECT id FROM "categories" WHERE slug='motorcycles'), 1, true, NOW(), NOW()),
  ('Scooters', 'سكوتر', 'scooters', (SELECT id FROM "categories" WHERE slug='motorcycles'), 2, true, NOW(), NOW()),
  ('Touring', 'للرحلات', 'touring', (SELECT id FROM "categories" WHERE slug='motorcycles'), 3, true, NOW(), NOW()),
  ('Other Motorcycles', 'دراجات نارية أخرى', 'other-motorcycles', (SELECT id FROM "categories" WHERE slug='motorcycles'), 99, true, NOW(), NOW()),

  -- Vehicles: Bicycles (Level 3)
  ('Mountain Bikes', 'جبلية', 'mountain-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 0, true, NOW(), NOW()),
  ('Road Bikes', 'طريق', 'road-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 1, true, NOW(), NOW()),
  ('Electric Bikes', 'كهربائية', 'electric-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 2, true, NOW(), NOW()),
  ('Kids Bikes', 'للأطفال', 'kids-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 3, true, NOW(), NOW()),
  ('Other Bicycles', 'دراجات أخرى', 'other-bicycles', (SELECT id FROM "categories" WHERE slug='bicycles'), 99, true, NOW(), NOW()),

  -- Fashion: Men's Clothing (Level 3)
  ('Shirts', 'قمصان', 'shirts', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 0, true, NOW(), NOW()),
  ('T-Shirts', 'تيشرتات', 't-shirts', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 1, true, NOW(), NOW()),
  ('Pants', 'بناطيل', 'pants', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 2, true, NOW(), NOW()),
  ('Suits', 'بدل', 'suits', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 3, true, NOW(), NOW()),
  ('Jackets', 'جاكيتات', 'jackets', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 4, true, NOW(), NOW()),
  ('Other Men''s Clothing', 'ملابس رجالية أخرى', 'other-mens-clothing', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 99, true, NOW(), NOW()),

  -- Fashion: Women's Clothing (Level 3)
  ('Dresses', 'فساتين', 'dresses', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 0, true, NOW(), NOW()),
  ('Tops', 'بلوزات', 'tops', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 1, true, NOW(), NOW()),
  ('Skirts', 'تنانير', 'skirts', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 2, true, NOW(), NOW()),
  ('Pants', 'بناطيل', 'womens-pants', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 3, true, NOW(), NOW()),
  ('Abayas', 'عبايات', 'abayas', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 4, true, NOW(), NOW()),
  ('Other Women''s Clothing', 'ملابس نسائية أخرى', 'other-womens-clothing', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 99, true, NOW(), NOW()),

  -- Fashion: Shoes (Level 3)
  ('Sneakers', 'أحذية رياضية', 'sneakers', (SELECT id FROM "categories" WHERE slug='shoes'), 0, true, NOW(), NOW()),
  ('Formal Shoes', 'أحذية رسمية', 'formal-shoes', (SELECT id FROM "categories" WHERE slug='shoes'), 1, true, NOW(), NOW()),
  ('Sandals', 'صنادل', 'sandals', (SELECT id FROM "categories" WHERE slug='shoes'), 2, true, NOW(), NOW()),
  ('Boots', 'أحذية طويلة', 'boots', (SELECT id FROM "categories" WHERE slug='shoes'), 3, true, NOW(), NOW()),
  ('Other Shoes', 'أحذية أخرى', 'other-shoes', (SELECT id FROM "categories" WHERE slug='shoes'), 99, true, NOW(), NOW()),

  -- Fashion: Bags (Level 3)
  ('Handbags', 'حقائب يد', 'handbags', (SELECT id FROM "categories" WHERE slug='bags'), 0, true, NOW(), NOW()),
  ('Backpacks', 'حقائب ظهر', 'backpacks', (SELECT id FROM "categories" WHERE slug='bags'), 1, true, NOW(), NOW()),
  ('Wallets', 'محافظ', 'wallets', (SELECT id FROM "categories" WHERE slug='bags'), 2, true, NOW(), NOW()),
  ('Travel Bags', 'حقائب سفر', 'travel-bags', (SELECT id FROM "categories" WHERE slug='bags'), 3, true, NOW(), NOW()),
  ('Other Bags', 'حقائب أخرى', 'other-bags', (SELECT id FROM "categories" WHERE slug='bags'), 99, true, NOW(), NOW()),

  -- Sports: Gym Equipment (Level 3)
  ('Treadmills', 'جهاز المشي', 'treadmills', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 0, true, NOW(), NOW()),
  ('Dumbbells', 'دمبلز', 'dumbbells', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 1, true, NOW(), NOW()),
  ('Benches', 'مقاعد', 'benches', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 2, true, NOW(), NOW()),
  ('Exercise Bikes', 'دراجات التمرين', 'exercise-bikes', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 3, true, NOW(), NOW()),
  ('Other Gym Equipment', 'معدات جيم أخرى', 'other-gym-equipment', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 99, true, NOW(), NOW()),

  -- Sports: Outdoor Sports (Level 3)
  ('Football', 'كرة القدم', 'football', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 0, true, NOW(), NOW()),
  ('Basketball', 'كرة السلة', 'basketball', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 1, true, NOW(), NOW()),
  ('Tennis', 'التنس', 'tennis', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 2, true, NOW(), NOW()),
  ('Swimming', 'السباحة', 'swimming', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 3, true, NOW(), NOW()),
  ('Other Sports', 'رياضات أخرى', 'other-outdoor-sports', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 99, true, NOW(), NOW()),

  -- Books (Level 3)
  ('Fiction', 'روايات', 'fiction', (SELECT id FROM "categories" WHERE slug='books'), 0, true, NOW(), NOW()),
  ('Non-Fiction', 'غير روائية', 'non-fiction', (SELECT id FROM "categories" WHERE slug='books'), 1, true, NOW(), NOW()),
  ('Educational', 'تعليمية', 'educational', (SELECT id FROM "categories" WHERE slug='books'), 2, true, NOW(), NOW()),
  ('Religious', 'دينية', 'religious', (SELECT id FROM "categories" WHERE slug='books'), 3, true, NOW(), NOW()),
  ('Children Books', 'كتب أطفال', 'children-books', (SELECT id FROM "categories" WHERE slug='books'), 4, true, NOW(), NOW()),
  ('Other Books', 'كتب أخرى', 'other-books', (SELECT id FROM "categories" WHERE slug='books'), 99, true, NOW(), NOW()),

  -- Video Games (Level 3)
  ('PlayStation', 'بلايستيشن', 'playstation', (SELECT id FROM "categories" WHERE slug='video-games'), 0, true, NOW(), NOW()),
  ('Xbox', 'إكس بوكس', 'xbox', (SELECT id FROM "categories" WHERE slug='video-games'), 1, true, NOW(), NOW()),
  ('Nintendo', 'نينتندو', 'nintendo', (SELECT id FROM "categories" WHERE slug='video-games'), 2, true, NOW(), NOW()),
  ('PC Games', 'ألعاب كمبيوتر', 'pc-games', (SELECT id FROM "categories" WHERE slug='video-games'), 3, true, NOW(), NOW()),
  ('Other Games', 'ألعاب أخرى', 'other-games', (SELECT id FROM "categories" WHERE slug='video-games'), 99, true, NOW(), NOW()),

  -- Kids: Baby Gear (Level 3)
  ('Strollers', 'عربات الأطفال', 'strollers', (SELECT id FROM "categories" WHERE slug='baby-gear'), 0, true, NOW(), NOW()),
  ('Car Seats', 'مقاعد السيارة', 'car-seats', (SELECT id FROM "categories" WHERE slug='baby-gear'), 1, true, NOW(), NOW()),
  ('Cribs', 'أسرة الأطفال', 'cribs', (SELECT id FROM "categories" WHERE slug='baby-gear'), 2, true, NOW(), NOW()),
  ('High Chairs', 'كراسي الطعام', 'high-chairs', (SELECT id FROM "categories" WHERE slug='baby-gear'), 3, true, NOW(), NOW()),
  ('Other Baby Gear', 'معدات أطفال أخرى', 'other-baby-gear', (SELECT id FROM "categories" WHERE slug='baby-gear'), 99, true, NOW(), NOW()),

  -- Kids: Toys (Level 3)
  ('Educational Toys', 'ألعاب تعليمية', 'educational-toys', (SELECT id FROM "categories" WHERE slug='toys'), 0, true, NOW(), NOW()),
  ('Dolls', 'عرائس', 'dolls', (SELECT id FROM "categories" WHERE slug='toys'), 1, true, NOW(), NOW()),
  ('Action Figures', 'شخصيات', 'action-figures', (SELECT id FROM "categories" WHERE slug='toys'), 2, true, NOW(), NOW()),
  ('Building Blocks', 'مكعبات', 'building-blocks', (SELECT id FROM "categories" WHERE slug='toys'), 3, true, NOW(), NOW()),
  ('Other Toys', 'ألعاب أخرى', 'other-toys', (SELECT id FROM "categories" WHERE slug='toys'), 99, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERY - Run this to check results
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
