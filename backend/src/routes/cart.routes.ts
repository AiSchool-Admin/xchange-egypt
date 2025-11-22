import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * Get user's cart
 * GET /api/v1/cart
 */
router.get('/', cartController.getCart);

/**
 * Get cart total
 * GET /api/v1/cart/total
 */
router.get('/total', cartController.getCartTotal);

/**
 * Add item to cart
 * POST /api/v1/cart/items
 */
router.post('/items', cartController.addToCart);

/**
 * Update cart item quantity
 * PUT /api/v1/cart/items/:listingId
 */
router.put('/items/:listingId', cartController.updateCartItem);

/**
 * Remove item from cart
 * DELETE /api/v1/cart/items/:listingId
 */
router.delete('/items/:listingId', cartController.removeFromCart);

/**
 * Clear cart
 * DELETE /api/v1/cart
 */
router.delete('/', cartController.clearCart);

export default router;
