import { Request, Response } from 'express';
import { scrapMarketplaceService } from '../services/scrap-marketplace.service';

// ============================================
// سوق التوالف - Scrap Marketplace Controller
// ============================================

/**
 * إنشاء منتج توالف جديد
 * Create new scrap item
 */
export const createScrapItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول' });
    }

    const item = await scrapMarketplaceService.createScrapItem(userId, req.body);
    res.status(201).json(item);
  } catch (error: any) {
    console.error('Error creating scrap item:', error);
    res.status(400).json({ error: error.message || 'فشل في إنشاء المنتج' });
  }
};

/**
 * الحصول على منتجات التوالف
 * Get scrap items
 */
export const getScrapItems = async (req: Request, res: Response) => {
  try {
    const filters = {
      scrapType: req.query.scrapType as any,
      scrapCondition: req.query.scrapCondition as any,
      metalType: req.query.metalType as any,
      minWeight: req.query.minWeight ? parseFloat(req.query.minWeight as string) : undefined,
      maxWeight: req.query.maxWeight ? parseFloat(req.query.maxWeight as string) : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      governorate: req.query.governorate as string,
      isRepairable: req.query.isRepairable === 'true' ? true : req.query.isRepairable === 'false' ? false : undefined,
      pricingType: req.query.pricingType as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await scrapMarketplaceService.getScrapItems(filters);
    res.json(result);
  } catch (error: any) {
    console.error('Error getting scrap items:', error);
    res.status(500).json({ error: 'فشل في جلب المنتجات' });
  }
};

/**
 * الحصول على تفاصيل منتج توالف
 * Get scrap item details
 */
export const getScrapItemDetails = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const item = await scrapMarketplaceService.getScrapItemDetails(itemId);
    res.json(item);
  } catch (error: any) {
    console.error('Error getting scrap item details:', error);
    res.status(404).json({ error: error.message || 'المنتج غير موجود' });
  }
};

/**
 * تسجيل تاجر توالف
 * Register scrap dealer
 */
export const registerScrapDealer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول' });
    }

    const dealer = await scrapMarketplaceService.registerScrapDealer(userId, req.body);
    res.status(201).json(dealer);
  } catch (error: any) {
    console.error('Error registering scrap dealer:', error);
    res.status(400).json({ error: error.message || 'فشل في التسجيل' });
  }
};

/**
 * الحصول على تجار التوالف
 * Get scrap dealers
 */
export const getScrapDealers = async (req: Request, res: Response) => {
  try {
    const filters = {
      dealerType: req.query.dealerType as any,
      governorate: req.query.governorate as string,
      specialization: req.query.specialization as any,
      metalType: req.query.metalType as any,
      offersPickup: req.query.offersPickup === 'true',
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await scrapMarketplaceService.getVerifiedDealers(filters);
    res.json(result);
  } catch (error: any) {
    console.error('Error getting scrap dealers:', error);
    res.status(500).json({ error: 'فشل في جلب التجار' });
  }
};

/**
 * الحصول على تفاصيل تاجر
 * Get dealer details
 */
export const getDealerDetails = async (req: Request, res: Response) => {
  try {
    const { dealerId } = req.params;
    const dealer = await scrapMarketplaceService.getDealerDetails(dealerId);
    res.json(dealer);
  } catch (error: any) {
    console.error('Error getting dealer details:', error);
    res.status(404).json({ error: error.message || 'التاجر غير موجود' });
  }
};

/**
 * الحصول على أسعار المعادن
 * Get metal prices
 */
export const getMetalPrices = async (req: Request, res: Response) => {
  try {
    const prices = await scrapMarketplaceService.getCurrentMetalPrices();
    res.json(prices);
  } catch (error: any) {
    console.error('Error getting metal prices:', error);
    res.status(500).json({ error: 'فشل في جلب الأسعار' });
  }
};

/**
 * إضافة سعر معدن (للمشرفين)
 * Add metal price (admin only)
 */
export const addMetalPrice = async (req: Request, res: Response) => {
  try {
    const price = await scrapMarketplaceService.addMetalPrice(req.body);
    res.status(201).json(price);
  } catch (error: any) {
    console.error('Error adding metal price:', error);
    res.status(400).json({ error: error.message || 'فشل في إضافة السعر' });
  }
};

/**
 * الحصول على تاريخ سعر معدن
 * Get metal price history
 */
export const getMetalPriceHistory = async (req: Request, res: Response) => {
  try {
    const { metalType } = req.params;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const history = await scrapMarketplaceService.getMetalPriceHistory(metalType as any, days);
    res.json(history);
  } catch (error: any) {
    console.error('Error getting metal price history:', error);
    res.status(500).json({ error: 'فشل في جلب التاريخ' });
  }
};

/**
 * إنشاء طلب شراء توالف
 * Create purchase request
 */
export const createPurchaseRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول' });
    }

    const request = await scrapMarketplaceService.createPurchaseRequest(userId, req.body);
    res.status(201).json(request);
  } catch (error: any) {
    console.error('Error creating purchase request:', error);
    res.status(400).json({ error: error.message || 'فشل في إنشاء الطلب' });
  }
};

/**
 * الحصول على طلبات الشراء
 * Get purchase requests
 */
export const getPurchaseRequests = async (req: Request, res: Response) => {
  try {
    const filters = {
      scrapType: req.query.scrapType as any,
      metalType: req.query.metalType as any,
      governorate: req.query.governorate as string,
      status: req.query.status as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await scrapMarketplaceService.getPurchaseRequests(filters);
    res.json(result);
  } catch (error: any) {
    console.error('Error getting purchase requests:', error);
    res.status(500).json({ error: 'فشل في جلب الطلبات' });
  }
};

/**
 * تقديم عرض على طلب شراء
 * Submit offer on purchase request
 */
export const submitSellerOffer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول' });
    }

    const { requestId } = req.params;
    const offer = await scrapMarketplaceService.submitSellerOffer(userId, requestId, req.body);
    res.status(201).json(offer);
  } catch (error: any) {
    console.error('Error submitting offer:', error);
    res.status(400).json({ error: error.message || 'فشل في تقديم العرض' });
  }
};

/**
 * الحصول على العروض على طلب شراء
 * Get offers on purchase request
 */
export const getRequestOffers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول' });
    }

    const { requestId } = req.params;
    const offers = await scrapMarketplaceService.getRequestOffers(requestId, userId);
    res.json(offers);
  } catch (error: any) {
    console.error('Error getting request offers:', error);
    res.status(400).json({ error: error.message || 'فشل في جلب العروض' });
  }
};

/**
 * قبول عرض
 * Accept offer
 */
export const acceptOffer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'يرجى تسجيل الدخول' });
    }

    const { offerId } = req.params;
    const offer = await scrapMarketplaceService.acceptOffer(offerId, userId);
    res.json(offer);
  } catch (error: any) {
    console.error('Error accepting offer:', error);
    res.status(400).json({ error: error.message || 'فشل في قبول العرض' });
  }
};

/**
 * الحصول على إحصائيات السوق
 * Get market statistics
 */
export const getMarketStats = async (req: Request, res: Response) => {
  try {
    const stats = await scrapMarketplaceService.getMarketStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting market stats:', error);
    res.status(500).json({ error: 'فشل في جلب الإحصائيات' });
  }
};

/**
 * الحصول على التوالف حسب النوع
 * Get scrap by type
 */
export const getScrapByType = async (req: Request, res: Response) => {
  try {
    const result = await scrapMarketplaceService.getScrapByType();
    res.json(result);
  } catch (error: any) {
    console.error('Error getting scrap by type:', error);
    res.status(500).json({ error: 'فشل في جلب البيانات' });
  }
};

// ============================================
// Collection Requests - طلبات الجمع
// ============================================

/**
 * إنشاء طلب جمع
 * Create collection request
 */
export const createCollectionRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'يرجى تسجيل الدخول' });
    }

    const request = await scrapMarketplaceService.createCollectionRequest(userId, {
      ...req.body,
      preferredDate: new Date(req.body.preferredDate),
      alternateDate: req.body.alternateDate ? new Date(req.body.alternateDate) : undefined,
    });
    res.status(201).json({ success: true, data: request });
  } catch (error: any) {
    console.error('Error creating collection request:', error);
    res.status(400).json({ success: false, error: error.message || 'فشل في إنشاء الطلب' });
  }
};

/**
 * الحصول على طلبات الجمع للمستخدم
 * Get user's collection requests
 */
export const getUserCollections = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'يرجى تسجيل الدخول' });
    }

    const status = req.query.status as string | undefined;
    const requests = await scrapMarketplaceService.getUserCollectionRequests(userId, status);
    res.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('Error getting user collections:', error);
    res.status(500).json({ success: false, error: 'فشل في جلب الطلبات' });
  }
};

/**
 * الحصول على طلبات الجمع المتاحة للجامعين
 * Get available collections for collectors
 */
export const getAvailableCollections = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'يرجى تسجيل الدخول' });
    }

    const governorate = req.query.governorate as string | undefined;
    // Get collector profile ID from user
    const collector = await scrapMarketplaceService.getCollectorStats(userId);
    const requests = await scrapMarketplaceService.getAvailableCollections(collector.collector.id, governorate);
    res.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('Error getting available collections:', error);
    res.status(500).json({ success: false, error: error.message || 'فشل في جلب الطلبات' });
  }
};

/**
 * قبول طلب جمع
 * Accept collection request
 */
export const acceptCollection = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'يرجى تسجيل الدخول' });
    }

    const { requestId } = req.params;
    const collector = await scrapMarketplaceService.getCollectorStats(userId);
    const updated = await scrapMarketplaceService.acceptCollectionRequest(collector.collector.id, requestId);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error accepting collection:', error);
    res.status(400).json({ success: false, error: error.message || 'فشل في قبول الطلب' });
  }
};

/**
 * تحديث حالة طلب الجمع
 * Update collection status
 */
export const updateCollectionStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'يرجى تسجيل الدخول' });
    }

    const { requestId } = req.params;
    const { status, ...data } = req.body;
    const collector = await scrapMarketplaceService.getCollectorStats(userId);
    const updated = await scrapMarketplaceService.updateCollectionStatus(collector.collector.id, requestId, status, data);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating collection status:', error);
    res.status(400).json({ success: false, error: error.message || 'فشل في تحديث الحالة' });
  }
};

/**
 * تقييم طلب الجمع
 * Rate collection
 */
export const rateCollection = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'يرجى تسجيل الدخول' });
    }

    const { requestId } = req.params;
    const { rating, review, isRequester } = req.body;
    const updated = await scrapMarketplaceService.rateCollection(userId, requestId, rating, review, isRequester);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error rating collection:', error);
    res.status(400).json({ success: false, error: error.message || 'فشل في التقييم' });
  }
};

// ============================================
// Collector Profile - ملف الجامع
// ============================================

/**
 * التسجيل كجامع
 * Register as collector
 */
export const registerCollector = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'يرجى تسجيل الدخول' });
    }

    const collector = await scrapMarketplaceService.registerCollector(userId, req.body);
    res.status(201).json({ success: true, data: collector });
  } catch (error: any) {
    console.error('Error registering collector:', error);
    res.status(400).json({ success: false, error: error.message || 'فشل في التسجيل' });
  }
};

/**
 * تحديث موقع الجامع
 * Update collector location
 */
export const updateCollectorLocation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'يرجى تسجيل الدخول' });
    }

    const { latitude, longitude, isOnline } = req.body;
    const updated = await scrapMarketplaceService.updateCollectorLocation(userId, latitude, longitude, isOnline);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating collector location:', error);
    res.status(400).json({ success: false, error: error.message || 'فشل في تحديث الموقع' });
  }
};

/**
 * الحصول على إحصائيات الجامع
 * Get collector stats
 */
export const getCollectorStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'يرجى تسجيل الدخول' });
    }

    const stats = await scrapMarketplaceService.getCollectorStats(userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error getting collector stats:', error);
    res.status(400).json({ success: false, error: error.message || 'فشل في جلب الإحصائيات' });
  }
};

// ============================================
// Material Prices - أسعار المواد
// ============================================

/**
 * الحصول على أسعار المواد
 * Get material prices
 */
export const getMaterialPrices = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const governorate = req.query.governorate as string | undefined;
    const prices = await scrapMarketplaceService.getMaterialPrices(category, governorate);
    res.json({ success: true, data: prices });
  } catch (error: any) {
    console.error('Error getting material prices:', error);
    res.status(500).json({ success: false, error: 'فشل في جلب الأسعار' });
  }
};

/**
 * إضافة/تحديث سعر مادة
 * Upsert material price (admin)
 */
export const upsertMaterialPrice = async (req: Request, res: Response) => {
  try {
    const price = await scrapMarketplaceService.upsertMaterialPrice(req.body);
    res.status(201).json({ success: true, data: price });
  } catch (error: any) {
    console.error('Error upserting material price:', error);
    res.status(400).json({ success: false, error: error.message || 'فشل في تحديث السعر' });
  }
};

/**
 * حساب قيمة الخردة
 * Calculate scrap value
 */
export const calculateScrapValue = async (req: Request, res: Response) => {
  try {
    const { materials, governorate } = req.body;
    const result = await scrapMarketplaceService.calculateScrapValue(materials, governorate);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error calculating scrap value:', error);
    res.status(400).json({ success: false, error: error.message || 'فشل في الحساب' });
  }
};

// ============================================
// ESG Certificates - شهادات الاستدامة
// ============================================

/**
 * إنشاء شهادة ESG
 * Generate ESG certificate
 */
export const generateESGCertificate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'يرجى تسجيل الدخول' });
    }

    const { collectionRequestId, materials } = req.body;
    const certificate = await scrapMarketplaceService.generateESGCertificate(userId, collectionRequestId, materials);
    res.status(201).json({ success: true, data: certificate });
  } catch (error: any) {
    console.error('Error generating ESG certificate:', error);
    res.status(400).json({ success: false, error: error.message || 'فشل في إنشاء الشهادة' });
  }
};

/**
 * الحصول على شهادات ESG للمستخدم
 * Get user's ESG certificates
 */
export const getUserESGCertificates = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'يرجى تسجيل الدخول' });
    }

    const certificates = await scrapMarketplaceService.getUserESGCertificates(userId);
    res.json({ success: true, data: certificates });
  } catch (error: any) {
    console.error('Error getting user ESG certificates:', error);
    res.status(500).json({ success: false, error: 'فشل في جلب الشهادات' });
  }
};

/**
 * التحقق من شهادة ESG
 * Verify ESG certificate
 */
export const verifyESGCertificate = async (req: Request, res: Response) => {
  try {
    const { certificateNumber } = req.params;
    const certificate = await scrapMarketplaceService.verifyESGCertificate(certificateNumber);
    res.json({ success: true, data: certificate });
  } catch (error: any) {
    console.error('Error verifying ESG certificate:', error);
    res.status(404).json({ success: false, error: error.message || 'الشهادة غير موجودة' });
  }
};

/**
 * الحصول على إحصائيات شاملة
 * Get comprehensive stats
 */
export const getComprehensiveStats = async (req: Request, res: Response) => {
  try {
    const stats = await scrapMarketplaceService.getComprehensiveStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error getting comprehensive stats:', error);
    res.status(500).json({ success: false, error: 'فشل في جلب الإحصائيات' });
  }
};
