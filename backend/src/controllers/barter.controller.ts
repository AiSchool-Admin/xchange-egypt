import { Request, Response, NextFunction } from 'express';
import * as barterService from '../services/barter.service';
import * as bundleService from '../services/barter-bundle.service';
import { successResponse } from '../utils/response';

/**
 * Create a barter offer (with bundle & preferences support)
 * POST /api/v1/barter/offers
 */
export const createBarterOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const initiatorId = req.user!.id;
    const offerData = req.body;

    // Use new bundle service
    const offer = await bundleService.createBundleOffer(initiatorId, offerData);

    res.status(201).json(successResponse(offer, 'Barter offer created successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get barter offer by ID
 * GET /api/v1/barter/offers/:offerId
 */
export const getBarterOfferById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { offerId } = req.params;
    const userId = req.user!.id;

    const offer = await barterService.getBarterOfferById(offerId, userId);

    res.json(successResponse(offer, 'Barter offer retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Accept a barter offer
 * POST /api/v1/barter/offers/:offerId/accept
 */
export const acceptBarterOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { offerId } = req.params;
    const userId = req.user!.id;

    const offer = await barterService.acceptBarterOffer(offerId, userId);

    res.json(successResponse(offer, 'Barter offer accepted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a barter offer
 * POST /api/v1/barter/offers/:offerId/reject
 */
export const rejectBarterOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { offerId } = req.params;
    const userId = req.user!.id;
    const { reason } = req.body;

    const offer = await barterService.rejectBarterOffer(offerId, userId, reason);

    res.json(successResponse(offer, 'Barter offer rejected successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Create a counter offer
 * POST /api/v1/barter/offers/:offerId/counter
 */
export const createCounterOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { offerId } = req.params;
    const userId = req.user!.id;
    const counterOfferData = req.body;

    const offer = await barterService.createCounterOffer(offerId, userId, counterOfferData);

    res.json(successResponse(offer, 'Counter offer created successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a barter offer
 * POST /api/v1/barter/offers/:offerId/cancel
 */
export const cancelBarterOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { offerId } = req.params;
    const userId = req.user!.id;

    const offer = await barterService.cancelBarterOffer(offerId, userId);

    res.json(successResponse(offer, 'Barter offer cancelled successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get my barter offers
 * GET /api/v1/barter/offers/my
 */
export const getMyBarterOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { type, status, page, limit } = req.query;

    const result = await barterService.getMyBarterOffers(
      userId,
      type as any,
      status as any,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    res.json(successResponse(result, 'Barter offers retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Search barterable items
 * GET /api/v1/barter/items
 */
export const searchBarterableItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const params = {
      ...req.query,
      userId,
    };

    const result = await barterService.searchBarterableItems(params);

    res.json(successResponse(result, 'Barterable items retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Find barter matches for an item
 * GET /api/v1/barter/matches/:itemId
 */
export const findBarterMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { itemId } = req.params;
    const userId = req.user!.id;
    const { categoryId } = req.query;

    const matches = await barterService.findBarterMatches(
      itemId,
      userId,
      categoryId as string
    );

    res.json(successResponse(matches, 'Barter matches found successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Complete barter exchange
 * POST /api/v1/barter/offers/:offerId/complete
 */
export const completeBarterExchange = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { offerId } = req.params;
    const userId = req.user!.id;
    const { confirmationNotes } = req.body;

    const offer = await barterService.completeBarterExchange(
      offerId,
      userId,
      confirmationNotes
    );

    res.json(successResponse(offer, 'Barter exchange completed successfully'));
  } catch (error) {
    next(error);
  }
};

// ============================================
// Bundle & Preference-specific Controllers
// ============================================

/**
 * Get matching offers for user's items
 * GET /api/v1/barter/offers/matching
 */
export const getMatchingOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page, limit } = req.query;

    const matches = await bundleService.findMatchingOffersForUser(
      userId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    res.json(successResponse(matches, 'Matching offers found successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get best match for a specific offer
 * GET /api/v1/barter/offers/:offerId/best-match
 */
export const getBestMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { offerId } = req.params;
    const userId = req.user!.id;

    const bestMatch = await bundleService.getBestMatchingPreferenceSet(offerId, userId);

    if (!bestMatch) {
      res.json(
        successResponse(
          null,
          'No matching preference set found. You do not own the required items.'
        )
      );
    } else {
      res.json(successResponse(bestMatch, 'Best match found successfully'));
    }
  } catch (error) {
    next(error);
  }
};
