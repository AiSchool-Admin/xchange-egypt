import { Request, Response, NextFunction } from 'express';
import * as auctionService from '../services/auction.service';
import { successResponse } from '../utils/response';

/**
 * Create a new auction
 * POST /api/v1/auctions
 */
export const createAuction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const auction = await auctionService.createAuction(userId, req.body);

    res.status(201).json(
      successResponse(auction, 'Auction created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get auction by ID
 * GET /api/v1/auctions/:id
 */
export const getAuction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const auction = await auctionService.getAuctionById(id, userId);

    res.json(successResponse(auction, 'Auction retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * List auctions with filters
 * GET /api/v1/auctions
 */
export const listAuctions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await auctionService.listAuctions(req.query as any);

    res.json(successResponse(result, 'Auctions retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Place a bid on an auction
 * POST /api/v1/auctions/:id/bids
 */
export const placeBid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const bid = await auctionService.placeBid(id, userId, req.body);

    res.status(201).json(
      successResponse(bid, 'Bid placed successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Buy now (instant purchase)
 * POST /api/v1/auctions/:id/buy-now
 */
export const buyNow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = await auctionService.buyNow(id, userId);

    res.json(
      successResponse(result, 'Item purchased successfully via buy now')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get auction bids
 * GET /api/v1/auctions/:id/bids
 */
export const getAuctionBids = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const result = await auctionService.getAuctionBids(
      id,
      Number(page),
      Number(limit)
    );

    res.json(successResponse(result, 'Auction bids retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel auction
 * DELETE /api/v1/auctions/:id
 */
export const cancelAuction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { reason } = req.body;
    const result = await auctionService.cancelAuction(id, userId, reason);

    res.json(successResponse(result, 'Auction cancelled successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Update auction
 * PATCH /api/v1/auctions/:id
 */
export const updateAuction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const auction = await auctionService.updateAuction(id, userId, req.body);

    res.json(successResponse(auction, 'Auction updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * End auction (manually or scheduled)
 * POST /api/v1/auctions/:id/end
 */
export const endAuction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await auctionService.endAuction(id);

    res.json(successResponse(result, 'Auction ended successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get my auctions
 * GET /api/v1/auctions/my-auctions
 */
export const getMyAuctions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;
    const auctions = await auctionService.getMyAuctions(userId, status as any);

    res.json(successResponse(auctions, 'My auctions retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get my bids
 * GET /api/v1/auctions/my-bids
 */
export const getMyBids = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const bids = await auctionService.getMyBids(userId);

    res.json(successResponse(bids, 'My bids retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
