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
