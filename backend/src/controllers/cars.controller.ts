/**
 * Cars Marketplace Controller
 * التحكم بسوق السيارات
 */

import { Request, Response, NextFunction } from 'express';
import * as carsService from '../services/cars.service';
import { successResponse } from '../utils/response';

// ============================================
// Car Prices (Reference)
// ============================================

/**
 * Get car price reference
 * GET /api/v1/cars/prices
 */
export const getPriceReference = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { make, model, year } = req.query;

    if (!make || !model || !year) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم الماركة والموديل والسنة',
      });
    }

    const price = await carsService.getCarPriceReference(
      make as string,
      model as string,
      parseInt(year as string)
    );

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على سعر مرجعي لهذه السيارة',
      });
    }

    return successResponse(res, price, 'السعر المرجعي');
  } catch (error) {
    next(error);
  }
};

/**
 * Get prices by make
 * GET /api/v1/cars/prices/:make
 */
export const getPricesByMake = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { make } = req.params;
    const prices = await carsService.getPricesByMake(make);
    return successResponse(res, prices, `أسعار سيارات ${make}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Update car prices (admin only)
 * POST /api/v1/cars/prices
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

    const result = await carsService.updateCarPrices(prices);
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
 * POST /api/v1/cars/calculate
 */
export const calculatePrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { listingPrice, make, model, year } = req.body;

    if (!listingPrice) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم سعر الإعلان',
      });
    }

    const calculation = await carsService.calculateCarPrice(
      listingPrice,
      make,
      model,
      year
    );

    return successResponse(res, calculation, 'حساب السعر');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Car Listings
// ============================================

/**
 * Get car listings with filters
 * GET /api/v1/cars/listings
 */
export const getListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      make: req.query.make as string,
      model: req.query.model as string,
      yearMin: req.query.yearMin ? parseInt(req.query.yearMin as string) : undefined,
      yearMax: req.query.yearMax ? parseInt(req.query.yearMax as string) : undefined,
      bodyType: req.query.bodyType as string,
      transmission: req.query.transmission as string,
      fuelType: req.query.fuelType as string,
      mileageMin: req.query.mileageMin ? parseInt(req.query.mileageMin as string) : undefined,
      mileageMax: req.query.mileageMax ? parseInt(req.query.mileageMax as string) : undefined,
      priceMin: req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined,
      priceMax: req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined,
      governorate: req.query.governorate as string,
      city: req.query.city as string,
      sellerType: req.query.sellerType as string,
      condition: req.query.condition as string,
      verificationLevel: req.query.verificationLevel as string,
      status: req.query.status as string,
      sellerId: req.query.sellerId as string,
      allowBarter: req.query.allowBarter === 'true' ? true : req.query.allowBarter === 'false' ? false : undefined,
      isFeatured: req.query.isFeatured === 'true' ? true : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await carsService.getCarListings(filters);
    return successResponse(res, result, 'إعلانات السيارات');
  } catch (error) {
    next(error);
  }
};

/**
 * Get single car listing
 * GET /api/v1/cars/listings/:id
 */
export const getListingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const listing = await carsService.getCarListingById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الإعلان',
      });
    }

    return successResponse(res, listing, 'تفاصيل الإعلان');
  } catch (error) {
    next(error);
  }
};

/**
 * Create car listing
 * POST /api/v1/cars/listings
 */
export const createListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const listing = await carsService.createCarListing(userId, req.body);
    return successResponse(res, listing, 'تم إنشاء الإعلان بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update car listing
 * PUT /api/v1/cars/listings/:id
 */
export const updateListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const listing = await carsService.updateCarListing(id, userId, req.body);
    return successResponse(res, listing, 'تم تحديث الإعلان بنجاح');
  } catch (error: any) {
    if (error.message === 'Listing not found or unauthorized') {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الإعلان أو غير مصرح',
      });
    }
    next(error);
  }
};

/**
 * Delete car listing
 * DELETE /api/v1/cars/listings/:id
 */
export const deleteListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    await carsService.deleteCarListing(id, userId);
    return successResponse(res, null, 'تم حذف الإعلان بنجاح');
  } catch (error: any) {
    if (error.message === 'Listing not found or unauthorized') {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الإعلان أو غير مصرح',
      });
    }
    next(error);
  }
};

/**
 * Get user's car listings
 * GET /api/v1/cars/my-listings
 */
export const getMyListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const result = await carsService.getCarListings({ sellerId: userId, status: undefined });
    return successResponse(res, result, 'إعلاناتي');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Car Partners (Inspection Centers)
// ============================================

/**
 * Get car partners
 * GET /api/v1/cars/partners
 */
export const getPartners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      governorate: req.query.governorate as string,
      offersBasicInspection: req.query.offersBasicInspection === 'true' ? true : undefined,
      offersFullInspection: req.query.offersFullInspection === 'true' ? true : undefined,
      offersPrePurchase: req.query.offersPrePurchase === 'true' ? true : undefined,
    };

    const partners = await carsService.getCarPartners(filters);
    return successResponse(res, partners, 'مراكز الفحص');
  } catch (error) {
    next(error);
  }
};

/**
 * Get partner by ID
 * GET /api/v1/cars/partners/:id
 */
export const getPartnerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const partner = await carsService.getCarPartnerById(id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على مركز الفحص',
      });
    }

    return successResponse(res, partner, 'تفاصيل مركز الفحص');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Car Inspections
// ============================================

/**
 * Request car inspection
 * POST /api/v1/cars/inspections
 */
export const requestInspection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const inspection = await carsService.requestCarInspection(userId, req.body);
    return successResponse(res, inspection, 'تم طلب الفحص بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update inspection status (partner/admin)
 * PUT /api/v1/cars/inspections/:id
 */
export const updateInspection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const inspection = await carsService.updateInspectionStatus(id, req.body);
    return successResponse(res, inspection, 'تم تحديث الفحص');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Car Transactions
// ============================================

/**
 * Create transaction (buy car)
 * POST /api/v1/cars/transactions
 */
export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyerId = req.user!.id;
    const transaction = await carsService.createCarTransaction(buyerId, req.body);
    return successResponse(res, transaction, 'تم إنشاء الطلب بنجاح', 201);
  } catch (error: any) {
    if (error.message === 'Listing not available') {
      return res.status(400).json({
        success: false,
        message: 'الإعلان غير متاح',
      });
    }
    if (error.message === 'Cannot buy your own car') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك شراء سيارتك الخاصة',
      });
    }
    next(error);
  }
};

/**
 * Update transaction status
 * PUT /api/v1/cars/transactions/:id/status
 */
export const updateTransactionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { status, notes } = req.body;

    const transaction = await carsService.updateCarTransactionStatus(id, userId, status, notes);
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
 * GET /api/v1/cars/transactions
 */
export const getMyTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const type = req.query.type as 'purchases' | 'sales' | 'all';

    const transactions = await carsService.getUserCarTransactions(userId, type);
    return successResponse(res, transactions, 'معاملاتي');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Barter Proposals
// ============================================

/**
 * Create barter proposal
 * POST /api/v1/cars/barter
 */
export const createBarterProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const proposal = await carsService.createBarterProposal(userId, req.body);
    return successResponse(res, proposal, 'تم إرسال عرض المقايضة بنجاح', 201);
  } catch (error: any) {
    if (error.message === 'Listing not found') {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الإعلان',
      });
    }
    if (error.message === 'This listing does not accept barter') {
      return res.status(400).json({
        success: false,
        message: 'هذا الإعلان لا يقبل المقايضة',
      });
    }
    if (error.message === 'Cannot barter with your own listing') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك تقديم عرض مقايضة لإعلانك',
      });
    }
    next(error);
  }
};

/**
 * Respond to barter proposal
 * PUT /api/v1/cars/barter/:id/respond
 */
export const respondToBarterProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { action, counterCashDifference, counterMessage } = req.body;

    const proposal = await carsService.respondToBarterProposal(id, userId, {
      action,
      counterCashDifference,
      counterMessage,
    });

    return successResponse(res, proposal, 'تم الرد على عرض المقايضة');
  } catch (error: any) {
    if (error.message === 'Proposal not found') {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على العرض',
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
 * Get user's barter proposals
 * GET /api/v1/cars/barter
 */
export const getMyBarterProposals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const type = req.query.type as 'sent' | 'received' | 'all';

    const proposals = await carsService.getUserBarterProposals(userId, type);
    return successResponse(res, proposals, 'عروض المقايضة');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Statistics
// ============================================

/**
 * Get marketplace statistics
 * GET /api/v1/cars/statistics
 */
export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await carsService.getCarStatistics();
    return successResponse(res, stats, 'إحصائيات سوق السيارات');
  } catch (error) {
    next(error);
  }
};

/**
 * Get popular cars
 * GET /api/v1/cars/popular
 */
export const getPopularCars = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const popular = await carsService.getPopularCars();
    return successResponse(res, popular, 'السيارات الأكثر شيوعاً');
  } catch (error) {
    next(error);
  }
};
