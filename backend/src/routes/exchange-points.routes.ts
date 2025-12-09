import { Router } from 'express';
import { exchangePointsController } from '../controllers/exchange-points.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// ============================================
// Public Routes - Specific paths BEFORE /:id
// ============================================

router.get('/', exchangePointsController.getExchangePoints);
router.get('/governorates', exchangePointsController.getGovernorates);
router.get('/nearby', exchangePointsController.getNearbyPoints);

// ============================================
// Protected Routes - Specific paths BEFORE /:id
// ============================================

router.use(authenticate);

// Bookings (must be before /:id to avoid conflict)
router.post('/bookings', exchangePointsController.createBooking);
router.get('/bookings/my', exchangePointsController.getMyBookings);
router.post('/bookings/:id/confirm', exchangePointsController.confirmBooking);
router.post('/bookings/:id/check-in', exchangePointsController.checkIn);
router.post('/bookings/:id/complete', exchangePointsController.completeBooking);
router.post('/bookings/:id/cancel', exchangePointsController.cancelBooking);

// ============================================
// Routes with :id parameter (MUST BE LAST)
// ============================================

router.get('/:id', exchangePointsController.getExchangePoint);
router.get('/:id/slots', exchangePointsController.getAvailableSlots);
router.post('/:id/reviews', exchangePointsController.addReview);

export default router;
