import { Request, Response, NextFunction } from 'express';
import * as listingService from '../services/listing.service';
import { successResponse } from '../utils/response';

/**
 * Create a direct sale listing
 * POST /api/v1/listings/sale
 */
export const createSaleListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const listingData = req.body;

    const listing = await listingService.createSaleListing(userId, listingData);

    res.status(201).json(successResponse(listing, 'Listing created successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get listing by ID
 * GET /api/v1/listings/:id
 */
export const getListingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await listingService.getListingById(id);

    res.json(successResponse(listing, 'Listing retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Update a listing
 * PUT /api/v1/listings/:id
 */
export const updateListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData = req.body;

    const listing = await listingService.updateListing(id, userId, updateData);

    res.json(successResponse(listing, 'Listing updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a listing
 * DELETE /api/v1/listings/:id
 */
export const deleteListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await listingService.deleteListing(id, userId);

    res.json(
      successResponse(
        { message: 'Listing deleted successfully' },
        'Listing deleted successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Activate a listing
 * POST /api/v1/listings/:id/activate
 */
export const activateListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const listing = await listingService.activateListing(id, userId);

    res.json(successResponse(listing, 'Listing activated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a listing
 * POST /api/v1/listings/:id/cancel
 */
export const cancelListing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const listing = await listingService.cancelListing(id, userId);

    res.json(successResponse(listing, 'Listing cancelled successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Mark listing as sold
 * POST /api/v1/listings/:id/sold
 */
export const markListingAsSold = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const listing = await listingService.markListingAsSold(id, userId);

    res.json(successResponse(listing, 'Listing marked as sold successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Search listings
 * GET /api/v1/listings/search
 */
export const searchListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const params = req.query;

    const result = await listingService.searchListings(params);

    res.json(successResponse(result, 'Listings retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's listings
 * GET /api/v1/listings/user/:userId
 */
export const getUserListings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { type, status, page, limit } = req.query;

    const result = await listingService.getUserListings(
      userId,
      type as any,
      status as any,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    res.json(successResponse(result, 'User listings retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
