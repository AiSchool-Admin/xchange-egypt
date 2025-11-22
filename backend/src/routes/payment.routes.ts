import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// InstaPay routes
/**
 * Initiate InstaPay payment
 * POST /api/v1/payment/instapay/initiate
 */
router.post('/instapay/initiate', authenticate, paymentController.initiateInstapay);

/**
 * Verify InstaPay payment
 * GET /api/v1/payment/instapay/verify/:transactionId
 */
router.get('/instapay/verify/:transactionId', paymentController.verifyInstapay);

/**
 * InstaPay callback (webhook)
 * POST /api/v1/payment/instapay/callback
 */
router.post('/instapay/callback', paymentController.instapayCallback);

// Fawry routes
/**
 * Create Fawry payment reference
 * POST /api/v1/payment/fawry/create
 */
router.post('/fawry/create', authenticate, paymentController.createFawryPayment);

/**
 * Check Fawry payment status
 * GET /api/v1/payment/fawry/status/:referenceNumber
 */
router.get('/fawry/status/:referenceNumber', paymentController.checkFawryStatus);

/**
 * Fawry callback (webhook)
 * POST /api/v1/payment/fawry/callback
 */
router.post('/fawry/callback', paymentController.fawryCallback);

export default router;
