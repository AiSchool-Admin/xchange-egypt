import prisma from '../lib/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import crypto from 'crypto';

// ============================================
// Item Comparison Service
// خدمة مقارنة المنتجات
// ============================================

interface CreateComparisonParams {
  userId: string;
  itemIds: string[];
  title?: string;
  categorySlug?: string;
  isPublic?: boolean;
}

interface ComparisonResult {
  id: string;
  title: string | null;
  items: any[];
  comparisonFields: ComparisonField[];
  shareCode: string | null;
  createdAt: Date;
}

interface ComparisonField {
  field: string;
  labelAr: string;
  labelEn: string;
  values: (string | number | boolean | null)[];
}

/**
 * Create a new comparison
 */
export const createComparison = async (params: CreateComparisonParams): Promise<any> => {
  const { userId, itemIds, title, categorySlug, isPublic } = params;

  // Validate item count (2-5 items)
  if (itemIds.length < 2 || itemIds.length > 5) {
    throw new BadRequestError('يجب اختيار 2-5 منتجات للمقارنة');
  }

  // Verify all items exist
  const items = await prisma.item.findMany({
    where: { id: { in: itemIds } },
    select: { id: true },
  });

  if (items.length !== itemIds.length) {
    throw new BadRequestError('بعض المنتجات غير موجودة');
  }

  // Generate share code if public
  const shareCode = isPublic ? generateShareCode() : null;

  const comparison = await prisma.itemComparison.create({
    data: {
      userId,
      itemIds,
      title,
      categorySlug,
      isPublic: isPublic || false,
      shareCode,
    },
  });

  return comparison;
};

/**
 * Get comparison with full item details
 */
export const getComparison = async (comparisonId: string, userId?: string): Promise<ComparisonResult> => {
  const comparison = await prisma.itemComparison.findUnique({
    where: { id: comparisonId },
  });

  if (!comparison) {
    throw new NotFoundError('المقارنة غير موجودة');
  }

  // Check access rights
  if (!comparison.isPublic && comparison.userId !== userId) {
    throw new NotFoundError('المقارنة غير موجودة');
  }

  // Get full item details
  const items = await prisma.item.findMany({
    where: { id: { in: comparison.itemIds } },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
    },
  });

  // Determine category for comparison fields
  const categorySlug = comparison.categorySlug || items[0]?.category?.slug;

  // Generate comparison fields based on category
  const comparisonFields = generateComparisonFields(items, categorySlug);

  return {
    id: comparison.id,
    title: comparison.title,
    items,
    comparisonFields,
    shareCode: comparison.shareCode,
    createdAt: comparison.createdAt,
  };
};

/**
 * Get comparison by share code
 */
export const getComparisonByShareCode = async (shareCode: string): Promise<ComparisonResult> => {
  const comparison = await prisma.itemComparison.findUnique({
    where: { shareCode },
  });

  if (!comparison || !comparison.isPublic) {
    throw new NotFoundError('المقارنة غير موجودة');
  }

  return getComparison(comparison.id);
};

/**
 * Get user's comparisons
 */
export const getUserComparisons = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [comparisons, total] = await Promise.all([
    prisma.itemComparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.itemComparison.count({ where: { userId } }),
  ]);

  // Get item previews for each comparison
  const comparisonsWithPreviews = await Promise.all(
    comparisons.map(async (comparison) => {
      const items = await prisma.item.findMany({
        where: { id: { in: comparison.itemIds } },
        select: {
          id: true,
          title: true,
          images: true,
          estimatedValue: true,
        },
      });

      return {
        ...comparison,
        itemPreviews: items,
      };
    })
  );

  return {
    comparisons: comparisonsWithPreviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete comparison
 */
export const deleteComparison = async (comparisonId: string, userId: string): Promise<void> => {
  const comparison = await prisma.itemComparison.findUnique({
    where: { id: comparisonId },
  });

  if (!comparison) {
    throw new NotFoundError('المقارنة غير موجودة');
  }

  if (comparison.userId !== userId) {
    throw new BadRequestError('لا يمكنك حذف هذه المقارنة');
  }

  await prisma.itemComparison.delete({
    where: { id: comparisonId },
  });
};

/**
 * Update comparison
 */
export const updateComparison = async (
  comparisonId: string,
  userId: string,
  data: { title?: string; itemIds?: string[]; isPublic?: boolean }
): Promise<any> => {
  const comparison = await prisma.itemComparison.findUnique({
    where: { id: comparisonId },
  });

  if (!comparison) {
    throw new NotFoundError('المقارنة غير موجودة');
  }

  if (comparison.userId !== userId) {
    throw new BadRequestError('لا يمكنك تعديل هذه المقارنة');
  }

  // Validate new items if provided
  if (data.itemIds) {
    if (data.itemIds.length < 2 || data.itemIds.length > 5) {
      throw new BadRequestError('يجب اختيار 2-5 منتجات للمقارنة');
    }
  }

  // Generate share code if making public
  let shareCode = comparison.shareCode;
  if (data.isPublic && !comparison.isPublic && !shareCode) {
    shareCode = generateShareCode();
  }

  return prisma.itemComparison.update({
    where: { id: comparisonId },
    data: {
      ...data,
      shareCode,
    },
  });
};

// ============================================
// Helper Functions
// ============================================

function generateShareCode(): string {
  return crypto.randomUUID().substring(0, 8).toUpperCase();
}

function generateComparisonFields(items: any[], categorySlug?: string): ComparisonField[] {
  const fields: ComparisonField[] = [];

  // Common fields for all categories
  fields.push({
    field: 'estimatedValue',
    labelAr: 'السعر',
    labelEn: 'Price',
    values: items.map((item) => item.estimatedValue),
  });

  fields.push({
    field: 'condition',
    labelAr: 'الحالة',
    labelEn: 'Condition',
    values: items.map((item) => translateCondition(item.condition)),
  });

  fields.push({
    field: 'governorate',
    labelAr: 'المحافظة',
    labelEn: 'Governorate',
    values: items.map((item) => item.governorate),
  });

  // Vehicle-specific fields
  if (categorySlug?.includes('vehicles') || categorySlug?.includes('cars')) {
    fields.push(
      {
        field: 'vehicleBrand',
        labelAr: 'الماركة',
        labelEn: 'Brand',
        values: items.map((item) => item.vehicleBrand),
      },
      {
        field: 'vehicleModel',
        labelAr: 'الموديل',
        labelEn: 'Model',
        values: items.map((item) => item.vehicleModel),
      },
      {
        field: 'vehicleYear',
        labelAr: 'سنة الصنع',
        labelEn: 'Year',
        values: items.map((item) => item.vehicleYear),
      },
      {
        field: 'vehicleKilometers',
        labelAr: 'الكيلومترات',
        labelEn: 'Kilometers',
        values: items.map((item) => item.vehicleKilometers),
      },
      {
        field: 'fuelType',
        labelAr: 'نوع الوقود',
        labelEn: 'Fuel Type',
        values: items.map((item) => translateFuelType(item.fuelType)),
      },
      {
        field: 'transmissionType',
        labelAr: 'ناقل الحركة',
        labelEn: 'Transmission',
        values: items.map((item) => translateTransmission(item.transmissionType)),
      },
      {
        field: 'bodyType',
        labelAr: 'نوع الهيكل',
        labelEn: 'Body Type',
        values: items.map((item) => translateBodyType(item.bodyType)),
      },
      {
        field: 'vehicleColor',
        labelAr: 'اللون',
        labelEn: 'Color',
        values: items.map((item) => item.vehicleColor),
      },
      {
        field: 'hasWarranty',
        labelAr: 'ضمان',
        labelEn: 'Warranty',
        values: items.map((item) => (item.hasWarranty ? 'نعم' : 'لا')),
      }
    );
  }

  // Real Estate-specific fields
  if (categorySlug?.includes('real-estate') || categorySlug?.includes('apartments')) {
    fields.push(
      {
        field: 'propertyType',
        labelAr: 'نوع العقار',
        labelEn: 'Property Type',
        values: items.map((item) => translatePropertyType(item.propertyType)),
      },
      {
        field: 'areaInSqm',
        labelAr: 'المساحة (م²)',
        labelEn: 'Area (sqm)',
        values: items.map((item) => item.areaInSqm),
      },
      {
        field: 'bedrooms',
        labelAr: 'غرف النوم',
        labelEn: 'Bedrooms',
        values: items.map((item) => item.bedrooms),
      },
      {
        field: 'bathrooms',
        labelAr: 'الحمامات',
        labelEn: 'Bathrooms',
        values: items.map((item) => item.bathrooms),
      },
      {
        field: 'floorNumber',
        labelAr: 'الطابق',
        labelEn: 'Floor',
        values: items.map((item) => item.floorNumber),
      },
      {
        field: 'propertyFinishing',
        labelAr: 'التشطيب',
        labelEn: 'Finishing',
        values: items.map((item) => translateFinishing(item.propertyFinishing)),
      },
      {
        field: 'hasElevator',
        labelAr: 'مصعد',
        labelEn: 'Elevator',
        values: items.map((item) => (item.hasElevator ? 'نعم' : 'لا')),
      },
      {
        field: 'hasParking',
        labelAr: 'جراج',
        labelEn: 'Parking',
        values: items.map((item) => (item.hasParking ? 'نعم' : 'لا')),
      },
      {
        field: 'hasGarden',
        labelAr: 'حديقة',
        labelEn: 'Garden',
        values: items.map((item) => (item.hasGarden ? 'نعم' : 'لا')),
      }
    );
  }

  // Delivery & Installment
  fields.push(
    {
      field: 'deliveryAvailable',
      labelAr: 'توصيل',
      labelEn: 'Delivery',
      values: items.map((item) => (item.deliveryAvailable ? 'متاح' : 'غير متاح')),
    },
    {
      field: 'installmentAvailable',
      labelAr: 'تقسيط',
      labelEn: 'Installment',
      values: items.map((item) => (item.installmentAvailable ? 'متاح' : 'غير متاح')),
    }
  );

  return fields;
}

// Translation helpers
function translateCondition(condition: string): string {
  const map: Record<string, string> = {
    NEW: 'جديد',
    LIKE_NEW: 'شبه جديد',
    GOOD: 'جيد',
    FAIR: 'مقبول',
    POOR: 'مستعمل',
  };
  return map[condition] || condition;
}

function translateFuelType(type: string): string {
  const map: Record<string, string> = {
    PETROL: 'بنزين',
    DIESEL: 'ديزل',
    ELECTRIC: 'كهرباء',
    HYBRID: 'هايبرد',
    NATURAL_GAS: 'غاز طبيعي',
    LPG: 'غاز بترولي',
  };
  return map[type] || type;
}

function translateTransmission(type: string): string {
  const map: Record<string, string> = {
    AUTOMATIC: 'أوتوماتيك',
    MANUAL: 'مانيوال',
    CVT: 'CVT',
    SEMI_AUTOMATIC: 'نصف أوتوماتيك',
  };
  return map[type] || type;
}

function translateBodyType(type: string): string {
  const map: Record<string, string> = {
    SEDAN: 'سيدان',
    HATCHBACK: 'هاتشباك',
    SUV: 'SUV',
    CROSSOVER: 'كروس أوفر',
    COUPE: 'كوبيه',
    CONVERTIBLE: 'كشف',
    PICKUP: 'بيك أب',
    VAN: 'فان',
    MINIVAN: 'ميني فان',
    WAGON: 'ستيشن واجن',
    TRUCK: 'شاحنة',
    BUS: 'أتوبيس',
    MOTORCYCLE: 'موتوسيكل',
  };
  return map[type] || type;
}

function translatePropertyType(type: string): string {
  const map: Record<string, string> = {
    APARTMENT: 'شقة',
    VILLA: 'فيلا',
    DUPLEX: 'دوبلكس',
    PENTHOUSE: 'بنتهاوس',
    STUDIO: 'ستوديو',
    CHALET: 'شاليه',
    TOWNHOUSE: 'تاون هاوس',
    LAND: 'أرض',
    COMMERCIAL_SHOP: 'محل تجاري',
    OFFICE: 'مكتب',
    WAREHOUSE: 'مخزن',
    BUILDING: 'مبنى',
    FARM: 'مزرعة',
  };
  return map[type] || type;
}

function translateFinishing(type: string): string {
  const map: Record<string, string> = {
    NOT_FINISHED: 'بدون تشطيب',
    SEMI_FINISHED: 'نصف تشطيب',
    FULLY_FINISHED: 'تشطيب كامل',
    SUPER_LUX: 'سوبر لوكس',
    ULTRA_SUPER_LUX: 'الترا سوبر لوكس',
    FURNISHED: 'مفروش',
  };
  return map[type] || type;
}

export default {
  createComparison,
  getComparison,
  getComparisonByShareCode,
  getUserComparisons,
  deleteComparison,
  updateComparison,
};
