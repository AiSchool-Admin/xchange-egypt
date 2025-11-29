/**
 * Admin Controller
 * Endpoints for administrative tasks
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as matchingService from '../services/barter-matching.service';
import { successResponse } from '../utils/response';

const prisma = new PrismaClient();

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
