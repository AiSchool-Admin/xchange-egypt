/**
 * Admin Controller
 * Endpoints for administrative tasks
 */

import { Request, Response, NextFunction } from 'express';
import * as matchingService from '../services/barter-matching.service';
import { successResponse } from '../utils/response';
import prisma from '../lib/prisma';

// Mapping of English governorate names to Arabic
const GOVERNORATE_EN_TO_AR: Record<string, string> = {
  'Cairo': 'القاهرة',
  'cairo': 'القاهرة',
  'Giza': 'الجيزة',
  'giza': 'الجيزة',
  'Alexandria': 'الإسكندرية',
  'alexandria': 'الإسكندرية',
  'Dakahlia': 'الدقهلية',
  'dakahlia': 'الدقهلية',
  'Sharqia': 'الشرقية',
  'sharqia': 'الشرقية',
  'Qalyubia': 'القليوبية',
  'qalyubia': 'القليوبية',
  'Gharbia': 'الغربية',
  'gharbia': 'الغربية',
  'Menoufia': 'المنوفية',
  'menoufia': 'المنوفية',
  'Beheira': 'البحيرة',
  'beheira': 'البحيرة',
  'Kafr El Sheikh': 'كفر الشيخ',
  'kafr-el-sheikh': 'كفر الشيخ',
  'Damietta': 'دمياط',
  'damietta': 'دمياط',
  'Port Said': 'بورسعيد',
  'port-said': 'بورسعيد',
  'Ismailia': 'الإسماعيلية',
  'ismailia': 'الإسماعيلية',
  'Suez': 'السويس',
  'suez': 'السويس',
  'North Sinai': 'شمال سيناء',
  'north-sinai': 'شمال سيناء',
  'South Sinai': 'جنوب سيناء',
  'south-sinai': 'جنوب سيناء',
  'Red Sea': 'البحر الأحمر',
  'red-sea': 'البحر الأحمر',
  'Matrouh': 'مطروح',
  'matrouh': 'مطروح',
  'New Valley': 'الوادي الجديد',
  'new-valley': 'الوادي الجديد',
  'Fayoum': 'الفيوم',
  'fayoum': 'الفيوم',
  'Beni Suef': 'بني سويف',
  'beni-suef': 'بني سويف',
  'Minya': 'المنيا',
  'minya': 'المنيا',
  'Assiut': 'أسيوط',
  'assiut': 'أسيوط',
  'Sohag': 'سوهاج',
  'sohag': 'سوهاج',
  'Qena': 'قنا',
  'qena': 'قنا',
  'Luxor': 'الأقصر',
  'luxor': 'الأقصر',
  'Aswan': 'أسوان',
  'aswan': 'أسوان',
};

// Convert governorate to Arabic if it's in English
const toArabicGovernorate = (governorate: string): string => {
  return GOVERNORATE_EN_TO_AR[governorate] || GOVERNORATE_EN_TO_AR[governorate.toLowerCase()] || governorate;
};

/**
 * Populate governorate field for items based on seller's governorate
 * POST /api/v1/admin/populate-governorates
 */
export const populateGovernorates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('[Admin] Starting governorate population...');

    // Step 1: Update users with English governorate names to Arabic
    const usersWithEnglishGov = await prisma.user.findMany({
      where: {
        governorate: { not: null },
      },
      select: {
        id: true,
        governorate: true,
      },
    });

    let usersUpdated = 0;
    for (const user of usersWithEnglishGov) {
      if (user.governorate && GOVERNORATE_EN_TO_AR[user.governorate]) {
        await prisma.user.update({
          where: { id: user.id },
          data: { governorate: GOVERNORATE_EN_TO_AR[user.governorate] },
        });
        usersUpdated++;
      }
    }
    console.log(`[Admin] Updated ${usersUpdated} users with Arabic governorate names`);

    // Step 2: Update items with English governorate names to Arabic
    const itemsWithEnglishGov = await prisma.item.findMany({
      where: {
        governorate: { not: null },
      },
      select: {
        id: true,
        governorate: true,
      },
    });

    let itemsConvertedToArabic = 0;
    for (const item of itemsWithEnglishGov) {
      if (item.governorate && GOVERNORATE_EN_TO_AR[item.governorate]) {
        await prisma.item.update({
          where: { id: item.id },
          data: { governorate: GOVERNORATE_EN_TO_AR[item.governorate] },
        });
        itemsConvertedToArabic++;
      }
    }
    console.log(`[Admin] Converted ${itemsConvertedToArabic} items to Arabic governorate names`);

    // Step 3: Get items without governorate and populate from seller
    const itemsWithoutGovernorate = await prisma.item.findMany({
      where: {
        governorate: null,
      },
      include: {
        seller: {
          select: {
            id: true,
            governorate: true,
          },
        },
      },
    });

    console.log(`[Admin] Found ${itemsWithoutGovernorate.length} items without governorate`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const item of itemsWithoutGovernorate) {
      if (item.seller?.governorate) {
        const arabicGovernorate = toArabicGovernorate(item.seller.governorate);
        await prisma.item.update({
          where: { id: item.id },
          data: { governorate: arabicGovernorate },
        });
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`[Admin] Governorate population complete: ${updatedCount} updated, ${skippedCount} skipped`);

    return successResponse(res, {
      usersUpdated,
      itemsConvertedToArabic,
      itemsWithoutGovernorate: itemsWithoutGovernorate.length,
      itemsPopulated: updatedCount,
      itemsSkipped: skippedCount,
    }, 'Governorate population completed successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Seed test bids for a reverse auction
 * POST /api/v1/admin/seed-reverse-auction-bids
 */
export const seedReverseAuctionBids = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('[Admin] Seeding reverse auction bids...');

    // Find the active reverse auction
    const auction = await prisma.reverseAuction.findFirst({
      where: { status: 'ACTIVE' },
      include: { buyer: true }
    });

    if (!auction) {
      return successResponse(res, { error: 'No active reverse auction found' }, 'No auction to seed');
    }

    console.log(`[Admin] Found auction: ${auction.title} (buyer: ${auction.buyer.fullName})`);

    // Find sellers (users who are not the buyer)
    const sellers = await prisma.user.findMany({
      where: {
        id: { not: auction.buyerId }
      },
      take: 3
    });

    if (sellers.length === 0) {
      return successResponse(res, { error: 'No sellers available' }, 'No sellers to create bids');
    }

    // Create bids from different sellers
    const maxBudget = auction.maxBudget || 5000;
    const bidAmounts = [
      Math.round(maxBudget * 0.9),  // 90% of budget
      Math.round(maxBudget * 0.84), // 84% of budget
      Math.round(maxBudget * 0.76), // 76% of budget (lowest)
    ];
    const conditions: Array<'GOOD' | 'LIKE_NEW' | 'NEW'> = ['GOOD', 'LIKE_NEW', 'NEW'];
    const createdBids: any[] = [];

    for (let i = 0; i < Math.min(sellers.length, 3); i++) {
      const seller = sellers[i];
      const bidAmount = bidAmounts[i];

      // Check if this seller already has a bid
      const existingBid = await prisma.reverseAuctionBid.findFirst({
        where: {
          reverseAuctionId: auction.id,
          sellerId: seller.id
        }
      });

      if (existingBid) {
        console.log(`[Admin] Seller ${seller.fullName} already has a bid`);
        continue;
      }

      // Determine status based on bid amount (lowest is WINNING)
      const isLowest = i === Math.min(sellers.length, 3) - 1;

      const bid = await prisma.reverseAuctionBid.create({
        data: {
          reverseAuctionId: auction.id,
          sellerId: seller.id,
          bidAmount: bidAmount,
          itemCondition: conditions[i],
          itemDescription: `عرض من ${seller.fullName} - ${auction.title} بحالة ${conditions[i] === 'NEW' ? 'جديدة' : conditions[i] === 'LIKE_NEW' ? 'شبه جديدة' : 'جيدة'}`,
          deliveryOption: 'DELIVERY',
          deliveryDays: 3 + i,
          deliveryCost: 50 + (i * 25),
          status: isLowest ? 'WINNING' : 'OUTBID',
          notes: `عرض تنافسي - التسليم خلال ${3 + i} أيام`
        },
        include: {
          seller: {
            select: { id: true, fullName: true }
          }
        }
      });

      createdBids.push({
        id: bid.id,
        seller: bid.seller.fullName,
        amount: bidAmount,
        status: bid.status
      });

      console.log(`[Admin] Created bid from ${seller.fullName}: ${bidAmount} EGP (${bid.status})`);
    }

    // Update auction stats
    const activeBids = await prisma.reverseAuctionBid.findMany({
      where: {
        reverseAuctionId: auction.id,
        status: { notIn: ['WITHDRAWN'] }
      }
    });

    const lowestBid = Math.min(...activeBids.map(b => b.bidAmount));
    const uniqueSellers = new Set(activeBids.map(b => b.sellerId)).size;

    await prisma.reverseAuction.update({
      where: { id: auction.id },
      data: {
        totalBids: activeBids.length,
        uniqueBidders: uniqueSellers,
        lowestBid: lowestBid
      }
    });

    console.log(`[Admin] Auction updated: ${activeBids.length} bids, lowest: ${lowestBid} EGP`);

    return successResponse(res, {
      auction: {
        id: auction.id,
        title: auction.title,
        totalBids: activeBids.length,
        lowestBid
      },
      bidsCreated: createdBids
    }, 'Test bids created successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * Run retroactive matching for all existing items
 * POST /api/v1/admin/retroactive-matching
 */
export const runRetroactiveMatching = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('[Admin] Starting retroactive matching...');

    // Get all active items with barter preferences
    const items = await prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        desiredCategoryId: { not: null },
      },
      select: {
        id: true,
        sellerId: true,
        title: true,
      },
    });

    let notificationsSent = 0;
    const notifiedUsers = new Set<string>();

    // Process each item
    for (const item of items) {
      try {
        const matches = await matchingService.findMatchesForUser(
          item.sellerId,
          item.id,
          { includeCycles: true, maxResults: 10 }
        );

        const highQualityMatches = matches.cycles.filter(
          cycle => cycle.averageScore >= 0.60
        );

        // Send notifications for matches
        for (const cycle of highQualityMatches.slice(0, 3)) {
          for (const participant of cycle.participants) {
            if (notifiedUsers.has(participant.userId)) continue;

            // Check if already notified recently
            const existing = await prisma.notification.findFirst({
              where: {
                userId: participant.userId,
                type: 'BARTER_MATCH',
                entityId: item.id,
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
              },
            });

            if (!existing) {
              await prisma.notification.create({
                data: {
                  userId: participant.userId,
                  type: 'BARTER_MATCH',
                  title: '🎉 New Barter Match Found!',
                  message: `Your item matches with ${cycle.participants.length} other items (${(cycle.averageScore * 100).toFixed(0)}% match)`,
                  entityId: item.id,
                  entityType: 'Item',
                },
              });

              notificationsSent++;
              notifiedUsers.add(participant.userId);
            }
          }
        }
      } catch (error) {
        console.error(`[Admin] Error processing item ${item.id}:`, error);
      }
    }

    console.log(`[Admin] Retroactive matching complete: ${notificationsSent} notifications sent`);

    return successResponse(res, {
      itemsProcessed: items.length,
      notificationsSent,
      usersNotified: notifiedUsers.size,
    }, 'Retroactive matching completed successfully');

  } catch (error) {
    next(error);
  }
};
