/**
 * Inventory Routes
 *
 * Endpoints for managing user inventory (Supply & Demand)
 */

import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ============================================
// Public Routes (no authentication required)
// ============================================

/**
 * @route GET /api/v1/inventory/latest
 * @desc Get latest public items for home page
 * @query limit - Number of items (default: 8)
 * @query marketType - Filter by market (NEIGHBORHOOD, GOVERNORATE, NATIONAL, LUXURY)
 * @query governorate - Filter by governorate
 * @access Public
 */
router.get('/latest', inventoryController.getLatestItems);

/**
 * @route GET /api/v1/inventory/markets
 * @desc Get market configuration (fees, limits, etc.)
 * @access Public
 */
router.get('/markets', inventoryController.getMarkets);

/**
 * @route GET /api/v1/inventory/nearby
 * @desc Get nearby items by location
 * @query governorate - Required: Filter by governorate
 * @query city - Optional: Filter by city
 * @query district - Optional: Filter by district
 * @query type - Optional: SUPPLY or DEMAND (default: SUPPLY)
 * @query limit - Optional: Number of items (default: 20)
 * @access Public
 */
router.get('/nearby', inventoryController.getNearbyItems);

/**
 * @route GET /api/v1/inventory/proximity-stats
 * @desc Get proximity matching statistics
 * @access Public
 */
router.get('/proximity-stats', inventoryController.getProximityStats);

// ============================================
// Protected Routes (authentication required)
// ============================================
router.use(authenticate);

/**
 * @route GET /api/v1/inventory
 * @desc Get user's inventory items
 * @access Private
 */
router.get('/', inventoryController.getInventory);

/**
 * @route GET /api/v1/inventory/stats
 * @desc Get inventory statistics
 * @access Private
 */
router.get('/stats', inventoryController.getStats);

/**
 * @route GET /api/v1/inventory/proximity-matches
 * @desc Get proximity matches for user's items (Supply & Demand)
 * @query type - Optional: SUPPLY, DEMAND, or ALL (default: ALL)
 * @query limit - Optional: Number of matches (default: 20)
 * @access Private
 */
router.get('/proximity-matches', inventoryController.getProximityMatches);

/**
 * @route POST /api/v1/inventory
 * @desc Create new inventory item
 * @access Private
 */
router.post('/', inventoryController.createItem);

/**
 * @route PATCH /api/v1/inventory/:id/status
 * @desc Update item status
 * @access Private
 */
router.patch('/:id/status', inventoryController.updateStatus);

/**
 * @route DELETE /api/v1/inventory/:id
 * @desc Delete inventory item
 * @access Private
 */
router.delete('/:id', inventoryController.deleteItem);

/**
 * @route GET /api/v1/inventory/:id/matches
 * @desc Find potential matches for an item
 * @access Private
 */
router.get('/:id/matches', inventoryController.findMatches);

/**
 * @route GET /api/v1/inventory/:id/proximity-matches
 * @desc Get proximity matches for a specific item
 * @query maxResults - Optional: Max results (default: 10)
 * @query minScore - Optional: Min match score (default: 0.3)
 * @access Private
 */
router.get('/:id/proximity-matches', inventoryController.getItemProximityMatches);

export default router;
