import logger from '../lib/logger';
/**
 * Automatic Item Categorization Service
 * FREE keyword-based system for Egyptian market
 *
 * Categorizes items into the 218 categories automatically
 * Based on title, description, and keywords
 */

import prisma from '../lib/prisma';
import { normalizeArabic } from '../utils/arabicSearch';

// ============================================
// Category Keywords Database
// ============================================

interface CategoryKeywords {
  categorySlug: string;
  keywords: {
    ar: string[];
    en: string[];
  };
  weight: number; // Higher weight = more specific
}

/**
 * Egyptian market category keywords
 * Organized by the 3-level hierarchy
 */
export const CATEGORY_KEYWORDS: CategoryKeywords[] = [
  // ============================================
  // ELECTRONICS (Level 1 → Level 2 → Level 3)
  // ============================================
  {
    categorySlug: 'electronics',
    keywords: { ar: ['الكترونيات', 'إلكترونيات'], en: ['electronics'] },
    weight: 3,
  },
  // Mobile Phones (Level 2)
  {
    categorySlug: 'mobile-phones',
    keywords: { ar: ['موبايل', 'موبيل', 'تليفون', 'محمول', 'جوال', 'هاتف'], en: ['mobile', 'phone', 'smartphone'] },
    weight: 8,
  },
  // Mobile Phones Level 3
  {
    categorySlug: 'iphone',
    keywords: { ar: ['ايفون', 'آيفون', 'iphone', 'ابل'], en: ['iphone', 'apple phone', 'ios'] },
    weight: 15,
  },
  {
    categorySlug: 'samsung-phones',
    keywords: { ar: ['سامسونج', 'سامسونغ', 'جالاكسي'], en: ['samsung', 'galaxy', 'samsung phone'] },
    weight: 15,
  },
  {
    categorySlug: 'xiaomi-phones',
    keywords: { ar: ['شاومي', 'ريدمي', 'بوكو'], en: ['xiaomi', 'redmi', 'poco', 'mi phone'] },
    weight: 15,
  },
  {
    categorySlug: 'huawei-phones',
    keywords: { ar: ['هواوي', 'هواوى', 'اونر'], en: ['huawei', 'honor'] },
    weight: 15,
  },
  {
    categorySlug: 'oppo-phones',
    keywords: { ar: ['اوبو', 'أوبو'], en: ['oppo'] },
    weight: 15,
  },
  {
    categorySlug: 'realme-phones',
    keywords: { ar: ['ريلمي', 'ريل مي'], en: ['realme'] },
    weight: 15,
  },
  // Computers (Level 2)
  {
    categorySlug: 'computers',
    keywords: { ar: ['كمبيوتر', 'كومبيوتر', 'حاسب'], en: ['computer', 'pc'] },
    weight: 8,
  },
  // Computers Level 3
  {
    categorySlug: 'laptops',
    keywords: { ar: ['لاب توب', 'لابتوب', 'نوت بوك', 'ماك بوك'], en: ['laptop', 'notebook', 'macbook', 'dell laptop', 'hp laptop', 'lenovo'] },
    weight: 15,
  },
  {
    categorySlug: 'desktop-pcs',
    keywords: { ar: ['كمبيوتر مكتبي', 'ديسكتوب', 'بي سي', 'كيسة'], en: ['desktop', 'pc', 'tower', 'desktop computer'] },
    weight: 15,
  },
  {
    categorySlug: 'monitors',
    keywords: { ar: ['شاشة كمبيوتر', 'مونيتور', 'شاشه'], en: ['monitor', 'display', 'screen'] },
    weight: 15,
  },
  {
    categorySlug: 'computer-parts',
    keywords: { ar: ['قطع كمبيوتر', 'كارت شاشة', 'رامات', 'بروسيسور', 'هارد'], en: ['graphics card', 'gpu', 'ram', 'cpu', 'ssd', 'motherboard', 'computer parts'] },
    weight: 15,
  },
  {
    categorySlug: 'printers-scanners',
    keywords: { ar: ['طابعة', 'برنتر', 'سكانر', 'ماسح ضوئي'], en: ['printer', 'scanner', 'printing'] },
    weight: 15,
  },
  // Tablets (Level 2 + Level 3)
  {
    categorySlug: 'tablets',
    keywords: { ar: ['تابلت', 'لوحي'], en: ['tablet'] },
    weight: 8,
  },
  {
    categorySlug: 'ipad',
    keywords: { ar: ['ايباد', 'آيباد', 'ipad'], en: ['ipad', 'apple tablet'] },
    weight: 15,
  },
  {
    categorySlug: 'samsung-tablets',
    keywords: { ar: ['تابلت سامسونج', 'جالاكسي تاب'], en: ['samsung tablet', 'galaxy tab'] },
    weight: 15,
  },
  // Cameras (Level 2 + Level 3)
  {
    categorySlug: 'cameras',
    keywords: { ar: ['كاميرا', 'كاميره', 'تصوير'], en: ['camera'] },
    weight: 8,
  },
  {
    categorySlug: 'dslr-cameras',
    keywords: { ar: ['كاميرا DSLR', 'دي اس ال ار', 'كانون', 'نيكون'], en: ['dslr', 'canon', 'nikon', 'dslr camera'] },
    weight: 15,
  },
  {
    categorySlug: 'mirrorless-cameras',
    keywords: { ar: ['ميرورليس', 'بدون مرآة', 'سوني الفا'], en: ['mirrorless', 'sony alpha', 'mirrorless camera'] },
    weight: 15,
  },
  {
    categorySlug: 'video-cameras',
    keywords: { ar: ['كاميرا فيديو', 'هاندي كام', 'تصوير فيديو'], en: ['video camera', 'camcorder', 'handycam'] },
    weight: 15,
  },
  {
    categorySlug: 'camera-lenses',
    keywords: { ar: ['عدسة', 'عدسات', 'لينس'], en: ['lens', 'lenses', 'camera lens'] },
    weight: 15,
  },
  // Audio (Level 2 + Level 3)
  {
    categorySlug: 'audio-headphones',
    keywords: { ar: ['سماعات', 'صوتيات'], en: ['audio', 'headphones'] },
    weight: 8,
  },
  {
    categorySlug: 'wireless-headphones',
    keywords: { ar: ['سماعات لاسلكية', 'ايربودز', 'سماعة بلوتوث'], en: ['wireless headphones', 'airpods', 'bluetooth headphones', 'tws'] },
    weight: 15,
  },
  {
    categorySlug: 'wired-headphones',
    keywords: { ar: ['سماعات سلكية', 'هيدفون سلك'], en: ['wired headphones', 'wired earphones'] },
    weight: 15,
  },
  {
    categorySlug: 'bluetooth-speakers',
    keywords: { ar: ['سماعة بلوتوث', 'سبيكر', 'مكبر صوت بلوتوث', 'جي بي ال'], en: ['bluetooth speaker', 'jbl', 'portable speaker'] },
    weight: 15,
  },
  {
    categorySlug: 'sound-systems',
    keywords: { ar: ['نظام صوت', 'هوم ثياتر', 'ساوند بار', 'مكبرات صوت'], en: ['sound system', 'home theater', 'soundbar', 'speakers'] },
    weight: 15,
  },
  // Electronics Accessories (Level 2 + Level 3)
  {
    categorySlug: 'electronics-accessories',
    keywords: { ar: ['اكسسوارات الكترونية'], en: ['electronics accessories'] },
    weight: 8,
  },
  {
    categorySlug: 'chargers-cables',
    keywords: { ar: ['شاحن', 'كابل', 'شواحن', 'كابلات', 'USB'], en: ['charger', 'cable', 'charging', 'usb cable', 'type c'] },
    weight: 15,
  },
  {
    categorySlug: 'cases-covers',
    keywords: { ar: ['جراب', 'كفر', 'حافظة', 'غطاء موبايل'], en: ['case', 'cover', 'phone case', 'protective case'] },
    weight: 15,
  },
  {
    categorySlug: 'power-banks',
    keywords: { ar: ['باور بانك', 'شاحن متنقل', 'بطارية خارجية'], en: ['power bank', 'portable charger', 'battery pack'] },
    weight: 15,
  },
  {
    categorySlug: 'smart-watches',
    keywords: { ar: ['ساعة ذكية', 'سمارت واتش', 'ابل واتش', 'ساعة سامسونج'], en: ['smart watch', 'smartwatch', 'apple watch', 'galaxy watch', 'fitness tracker'] },
    weight: 15,
  },

  // ============================================
  // FURNITURE (Level 1 → Level 2 → Level 3)
  // ============================================
  {
    categorySlug: 'furniture',
    keywords: { ar: ['أثاث', 'اثاث', 'مفروشات', 'موبيليا'], en: ['furniture'] },
    weight: 3,
  },
  // Bedroom Furniture (Level 2)
  {
    categorySlug: 'bedroom-furniture',
    keywords: { ar: ['اثاث غرفة نوم', 'غرف نوم'], en: ['bedroom furniture'] },
    weight: 8,
  },
  {
    categorySlug: 'beds',
    keywords: { ar: ['سرير', 'سراير', 'مرتبة', 'سرير اطفال'], en: ['bed', 'mattress', 'bunk bed'] },
    weight: 15,
  },
  {
    categorySlug: 'wardrobes',
    keywords: { ar: ['دولاب', 'دواليب', 'خزانة ملابس'], en: ['wardrobe', 'closet', 'armoire'] },
    weight: 15,
  },
  {
    categorySlug: 'nightstands',
    keywords: { ar: ['كومودينو', 'طاولة جانبية'], en: ['nightstand', 'bedside table'] },
    weight: 15,
  },
  {
    categorySlug: 'dressers',
    keywords: { ar: ['تسريحة', 'تسريحه', 'مرآة تسريحة'], en: ['dresser', 'vanity', 'dressing table'] },
    weight: 15,
  },
  // Living Room Furniture (Level 2)
  {
    categorySlug: 'living-room-furniture',
    keywords: { ar: ['اثاث صالون', 'غرفة معيشة', 'ليفنج'], en: ['living room furniture'] },
    weight: 8,
  },
  {
    categorySlug: 'sofas-couches',
    keywords: { ar: ['كنبه', 'كنبة', 'صالون', 'انتريه', 'أريكة', 'ركنة'], en: ['sofa', 'couch', 'sectional'] },
    weight: 15,
  },
  {
    categorySlug: 'tables',
    keywords: { ar: ['ترابيزه', 'ترابيزة', 'طاولة', 'سفرة'], en: ['table', 'dining table', 'coffee table'] },
    weight: 15,
  },
  {
    categorySlug: 'shelves-bookcases',
    keywords: { ar: ['رف', 'ارفف', 'مكتبة كتب', 'وحدة ارفف'], en: ['shelf', 'bookcase', 'bookshelf', 'shelving'] },
    weight: 15,
  },
  {
    categorySlug: 'tv-units',
    keywords: { ar: ['وحدة تلفزيون', 'ستاند تلفزيون', 'طاولة تلفزيون'], en: ['tv unit', 'tv stand', 'entertainment center'] },
    weight: 15,
  },
  // Office Furniture (Level 2)
  {
    categorySlug: 'office-furniture',
    keywords: { ar: ['اثاث مكتبي', 'اثاث مكاتب'], en: ['office furniture'] },
    weight: 8,
  },
  {
    categorySlug: 'desks',
    keywords: { ar: ['مكتب', 'مكاتب', 'ديسك', 'مكتب كمبيوتر'], en: ['desk', 'office desk', 'work desk', 'computer desk'] },
    weight: 15,
  },
  {
    categorySlug: 'office-chairs',
    keywords: { ar: ['كرسي مكتب', 'كراسي مكتب', 'كرسي دوار'], en: ['office chair', 'desk chair', 'ergonomic chair'] },
    weight: 15,
  },
  {
    categorySlug: 'filing-cabinets',
    keywords: { ar: ['خزانة ملفات', 'دولاب ملفات', 'ارشيف'], en: ['filing cabinet', 'file cabinet'] },
    weight: 15,
  },
  // Outdoor Furniture (Level 2 + Level 3)
  {
    categorySlug: 'outdoor-furniture',
    keywords: { ar: ['اثاث حدائق', 'جلسات خارجية'], en: ['outdoor furniture', 'patio furniture'] },
    weight: 8,
  },
  {
    categorySlug: 'garden-sets',
    keywords: { ar: ['جلسة حديقة', 'طقم حديقة', 'كراسي حديقة'], en: ['garden set', 'patio set', 'outdoor seating'] },
    weight: 15,
  },

  // ============================================
  // HOME & GARDEN (Level 1 → Level 2 → Level 3)
  // ============================================
  {
    categorySlug: 'home-garden',
    keywords: { ar: ['المنزل والحديقة', 'مستلزمات منزل'], en: ['home and garden', 'home & garden'] },
    weight: 3,
  },
  // Kitchen (Level 2 + Level 3)
  {
    categorySlug: 'kitchen-food',
    keywords: { ar: ['مطبخ', 'ادوات مطبخ'], en: ['kitchen', 'kitchenware'] },
    weight: 8,
  },
  {
    categorySlug: 'cookware',
    keywords: { ar: ['حلل', 'اواني طهي', 'طاسة', 'حلة ضغط'], en: ['cookware', 'pots', 'pans', 'cooking pots'] },
    weight: 15,
  },
  {
    categorySlug: 'tableware',
    keywords: { ar: ['اطباق', 'صحون', 'كاسات', 'ادوات مائدة'], en: ['tableware', 'plates', 'dishes', 'glasses'] },
    weight: 15,
  },
  {
    categorySlug: 'small-kitchen-appliances',
    keywords: { ar: ['خلاط', 'عصارة', 'محضر طعام', 'كبة', 'توستر'], en: ['blender', 'juicer', 'food processor', 'toaster', 'mixer'] },
    weight: 15,
  },
  // Home Decor (Level 2 + Level 3)
  {
    categorySlug: 'home-decor',
    keywords: { ar: ['ديكور', 'ديكورات', 'زينة'], en: ['home decor', 'decor', 'decoration'] },
    weight: 8,
  },
  {
    categorySlug: 'art-frames',
    keywords: { ar: ['لوحة', 'لوحات', 'برواز', 'اطار صور'], en: ['art', 'frame', 'picture frame', 'wall art'] },
    weight: 15,
  },
  {
    categorySlug: 'mirrors',
    keywords: { ar: ['مرآة', 'مراية', 'مرايا'], en: ['mirror', 'mirrors'] },
    weight: 15,
  },
  {
    categorySlug: 'rugs',
    keywords: { ar: ['سجادة', 'سجاد', 'موكيت'], en: ['rug', 'carpet', 'rugs'] },
    weight: 15,
  },
  {
    categorySlug: 'curtains',
    keywords: { ar: ['ستارة', 'ستائر', 'برادي'], en: ['curtain', 'curtains', 'drapes'] },
    weight: 15,
  },
  // Bedding (Level 2 + Level 3)
  {
    categorySlug: 'bedding-linens',
    keywords: { ar: ['مفروشات سرير', 'ملايات'], en: ['bedding', 'linens'] },
    weight: 8,
  },
  {
    categorySlug: 'bed-sheets',
    keywords: { ar: ['ملاية', 'ملايات', 'شرشف'], en: ['bed sheet', 'sheets', 'fitted sheet'] },
    weight: 15,
  },
  {
    categorySlug: 'comforters',
    keywords: { ar: ['لحاف', 'الحفة', 'مفرش'], en: ['comforter', 'duvet', 'quilt'] },
    weight: 15,
  },
  {
    categorySlug: 'pillows',
    keywords: { ar: ['مخدة', 'وسادة', 'وسائد'], en: ['pillow', 'pillows'] },
    weight: 15,
  },
  {
    categorySlug: 'blankets',
    keywords: { ar: ['بطانية', 'بطاطين', 'كوبرتا'], en: ['blanket', 'blankets', 'throw'] },
    weight: 15,
  },

  // ============================================
  // VEHICLES (Level 1 → Level 2)
  // ============================================
  {
    categorySlug: 'vehicles',
    keywords: { ar: ['مركبات', 'عربيات'], en: ['vehicles', 'automotive'] },
    weight: 3,
  },
  {
    categorySlug: 'cars',
    keywords: { ar: ['عربية', 'سيارة', 'عربيه', 'سياره'], en: ['car', 'automobile'] },
    weight: 10,
  },
  {
    categorySlug: 'motorcycles',
    keywords: { ar: ['موتسيكل', 'موتوسيكل', 'دراجة نارية', 'موتور'], en: ['motorcycle', 'motorbike', 'scooter'] },
    weight: 12,
  },
  {
    categorySlug: 'auto-parts',
    keywords: { ar: ['قطع غيار', 'فرامل', 'اطارات', 'كاوتش'], en: ['auto parts', 'car parts', 'brakes', 'tires'] },
    weight: 12,
  },
  {
    categorySlug: 'car-accessories',
    keywords: { ar: ['اكسسوارات سيارة', 'كفرات مقاعد', 'داش كام'], en: ['car accessories', 'seat covers', 'dash cam'] },
    weight: 12,
  },

  // ============================================
  // REAL ESTATE (Level 1 → Level 2)
  // ============================================
  {
    categorySlug: 'real-estate',
    keywords: { ar: ['عقارات', 'عقار'], en: ['real estate', 'property'] },
    weight: 3,
  },
  {
    categorySlug: 'apartments',
    keywords: { ar: ['شقة', 'شقه', 'شقق'], en: ['apartment', 'flat'] },
    weight: 12,
  },
  {
    categorySlug: 'villas',
    keywords: { ar: ['فيلا', 'فيله', 'قصر'], en: ['villa', 'mansion'] },
    weight: 12,
  },
  {
    categorySlug: 'commercial',
    keywords: { ar: ['محل', 'محلات', 'مكتب تجاري'], en: ['commercial', 'shop', 'office space'] },
    weight: 12,
  },
  {
    categorySlug: 'land',
    keywords: { ar: ['ارض', 'أرض', 'قطعة ارض'], en: ['land', 'plot'] },
    weight: 12,
  },

  // ============================================
  // HOME APPLIANCES (Level 1 → Level 2)
  // ============================================
  {
    categorySlug: 'home-appliances',
    keywords: { ar: ['أجهزة منزلية', 'اجهزة كهربائية'], en: ['home appliances', 'appliances'] },
    weight: 3,
  },
  {
    categorySlug: 'refrigerators',
    keywords: { ar: ['ثلاجة', 'تلاجة', 'فريزر'], en: ['refrigerator', 'fridge', 'freezer'] },
    weight: 12,
  },
  {
    categorySlug: 'washing-machines',
    keywords: { ar: ['غسالة', 'غساله', 'غسالات'], en: ['washing machine', 'washer', 'laundry machine'] },
    weight: 12,
  },
  {
    categorySlug: 'air-conditioners',
    keywords: { ar: ['تكييف', 'مكيف', 'كارير', 'شارب'], en: ['air conditioner', 'ac', 'carrier', 'sharp'] },
    weight: 12,
  },
  {
    categorySlug: 'ovens-stoves',
    keywords: { ar: ['فرن', 'بوتاجاز', 'موقد'], en: ['oven', 'stove', 'cooker', 'range'] },
    weight: 12,
  },
  {
    categorySlug: 'kitchen-appliances',
    keywords: { ar: ['اجهزة مطبخ', 'ميكروويف', 'ديب فريزر'], en: ['kitchen appliances', 'microwave', 'deep freezer'] },
    weight: 12,
  },

  // ============================================
  // FASHION (Level 1 → Level 2)
  // ============================================
  {
    categorySlug: 'fashion',
    keywords: { ar: ['ملابس', 'هدوم', 'ازياء', 'موضة'], en: ['fashion', 'clothing'] },
    weight: 3,
  },
  {
    categorySlug: 'mens-clothing',
    keywords: { ar: ['ملابس رجالي', 'هدوم رجالي', 'قميص', 'بنطلون رجالي'], en: ['mens clothing', 'men clothes', 'shirt', 'mens pants'] },
    weight: 12,
  },
  {
    categorySlug: 'womens-clothing',
    keywords: { ar: ['ملابس حريمي', 'هدوم ستات', 'فستان', 'بلوزة'], en: ['womens clothing', 'women clothes', 'dress', 'blouse'] },
    weight: 12,
  },
  {
    categorySlug: 'kids-clothing',
    keywords: { ar: ['ملابس اطفال', 'هدوم اطفال', 'ملابس بيبي'], en: ['kids clothing', 'children clothes', 'baby clothes'] },
    weight: 12,
  },
  {
    categorySlug: 'shoes',
    keywords: { ar: ['جزمة', 'حذاء', 'شوز', 'صندل', 'كوتشي'], en: ['shoes', 'sneakers', 'boots', 'sandals'] },
    weight: 12,
  },
  {
    categorySlug: 'bags',
    keywords: { ar: ['شنطة', 'حقيبة', 'شنط', 'باك باك'], en: ['bag', 'handbag', 'backpack', 'purse'] },
    weight: 12,
  },

  // ============================================
  // SPORTS & HOBBIES (Level 1 → Level 2)
  // ============================================
  {
    categorySlug: 'sports-hobbies',
    keywords: { ar: ['رياضة', 'هوايات'], en: ['sports', 'hobbies'] },
    weight: 3,
  },
  {
    categorySlug: 'sports-equipment',
    keywords: { ar: ['معدات رياضية', 'جيم', 'اوزان', 'دامبلز', 'مشاية'], en: ['sports equipment', 'gym', 'weights', 'treadmill', 'fitness'] },
    weight: 12,
  },
  {
    categorySlug: 'bicycles',
    keywords: { ar: ['عجلة', 'دراجة', 'بسكليت', 'دراجة هوائية'], en: ['bicycle', 'bike', 'cycling'] },
    weight: 12,
  },
  {
    categorySlug: 'musical-instruments',
    keywords: { ar: ['آلة موسيقية', 'جيتار', 'بيانو', 'عود', 'طبلة'], en: ['musical instrument', 'guitar', 'piano', 'violin', 'drums'] },
    weight: 12,
  },
  {
    categorySlug: 'toys-games',
    keywords: { ar: ['لعبة', 'العاب', 'بلايستيشن', 'اكس بوكس', 'العاب اطفال'], en: ['toys', 'games', 'playstation', 'xbox', 'nintendo'] },
    weight: 12,
  },

  // ============================================
  // BOOKS & MEDIA (Level 1 → Level 2)
  // ============================================
  {
    categorySlug: 'books-media',
    keywords: { ar: ['كتب ووسائط'], en: ['books and media'] },
    weight: 3,
  },
  {
    categorySlug: 'books',
    keywords: { ar: ['كتاب', 'كتب', 'رواية', 'قصة'], en: ['book', 'books', 'novel'] },
    weight: 12,
  },
  {
    categorySlug: 'magazines',
    keywords: { ar: ['مجلة', 'مجلات'], en: ['magazine', 'magazines'] },
    weight: 12,
  },
  {
    categorySlug: 'dvds-games',
    keywords: { ar: ['اسطوانات', 'سي دي', 'دي في دي'], en: ['dvd', 'cd', 'disc'] },
    weight: 12,
  },

  // ============================================
  // BUILDING MATERIALS (Level 1 → Level 2)
  // ============================================
  {
    categorySlug: 'building-waste',
    keywords: { ar: ['مواد بناء', 'خردة', 'سكراب'], en: ['building materials', 'scrap', 'waste'] },
    weight: 3,
  },
  {
    categorySlug: 'wood',
    keywords: { ar: ['خشب', 'اخشاب', 'الواح خشب'], en: ['wood', 'lumber', 'timber'] },
    weight: 12,
  },
  {
    categorySlug: 'metals',
    keywords: { ar: ['معادن', 'حديد', 'نحاس', 'المنيوم'], en: ['metal', 'iron', 'copper', 'aluminum', 'steel'] },
    weight: 12,
  },
  {
    categorySlug: 'plastics',
    keywords: { ar: ['بلاستيك', 'بلاستك'], en: ['plastic', 'plastics'] },
    weight: 12,
  },
  {
    categorySlug: 'glass',
    keywords: { ar: ['زجاج', 'ازاز'], en: ['glass'] },
    weight: 12,
  },

  // ============================================
  // SERVICES (Level 1 → Level 2)
  // ============================================
  {
    categorySlug: 'services',
    keywords: { ar: ['خدمات', 'خدمة'], en: ['services', 'service'] },
    weight: 3,
  },
  {
    categorySlug: 'maintenance-repair',
    keywords: { ar: ['صيانة', 'تصليح', 'اصلاح'], en: ['maintenance', 'repair', 'fixing'] },
    weight: 12,
  },
  {
    categorySlug: 'moving-shipping',
    keywords: { ar: ['نقل', 'شحن', 'نقل عفش', 'ونش'], en: ['moving', 'shipping', 'transport'] },
    weight: 12,
  },
  {
    categorySlug: 'cleaning',
    keywords: { ar: ['تنظيف', 'نظافة'], en: ['cleaning', 'housekeeping'] },
    weight: 12,
  },

  // ============================================
  // LUXURY GOODS (Level 1 → Level 2)
  // ============================================
  {
    categorySlug: 'luxury',
    keywords: { ar: ['سلع فاخرة', 'لاكشري'], en: ['luxury', 'premium'] },
    weight: 3,
  },
  {
    categorySlug: 'luxury-watches',
    keywords: { ar: ['ساعة فاخرة', 'رولكس', 'اوميغا', 'ساعات ماركة'], en: ['luxury watch', 'rolex', 'omega', 'patek'] },
    weight: 15,
  },
  {
    categorySlug: 'jewelry',
    keywords: { ar: ['مجوهرات', 'ذهب', 'فضة', 'الماس', 'خاتم', 'سلسلة'], en: ['jewelry', 'gold', 'silver', 'diamond', 'ring', 'necklace'] },
    weight: 15,
  },
  {
    categorySlug: 'luxury-bags',
    keywords: { ar: ['شنطة ماركة', 'لويس فيتون', 'شانيل', 'غوتشي'], en: ['luxury bag', 'louis vuitton', 'chanel', 'gucci', 'hermes'] },
    weight: 15,
  },
  {
    categorySlug: 'perfumes',
    keywords: { ar: ['عطر', 'عطور', 'برفان', 'كولونيا'], en: ['perfume', 'fragrance', 'cologne'] },
    weight: 15,
  },
  {
    categorySlug: 'sunglasses',
    keywords: { ar: ['نظارة شمس', 'نظارات شمسية', 'راي بان'], en: ['sunglasses', 'ray ban', 'designer sunglasses'] },
    weight: 15,
  },

  // ============================================
  // ART & COLLECTIBLES (Level 1 → Level 2)
  // ============================================
  {
    categorySlug: 'art-collectibles',
    keywords: { ar: ['فنون', 'مقتنيات', 'تحف'], en: ['art', 'collectibles', 'antiques'] },
    weight: 3,
  },
  {
    categorySlug: 'paintings',
    keywords: { ar: ['لوحة فنية', 'لوحات زيتية', 'رسم'], en: ['painting', 'oil painting', 'artwork'] },
    weight: 12,
  },
  {
    categorySlug: 'antiques',
    keywords: { ar: ['انتيكات', 'تحف قديمة', 'اثريات'], en: ['antique', 'antiques', 'vintage'] },
    weight: 12,
  },
  {
    categorySlug: 'coins-currency',
    keywords: { ar: ['عملات', 'عملات قديمة', 'نقود معدنية'], en: ['coins', 'currency', 'numismatic'] },
    weight: 12,
  },
  {
    categorySlug: 'stamps',
    keywords: { ar: ['طوابع', 'طابع بريد'], en: ['stamps', 'postage stamps'] },
    weight: 12,
  },
];

// ============================================
// Categorization Logic
// ============================================

interface CategorizationResult {
  categorySlug: string;
  categoryId?: string;
  confidence: number; // 0-100
  matchedKeywords: string[];
  suggestedCategories?: Array<{
    slug: string;
    confidence: number;
  }>;
}

/**
 * Automatically categorize an item based on title and description
 */
export async function categorizeItem(
  title: string,
  description?: string
): Promise<CategorizationResult> {
  const text = `${title} ${description || ''}`.toLowerCase();
  const normalizedText = normalizeArabic(text);

  const matches: Array<{
    slug: string;
    score: number;
    keywords: string[];
  }> = [];

  // Check each category's keywords
  for (const category of CATEGORY_KEYWORDS) {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Check Arabic keywords
    category.keywords.ar.forEach(keyword => {
      const normalizedKeyword = normalizeArabic(keyword.toLowerCase());
      if (normalizedText.includes(normalizedKeyword)) {
        score += category.weight;
        matchedKeywords.push(keyword);

        // Bonus for title match (higher relevance)
        if (normalizeArabic(title.toLowerCase()).includes(normalizedKeyword)) {
          score += category.weight * 0.5;
        }
      }
    });

    // Check English keywords
    category.keywords.en.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      if (text.includes(lowerKeyword)) {
        score += category.weight;
        matchedKeywords.push(keyword);

        // Bonus for title match
        if (title.toLowerCase().includes(lowerKeyword)) {
          score += category.weight * 0.5;
        }
      }
    });

    if (score > 0) {
      matches.push({
        slug: category.categorySlug,
        score,
        keywords: matchedKeywords,
      });
    }
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    return {
      categorySlug: 'other', // Default fallback
      confidence: 0,
      matchedKeywords: [],
    };
  }

  // Get top match
  const topMatch = matches[0];
  const maxPossibleScore = topMatch.score * 2; // Theoretical maximum
  const confidence = Math.min((topMatch.score / maxPossibleScore) * 100, 100);

  // Get category ID from database
  const category = await prisma.category.findUnique({
    where: { slug: topMatch.slug },
    select: { id: true },
  });

  // Build suggested alternatives (top 3)
  const suggestedCategories = matches.slice(1, 4).map(match => ({
    slug: match.slug,
    confidence: Math.min((match.score / maxPossibleScore) * 100, 100),
  }));

  return {
    categorySlug: topMatch.slug,
    categoryId: category?.id,
    confidence: Math.round(confidence),
    matchedKeywords: topMatch.keywords,
    suggestedCategories: suggestedCategories.length > 0 ? suggestedCategories : undefined,
  };
}

/**
 * Batch categorize multiple items
 */
export async function categorizeItems(
  items: Array<{ title: string; description?: string }>
): Promise<CategorizationResult[]> {
  return Promise.all(
    items.map(item => categorizeItem(item.title, item.description))
  );
}

/**
 * Get category suggestions for partial input (autocomplete)
 */
export function getCategorySuggestions(partialText: string): string[] {
  const normalized = normalizeArabic(partialText.toLowerCase());
  const suggestions = new Set<string>();

  CATEGORY_KEYWORDS.forEach(category => {
    // Check if any keyword starts with or contains the input
    const matches = [
      ...category.keywords.ar,
      ...category.keywords.en,
    ].some(keyword => {
      const normalizedKeyword = normalizeArabic(keyword.toLowerCase());
      return normalizedKeyword.includes(normalized) || normalized.includes(normalizedKeyword);
    });

    if (matches) {
      suggestions.add(category.categorySlug);
    }
  });

  return Array.from(suggestions);
}

/**
 * Validate categorization confidence
 * Returns true if confidence is high enough to auto-categorize
 */
export function shouldAutoCategorize(confidence: number): boolean {
  return confidence >= 70; // 70% confidence threshold
}

/**
 * Example usage:
 *
 * const result = await categorizeItem(
 *   'ايفون 15 برو ماكس',
 *   'حالة ممتازة 256 جيجا'
 * );
 *
 * logger.info(result);
 * // {
 * //   categorySlug: 'smartphones',
 * //   categoryId: 'uuid-here',
 * //   confidence: 95,
 * //   matchedKeywords: ['ايفون', 'iphone'],
 * //   suggestedCategories: [
 * //     { slug: 'mobile-phones', confidence: 85 }
 * //   ]
 * // }
 *
 * if (shouldAutoCategorize(result.confidence)) {
 *   // Auto-assign category
 * } else {
 *   // Show suggestions to user
 * }
 */
