/**
 * Social Features Service
 * خدمة الميزات الاجتماعية
 *
 * Social networking features:
 * - Follow/Unfollow users
 * - Activity feed
 * - Follower notifications
 * - User discovery
 */

import prisma from '../config/database';

// ============================================
// Types
// ============================================

type ActivityType =
  | 'NEW_LISTING'
  | 'PRICE_DROP'
  | 'DEAL_COMPLETED'
  | 'REVIEW_RECEIVED'
  | 'LEVEL_UP'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'FLASH_DEAL'
  | 'BARTER_CHAIN';

interface CreateActivityParams {
  userId: string;
  activityType: ActivityType;
  entityType: string;
  entityId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
  isPublic?: boolean;
}

interface UserProfile {
  id: string;
  fullName: string;
  avatar: string | null;
  rating: number;
  totalReviews: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  joinedAt: Date;
  badges: string[];
}

interface FeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  activityType: ActivityType;
  title: string;
  description: string | null;
  imageUrl: string | null;
  entityType: string;
  entityId: string;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

interface FollowResult {
  success: boolean;
  message: string;
  messageAr: string;
  isFollowing: boolean;
}

// ============================================
// Follow System
// ============================================

/**
 * Follow a user
 */
export async function followUser(
  followerId: string,
  followingId: string,
  options?: {
    notifyNewItems?: boolean;
    notifyDeals?: boolean;
    notifyActivity?: boolean;
  }
): Promise<FollowResult> {
  // Can't follow yourself
  if (followerId === followingId) {
    return {
      success: false,
      message: "You can't follow yourself",
      messageAr: 'لا يمكنك متابعة نفسك',
      isFollowing: false,
    };
  }

  // Check if already following
  const existing = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  if (existing && existing.isActive) {
    return {
      success: false,
      message: 'Already following this user',
      messageAr: 'أنت تتابع هذا المستخدم بالفعل',
      isFollowing: true,
    };
  }

  // Create or reactivate follow
  if (existing) {
    await prisma.userFollow.update({
      where: { id: existing.id },
      data: {
        isActive: true,
        notifyNewItems: options?.notifyNewItems ?? true,
        notifyDeals: options?.notifyDeals ?? true,
        notifyActivity: options?.notifyActivity ?? false,
      },
    });
  } else {
    await prisma.userFollow.create({
      data: {
        followerId,
        followingId,
        notifyNewItems: options?.notifyNewItems ?? true,
        notifyDeals: options?.notifyDeals ?? true,
        notifyActivity: options?.notifyActivity ?? false,
      },
    });
  }

  // Create activity for this
  const follower = await prisma.user.findUnique({
    where: { id: followerId },
    select: { fullName: true },
  });

  // TODO: Send notification to followed user
  // await notifyNewFollower(followingId, followerId, follower?.fullName);

  return {
    success: true,
    message: 'Now following user',
    messageAr: 'أنت الآن تتابع هذا المستخدم',
    isFollowing: true,
  };
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<FollowResult> {
  const existing = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  if (!existing || !existing.isActive) {
    return {
      success: false,
      message: 'Not following this user',
      messageAr: 'أنت لا تتابع هذا المستخدم',
      isFollowing: false,
    };
  }

  await prisma.userFollow.update({
    where: { id: existing.id },
    data: { isActive: false },
  });

  return {
    success: true,
    message: 'Unfollowed user',
    messageAr: 'تم إلغاء المتابعة',
    isFollowing: false,
  };
}

/**
 * Toggle follow status
 */
export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<FollowResult> {
  const existing = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  if (existing?.isActive) {
    return unfollowUser(followerId, followingId);
  } else {
    return followUser(followerId, followingId);
  }
}

/**
 * Update follow notification preferences
 */
export async function updateFollowPreferences(
  followerId: string,
  followingId: string,
  preferences: {
    notifyNewItems?: boolean;
    notifyDeals?: boolean;
    notifyActivity?: boolean;
  }
) {
  const follow = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  if (!follow) {
    throw new Error('Follow relationship not found');
  }

  return prisma.userFollow.update({
    where: { id: follow.id },
    data: preferences,
  });
}

/**
 * Get followers of a user
 */
export async function getFollowers(
  userId: string,
  options?: { limit?: number; offset?: number }
) {
  const { limit = 20, offset = 0 } = options || {};

  const followers = await prisma.userFollow.findMany({
    where: {
      followingId: userId,
      isActive: true,
    },
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
  });

  // Get follower details
  const followerIds = followers.map(f => f.followerId);
  const users = await prisma.user.findMany({
    where: { id: { in: followerIds } },
    select: {
      id: true,
      fullName: true,
      avatar: true,
      rating: true,
    },
  });

  return followers.map(f => {
    const user = users.find(u => u.id === f.followerId);
    return {
      id: f.id,
      userId: f.followerId,
      fullName: user?.fullName || '',
      avatar: user?.avatar,
      rating: user?.rating || 0,
      followedAt: f.createdAt,
    };
  });
}

/**
 * Get users that a user is following
 */
export async function getFollowing(
  userId: string,
  options?: { limit?: number; offset?: number }
) {
  const { limit = 20, offset = 0 } = options || {};

  const following = await prisma.userFollow.findMany({
    where: {
      followerId: userId,
      isActive: true,
    },
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
  });

  // Get followed user details
  const followingIds = following.map(f => f.followingId);
  const users = await prisma.user.findMany({
    where: { id: { in: followingIds } },
    select: {
      id: true,
      fullName: true,
      avatar: true,
      rating: true,
    },
  });

  return following.map(f => {
    const user = users.find(u => u.id === f.followingId);
    return {
      id: f.id,
      userId: f.followingId,
      fullName: user?.fullName || '',
      avatar: user?.avatar,
      rating: user?.rating || 0,
      followedAt: f.createdAt,
      notifyNewItems: f.notifyNewItems,
      notifyDeals: f.notifyDeals,
      notifyActivity: f.notifyActivity,
    };
  });
}

/**
 * Get follow counts for a user
 */
export async function getFollowCounts(userId: string) {
  const [followers, following] = await Promise.all([
    prisma.userFollow.count({
      where: { followingId: userId, isActive: true },
    }),
    prisma.userFollow.count({
      where: { followerId: userId, isActive: true },
    }),
  ]);

  return { followers, following };
}

/**
 * Check if user A follows user B
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const follow = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  return follow?.isActive ?? false;
}

// ============================================
// User Profile
// ============================================

/**
 * Get user profile with follow information
 */
export async function getUserProfile(
  userId: string,
  viewerId?: string
): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      reputation: {
        select: { badges: true },
      },
    },
  });

  if (!user) return null;

  const { followers, following } = await getFollowCounts(userId);

  let isFollowingUser = false;
  let isFollowedByUser = false;

  if (viewerId && viewerId !== userId) {
    [isFollowingUser, isFollowedByUser] = await Promise.all([
      isFollowing(viewerId, userId),
      isFollowing(userId, viewerId),
    ]);
  }

  return {
    id: user.id,
    fullName: user.fullName,
    avatar: user.avatar,
    rating: user.rating,
    totalReviews: user.totalReviews,
    followersCount: followers,
    followingCount: following,
    isFollowing: isFollowingUser,
    isFollowedBy: isFollowedByUser,
    joinedAt: user.createdAt,
    badges: user.reputation?.badges || [],
  };
}

// ============================================
// Activity Feed
// ============================================

/**
 * Create activity entry
 */
export async function createActivity(params: CreateActivityParams) {
  return prisma.activityFeed.create({
    data: {
      userId: params.userId,
      activityType: params.activityType,
      entityType: params.entityType,
      entityId: params.entityId,
      title: params.title,
      description: params.description,
      imageUrl: params.imageUrl,
      metadata: params.metadata,
      isPublic: params.isPublic ?? true,
    },
  });
}

/**
 * Get user's own activity feed
 */
export async function getUserActivity(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<FeedItem[]> {
  const { limit = 20, offset = 0 } = options || {};

  const activities = await prisma.activityFeed.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true, avatar: true },
  });

  return activities.map(a => ({
    id: a.id,
    userId: a.userId,
    userName: user?.fullName || '',
    userAvatar: user?.avatar || null,
    activityType: a.activityType as ActivityType,
    title: a.title,
    description: a.description,
    imageUrl: a.imageUrl,
    entityType: a.entityType,
    entityId: a.entityId,
    metadata: a.metadata as Record<string, any> | null,
    createdAt: a.createdAt,
  }));
}

/**
 * Get feed of followed users' activities
 */
export async function getFollowingFeed(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<FeedItem[]> {
  const { limit = 20, offset = 0 } = options || {};

  // Get users being followed
  const following = await prisma.userFollow.findMany({
    where: {
      followerId: userId,
      isActive: true,
    },
    select: { followingId: true },
  });

  const followingIds = following.map(f => f.followingId);

  if (followingIds.length === 0) {
    return [];
  }

  // Get activities from followed users
  const activities = await prisma.activityFeed.findMany({
    where: {
      userId: { in: followingIds },
      isPublic: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  // Get user details
  const users = await prisma.user.findMany({
    where: { id: { in: followingIds } },
    select: { id: true, fullName: true, avatar: true },
  });

  return activities.map(a => {
    const user = users.find(u => u.id === a.userId);
    return {
      id: a.id,
      userId: a.userId,
      userName: user?.fullName || '',
      userAvatar: user?.avatar || null,
      activityType: a.activityType as ActivityType,
      title: a.title,
      description: a.description,
      imageUrl: a.imageUrl,
      entityType: a.entityType,
      entityId: a.entityId,
      metadata: a.metadata as Record<string, any> | null,
      createdAt: a.createdAt,
    };
  });
}

/**
 * Get global/discover feed
 */
export async function getDiscoverFeed(
  options?: { limit?: number; offset?: number; excludeUserId?: string }
): Promise<FeedItem[]> {
  const { limit = 20, offset = 0, excludeUserId } = options || {};

  const activities = await prisma.activityFeed.findMany({
    where: {
      isPublic: true,
      ...(excludeUserId && { userId: { not: excludeUserId } }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  // Get unique user IDs
  const userIds = [...new Set(activities.map(a => a.userId))];

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, fullName: true, avatar: true },
  });

  return activities.map(a => {
    const user = users.find(u => u.id === a.userId);
    return {
      id: a.id,
      userId: a.userId,
      userName: user?.fullName || '',
      userAvatar: user?.avatar || null,
      activityType: a.activityType as ActivityType,
      title: a.title,
      description: a.description,
      imageUrl: a.imageUrl,
      entityType: a.entityType,
      entityId: a.entityId,
      metadata: a.metadata as Record<string, any> | null,
      createdAt: a.createdAt,
    };
  });
}

// ============================================
// Activity Creators
// ============================================

/**
 * Record new listing activity
 */
export async function onNewListing(
  userId: string,
  listingId: string,
  itemTitle: string,
  imageUrl?: string
) {
  return createActivity({
    userId,
    activityType: 'NEW_LISTING',
    entityType: 'LISTING',
    entityId: listingId,
    title: `أضاف منتج جديد: ${itemTitle}`,
    imageUrl,
  });
}

/**
 * Record price drop activity
 */
export async function onPriceDrop(
  userId: string,
  listingId: string,
  itemTitle: string,
  oldPrice: number,
  newPrice: number,
  imageUrl?: string
) {
  const dropPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

  return createActivity({
    userId,
    activityType: 'PRICE_DROP',
    entityType: 'LISTING',
    entityId: listingId,
    title: `خفض السعر بنسبة ${dropPercent}%: ${itemTitle}`,
    description: `من ${oldPrice} إلى ${newPrice} جنيه`,
    imageUrl,
    metadata: { oldPrice, newPrice, dropPercent },
  });
}

/**
 * Record deal completion activity
 */
export async function onDealCompleted(
  userId: string,
  transactionId: string,
  itemTitle: string,
  dealType: 'SALE' | 'PURCHASE' | 'BARTER',
  imageUrl?: string
) {
  const titles = {
    SALE: `أتم صفقة بيع: ${itemTitle}`,
    PURCHASE: `اشترى: ${itemTitle}`,
    BARTER: `أتم مقايضة: ${itemTitle}`,
  };

  return createActivity({
    userId,
    activityType: 'DEAL_COMPLETED',
    entityType: 'TRANSACTION',
    entityId: transactionId,
    title: titles[dealType],
    imageUrl,
    metadata: { dealType },
  });
}

/**
 * Record review received activity
 */
export async function onReviewReceived(
  userId: string,
  reviewId: string,
  rating: number,
  reviewerName: string
) {
  return createActivity({
    userId,
    activityType: 'REVIEW_RECEIVED',
    entityType: 'REVIEW',
    entityId: reviewId,
    title: `حصل على تقييم ${rating} نجوم`,
    description: `من ${reviewerName}`,
    metadata: { rating, reviewerName },
  });
}

/**
 * Record level up activity
 */
export async function onLevelUp(
  userId: string,
  newLevel: number,
  levelTitle: string
) {
  return createActivity({
    userId,
    activityType: 'LEVEL_UP',
    entityType: 'USER_LEVEL',
    entityId: userId,
    title: `وصل للمستوى ${newLevel}: ${levelTitle}`,
    metadata: { level: newLevel, title: levelTitle },
  });
}

/**
 * Record achievement unlocked activity
 */
export async function onAchievementUnlocked(
  userId: string,
  achievementId: string,
  achievementName: string,
  achievementIcon?: string
) {
  return createActivity({
    userId,
    activityType: 'ACHIEVEMENT_UNLOCKED',
    entityType: 'ACHIEVEMENT',
    entityId: achievementId,
    title: `حصل على إنجاز: ${achievementName}`,
    imageUrl: achievementIcon,
    metadata: { achievementName },
  });
}

// ============================================
// Notifications to Followers
// ============================================

/**
 * Get followers who want to be notified of new items
 */
export async function getFollowersForNewItem(userId: string) {
  const follows = await prisma.userFollow.findMany({
    where: {
      followingId: userId,
      isActive: true,
      notifyNewItems: true,
    },
    select: { followerId: true },
  });

  return follows.map(f => f.followerId);
}

/**
 * Get followers who want to be notified of deals
 */
export async function getFollowersForDeals(userId: string) {
  const follows = await prisma.userFollow.findMany({
    where: {
      followingId: userId,
      isActive: true,
      notifyDeals: true,
    },
    select: { followerId: true },
  });

  return follows.map(f => f.followerId);
}

/**
 * Get followers who want all activity notifications
 */
export async function getFollowersForActivity(userId: string) {
  const follows = await prisma.userFollow.findMany({
    where: {
      followingId: userId,
      isActive: true,
      notifyActivity: true,
    },
    select: { followerId: true },
  });

  return follows.map(f => f.followerId);
}

// ============================================
// User Discovery
// ============================================

/**
 * Get suggested users to follow
 */
export async function getSuggestedUsers(
  userId: string,
  limit: number = 10
) {
  // Get already following
  const following = await prisma.userFollow.findMany({
    where: { followerId: userId, isActive: true },
    select: { followingId: true },
  });

  const followingIds = following.map(f => f.followingId);

  // Find popular users not already followed
  const suggestions = await prisma.user.findMany({
    where: {
      id: { notIn: [...followingIds, userId] },
      status: 'ACTIVE',
      rating: { gte: 4.0 },
    },
    select: {
      id: true,
      fullName: true,
      avatar: true,
      rating: true,
      totalReviews: true,
    },
    orderBy: [
      { rating: 'desc' },
      { totalReviews: 'desc' },
    ],
    take: limit,
  });

  return suggestions;
}

/**
 * Get top sellers to follow
 */
export async function getTopSellers(limit: number = 10) {
  return prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      rating: { gte: 4.0 },
      totalReviews: { gte: 10 },
    },
    select: {
      id: true,
      fullName: true,
      avatar: true,
      rating: true,
      totalReviews: true,
    },
    orderBy: [
      { rating: 'desc' },
      { totalReviews: 'desc' },
    ],
    take: limit,
  });
}

// ============================================
// Cleanup
// ============================================

/**
 * Clean old activity entries
 */
export async function cleanOldActivities(daysToKeep: number = 90) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

  const result = await prisma.activityFeed.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
    },
  });

  return result.count;
}
