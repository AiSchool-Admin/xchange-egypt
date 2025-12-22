/**
 * Demand Marketplace Routes
 *
 * Public API for browsing demand-side items:
 * - Barter ItemRequests (ما يريده المستخدمون في المقايضة)
 * - Reverse Auctions (المناقصات/المزايدات العكسية)
 */

import { Router, Request, Response } from 'express';
import { getPublicDemandItems, findMatchingSupplyItems, DemandSearchParams } from '../services/demand-marketplace.service';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/demand
 * @desc    Get public demand items (barter requests + reverse auctions)
 * @access  Public
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      subcategoryId,
      subSubcategoryId,
      governorate,
      city,
      district,
      minPrice,
      maxPrice,
      condition,
      keywords,
      type,
      page = '1',
      limit = '20',
    } = req.query;

    const params: DemandSearchParams = {
      categoryId: categoryId as string,
      subcategoryId: subcategoryId as string,
      subSubcategoryId: subSubcategoryId as string,
      governorate: governorate as string,
      city: city as string,
      district: district as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      condition: condition as string,
      keywords: keywords as string,
      type: type as 'BARTER_REQUEST' | 'REVERSE_AUCTION' | undefined,
      excludeUserId: (req as Request & { user?: { id: string } }).user?.id, // Exclude current user's demands
      page: parseInt(page as string, 10),
      limit: Math.min(parseInt(limit as string, 10), 100),
    };

    const result = await getPublicDemandItems(params);

    res.json({
      success: true,
      data: result.items,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / (params.limit || 20)),
      },
    });
  } catch (error) {
    console.error('Error fetching demand items:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الطلبات',
      error: (error as Error).message,
    });
  }
});

/**
 * @route   GET /api/v1/demand/:id/matches
 * @desc    Get matching supply items for a demand item
 * @access  Public
 */
router.get('/:id/matches', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = '10' } = req.query;

    // First get the demand item
    const { items } = await getPublicDemandItems({ page: 1, limit: 1 });
    const demandItem = items.find(item => item.id === id);

    if (!demandItem) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود',
      });
    }

    const matches = await findMatchingSupplyItems(demandItem, parseInt(limit as string, 10));

    res.json({
      success: true,
      data: {
        demandItem,
        matches: matches.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          estimatedValue: item.estimatedValue,
          condition: item.condition,
          images: item.images,
          categoryName: item.category?.nameAr,
          governorate: item.governorate,
          seller: {
            id: item.seller?.id,
            name: `${item.seller?.firstName} ${item.seller?.lastName}`,
          },
          createdAt: item.createdAt,
        })),
        totalMatches: matches.length,
      },
    });
  } catch (error) {
    console.error('Error fetching demand matches:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء البحث عن التطابقات',
      error: (error as Error).message,
    });
  }
});

/**
 * @route   GET /api/v1/demand/stats
 * @desc    Get demand marketplace statistics
 * @access  Public
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { governorate } = req.query;

    // Get barter requests count
    const barterRequestsCount = await getPublicDemandItems({
      type: 'BARTER_REQUEST',
      governorate: governorate as string,
      page: 1,
      limit: 1,
    });

    // Get reverse auctions count
    const reverseAuctionsCount = await getPublicDemandItems({
      type: 'REVERSE_AUCTION',
      governorate: governorate as string,
      page: 1,
      limit: 1,
    });

    res.json({
      success: true,
      data: {
        barterRequests: barterRequestsCount.total,
        reverseAuctions: reverseAuctionsCount.total,
        total: barterRequestsCount.total + reverseAuctionsCount.total,
        governorate: governorate || 'all',
      },
    });
  } catch (error) {
    console.error('Error fetching demand stats:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإحصائيات',
      error: (error as Error).message,
    });
  }
});

export default router;
