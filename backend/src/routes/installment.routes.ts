import { Router } from 'express';
import * as installmentController from '../controllers/installment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// ============================================
// Installment Service Routes - مسارات خدمة التقسيط
// ============================================

/**
 * Get available installment plans for an amount
 * GET /api/v1/installments/plans
 * Query: amount
 */
router.get(
  '/plans',
  installmentController.getInstallmentPlans
);

/**
 * Calculate specific installment plan
 * POST /api/v1/installments/calculate
 * Body: { amount, provider, months, downPayment? }
 */
router.post(
  '/calculate',
  installmentController.calculateInstallment
);

/**
 * Check item eligibility for installment
 * GET /api/v1/installments/eligibility/:itemId
 */
router.get(
  '/eligibility/:itemId',
  installmentController.checkItemEligibility
);

/**
 * Get user's installment requests
 * GET /api/v1/installments/requests/my
 */
router.get(
  '/requests/my',
  authenticate,
  installmentController.getUserInstallmentRequests
);

/**
 * Create installment request
 * POST /api/v1/installments/requests
 * Body: { itemId, provider, totalAmount, downPayment, numberOfMonths, phoneNumber, nationalId?, monthlyIncome?, employerName? }
 */
router.post(
  '/requests',
  authenticate,
  installmentController.createInstallmentRequest
);

export default router;
