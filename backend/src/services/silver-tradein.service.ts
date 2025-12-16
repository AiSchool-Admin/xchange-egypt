/**
 * Silver Trade-In Service
 * خدمة استبدال الفضة القديمة بالجديدة
 *
 * Note: This is a placeholder implementation. The actual database tables
 * need to be created via migration before full functionality.
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

// In-memory storage for development (replace with DB when tables are created)
const tradeInsStore: Map<string, any> = new Map();

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
      select: {
        id: true,
        title: true,
        images: true,
        askingPrice: true,
        purity: true,
        weightGrams: true,
        status: true,
      },
    });

    if (targetItem && targetItem.status !== 'ACTIVE') {
      throw new Error('Target item not available');
    }

    if (targetItem) {
      priceDifference = targetItem.askingPrice - valuation.tradeInCredit;
    }
  }

  // Create trade-in request (in-memory)
  const tradeIn = {
    id: `trade-${Date.now()}`,
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
    targetItem: targetItem ? {
      id: targetItem.id,
      title: targetItem.title,
      images: targetItem.images,
      askingPrice: targetItem.askingPrice,
      purity: targetItem.purity,
      weightGrams: targetItem.weightGrams,
    } : null,

    // Delivery
    deliveryMethod: data.deliveryMethod,
    pickupAddress: data.address,
    preferredDate: data.preferredDate,

    createdAt: new Date(),
  };

  tradeInsStore.set(tradeIn.id, tradeIn);

  return tradeIn;
};

/**
 * Get user's trade-in requests
 */
export const getUserTradeIns = async (userId: string) => {
  const tradeIns: any[] = [];

  tradeInsStore.forEach((tradeIn) => {
    if (tradeIn.userId === userId) {
      tradeIns.push(tradeIn);
    }
  });

  // Sort by createdAt desc
  tradeIns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return tradeIns;
};

/**
 * Get trade-in by ID
 */
export const getTradeInById = async (id: string, userId?: string) => {
  const tradeIn = tradeInsStore.get(id);

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
  const tradeIn = tradeInsStore.get(tradeInId);

  if (!tradeIn) {
    throw new Error('Trade-in not found');
  }

  if (tradeIn.userId !== userId) {
    throw new Error('Unauthorized');
  }

  if (tradeIn.status !== 'OFFER_MADE') {
    throw new Error('No offer to accept');
  }

  tradeIn.status = 'OFFER_ACCEPTED';
  tradeIn.acceptedAt = new Date();
  tradeInsStore.set(tradeInId, tradeIn);

  // If target item exists, reserve it
  if (tradeIn.targetItemId) {
    await prisma.silverItem.update({
      where: { id: tradeIn.targetItemId },
      data: { status: 'RESERVED' },
    });
  }

  return tradeIn;
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
  const tradeIn = tradeInsStore.get(tradeInId);

  if (!tradeIn) {
    throw new Error('Trade-in not found');
  }

  // Calculate new price difference if target item exists
  let priceDiff = 0;
  if (tradeIn.targetItemId) {
    const targetItem = await prisma.silverItem.findUnique({
      where: { id: tradeIn.targetItemId },
    });
    if (targetItem) {
      priceDiff = targetItem.askingPrice - finalCredit;
    }
  }

  tradeIn.status = 'OFFER_MADE';
  tradeIn.finalCredit = finalCredit;
  tradeIn.assessmentNotes = notes;
  tradeIn.assessedBy = adminId;
  tradeIn.assessedAt = new Date();
  tradeIn.priceDifference = priceDiff > 0 ? priceDiff : 0;

  tradeInsStore.set(tradeInId, tradeIn);

  return tradeIn;
};

/**
 * Admin: Get pending trade-ins
 */
export const getPendingTradeIns = async (page = 1, limit = 20) => {
  const pendingStatuses = ['PENDING_REVIEW', 'ITEM_RECEIVED'];
  const tradeIns: any[] = [];

  tradeInsStore.forEach((tradeIn) => {
    if (pendingStatuses.includes(tradeIn.status)) {
      tradeIns.push(tradeIn);
    }
  });

  // Sort by createdAt asc (oldest first)
  tradeIns.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const total = tradeIns.length;
  const start = (page - 1) * limit;
  const paginatedTradeIns = tradeIns.slice(start, start + limit);

  return {
    tradeIns: paginatedTradeIns,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
