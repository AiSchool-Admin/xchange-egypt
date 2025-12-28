/**
 * Inventory Controller
 *
 * HTTP handlers for inventory management endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as inventoryService from '../services/inventory.service';
import * as proximityService from '../services/proximity-matching.service';
import { successResponse, errorResponse } from '../utils/response';

// Helper to safely get user ID from request
const getUserId = (req: Request): string | null => req.user?.id || null;

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
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
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
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
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
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
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
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
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
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
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
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
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
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
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

// ============================================
// Stock Management Endpoints
// ============================================

/**
 * Adjust stock for an item
 * POST /api/v1/inventory/:id/stock/adjust
 */
export const adjustStock = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { id } = req.params;
    const { type, quantityChange, reason, notes, unitCost } = req.body;

    const result = await inventoryService.adjustStock(userId, {
      itemId: id,
      type,
      quantityChange,
      reason,
      notes,
      unitCost,
    });

    return successResponse(res, result, 'تم تعديل المخزون بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get stock adjustment history for an item
 * GET /api/v1/inventory/:id/stock/adjustments
 */
export const getStockAdjustments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { id } = req.params;
    const { page, limit } = req.query;

    const result = await inventoryService.getStockAdjustments(userId, id, {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    return successResponse(res, result, 'تم استرجاع سجل التعديلات بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk import items for merchants
 * POST /api/v1/inventory/bulk-import
 */
export const bulkImport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب توفير قائمة الأصناف للاستيراد',
      });
    }

    if (items.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'الحد الأقصى للاستيراد 100 صنف في المرة الواحدة',
      });
    }

    const result = await inventoryService.bulkImportItems(userId, items);

    return successResponse(res, result, `تم استيراد ${result.success} صنف بنجاح`);
  } catch (error) {
    next(error);
  }
};

/**
 * Get items with low or negative stock
 * GET /api/v1/inventory/low-stock
 */
export const getLowStock = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { includeNegative, page, limit } = req.query;

    const result = await inventoryService.getLowStockItems(userId, {
      includeNegative: includeNegative !== 'false',
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    return successResponse(res, result, 'تم استرجاع المخزون المنخفض بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Update stock settings for an item
 * PATCH /api/v1/inventory/:id/stock/settings
 */
export const updateStockSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { id } = req.params;
    const { trackInventory, allowNegativeStock, lowStockThreshold, sku, barcode } = req.body;

    const result = await inventoryService.updateStockSettings(userId, id, {
      trackInventory,
      allowNegativeStock,
      lowStockThreshold,
      sku,
      barcode,
    });

    return successResponse(res, result, 'تم تحديث إعدادات المخزون بنجاح');
  } catch (error) {
    next(error);
  }
};
