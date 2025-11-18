/**
 * Reverse Auction Controllers
 *
 * HTTP request handlers for reverse auction endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as reverseAuctionService from '../services/reverse-auction.service';
import { successResponse } from '../utils/response';

// ============================================
// Reverse Auction Management (Buyer Side)
// ============================================

/**
 * Create a new reverse auction
 * POST /api/v1/reverse-auctions
 */
export const createReverseAuction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const buyerId = req.user!.id;
    const auctionData = req.body;

    const auction = await reverseAuctionService.createReverseAuction(buyerId, auctionData);

    return successResponse(res, auction, 'Reverse auction created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reverse auctions with filters
 * GET /api/v1/reverse-auctions
 */
export const getReverseAuctions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = {
      status: req.query.status as string | undefined,
      categoryId: req.query.categoryId as string | undefined,
      condition: req.query.condition as string | undefined,
      minBudget: req.query.minBudget ? parseFloat(req.query.minBudget as string) : undefined,
      maxBudget: req.query.maxBudget ? parseFloat(req.query.maxBudget as string) : undefined,
      location: req.query.location as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await reverseAuctionService.getReverseAuctions(filters);

    return successResponse(res, result, 'Reverse auctions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single reverse auction by ID with all bids
 * GET /api/v1/reverse-auctions/:id
 */
export const getReverseAuctionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const auction = await reverseAuctionService.getReverseAuctionById(id, userId);

    return successResponse(res, auction, 'Reverse auction retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update reverse auction (buyer only)
 * PATCH /api/v1/reverse-auctions/:id
 */
export const updateReverseAuction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const buyerId = req.user!.id;
    const updateData = req.body;

    const auction = await reverseAuctionService.updateReverseAuction(id, buyerId, updateData);

    return successResponse(res, auction, 'Reverse auction updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel reverse auction (buyer only)
 * POST /api/v1/reverse-auctions/:id/cancel
 */
export const cancelReverseAuction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const buyerId = req.user!.id;

    const auction = await reverseAuctionService.cancelReverseAuction(id, buyerId);

    return successResponse(res, auction, 'Reverse auction cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete reverse auction (buyer only, draft only)
 * DELETE /api/v1/reverse-auctions/:id
 */
export const deleteReverseAuction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const buyerId = req.user!.id;

    await reverseAuctionService.deleteReverseAuction(id, buyerId);

    return successResponse(res, null, 'Reverse auction deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Bidding Management (Seller Side)
// ============================================

/**
 * Submit a bid on a reverse auction
 * POST /api/v1/reverse-auctions/:id/bids
 */
export const submitBid = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: reverseAuctionId } = req.params;
    const sellerId = req.user!.id;
    const bidData = {
      ...req.body,
      reverseAuctionId,
    };

    const metadata = {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    const bid = await reverseAuctionService.submitBid(sellerId, bidData, metadata);

    return successResponse(res, bid, 'Bid submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bids for a reverse auction
 * GET /api/v1/reverse-auctions/:id/bids
 */
export const getBidsForAuction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const bids = await reverseAuctionService.getBidsForAuction(id);

    return successResponse(res, bids, 'Bids retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update a bid (seller only)
 * PATCH /api/v1/reverse-auctions/bids/:bidId
 */
export const updateBid = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bidId } = req.params;
    const sellerId = req.user!.id;
    const updateData = req.body;

    const bid = await reverseAuctionService.updateBid(bidId, sellerId, updateData);

    return successResponse(res, bid, 'Bid updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw a bid (seller only)
 * POST /api/v1/reverse-auctions/bids/:bidId/withdraw
 */
export const withdrawBid = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bidId } = req.params;
    const sellerId = req.user!.id;

    const bid = await reverseAuctionService.withdrawBid(bidId, sellerId);

    return successResponse(res, bid, 'Bid withdrawn successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get my bids (seller view)
 * GET /api/v1/reverse-auctions/bids/my-bids
 */
export const getMyBids = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.user!.id;
    const filters = {
      status: req.query.status as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await reverseAuctionService.getMyBids(sellerId, filters);

    return successResponse(res, result, 'Bids retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Award & Complete
// ============================================

/**
 * Award auction to winning bid (buyer only)
 * POST /api/v1/reverse-auctions/:id/award
 */
export const awardAuction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { bidId } = req.body;
    const buyerId = req.user!.id;

    const auction = await reverseAuctionService.awardAuction(id, bidId, buyerId);

    return successResponse(res, auction, 'Auction awarded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark auction as completed
 * POST /api/v1/reverse-auctions/:id/complete
 */
export const completeAuction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const auction = await reverseAuctionService.completeAuction(id, userId);

    return successResponse(res, auction, 'Auction marked as completed');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Statistics
// ============================================

/**
 * Get auction statistics for current user
 * GET /api/v1/reverse-auctions/stats
 */
export const getStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    const stats = await reverseAuctionService.getAuctionStatistics(userId);

    return successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};
