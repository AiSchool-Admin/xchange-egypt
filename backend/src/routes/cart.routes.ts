import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
} from '../validations/cart.validation';

const router = Router();

// Debug logging for cart routes
router.use((req, res, next) => {
  console.log(`🛒 Cart route hit: ${req.method} ${req.originalUrl}`);
  console.log('   Headers:', JSON.stringify({
    authorization: req.headers.authorization ? 'Bearer ***' : 'none',
    'content-type': req.headers['content-type'],
  }));
  next();
});

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
router.post('/items', validate(addToCartSchema), cartController.addToCart);

/**
 * Update cart item quantity
 * PUT /api/v1/cart/items/:listingId
 */
router.put('/items/:listingId', validate(updateCartItemSchema), cartController.updateCartItem);

/**
 * Remove item from cart
 * DELETE /api/v1/cart/items/:listingId
 */
router.delete('/items/:listingId', validate(removeFromCartSchema), cartController.removeFromCart);

/**
 * Clear cart
 * DELETE /api/v1/cart
 */
router.delete('/', cartController.clearCart);

export default router;
