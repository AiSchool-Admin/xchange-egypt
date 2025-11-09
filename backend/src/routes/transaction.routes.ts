import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createPurchaseSchema,
  updateTransactionStatusSchema,
  confirmPaymentSchema,
  markAsShippedSchema,
  markAsDeliveredSchema,
  cancelTransactionSchema,
  getTransactionByIdSchema,
  getUserTransactionsSchema,
  getMyTransactionsSchema,
} from '../validations/transaction.validation';

const router = Router();

// All transaction routes require authentication

/**
 * Get my transactions (authenticated user)
 * GET /api/v1/transactions/my
 */
router.get(
  '/my',
  authenticate,
  validate(getMyTransactionsSchema),
  transactionController.getMyTransactions
);

/**
 * Create a purchase transaction
 * POST /api/v1/transactions/purchase
 */
router.post(
  '/purchase',
  authenticate,
  validate(createPurchaseSchema),
  transactionController.createPurchase
);

/**
 * Get user transactions
 * GET /api/v1/transactions/user/:userId
 */
router.get(
  '/user/:userId',
  authenticate,
  validate(getUserTransactionsSchema),
  transactionController.getUserTransactions
);

/**
 * Get transaction by ID
 * GET /api/v1/transactions/:id
 */
router.get(
  '/:id',
  authenticate,
  validate(getTransactionByIdSchema),
  transactionController.getTransactionById
);

/**
 * Update transaction status
 * PUT /api/v1/transactions/:id/status
 */
router.put(
  '/:id/status',
  authenticate,
  validate(updateTransactionStatusSchema),
  transactionController.updateTransactionStatus
);

/**
 * Confirm payment for a transaction
 * POST /api/v1/transactions/:id/confirm-payment
 */
router.post(
  '/:id/confirm-payment',
  authenticate,
  validate(confirmPaymentSchema),
  transactionController.confirmPayment
);

/**
 * Mark transaction as shipped
 * POST /api/v1/transactions/:id/ship
 */
router.post(
  '/:id/ship',
  authenticate,
  validate(markAsShippedSchema),
  transactionController.markAsShipped
);

/**
 * Mark transaction as delivered
 * POST /api/v1/transactions/:id/deliver
 */
router.post(
  '/:id/deliver',
  authenticate,
  validate(markAsDeliveredSchema),
  transactionController.markAsDelivered
);

/**
 * Cancel transaction
 * POST /api/v1/transactions/:id/cancel
 */
router.post(
  '/:id/cancel',
  authenticate,
  validate(cancelTransactionSchema),
  transactionController.cancelTransaction
);

export default router;
