import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
  createScrapItem,
  getScrapItems,
  getScrapItemDetails,
  registerScrapDealer,
  getScrapDealers,
  getDealerDetails,
  getMetalPrices,
  addMetalPrice,
  getMetalPriceHistory,
  createPurchaseRequest,
  getPurchaseRequests,
  submitSellerOffer,
  getRequestOffers,
  acceptOffer,
  getMarketStats,
  getScrapByType,
} from '../controllers/scrap-marketplace.controller';

const router = Router();

// ============================================
// سوق التوالف - Scrap Marketplace Routes
// ============================================

// ============================================
// منتجات التوالف - Scrap Items
// ============================================

// الحصول على منتجات التوالف (عام)
router.get('/items', getScrapItems);

// الحصول على تفاصيل منتج (عام)
router.get('/items/:itemId', getScrapItemDetails);

// إنشاء منتج توالف (يتطلب تسجيل دخول)
router.post('/items', authenticate, createScrapItem);

// ============================================
// تجار التوالف - Scrap Dealers
// ============================================

// الحصول على التجار المعتمدين (عام)
router.get('/dealers', getScrapDealers);

// الحصول على تفاصيل تاجر (عام)
router.get('/dealers/:dealerId', getDealerDetails);

// تسجيل كتاجر توالف (يتطلب تسجيل دخول)
router.post('/dealers/register', authenticate, registerScrapDealer);

// ============================================
// أسعار المعادن - Metal Prices
// ============================================

// الحصول على أسعار المعادن الحالية (عام)
router.get('/metal-prices', getMetalPrices);

// الحصول على تاريخ سعر معدن (عام)
router.get('/metal-prices/:metalType/history', getMetalPriceHistory);

// إضافة سعر معدن (للمشرفين فقط)
router.post('/metal-prices', authenticate, addMetalPrice);

// ============================================
// طلبات الشراء - Purchase Requests
// ============================================

// الحصول على طلبات الشراء (عام)
router.get('/purchase-requests', getPurchaseRequests);

// إنشاء طلب شراء (يتطلب تسجيل دخول)
router.post('/purchase-requests', authenticate, createPurchaseRequest);

// تقديم عرض على طلب (يتطلب تسجيل دخول)
router.post('/purchase-requests/:requestId/offers', authenticate, submitSellerOffer);

// الحصول على العروض على طلب (يتطلب تسجيل دخول - للمشتري فقط)
router.get('/purchase-requests/:requestId/offers', authenticate, getRequestOffers);

// قبول عرض (يتطلب تسجيل دخول)
router.post('/offers/:offerId/accept', authenticate, acceptOffer);

// ============================================
// إحصائيات - Statistics
// ============================================

// الحصول على إحصائيات السوق (عام)
router.get('/stats', getMarketStats);

// الحصول على التوالف حسب النوع (عام)
router.get('/stats/by-type', getScrapByType);

export default router;
