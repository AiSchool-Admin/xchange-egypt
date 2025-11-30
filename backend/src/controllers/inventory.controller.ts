/**
 * Inventory Controller
 *
 * HTTP handlers for inventory management endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as inventoryService from '../services/inventory.service';
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
 */
export const getLatestItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit } = req.query;

    const result = await inventoryService.getLatestPublicItems({
      limit: limit ? parseInt(limit as string) : 8,
    });

    return successResponse(res, result, 'Latest items retrieved successfully');
  } catch (error) {
    next(error);
  }
};
