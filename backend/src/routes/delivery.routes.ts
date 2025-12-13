import { Router } from 'express';
import * as deliveryController from '../controllers/delivery.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// ============================================
// Delivery Service Routes - مسارات خدمة التوصيل
// ============================================

/**
 * Get delivery options for a route
 * POST /api/v1/delivery/options
 * Body: { pickupGovernorate, pickupCity, deliveryGovernorate, deliveryCity, packageWeight?, isCOD? }
 */
router.post(
  '/options',
  deliveryController.getDeliveryOptions
);

/**
 * Get user's delivery bookings
 * GET /api/v1/delivery/bookings/my
 * Query: type (sent|received), page, limit
 */
router.get(
  '/bookings/my',
  authenticate,
  deliveryController.getUserBookings
);

/**
 * Get booking by ID
 * GET /api/v1/delivery/bookings/:id
 */
router.get(
  '/bookings/:id',
  authenticate,
  deliveryController.getBooking
);

/**
 * Create a delivery booking
 * POST /api/v1/delivery/bookings
 */
router.post(
  '/bookings',
  authenticate,
  deliveryController.createBooking
);

/**
 * Cancel booking
 * POST /api/v1/delivery/bookings/:id/cancel
 */
router.post(
  '/bookings/:id/cancel',
  authenticate,
  deliveryController.cancelBooking
);

/**
 * Update booking status (webhook for delivery providers)
 * POST /api/v1/delivery/webhook/status
 * Note: In production, this should have provider-specific authentication
 */
router.post(
  '/webhook/status',
  deliveryController.updateBookingStatus
);

export default router;
