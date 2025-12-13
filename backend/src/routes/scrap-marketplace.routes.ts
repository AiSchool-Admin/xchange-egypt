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
  // New endpoints
  createCollectionRequest,
  getUserCollections,
  getAvailableCollections,
  acceptCollection,
  updateCollectionStatus,
  rateCollection,
  registerCollector,
  updateCollectorLocation,
  getCollectorStats,
  getMaterialPrices,
  upsertMaterialPrice,
  calculateScrapValue,
  generateESGCertificate,
  getUserESGCertificates,
  verifyESGCertificate,
  getComprehensiveStats,
} from '../controllers/scrap-marketplace.controller';

const router = Router();

// ============================================
// سوق التوالف - Scrap Marketplace Routes
// ============================================

// ============================================
// إحصائيات - Statistics (First to avoid conflicts with :id routes)
// ============================================

// الحصول على إحصائيات السوق (عام)
router.get('/stats', getMarketStats);

// الحصول على إحصائيات شاملة (عام)
router.get('/stats/comprehensive', getComprehensiveStats);

// الحصول على التوالف حسب النوع (عام)
router.get('/stats/by-type', getScrapByType);

// ============================================
// أسعار المواد - Material Prices
// ============================================

// الحصول على أسعار المواد الحالية (عام)
router.get('/material-prices', getMaterialPrices);

// إضافة/تحديث سعر مادة (للمشرفين فقط)
router.post('/material-prices', authenticate, upsertMaterialPrice);

// حاسبة قيمة الخردة (عام)
router.post('/calculator', calculateScrapValue);

// ============================================
// أسعار المعادن - Metal Prices (Legacy)
// ============================================

// الحصول على أسعار المعادن الحالية (عام)
router.get('/metal-prices', getMetalPrices);

// الحصول على تاريخ سعر معدن (عام)
router.get('/metal-prices/:metalType/history', getMetalPriceHistory);

// إضافة سعر معدن (للمشرفين فقط)
router.post('/metal-prices', authenticate, addMetalPrice);

// ============================================
// طلبات الجمع - Collection Requests (C2B)
// ============================================

// الحصول على طلبات الجمع للمستخدم (يتطلب تسجيل دخول)
router.get('/collections/my-requests', authenticate, getUserCollections);

// الحصول على طلبات الجمع المتاحة للجامعين (يتطلب تسجيل دخول)
router.get('/collections/available', authenticate, getAvailableCollections);

// إنشاء طلب جمع (يتطلب تسجيل دخول)
router.post('/collections', authenticate, createCollectionRequest);

// قبول طلب جمع (يتطلب تسجيل دخول - للجامعين)
router.post('/collections/:requestId/accept', authenticate, acceptCollection);

// تحديث حالة طلب الجمع (يتطلب تسجيل دخول - للجامعين)
router.put('/collections/:requestId/status', authenticate, updateCollectionStatus);

// تقييم طلب الجمع (يتطلب تسجيل دخول)
router.post('/collections/:requestId/rate', authenticate, rateCollection);

// ============================================
// الجامعين - Collectors
// ============================================

// التسجيل كجامع (يتطلب تسجيل دخول)
router.post('/collectors/register', authenticate, registerCollector);

// تحديث موقع الجامع (يتطلب تسجيل دخول)
router.put('/collectors/location', authenticate, updateCollectorLocation);

// الحصول على إحصائيات الجامع (يتطلب تسجيل دخول)
router.get('/collectors/stats', authenticate, getCollectorStats);

// ============================================
// شهادات ESG - ESG Certificates
// ============================================

// التحقق من شهادة ESG (عام)
router.get('/esg/verify/:certificateNumber', verifyESGCertificate);

// الحصول على شهادات ESG للمستخدم (يتطلب تسجيل دخول)
router.get('/esg/my-certificates', authenticate, getUserESGCertificates);

// إنشاء شهادة ESG (يتطلب تسجيل دخول)
router.post('/esg/generate', authenticate, generateESGCertificate);

// ============================================
// تجار التوالف - Scrap Dealers
// ============================================

// الحصول على التجار المعتمدين (عام)
router.get('/dealers', getScrapDealers);

// تسجيل كتاجر توالف (يتطلب تسجيل دخول)
router.post('/dealers/register', authenticate, registerScrapDealer);

// الحصول على تفاصيل تاجر (عام)
router.get('/dealers/:dealerId', getDealerDetails);

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
// منتجات التوالف - Scrap Items
// ============================================

// الحصول على منتجات التوالف (عام)
router.get('/items', getScrapItems);

// إنشاء منتج توالف (يتطلب تسجيل دخول)
router.post('/items', authenticate, createScrapItem);

// الحصول على تفاصيل منتج (عام)
router.get('/items/:itemId', getScrapItemDetails);

export default router;
