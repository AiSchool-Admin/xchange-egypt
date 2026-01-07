import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
/**
 * Get Egyptian governorates with shipping costs
 * GET /api/v1/orders/governorates
 */
router.get('/governorates', orderController.getGovernorates);

// Protected routes
router.use(authenticate);

/**
 * Get seller's orders (orders containing items sold by this user)
 * GET /api/v1/orders/seller
 */
router.get('/seller', orderController.getSellerOrders);

/**
 * Update order status (for sellers)
 * PUT /api/v1/orders/seller/:orderId/status
 */
router.put('/seller/:orderId/status', orderController.updateSellerOrderStatus);

/**
 * Get shipping addresses
 * GET /api/v1/orders/addresses
 */
router.get('/addresses', orderController.getShippingAddresses);

/**
 * Create shipping address
 * POST /api/v1/orders/addresses
 */
router.post('/addresses', orderController.createShippingAddress);

/**
 * Update shipping address
 * PUT /api/v1/orders/addresses/:addressId
 */
router.put('/addresses/:addressId', orderController.updateShippingAddress);

/**
 * Delete shipping address
 * DELETE /api/v1/orders/addresses/:addressId
 */
router.delete('/addresses/:addressId', orderController.deleteShippingAddress);

/**
 * Get user's orders
 * GET /api/v1/orders
 */
router.get('/', orderController.getMyOrders);

/**
 * Create order from cart
 * POST /api/v1/orders
 */
router.post('/', orderController.createOrder);

/**
 * Create order from auction win
 * POST /api/v1/orders/auction
 */
router.post('/auction', orderController.createAuctionOrder);

/**
 * Get order by ID
 * GET /api/v1/orders/:orderId
 */
router.get('/:orderId', orderController.getOrderById);

/**
 * Cancel order
 * POST /api/v1/orders/:orderId/cancel
 */
router.post('/:orderId/cancel', orderController.cancelOrder);

export default router;
