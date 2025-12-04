import { Request, Response, NextFunction } from 'express';
import * as flashDealsService from '../services/flash-deals.service';
import { successResponse } from '../utils/response';

/**
 * Get active flash deals
 * GET /api/v1/flash-deals/active
 */
export const getActiveDeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deals = await flashDealsService.getActiveDeals();
    return successResponse(res, { deals }, 'Active deals retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get upcoming flash deals
 * GET /api/v1/flash-deals/upcoming
 */
export const getUpcomingDeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deals = await flashDealsService.getUpcomingDeals();
    return successResponse(res, { deals }, 'Upcoming deals retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get flash deal by ID
 * GET /api/v1/flash-deals/:id
 */
export const getDeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deal = await flashDealsService.getFlashDeal(id);
    return successResponse(res, deal, 'Deal retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Claim a flash deal
 * POST /api/v1/flash-deals/:id/claim
 */
export const claimDeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const claim = await flashDealsService.claimDeal(id, userId);
    return successResponse(res, claim, 'Deal claimed successfully! Complete payment within 15 minutes.', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Complete a claim (after payment)
 * POST /api/v1/flash-deals/claims/:claimId/complete
 */
export const completeClaim = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { claimId } = req.params;
    const userId = req.user!.id;
    const result = await flashDealsService.completeClaim(claimId, userId);
    return successResponse(res, result, 'Claim completed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a claim
 * DELETE /api/v1/flash-deals/claims/:claimId
 */
export const cancelClaim = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { claimId } = req.params;
    const userId = req.user!.id;
    const result = await flashDealsService.cancelClaim(claimId, userId);
    return successResponse(res, result, 'Claim cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get my claims
 * GET /api/v1/flash-deals/my-claims
 */
export const getMyClaims = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const claims = await flashDealsService.getUserClaims(userId);
    return successResponse(res, { claims }, 'Claims retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a flash deal (Seller/Admin)
 * POST /api/v1/flash-deals
 */
export const createDeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const deal = await flashDealsService.createFlashDeal({
      ...req.body,
      sellerId: userId,
    });
    return successResponse(res, deal, 'Flash deal created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a flash deal
 * DELETE /api/v1/flash-deals/:id
 */
export const cancelDeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = await flashDealsService.cancelDeal(id, userId);
    return successResponse(res, result, 'Flash deal cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get seller's flash deals
 * GET /api/v1/flash-deals/my-deals
 */
export const getMyDeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const deals = await flashDealsService.getSellerDeals(userId);
    return successResponse(res, { deals }, 'Seller deals retrieved successfully');
  } catch (error) {
    next(error);
  }
};
