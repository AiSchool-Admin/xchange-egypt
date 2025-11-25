-- ============================================================================
-- COMPLETE CATEGORY SEED - All Levels with "Other" Options
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- LEVEL 2: Sub-Categories (with "Other" options)
-- ============================================================================

INSERT INTO "categories" ("id", "name_ar", "name_en", "slug", "parent_id", "order", "is_active", "created_at", "updated_at")
VALUES
  -- Electronics Sub-Categories
  (uuid_generate_v4(), 'الهواتف الذكية', 'Smartphones', 'smartphones', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أجهزة الكمبيوتر المحمولة', 'Laptops', 'laptops', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الأجهزة اللوحية', 'Tablets', 'tablets', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الكاميرات', 'Cameras', 'cameras', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أجهزة التلفزيون', 'TVs', 'tvs', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'إلكترونيات أخرى', 'Other Electronics', 'other-electronics', (SELECT id FROM "categories" WHERE slug='electronics' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Home Appliances Sub-Categories
  (uuid_generate_v4(), 'الثلاجات', 'Refrigerators', 'refrigerators', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الغسالات', 'Washing Machines', 'washing-machines', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'مكيفات الهواء', 'Air Conditioners', 'air-conditioners', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الميكروويف', 'Microwaves', 'microwaves', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'المكانس الكهربائية', 'Vacuum Cleaners', 'vacuum-cleaners', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أجهزة أخرى', 'Other Appliances', 'other-appliances', (SELECT id FROM "categories" WHERE slug='home-appliances' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Furniture Sub-Categories
  (uuid_generate_v4(), 'غرفة المعيشة', 'Living Room', 'living-room', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'غرفة النوم', 'Bedroom', 'bedroom', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'غرفة الطعام', 'Dining Room', 'dining-room', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'المكتب', 'Office', 'office', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أثاث آخر', 'Other Furniture', 'other-furniture', (SELECT id FROM "categories" WHERE slug='furniture' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Vehicles Sub-Categories
  (uuid_generate_v4(), 'السيارات', 'Cars', 'cars', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الدراجات النارية', 'Motorcycles', 'motorcycles', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الدراجات', 'Bicycles', 'bicycles', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'مركبات أخرى', 'Other Vehicles', 'other-vehicles', (SELECT id FROM "categories" WHERE slug='vehicles' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Fashion Sub-Categories
  (uuid_generate_v4(), 'ملابس رجالية', 'Men''s Clothing', 'mens-clothing', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'ملابس نسائية', 'Women''s Clothing', 'womens-clothing', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الأحذية', 'Shoes', 'shoes', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الحقائب', 'Bags', 'bags', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أزياء أخرى', 'Other Fashion', 'other-fashion', (SELECT id FROM "categories" WHERE slug='fashion-clothing' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Sports Sub-Categories
  (uuid_generate_v4(), 'معدات الجيم', 'Gym Equipment', 'gym-equipment', (SELECT id FROM "categories" WHERE slug='sports-fitness' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'رياضات خارجية', 'Outdoor Sports', 'outdoor-sports', (SELECT id FROM "categories" WHERE slug='sports-fitness' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'رياضات أخرى', 'Other Sports', 'other-sports', (SELECT id FROM "categories" WHERE slug='sports-fitness' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Books & Media Sub-Categories
  (uuid_generate_v4(), 'الكتب', 'Books', 'books', (SELECT id FROM "categories" WHERE slug='books-media' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'ألعاب الفيديو', 'Video Games', 'video-games', (SELECT id FROM "categories" WHERE slug='books-media' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'وسائط أخرى', 'Other Media', 'other-media', (SELECT id FROM "categories" WHERE slug='books-media' AND parent_id IS NULL), 99, true, NOW(), NOW()),

  -- Kids & Baby Sub-Categories
  (uuid_generate_v4(), 'معدات الأطفال', 'Baby Gear', 'baby-gear', (SELECT id FROM "categories" WHERE slug='kids-baby' AND parent_id IS NULL), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الألعاب', 'Toys', 'toys', (SELECT id FROM "categories" WHERE slug='kids-baby' AND parent_id IS NULL), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'مستلزمات أطفال أخرى', 'Other Kids Items', 'other-kids', (SELECT id FROM "categories" WHERE slug='kids-baby' AND parent_id IS NULL), 99, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- LEVEL 3: Sub-Sub-Categories (with "Other" options)
-- ============================================================================

INSERT INTO "categories" ("id", "name_ar", "name_en", "slug", "parent_id", "order", "is_active", "created_at", "updated_at")
VALUES
  -- Smartphones (Level 3)
  (uuid_generate_v4(), 'آيفون', 'iPhone', 'iphone', (SELECT id FROM "categories" WHERE slug='smartphones'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'سامسونج', 'Samsung', 'samsung', (SELECT id FROM "categories" WHERE slug='smartphones'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'شاومي', 'Xiaomi', 'xiaomi', (SELECT id FROM "categories" WHERE slug='smartphones'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أوبو', 'Oppo', 'oppo', (SELECT id FROM "categories" WHERE slug='smartphones'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'فيفو', 'Vivo', 'vivo', (SELECT id FROM "categories" WHERE slug='smartphones'), 4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'هواوي', 'Huawei', 'huawei', (SELECT id FROM "categories" WHERE slug='smartphones'), 5, true, NOW(), NOW()),
  (uuid_generate_v4(), 'هواتف أخرى', 'Other Smartphones', 'other-smartphones', (SELECT id FROM "categories" WHERE slug='smartphones'), 99, true, NOW(), NOW()),

  -- Laptops (Level 3)
  (uuid_generate_v4(), 'ماك بوك', 'MacBook', 'macbook', (SELECT id FROM "categories" WHERE slug='laptops'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أجهزة الألعاب', 'Gaming Laptops', 'gaming-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أجهزة الأعمال', 'Business Laptops', 'business-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الترابوك', 'Ultrabooks', 'ultrabooks', (SELECT id FROM "categories" WHERE slug='laptops'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أجهزة اقتصادية', 'Budget Laptops', 'budget-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أجهزة كمبيوتر أخرى', 'Other Laptops', 'other-laptops', (SELECT id FROM "categories" WHERE slug='laptops'), 99, true, NOW(), NOW()),

  -- Tablets (Level 3)
  (uuid_generate_v4(), 'آيباد', 'iPad', 'ipad', (SELECT id FROM "categories" WHERE slug='tablets'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'سامسونج', 'Samsung Tablets', 'samsung-tablets', (SELECT id FROM "categories" WHERE slug='tablets'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أجهزة لوحية أخرى', 'Other Tablets', 'other-tablets', (SELECT id FROM "categories" WHERE slug='tablets'), 99, true, NOW(), NOW()),

  -- Cameras (Level 3)
  (uuid_generate_v4(), 'دي إس إل آر', 'DSLR', 'dslr', (SELECT id FROM "categories" WHERE slug='cameras'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'ميرورليس', 'Mirrorless', 'mirrorless', (SELECT id FROM "categories" WHERE slug='cameras'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'كاميرات الأكشن', 'Action Cameras', 'action-cameras', (SELECT id FROM "categories" WHERE slug='cameras'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'كاميرات صغيرة', 'Point & Shoot', 'point-shoot', (SELECT id FROM "categories" WHERE slug='cameras'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'كاميرات أخرى', 'Other Cameras', 'other-cameras', (SELECT id FROM "categories" WHERE slug='cameras'), 99, true, NOW(), NOW()),

  -- TVs (Level 3)
  (uuid_generate_v4(), 'تلفزيون ذكي', 'Smart TVs', 'smart-tvs', (SELECT id FROM "categories" WHERE slug='tvs'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), '32 بوصة', '32 Inch', '32-inch', (SELECT id FROM "categories" WHERE slug='tvs'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), '43 بوصة', '43 Inch', '43-inch', (SELECT id FROM "categories" WHERE slug='tvs'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), '55 بوصة', '55 Inch', '55-inch', (SELECT id FROM "categories" WHERE slug='tvs'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), '65 بوصة وأكثر', '65 Inch & Above', '65-inch-above', (SELECT id FROM "categories" WHERE slug='tvs'), 4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'تلفزيونات أخرى', 'Other TVs', 'other-tvs', (SELECT id FROM "categories" WHERE slug='tvs'), 99, true, NOW(), NOW()),

  -- Refrigerators (Level 3) - YOUR EXAMPLE: 24 Feet!
  (uuid_generate_v4(), '16 قدم', '16 Feet', '16-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), '18 قدم', '18 Feet', '18-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), '20 قدم', '20 Feet', '20-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), '24 قدم', '24 Feet', '24-feet', (SELECT id FROM "categories" WHERE slug='refrigerators'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'جنب إلى جنب', 'Side by Side', 'side-by-side', (SELECT id FROM "categories" WHERE slug='refrigerators'), 4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'ثلاجات أخرى', 'Other Refrigerators', 'other-refrigerators', (SELECT id FROM "categories" WHERE slug='refrigerators'), 99, true, NOW(), NOW()),

  -- Washing Machines (Level 3)
  (uuid_generate_v4(), 'تحميل علوي', 'Top Load', 'top-load', (SELECT id FROM "categories" WHERE slug='washing-machines'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'تحميل أمامي', 'Front Load', 'front-load', (SELECT id FROM "categories" WHERE slug='washing-machines'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), '7 كيلو', '7 KG', '7-kg', (SELECT id FROM "categories" WHERE slug='washing-machines'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), '8-10 كيلو', '8-10 KG', '8-10-kg', (SELECT id FROM "categories" WHERE slug='washing-machines'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), '11 كيلو وأكثر', '11 KG & Above', '11-kg-above', (SELECT id FROM "categories" WHERE slug='washing-machines'), 4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'غسالات أخرى', 'Other Washing Machines', 'other-washing-machines', (SELECT id FROM "categories" WHERE slug='washing-machines'), 99, true, NOW(), NOW()),

  -- Air Conditioners (Level 3)
  (uuid_generate_v4(), '1.5 حصان', '1.5 HP', '1-5-hp', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), '2.25 حصان', '2.25 HP', '2-25-hp', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), '3 حصان', '3 HP', '3-hp', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'سبليت', 'Split AC', 'split-ac', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'شباك', 'Window AC', 'window-ac', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'مكيفات أخرى', 'Other ACs', 'other-acs', (SELECT id FROM "categories" WHERE slug='air-conditioners'), 99, true, NOW(), NOW()),

  -- Microwaves (Level 3)
  (uuid_generate_v4(), 'عادي', 'Solo', 'solo', (SELECT id FROM "categories" WHERE slug='microwaves'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'شواية', 'Grill', 'grill', (SELECT id FROM "categories" WHERE slug='microwaves'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'حراري', 'Convection', 'convection', (SELECT id FROM "categories" WHERE slug='microwaves'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'ميكروويف آخر', 'Other Microwaves', 'other-microwaves', (SELECT id FROM "categories" WHERE slug='microwaves'), 99, true, NOW(), NOW()),

  -- Vacuum Cleaners (Level 3)
  (uuid_generate_v4(), 'عمودي', 'Upright', 'upright', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أسطواني', 'Canister', 'canister', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'محمول', 'Handheld', 'handheld', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'روبوت', 'Robot', 'robot', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'مكانس أخرى', 'Other Vacuum Cleaners', 'other-vacuums', (SELECT id FROM "categories" WHERE slug='vacuum-cleaners'), 99, true, NOW(), NOW()),

  -- Furniture: Living Room (Level 3)
  (uuid_generate_v4(), 'الكنب', 'Sofas', 'sofas', (SELECT id FROM "categories" WHERE slug='living-room'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'طاولات القهوة', 'Coffee Tables', 'coffee-tables', (SELECT id FROM "categories" WHERE slug='living-room'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'وحدات التلفزيون', 'TV Units', 'tv-units', (SELECT id FROM "categories" WHERE slug='living-room'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'رفوف الكتب', 'Bookshelves', 'bookshelves', (SELECT id FROM "categories" WHERE slug='living-room'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أثاث صالة آخر', 'Other Living Room', 'other-living-room', (SELECT id FROM "categories" WHERE slug='living-room'), 99, true, NOW(), NOW()),

  -- Furniture: Bedroom (Level 3)
  (uuid_generate_v4(), 'الأسرة', 'Beds', 'beds', (SELECT id FROM "categories" WHERE slug='bedroom'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الخزائن', 'Wardrobes', 'wardrobes', (SELECT id FROM "categories" WHERE slug='bedroom'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'التسريحات', 'Dressers', 'dressers', (SELECT id FROM "categories" WHERE slug='bedroom'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الكوميدينو', 'Nightstands', 'nightstands', (SELECT id FROM "categories" WHERE slug='bedroom'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أثاث غرفة نوم آخر', 'Other Bedroom', 'other-bedroom', (SELECT id FROM "categories" WHERE slug='bedroom'), 99, true, NOW(), NOW()),

  -- Furniture: Dining Room (Level 3)
  (uuid_generate_v4(), 'طاولات الطعام', 'Dining Tables', 'dining-tables', (SELECT id FROM "categories" WHERE slug='dining-room'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'الكراسي', 'Chairs', 'chairs', (SELECT id FROM "categories" WHERE slug='dining-room'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'البوفيهات', 'Buffets', 'buffets', (SELECT id FROM "categories" WHERE slug='dining-room'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أثاث طعام آخر', 'Other Dining', 'other-dining', (SELECT id FROM "categories" WHERE slug='dining-room'), 99, true, NOW(), NOW()),

  -- Furniture: Office (Level 3)
  (uuid_generate_v4(), 'المكاتب', 'Desks', 'desks', (SELECT id FROM "categories" WHERE slug='office'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'كراسي المكتب', 'Office Chairs', 'office-chairs', (SELECT id FROM "categories" WHERE slug='office'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'خزائن الملفات', 'Filing Cabinets', 'filing-cabinets', (SELECT id FROM "categories" WHERE slug='office'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أثاث مكتب آخر', 'Other Office', 'other-office', (SELECT id FROM "categories" WHERE slug='office'), 99, true, NOW(), NOW()),

  -- Vehicles: Cars (Level 3)
  (uuid_generate_v4(), 'سيدان', 'Sedans', 'sedans', (SELECT id FROM "categories" WHERE slug='cars'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'دفع رباعي', 'SUVs', 'suvs', (SELECT id FROM "categories" WHERE slug='cars'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'هاتشباك', 'Hatchbacks', 'hatchbacks', (SELECT id FROM "categories" WHERE slug='cars'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'شاحنات صغيرة', 'Pickup Trucks', 'pickup-trucks', (SELECT id FROM "categories" WHERE slug='cars'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'ميكروباص', 'Vans', 'vans', (SELECT id FROM "categories" WHERE slug='cars'), 4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'سيارات أخرى', 'Other Cars', 'other-cars', (SELECT id FROM "categories" WHERE slug='cars'), 99, true, NOW(), NOW()),

  -- Vehicles: Motorcycles (Level 3)
  (uuid_generate_v4(), 'رياضية', 'Sport Bikes', 'sport-bikes', (SELECT id FROM "categories" WHERE slug='motorcycles'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'كروزر', 'Cruisers', 'cruisers', (SELECT id FROM "categories" WHERE slug='motorcycles'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'سكوتر', 'Scooters', 'scooters', (SELECT id FROM "categories" WHERE slug='motorcycles'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'للرحلات', 'Touring', 'touring', (SELECT id FROM "categories" WHERE slug='motorcycles'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'دراجات نارية أخرى', 'Other Motorcycles', 'other-motorcycles', (SELECT id FROM "categories" WHERE slug='motorcycles'), 99, true, NOW(), NOW()),

  -- Vehicles: Bicycles (Level 3)
  (uuid_generate_v4(), 'جبلية', 'Mountain Bikes', 'mountain-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'طريق', 'Road Bikes', 'road-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'كهربائية', 'Electric Bikes', 'electric-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'للأطفال', 'Kids Bikes', 'kids-bikes', (SELECT id FROM "categories" WHERE slug='bicycles'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'دراجات أخرى', 'Other Bicycles', 'other-bicycles', (SELECT id FROM "categories" WHERE slug='bicycles'), 99, true, NOW(), NOW()),

  -- Fashion: Men's Clothing (Level 3)
  (uuid_generate_v4(), 'قمصان', 'Shirts', 'shirts', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'تيشرتات', 'T-Shirts', 't-shirts', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'بناطيل', 'Pants', 'pants', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'بدل', 'Suits', 'suits', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'جاكيتات', 'Jackets', 'jackets', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'ملابس رجالية أخرى', 'Other Men''s Clothing', 'other-mens-clothing', (SELECT id FROM "categories" WHERE slug='mens-clothing'), 99, true, NOW(), NOW()),

  -- Fashion: Women's Clothing (Level 3)
  (uuid_generate_v4(), 'فساتين', 'Dresses', 'dresses', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'بلوزات', 'Tops', 'tops', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'تنانير', 'Skirts', 'skirts', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'بناطيل', 'Pants', 'womens-pants', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'عبايات', 'Abayas', 'abayas', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'ملابس نسائية أخرى', 'Other Women''s Clothing', 'other-womens-clothing', (SELECT id FROM "categories" WHERE slug='womens-clothing'), 99, true, NOW(), NOW()),

  -- Fashion: Shoes (Level 3)
  (uuid_generate_v4(), 'أحذية رياضية', 'Sneakers', 'sneakers', (SELECT id FROM "categories" WHERE slug='shoes'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أحذية رسمية', 'Formal Shoes', 'formal-shoes', (SELECT id FROM "categories" WHERE slug='shoes'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'صنادل', 'Sandals', 'sandals', (SELECT id FROM "categories" WHERE slug='shoes'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أحذية طويلة', 'Boots', 'boots', (SELECT id FROM "categories" WHERE slug='shoes'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أحذية أخرى', 'Other Shoes', 'other-shoes', (SELECT id FROM "categories" WHERE slug='shoes'), 99, true, NOW(), NOW()),

  -- Fashion: Bags (Level 3)
  (uuid_generate_v4(), 'حقائب يد', 'Handbags', 'handbags', (SELECT id FROM "categories" WHERE slug='bags'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'حقائب ظهر', 'Backpacks', 'backpacks', (SELECT id FROM "categories" WHERE slug='bags'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'محافظ', 'Wallets', 'wallets', (SELECT id FROM "categories" WHERE slug='bags'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'حقائب سفر', 'Travel Bags', 'travel-bags', (SELECT id FROM "categories" WHERE slug='bags'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'حقائب أخرى', 'Other Bags', 'other-bags', (SELECT id FROM "categories" WHERE slug='bags'), 99, true, NOW(), NOW()),

  -- Sports: Gym Equipment (Level 3)
  (uuid_generate_v4(), 'جهاز المشي', 'Treadmills', 'treadmills', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'دمبلز', 'Dumbbells', 'dumbbells', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'مقاعد', 'Benches', 'benches', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'دراجات التمرين', 'Exercise Bikes', 'exercise-bikes', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'معدات جيم أخرى', 'Other Gym Equipment', 'other-gym-equipment', (SELECT id FROM "categories" WHERE slug='gym-equipment'), 99, true, NOW(), NOW()),

  -- Sports: Outdoor Sports (Level 3)
  (uuid_generate_v4(), 'كرة القدم', 'Football', 'football', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'كرة السلة', 'Basketball', 'basketball', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'التنس', 'Tennis', 'tennis', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'السباحة', 'Swimming', 'swimming', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'رياضات أخرى', 'Other Sports', 'other-outdoor-sports', (SELECT id FROM "categories" WHERE slug='outdoor-sports'), 99, true, NOW(), NOW()),

  -- Books (Level 3)
  (uuid_generate_v4(), 'روايات', 'Fiction', 'fiction', (SELECT id FROM "categories" WHERE slug='books'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'غير روائية', 'Non-Fiction', 'non-fiction', (SELECT id FROM "categories" WHERE slug='books'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'تعليمية', 'Educational', 'educational', (SELECT id FROM "categories" WHERE slug='books'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'دينية', 'Religious', 'religious', (SELECT id FROM "categories" WHERE slug='books'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'كتب أطفال', 'Children Books', 'children-books', (SELECT id FROM "categories" WHERE slug='books'), 4, true, NOW(), NOW()),
  (uuid_generate_v4(), 'كتب أخرى', 'Other Books', 'other-books', (SELECT id FROM "categories" WHERE slug='books'), 99, true, NOW(), NOW()),

  -- Video Games (Level 3)
  (uuid_generate_v4(), 'بلايستيشن', 'PlayStation', 'playstation', (SELECT id FROM "categories" WHERE slug='video-games'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'إكس بوكس', 'Xbox', 'xbox', (SELECT id FROM "categories" WHERE slug='video-games'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'نينتندو', 'Nintendo', 'nintendo', (SELECT id FROM "categories" WHERE slug='video-games'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'ألعاب كمبيوتر', 'PC Games', 'pc-games', (SELECT id FROM "categories" WHERE slug='video-games'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'ألعاب أخرى', 'Other Games', 'other-games', (SELECT id FROM "categories" WHERE slug='video-games'), 99, true, NOW(), NOW()),

  -- Kids: Baby Gear (Level 3)
  (uuid_generate_v4(), 'عربات الأطفال', 'Strollers', 'strollers', (SELECT id FROM "categories" WHERE slug='baby-gear'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'مقاعد السيارة', 'Car Seats', 'car-seats', (SELECT id FROM "categories" WHERE slug='baby-gear'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'أسرة الأطفال', 'Cribs', 'cribs', (SELECT id FROM "categories" WHERE slug='baby-gear'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'كراسي الطعام', 'High Chairs', 'high-chairs', (SELECT id FROM "categories" WHERE slug='baby-gear'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'معدات أطفال أخرى', 'Other Baby Gear', 'other-baby-gear', (SELECT id FROM "categories" WHERE slug='baby-gear'), 99, true, NOW(), NOW()),

  -- Kids: Toys (Level 3)
  (uuid_generate_v4(), 'ألعاب تعليمية', 'Educational Toys', 'educational-toys', (SELECT id FROM "categories" WHERE slug='toys'), 0, true, NOW(), NOW()),
  (uuid_generate_v4(), 'عرائس', 'Dolls', 'dolls', (SELECT id FROM "categories" WHERE slug='toys'), 1, true, NOW(), NOW()),
  (uuid_generate_v4(), 'شخصيات', 'Action Figures', 'action-figures', (SELECT id FROM "categories" WHERE slug='toys'), 2, true, NOW(), NOW()),
  (uuid_generate_v4(), 'مكعبات', 'Building Blocks', 'building-blocks', (SELECT id FROM "categories" WHERE slug='toys'), 3, true, NOW(), NOW()),
  (uuid_generate_v4(), 'ألعاب أخرى', 'Other Toys', 'other-toys', (SELECT id FROM "categories" WHERE slug='toys'), 99, true, NOW(), NOW())
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
