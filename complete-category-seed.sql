-- ============================================================================
-- COMPLETE CATEGORY SEED - All Levels with "Other" Options
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- LEVEL 2: Sub-Categories (with "Other" options)
-- ============================================================================

INSERT INTO "categories" ("name_ar", "name_en", "slug", "parent_id", "order", "is_active")
VALUES
  -- Electronics Sub-Categories
  ('الهواتف الذكية', 'Smartphones', 'smartphones', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 0, true),
  ('أجهزة الكمبيوتر المحمولة', 'Laptops', 'laptops', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 1, true),
  ('الأجهزة اللوحية', 'Tablets', 'tablets', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 2, true),
  ('الكاميرات', 'Cameras', 'cameras', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 3, true),
  ('أجهزة التلفزيون', 'TVs', 'tvs', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 4, true),
  ('إلكترونيات أخرى', 'Other Electronics', 'other-electronics', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 99, true),

  -- Home Appliances Sub-Categories
  ('الثلاجات', 'Refrigerators', 'refrigerators', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 0, true),
  ('الغسالات', 'Washing Machines', 'washing-machines', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 1, true),
  ('مكيفات الهواء', 'Air Conditioners', 'air-conditioners', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 2, true),
  ('الميكروويف', 'Microwaves', 'microwaves', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 3, true),
  ('المكانس الكهربائية', 'Vacuum Cleaners', 'vacuum-cleaners', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 4, true),
  ('أجهزة أخرى', 'Other Appliances', 'other-appliances', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 99, true),

  -- Furniture Sub-Categories
  ('غرفة المعيشة', 'Living Room', 'living-room', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 0, true),
  ('غرفة النوم', 'Bedroom', 'bedroom', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 1, true),
  ('غرفة الطعام', 'Dining Room', 'dining-room', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 2, true),
  ('المكتب', 'Office', 'office', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 3, true),
  ('أثاث آخر', 'Other Furniture', 'other-furniture', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 99, true),

  -- Vehicles Sub-Categories
  ('السيارات', 'Cars', 'cars', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 0, true),
  ('الدراجات النارية', 'Motorcycles', 'motorcycles', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 1, true),
  ('الدراجات', 'Bicycles', 'bicycles', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 2, true),
  ('مركبات أخرى', 'Other Vehicles', 'other-vehicles', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 99, true),

  -- Fashion Sub-Categories
  ('ملابس رجالية', 'Men''s Clothing', 'mens-clothing', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 0, true),
  ('ملابس نسائية', 'Women''s Clothing', 'womens-clothing', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 1, true),
  ('الأحذية', 'Shoes', 'shoes', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 2, true),
  ('الحقائب', 'Bags', 'bags', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 3, true),
  ('أزياء أخرى', 'Other Fashion', 'other-fashion', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 99, true),

  -- Sports Sub-Categories
  ('معدات الجيم', 'Gym Equipment', 'gym-equipment', (SELECT id FROM "categories" WHERE slug='sports-fitness' AND parent_id IS NULL), 0, true),
  ('رياضات خارجية', 'Outdoor Sports', 'outdoor-sports', (SELECT id FROM "categories" WHERE slug='sports-fitness' AND parent_id IS NULL), 1, true),
  ('رياضات أخرى', 'Other Sports', 'other-sports', (SELECT id FROM "categories" WHERE slug='sports-fitness' AND parent_id IS NULL), 99, true),

  -- Books & Media Sub-Categories
  ('الكتب', 'Books', 'books', (SELECT id FROM "categories" WHERE slug='books-media' AND parent_id IS NULL), 0, true),
  ('ألعاب الفيديو', 'Video Games', 'video-games', (SELECT id FROM "categories" WHERE slug='books-media' AND parent_id IS NULL), 1, true),
  ('وسائط أخرى', 'Other Media', 'other-media', (SELECT id FROM "categories" WHERE slug='books-media' AND parent_id IS NULL), 99, true),

  -- Kids & Baby Sub-Categories
  ('معدات الأطفال', 'Baby Gear', 'baby-gear', (SELECT id FROM "categories" WHERE slug='kids-baby' AND parent_id IS NULL), 0, true),
  ('الألعاب', 'Toys', 'toys', (SELECT id FROM "categories" WHERE slug='kids-baby' AND parent_id IS NULL), 1, true),
  ('مستلزمات أطفال أخرى', 'Other Kids Items', 'other-kids', (SELECT id FROM "categories" WHERE slug='kids-baby' AND parent_id IS NULL), 99, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- LEVEL 3: Sub-Sub-Categories (with "Other" options)
-- ============================================================================

INSERT INTO "categories" ("name_ar", "name_en", "slug", "parent_id", "order", "is_active")
VALUES
  -- Smartphones (Level 3)
  ('آيفون', 'iPhone', 'iphone', (SELECT id FROM "categories" WHERE slug='smartphones'), 0, true),
  ('سامسونج', 'Samsung', 'samsung', (SELECT id FROM "categories" WHERE slug='smartphones'), 1, true),
  ('شاومي', 'Xiaomi', 'xiaomi', (SELECT id FROM "categories" WHERE slug='smartphones'), 2, true),
  ('أوبو', 'Oppo', 'oppo', (SELECT id FROM "categories" WHERE slug='smartphones'), 3, true),
  ('فيفو', 'Vivo', 'vivo', (SELECT id FROM "categories" WHERE slug='smartphones'), 4, true),
  ('هواوي', 'Huawei', 'huawei', (SELECT id FROM "categories" WHERE slug='smartphones'), 5, true),
  ('هواتف أخرى', 'Other Smartphones', 'other-smartphones', (SELECT id FROM "categories" WHERE slug='smartphones'), 99, true),

  -- Laptops (Level 3)
  ('ماك بوك', 'MacBook', 'macbook', (SELECT id FROM "categories" WHERE slug='laptops'), 0, true),
  ('أجهزة الألعاب', 'Gaming Laptops', 'gaming-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 1, true),
  ('أجهزة الأعمال', 'Business Laptops', 'business-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 2, true),
  ('الترابوك', 'Ultrabooks', 'ultrabooks', (SELECT id FROM "categories" WHERE slug='laptops'), 3, true),
  ('أجهزة اقتصادية', 'Budget Laptops', 'budget-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 4, true),
  ('أجهزة كمبيوتر أخرى', 'Other Laptops', 'other-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 99, true),

  -- Tablets (Level 3)
  ('آيباد', 'iPad', 'ipad', (SELECT id FROM "categories" WHERE slug='tablets'), 0, true),
  ('سامسونج', 'Samsung Tablets', 'samsung-tablets', (SELECT id FROM "categories" WHERE slug='tablets'), 1, true),
  ('أجهزة لوحية أخرى', 'Other Tablets', 'other-tablets', (SELECT id FROM "categories" WHERE slug='tablets'), 99, true),

  -- Cameras (Level 3)
  ('دي إس إل آر', 'DSLR', 'dslr', (SELECT id FROM "categories" WHERE slug='cameras'), 0, true),
  ('ميرورليس', 'Mirrorless', 'mirrorless', (SELECT id FROM "categories" WHERE slug='cameras'), 1, true),
  ('كاميرات الأكشن', 'Action Cameras', 'action-cameras', (SELECT id FROM "categories" WHERE slug='cameras'), 2, true),
  ('كاميرات صغيرة', 'Point & Shoot', 'point-shoot', (SELECT id FROM "categories" WHERE slug='cameras'), 3, true),
  ('كاميرات أخرى', 'Other Cameras', 'other-cameras', (SELECT id FROM "categories" WHERE slug='cameras'), 99, true),

  -- TVs (Level 3)
  ('تلفزيون ذكي', 'Smart TVs', 'smart-tvs', (SELECT id FROM "categories" WHERE slug='tvs'), 0, true),
  ('32 بوصة', '32 Inch', '32-inch', (SELECT id FROM "categories" WHERE slug='tvs'), 1, true),
  ('43 بوصة', '43 Inch', '43-inch', (SELECT id FROM "categories" WHERE slug='tvs'), 2, true),
  ('55 بوصة', '55 Inch', '55-inch', (SELECT id FROM "categories" WHERE slug='tvs'), 3, true),
  ('65 بوصة وأكثر', '65 Inch & Above', '65-inch-above', (SELECT id FROM "categories" WHERE slug='tvs'), 4, true),
  ('تلفزيونات أخرى', 'Other TVs', 'other-tvs', (SELECT id FROM "categories" WHERE slug='tvs'), 99, true),

  -- Refrigerators (Level 3) - YOUR EXAMPLE: 24 Feet!
  ('16 قدم', '16 Feet', '16-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 0, true),
  ('18 قدم', '18 Feet', '18-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 1, true),
  ('20 قدم', '20 Feet', '20-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 2, true),
  ('24 قدم', '24 Feet', '24-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 3, true),
  ('جنب إلى جنب', 'Side by Side', 'side-by-side', (SELECT id FROM "categories" WHERE slug='refrigerators'), 4, true),
  ('ثلاجات أخرى', 'Other Refrigerators', 'other-refrigerators', (SELECT id FROM "categories" WHERE slug='refrigerators'), 99, true),

  -- Washing Machines (Level 3)
  ('تحميل علوي', 'Top Load', 'top-load', (SELECT id FROM "categories" WHERE slug='washing-machines'), 0, true),
  ('تحميل أمامي', 'Front Load', 'front-load', (SELECT id FROM "categories" WHERE slug='washing-machines'), 1, true),
  ('7 كيلو', '7 KG', '7-kg', (SELECT id FROM "categories" WHERE slug='washing-machines'), 2, true),
  ('8-10 كيلو', '8-10 KG', '8-10-kg', (SELECT id FROM "categories" WHERE slug='washing-machines'), 3, true),
  ('11 كيلو وأكثر', '11 KG & Above', '11-kg-above', (SELECT id FROM "categories" WHERE slug='washing-machines'), 4, true),
  ('غسالات أخرى', 'Other Washing Machines', 'other-washing-machines', (SELECT id FROM "categories" WHERE slug='washing-machines'), 99, true),

  -- Air Conditioners (Level 3)
  ('1.5 حصان', '1.5 HP', '1-5-hp', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 0, true),
  ('2.25 حصان', '2.25 HP', '2-25-hp', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 1, true),
  ('3 حصان', '3 HP', '3-hp', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 2, true),
  ('سبليت', 'Split AC', 'split-ac', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 3, true),
  ('شباك', 'Window AC', 'window-ac', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 4, true),
  ('مكيفات أخرى', 'Other ACs', 'other-acs', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 99, true),

  -- Microwaves (Level 3)
  ('عادي', 'Solo', 'solo', (SELECT id FROM "categories" WHERE slug='microwaves'), 0, true),
  ('شواية', 'Grill', 'grill', (SELECT id FROM "categories" WHERE slug='microwaves'), 1, true),
  ('حراري', 'Convection', 'convection', (SELECT id FROM "categories" WHERE slug='microwaves'), 2, true),
  ('ميكروويف آخر', 'Other Microwaves', 'other-microwaves', (SELECT id FROM "categories" WHERE slug='microwaves'), 99, true),

  -- Vacuum Cleaners (Level 3)
  ('عمودي', 'Upright', 'upright', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 0, true),
  ('أسطواني', 'Canister', 'canister', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 1, true),
  ('محمول', 'Handheld', 'handheld', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 2, true),
  ('روبوت', 'Robot', 'robot', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 3, true),
  ('مكانس أخرى', 'Other Vacuum Cleaners', 'other-vacuums', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 99, true),

  -- Furniture: Living Room (Level 3)
  ('الكنب', 'Sofas', 'sofas', (SELECT id FROM "categories" WHERE slug='living-room'), 0, true),
  ('طاولات القهوة', 'Coffee Tables', 'coffee-tables', (SELECT id FROM "categories" WHERE slug='living-room'), 1, true),
  ('وحدات التلفزيون', 'TV Units', 'tv-units', (SELECT id FROM "categories" WHERE slug='living-room'), 2, true),
  ('رفوف الكتب', 'Bookshelves', 'bookshelves', (SELECT id FROM "categories" WHERE slug='living-room'), 3, true),
  ('أثاث صالة آخر', 'Other Living Room', 'other-living-room', (SELECT id FROM "categories" WHERE slug='living-room'), 99, true),

  -- Furniture: Bedroom (Level 3)
  ('الأسرة', 'Beds', 'beds', (SELECT id FROM "categories" WHERE slug='bedroom'), 0, true),
  ('الخزائن', 'Wardrobes', 'wardrobes', (SELECT id FROM "categories" WHERE slug='bedroom'), 1, true),
  ('التسريحات', 'Dressers', 'dressers', (SELECT id FROM "categories" WHERE slug='bedroom'), 2, true),
  ('الكوميدينو', 'Nightstands', 'nightstands', (SELECT id FROM "categories" WHERE slug='bedroom'), 3, true),
  ('أثاث غرفة نوم آخر', 'Other Bedroom', 'other-bedroom', (SELECT id FROM "categories" WHERE slug='bedroom'), 99, true),

  -- Furniture: Dining Room (Level 3)
  ('طاولات الطعام', 'Dining Tables', 'dining-tables', (SELECT id FROM "categories" WHERE slug='dining-room'), 0, true),
  ('الكراسي', 'Chairs', 'chairs', (SELECT id FROM "categories" WHERE slug='dining-room'), 1, true),
  ('البوفيهات', 'Buffets', 'buffets', (SELECT id FROM "categories" WHERE slug='dining-room'), 2, true),
  ('أثاث طعام آخر', 'Other Dining', 'other-dining', (SELECT id FROM "categories" WHERE slug='dining-room'), 99, true),

  -- Furniture: Office (Level 3)
  ('المكاتب', 'Desks', 'desks', (SELECT id FROM "categories" WHERE slug='office'), 0, true),
  ('كراسي المكتب', 'Office Chairs', 'office-chairs', (SELECT id FROM "categories" WHERE slug='office'), 1, true),
  ('خزائن الملفات', 'Filing Cabinets', 'filing-cabinets', (SELECT id FROM "categories" WHERE slug='office'), 2, true),
  ('أثاث مكتب آخر', 'Other Office', 'other-office', (SELECT id FROM "categories" WHERE slug='office'), 99, true),

  -- Vehicles: Cars (Level 3)
  ('سيدان', 'Sedans', 'sedans', (SELECT id FROM "categories" WHERE slug='cars'), 0, true),
  ('دفع رباعي', 'SUVs', 'suvs', (SELECT id FROM "categories" WHERE slug='cars'), 1, true),
  ('هاتشباك', 'Hatchbacks', 'hatchbacks', (SELECT id FROM "categories" WHERE slug='cars'), 2, true),
  ('شاحنات صغيرة', 'Pickup Trucks', 'pickup-trucks', (SELECT id FROM "categories" WHERE slug='cars'), 3, true),
  ('ميكروباص', 'Vans', 'vans', (SELECT id FROM "categories" WHERE slug='cars'), 4, true),
  ('سيارات أخرى', 'Other Cars', 'other-cars', (SELECT id FROM "categories" WHERE slug='cars'), 99, true),

  -- Vehicles: Motorcycles (Level 3)
  ('رياضية', 'Sport Bikes', 'sport-bikes', (SELECT id FROM "categories" WHERE slug='motorcycles'), 0, true),
  ('كروزر', 'Cruisers', 'cruisers', (SELECT id FROM "categories" WHERE slug='motorcycles'), 1, true),
  ('سكوتر', 'Scooters', 'scooters', (SELECT id FROM "categories" WHERE slug='motorcycles'), 2, true),
  ('للرحلات', 'Touring', 'touring', (SELECT id FROM "categories" WHERE slug='motorcycles'), 3, true),
  ('دراجات نارية أخرى', 'Other Motorcycles', 'other-motorcycles', (SELECT id FROM "categories" WHERE slug='motorcycles'), 99, true),

  -- Vehicles: Bicycles (Level 3)
  ('جبلية', 'Mountain Bikes', 'mountain-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 0, true),
  ('طريق', 'Road Bikes', 'road-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 1, true),
  ('كهربائية', 'Electric Bikes', 'electric-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 2, true),
  ('للأطفال', 'Kids Bikes', 'kids-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 3, true),
  ('دراجات أخرى', 'Other Bicycles', 'other-bicycles', (SELECT id FROM "categories" WHERE slug='bicycles'), 99, true),

  -- Fashion: Men's Clothing (Level 3)
  ('قمصان', 'Shirts', 'shirts', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 0, true),
  ('تيشرتات', 'T-Shirts', 't-shirts', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 1, true),
  ('بناطيل', 'Pants', 'pants', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 2, true),
  ('بدل', 'Suits', 'suits', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 3, true),
  ('جاكيتات', 'Jackets', 'jackets', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 4, true),
  ('ملابس رجالية أخرى', 'Other Men''s Clothing', 'other-mens-clothing', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 99, true),

  -- Fashion: Women's Clothing (Level 3)
  ('فساتين', 'Dresses', 'dresses', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 0, true),
  ('بلوزات', 'Tops', 'tops', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 1, true),
  ('تنانير', 'Skirts', 'skirts', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 2, true),
  ('بناطيل', 'Pants', 'womens-pants', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 3, true),
  ('عبايات', 'Abayas', 'abayas', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 4, true),
  ('ملابس نسائية أخرى', 'Other Women''s Clothing', 'other-womens-clothing', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 99, true),

  -- Fashion: Shoes (Level 3)
  ('أحذية رياضية', 'Sneakers', 'sneakers', (SELECT id FROM "categories" WHERE slug='shoes'), 0, true),
  ('أحذية رسمية', 'Formal Shoes', 'formal-shoes', (SELECT id FROM "categories" WHERE slug='shoes'), 1, true),
  ('صنادل', 'Sandals', 'sandals', (SELECT id FROM "categories" WHERE slug='shoes'), 2, true),
  ('أحذية طويلة', 'Boots', 'boots', (SELECT id FROM "categories" WHERE slug='shoes'), 3, true),
  ('أحذية أخرى', 'Other Shoes', 'other-shoes', (SELECT id FROM "categories" WHERE slug='shoes'), 99, true),

  -- Fashion: Bags (Level 3)
  ('حقائب يد', 'Handbags', 'handbags', (SELECT id FROM "categories" WHERE slug='bags'), 0, true),
  ('حقائب ظهر', 'Backpacks', 'backpacks', (SELECT id FROM "categories" WHERE slug='bags'), 1, true),
  ('محافظ', 'Wallets', 'wallets', (SELECT id FROM "categories" WHERE slug='bags'), 2, true),
  ('حقائب سفر', 'Travel Bags', 'travel-bags', (SELECT id FROM "categories" WHERE slug='bags'), 3, true),
  ('حقائب أخرى', 'Other Bags', 'other-bags', (SELECT id FROM "categories" WHERE slug='bags'), 99, true),

  -- Sports: Gym Equipment (Level 3)
  ('جهاز المشي', 'Treadmills', 'treadmills', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 0, true),
  ('دمبلز', 'Dumbbells', 'dumbbells', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 1, true),
  ('مقاعد', 'Benches', 'benches', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 2, true),
  ('دراجات التمرين', 'Exercise Bikes', 'exercise-bikes', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 3, true),
  ('معدات جيم أخرى', 'Other Gym Equipment', 'other-gym-equipment', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 99, true),

  -- Sports: Outdoor Sports (Level 3)
  ('كرة القدم', 'Football', 'football', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 0, true),
  ('كرة السلة', 'Basketball', 'basketball', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 1, true),
  ('التنس', 'Tennis', 'tennis', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 2, true),
  ('السباحة', 'Swimming', 'swimming', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 3, true),
  ('رياضات أخرى', 'Other Sports', 'other-outdoor-sports', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 99, true),

  -- Books (Level 3)
  ('روايات', 'Fiction', 'fiction', (SELECT id FROM "categories" WHERE slug='books'), 0, true),
  ('غير روائية', 'Non-Fiction', 'non-fiction', (SELECT id FROM "categories" WHERE slug='books'), 1, true),
  ('تعليمية', 'Educational', 'educational', (SELECT id FROM "categories" WHERE slug='books'), 2, true),
  ('دينية', 'Religious', 'religious', (SELECT id FROM "categories" WHERE slug='books'), 3, true),
  ('كتب أطفال', 'Children Books', 'children-books', (SELECT id FROM "categories" WHERE slug='books'), 4, true),
  ('كتب أخرى', 'Other Books', 'other-books', (SELECT id FROM "categories" WHERE slug='books'), 99, true),

  -- Video Games (Level 3)
  ('بلايستيشن', 'PlayStation', 'playstation', (SELECT id FROM "categories" WHERE slug='video-games'), 0, true),
  ('إكس بوكس', 'Xbox', 'xbox', (SELECT id FROM "categories" WHERE slug='video-games'), 1, true),
  ('نينتندو', 'Nintendo', 'nintendo', (SELECT id FROM "categories" WHERE slug='video-games'), 2, true),
  ('ألعاب كمبيوتر', 'PC Games', 'pc-games', (SELECT id FROM "categories" WHERE slug='video-games'), 3, true),
  ('ألعاب أخرى', 'Other Games', 'other-games', (SELECT id FROM "categories" WHERE slug='video-games'), 99, true),

  -- Kids: Baby Gear (Level 3)
  ('عربات الأطفال', 'Strollers', 'strollers', (SELECT id FROM "categories" WHERE slug='baby-gear'), 0, true),
  ('مقاعد السيارة', 'Car Seats', 'car-seats', (SELECT id FROM "categories" WHERE slug='baby-gear'), 1, true),
  ('أسرة الأطفال', 'Cribs', 'cribs', (SELECT id FROM "categories" WHERE slug='baby-gear'), 2, true),
  ('كراسي الطعام', 'High Chairs', 'high-chairs', (SELECT id FROM "categories" WHERE slug='baby-gear'), 3, true),
  ('معدات أطفال أخرى', 'Other Baby Gear', 'other-baby-gear', (SELECT id FROM "categories" WHERE slug='baby-gear'), 99, true),

  -- Kids: Toys (Level 3)
  ('ألعاب تعليمية', 'Educational Toys', 'educational-toys', (SELECT id FROM "categories" WHERE slug='toys'), 0, true),
  ('عرائس', 'Dolls', 'dolls', (SELECT id FROM "categories" WHERE slug='toys'), 1, true),
  ('شخصيات', 'Action Figures', 'action-figures', (SELECT id FROM "categories" WHERE slug='toys'), 2, true),
  ('مكعبات', 'Building Blocks', 'building-blocks', (SELECT id FROM "categories" WHERE slug='toys'), 3, true),
  ('ألعاب أخرى', 'Other Toys', 'other-toys', (SELECT id FROM "categories" WHERE slug='toys'), 99, true)
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
