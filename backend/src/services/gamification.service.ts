/**
 * Gamification & Achievements Service
 * خدمة التلعيب والإنجازات
 */

import { PrismaClient, AchievementCategory, AchievementRarity, ChallengeType } from '@prisma/client';
import * as walletService from './wallet.service';

const prisma = new PrismaClient();

// ============================================
// Level Configuration
// ============================================

const LEVEL_CONFIG = {
  baseXP: 100,              // XP needed for level 2
  xpMultiplier: 1.5,        // Each level requires 1.5x more XP
  maxLevel: 100,
};

const LEVEL_TITLES: { [key: number]: string } = {
  1: 'مبتدئ',
  5: 'متعلم',
  10: 'نشط',
  15: 'محترف',
  20: 'خبير',
  30: 'ماهر',
  40: 'متميز',
  50: 'بارع',
  60: 'متقن',
  70: 'محنك',
  80: 'أسطوري',
  90: 'أسطورة',
  100: 'إله التجارة',
};

// XP rewards for different actions
const XP_REWARDS = {
  DEAL_COMPLETE: 25,
  BARTER_COMPLETE: 35,
  CHAIN_PARTICIPATION: 50,
  REVIEW_WRITTEN: 10,
  FIVE_STAR_RECEIVED: 15,
  REFERRAL: 30,
  DAILY_LOGIN: 5,
  LISTING_CREATED: 5,
  FIRST_DEAL: 100,
  CHALLENGE_COMPLETE: 50,
};

// ============================================
// Core Level Functions
// ============================================

/**
 * Get or create user level
 * الحصول على أو إنشاء مستوى المستخدم
 */
export async function getOrCreateUserLevel(userId: string) {
  let userLevel = await prisma.userLevel.findUnique({
    where: { userId },
    include: {
      achievements: {
        include: { achievement: true },
        orderBy: { completedAt: 'desc' },
      },
    },
  });

  if (!userLevel) {
    userLevel = await prisma.userLevel.create({
      data: {
        userId,
        level: 1,
        currentXP: 0,
        totalXP: 0,
        xpToNextLevel: LEVEL_CONFIG.baseXP,
        title: LEVEL_TITLES[1],
      },
      include: {
        achievements: {
          include: { achievement: true },
        },
      },
    });
  }

  return userLevel;
}

/**
 * Get user level summary
 * الحصول على ملخص مستوى المستخدم
 */
export async function getUserLevelSummary(userId: string) {
  const userLevel = await getOrCreateUserLevel(userId);

  const completedAchievements = userLevel.achievements.filter(a => a.isCompleted);
  const inProgressAchievements = userLevel.achievements.filter(a => !a.isCompleted);

  return {
    level: userLevel.level,
    title: userLevel.title,
    currentXP: userLevel.currentXP,
    totalXP: userLevel.totalXP,
    xpToNextLevel: userLevel.xpToNextLevel,
    progress: Math.round((userLevel.currentXP / userLevel.xpToNextLevel) * 100),
    dailyLoginStreak: userLevel.dailyLoginStreak,
    longestLoginStreak: userLevel.longestLoginStreak,
    completedAchievementsCount: completedAchievements.length,
    inProgressAchievementsCount: inProgressAchievements.length,
    recentAchievements: completedAchievements.slice(0, 5).map(a => ({
      ...a.achievement,
      completedAt: a.completedAt,
    })),
  };
}

/**
 * Award XP to user
 * منح XP للمستخدم
 */
export async function awardXP(
  userId: string,
  amount: number,
  reason: string,
  relatedEntityType?: string,
  relatedEntityId?: string
): Promise<{ leveledUp: boolean; newLevel?: number; newTitle?: string }> {
  const userLevel = await getOrCreateUserLevel(userId);

  let currentXP = userLevel.currentXP + amount;
  let totalXP = userLevel.totalXP + amount;
  let level = userLevel.level;
  let xpToNextLevel = userLevel.xpToNextLevel;
  let leveledUp = false;
  let newTitle = userLevel.title;

  // Check for level up(s)
  while (currentXP >= xpToNextLevel && level < LEVEL_CONFIG.maxLevel) {
    currentXP -= xpToNextLevel;
    level++;
    xpToNextLevel = Math.floor(LEVEL_CONFIG.baseXP * Math.pow(LEVEL_CONFIG.xpMultiplier, level - 1));
    leveledUp = true;

    // Update title if there's a new one for this level
    const titleLevels = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
    for (const titleLevel of titleLevels) {
      if (level >= titleLevel) {
        newTitle = LEVEL_TITLES[titleLevel];
        break;
      }
    }
  }

  await prisma.userLevel.update({
    where: { userId },
    data: {
      level,
      currentXP,
      totalXP,
      xpToNextLevel,
      title: newTitle,
    },
  });

  // If leveled up, check for level-based achievements
  if (leveledUp) {
    await checkLevelAchievements(userId, level);
  }

  return { leveledUp, newLevel: leveledUp ? level : undefined, newTitle: leveledUp ? newTitle : undefined };
}

/**
 * Record daily login and update streak
 * تسجيل الدخول اليومي وتحديث السلسلة
 */
export async function recordDailyLogin(userId: string): Promise<{
  streakUpdated: boolean;
  currentStreak: number;
  xpAwarded: number;
  bonusXP: number;
}> {
  const userLevel = await getOrCreateUserLevel(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastLogin = userLevel.lastLoginDate;
  let streakUpdated = false;
  let currentStreak = userLevel.dailyLoginStreak;
  let longestStreak = userLevel.longestLoginStreak;

  if (lastLogin) {
    const lastLoginDate = new Date(lastLogin);
    lastLoginDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day - increase streak
      currentStreak++;
      streakUpdated = true;
    } else if (daysDiff > 1) {
      // Streak broken - reset
      currentStreak = 1;
      streakUpdated = true;
    }
    // daysDiff === 0 means same day, no change
  } else {
    // First login ever
    currentStreak = 1;
    streakUpdated = true;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Calculate XP with streak bonus
  let xpAwarded = XP_REWARDS.DAILY_LOGIN;
  let bonusXP = 0;

  if (currentStreak >= 7) {
    bonusXP = 10; // Week streak bonus
  }
  if (currentStreak >= 30) {
    bonusXP = 25; // Month streak bonus
  }

  // Update user level
  await prisma.userLevel.update({
    where: { userId },
    data: {
      dailyLoginStreak: currentStreak,
      longestLoginStreak: longestStreak,
      lastLoginDate: today,
    },
  });

  // Award XP
  if (streakUpdated || !lastLogin || new Date(lastLogin).toDateString() !== today.toDateString()) {
    await awardXP(userId, xpAwarded + bonusXP, 'دخول يومي');

    // Award wallet bonus
    await walletService.awardDailyLoginBonus(userId);
  }

  // Check streak achievements
  await checkStreakAchievements(userId, currentStreak);

  return {
    streakUpdated,
    currentStreak,
    xpAwarded,
    bonusXP,
  };
}

// ============================================
// Achievement Functions
// ============================================

/**
 * Get all achievements with user progress
 * الحصول على جميع الإنجازات مع تقدم المستخدم
 */
export async function getAchievementsWithProgress(userId: string) {
  const userLevel = await getOrCreateUserLevel(userId);

  const allAchievements = await prisma.achievement.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
  });

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userLevelId: userLevel.id },
  });

  const userAchievementMap = new Map(
    userAchievements.map(ua => [ua.achievementId, ua])
  );

  return allAchievements.map(achievement => {
    const userAchievement = userAchievementMap.get(achievement.id);

    // Hide secret achievements that aren't completed
    if (achievement.isSecret && (!userAchievement || !userAchievement.isCompleted)) {
      return {
        id: achievement.id,
        code: 'SECRET',
        nameAr: '???',
        nameEn: '???',
        descriptionAr: 'إنجاز سري - أكمله لمعرفة المزيد',
        descriptionEn: 'Secret achievement - complete it to learn more',
        icon: '🔒',
        category: achievement.category,
        rarity: achievement.rarity,
        isSecret: true,
        progress: 0,
        requirement: '???',
        isCompleted: false,
      };
    }

    return {
      ...achievement,
      progress: userAchievement?.progress || 0,
      isCompleted: userAchievement?.isCompleted || false,
      completedAt: userAchievement?.completedAt,
      rewardsClaimed: userAchievement?.rewardsClaimed || false,
    };
  });
}

/**
 * Update achievement progress
 * تحديث تقدم الإنجاز
 */
export async function updateAchievementProgress(
  userId: string,
  achievementCode: string,
  incrementBy: number = 1
): Promise<{ completed: boolean; achievement?: any }> {
  const userLevel = await getOrCreateUserLevel(userId);

  const achievement = await prisma.achievement.findUnique({
    where: { code: achievementCode },
  });

  if (!achievement || !achievement.isActive) {
    return { completed: false };
  }

  // Get or create user achievement
  let userAchievement = await prisma.userAchievement.findUnique({
    where: {
      userLevelId_achievementId: {
        userLevelId: userLevel.id,
        achievementId: achievement.id,
      },
    },
  });

  if (!userAchievement) {
    userAchievement = await prisma.userAchievement.create({
      data: {
        userLevelId: userLevel.id,
        achievementId: achievement.id,
        progress: 0,
        isCompleted: false,
      },
    });
  }

  // Already completed
  if (userAchievement.isCompleted) {
    return { completed: false };
  }

  // Update progress
  const newProgress = Math.min(userAchievement.progress + incrementBy, achievement.requirement);
  const isCompleted = newProgress >= achievement.requirement;

  await prisma.userAchievement.update({
    where: { id: userAchievement.id },
    data: {
      progress: newProgress,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  });

  if (isCompleted) {
    // Award XP and coins
    await awardXP(userId, achievement.xpReward, `إنجاز: ${achievement.nameAr}`);

    if (achievement.coinReward > 0) {
      await walletService.awardAchievementBonus(userId, achievement.id, achievement.coinReward);
    }

    return { completed: true, achievement };
  }

  return { completed: false };
}

/**
 * Claim achievement rewards (if not auto-claimed)
 * المطالبة بمكافآت الإنجاز
 */
export async function claimAchievementRewards(
  userId: string,
  achievementId: string
): Promise<{ success: boolean; error?: string }> {
  const userLevel = await getOrCreateUserLevel(userId);

  const userAchievement = await prisma.userAchievement.findFirst({
    where: {
      userLevelId: userLevel.id,
      achievementId,
      isCompleted: true,
      rewardsClaimed: false,
    },
    include: { achievement: true },
  });

  if (!userAchievement) {
    return { success: false, error: 'Achievement not found or already claimed' };
  }

  await prisma.userAchievement.update({
    where: { id: userAchievement.id },
    data: { rewardsClaimed: true },
  });

  return { success: true };
}

/**
 * Check level-based achievements
 * التحقق من إنجازات المستوى
 */
async function checkLevelAchievements(userId: string, level: number) {
  const levelAchievements = [
    { level: 5, code: 'LEVEL_5' },
    { level: 10, code: 'LEVEL_10' },
    { level: 25, code: 'LEVEL_25' },
    { level: 50, code: 'LEVEL_50' },
    { level: 100, code: 'LEVEL_100' },
  ];

  for (const la of levelAchievements) {
    if (level >= la.level) {
      await updateAchievementProgress(userId, la.code, 1);
    }
  }
}

/**
 * Check streak achievements
 * التحقق من إنجازات السلسلة
 */
async function checkStreakAchievements(userId: string, streak: number) {
  const streakAchievements = [
    { streak: 7, code: 'STREAK_7' },
    { streak: 30, code: 'STREAK_30' },
    { streak: 100, code: 'STREAK_100' },
  ];

  for (const sa of streakAchievements) {
    if (streak >= sa.streak) {
      await updateAchievementProgress(userId, sa.code, 1);
    }
  }
}

// ============================================
// Challenge Functions
// ============================================

/**
 * Get active challenges
 * الحصول على التحديات النشطة
 */
export async function getActiveChallenges(userId: string) {
  const now = new Date();

  const challenges = await prisma.challenge.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { endDate: 'asc' },
  });

  // Get user participations
  const participations = await prisma.challengeParticipation.findMany({
    where: {
      userId,
      challengeId: { in: challenges.map(c => c.id) },
    },
  });

  const participationMap = new Map(
    participations.map(p => [p.challengeId, p])
  );

  return challenges.map(challenge => {
    const participation = participationMap.get(challenge.id);
    const timeRemaining = challenge.endDate.getTime() - now.getTime();

    return {
      ...challenge,
      currentValue: participation?.currentValue || 0,
      isCompleted: participation?.isCompleted || false,
      rewardsClaimed: participation?.rewardsClaimed || false,
      progress: Math.min(100, ((participation?.currentValue || 0) / challenge.targetValue) * 100),
      timeRemaining,
      timeRemainingText: formatTimeRemaining(timeRemaining),
    };
  });
}

/**
 * Join a challenge
 * الانضمام لتحدي
 */
export async function joinChallenge(userId: string, challengeId: string): Promise<{ success: boolean; error?: string }> {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });

  if (!challenge || !challenge.isActive) {
    return { success: false, error: 'Challenge not found or inactive' };
  }

  const now = new Date();
  if (now < challenge.startDate || now > challenge.endDate) {
    return { success: false, error: 'Challenge is not currently active' };
  }

  // Check if already joined
  const existing = await prisma.challengeParticipation.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  });

  if (existing) {
    return { success: false, error: 'Already joined this challenge' };
  }

  await prisma.challengeParticipation.create({
    data: {
      challengeId,
      userId,
      currentValue: 0,
      isCompleted: false,
    },
  });

  return { success: true };
}

/**
 * Update challenge progress
 * تحديث تقدم التحدي
 */
export async function updateChallengeProgress(
  userId: string,
  targetType: string,
  incrementBy: number = 1
): Promise<{ challengesCompleted: string[] }> {
  const now = new Date();
  const completedChallenges: string[] = [];

  // Find active challenges of this type that user has joined
  const participations = await prisma.challengeParticipation.findMany({
    where: {
      userId,
      isCompleted: false,
      challenge: {
        targetType,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    },
    include: { challenge: true },
  });

  for (const participation of participations) {
    const newValue = Math.min(
      participation.currentValue + incrementBy,
      participation.challenge.targetValue
    );
    const isCompleted = newValue >= participation.challenge.targetValue;

    await prisma.challengeParticipation.update({
      where: { id: participation.id },
      data: {
        currentValue: newValue,
        isCompleted,
        completedAt: isCompleted ? now : null,
      },
    });

    if (isCompleted) {
      completedChallenges.push(participation.challenge.id);

      // Award rewards
      await awardXP(userId, participation.challenge.xpReward, `تحدي: ${participation.challenge.nameAr}`);

      if (participation.challenge.coinReward > 0) {
        await walletService.awardChallengeBonus(userId, participation.challenge.id, participation.challenge.coinReward);
      }
    }
  }

  return { challengesCompleted: completedChallenges };
}

/**
 * Claim challenge rewards
 * المطالبة بمكافآت التحدي
 */
export async function claimChallengeRewards(
  userId: string,
  challengeId: string
): Promise<{ success: boolean; error?: string }> {
  const participation = await prisma.challengeParticipation.findUnique({
    where: { challengeId_userId: { challengeId, userId } },
  });

  if (!participation || !participation.isCompleted) {
    return { success: false, error: 'Challenge not completed' };
  }

  if (participation.rewardsClaimed) {
    return { success: false, error: 'Rewards already claimed' };
  }

  await prisma.challengeParticipation.update({
    where: { id: participation.id },
    data: { rewardsClaimed: true },
  });

  return { success: true };
}

// ============================================
// Event Handlers (to be called from other services)
// ============================================

/**
 * Handle deal completed event
 * معالجة حدث إتمام الصفقة
 */
export async function onDealCompleted(userId: string, dealType: 'SALE' | 'BARTER' | 'AUCTION') {
  const xp = dealType === 'BARTER' ? XP_REWARDS.BARTER_COMPLETE : XP_REWARDS.DEAL_COMPLETE;

  await awardXP(userId, xp, `إتمام ${dealType === 'BARTER' ? 'مقايضة' : 'صفقة'}`);

  // Update achievements
  await updateAchievementProgress(userId, 'FIRST_DEAL', 1);
  await updateAchievementProgress(userId, 'DEAL_MASTER_10', 1);
  await updateAchievementProgress(userId, 'DEAL_MASTER_50', 1);
  await updateAchievementProgress(userId, 'DEAL_MASTER_100', 1);

  if (dealType === 'BARTER') {
    await updateAchievementProgress(userId, 'FIRST_BARTER', 1);
    await updateAchievementProgress(userId, 'BARTER_MASTER', 1);
  }

  // Update challenges
  await updateChallengeProgress(userId, 'DEALS', 1);
  if (dealType === 'BARTER') {
    await updateChallengeProgress(userId, 'BARTERS', 1);
  }
}

/**
 * Handle chain participation event
 * معالجة حدث المشاركة في سلسلة
 */
export async function onChainParticipation(userId: string, chainId: string, participantCount: number) {
  await awardXP(userId, XP_REWARDS.CHAIN_PARTICIPATION, 'المشاركة في سلسلة مقايضة');

  if (participantCount >= 3) {
    await updateAchievementProgress(userId, 'BARTER_CHAIN', 1);
  }
}

/**
 * Handle review written event
 * معالجة حدث كتابة تقييم
 */
export async function onReviewWritten(userId: string, reviewId: string) {
  await awardXP(userId, XP_REWARDS.REVIEW_WRITTEN, 'كتابة تقييم');
  await updateAchievementProgress(userId, 'FIRST_REVIEW', 1);
  await updateChallengeProgress(userId, 'REVIEWS', 1);
}

/**
 * Handle five star received event
 * معالجة حدث استلام تقييم 5 نجوم
 */
export async function onFiveStarReceived(userId: string) {
  await awardXP(userId, XP_REWARDS.FIVE_STAR_RECEIVED, 'استلام تقييم 5 نجوم');
  await updateAchievementProgress(userId, 'FIVE_STAR', 1);
}

/**
 * Handle referral event
 * معالجة حدث الإحالة
 */
export async function onReferral(referrerId: string) {
  await awardXP(referrerId, XP_REWARDS.REFERRAL, 'إحالة صديق');
  await updateAchievementProgress(referrerId, 'REFERRAL_CHAMPION', 1);
}

// ============================================
// Utility Functions
// ============================================

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'انتهى';

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} يوم ${hours} ساعة`;
  }

  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours} ساعة ${minutes} دقيقة`;
  }

  return `${minutes} دقيقة`;
}

export { XP_REWARDS, LEVEL_TITLES };
