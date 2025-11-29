/**
 * Real-Time Barter Matching Service
 *
 * Event-driven incremental matching that triggers when items are created/updated
 * instead of running on a cron schedule. Provides instant match notifications
 * to users via WebSocket.
 */

import { PrismaClient } from '@prisma/client';
import { itemEvents, ItemCreatedPayload, ItemUpdatedPayload } from '../events/item.events';
import * as matchingService from './barter-matching.service';
import { Server as SocketIOServer } from 'socket.io';

const prisma = new PrismaClient();

// ============================================
// Types
// ============================================

interface MatchNotification {
  type: 'new_match' | 'updated_match';
  opportunityId: string;
  participantCount: number;
  averageMatchScore: number;
  participants: string[];
  userItems: {
    itemId: string;
    itemTitle: string;
  }[];
  timestamp: Date;
}

interface GraphCache {
  lastBuild: Date;
  expiresAt: Date;
  itemCount: number;
}

// ============================================
// Configuration
// ============================================

const MIN_MATCH_SCORE_FOR_NOTIFICATION = 0.60; // Only notify for 60%+ matches
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache
const MAX_NOTIFICATIONS_PER_EVENT = 5; // Max notifications per item event

// ============================================
// State Management
// ============================================

let io: SocketIOServer | null = null;
let graphCache: GraphCache | null = null;
let isProcessing = false;

// ============================================
// WebSocket Initialization
// ============================================

/**
 * Initialize WebSocket server for real-time notifications
 */
export const initializeWebSocket = (socketServer: SocketIOServer): void => {
  io = socketServer;

  // Handle client connections
  io.on('connection', (socket) => {
    console.log(`[RealTimeMatching] Client connected: ${socket.id}`);

    // Authenticate user from handshake
    const userId = socket.handshake.auth?.userId;

    if (userId) {
      // Join user-specific room for targeted notifications
      socket.join(`user:${userId}`);
      console.log(`[RealTimeMatching] User ${userId} joined their notification room`);
    }

    socket.on('disconnect', () => {
      console.log(`[RealTimeMatching] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[RealTimeMatching] WebSocket server initialized');
};

/**
 * Emit match notification to specific user
 */
const notifyUser = (userId: string, notification: MatchNotification): void => {
  if (!io) {
    console.warn('[RealTimeMatching] WebSocket not initialized, cannot send notification');
    return;
  }

  // Send to user's specific room
  io.to(`user:${userId}`).emit('match:found', notification);
  console.log(`[RealTimeMatching] Sent notification to user ${userId}:`, notification.opportunityId);
};

/**
 * Broadcast to all connected clients (admin/monitoring)
 */
const broadcastMatchActivity = (activity: { type: string; count: number }): void => {
  if (!io) return;

  io.emit('match:activity', activity);
};

// ============================================
// Incremental Matching Logic
// ============================================

/**
 * Process newly created item and find matches
 */
const handleItemCreated = async (payload: ItemCreatedPayload): Promise<void> => {
  if (isProcessing) {
    console.log('[RealTimeMatching] Already processing, skipping...');
    return;
  }

  isProcessing = true;

  try {
    console.log(`[RealTimeMatching] Processing new item: ${payload.itemId} by user ${payload.userId}`);

    // Only process if item has barter preferences
    if (!payload.hasBarterPreferences) {
      console.log('[RealTimeMatching] Item has no barter preferences, skipping');
      return;
    }

    // Find matches for this specific item
    const matches = await matchingService.findMatchesForUser(
      payload.userId,
      payload.itemId,
      {
        includeCycles: true,
        includeChains: true,
        maxResults: 10,
      }
    );

    console.log(`[RealTimeMatching] Found ${matches.totalMatches} potential matches`);

    // Log all match scores for debugging
    if (matches.cycles.length > 0) {
      console.log(`[RealTimeMatching] Match scores:`);
      matches.cycles.forEach((cycle, index) => {
        console.log(`  Match ${index + 1}: ${(cycle.averageScore * 100).toFixed(1)}% (threshold: 60%)`);
      });
    }

    // Filter for high-quality matches
    const highQualityMatches = matches.cycles.filter(
      cycle => cycle.averageScore >= MIN_MATCH_SCORE_FOR_NOTIFICATION
    );

    console.log(`[RealTimeMatching] High-quality matches (≥60%): ${highQualityMatches.length}/${matches.cycles.length}`);

    // Notify all participants in top matches
    const notificationsSent = await notifyParticipants(
      highQualityMatches.slice(0, MAX_NOTIFICATIONS_PER_EVENT),
      payload.itemId,
      'new_match'
    );

    console.log(`[RealTimeMatching] Sent ${notificationsSent} notifications`);

    // Broadcast activity
    broadcastMatchActivity({
      type: 'item_created',
      count: notificationsSent,
    });

    // Invalidate cache
    invalidateCache();

  } catch (error) {
    console.error('[RealTimeMatching] Error processing item created:', error);
  } finally {
    isProcessing = false;
  }
};

/**
 * Process updated item and find new/updated matches
 */
const handleItemUpdated = async (payload: ItemUpdatedPayload): Promise<void> => {
  if (isProcessing) {
    console.log('[RealTimeMatching] Already processing, skipping...');
    return;
  }

  // Only process if meaningful changes occurred
  const hasRelevantChanges =
    payload.changes.category ||
    payload.changes.barterPreferences ||
    payload.changes.description;

  if (!hasRelevantChanges) {
    console.log('[RealTimeMatching] No relevant changes, skipping');
    return;
  }

  isProcessing = true;

  try {
    console.log(`[RealTimeMatching] Processing updated item: ${payload.itemId}`);

    // Find matches for updated item
    const matches = await matchingService.findMatchesForUser(
      payload.userId,
      payload.itemId,
      {
        includeCycles: true,
        includeChains: true,
        maxResults: 10,
      }
    );

    const highQualityMatches = matches.cycles.filter(
      cycle => cycle.averageScore >= MIN_MATCH_SCORE_FOR_NOTIFICATION
    );

    const notificationsSent = await notifyParticipants(
      highQualityMatches.slice(0, MAX_NOTIFICATIONS_PER_EVENT),
      payload.itemId,
      'updated_match'
    );

    console.log(`[RealTimeMatching] Sent ${notificationsSent} update notifications`);

    // Broadcast activity
    broadcastMatchActivity({
      type: 'item_updated',
      count: notificationsSent,
    });

    // Invalidate cache
    invalidateCache();

  } catch (error) {
    console.error('[RealTimeMatching] Error processing item updated:', error);
  } finally {
    isProcessing = false;
  }
};

/**
 * Notify all participants in matching cycles
 */
const notifyParticipants = async (
  cycles: any[],
  triggerItemId: string,
  notificationType: 'new_match' | 'updated_match'
): Promise<number> => {
  let notificationCount = 0;

  for (const cycle of cycles) {
    const opportunityId = `OPP-${Date.now()}-${cycle.participants[0].userId}`;

    // Get participant user IDs
    const participantUserIds = [...new Set(cycle.participants.map((p: any) => p.userId))];

    for (const userId of participantUserIds) {
      // Check if user already notified recently
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'BARTER_OFFER_RECEIVED',
          entityId: triggerItemId,
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
        },
      });

      if (recentNotification) {
        console.log(`[RealTimeMatching] User ${userId} already notified recently, skipping`);
        continue;
      }

      // Get user's items in this cycle
      const userItems = cycle.participants
        .filter((p: any) => p.userId === userId)
        .map((p: any) => ({
          itemId: p.itemId as string,
          itemTitle: p.itemTitle as string,
        }));

      // Create database notification
      await prisma.notification.create({
        data: {
          userId: userId as string,
          type: 'BARTER_OFFER_RECEIVED',
          title: notificationType === 'new_match'
            ? 'New Barter Match Found!'
            : 'Updated Barter Match',
          message: `Found a ${Math.round(cycle.averageScore * 100)}% match with ${cycle.participants.length} participants. Check it out!`,
          entityId: triggerItemId as string,
          entityType: 'BarterChain',
        },
      });

      // Send WebSocket notification
      const notification: MatchNotification = {
        type: notificationType,
        opportunityId,
        participantCount: cycle.participants.length,
        averageMatchScore: cycle.averageScore,
        participants: participantUserIds as string[],
        userItems,
        timestamp: new Date(),
      };

      notifyUser(userId as string, notification);
      notificationCount++;
    }
  }

  return notificationCount;
};

// ============================================
// Cache Management
// ============================================

/**
 * Invalidate graph cache to force rebuild on next batch run
 */
const invalidateCache = (): void => {
  if (graphCache) {
    console.log('[RealTimeMatching] Invalidating graph cache');
    graphCache = null;
  }
};

/**
 * Check if cache is still valid
 */
const isCacheValid = (): boolean => {
  if (!graphCache) return false;
  return new Date() < graphCache.expiresAt;
};

// ============================================
// Event Listener Registration
// ============================================

/**
 * Start listening to item events for real-time matching
 */
export const startRealtimeMatching = (): void => {
  console.log('[RealTimeMatching] Starting real-time matching service...');

  // Register event listeners
  itemEvents.onItemCreated(handleItemCreated);
  itemEvents.onItemUpdated(handleItemUpdated);

  console.log('[RealTimeMatching] Event listeners registered');
  console.log(`[RealTimeMatching] Min match score for notifications: ${MIN_MATCH_SCORE_FOR_NOTIFICATION * 100}%`);
  console.log(`[RealTimeMatching] Max notifications per event: ${MAX_NOTIFICATIONS_PER_EVENT}`);
};

/**
 * Stop real-time matching service
 */
export const stopRealtimeMatching = (): void => {
  console.log('[RealTimeMatching] Stopping real-time matching service...');
  itemEvents.removeAllListeners();
};

// ============================================
// Manual Trigger (for testing)
// ============================================

/**
 * Manually trigger matching for a specific item (testing/admin)
 */
export const triggerMatchingForItem = async (
  userId: string,
  itemId: string
): Promise<{ matchCount: number; notificationsSent: number }> => {
  console.log(`[RealTimeMatching] Manual trigger for item ${itemId}`);

  const matches = await matchingService.findMatchesForUser(userId, itemId, {
    includeCycles: true,
    maxResults: 10,
  });

  const highQualityMatches = matches.cycles.filter(
    cycle => cycle.averageScore >= MIN_MATCH_SCORE_FOR_NOTIFICATION
  );

  const notificationsSent = await notifyParticipants(
    highQualityMatches.slice(0, MAX_NOTIFICATIONS_PER_EVENT),
    itemId,
    'new_match'
  );

  return {
    matchCount: matches.totalMatches,
    notificationsSent,
  };
};

// ============================================
// Statistics
// ============================================

/**
 * Get real-time matching statistics
 */
export const getRealtimeMatchingStats = () => {
  return {
    isRunning: itemEvents.listenerCount('item:created') > 0,
    cacheValid: isCacheValid(),
    cacheExpiry: graphCache?.expiresAt,
    isProcessing,
    websocketConnected: io !== null,
    connectedClients: io?.sockets.sockets.size || 0,
  };
};
