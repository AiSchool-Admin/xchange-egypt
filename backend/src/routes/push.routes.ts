import { Router } from 'express';
import * as pushController from '../controllers/push.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All push routes require authentication
router.use(authenticate);

/**
 * Subscribe to push notifications
 * POST /api/v1/push/subscribe
 */
router.post('/subscribe', pushController.subscribe);

/**
 * Unsubscribe from push notifications
 * POST /api/v1/push/unsubscribe
 */
router.post('/unsubscribe', pushController.unsubscribe);

/**
 * Get user's push subscriptions
 * GET /api/v1/push/subscriptions
 */
router.get('/subscriptions', pushController.getSubscriptions);

/**
 * Check if user has push enabled
 * GET /api/v1/push/status
 */
router.get('/status', pushController.getStatus);

export default router;
