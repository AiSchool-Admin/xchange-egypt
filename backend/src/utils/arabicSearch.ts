/**
 * Arabic Text Processing Utilities
 * FREE solution for Egyptian Arabic support
 *
 * Handles:
 * - Diacritic removal
 * - Character normalization
 * - Egyptian dialect variations
 * - Phonetic matching
 */

/**
 * Remove Arabic diacritics (تشكيل)
 * Makes search independent of vowel marks
 */
export function removeDiacritics(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

/**
 * Normalize Arabic characters
 * Handles variations of alef, taa marbuta, etc.
 */
export function normalizeArabic(text: string): string {
  let normalized = text;

  // Remove diacritics
  normalized = removeDiacritics(normalized);

  // Normalize Alef variations (ا، أ، إ، آ → ا)
  normalized = normalized.replace(/[أإآ]/g, 'ا');

  // Normalize Taa Marbuta (ة → ه)
  normalized = normalized.replace(/ة/g, 'ه');

  // Normalize Yaa variations (ى → ي)
  normalized = normalized.replace(/ى/g, 'ي');

  // Normalize Hamza variations
  normalized = normalized.replace(/[ؤئ]/g, '');

  return normalized;
}

/**
 * Egyptian dialect word variations
 * Common spelling variations in Egyptian Arabic
 */
export const EGYPTIAN_VARIATIONS: Record<string, string[]> = {
  // Technology
  'موبايل': ['موبيل', 'تليفون', 'محمول', 'جوال'],
  'كمبيوتر': ['كومبيوتر', 'لاب توب', 'لابتوب'],
  'تليفزيون': ['تلفزيون', 'تلفيزيون', 'شاشه', 'شاشة'],

  // Vehicles
  'عربيه': ['عربية', 'سيارة', 'سياره', 'عربيت'],
  'موتسيكل': ['موتوسيكل', 'موتور', 'دراجة', 'دراجه'],

  // Home
  'شقه': ['شقة', 'سكن', 'بيت'],
  'اوضه': ['اوضة', 'غرفة', 'غرفه'],
  'دولاب': ['خزانة', 'خزانه'],

  // Appliances
  'تلاجه': ['تلاجة', 'ثلاجة', 'ثلاجه'],
  'غساله': ['غسالة', 'غسالات'],
  'بوتاجاز': ['فرن', 'بتجاز'],

  // Clothing
  'هدوم': ['ملابس', 'لبس'],
  'جزمه': ['جزمة', 'حذاء'],

  // Common terms
  'حاجه': ['حاجة', 'شيء', 'شئ'],
  'كويس': ['جيد', 'حلو', 'زين'],
  'جديد': ['جديده', 'نيو'],
  'مستعمل': ['مستعمله', 'يوزد', 'used'],
};

/**
 * Expand Egyptian search query with dialect variations
 */
export function expandEgyptianQuery(query: string): string[] {
  const normalized = normalizeArabic(query.toLowerCase());
  const words = normalized.split(/\s+/);
  const expanded = new Set<string>([query, normalized]);

  // Add variations for each word
  words.forEach(word => {
    if (EGYPTIAN_VARIATIONS[word]) {
      EGYPTIAN_VARIATIONS[word].forEach(variation => {
        expanded.add(variation);
      });
    }
  });

  // Add partial matches for common prefixes
  Object.keys(EGYPTIAN_VARIATIONS).forEach(key => {
    if (key.includes(normalized) || normalized.includes(key)) {
      EGYPTIAN_VARIATIONS[key].forEach(variation => {
        expanded.add(variation);
      });
    }
  });

  return Array.from(expanded);
}

/**
 * Create PostgreSQL full-text search query
 * Supports both Arabic and English
 */
export function createFullTextSearchQuery(query: string): string {
  const normalized = normalizeArabic(query);
  const words = normalized.split(/\s+/).filter(w => w.length > 2);

  // Create tsquery format: word1 & word2 & word3
  return words.join(' & ');
}

/**
 * Phonetic matching for Egyptian Arabic
 * Handles common misspellings
 */
export const PHONETIC_EGYPTIAN: Record<string, string[]> = {
  // S sounds
  'س': ['ص', 'ث'],
  'ص': ['س', 'ض'],

  // T sounds
  'ت': ['ط', 'ة'],
  'ط': ['ت'],

  // D sounds
  'د': ['ض', 'ذ'],
  'ض': ['د', 'ظ'],

  // Z sounds
  'ز': ['ظ', 'ذ'],
  'ظ': ['ز', 'ض'],

  // H sounds
  'ه': ['ح', 'ة'],
  'ح': ['ه', 'خ'],

  // K sounds
  'ك': ['ق'],
  'ق': ['ك'],
};

/**
 * Generate phonetic variations
 */
export function getPhoneticVariations(word: string): string[] {
  const variations = new Set<string>([word]);
  const chars = word.split('');

  // Replace each character with phonetic equivalents
  chars.forEach((char, index) => {
    if (PHONETIC_EGYPTIAN[char]) {
      PHONETIC_EGYPTIAN[char].forEach(replacement => {
        const variation = chars.slice();
        variation[index] = replacement;
        variations.add(variation.join(''));
      });
    }
  });

  return Array.from(variations);
}

/**
 * Smart search query builder
 * Combines normalization, variations, and phonetics
 */
export function buildSmartSearchTerms(query: string): {
  exact: string;
  normalized: string;
  variations: string[];
  phonetic: string[];
  expanded: string[];
} {
  const exact = query.trim();
  const normalized = normalizeArabic(exact);
  const expanded = expandEgyptianQuery(exact);

  // Get phonetic variations for each word
  const words = normalized.split(/\s+/);
  const phonetic = words.flatMap(word => getPhoneticVariations(word));

  return {
    exact,
    normalized,
    variations: expanded,
    phonetic,
    expanded: [...new Set([exact, normalized, ...expanded, ...phonetic])],
  };
}

/**
 * Calculate search relevance score
 * FREE algorithm - no AI needed
 */
export function calculateRelevanceScore(
  searchTerms: string[],
  title: string,
  description: string,
  category?: string
): number {
  let score = 0;
  const titleLower = normalizeArabic(title.toLowerCase());
  const descLower = normalizeArabic(description?.toLowerCase() || '');
  const catLower = normalizeArabic(category?.toLowerCase() || '');

  searchTerms.forEach(term => {
    const termLower = normalizeArabic(term.toLowerCase());

    // Title exact match (highest weight)
    if (titleLower === termLower) score += 100;

    // Title contains (high weight)
    if (titleLower.includes(termLower)) score += 50;

    // Title starts with (medium weight)
    if (titleLower.startsWith(termLower)) score += 30;

    // Description contains (medium weight)
    if (descLower.includes(termLower)) score += 20;

    // Category contains (low weight)
    if (catLower.includes(termLower)) score += 10;

    // Word boundary match (bonus)
    const wordBoundary = new RegExp(`\\b${termLower}\\b`, 'i');
    if (wordBoundary.test(titleLower)) score += 25;
  });

  return score;
}

/**
 * Detect language of text
 */
export function detectLanguage(text: string): 'ar' | 'en' | 'mixed' {
  const arabicChars = text.match(/[\u0600-\u06FF]/g);
  const englishChars = text.match(/[a-zA-Z]/g);

  const arabicCount = arabicChars?.length || 0;
  const englishCount = englishChars?.length || 0;

  if (arabicCount === 0 && englishCount > 0) return 'en';
  if (arabicCount > 0 && englishCount === 0) return 'ar';
  return 'mixed';
}

/**
 * Sort by relevance
 */
export function sortByRelevance<T extends { relevanceScore?: number }>(
  items: T[]
): T[] {
  return items.sort((a, b) => {
    const scoreA = a.relevanceScore || 0;
    const scoreB = b.relevanceScore || 0;
    return scoreB - scoreA;
  });
}

/**
 * Example usage:
 *
 * const terms = buildSmartSearchTerms('موبايل سامسونج');
 * // Returns: {
 * //   exact: 'موبايل سامسونج',
 * //   normalized: 'موبايل سامسونج',
 * //   variations: ['موبايل', 'موبيل', 'تليفون', 'محمول', ...],
 * //   phonetic: ['موبايل', 'موبايل', ...],
 * //   expanded: [...all unique terms]
 * // }
 *
 * // Use in Prisma query:
 * const items = await prisma.item.findMany({
 *   where: {
 *     OR: terms.expanded.map(term => ({
 *       title: { contains: term, mode: 'insensitive' }
 *     }))
 *   }
 * });
 */
