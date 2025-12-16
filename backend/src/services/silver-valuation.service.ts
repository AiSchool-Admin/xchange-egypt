/**
 * Silver Valuation Service
 * خدمة التقييم الاحترافي للفضة
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

  // Create valuation request in SilverCertificate table
  const valuation = await prisma.silverCertificate.create({
    data: {
      itemId: data.itemId || null,
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
    },
  });

  return {
    ...valuation,
    levelDetails: level,
  };
};

/**
 * Get user's valuation requests
 */
export const getUserValuations = async (userId: string) => {
  const valuations = await prisma.silverCertificate.findMany({
    where: { requestedBy: userId },
    include: {
      item: {
        select: {
          id: true,
          title: true,
          images: true,
          purity: true,
          weightGrams: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return valuations.map(v => ({
    ...v,
    levelDetails: VALUATION_LEVELS[v.valuationType as keyof typeof VALUATION_LEVELS] || null,
  }));
};

/**
 * Get valuation by ID
 */
export const getValuationById = async (id: string, userId?: string) => {
  const valuation = await prisma.silverCertificate.findUnique({
    where: { id },
    include: {
      item: true,
    },
  });

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
  const valuation = await prisma.silverCertificate.update({
    where: { id: valuationId },
    data: {
      valuationStatus: 'COMPLETED',
      verifiedWeight: results.verifiedWeight,
      verifiedPurity: results.verifiedPurity,
      purityPercentage: results.purityPercentage,
      craftsmanshipScore: results.craftsmanshipScore,
      marketValue: results.marketValue,
      suggestedPrice: results.suggestedPrice,
      conditionGrade: results.condition,
      expertNotes: results.notes,
      valuationImages: results.images,
      isAuthentic: results.isAuthentic,
      completedAt: new Date(),
      expertId,
    },
  });

  // Update item verification level if linked
  if (valuation.itemId) {
    await prisma.silverItem.update({
      where: { id: valuation.itemId },
      data: {
        verificationLevel: results.isAuthentic ? 'CERTIFIED' : 'BASIC',
        certificateId: valuation.id,
      },
    });
  }

  return valuation;
};

/**
 * Get pending valuations (admin)
 */
export const getPendingValuations = async (page = 1, limit = 20) => {
  const [valuations, total] = await Promise.all([
    prisma.silverCertificate.findMany({
      where: { valuationStatus: 'PENDING' },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            images: true,
            purity: true,
            weightGrams: true,
          },
        },
      },
      orderBy: [
        { valuationType: 'desc' }, // Premium first
        { createdAt: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.silverCertificate.count({ where: { valuationStatus: 'PENDING' } }),
  ]);

  return {
    valuations: valuations.map(v => ({
      ...v,
      levelDetails: VALUATION_LEVELS[v.valuationType as keyof typeof VALUATION_LEVELS] || null,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
