/**
 * Price Prediction Routes
 * مسارات التنبؤ بالأسعار
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import * as pricePredictionService from '../services/ai-price-prediction.service';
import prisma from '../lib/prisma';

const router = Router();

// ============================================
// Public Routes
// ============================================

/**
 * @route   POST /api/v1/price-prediction/predict
 * @desc    Get AI price prediction for an item
 * @access  Public (optional auth for history)
 */
router.post('/predict', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { categoryId, condition, title, description, governorate } = req.body;

    if (!categoryId || !condition) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد الفئة والحالة',
      });
    }

    const prediction = await pricePredictionService.predictPrice({
      categoryId,
      condition,
      title,
      description,
      governorate,
      userId: req.user?.id,
    });

    return res.json({
      success: true,
      data: prediction,
    });
  } catch (error: any) {
    console.error('Error getting price prediction:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في التنبؤ بالسعر',
    });
  }
});

/**
 * @route   GET /api/v1/price-prediction/history/:categoryId
 * @desc    Get price history for a category
 * @access  Public
 */
router.get('/history/:categoryId', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { condition, days } = req.query;

    const history = await pricePredictionService.getPriceHistory(
      categoryId,
      condition as any,
      Number(days) || 30
    );

    return res.json({
      success: true,
      data: {
        history,
        categoryId,
        period: `${days || 30} days`,
      },
    });
  } catch (error: any) {
    console.error('Error getting price history:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب تاريخ الأسعار',
    });
  }
});

/**
 * @route   GET /api/v1/price-prediction/search
 * @desc    Search items for price prediction
 * @access  Public
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || (q as string).length < 2) {
      return res.json({
        success: true,
        data: { items: [] },
      });
    }

    const items = await prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: q as string, mode: 'insensitive' } },
          { description: { contains: q as string, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        estimatedValue: true,
        condition: true,
        images: true,
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
          },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const formattedItems = items.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category?.nameAr || item.category?.nameEn || 'عام',
      categoryId: item.category?.id,
      currentPrice: Number(item.estimatedValue) || 0,
      condition: item.condition,
      image: item.images?.[0] || null,
    }));

    return res.json({
      success: true,
      data: { items: formattedItems },
    });
  } catch (error: any) {
    console.error('Error searching items:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في البحث',
    });
  }
});

/**
 * @route   GET /api/v1/price-prediction/categories
 * @desc    Get categories with price prediction data
 * @access  Public
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null, // Top-level categories
      },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        slug: true,
        icon: true,
        _count: {
          select: {
            items: {
              where: { status: 'ACTIVE' },
            },
          },
        },
        children: {
          where: { isActive: true },
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            slug: true,
            _count: {
              select: {
                items: {
                  where: { status: 'ACTIVE' },
                },
              },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return res.json({
      success: true,
      data: { categories },
    });
  } catch (error: any) {
    console.error('Error getting categories:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب الفئات',
    });
  }
});

// ============================================
// Protected Routes
// ============================================

/**
 * @route   GET /api/v1/price-prediction/my-predictions
 * @desc    Get user's prediction history
 * @access  Private
 */
router.get('/my-predictions', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { limit } = req.query;

    const predictions = await pricePredictionService.getUserPredictions(
      userId,
      Number(limit) || 20
    );

    return res.json({
      success: true,
      data: { predictions },
    });
  } catch (error: any) {
    console.error('Error getting user predictions:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب التوقعات',
    });
  }
});

/**
 * @route   POST /api/v1/price-prediction/alert
 * @desc    Create price alert
 * @access  Private
 */
router.post('/alert', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemId, categoryId, targetPrice, alertType } = req.body;

    if (!targetPrice) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد السعر المستهدف',
      });
    }

    const alert = await prisma.priceAlert.create({
      data: {
        userId,
        itemId,
        targetPrice,
        alertType: alertType || 'BELOW',
        isActive: true,
      },
    });

    return res.json({
      success: true,
      data: alert,
      message: 'تم إنشاء تنبيه السعر بنجاح',
    });
  } catch (error: any) {
    console.error('Error creating price alert:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في إنشاء التنبيه',
    });
  }
});

/**
 * @route   GET /api/v1/price-prediction/:id
 * @desc    Get prediction by ID
 * @access  Public
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const prediction = await pricePredictionService.getPrediction(id);

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على التوقع',
      });
    }

    return res.json({
      success: true,
      data: prediction,
    });
  } catch (error: any) {
    console.error('Error getting prediction:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب التوقع',
    });
  }
});

export default router;
