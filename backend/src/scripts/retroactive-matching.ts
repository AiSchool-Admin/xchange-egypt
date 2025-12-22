/**
 * One-Time Retroactive Matching Script
 *
 * Finds matches for ALL existing items with barter preferences
 * and sends notifications for high-quality matches.
 *
 * Run once after deploying the desiredCategory fix.
 *
 * Usage: npx tsx src/scripts/retroactive-matching.ts
 */

import { PrismaClient } from '@prisma/client';
import * as matchingService from '../services/barter-matching.service';
import { io } from '../app';

const prisma = new PrismaClient();

const MIN_MATCH_SCORE = 0.60; // 60% minimum
const MAX_NOTIFICATIONS_PER_USER = 5;

async function runRetroactiveMatching() {
  console.log('\n🔄 Starting Retroactive Matching...\n');

  try {
    // Get all active items with barter preferences
    const itemsWithPreferences = await prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        desiredCategoryId: { not: null },
      },
      select: {
        id: true,
        sellerId: true,
        title: true,
        desiredCategoryId: true,
      },
    });

    console.log(`📊 Found ${itemsWithPreferences.length} items with barter preferences\n`);

    let totalNotifications = 0;
    const notifiedUsers = new Set<string>();

    // Process each item
    for (let i = 0; i < itemsWithPreferences.length; i++) {
      const item = itemsWithPreferences[i];

      console.log(`[${i + 1}/${itemsWithPreferences.length}] Processing item: ${item.title.substring(0, 30)}...`);

      try {
        // Find matches for this item
        const matches = await matchingService.findMatchesForUser(
          item.sellerId,
          item.id,
          { includeCycles: true, maxResults: 10 }
        );

        // Filter for high-quality matches
        const highQualityMatches = matches.cycles.filter(
          cycle => cycle.averageScore >= MIN_MATCH_SCORE
        );

        if (highQualityMatches.length > 0) {
          console.log(`  ✅ Found ${highQualityMatches.length} matches`);

          // Limit notifications per user
          const userNotificationCount = Array.from(notifiedUsers).filter(
            u => u === item.sellerId
          ).length;

          if (userNotificationCount < MAX_NOTIFICATIONS_PER_USER) {
            // Send notifications to all participants
            for (const cycle of highQualityMatches.slice(0, 3)) {
              for (const participant of cycle.participants) {
                // Check if user already notified
                if (notifiedUsers.has(participant.userId)) continue;

                // Check if notification already exists
                const existing = await prisma.notification.findFirst({
                  where: {
                    userId: participant.userId,
                    type: 'BARTER_MATCH',
                    entityId: item.id,
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
                  },
                });

                if (!existing) {
                  // Create notification
                  await prisma.notification.create({
                    data: {
                      userId: participant.userId,
                      type: 'BARTER_MATCH',
                      title: '🎉 New Barter Match Found!',
                      message: `Your item matches with ${cycle.participants.length} other items (${(cycle.averageScore * 100).toFixed(0)}% match)`,
                      entityId: item.id,
                      entityType: 'Item',
                      metadata: {
                        cycleId: `cycle-${item.id}`,
                        matchScore: cycle.averageScore,
                        participantCount: cycle.participants.length,
                      },
                    } as any,
                  });

                  // Send WebSocket notification if user is connected
                  if (io) {
                    io.to(participant.userId).emit('new_match', {
                      type: 'barter_match',
                      cycleId: `cycle-${item.id}`,
                      matchScore: cycle.averageScore,
                      participants: cycle.participants.map(p => ({
                        userId: p.userId,
                        itemTitle: p.itemTitle,
                      })),
                    });
                  }

                  totalNotifications++;
                  notifiedUsers.add(participant.userId);
                  console.log(`    📬 Notified user ${participant.userId.substring(0, 8)}...`);
                }
              }
            }
          }
        } else {
          console.log(`  ⚪ No high-quality matches`);
        }

      } catch (error) {
        console.error(`  ❌ Error processing item ${item.id}:`, error instanceof Error ? error.message : error);
      }

      // Small delay to avoid overwhelming the system
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n✅ Retroactive Matching Complete!');
    console.log(`📊 Statistics:`);
    console.log(`  - Items processed: ${itemsWithPreferences.length}`);
    console.log(`  - Notifications sent: ${totalNotifications}`);
    console.log(`  - Users notified: ${notifiedUsers.size}`);

  } catch (error) {
    console.error('\n❌ Error running retroactive matching:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
runRetroactiveMatching()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
