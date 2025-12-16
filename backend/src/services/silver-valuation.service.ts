/**
 * Silver Valuation Service
 * خدمة التقييم الاحترافي للفضة
 *
 * Note: This is a placeholder implementation. The actual database tables
 * need to be created via migration before full functionality.
 */

import prisma from '../config/database';

// Valuation service levels with pricing
export const VALUATION_LEVELS = {
  BASIC: {
    id: 'BASIC',
    name: 'Basic Valuation',
    nameAr: 'تقييم أساسي',
    price: 50, // EGP
    description: 'Weight verification and visual inspection',
    descriptionAr: 'التحقق من الوزن والفحص البصري',
    features: ['weight_check', 'visual_inspection', 'photo_report'],
    turnaround: '24 hours',
    turnaroundAr: '24 ساعة',
  },
  STANDARD: {
    id: 'STANDARD',
    name: 'Standard Valuation',
    nameAr: 'تقييم قياسي',
    price: 150, // EGP
    description: 'Purity test with acid and detailed report',
    descriptionAr: 'اختبار النقاء بالحمض وتقرير مفصل',
    features: ['weight_check', 'visual_inspection', 'acid_test', 'detailed_report', 'photo_report'],
    turnaround: '48 hours',
    turnaroundAr: '48 ساعة',
  },
  ADVANCED: {
    id: 'ADVANCED',
    name: 'Advanced Valuation',
    nameAr: 'تقييم متقدم',
    price: 300, // EGP
    description: 'XRF analysis with craftsmanship evaluation',
    descriptionAr: 'تحليل XRF مع تقييم الصنعة',
    features: ['weight_check', 'visual_inspection', 'xrf_analysis', 'craftsmanship_eval', 'market_comparison', 'certificate'],
    turnaround: '72 hours',
    turnaroundAr: '72 ساعة',
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium Valuation',
    nameAr: 'تقييم ممتاز',
    price: 500, // EGP
    description: 'Complete analysis with 360° imaging and blockchain certificate',
    descriptionAr: 'تحليل شامل مع تصوير 360° وشهادة بلوكتشين',
    features: ['weight_check', 'visual_inspection', 'xrf_analysis', 'craftsmanship_eval', 'market_comparison', '360_imaging', 'blockchain_cert', 'priority_support'],
    turnaround: '24 hours',
    turnaroundAr: '24 ساعة (أولوية)',
  },
};

// In-memory storage for development (replace with DB when tables are created)
const valuationsStore: Map<string, any> = new Map();

export interface ValuationRequest {
  itemId?: string;
  level: keyof typeof VALUATION_LEVELS;
  appointmentDate?: Date;
  appointmentTime?: string;
  deliveryMethod: 'DROP_OFF' | 'HOME_PICKUP' | 'PARTNER_LOCATION';
  partnerId?: string;
  address?: string;
  notes?: string;
}

/**
 * Get valuation service levels
 */
export const getValuationLevels = () => {
  return Object.values(VALUATION_LEVELS);
};

/**
 * Request professional valuation
 */
export const requestValuation = async (userId: string, data: ValuationRequest) => {
  const level = VALUATION_LEVELS[data.level];
  if (!level) {
    throw new Error('Invalid valuation level');
  }

  // Get item details if itemId provided
  let item = null;
  if (data.itemId) {
    item = await prisma.silverItem.findUnique({
      where: { id: data.itemId },
      select: {
        id: true,
        title: true,
        images: true,
        purity: true,
        weightGrams: true,
      },
    });
  }

  // Create valuation request (in-memory)
  const valuation = {
    id: `val-${Date.now()}`,
    itemId: data.itemId || null,
    item,
    certificateNumber: `VAL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isAuthentic: false, // Will be updated after valuation
    valuationType: data.level,
    valuationFee: level.price,
    valuationStatus: 'PENDING',
    appointmentDate: data.appointmentDate,
    appointmentTime: data.appointmentTime,
    deliveryMethod: data.deliveryMethod,
    partnerId: data.partnerId,
    customerAddress: data.address,
    customerNotes: data.notes,
    requestedBy: userId,
    createdAt: new Date(),
    levelDetails: level,
  };

  valuationsStore.set(valuation.id, valuation);

  return valuation;
};

/**
 * Get user's valuation requests
 */
export const getUserValuations = async (userId: string) => {
  const valuations: any[] = [];

  valuationsStore.forEach((valuation) => {
    if (valuation.requestedBy === userId) {
      const levelDetails = VALUATION_LEVELS[valuation.valuationType as keyof typeof VALUATION_LEVELS] || null;
      valuations.push({
        ...valuation,
        levelDetails,
      });
    }
  });

  // Sort by createdAt desc
  valuations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return valuations;
};

/**
 * Get valuation by ID
 */
export const getValuationById = async (id: string, userId?: string) => {
  const valuation = valuationsStore.get(id);

  if (!valuation) return null;

  // If userId provided, check ownership
  if (userId && valuation.requestedBy !== userId) {
    throw new Error('Unauthorized');
  }

  return {
    ...valuation,
    levelDetails: VALUATION_LEVELS[valuation.valuationType as keyof typeof VALUATION_LEVELS] || null,
  };
};

/**
 * Complete valuation (admin/expert)
 */
export const completeValuation = async (
  valuationId: string,
  expertId: string,
  results: {
    verifiedWeight: number;
    verifiedPurity: string;
    purityPercentage: number;
    craftsmanshipScore?: number;
    marketValue: number;
    suggestedPrice: number;
    condition: string;
    notes: string;
    images?: string[];
    isAuthentic: boolean;
  }
) => {
  const valuation = valuationsStore.get(valuationId);

  if (!valuation) {
    throw new Error('Valuation not found');
  }

  // Update valuation
  valuation.valuationStatus = 'COMPLETED';
  valuation.verifiedWeight = results.verifiedWeight;
  valuation.verifiedPurity = results.verifiedPurity;
  valuation.purityPercentage = results.purityPercentage;
  valuation.craftsmanshipScore = results.craftsmanshipScore;
  valuation.marketValue = results.marketValue;
  valuation.suggestedPrice = results.suggestedPrice;
  valuation.conditionGrade = results.condition;
  valuation.expertNotes = results.notes;
  valuation.valuationImages = results.images;
  valuation.isAuthentic = results.isAuthentic;
  valuation.completedAt = new Date();
  valuation.expertId = expertId;

  valuationsStore.set(valuationId, valuation);

  // Update item verification level if linked
  if (valuation.itemId) {
    await prisma.silverItem.update({
      where: { id: valuation.itemId },
      data: {
        verificationLevel: results.isAuthentic ? 'CERTIFIED' : 'BASIC',
      },
    });
  }

  return valuation;
};

/**
 * Get pending valuations (admin)
 */
export const getPendingValuations = async (page = 1, limit = 20) => {
  const valuations: any[] = [];

  valuationsStore.forEach((valuation) => {
    if (valuation.valuationStatus === 'PENDING') {
      valuations.push({
        ...valuation,
        levelDetails: VALUATION_LEVELS[valuation.valuationType as keyof typeof VALUATION_LEVELS] || null,
      });
    }
  });

  // Sort by valuationType desc (Premium first), then createdAt asc
  const typeOrder: Record<string, number> = { PREMIUM: 4, ADVANCED: 3, STANDARD: 2, BASIC: 1 };
  valuations.sort((a, b) => {
    const typeCompare = (typeOrder[b.valuationType] || 0) - (typeOrder[a.valuationType] || 0);
    if (typeCompare !== 0) return typeCompare;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const total = valuations.length;
  const start = (page - 1) * limit;
  const paginatedValuations = valuations.slice(start, start + limit);

  return {
    valuations: paginatedValuations,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
