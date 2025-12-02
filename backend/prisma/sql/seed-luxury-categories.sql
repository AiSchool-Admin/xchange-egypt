-- =====================================================
-- Xchange Egypt - Luxury Categories Seed (3 Levels)
-- Run this in Supabase SQL Editor
-- =====================================================

-- Clean up existing luxury categories if needed (optional - uncomment if you want to reset)
-- DELETE FROM categories WHERE slug LIKE 'luxury%' OR slug IN ('art-collectibles', 'real-estate', 'jewelry', 'perfumes', 'paintings', 'antiques', 'coins-currency');

-- =====================================================
-- 1. LUXURY GOODS (سلع فاخرة) 👑
-- =====================================================

-- Level 1: Parent Category
INSERT INTO categories (id, name_ar, name_en, slug, description, icon, "order", is_active, parent_id, created_at, updated_at)
VALUES (gen_random_uuid(), 'سلع فاخرة', 'Luxury Goods', 'luxury', 'منتجات فاخرة وعالية القيمة', '👑', 11, true, NULL, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en;

-- Level 2 & 3: Subcategories
DO $$
DECLARE
  luxury_id UUID;
  watches_id UUID;
  jewelry_id UUID;
  bags_id UUID;
  perfumes_id UUID;
  sunglasses_id UUID;
  pens_id UUID;
BEGIN
  SELECT id INTO luxury_id FROM categories WHERE slug = 'luxury';

  -- === LUXURY WATCHES ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'ساعات فاخرة', 'Luxury Watches', 'luxury-watches', '⌚', 1, true, luxury_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = luxury_id RETURNING id INTO watches_id;

  IF watches_id IS NULL THEN SELECT id INTO watches_id FROM categories WHERE slug = 'luxury-watches'; END IF;

  -- Level 3: Watch brands
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'رولكس', 'Rolex', 'rolex', '⌚', 1, true, watches_id, NOW(), NOW()),
    (gen_random_uuid(), 'أوميغا', 'Omega', 'omega', '⌚', 2, true, watches_id, NOW(), NOW()),
    (gen_random_uuid(), 'كارتييه', 'Cartier', 'cartier-watches', '⌚', 3, true, watches_id, NOW(), NOW()),
    (gen_random_uuid(), 'باتيك فيليب', 'Patek Philippe', 'patek-philippe', '⌚', 4, true, watches_id, NOW(), NOW()),
    (gen_random_uuid(), 'أوديمار بيغيه', 'Audemars Piguet', 'audemars-piguet', '⌚', 5, true, watches_id, NOW(), NOW()),
    (gen_random_uuid(), 'ريتشارد ميل', 'Richard Mille', 'richard-mille', '⌚', 6, true, watches_id, NOW(), NOW()),
    (gen_random_uuid(), 'تاغ هوير', 'TAG Heuer', 'tag-heuer', '⌚', 7, true, watches_id, NOW(), NOW()),
    (gen_random_uuid(), 'ماركات أخرى', 'Other Brands', 'other-luxury-watches', '⌚', 8, true, watches_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = watches_id;

  -- === JEWELRY ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'مجوهرات', 'Jewelry', 'jewelry', '💎', 2, true, luxury_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = luxury_id RETURNING id INTO jewelry_id;

  IF jewelry_id IS NULL THEN SELECT id INTO jewelry_id FROM categories WHERE slug = 'jewelry'; END IF;

  -- Level 3: Jewelry types
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'خواتم', 'Rings', 'rings', '💍', 1, true, jewelry_id, NOW(), NOW()),
    (gen_random_uuid(), 'قلادات', 'Necklaces', 'necklaces', '📿', 2, true, jewelry_id, NOW(), NOW()),
    (gen_random_uuid(), 'أساور', 'Bracelets', 'bracelets', '⭕', 3, true, jewelry_id, NOW(), NOW()),
    (gen_random_uuid(), 'أقراط', 'Earrings', 'earrings', '✨', 4, true, jewelry_id, NOW(), NOW()),
    (gen_random_uuid(), 'ذهب', 'Gold', 'gold', '🥇', 5, true, jewelry_id, NOW(), NOW()),
    (gen_random_uuid(), 'ألماس', 'Diamonds', 'diamonds', '💎', 6, true, jewelry_id, NOW(), NOW()),
    (gen_random_uuid(), 'لؤلؤ', 'Pearls', 'pearls', '⚪', 7, true, jewelry_id, NOW(), NOW()),
    (gen_random_uuid(), 'فضة', 'Silver', 'silver-jewelry', '🥈', 8, true, jewelry_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = jewelry_id;

  -- === LUXURY BAGS ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'حقائب فاخرة', 'Luxury Bags', 'luxury-bags', '👜', 3, true, luxury_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = luxury_id RETURNING id INTO bags_id;

  IF bags_id IS NULL THEN SELECT id INTO bags_id FROM categories WHERE slug = 'luxury-bags'; END IF;

  -- Level 3: Bag brands
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'لويس فيتون', 'Louis Vuitton', 'louis-vuitton', '👜', 1, true, bags_id, NOW(), NOW()),
    (gen_random_uuid(), 'غوتشي', 'Gucci', 'gucci', '👜', 2, true, bags_id, NOW(), NOW()),
    (gen_random_uuid(), 'شانيل', 'Chanel', 'chanel', '👜', 3, true, bags_id, NOW(), NOW()),
    (gen_random_uuid(), 'هيرميس', 'Hermès', 'hermes', '👜', 4, true, bags_id, NOW(), NOW()),
    (gen_random_uuid(), 'برادا', 'Prada', 'prada', '👜', 5, true, bags_id, NOW(), NOW()),
    (gen_random_uuid(), 'ديور', 'Dior', 'dior', '👜', 6, true, bags_id, NOW(), NOW()),
    (gen_random_uuid(), 'فندي', 'Fendi', 'fendi', '👜', 7, true, bags_id, NOW(), NOW()),
    (gen_random_uuid(), 'ماركات أخرى', 'Other Brands', 'other-luxury-bags', '👜', 8, true, bags_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = bags_id;

  -- === PERFUMES ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'عطور أصلية', 'Perfumes', 'perfumes', '🌸', 4, true, luxury_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = luxury_id RETURNING id INTO perfumes_id;

  IF perfumes_id IS NULL THEN SELECT id INTO perfumes_id FROM categories WHERE slug = 'perfumes'; END IF;

  -- Level 3: Perfume types
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'عطور رجالية', 'Men''s Perfumes', 'mens-perfumes', '🧔', 1, true, perfumes_id, NOW(), NOW()),
    (gen_random_uuid(), 'عطور نسائية', 'Women''s Perfumes', 'womens-perfumes', '👩', 2, true, perfumes_id, NOW(), NOW()),
    (gen_random_uuid(), 'عطور مشتركة', 'Unisex', 'unisex-perfumes', '🌟', 3, true, perfumes_id, NOW(), NOW()),
    (gen_random_uuid(), 'عود عربي', 'Arabian Oud', 'arabian-oud', '🪵', 4, true, perfumes_id, NOW(), NOW()),
    (gen_random_uuid(), 'بخور', 'Incense', 'incense', '💨', 5, true, perfumes_id, NOW(), NOW()),
    (gen_random_uuid(), 'مسك', 'Musk', 'musk', '🤍', 6, true, perfumes_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = perfumes_id;

  -- === SUNGLASSES ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'نظارات شمسية', 'Sunglasses', 'sunglasses', '🕶️', 5, true, luxury_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = luxury_id RETURNING id INTO sunglasses_id;

  IF sunglasses_id IS NULL THEN SELECT id INTO sunglasses_id FROM categories WHERE slug = 'sunglasses'; END IF;

  -- Level 3: Sunglasses brands
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'راي بان', 'Ray-Ban', 'ray-ban', '🕶️', 1, true, sunglasses_id, NOW(), NOW()),
    (gen_random_uuid(), 'أوكلي', 'Oakley', 'oakley', '🕶️', 2, true, sunglasses_id, NOW(), NOW()),
    (gen_random_uuid(), 'غوتشي', 'Gucci Eyewear', 'gucci-eyewear', '🕶️', 3, true, sunglasses_id, NOW(), NOW()),
    (gen_random_uuid(), 'برادا', 'Prada Eyewear', 'prada-eyewear', '🕶️', 4, true, sunglasses_id, NOW(), NOW()),
    (gen_random_uuid(), 'توم فورد', 'Tom Ford', 'tom-ford', '🕶️', 5, true, sunglasses_id, NOW(), NOW()),
    (gen_random_uuid(), 'ماركات أخرى', 'Other Brands', 'other-sunglasses', '🕶️', 6, true, sunglasses_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = sunglasses_id;

  -- === LUXURY PENS ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'أقلام فاخرة', 'Luxury Pens', 'luxury-pens', '🖊️', 6, true, luxury_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = luxury_id RETURNING id INTO pens_id;

  IF pens_id IS NULL THEN SELECT id INTO pens_id FROM categories WHERE slug = 'luxury-pens'; END IF;

  -- Level 3: Pen brands
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'مونت بلان', 'Montblanc', 'montblanc', '🖊️', 1, true, pens_id, NOW(), NOW()),
    (gen_random_uuid(), 'باركر', 'Parker', 'parker', '🖊️', 2, true, pens_id, NOW(), NOW()),
    (gen_random_uuid(), 'كارتييه', 'Cartier Pens', 'cartier-pens', '🖊️', 3, true, pens_id, NOW(), NOW()),
    (gen_random_uuid(), 'ماركات أخرى', 'Other Brands', 'other-luxury-pens', '🖊️', 4, true, pens_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = pens_id;

END $$;

-- =====================================================
-- 2. ART & COLLECTIBLES (فنون ومقتنيات) 🖼️
-- =====================================================

-- Level 1: Parent Category
INSERT INTO categories (id, name_ar, name_en, slug, description, icon, "order", is_active, parent_id, created_at, updated_at)
VALUES (gen_random_uuid(), 'فنون ومقتنيات', 'Art & Collectibles', 'art-collectibles', 'لوحات فنية وتحف ومقتنيات نادرة', '🖼️', 12, true, NULL, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en;

-- Level 2 & 3: Subcategories
DO $$
DECLARE
  art_id UUID;
  paintings_id UUID;
  antiques_id UUID;
  sculptures_id UUID;
  coins_id UUID;
  stamps_id UUID;
  memorabilia_id UUID;
BEGIN
  SELECT id INTO art_id FROM categories WHERE slug = 'art-collectibles';

  -- === PAINTINGS ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'لوحات فنية', 'Paintings', 'paintings', '🎨', 1, true, art_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = art_id RETURNING id INTO paintings_id;

  IF paintings_id IS NULL THEN SELECT id INTO paintings_id FROM categories WHERE slug = 'paintings'; END IF;

  -- Level 3: Painting types
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'لوحات زيتية', 'Oil Paintings', 'oil-paintings', '🎨', 1, true, paintings_id, NOW(), NOW()),
    (gen_random_uuid(), 'ألوان مائية', 'Watercolor', 'watercolor', '🎨', 2, true, paintings_id, NOW(), NOW()),
    (gen_random_uuid(), 'فن حديث', 'Modern Art', 'modern-art', '🎨', 3, true, paintings_id, NOW(), NOW()),
    (gen_random_uuid(), 'فن مصري', 'Egyptian Art', 'egyptian-art', '🎨', 4, true, paintings_id, NOW(), NOW()),
    (gen_random_uuid(), 'فن تجريدي', 'Abstract Art', 'abstract-art', '🎨', 5, true, paintings_id, NOW(), NOW()),
    (gen_random_uuid(), 'بورتريه', 'Portraits', 'portraits', '🎨', 6, true, paintings_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = paintings_id;

  -- === ANTIQUES ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'تحف أثرية', 'Antiques', 'antiques', '🏺', 2, true, art_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = art_id RETURNING id INTO antiques_id;

  IF antiques_id IS NULL THEN SELECT id INTO antiques_id FROM categories WHERE slug = 'antiques'; END IF;

  -- Level 3: Antique types
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'أثاث أثري', 'Antique Furniture', 'antique-furniture', '🪑', 1, true, antiques_id, NOW(), NOW()),
    (gen_random_uuid(), 'فخار', 'Pottery', 'pottery', '🏺', 2, true, antiques_id, NOW(), NOW()),
    (gen_random_uuid(), 'ساعات أثرية', 'Antique Clocks', 'antique-clocks', '🕰️', 3, true, antiques_id, NOW(), NOW()),
    (gen_random_uuid(), 'ديكورات أثرية', 'Decorative Antiques', 'decorative-antiques', '🏛️', 4, true, antiques_id, NOW(), NOW()),
    (gen_random_uuid(), 'سجاد أثري', 'Antique Rugs', 'antique-rugs', '🧶', 5, true, antiques_id, NOW(), NOW()),
    (gen_random_uuid(), 'تحف فرعونية', 'Pharaonic Artifacts', 'pharaonic-artifacts', '🏛️', 6, true, antiques_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = antiques_id;

  -- === SCULPTURES ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'منحوتات', 'Sculptures', 'sculptures', '🗿', 3, true, art_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = art_id RETURNING id INTO sculptures_id;

  IF sculptures_id IS NULL THEN SELECT id INTO sculptures_id FROM categories WHERE slug = 'sculptures'; END IF;

  -- Level 3: Sculpture types
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'منحوتات رخامية', 'Marble Sculptures', 'marble-sculptures', '🗿', 1, true, sculptures_id, NOW(), NOW()),
    (gen_random_uuid(), 'منحوتات برونزية', 'Bronze Sculptures', 'bronze-sculptures', '🗿', 2, true, sculptures_id, NOW(), NOW()),
    (gen_random_uuid(), 'منحوتات خشبية', 'Wood Sculptures', 'wood-sculptures', '🪵', 3, true, sculptures_id, NOW(), NOW()),
    (gen_random_uuid(), 'منحوتات حديثة', 'Modern Sculptures', 'modern-sculptures', '🗿', 4, true, sculptures_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = sculptures_id;

  -- === COINS & CURRENCY ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'عملات ومسكوكات', 'Coins & Currency', 'coins-currency', '🪙', 4, true, art_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = art_id RETURNING id INTO coins_id;

  IF coins_id IS NULL THEN SELECT id INTO coins_id FROM categories WHERE slug = 'coins-currency'; END IF;

  -- Level 3: Coin types
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'عملات قديمة', 'Ancient Coins', 'ancient-coins', '🪙', 1, true, coins_id, NOW(), NOW()),
    (gen_random_uuid(), 'عملات ذهبية', 'Gold Coins', 'gold-coins', '🥇', 2, true, coins_id, NOW(), NOW()),
    (gen_random_uuid(), 'عملات فضية', 'Silver Coins', 'silver-coins', '🥈', 3, true, coins_id, NOW(), NOW()),
    (gen_random_uuid(), 'عملات ورقية', 'Paper Money', 'paper-money', '💵', 4, true, coins_id, NOW(), NOW()),
    (gen_random_uuid(), 'عملات أجنبية', 'Foreign Currency', 'foreign-currency', '💱', 5, true, coins_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = coins_id;

  -- === STAMPS ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'طوابع', 'Stamps', 'stamps', '📮', 5, true, art_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = art_id RETURNING id INTO stamps_id;

  IF stamps_id IS NULL THEN SELECT id INTO stamps_id FROM categories WHERE slug = 'stamps'; END IF;

  -- Level 3: Stamp types
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'طوابع مصرية', 'Egyptian Stamps', 'egyptian-stamps', '📮', 1, true, stamps_id, NOW(), NOW()),
    (gen_random_uuid(), 'طوابع عربية', 'Arab Stamps', 'arab-stamps', '📮', 2, true, stamps_id, NOW(), NOW()),
    (gen_random_uuid(), 'طوابع أجنبية', 'Foreign Stamps', 'foreign-stamps', '📮', 3, true, stamps_id, NOW(), NOW()),
    (gen_random_uuid(), 'طوابع نادرة', 'Rare Stamps', 'rare-stamps', '📮', 4, true, stamps_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = stamps_id;

  -- === SPORTS MEMORABILIA ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'مقتنيات رياضية', 'Sports Memorabilia', 'sports-memorabilia', '🏆', 6, true, art_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = art_id RETURNING id INTO memorabilia_id;

  IF memorabilia_id IS NULL THEN SELECT id INTO memorabilia_id FROM categories WHERE slug = 'sports-memorabilia'; END IF;

  -- Level 3: Sports memorabilia types
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'قمصان موقعة', 'Signed Jerseys', 'signed-jerseys', '👕', 1, true, memorabilia_id, NOW(), NOW()),
    (gen_random_uuid(), 'كرات موقعة', 'Signed Balls', 'signed-balls', '⚽', 2, true, memorabilia_id, NOW(), NOW()),
    (gen_random_uuid(), 'ميداليات', 'Medals', 'medals', '🏅', 3, true, memorabilia_id, NOW(), NOW()),
    (gen_random_uuid(), 'صور موقعة', 'Signed Photos', 'signed-photos', '📸', 4, true, memorabilia_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = memorabilia_id;

END $$;

-- =====================================================
-- 3. REAL ESTATE (عقارات) 🏰
-- =====================================================

-- Level 1: Parent Category
INSERT INTO categories (id, name_ar, name_en, slug, description, icon, "order", is_active, parent_id, created_at, updated_at)
VALUES (gen_random_uuid(), 'عقارات', 'Real Estate', 'real-estate', 'عقارات سكنية وتجارية', '🏰', 13, true, NULL, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en;

-- Level 2 & 3: Subcategories
DO $$
DECLARE
  realestate_id UUID;
  apartments_id UUID;
  villas_id UUID;
  chalets_id UUID;
  commercial_id UUID;
BEGIN
  SELECT id INTO realestate_id FROM categories WHERE slug = 'real-estate';

  -- === LUXURY APARTMENTS ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'شقق فاخرة', 'Luxury Apartments', 'luxury-apartments', '🏢', 1, true, realestate_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = realestate_id RETURNING id INTO apartments_id;

  IF apartments_id IS NULL THEN SELECT id INTO apartments_id FROM categories WHERE slug = 'luxury-apartments'; END IF;

  -- Level 3: Apartment types
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'بنتهاوس', 'Penthouse', 'penthouse', '🏙️', 1, true, apartments_id, NOW(), NOW()),
    (gen_random_uuid(), 'دوبلكس', 'Duplex', 'duplex', '🏠', 2, true, apartments_id, NOW(), NOW()),
    (gen_random_uuid(), 'شقق ذكية', 'Smart Apartments', 'smart-apartments', '🏠', 3, true, apartments_id, NOW(), NOW()),
    (gen_random_uuid(), 'شقق فندقية', 'Hotel Apartments', 'hotel-apartments', '🏨', 4, true, apartments_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = apartments_id;

  -- === VILLAS ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'فيلات', 'Villas', 'villas', '🏡', 2, true, realestate_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = realestate_id RETURNING id INTO villas_id;

  IF villas_id IS NULL THEN SELECT id INTO villas_id FROM categories WHERE slug = 'villas'; END IF;

  -- Level 3: Villa types
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'فيلات مستقلة', 'Standalone Villas', 'standalone-villas', '🏡', 1, true, villas_id, NOW(), NOW()),
    (gen_random_uuid(), 'توين هاوس', 'Twin Houses', 'twin-houses', '🏘️', 2, true, villas_id, NOW(), NOW()),
    (gen_random_uuid(), 'تاون هاوس', 'Town Houses', 'town-houses', '🏘️', 3, true, villas_id, NOW(), NOW()),
    (gen_random_uuid(), 'قصور', 'Palaces', 'palaces', '🏰', 4, true, villas_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = villas_id;

  -- === CHALETS & RESORTS ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'شاليهات ومنتجعات', 'Chalets & Resorts', 'chalets-resorts', '🏖️', 3, true, realestate_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = realestate_id RETURNING id INTO chalets_id;

  IF chalets_id IS NULL THEN SELECT id INTO chalets_id FROM categories WHERE slug = 'chalets-resorts'; END IF;

  -- Level 3: Resort locations
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'الساحل الشمالي', 'North Coast', 'north-coast', '🏖️', 1, true, chalets_id, NOW(), NOW()),
    (gen_random_uuid(), 'العين السخنة', 'Ain Sokhna', 'ain-sokhna', '🏖️', 2, true, chalets_id, NOW(), NOW()),
    (gen_random_uuid(), 'البحر الأحمر', 'Red Sea', 'red-sea', '🏖️', 3, true, chalets_id, NOW(), NOW()),
    (gen_random_uuid(), 'مرسى مطروح', 'Marsa Matrouh', 'marsa-matrouh', '🏖️', 4, true, chalets_id, NOW(), NOW()),
    (gen_random_uuid(), 'رأس سدر', 'Ras Sedr', 'ras-sedr', '🏖️', 5, true, chalets_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = chalets_id;

  -- === COMMERCIAL ===
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at)
  VALUES (gen_random_uuid(), 'عقارات تجارية', 'Commercial Properties', 'commercial-properties', '🏪', 4, true, realestate_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = realestate_id RETURNING id INTO commercial_id;

  IF commercial_id IS NULL THEN SELECT id INTO commercial_id FROM categories WHERE slug = 'commercial-properties'; END IF;

  -- Level 3: Commercial types
  INSERT INTO categories (id, name_ar, name_en, slug, icon, "order", is_active, parent_id, created_at, updated_at) VALUES
    (gen_random_uuid(), 'محلات', 'Shops', 'shops', '🏪', 1, true, commercial_id, NOW(), NOW()),
    (gen_random_uuid(), 'مكاتب', 'Offices', 'offices', '🏢', 2, true, commercial_id, NOW(), NOW()),
    (gen_random_uuid(), 'مخازن', 'Warehouses', 'warehouses', '🏭', 3, true, commercial_id, NOW(), NOW()),
    (gen_random_uuid(), 'عيادات', 'Clinics', 'clinics', '🏥', 4, true, commercial_id, NOW(), NOW())
  ON CONFLICT (slug) DO UPDATE SET parent_id = commercial_id;

END $$;

-- =====================================================
-- VERIFY: Show all luxury categories (3 levels)
-- =====================================================
SELECT
  CASE
    WHEN c.parent_id IS NULL THEN c.name_ar
    WHEN p.parent_id IS NULL THEN '├─ ' || c.name_ar
    ELSE '│  └─ ' || c.name_ar
  END as hierarchy,
  c.name_en,
  c.slug,
  c.icon
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.slug IN (
  'luxury', 'art-collectibles', 'real-estate',
  'luxury-watches', 'jewelry', 'luxury-bags', 'perfumes', 'sunglasses', 'luxury-pens',
  'paintings', 'antiques', 'sculptures', 'coins-currency', 'stamps', 'sports-memorabilia',
  'luxury-apartments', 'villas', 'chalets-resorts', 'commercial-properties'
)
OR p.slug IN (
  'luxury-watches', 'jewelry', 'luxury-bags', 'perfumes', 'sunglasses', 'luxury-pens',
  'paintings', 'antiques', 'sculptures', 'coins-currency', 'stamps', 'sports-memorabilia',
  'luxury-apartments', 'villas', 'chalets-resorts', 'commercial-properties'
)
ORDER BY
  COALESCE(p.parent_id, p.id, c.id),
  COALESCE(p.id, c.id),
  c."order";
