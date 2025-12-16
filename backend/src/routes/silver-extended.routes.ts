/**
 * Silver Marketplace Extended Routes
 * مسارات سوق الفضة المتقدمة
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as kycService from '../services/silver-kyc.service';
import * as valuationService from '../services/silver-valuation.service';
import * as reviewsService from '../services/silver-reviews.service';
import * as tradeinService from '../services/silver-tradein.service';
import * as savingsService from '../services/silver-savings.service';
import { successResponse } from '../utils/response';

const router = Router();

// ============================================
// KYC & Verification Routes
// ============================================

// Get KYC status
router.get('/kyc/status', authenticate, async (req, res, next) => {
  try {
    const status = await kycService.getKYCStatus(req.user!.id);
    return successResponse(res, status, 'حالة التحقق');
  } catch (error) {
    next(error);
  }
});

// Submit KYC request
router.post('/kyc/submit', authenticate, async (req, res, next) => {
  try {
    const verification = await kycService.submitKYCRequest(req.user!.id, req.body);
    return successResponse(res, verification, 'تم تقديم طلب التحقق بنجاح', 201);
  } catch (error: any) {
    if (error.message === 'User already verified') {
      return res.status(400).json({ success: false, message: 'تم التحقق من المستخدم بالفعل' });
    }
    if (error.message === 'Verification request already pending') {
      return res.status(400).json({ success: false, message: 'يوجد طلب تحقق قيد المراجعة' });
    }
    next(error);
  }
});

// Get user badges
router.get('/kyc/badges', authenticate, async (req, res, next) => {
  try {
    const badges = await kycService.getUserBadges(req.user!.id);
    return successResponse(res, badges, 'شارات التحقق');
  } catch (error) {
    next(error);
  }
});

// ============================================
// Valuation Routes
// ============================================

// Get valuation levels
router.get('/valuations/levels', async (req, res, next) => {
  try {
    const levels = valuationService.getValuationLevels();
    return successResponse(res, levels, 'مستويات التقييم');
  } catch (error) {
    next(error);
  }
});

// Request valuation
router.post('/valuations/request', authenticate, async (req, res, next) => {
  try {
    const valuation = await valuationService.requestValuation(req.user!.id, req.body);
    return successResponse(res, valuation, 'تم تقديم طلب التقييم بنجاح', 201);
  } catch (error: any) {
    if (error.message === 'Invalid valuation level') {
      return res.status(400).json({ success: false, message: 'مستوى التقييم غير صالح' });
    }
    next(error);
  }
});

// Get user's valuations
router.get('/valuations/my', authenticate, async (req, res, next) => {
  try {
    const valuations = await valuationService.getUserValuations(req.user!.id);
    return successResponse(res, valuations, 'طلبات التقييم');
  } catch (error) {
    next(error);
  }
});

// Get valuation by ID
router.get('/valuations/:id', authenticate, async (req, res, next) => {
  try {
    const valuation = await valuationService.getValuationById(req.params.id, req.user!.id);
    if (!valuation) {
      return res.status(404).json({ success: false, message: 'لم يتم العثور على التقييم' });
    }
    return successResponse(res, valuation, 'تفاصيل التقييم');
  } catch (error) {
    next(error);
  }
});

// ============================================
// Reviews Routes
// ============================================

// Submit review
router.post('/reviews', authenticate, async (req, res, next) => {
  try {
    const review = await reviewsService.submitReview(req.user!.id, req.body);
    return successResponse(res, review, 'تم إضافة التقييم بنجاح', 201);
  } catch (error: any) {
    if (error.message === 'Only buyer can review') {
      return res.status(403).json({ success: false, message: 'المشتري فقط يمكنه التقييم' });
    }
    if (error.message === 'Can only review completed transactions') {
      return res.status(400).json({ success: false, message: 'يمكن التقييم بعد اكتمال المعاملة فقط' });
    }
    if (error.message === 'Already reviewed') {
      return res.status(400).json({ success: false, message: 'تم التقييم بالفعل' });
    }
    next(error);
  }
});

// Get seller reviews
router.get('/reviews/seller/:sellerId', async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await reviewsService.getSellerReviews(sellerId, page, limit, 'silver');
    return successResponse(res, result, 'تقييمات البائع');
  } catch (error) {
    next(error);
  }
});

// Get seller rating summary
router.get('/reviews/seller/:sellerId/summary', async (req, res, next) => {
  try {
    const summary = await reviewsService.getSellerRatingSummary(req.params.sellerId);
    return successResponse(res, summary, 'ملخص التقييمات');
  } catch (error) {
    next(error);
  }
});

// Respond to review (seller)
router.post('/reviews/:id/respond', authenticate, async (req, res, next) => {
  try {
    const review = await reviewsService.respondToReview(
      req.params.id,
      req.user!.id,
      req.body.response
    );
    return successResponse(res, review, 'تم إضافة الرد بنجاح');
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ success: false, message: 'غير مصرح' });
    }
    next(error);
  }
});

// Report review
router.post('/reviews/:id/report', authenticate, async (req, res, next) => {
  try {
    const review = await reviewsService.reportReview(
      req.params.id,
      req.user!.id,
      req.body.reason
    );
    return successResponse(res, review, 'تم الإبلاغ عن التقييم');
  } catch (error) {
    next(error);
  }
});

// ============================================
// Trade-In Routes
// ============================================

// Calculate trade-in value
router.post('/trade-in/calculate', async (req, res, next) => {
  try {
    const { purity, weightGrams, condition } = req.body;
    const value = await tradeinService.calculateTradeInValue(purity, weightGrams, condition);
    return successResponse(res, value, 'تقدير قيمة الاستبدال');
  } catch (error) {
    next(error);
  }
});

// Request trade-in
router.post('/trade-in/request', authenticate, async (req, res, next) => {
  try {
    const tradeIn = await tradeinService.requestTradeIn(req.user!.id, req.body);
    return successResponse(res, tradeIn, 'تم تقديم طلب الاستبدال بنجاح', 201);
  } catch (error: any) {
    if (error.message === 'Target item not available') {
      return res.status(400).json({ success: false, message: 'القطعة المستهدفة غير متاحة' });
    }
    next(error);
  }
});

// Get user's trade-ins
router.get('/trade-in/my', authenticate, async (req, res, next) => {
  try {
    const tradeIns = await tradeinService.getUserTradeIns(req.user!.id);
    return successResponse(res, tradeIns, 'طلبات الاستبدال');
  } catch (error) {
    next(error);
  }
});

// Get trade-in by ID
router.get('/trade-in/:id', authenticate, async (req, res, next) => {
  try {
    const tradeIn = await tradeinService.getTradeInById(req.params.id, req.user!.id);
    if (!tradeIn) {
      return res.status(404).json({ success: false, message: 'لم يتم العثور على طلب الاستبدال' });
    }
    return successResponse(res, tradeIn, 'تفاصيل طلب الاستبدال');
  } catch (error) {
    next(error);
  }
});

// Accept trade-in offer
router.post('/trade-in/:id/accept', authenticate, async (req, res, next) => {
  try {
    const tradeIn = await tradeinService.acceptTradeInOffer(req.params.id, req.user!.id);
    return successResponse(res, tradeIn, 'تم قبول العرض');
  } catch (error: any) {
    if (error.message === 'No offer to accept') {
      return res.status(400).json({ success: false, message: 'لا يوجد عرض للقبول' });
    }
    next(error);
  }
});

// ============================================
// Savings Account Routes
// ============================================

// Create savings account
router.post('/savings/create', authenticate, async (req, res, next) => {
  try {
    const account = await savingsService.createSavingsAccount(req.user!.id, req.body);
    return successResponse(res, account, 'تم إنشاء حساب التوفير بنجاح', 201);
  } catch (error: any) {
    if (error.message === 'User already has an active savings account') {
      return res.status(400).json({ success: false, message: 'لديك حساب توفير نشط بالفعل' });
    }
    next(error);
  }
});

// Get savings account
router.get('/savings/my', authenticate, async (req, res, next) => {
  try {
    const account = await savingsService.getSavingsAccount(req.user!.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'لا يوجد حساب توفير', data: null });
    }
    return successResponse(res, account, 'حساب التوفير');
  } catch (error) {
    next(error);
  }
});

// Deposit to savings
router.post('/savings/:accountId/deposit', authenticate, async (req, res, next) => {
  try {
    const result = await savingsService.deposit(req.user!.id, req.params.accountId, req.body);
    return successResponse(res, result, 'تم الإيداع بنجاح');
  } catch (error: any) {
    if (error.message.includes('Minimum deposit')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message === 'Account not found') {
      return res.status(404).json({ success: false, message: 'لم يتم العثور على الحساب' });
    }
    next(error);
  }
});

// Request withdrawal
router.post('/savings/:accountId/withdraw', authenticate, async (req, res, next) => {
  try {
    const result = await savingsService.requestWithdrawal(req.user!.id, req.params.accountId, req.body);
    return successResponse(res, result, 'تم تقديم طلب السحب');
  } catch (error: any) {
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ success: false, message: 'رصيد غير كافٍ' });
    }
    next(error);
  }
});

// Get account history
router.get('/savings/:accountId/history', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await savingsService.getAccountHistory(req.user!.id, req.params.accountId, page, limit);
    return successResponse(res, result, 'سجل العمليات');
  } catch (error) {
    next(error);
  }
});

// Get price history for charts
router.get('/savings/price-history', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const history = await savingsService.getPriceHistory(days);
    return successResponse(res, history, 'تاريخ الأسعار');
  } catch (error) {
    next(error);
  }
});

// Calculate projected growth
router.post('/savings/projection', async (req, res, next) => {
  try {
    const { currentGrams, monthlyDeposit, months } = req.body;
    const projection = await savingsService.calculateProjectedGrowth(
      currentGrams || 0,
      monthlyDeposit || 0,
      months || 12
    );
    return successResponse(res, projection, 'توقع النمو');
  } catch (error) {
    next(error);
  }
});

// ============================================
// Compare Items Route
// ============================================

router.post('/compare', async (req, res, next) => {
  try {
    const { itemIds } = req.body;

    if (!Array.isArray(itemIds) || itemIds.length < 2 || itemIds.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد 2-5 قطع للمقارنة',
      });
    }

    // Import silver service
    const silverService = require('../services/silver.service');

    const items = await Promise.all(
      itemIds.map((id: string) => silverService.getSilverItemById(id))
    );

    const validItems = items.filter((item: any) => item !== null);

    return successResponse(res, validItems, 'مقارنة القطع');
  } catch (error) {
    next(error);
  }
});

export default router;
