/**
 * Automatic Item Categorization Service
 * FREE keyword-based system for Egyptian market
 *
 * Categorizes items into the 218 categories automatically
 * Based on title, description, and keywords
 */

import prisma from '../config/database';
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
  // ELECTRONICS
  // ============================================
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
  // VEHICLES
  // ============================================
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
  // REAL ESTATE
  // ============================================
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
  // FURNITURE
  // ============================================
  {
    categorySlug: 'sofas',
    keywords: {
      ar: ['كنبه', 'كنبة', 'صالون', 'انتريه'],
      en: ['sofa', 'couch', 'settee'],
    },
    weight: 10,
  },
  {
    categorySlug: 'beds',
    keywords: {
      ar: ['سرير', 'سراير', 'نوم'],
      en: ['bed', 'mattress'],
    },
    weight: 10,
  },
  {
    categorySlug: 'wardrobes',
    keywords: {
      ar: ['دولاب', 'خزانة', 'خزانه'],
      en: ['wardrobe', 'closet', 'armoire'],
    },
    weight: 10,
  },
  {
    categorySlug: 'tables',
    keywords: {
      ar: ['ترابيزه', 'ترابيزة', 'طاولة', 'منضدة'],
      en: ['table', 'desk', 'dining table'],
    },
    weight: 8,
  },

  // ============================================
  // FASHION
  // ============================================
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
    categorySlug: 'video-games',
    keywords: {
      ar: ['بلايستيشن', 'اكس بوكس', 'العاب فيديو', 'جيمز'],
      en: ['playstation', 'xbox', 'video games', 'gaming', 'ps5', 'ps4', 'nintendo'],
    },
    weight: 10,
  },
  {
    categorySlug: 'toys',
    keywords: {
      ar: ['لعبه', 'لعبة', 'العاب اطفال', 'لعب'],
      en: ['toy', 'toys', 'kids toys', 'children'],
    },
    weight: 8,
  },

  // ============================================
  // SPORTS
  // ============================================
  {
    categorySlug: 'gym-equipment',
    keywords: {
      ar: ['جيم', 'رياضه', 'تمارين', 'اوزان', 'دامبلز'],
      en: ['gym', 'fitness', 'workout', 'weights', 'dumbbells', 'treadmill'],
    },
    weight: 10,
  },
  {
    categorySlug: 'bicycles',
    keywords: {
      ar: ['عجله', 'عجلة', 'دراجة هوائية', 'بسكليت'],
      en: ['bicycle', 'bike', 'cycle'],
    },
    weight: 10,
  },

  // ============================================
  // BOOKS
  // ============================================
  {
    categorySlug: 'books',
    keywords: {
      ar: ['كتاب', 'كتب', 'روايه', 'رواية', 'قصه'],
      en: ['book', 'books', 'novel', 'story'],
    },
    weight: 10,
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
 * console.log(result);
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
