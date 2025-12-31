/**
 * Silver Marketplace Controller
 * التحكم بسوق الفضة
 */

import { Request, Response, NextFunction } from 'express';
import * as silverService from '../services/silver.service';
import { successResponse, errorResponse } from '../utils/response';

// Helper to safely get user ID from request
const getUserId = (req: Request): string | null => req.user?.id || null;

// ============================================
// Silver Prices
// ============================================

/**
 * Get latest silver prices
 * GET /api/v1/silver/prices
 */
export const getPrices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prices = await silverService.getLatestPrices();
    return successResponse(res, prices, 'أسعار الفضة الحالية');
  } catch (error) {
    next(error);
  }
};

/**
 * Get price for specific purity
 * GET /api/v1/silver/prices/:purity
 */
export const getPriceByPurity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { purity } = req.params;
    const validPurities = ['S999', 'S925', 'S900', 'S800'];

    if (!validPurities.includes(purity)) {
      return res.status(400).json({
        success: false,
        message: 'النقاء غير صالح. استخدم S999, S925, S900, أو S800',
      });
    }

    const price = await silverService.getPriceByPurity(purity as any);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على السعر',
      });
    }

    return successResponse(res, price, `سعر نقاء ${purity}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Update silver prices (admin only)
 * POST /api/v1/silver/prices
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

    const result = await silverService.updatePrices(prices);
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
 * POST /api/v1/silver/calculate
 */
export const calculatePrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { weightGrams, purity, sellerPricePerGram } = req.body;

    if (!weightGrams || !purity || !sellerPricePerGram) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم الوزن والنقاء وسعر البائع',
      });
    }

    const calculation = await silverService.calculatePrice(
      weightGrams,
      purity,
      sellerPricePerGram
    );

    return successResponse(res, calculation, 'حساب السعر');
  } catch (error) {
    next(error);
  }
};

/**
 * Get suggested price range for sellers
 * GET /api/v1/silver/price-range/:purity
 */
export const getSuggestedPriceRange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { purity } = req.params;
    const validPurities = ['S999', 'S925', 'S900', 'S800'];

    if (!validPurities.includes(purity)) {
      return res.status(400).json({
        success: false,
        message: 'النقاء غير صالح',
      });
    }

    const range = await silverService.getSuggestedPriceRange(purity as any);
    return successResponse(res, range, 'نطاق السعر المقترح');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Silver Items
// ============================================

/**
 * Get silver items with filters
 * GET /api/v1/silver/items
 */
export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      category: req.query.category as string,
      purity: req.query.purity as string,
      minWeight: req.query.minWeight ? parseFloat(req.query.minWeight as string) : undefined,
      maxWeight: req.query.maxWeight ? parseFloat(req.query.maxWeight as string) : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      governorate: req.query.governorate as string,
      verificationLevel: req.query.verificationLevel as string,
      status: req.query.status as string,
      sellerId: req.query.sellerId as string,
      allowBarter: req.query.allowBarter === 'true' ? true : req.query.allowBarter === 'false' ? false : undefined,
      allowGoldBarter: req.query.allowGoldBarter === 'true' ? true : req.query.allowGoldBarter === 'false' ? false : undefined,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await silverService.getSilverItems(filters);
    return successResponse(res, result, 'قطع الفضة');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single silver item
 * GET /api/v1/silver/items/:id
 */
export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await silverService.getSilverItemById(id);

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
 * Create silver item
 * POST /api/v1/silver/items
 */
export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const item = await silverService.createSilverItem(userId, req.body);
    return successResponse(res, item, 'تم إنشاء الإعلان بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update silver item
 * PUT /api/v1/silver/items/:id
 */
export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const item = await silverService.updateSilverItem(id, userId, req.body);
    return successResponse(res, item, 'تم تحديث الإعلان بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete silver item
 * DELETE /api/v1/silver/items/:id
 */
export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    await silverService.deleteSilverItem(id, userId);
    return successResponse(res, null, 'تم حذف الإعلان بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's silver items
 * GET /api/v1/silver/my-items
 */
export const getMyItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const result = await silverService.getSilverItems({ sellerId: userId, status: undefined });
    return successResponse(res, result, 'قطع الفضة الخاصة بي');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Silver Partners
// ============================================

/**
 * Get silver partners
 * GET /api/v1/silver/partners
 */
export const getPartners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      governorate: req.query.governorate as string,
      offersCertification: req.query.offersCertification === 'true' ? true : undefined,
      offersPickup: req.query.offersPickup === 'true' ? true : undefined,
    };

    const partners = await silverService.getSilverPartners(filters);
    return successResponse(res, partners, 'محلات الفضة الشريكة');
  } catch (error) {
    next(error);
  }
};

/**
 * Get partner by ID
 * GET /api/v1/silver/partners/:id
 */
export const getPartnerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const partner = await silverService.getSilverPartnerById(id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المحل',
      });
    }

    return successResponse(res, partner, 'تفاصيل المحل');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Silver Transactions
// ============================================

/**
 * Create transaction (buy silver)
 * POST /api/v1/silver/transactions
 */
export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyerId = getUserId(req);
    if (!buyerId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const transaction = await silverService.createSilverTransaction(buyerId, req.body);
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
 * PUT /api/v1/silver/transactions/:id/status
 */
export const updateTransactionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { status, notes } = req.body;

    const transaction = await silverService.updateTransactionStatus(id, userId, status, notes);
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
 * GET /api/v1/silver/transactions
 */
export const getMyTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const type = req.query.type as 'purchases' | 'sales' | 'all';

    const transactions = await silverService.getUserSilverTransactions(userId, type);
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
 * GET /api/v1/silver/statistics
 */
export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await silverService.getSilverStatistics();
    return successResponse(res, stats, 'إحصائيات سوق الفضة');
  } catch (error) {
    next(error);
  }
};
