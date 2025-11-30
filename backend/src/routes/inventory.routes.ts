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
 * @access Public
 */
router.get('/latest', inventoryController.getLatestItems);

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

export default router;
