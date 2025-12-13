import prisma from '../lib/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';

// ============================================
// Delivery Service
// خدمة التوصيل المدمجة
// ============================================

interface DeliveryOptions {
  pickupGovernorate: string;
  pickupCity: string;
  deliveryGovernorate: string;
  deliveryCity: string;
  packageWeight?: number;
  isCOD?: boolean;
}

interface DeliveryOption {
  provider: string;
  providerNameAr: string;
  speed: string;
  speedNameAr: string;
  estimatedDays: number;
  cost: number;
  insuranceCost?: number;
  features: string[];
}

interface CreateBookingParams {
  orderId?: string;
  transactionId?: string;
  senderId: string;
  receiverId: string;
  provider: string;
  pickupAddress: string;
  pickupCity: string;
  pickupGovernorate: string;
  pickupPhone: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryGovernorate: string;
  deliveryPhone: string;
  deliveryLat?: number;
  deliveryLng?: number;
  packageWeight?: number;
  packageDimensions?: { length: number; width: number; height: number };
  packageDescription?: string;
  isFragile?: boolean;
  deliverySpeed?: string;
  hasInsurance?: boolean;
  isCOD?: boolean;
  codAmount?: number;
  senderNotes?: string;
}

// Provider configurations
const DELIVERY_PROVIDERS: Record<string, { nameAr: string; baseRate: number; perKgRate: number; insuranceRate: number }> = {
  OPEX: { nameAr: 'OPEX', baseRate: 35, perKgRate: 5, insuranceRate: 0.02 },
  BOSTA: { nameAr: 'بوسطة', baseRate: 40, perKgRate: 4, insuranceRate: 0.025 },
  ARAMEX: { nameAr: 'أرامكس', baseRate: 60, perKgRate: 8, insuranceRate: 0.03 },
  SELF_DELIVERY: { nameAr: 'توصيل ذاتي', baseRate: 0, perKgRate: 0, insuranceRate: 0 },
};

// Zone-based pricing multipliers
const ZONE_MULTIPLIERS: Record<string, Record<string, number>> = {
  // Cairo zones
  القاهرة: { القاهرة: 1, الجيزة: 1.1, الإسكندرية: 1.5, other: 1.8 },
  الجيزة: { القاهرة: 1.1, الجيزة: 1, الإسكندرية: 1.5, other: 1.8 },
  الإسكندرية: { القاهرة: 1.5, الجيزة: 1.5, الإسكندرية: 1, other: 1.6 },
  default: { default: 2 },
};

/**
 * Calculate delivery options for a route
 */
export const getDeliveryOptions = async (options: DeliveryOptions): Promise<DeliveryOption[]> => {
  const { pickupGovernorate, deliveryGovernorate, packageWeight = 1, isCOD = false } = options;

  // Calculate zone multiplier
  const zoneConfig = ZONE_MULTIPLIERS[pickupGovernorate] || ZONE_MULTIPLIERS.default;
  const zoneMultiplier = zoneConfig[deliveryGovernorate] || zoneConfig.other || zoneConfig.default || 2;

  const deliveryOptions: DeliveryOption[] = [];

  // OPEX - Best for COD
  const opexConfig = DELIVERY_PROVIDERS.OPEX;
  const opexBaseCost = opexConfig.baseRate * zoneMultiplier + packageWeight * opexConfig.perKgRate;
  deliveryOptions.push({
    provider: 'OPEX',
    providerNameAr: opexConfig.nameAr,
    speed: 'TWO_TO_THREE_DAYS',
    speedNameAr: '2-3 أيام',
    estimatedDays: 3,
    cost: Math.round(opexBaseCost),
    insuranceCost: Math.round(opexBaseCost * opexConfig.insuranceRate * 100) / 100,
    features: ['تتبع الشحنة', 'الدفع عند الاستلام', 'خدمة عملاء 24/7'],
  });

  // Same day option for same city
  if (pickupGovernorate === deliveryGovernorate) {
    deliveryOptions.push({
      provider: 'OPEX',
      providerNameAr: 'OPEX - سريع',
      speed: 'SAME_DAY',
      speedNameAr: 'نفس اليوم',
      estimatedDays: 0,
      cost: Math.round(opexBaseCost * 2),
      insuranceCost: Math.round(opexBaseCost * 2 * opexConfig.insuranceRate * 100) / 100,
      features: ['توصيل خلال 4-6 ساعات', 'تتبع مباشر', 'الدفع عند الاستلام'],
    });
  }

  // Bosta
  const bostaConfig = DELIVERY_PROVIDERS.BOSTA;
  const bostaBaseCost = bostaConfig.baseRate * zoneMultiplier + packageWeight * bostaConfig.perKgRate;
  deliveryOptions.push({
    provider: 'BOSTA',
    providerNameAr: bostaConfig.nameAr,
    speed: 'NEXT_DAY',
    speedNameAr: 'اليوم التالي',
    estimatedDays: 1,
    cost: Math.round(bostaBaseCost * 1.3),
    insuranceCost: Math.round(bostaBaseCost * 1.3 * bostaConfig.insuranceRate * 100) / 100,
    features: ['توصيل سريع', 'تتبع الشحنة', 'الدفع عند الاستلام'],
  });

  deliveryOptions.push({
    provider: 'BOSTA',
    providerNameAr: bostaConfig.nameAr + ' - اقتصادي',
    speed: 'TWO_TO_THREE_DAYS',
    speedNameAr: '2-3 أيام',
    estimatedDays: 3,
    cost: Math.round(bostaBaseCost),
    insuranceCost: Math.round(bostaBaseCost * bostaConfig.insuranceRate * 100) / 100,
    features: ['سعر اقتصادي', 'تتبع الشحنة'],
  });

  // Aramex - Premium
  const aramexConfig = DELIVERY_PROVIDERS.ARAMEX;
  const aramexBaseCost = aramexConfig.baseRate * zoneMultiplier + packageWeight * aramexConfig.perKgRate;
  deliveryOptions.push({
    provider: 'ARAMEX',
    providerNameAr: aramexConfig.nameAr,
    speed: 'NEXT_DAY',
    speedNameAr: 'اليوم التالي',
    estimatedDays: 1,
    cost: Math.round(aramexBaseCost),
    insuranceCost: Math.round(aramexBaseCost * aramexConfig.insuranceRate * 100) / 100,
    features: ['شركة عالمية', 'تأمين شامل', 'خدمة متميزة'],
  });

  // Self delivery (free)
  deliveryOptions.push({
    provider: 'SELF_DELIVERY',
    providerNameAr: 'استلام شخصي',
    speed: 'PICKUP',
    speedNameAr: 'استلام من الموقع',
    estimatedDays: 0,
    cost: 0,
    features: ['بدون تكلفة', 'تحديد موعد الاستلام'],
  });

  return deliveryOptions.sort((a, b) => a.cost - b.cost);
};

/**
 * Create a delivery booking
 */
export const createBooking = async (params: CreateBookingParams): Promise<any> => {
  const providerConfig = DELIVERY_PROVIDERS[params.provider];
  if (!providerConfig && params.provider !== 'SELF_DELIVERY') {
    throw new BadRequestError('مزود التوصيل غير صحيح');
  }

  // Calculate costs
  const options = await getDeliveryOptions({
    pickupGovernorate: params.pickupGovernorate,
    pickupCity: params.pickupCity,
    deliveryGovernorate: params.deliveryGovernorate,
    deliveryCity: params.deliveryCity,
    packageWeight: params.packageWeight,
    isCOD: params.isCOD,
  });

  const selectedOption = options.find(
    (opt) => opt.provider === params.provider && opt.speed === params.deliverySpeed
  );

  if (!selectedOption && params.provider !== 'SELF_DELIVERY') {
    throw new BadRequestError('خيار التوصيل غير متاح');
  }

  const deliveryCost = selectedOption?.cost || 0;
  const insuranceCost = params.hasInsurance ? selectedOption?.insuranceCost || 0 : 0;
  const totalCost = deliveryCost + insuranceCost;

  // Calculate estimated delivery date
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (selectedOption?.estimatedDays || 3));

  const booking = await prisma.deliveryBooking.create({
    data: {
      orderId: params.orderId,
      transactionId: params.transactionId,
      senderId: params.senderId,
      receiverId: params.receiverId,
      provider: params.provider as any,
      pickupAddress: params.pickupAddress,
      pickupCity: params.pickupCity,
      pickupGovernorate: params.pickupGovernorate,
      pickupPhone: params.pickupPhone,
      pickupLat: params.pickupLat,
      pickupLng: params.pickupLng,
      deliveryAddress: params.deliveryAddress,
      deliveryCity: params.deliveryCity,
      deliveryGovernorate: params.deliveryGovernorate,
      deliveryPhone: params.deliveryPhone,
      deliveryLat: params.deliveryLat,
      deliveryLng: params.deliveryLng,
      packageWeight: params.packageWeight,
      packageDimensions: params.packageDimensions as any,
      packageDescription: params.packageDescription,
      isFragile: params.isFragile || false,
      deliveryCost,
      insuranceCost,
      totalCost,
      codAmount: params.codAmount,
      deliverySpeed: params.deliverySpeed as any,
      hasInsurance: params.hasInsurance || false,
      isCOD: params.isCOD || false,
      senderNotes: params.senderNotes,
      estimatedDelivery,
      status: 'PENDING',
    },
  });

  // Create initial tracking entry
  await prisma.deliveryTracking.create({
    data: {
      bookingId: booking.id,
      status: 'PENDING',
      description: 'تم إنشاء طلب التوصيل',
    },
  });

  return booking;
};

/**
 * Get booking by ID
 */
export const getBooking = async (bookingId: string, userId: string): Promise<any> => {
  const booking = await prisma.deliveryBooking.findUnique({
    where: { id: bookingId },
    include: {
      trackingHistory: {
        orderBy: { timestamp: 'desc' },
      },
    },
  });

  if (!booking) {
    throw new NotFoundError('طلب التوصيل غير موجود');
  }

  // Check access
  if (booking.senderId !== userId && booking.receiverId !== userId) {
    throw new NotFoundError('طلب التوصيل غير موجود');
  }

  return booking;
};

/**
 * Update booking status (for admin/provider webhook)
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: string,
  location?: string,
  description?: string,
  driverNotes?: string
): Promise<any> => {
  const booking = await prisma.deliveryBooking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new NotFoundError('طلب التوصيل غير موجود');
  }

  // Create tracking entry
  await prisma.deliveryTracking.create({
    data: {
      bookingId,
      status,
      location,
      description: description || getStatusDescription(status),
    },
  });

  // Update booking
  const updateData: any = { status };

  if (status === 'PICKED_UP') {
    updateData.pickedUpAt = new Date();
  } else if (status === 'DELIVERED') {
    updateData.deliveredAt = new Date();
  }

  if (driverNotes) {
    updateData.driverNotes = driverNotes;
  }

  return prisma.deliveryBooking.update({
    where: { id: bookingId },
    data: updateData,
  });
};

/**
 * Cancel booking
 */
export const cancelBooking = async (bookingId: string, userId: string): Promise<any> => {
  const booking = await prisma.deliveryBooking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new NotFoundError('طلب التوصيل غير موجود');
  }

  if (booking.senderId !== userId) {
    throw new BadRequestError('لا يمكنك إلغاء هذا الطلب');
  }

  // Can only cancel if not yet picked up
  if (['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(booking.status)) {
    throw new BadRequestError('لا يمكن إلغاء الطلب بعد استلامه');
  }

  await prisma.deliveryTracking.create({
    data: {
      bookingId,
      status: 'CANCELLED',
      description: 'تم إلغاء الطلب بواسطة المرسل',
    },
  });

  return prisma.deliveryBooking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  });
};

/**
 * Get user's delivery bookings
 */
export const getUserBookings = async (userId: string, type: 'sent' | 'received' = 'sent', page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  const where = type === 'sent' ? { senderId: userId } : { receiverId: userId };

  const [bookings, total] = await Promise.all([
    prisma.deliveryBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        trackingHistory: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.deliveryBooking.count({ where }),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Helper function
function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    PENDING: 'في انتظار التأكيد',
    CONFIRMED: 'تم تأكيد الطلب',
    PICKED_UP: 'تم استلام الشحنة من المرسل',
    IN_TRANSIT: 'الشحنة في الطريق',
    OUT_FOR_DELIVERY: 'خارج للتوصيل',
    DELIVERED: 'تم التوصيل بنجاح',
    FAILED: 'فشل التوصيل',
    CANCELLED: 'تم إلغاء الطلب',
    RETURNED: 'تم إرجاع الشحنة',
  };
  return descriptions[status] || status;
}

export default {
  getDeliveryOptions,
  createBooking,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getUserBookings,
};
