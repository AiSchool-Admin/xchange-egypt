import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getPaymentMethodsSchema,
  calculateFeesSchema,
  initiatePaymentSchema,
  checkPaymentStatusSchema,
  processRefundSchema,
  initiateInstapaySchema,
  verifyInstapaySchema,
  createFawryPaymentSchema,
  checkFawryStatusSchema,
  initiatePaymobCardSchema,
  initiatePaymobWalletSchema,
  initiatePaymobKioskSchema,
  getPaymobStatusSchema,
  refundPaymobSchema,
  initiateVodafoneCashSchema,
  checkVodafoneCashStatusSchema,
  refundVodafoneCashSchema,
  confirmCodSchema,
  markCodCollectedSchema,
} from '../validations/payment.validation';

const router = Router();

/**
 * =====================================================
 * UNIFIED PAYMENT GATEWAY ROUTES
 * مسارات بوابة الدفع الموحدة
 * =====================================================
 */

/**
 * Get available payment methods
 * GET /api/v1/payment/methods
 */
router.get('/methods', optionalAuth, validate(getPaymentMethodsSchema), paymentController.getPaymentMethods);

/**
 * Calculate payment fees
 * GET /api/v1/payment/fees
 */
router.get('/fees', validate(calculateFeesSchema), paymentController.calculateFees);

/**
 * Initiate payment (unified endpoint)
 * POST /api/v1/payment/initiate
 */
router.post('/initiate', authenticate, validate(initiatePaymentSchema), paymentController.initiatePayment);

/**
 * Check payment status
 * GET /api/v1/payment/status/:transactionId
 */
router.get('/status/:transactionId', authenticate, validate(checkPaymentStatusSchema), paymentController.checkPaymentStatus);

/**
 * Process refund
 * POST /api/v1/payment/refund
 */
router.post('/refund', authenticate, validate(processRefundSchema), paymentController.processRefund);

/**
 * =====================================================
 * INSTAPAY ROUTES
 * مسارات إنستاباي
 * =====================================================
 */

/**
 * Initiate InstaPay payment
 * POST /api/v1/payment/instapay/initiate
 */
router.post('/instapay/initiate', authenticate, validate(initiateInstapaySchema), paymentController.initiateInstapay);

/**
 * Verify InstaPay payment
 * GET /api/v1/payment/instapay/verify/:transactionId
 */
router.get('/instapay/verify/:transactionId', validate(verifyInstapaySchema), paymentController.verifyInstapay);

/**
 * InstaPay callback (webhook)
 * POST /api/v1/payment/instapay/callback
 */
router.post('/instapay/callback', paymentController.instapayCallback);

/**
 * =====================================================
 * FAWRY ROUTES
 * مسارات فوري
 * =====================================================
 */

/**
 * Create Fawry payment reference
 * POST /api/v1/payment/fawry/create
 */
router.post('/fawry/create', authenticate, validate(createFawryPaymentSchema), paymentController.createFawryPayment);

/**
 * Check Fawry payment status
 * GET /api/v1/payment/fawry/status/:referenceNumber
 */
router.get('/fawry/status/:referenceNumber', validate(checkFawryStatusSchema), paymentController.checkFawryStatus);

/**
 * Fawry callback (webhook)
 * POST /api/v1/payment/fawry/callback
 */
router.post('/fawry/callback', paymentController.fawryCallback);

/**
 * =====================================================
 * PAYMOB ROUTES
 * مسارات باي موب
 * =====================================================
 */

/**
 * Initiate Paymob card payment
 * POST /api/v1/payment/paymob/card
 */
router.post('/paymob/card', authenticate, validate(initiatePaymobCardSchema), paymentController.initiatePaymobCard);

/**
 * Initiate Paymob wallet payment
 * POST /api/v1/payment/paymob/wallet
 */
router.post('/paymob/wallet', authenticate, validate(initiatePaymobWalletSchema), paymentController.initiatePaymobWallet);

/**
 * Initiate Paymob kiosk payment (Aman/Masary)
 * POST /api/v1/payment/paymob/kiosk
 */
router.post('/paymob/kiosk', authenticate, validate(initiatePaymobKioskSchema), paymentController.initiatePaymobKiosk);

/**
 * Check Paymob transaction status
 * GET /api/v1/payment/paymob/status/:transactionId
 */
router.get('/paymob/status/:transactionId', authenticate, validate(getPaymobStatusSchema), paymentController.getPaymobStatus);

/**
 * Paymob callback (webhook)
 * POST /api/v1/payment/paymob/callback
 */
router.post('/paymob/callback', paymentController.paymobCallback);

/**
 * Refund Paymob transaction
 * POST /api/v1/payment/paymob/refund
 */
router.post('/paymob/refund', authenticate, validate(refundPaymobSchema), paymentController.refundPaymob);

/**
 * =====================================================
 * VODAFONE CASH ROUTES
 * مسارات فودافون كاش
 * =====================================================
 */

/**
 * Initiate Vodafone Cash payment
 * POST /api/v1/payment/vodafone/initiate
 */
router.post('/vodafone/initiate', authenticate, validate(initiateVodafoneCashSchema), paymentController.initiateVodafoneCash);

/**
 * Check Vodafone Cash payment status
 * GET /api/v1/payment/vodafone/status/:transactionId
 */
router.get('/vodafone/status/:transactionId', authenticate, validate(checkVodafoneCashStatusSchema), paymentController.checkVodafoneCashStatus);

/**
 * Vodafone Cash callback (webhook)
 * POST /api/v1/payment/vodafone/callback
 */
router.post('/vodafone/callback', paymentController.vodafoneCashCallback);

/**
 * Refund Vodafone Cash payment
 * POST /api/v1/payment/vodafone/refund
 */
router.post('/vodafone/refund', authenticate, validate(refundVodafoneCashSchema), paymentController.refundVodafoneCash);

/**
 * Get Vodafone Cash merchant balance (admin only)
 * GET /api/v1/payment/vodafone/balance
 */
router.get('/vodafone/balance', authenticate, paymentController.getVodafoneCashBalance);

/**
 * =====================================================
 * CASH ON DELIVERY ROUTES
 * مسارات الدفع عند الاستلام
 * =====================================================
 */

/**
 * Confirm Cash on Delivery order
 * POST /api/v1/payment/cod/confirm
 */
router.post('/cod/confirm', authenticate, validate(confirmCodSchema), paymentController.confirmCashOnDelivery);

/**
 * Mark COD as collected (for delivery personnel)
 * POST /api/v1/payment/cod/collected
 */
router.post('/cod/collected', authenticate, validate(markCodCollectedSchema), paymentController.markCodCollected);

export default router;
