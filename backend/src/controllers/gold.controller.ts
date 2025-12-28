/**
 * Gold Marketplace Controller
 * التحكم بسوق الذهب
 */

import { Request, Response, NextFunction } from 'express';
import * as goldService from '../services/gold.service';
import { successResponse, errorResponse } from '../utils/response';

// Helper to safely get user ID from request
const getUserId = (req: Request): string | null => req.user?.id || null;

// ============================================
// Gold Prices
// ============================================

/**
 * Get latest gold prices
 * GET /api/v1/gold/prices
 */
export const getPrices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prices = await goldService.getLatestPrices();
    return successResponse(res, prices, 'أسعار الذهب الحالية');
  } catch (error) {
    next(error);
  }
};

/**
 * Get price for specific karat
 * GET /api/v1/gold/prices/:karat
 */
export const getPriceByKarat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { karat } = req.params;
    const validKarats = ['K18', 'K21', 'K24'];

    if (!validKarats.includes(karat)) {
      return res.status(400).json({
        success: false,
        message: 'العيار غير صالح. استخدم K18, K21, أو K24',
      });
    }

    const price = await goldService.getPriceByKarat(karat as any);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على السعر',
      });
    }

    return successResponse(res, price, `سعر عيار ${karat}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Update gold prices (admin only)
 * POST /api/v1/gold/prices
 */
export const updatePrices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prices } = req.body;

    if (!Array.isArray(prices) || prices.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم مصفوفة الأسعار',
      });
    }

    const result = await goldService.updatePrices(prices);
    return successResponse(res, result, 'تم تحديث الأسعار بنجاح');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Price Calculator
// ============================================

/**
 * Calculate transaction price
 * POST /api/v1/gold/calculate
 */
export const calculatePrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { weightGrams, karat, sellerPricePerGram } = req.body;

    if (!weightGrams || !karat || !sellerPricePerGram) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم الوزن والعيار وسعر البائع',
      });
    }

    const calculation = await goldService.calculatePrice(
      weightGrams,
      karat,
      sellerPricePerGram
    );

    return successResponse(res, calculation, 'حساب السعر');
  } catch (error) {
    next(error);
  }
};

/**
 * Get suggested price range for sellers
 * GET /api/v1/gold/price-range/:karat
 */
export const getSuggestedPriceRange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { karat } = req.params;
    const validKarats = ['K18', 'K21', 'K24'];

    if (!validKarats.includes(karat)) {
      return res.status(400).json({
        success: false,
        message: 'العيار غير صالح',
      });
    }

    const range = await goldService.getSuggestedPriceRange(karat as any);
    return successResponse(res, range, 'نطاق السعر المقترح');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Gold Items
// ============================================

/**
 * Get gold items with filters
 * GET /api/v1/gold/items
 */
export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      category: req.query.category as string,
      karat: req.query.karat as string,
      minWeight: req.query.minWeight ? parseFloat(req.query.minWeight as string) : undefined,
      maxWeight: req.query.maxWeight ? parseFloat(req.query.maxWeight as string) : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      governorate: req.query.governorate as string,
      verificationLevel: req.query.verificationLevel as string,
      status: req.query.status as string,
      sellerId: req.query.sellerId as string,
      allowBarter: req.query.allowBarter === 'true' ? true : req.query.allowBarter === 'false' ? false : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await goldService.getGoldItems(filters);
    return successResponse(res, result, 'قطع الذهب');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single gold item
 * GET /api/v1/gold/items/:id
 */
export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await goldService.getGoldItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على القطعة',
      });
    }

    return successResponse(res, item, 'تفاصيل القطعة');
  } catch (error) {
    next(error);
  }
};

/**
 * Create gold item
 * POST /api/v1/gold/items
 */
export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const item = await goldService.createGoldItem(userId, req.body);
    return successResponse(res, item, 'تم إنشاء الإعلان بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update gold item
 * PUT /api/v1/gold/items/:id
 */
export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const item = await goldService.updateGoldItem(id, userId, req.body);
    return successResponse(res, item, 'تم تحديث الإعلان بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete gold item
 * DELETE /api/v1/gold/items/:id
 */
export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    await goldService.deleteGoldItem(id, userId);
    return successResponse(res, null, 'تم حذف الإعلان بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's gold items
 * GET /api/v1/gold/my-items
 */
export const getMyItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const result = await goldService.getGoldItems({ sellerId: userId, status: undefined });
    return successResponse(res, result, 'قطع الذهب الخاصة بي');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Gold Partners
// ============================================

/**
 * Get gold partners
 * GET /api/v1/gold/partners
 */
export const getPartners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      governorate: req.query.governorate as string,
      offersCertification: req.query.offersCertification === 'true' ? true : undefined,
      offersPickup: req.query.offersPickup === 'true' ? true : undefined,
    };

    const partners = await goldService.getGoldPartners(filters);
    return successResponse(res, partners, 'الصاغة الشركاء');
  } catch (error) {
    next(error);
  }
};

/**
 * Get partner by ID
 * GET /api/v1/gold/partners/:id
 */
export const getPartnerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const partner = await goldService.getGoldPartnerById(id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الصائغ',
      });
    }

    return successResponse(res, partner, 'تفاصيل الصائغ');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Gold Transactions
// ============================================

/**
 * Create transaction (buy gold)
 * POST /api/v1/gold/transactions
 */
export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyerId = getUserId(req);
    if (!buyerId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const transaction = await goldService.createGoldTransaction(buyerId, req.body);
    return successResponse(res, transaction, 'تم إنشاء الطلب بنجاح', 201);
  } catch (error: any) {
    if (error.message === 'Item not available') {
      return res.status(400).json({
        success: false,
        message: 'القطعة غير متاحة',
      });
    }
    if (error.message === 'Cannot buy your own item') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك شراء قطعتك الخاصة',
      });
    }
    next(error);
  }
};

/**
 * Update transaction status
 * PUT /api/v1/gold/transactions/:id/status
 */
export const updateTransactionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { status, notes } = req.body;

    const transaction = await goldService.updateTransactionStatus(id, userId, status, notes);
    return successResponse(res, transaction, 'تم تحديث حالة المعاملة');
  } catch (error: any) {
    if (error.message === 'Transaction not found') {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المعاملة',
      });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح',
      });
    }
    next(error);
  }
};

/**
 * Get user's transactions
 * GET /api/v1/gold/transactions
 */
export const getMyTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const type = req.query.type as 'purchases' | 'sales' | 'all';

    const transactions = await goldService.getUserGoldTransactions(userId, type);
    return successResponse(res, transactions, 'معاملاتي');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Statistics
// ============================================

/**
 * Get marketplace statistics
 * GET /api/v1/gold/statistics
 */
export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await goldService.getGoldStatistics();
    return successResponse(res, stats, 'إحصائيات سوق الذهب');
  } catch (error) {
    next(error);
  }
};
