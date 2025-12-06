/**
 * Barter Matcher Background Job
 * وظيفة المطابقة الخلفية
 *
 * Runs every 15 minutes to find and notify matches for:
 * - Pending barter offers
 * - Active items with barter preferences
 * - Purchase requests (demands)
 */

import cron from 'node-cron';
import prisma from '../lib/prisma';
import { processNewItem } from '../services/unified-matching.service';

// Track recently processed items to avoid duplicates
const recentlyProcessed = new Set<string>();
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

// Clean cooldown set every hour
setInterval(() => {
  recentlyProcessed.clear();
  console.log('[BarterMatcherJob] Cleared cooldown cache');
}, 60 * 60 * 1000);

/**
 * Run proactive matching for all eligible items
 */
export const runProactiveMatching = async (): Promise<number> => {
  let notificationCount = 0;

  try {
    console.log('[BarterMatcherJob] Starting proactive matching...');

    // 1. Find items with barter preferences that haven't been matched recently
    const barterItems = await prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { desiredCategoryId: { not: null } },
          { desiredItemTitle: { not: null } },
          { listingType: 'BARTER' },
        ],
      },
      select: { id: true, sellerId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100, // Process up to 100 items per run
    });

    console.log(`[BarterMatcherJob] Found ${barterItems.length} barter items to check`);

    for (const item of barterItems) {
      // Skip if processed recently
      if (recentlyProcessed.has(item.id)) continue;

      // Skip items created in the last 5 minutes (they were already processed on creation)
      const itemAge = Date.now() - item.createdAt.getTime();
      if (itemAge < 5 * 60 * 1000) continue;

      recentlyProcessed.add(item.id);

      try {
        const matches = await processNewItem(item.id, item.sellerId);
        notificationCount += matches.length;
      } catch (error) {
        console.error(`[BarterMatcherJob] Error processing item ${item.id}:`, error);
      }
    }

    // 2. Find demand items (DIRECT_BUY, REVERSE_AUCTION)
    const demandItems = await prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        listingType: { in: ['DIRECT_BUY', 'REVERSE_AUCTION'] },
      },
      select: { id: true, sellerId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    console.log(`[BarterMatcherJob] Found ${demandItems.length} demand items to check`);

    for (const item of demandItems) {
      if (recentlyProcessed.has(item.id)) continue;

      const itemAge = Date.now() - item.createdAt.getTime();
      if (itemAge < 5 * 60 * 1000) continue;

      recentlyProcessed.add(item.id);

      try {
        const matches = await processNewItem(item.id, item.sellerId);
        notificationCount += matches.length;
      } catch (error) {
        console.error(`[BarterMatcherJob] Error processing demand ${item.id}:`, error);
      }
    }

    // 3. Process pending barter offers (legacy support)
    // Note: offeredItemIds is a String[] array, not a relation
    const pendingOffers = await prisma.barterOffer.findMany({
      where: {
        status: 'PENDING',
        isOpenOffer: true,
        expiresAt: { gt: new Date() },
        offeredItemIds: { isEmpty: false },
      },
      select: {
        id: true,
        initiatorId: true,
        offeredItemIds: true,
      },
      take: 30,
    });

    console.log(`[BarterMatcherJob] Found ${pendingOffers.length} pending barter offers to check`);

    for (const offer of pendingOffers) {
      for (const offeredItemId of offer.offeredItemIds) {
        if (recentlyProcessed.has(offeredItemId)) continue;
        recentlyProcessed.add(offeredItemId);

        try {
          const matches = await processNewItem(offeredItemId, offer.initiatorId);
          notificationCount += matches.length;
        } catch (error) {
          console.error(`[BarterMatcherJob] Error processing offer item ${offeredItemId}:`, error);
        }
      }
    }

    console.log(`[BarterMatcherJob] Completed. Total notifications: ${notificationCount}`);

  } catch (error) {
    console.error('[BarterMatcherJob] Error in proactive matching:', error);
  }

  return notificationCount;
};

/**
 * Start the scheduled job
 */
export const startBarterMatcherJob = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('[BarterMatcherJob] Running scheduled matching...');
      const count = await runProactiveMatching();
      console.log(`[BarterMatcherJob] Created ${count} match notifications`);
    } catch (error) {
      console.error('[BarterMatcherJob] Scheduled job error:', error);
    }
  });

  console.log('[BarterMatcherJob] Scheduled job started (every 15 minutes)');
};

/**
 * Run matching manually (for testing/admin)
 */
export const runMatchingNow = async () => {
  try {
    console.log('[BarterMatcherJob] Running manual matching...');
    const count = await runProactiveMatching();
    console.log(`[BarterMatcherJob] Created ${count} notifications`);
    return count;
  } catch (error) {
    console.error('[BarterMatcherJob] Manual run error:', error);
    throw error;
  }
};

export default {
  startBarterMatcherJob,
  runMatchingNow,
  runProactiveMatching,
};
