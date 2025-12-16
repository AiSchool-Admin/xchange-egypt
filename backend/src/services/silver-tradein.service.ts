/**
 * Silver Trade-In Service
 * خدمة استبدال الفضة القديمة بالجديدة
 */

import prisma from '../config/database';
import { getPriceByPurity } from './silver.service';

// Trade-in credit rates (percentage of market value)
const TRADE_IN_RATES = {
  EXCELLENT: 0.90, // 90% of market value
  GOOD: 0.85,      // 85%
  FAIR: 0.80,      // 80%
  POOR: 0.75,      // 75%
};

export interface TradeInRequest {
  // Old item details
  oldItemDescription: string;
  oldItemCategory: string;
  oldItemPurity: string;
  oldItemWeightGrams: number;
  oldItemCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  oldItemImages: string[];

  // Target item (optional - can be determined later)
  targetItemId?: string;

  // Delivery method for old item
  deliveryMethod: 'MAIL' | 'OFFICE_DROP' | 'HOME_PICKUP';
  address?: string;
  preferredDate?: Date;
}

/**
 * Calculate trade-in value
 */
export const calculateTradeInValue = async (
  purity: string,
  weightGrams: number,
  condition: keyof typeof TRADE_IN_RATES
) => {
  const currentPrice = await getPriceByPurity(purity as any);
  const marketPricePerGram = currentPrice?.buyPrice || 55; // Default to S925 price

  const marketValue = weightGrams * marketPricePerGram;
  const creditRate = TRADE_IN_RATES[condition];
  const tradeInCredit = marketValue * creditRate;

  return {
    marketPricePerGram,
    marketValue: Math.round(marketValue),
    creditRate: creditRate * 100,
    tradeInCredit: Math.round(tradeInCredit),
    processingFee: 0, // Free processing
  };
};

/**
 * Request trade-in
 */
export const requestTradeIn = async (userId: string, data: TradeInRequest) => {
  // Calculate estimated credit
  const valuation = await calculateTradeInValue(
    data.oldItemPurity,
    data.oldItemWeightGrams,
    data.oldItemCondition
  );

  // Get target item if specified
  let targetItem = null;
  let priceDifference = 0;

  if (data.targetItemId) {
    targetItem = await prisma.silverItem.findUnique({
      where: { id: data.targetItemId },
    });

    if (targetItem && targetItem.status !== 'ACTIVE') {
      throw new Error('Target item not available');
    }

    if (targetItem) {
      priceDifference = targetItem.askingPrice - valuation.tradeInCredit;
    }
  }

  // Create trade-in request
  const tradeIn = await prisma.silverTradeIn.create({
    data: {
      userId,
      status: 'PENDING_REVIEW',

      // Old item
      oldItemDescription: data.oldItemDescription,
      oldItemCategory: data.oldItemCategory,
      oldItemPurity: data.oldItemPurity,
      oldItemWeightGrams: data.oldItemWeightGrams,
      oldItemCondition: data.oldItemCondition,
      oldItemImages: data.oldItemImages,

      // Estimated valuation
      estimatedMarketValue: valuation.marketValue,
      estimatedCreditRate: valuation.creditRate,
      estimatedCredit: valuation.tradeInCredit,

      // Target item
      targetItemId: data.targetItemId,
      priceDifference: priceDifference > 0 ? priceDifference : 0,

      // Delivery
      deliveryMethod: data.deliveryMethod,
      pickupAddress: data.address,
      preferredDate: data.preferredDate,
    },
    include: {
      targetItem: {
        select: {
          id: true,
          title: true,
          images: true,
          askingPrice: true,
          purity: true,
          weightGrams: true,
        },
      },
    },
  });

  return tradeIn;
};

/**
 * Get user's trade-in requests
 */
export const getUserTradeIns = async (userId: string) => {
  const tradeIns = await prisma.silverTradeIn.findMany({
    where: { userId },
    include: {
      targetItem: {
        select: {
          id: true,
          title: true,
          images: true,
          askingPrice: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return tradeIns;
};

/**
 * Get trade-in by ID
 */
export const getTradeInById = async (id: string, userId?: string) => {
  const tradeIn = await prisma.silverTradeIn.findUnique({
    where: { id },
    include: {
      targetItem: true,
    },
  });

  if (!tradeIn) return null;

  if (userId && tradeIn.userId !== userId) {
    throw new Error('Unauthorized');
  }

  return tradeIn;
};

/**
 * Accept trade-in offer
 */
export const acceptTradeInOffer = async (tradeInId: string, userId: string) => {
  const tradeIn = await prisma.silverTradeIn.findUnique({
    where: { id: tradeInId },
  });

  if (!tradeIn) {
    throw new Error('Trade-in not found');
  }

  if (tradeIn.userId !== userId) {
    throw new Error('Unauthorized');
  }

  if (tradeIn.status !== 'OFFER_MADE') {
    throw new Error('No offer to accept');
  }

  const updated = await prisma.silverTradeIn.update({
    where: { id: tradeInId },
    data: {
      status: 'OFFER_ACCEPTED',
      acceptedAt: new Date(),
    },
  });

  // If target item exists, reserve it
  if (tradeIn.targetItemId) {
    await prisma.silverItem.update({
      where: { id: tradeIn.targetItemId },
      data: { status: 'RESERVED' },
    });
  }

  return updated;
};

/**
 * Admin: Make trade-in offer after assessment
 */
export const makeTradeInOffer = async (
  tradeInId: string,
  adminId: string,
  finalCredit: number,
  notes: string
) => {
  const tradeIn = await prisma.silverTradeIn.update({
    where: { id: tradeInId },
    data: {
      status: 'OFFER_MADE',
      finalCredit,
      assessmentNotes: notes,
      assessedBy: adminId,
      assessedAt: new Date(),
      priceDifference: tradeIn.targetItemId
        ? (await prisma.silverItem.findUnique({ where: { id: tradeIn.targetItemId } }))?.askingPrice! - finalCredit
        : 0,
    },
    include: {
      targetItem: true,
    },
  });

  return tradeIn;
};

/**
 * Admin: Get pending trade-ins
 */
export const getPendingTradeIns = async (page = 1, limit = 20) => {
  const [tradeIns, total] = await Promise.all([
    prisma.silverTradeIn.findMany({
      where: { status: { in: ['PENDING_REVIEW', 'ITEM_RECEIVED'] } },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.silverTradeIn.count({
      where: { status: { in: ['PENDING_REVIEW', 'ITEM_RECEIVED'] } },
    }),
  ]);

  return {
    tradeIns,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
