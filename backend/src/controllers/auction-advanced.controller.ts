import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/response';
import * as watchlistService from '../services/auction-watchlist.service';
import * as depositService from '../services/auction-deposit.service';
import * as sealedBidService from '../services/auction-sealed-bid.service';
import * as disputeService from '../services/auction-dispute.service';
import * as reviewService from '../services/auction-review.service';
import * as auctionService from '../services/auction.service';

/**
 * ============================================
 * سوق المزادات المتقدم - Advanced Auction Marketplace Controllers
 * ============================================
 */

// ============================================
// قائمة المراقبة - Watchlist
// ============================================

/**
 * الحصول على قائمة المراقبة
 * GET /api/v1/auctions/watchlist
 */
export const getWatchlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await watchlistService.getUserWatchlist(
      userId,
      Number(page),
      Number(limit)
    );

    return successResponse(res, result, 'تم استرجاع قائمة المراقبة بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * إضافة مزاد إلى قائمة المراقبة
 * POST /api/v1/auctions/:id/watchlist
 */
export const addToWatchlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const auctionId = req.params.id;

    const result = await watchlistService.addToWatchlist(userId, auctionId, req.body);

    return successResponse(res, result, 'تم إضافة المزاد إلى قائمة المراقبة', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * إزالة مزاد من قائمة المراقبة
 * DELETE /api/v1/auctions/:id/watchlist
 */
export const removeFromWatchlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const auctionId = req.params.id;

    const result = await watchlistService.removeFromWatchlist(userId, auctionId);

    return successResponse(res, result, 'تم إزالة المزاد من قائمة المراقبة');
  } catch (error) {
    next(error);
  }
};

/**
 * التحقق من وجود مزاد في قائمة المراقبة
 * GET /api/v1/auctions/:id/watchlist/check
 */
export const checkWatchlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const auctionId = req.params.id;

    const isInWatchlist = await watchlistService.isInWatchlist(userId, auctionId);

    return successResponse(res, { isInWatchlist }, 'تم التحقق بنجاح');
  } catch (error) {
    next(error);
  }
};

// ============================================
// الإيداعات - Deposits
// ============================================

/**
 * الحصول على إيداعات المستخدم
 * GET /api/v1/auctions/deposits
 */
export const getUserDeposits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await depositService.getUserDeposits(
      userId,
      Number(page),
      Number(limit)
    );

    return successResponse(res, result, 'تم استرجاع الإيداعات بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * دفع إيداع للمشاركة في مزاد
 * POST /api/v1/auctions/:id/deposit
 */
export const payDeposit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const auctionId = req.params.id;
    const { paymentMethod, paymentReference } = req.body;

    const result = await depositService.payDeposit(
      userId,
      auctionId,
      paymentMethod,
      paymentReference
    );

    return successResponse(res, result, 'تم دفع الإيداع بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * التحقق من وجود إيداع صالح
 * GET /api/v1/auctions/:id/deposit/check
 */
export const checkDeposit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const auctionId = req.params.id;

    const hasDeposit = await depositService.hasValidDeposit(userId, auctionId);

    return successResponse(res, { hasDeposit }, 'تم التحقق بنجاح');
  } catch (error) {
    next(error);
  }
};

// ============================================
// المزايدات المختومة - Sealed Bids
// ============================================

/**
 * تقديم مزايدة مختومة
 * POST /api/v1/auctions/:id/sealed-bid
 */
export const submitSealedBid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const auctionId = req.params.id;

    const result = await sealedBidService.submitSealedBid(userId, auctionId, req.body);

    return successResponse(res, result, 'تم تقديم العرض المختوم بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * الحصول على عروضي المختومة
 * GET /api/v1/auctions/my-sealed-bids
 */
export const getMySealedBids = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await sealedBidService.getMySealedBids(
      userId,
      Number(page),
      Number(limit)
    );

    return successResponse(res, result, 'تم استرجاع العروض المختومة بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * التحقق من تقديم عرض مختوم
 * GET /api/v1/auctions/:id/sealed-bid/check
 */
export const checkSealedBid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const auctionId = req.params.id;

    const hasSubmitted = await sealedBidService.hasSubmittedSealedBid(userId, auctionId);

    return successResponse(res, { hasSubmitted }, 'تم التحقق بنجاح');
  } catch (error) {
    next(error);
  }
};

// ============================================
// المزايدة بالوكالة - Proxy Bidding
// ============================================

/**
 * تعيين مزايدة بالوكالة
 * POST /api/v1/auctions/:id/proxy-bid
 */
export const setProxyBid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const auctionId = req.params.id;
    const { maxBidAmount } = req.body;

    // استخدام placeBid مع maxAutoBid
    const result = await auctionService.placeBid(auctionId, userId, {
      bidAmount: 0, // سيتم حسابه تلقائياً
      maxAutoBid: maxBidAmount,
    });

    return successResponse(res, result, 'تم تعيين المزايدة بالوكالة بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

// ============================================
// النزاعات - Disputes
// ============================================

/**
 * الحصول على نزاعات المستخدم
 * GET /api/v1/auctions/disputes
 */
export const getUserDisputes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await disputeService.getUserDisputes(
      userId,
      Number(page),
      Number(limit)
    );

    return successResponse(res, result, 'تم استرجاع النزاعات بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * إنشاء نزاع
 * POST /api/v1/auctions/:id/dispute
 */
export const createDispute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const auctionId = req.params.id;

    const result = await disputeService.createDispute(userId, auctionId, req.body);

    return successResponse(res, result, 'تم إنشاء النزاع بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * الحصول على تفاصيل نزاع
 * GET /api/v1/auctions/disputes/:disputeId
 */
export const getDisputeDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const disputeId = req.params.disputeId;

    const result = await disputeService.getDisputeDetails(disputeId, userId);

    return successResponse(res, result, 'تم استرجاع تفاصيل النزاع بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * الرد على نزاع
 * POST /api/v1/auctions/disputes/:disputeId/respond
 */
export const respondToDispute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const disputeId = req.params.disputeId;
    const { message, attachments } = req.body;

    const result = await disputeService.respondToDispute(
      userId,
      disputeId,
      message,
      attachments
    );

    return successResponse(res, result, 'تم إرسال الرد بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

// ============================================
// التقييمات - Reviews
// ============================================

/**
 * إنشاء تقييم
 * POST /api/v1/auctions/:id/review
 */
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const auctionId = req.params.id;

    const result = await reviewService.createReview(userId, auctionId, req.body);

    return successResponse(res, result, 'تم إنشاء التقييم بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * الحصول على تقييمات مزاد
 * GET /api/v1/auctions/:id/reviews
 */
export const getAuctionReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auctionId = req.params.id;

    const result = await reviewService.getAuctionReviews(auctionId);

    return successResponse(res, result, 'تم استرجاع التقييمات بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * الرد على تقييم
 * POST /api/v1/auctions/reviews/:reviewId/respond
 */
export const respondToReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const reviewId = req.params.reviewId;
    const { response } = req.body;

    const result = await reviewService.respondToReview(userId, reviewId, response);

    return successResponse(res, result, 'تم إرسال الرد بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * التحقق من إمكانية التقييم
 * GET /api/v1/auctions/:id/can-review
 */
export const canReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const auctionId = req.params.id;

    const result = await reviewService.canReview(userId, auctionId);

    return successResponse(res, result, 'تم التحقق بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * الحصول على تقييماتي
 * GET /api/v1/auctions/my-reviews
 */
export const getMyReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { type = 'received', page = 1, limit = 20 } = req.query;

    const result = await reviewService.getUserReviews(
      userId,
      type as 'received' | 'given',
      Number(page),
      Number(limit)
    );

    return successResponse(res, result, 'تم استرجاع التقييمات بنجاح');
  } catch (error) {
    next(error);
  }
};
