import { Request, Response, NextFunction } from 'express';
import * as badgeService from '../services/badge.service';
import { successResponse, errorResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

// Helper to safely get user ID from request
const getUserId = (req: Request): string | null => req.user?.id || null;

/**
 * Get all available badges info
 * GET /api/v1/badges
 */
export const getAllBadgesInfo = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const badges = badgeService.getAllBadgesInfo();

    return successResponse(res, { badges }, 'تم جلب معلومات الشارات بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's badges
 * GET /api/v1/badges/user/:userId
 */
export const getUserBadges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const badges = await badgeService.getUserBadges(userId);

    return successResponse(res, { badges }, 'تم جلب شارات المستخدم بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get my badges
 * GET /api/v1/badges/my
 */
export const getMyBadges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const badges = await badgeService.getUserBadges(userId);

    return successResponse(res, { badges }, 'تم جلب شاراتك بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Check and award automatic badges
 * POST /api/v1/badges/check
 */
export const checkMyBadges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const awardedBadges = await badgeService.checkAndAwardAutomaticBadges(userId);

    return successResponse(
      res,
      { awardedBadges },
      awardedBadges.length > 0 ? 'تهانينا! حصلت على شارات جديدة' : 'لا توجد شارات جديدة'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get badge requirements
 * GET /api/v1/badges/requirements/:badgeType
 */
export const getBadgeRequirements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { badgeType } = req.params;

    const requirements = badgeService.getBadgeRequirements(badgeType);

    if (!requirements) {
      throw new BadRequestError('نوع الشارة غير صحيح');
    }

    return successResponse(res, { requirements }, 'تم جلب متطلبات الشارة');
  } catch (error) {
    next(error);
  }
};

/**
 * Submit verification request
 * POST /api/v1/badges/verify
 */
export const submitVerificationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { badgeType, documents } = req.body;

    if (!badgeType) {
      throw new BadRequestError('يجب تحديد نوع الشارة');
    }

    const result = await badgeService.submitVerificationRequest(
      userId,
      badgeType,
      documents || []
    );

    return successResponse(res, result, 'تم إرسال طلب التوثيق بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Award badge to user (Admin only)
 * POST /api/v1/badges/award
 */
export const awardBadge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = getUserId(req);
    if (!adminId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { userId, badgeType, notes } = req.body;

    if (!userId || !badgeType) {
      throw new BadRequestError('يجب تحديد المستخدم ونوع الشارة');
    }

    const badge = await badgeService.awardBadge(userId, badgeType, adminId, notes);

    return successResponse(res, badge, 'تم منح الشارة بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke badge from user (Admin only)
 * DELETE /api/v1/badges/revoke
 */
export const revokeBadge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, badgeType } = req.body;

    if (!userId || !badgeType) {
      throw new BadRequestError('يجب تحديد المستخدم ونوع الشارة');
    }

    await badgeService.revokeBadge(userId, badgeType);

    return successResponse(res, null, 'تم سحب الشارة بنجاح');
  } catch (error) {
    next(error);
  }
};
