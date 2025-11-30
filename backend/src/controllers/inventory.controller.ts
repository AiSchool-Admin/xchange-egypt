/**
 * Inventory Controller
 *
 * HTTP handlers for inventory management endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as inventoryService from '../services/inventory.service';
import * as proximityService from '../services/proximity-matching.service';
import { successResponse } from '../utils/response';

/**
 * Get user's inventory
 * GET /api/v1/inventory
 */
export const getInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { side, type, status, page, limit } = req.query;

    const result = await inventoryService.getUserInventory(userId, {
      side: side as any,
      type: type as any,
      status: status as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    return successResponse(res, result, 'Inventory retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get inventory stats
 * GET /api/v1/inventory/stats
 */
export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const stats = await inventoryService.getInventoryStats(userId);

    return successResponse(res, stats, 'Stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create inventory item
 * POST /api/v1/inventory
 */
export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const input = req.body;

    const item = await inventoryService.createInventoryItem(userId, input);

    return successResponse(res, item, 'Item created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update inventory item status
 * PATCH /api/v1/inventory/:id/status
 */
export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;

    const item = await inventoryService.updateInventoryItemStatus(id, userId, status);

    return successResponse(res, item, 'Status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete inventory item
 * DELETE /api/v1/inventory/:id
 */
export const deleteItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await inventoryService.deleteInventoryItem(id, userId);

    return successResponse(res, null, 'Item deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Find matches for inventory item
 * GET /api/v1/inventory/:id/matches
 */
export const findMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const matches = await inventoryService.findMatchesForItem(id, userId);

    return successResponse(res, { matches }, 'Matches found successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get latest public items for home page (no auth required)
 * GET /api/v1/inventory/latest
 * Query params: limit, marketType, governorate
 */
export const getLatestItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit, marketType, governorate } = req.query;

    const result = await inventoryService.getLatestPublicItems({
      limit: limit ? parseInt(limit as string) : 8,
      marketType: marketType as any,
      governorate: governorate as string,
    });

    return successResponse(res, result, 'Latest items retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get market configuration
 * GET /api/v1/inventory/markets
 */
export const getMarkets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const markets = inventoryService.MARKET_CONFIG;
    return successResponse(res, markets, 'Markets retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Proximity Matching Endpoints
// ============================================

/**
 * Get proximity matches for user's items
 * GET /api/v1/inventory/proximity-matches
 * Query: type (SUPPLY|DEMAND|ALL), limit
 */
export const getProximityMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { type, limit } = req.query;

    const matches = await proximityService.getMatchesForUser(userId, {
      type: type as 'SUPPLY' | 'DEMAND' | 'ALL',
      limit: limit ? parseInt(limit as string) : 20,
    });

    return successResponse(res, matches, 'Proximity matches retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get proximity matches for a specific item
 * GET /api/v1/inventory/:id/proximity-matches
 * Query: maxResults, minScore
 */
export const getItemProximityMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { maxResults, minScore } = req.query;

    const matches = await proximityService.findMatchesForSupply(id, {
      maxResults: maxResults ? parseInt(maxResults as string) : 10,
      minScore: minScore ? parseFloat(minScore as string) : 0.3,
    });

    return successResponse(res, { matches, count: matches.length }, 'Item proximity matches retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get nearby items by location (public)
 * GET /api/v1/inventory/nearby
 * Query: governorate (required), city, district, type, limit
 */
export const getNearbyItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { governorate, city, district, type, limit } = req.query;

    if (!governorate) {
      return res.status(400).json({
        success: false,
        message: 'Governorate is required',
      });
    }

    const items = await proximityService.getNearbyItems(
      governorate as string,
      city as string | undefined,
      district as string | undefined,
      {
        type: type as 'SUPPLY' | 'DEMAND',
        limit: limit ? parseInt(limit as string) : 20,
      }
    );

    return successResponse(res, { items, count: items.length }, 'Nearby items retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get proximity matching stats
 * GET /api/v1/inventory/proximity-stats
 */
export const getProximityStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await proximityService.getProximityMatchingStats();
    return successResponse(res, stats, 'Proximity stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};
