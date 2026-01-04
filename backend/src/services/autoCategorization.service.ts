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
  // ELECTRONICS (Parent + subcategories)
  // ============================================
  {
    categorySlug: 'electronics',
    keywords: {
      ar: ['الكترونيات', 'إلكترونيات', 'أجهزة', 'اجهزة'],
      en: ['electronics', 'electronic', 'devices', 'gadgets'],
    },
    weight: 3, // Low weight for parent - prefer specific subcategories
  },
  {
    categorySlug: 'mobile-phones',
    keywords: {
      ar: ['موبايل', 'موبيل', 'تليفون', 'محمول', 'جوال', 'هاتف', 'سامسونج', 'ايفون', 'اوبو', 'شاومي', 'هواوي'],
      en: ['mobile', 'phone', 'smartphone', 'iphone', 'samsung', 'oppo', 'xiaomi', 'huawei', 'realme', 'oneplus'],
    },
    weight: 10,
  },
  {
    categorySlug: 'smartphones',
    keywords: {
      ar: ['سمارت فون', 'هاتف ذكي', 'ايفون', 'اندرويد'],
      en: ['smartphone', 'iphone', 'android', 'ios'],
    },
    weight: 15,
  },
  {
    categorySlug: 'laptops',
    keywords: {
      ar: ['لاب توب', 'لابتوب', 'كمبيوتر محمول', 'نوت بوك'],
      en: ['laptop', 'notebook', 'macbook', 'dell', 'hp', 'lenovo', 'asus'],
    },
    weight: 10,
  },
  {
    categorySlug: 'tablets',
    keywords: {
      ar: ['تابلت', 'ايباد', 'لوحي'],
      en: ['tablet', 'ipad', 'galaxy tab', 'tab'],
    },
    weight: 10,
  },
  {
    categorySlug: 'tv',
    keywords: {
      ar: ['تليفزيون', 'تلفزيون', 'شاشه', 'شاشة', 'تلفزة', 'سمارت تي في'],
      en: ['tv', 'television', 'smart tv', 'led', 'lcd', 'samsung tv', 'lg tv'],
    },
    weight: 10,
  },
  {
    categorySlug: 'cameras',
    keywords: {
      ar: ['كاميرا', 'كاميره', 'تصوير', 'فوتوغرافي'],
      en: ['camera', 'canon', 'nikon', 'sony camera', 'dslr', 'mirrorless'],
    },
    weight: 10,
  },

  // ============================================
  // HOME APPLIANCES
  // ============================================
  {
    categorySlug: 'refrigerators',
    keywords: {
      ar: ['تلاجه', 'تلاجة', 'ثلاجة', 'ثلاجه', 'فريزر'],
      en: ['refrigerator', 'fridge', 'freezer'],
    },
    weight: 10,
  },
  {
    categorySlug: 'washing-machines',
    keywords: {
      ar: ['غساله', 'غسالة', 'غسالات'],
      en: ['washing machine', 'washer', 'laundry'],
    },
    weight: 10,
  },
  {
    categorySlug: 'air-conditioners',
    keywords: {
      ar: ['تكييف', 'مكيف', 'تكيف', 'كارير', 'شارب'],
      en: ['air conditioner', 'ac', 'air conditioning', 'carrier', 'sharp'],
    },
    weight: 10,
  },
  {
    categorySlug: 'microwaves',
    keywords: {
      ar: ['ميكروويف', 'مايكرويف', 'فرن'],
      en: ['microwave', 'oven'],
    },
    weight: 10,
  },

  // ============================================
  // VEHICLES (Parent + subcategories)
  // ============================================
  {
    categorySlug: 'vehicles',
    keywords: {
      ar: ['مركبات', 'عربيات', 'سيارات'],
      en: ['vehicles', 'automotive', 'auto'],
    },
    weight: 3,
  },
  {
    categorySlug: 'cars',
    keywords: {
      ar: ['عربيه', 'عربية', 'سيارة', 'سياره', 'عربيت'],
      en: ['car', 'vehicle', 'auto', 'automobile'],
    },
    weight: 5,
  },
  {
    categorySlug: 'sedans',
    keywords: {
      ar: ['سيدان', 'سيارة ركوب'],
      en: ['sedan', 'saloon'],
    },
    weight: 12,
  },
  {
    categorySlug: 'suv',
    keywords: {
      ar: ['اس يو في', 'سوفي', 'رياضية'],
      en: ['suv', 'sport utility', 'crossover'],
    },
    weight: 12,
  },
  {
    categorySlug: 'motorcycles',
    keywords: {
      ar: ['موتسيكل', 'موتوسيكل', 'موتور', 'دراجة', 'دراجه نارية'],
      en: ['motorcycle', 'motorbike', 'bike', 'scooter'],
    },
    weight: 10,
  },

  // ============================================
  // REAL ESTATE (Parent + subcategories)
  // ============================================
  {
    categorySlug: 'real-estate',
    keywords: {
      ar: ['عقارات', 'عقار', 'ايجار', 'بيع'],
      en: ['real estate', 'property', 'realty'],
    },
    weight: 3,
  },
  {
    categorySlug: 'apartments',
    keywords: {
      ar: ['شقه', 'شقة', 'سكن', 'شقق'],
      en: ['apartment', 'flat', 'unit'],
    },
    weight: 10,
  },
  {
    categorySlug: 'villas',
    keywords: {
      ar: ['فيلا', 'فيله', 'قصر'],
      en: ['villa', 'mansion', 'house'],
    },
    weight: 10,
  },
  {
    categorySlug: 'land',
    keywords: {
      ar: ['ارض', 'أرض', 'قطعة ارض'],
      en: ['land', 'plot', 'lot'],
    },
    weight: 10,
  },

  // ============================================
  // FURNITURE (Parent category)
  // ============================================
  {
    categorySlug: 'furniture',
    keywords: {
      ar: ['أثاث', 'اثاث', 'مفروشات', 'موبيليا', 'فرش'],
      en: ['furniture', 'furnishing', 'furnishings'],
    },
    weight: 5, // Lower weight for parent - prefer specific subcategories
  },
  // Living Room Furniture
  {
    categorySlug: 'sofas-couches',
    keywords: {
      ar: ['كنبه', 'كنبة', 'صالون', 'انتريه', 'أريكة', 'اريكة', 'ركنة'],
      en: ['sofa', 'couch', 'settee', 'living room'],
    },
    weight: 12,
  },
  {
    categorySlug: 'tables',
    keywords: {
      ar: ['ترابيزه', 'ترابيزة', 'طاولة', 'منضدة', 'سفرة'],
      en: ['table', 'dining table', 'coffee table'],
    },
    weight: 10,
  },
  {
    categorySlug: 'tv-units',
    keywords: {
      ar: ['وحدة تلفزيون', 'ستاند تلفزيون', 'طاولة تلفزيون'],
      en: ['tv unit', 'tv stand', 'entertainment center'],
    },
    weight: 12,
  },
  // Bedroom Furniture
  {
    categorySlug: 'beds',
    keywords: {
      ar: ['سرير', 'سراير', 'غرفة نوم', 'مرتبة'],
      en: ['bed', 'mattress', 'bedroom'],
    },
    weight: 12,
  },
  {
    categorySlug: 'wardrobes',
    keywords: {
      ar: ['دولاب', 'خزانة', 'خزانه', 'دواليب'],
      en: ['wardrobe', 'closet', 'armoire', 'cabinet'],
    },
    weight: 12,
  },
  {
    categorySlug: 'dressers',
    keywords: {
      ar: ['تسريحة', 'تسريحه', 'مرآة'],
      en: ['dresser', 'vanity', 'dressing table'],
    },
    weight: 12,
  },
  // Office Furniture
  {
    categorySlug: 'desks',
    keywords: {
      ar: ['مكتب', 'مكاتب', 'ديسك'],
      en: ['desk', 'office desk', 'work desk'],
    },
    weight: 12,
  },
  {
    categorySlug: 'office-chairs',
    keywords: {
      ar: ['كرسي مكتب', 'كراسي مكتب', 'كرسى'],
      en: ['office chair', 'desk chair', 'computer chair'],
    },
    weight: 12,
  },

  // ============================================
  // FASHION (Parent + subcategories)
  // ============================================
  {
    categorySlug: 'fashion',
    keywords: {
      ar: ['ملابس', 'لبس', 'هدوم', 'موضة', 'ازياء'],
      en: ['fashion', 'clothing', 'clothes', 'apparel'],
    },
    weight: 3,
  },
  {
    categorySlug: 'mens-clothing',
    keywords: {
      ar: ['هدوم رجالي', 'ملابس رجالي', 'رجال'],
      en: ['mens clothing', 'men', 'male'],
    },
    weight: 8,
  },
  {
    categorySlug: 'womens-clothing',
    keywords: {
      ar: ['هدوم حريمي', 'ملابس حريمي', 'نساء', 'ستات'],
      en: ['womens clothing', 'women', 'female', 'ladies'],
    },
    weight: 8,
  },
  {
    categorySlug: 'shoes',
    keywords: {
      ar: ['جزمه', 'جزمة', 'حذاء', 'شوز'],
      en: ['shoes', 'footwear', 'sneakers', 'boots'],
    },
    weight: 10,
  },
  {
    categorySlug: 'bags',
    keywords: {
      ar: ['شنطه', 'شنطة', 'حقيبة', 'حقيبه'],
      en: ['bag', 'handbag', 'purse', 'backpack'],
    },
    weight: 10,
  },

  // ============================================
  // TOYS & GAMES
  // ============================================
  {
    categorySlug: 'toys-games',
    keywords: {
      ar: ['لعبه', 'لعبة', 'العاب اطفال', 'لعب', 'العاب', 'بلايستيشن', 'اكس بوكس', 'جيمز'],
      en: ['toy', 'toys', 'kids toys', 'children', 'playstation', 'xbox', 'video games', 'gaming', 'ps5', 'ps4', 'nintendo'],
    },
    weight: 10,
  },

  // ============================================
  // SPORTS & HOBBIES
  // ============================================
  {
    categorySlug: 'sports-hobbies',
    keywords: {
      ar: ['رياضة', 'رياضه', 'هوايات'],
      en: ['sports', 'hobbies', 'sport'],
    },
    weight: 5,
  },
  {
    categorySlug: 'sports-equipment',
    keywords: {
      ar: ['جيم', 'تمارين', 'اوزان', 'دامبلز', 'معدات رياضية', 'بنش'],
      en: ['gym', 'fitness', 'workout', 'weights', 'dumbbells', 'treadmill', 'sports equipment'],
    },
    weight: 12,
  },
  {
    categorySlug: 'bicycles',
    keywords: {
      ar: ['عجله', 'عجلة', 'دراجة هوائية', 'بسكليت', 'دراجة'],
      en: ['bicycle', 'bike', 'cycle', 'cycling'],
    },
    weight: 12,
  },
  {
    categorySlug: 'musical-instruments',
    keywords: {
      ar: ['جيتار', 'بيانو', 'عود', 'الة موسيقية', 'موسيقى'],
      en: ['guitar', 'piano', 'musical instrument', 'music', 'violin', 'drums'],
    },
    weight: 12,
  },

  // ============================================
  // BOOKS & MEDIA
  // ============================================
  {
    categorySlug: 'books',
    keywords: {
      ar: ['كتاب', 'كتب', 'روايه', 'رواية', 'قصه', 'قصة'],
      en: ['book', 'books', 'novel', 'story', 'reading'],
    },
    weight: 12,
  },

  // ============================================
  // HOME APPLIANCES (Parent & subcategories)
  // ============================================
  {
    categorySlug: 'home-appliances',
    keywords: {
      ar: ['أجهزة منزلية', 'اجهزة منزليه', 'كهربائي'],
      en: ['home appliances', 'appliances', 'household'],
    },
    weight: 5,
  },
  {
    categorySlug: 'ovens-stoves',
    keywords: {
      ar: ['فرن', 'بوتاجاز', 'بوتجاز', 'موقد', 'طباخ'],
      en: ['oven', 'stove', 'cooker', 'range'],
    },
    weight: 12,
  },
  {
    categorySlug: 'kitchen-appliances',
    keywords: {
      ar: ['خلاط', 'عصارة', 'محضر طعام', 'توستر', 'كبة'],
      en: ['blender', 'juicer', 'food processor', 'toaster', 'mixer'],
    },
    weight: 12,
  },

  // ============================================
  // LUXURY GOODS
  // ============================================
  {
    categorySlug: 'luxury',
    keywords: {
      ar: ['فاخر', 'لاكشري', 'ماركة', 'اصلي', 'برند'],
      en: ['luxury', 'premium', 'designer', 'brand', 'original'],
    },
    weight: 5,
  },
  {
    categorySlug: 'luxury-watches',
    keywords: {
      ar: ['ساعة', 'ساعات', 'رولكس', 'اوميغا'],
      en: ['watch', 'watches', 'rolex', 'omega', 'timepiece'],
    },
    weight: 12,
  },
  {
    categorySlug: 'jewelry',
    keywords: {
      ar: ['ذهب', 'مجوهرات', 'فضة', 'الماس', 'خاتم', 'سلسلة', 'اساور'],
      en: ['gold', 'jewelry', 'silver', 'diamond', 'ring', 'necklace', 'bracelet'],
    },
    weight: 12,
  },
  {
    categorySlug: 'perfumes',
    keywords: {
      ar: ['عطر', 'عطور', 'برفيوم', 'بخور'],
      en: ['perfume', 'fragrance', 'cologne', 'scent'],
    },
    weight: 12,
  },

  // ============================================
  // BUILDING MATERIALS & WASTE
  // ============================================
  {
    categorySlug: 'building-waste',
    keywords: {
      ar: ['خردة', 'سكراب', 'نفايات', 'مخلفات'],
      en: ['scrap', 'waste', 'recycling', 'junk'],
    },
    weight: 5,
  },
  {
    categorySlug: 'metals',
    keywords: {
      ar: ['حديد', 'نحاس', 'المنيوم', 'معدن'],
      en: ['metal', 'iron', 'copper', 'aluminum', 'steel'],
    },
    weight: 12,
  },
  {
    categorySlug: 'wood',
    keywords: {
      ar: ['خشب', 'اخشاب', 'موبيليا قديمة'],
      en: ['wood', 'lumber', 'timber'],
    },
    weight: 12,
  },

  // ============================================
  // SERVICES
  // ============================================
  {
    categorySlug: 'services',
    keywords: {
      ar: ['خدمة', 'خدمات', 'صيانة', 'تصليح'],
      en: ['service', 'services', 'maintenance', 'repair'],
    },
    weight: 5,
  },
  {
    categorySlug: 'moving-shipping',
    keywords: {
      ar: ['نقل', 'شحن', 'نقل عفش', 'ونش'],
      en: ['moving', 'shipping', 'transportation', 'delivery'],
    },
    weight: 12,
  },
  {
    categorySlug: 'cleaning',
    keywords: {
      ar: ['تنظيف', 'نظافة', 'غسيل'],
      en: ['cleaning', 'housekeeping', 'washing'],
    },
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
