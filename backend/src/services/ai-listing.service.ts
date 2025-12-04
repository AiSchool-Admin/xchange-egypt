import prisma from '../lib/prisma';

// ============================================
// AI Listing Generator Service
// خدمة إنشاء الإعلانات بالذكاء الاصطناعي
// ============================================

interface ImageAnalysisResult {
  title: string;
  description: string;
  category: string;
  tags: string[];
  estimatedPrice: number;
  condition: string;
  brand?: string;
  model?: string;
  color?: string;
  confidence: number;
}

// Simulated AI analysis based on common patterns
const CATEGORY_KEYWORDS: Record<string, { keywords: string[]; avgPrice: number; category: string }> = {
  phones: {
    keywords: ['iphone', 'samsung', 'galaxy', 'هاتف', 'موبايل', 'phone', 'xiaomi', 'huawei', 'oppo'],
    avgPrice: 8000,
    category: 'الإلكترونيات',
  },
  laptops: {
    keywords: ['laptop', 'لابتوب', 'macbook', 'dell', 'hp', 'lenovo', 'asus', 'acer'],
    avgPrice: 15000,
    category: 'الإلكترونيات',
  },
  furniture: {
    keywords: ['كنبة', 'سرير', 'طاولة', 'كرسي', 'دولاب', 'مكتب', 'sofa', 'bed', 'table', 'chair'],
    avgPrice: 5000,
    category: 'الأثاث',
  },
  appliances: {
    keywords: ['ثلاجة', 'غسالة', 'مكيف', 'تكييف', 'فرن', 'ميكرويف', 'خلاط'],
    avgPrice: 8000,
    category: 'الأجهزة المنزلية',
  },
  cars: {
    keywords: ['سيارة', 'عربية', 'car', 'bmw', 'mercedes', 'toyota', 'hyundai', 'kia'],
    avgPrice: 200000,
    category: 'السيارات',
  },
  fashion: {
    keywords: ['فستان', 'قميص', 'بنطلون', 'حذاء', 'شنطة', 'ساعة', 'نظارة'],
    avgPrice: 500,
    category: 'الأزياء',
  },
  sports: {
    keywords: ['دراجة', 'جيم', 'رياضة', 'كرة', 'مضرب', 'bicycle', 'gym', 'fitness'],
    avgPrice: 3000,
    category: 'الرياضة',
  },
  kids: {
    keywords: ['أطفال', 'لعبة', 'عربة أطفال', 'سرير أطفال', 'baby', 'kids', 'toys'],
    avgPrice: 1000,
    category: 'الأطفال',
  },
};

const CONDITION_KEYWORDS: Record<string, string[]> = {
  NEW: ['جديد', 'new', 'sealed', 'مغلف', 'لم يستخدم'],
  LIKE_NEW: ['ممتاز', 'كالجديد', 'like new', 'excellent'],
  GOOD: ['جيد', 'مستعمل', 'good', 'used'],
  FAIR: ['مقبول', 'fair', 'متوسط'],
};

const BRAND_PATTERNS = [
  'apple', 'samsung', 'huawei', 'xiaomi', 'oppo', 'vivo', 'realme',
  'dell', 'hp', 'lenovo', 'asus', 'acer', 'toshiba',
  'sony', 'lg', 'panasonic', 'philips', 'toshiba',
  'toyota', 'honda', 'nissan', 'hyundai', 'kia', 'bmw', 'mercedes', 'chevrolet',
  'ikea', 'ashley', 'homebox',
  'nike', 'adidas', 'puma', 'reebok', 'zara', 'h&m',
];

export class AIListingService {
  /**
   * Analyze image and generate listing data
   */
  async analyzeImage(userId: string, imageUrl: string): Promise<ImageAnalysisResult> {
    // In production, this would call a real AI vision API
    // For now, we simulate based on common patterns

    // Create draft record
    const draft = await prisma.aIListingDraft.create({
      data: {
        userId,
        sourceType: 'IMAGE',
        sourceUrl: imageUrl,
        status: 'DRAFT',
      },
    });

    // Simulate AI analysis (in production, use Google Vision, AWS Rekognition, etc.)
    const analysis = this.simulateImageAnalysis(imageUrl);

    // Update draft with analysis
    await prisma.aIListingDraft.update({
      where: { id: draft.id },
      data: {
        generatedTitle: analysis.title,
        generatedDesc: analysis.description,
        generatedCategory: analysis.category,
        generatedTags: analysis.tags,
        estimatedPrice: analysis.estimatedPrice,
        confidence: analysis.confidence,
        detectedBrand: analysis.brand,
        detectedModel: analysis.model,
        detectedCondition: analysis.condition,
        detectedColor: analysis.color,
      },
    });

    return { ...analysis, draftId: draft.id } as ImageAnalysisResult & { draftId: string };
  }

  /**
   * Analyze text description and generate listing data
   */
  async analyzeText(userId: string, text: string): Promise<ImageAnalysisResult> {
    const lowerText = text.toLowerCase();

    // Detect category
    let detectedCategory = 'أخرى';
    let avgPrice = 1000;
    for (const [, info] of Object.entries(CATEGORY_KEYWORDS)) {
      if (info.keywords.some(kw => lowerText.includes(kw))) {
        detectedCategory = info.category;
        avgPrice = info.avgPrice;
        break;
      }
    }

    // Detect condition
    let condition = 'GOOD';
    for (const [cond, keywords] of Object.entries(CONDITION_KEYWORDS)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        condition = cond;
        break;
      }
    }

    // Detect brand
    const brand = BRAND_PATTERNS.find(b => lowerText.includes(b));

    // Extract price if mentioned
    const priceMatch = text.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:جنيه|ج\.م|EGP|LE)/i);
    const estimatedPrice = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : avgPrice;

    // Generate title
    const title = this.generateTitle(text, detectedCategory, brand);

    // Generate description
    const description = this.generateDescription(text, detectedCategory, condition);

    // Generate tags
    const tags = this.extractTags(text);

    const draft = await prisma.aIListingDraft.create({
      data: {
        userId,
        sourceType: 'TEXT',
        sourceText: text,
        generatedTitle: title,
        generatedDesc: description,
        generatedCategory: detectedCategory,
        generatedTags: tags,
        estimatedPrice,
        confidence: 0.75,
        detectedBrand: brand,
        detectedCondition: condition,
        status: 'DRAFT',
      },
    });

    return {
      title,
      description,
      category: detectedCategory,
      tags,
      estimatedPrice,
      condition,
      brand,
      confidence: 0.75,
      draftId: draft.id,
    } as ImageAnalysisResult & { draftId: string };
  }

  /**
   * Get user's drafts
   */
  async getUserDrafts(userId: string, status?: string) {
    return prisma.aIListingDraft.findMany({
      where: {
        userId,
        status: status || 'DRAFT',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get draft by ID
   */
  async getDraft(draftId: string, userId: string) {
    return prisma.aIListingDraft.findFirst({
      where: { id: draftId, userId },
    });
  }

  /**
   * Update draft
   */
  async updateDraft(
    draftId: string,
    userId: string,
    data: {
      generatedTitle?: string;
      generatedDesc?: string;
      generatedCategory?: string;
      generatedTags?: string[];
      estimatedPrice?: number;
    }
  ) {
    return prisma.aIListingDraft.updateMany({
      where: { id: draftId, userId },
      data,
    });
  }

  /**
   * Publish draft as item
   */
  async publishDraft(draftId: string, userId: string) {
    const draft = await prisma.aIListingDraft.findFirst({
      where: { id: draftId, userId, status: 'DRAFT' },
    });

    if (!draft) {
      throw new Error('المسودة غير موجودة');
    }

    // Find or create category
    let category = await prisma.category.findFirst({
      where: { nameAr: draft.generatedCategory || 'أخرى' },
    });

    if (!category) {
      category = await prisma.category.findFirst({
        where: { nameAr: 'أخرى' },
      });
    }

    // Create item
    const item = await prisma.item.create({
      data: {
        userId,
        title: draft.generatedTitle || 'منتج جديد',
        description: draft.generatedDesc || '',
        categoryId: category?.id,
        estimatedValue: draft.estimatedPrice || 0,
        images: draft.sourceUrl ? [draft.sourceUrl] : [],
        tags: draft.generatedTags || [],
        condition: (draft.detectedCondition as any) || 'GOOD',
        status: 'ACTIVE',
        type: 'PHYSICAL',
      },
    });

    // Update draft
    await prisma.aIListingDraft.update({
      where: { id: draftId },
      data: {
        status: 'PUBLISHED',
        publishedItemId: item.id,
      },
    });

    return item;
  }

  /**
   * Discard draft
   */
  async discardDraft(draftId: string, userId: string) {
    return prisma.aIListingDraft.updateMany({
      where: { id: draftId, userId },
      data: { status: 'DISCARDED' },
    });
  }

  /**
   * Simulate image analysis (placeholder for real AI)
   */
  private simulateImageAnalysis(imageUrl: string): ImageAnalysisResult {
    // In production, this would use real AI vision APIs
    // For demo, return generic result
    return {
      title: 'منتج للمقايضة',
      description: 'منتج في حالة جيدة متاح للمقايضة أو البيع. يرجى التواصل لمزيد من التفاصيل.',
      category: 'أخرى',
      tags: ['مقايضة', 'للبيع', 'مستعمل'],
      estimatedPrice: 1000,
      condition: 'GOOD',
      confidence: 0.5,
    };
  }

  /**
   * Generate title from text
   */
  private generateTitle(text: string, category: string, brand?: string): string {
    const words = text.split(/\s+/).slice(0, 5);
    let title = words.join(' ');

    if (brand) {
      title = `${brand.charAt(0).toUpperCase() + brand.slice(1)} - ${title}`;
    }

    if (title.length > 100) {
      title = title.substring(0, 97) + '...';
    }

    return title || `منتج ${category}`;
  }

  /**
   * Generate description from text
   */
  private generateDescription(text: string, category: string, condition: string): string {
    const conditionAr: Record<string, string> = {
      NEW: 'جديد',
      LIKE_NEW: 'كالجديد',
      GOOD: 'جيد',
      FAIR: 'مقبول',
    };

    return `${text}\n\n📦 الفئة: ${category}\n✨ الحالة: ${conditionAr[condition] || 'جيد'}\n\n✅ متاح للمقايضة أو البيع\n📞 تواصل معي للتفاوض`;
  }

  /**
   * Extract tags from text
   */
  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const lowerText = text.toLowerCase();

    // Add category-based tags
    for (const [key, info] of Object.entries(CATEGORY_KEYWORDS)) {
      if (info.keywords.some(kw => lowerText.includes(kw))) {
        tags.push(info.category);
        tags.push(key);
      }
    }

    // Add brand as tag
    const brand = BRAND_PATTERNS.find(b => lowerText.includes(b));
    if (brand) {
      tags.push(brand);
    }

    // Add condition as tag
    for (const [cond, keywords] of Object.entries(CONDITION_KEYWORDS)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        tags.push(cond.toLowerCase());
        break;
      }
    }

    // Add common tags
    if (lowerText.includes('مقايضة') || lowerText.includes('تبادل')) {
      tags.push('مقايضة');
    }
    if (lowerText.includes('للبيع') || lowerText.includes('بيع')) {
      tags.push('للبيع');
    }

    return [...new Set(tags)].slice(0, 10);
  }

  /**
   * Get price suggestion for category
   */
  async getPriceSuggestion(categoryName: string, condition: string) {
    // Get average prices from similar items
    const items = await prisma.item.findMany({
      where: {
        category: { nameAr: categoryName },
        condition: condition as any,
        estimatedValue: { gt: 0 },
      },
      select: { estimatedValue: true },
      take: 50,
    });

    if (items.length < 5) {
      // Return default based on category
      const categoryInfo = Object.values(CATEGORY_KEYWORDS).find(c => c.category === categoryName);
      return {
        min: (categoryInfo?.avgPrice || 1000) * 0.5,
        max: (categoryInfo?.avgPrice || 1000) * 1.5,
        avg: categoryInfo?.avgPrice || 1000,
        count: 0,
      };
    }

    const prices = items.map(i => i.estimatedValue!).sort((a, b) => a - b);
    return {
      min: prices[0],
      max: prices[prices.length - 1],
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      count: items.length,
    };
  }
}

export const aiListingService = new AIListingService();
