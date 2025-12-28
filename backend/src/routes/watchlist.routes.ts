import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../utils/errors';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get user's watchlist
 * GET /api/v1/watchlist
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Get watchlist items with related item data
    const watchlistItems = await prisma.wishListItem.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Also get price alerts for the user
    const priceAlerts = await prisma.priceAlert.findMany({
      where: { userId, isActive: true },
      include: {
        item: {
          include: {
            category: true,
            seller: {
              select: {
                id: true,
                fullName: true,
                rating: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform price alerts to watchlist format
    const watchlist = priceAlerts.map((alert) => ({
      id: alert.id,
      itemId: alert.itemId,
      item: {
        id: alert.item.id,
        title: alert.item.title,
        price: Number(alert.item.estimatedValue),
        images: alert.item.images?.map((url: string) => ({ url })) || [],
        condition: alert.item.condition,
        location: alert.item.governorate || alert.item.city || 'غير محدد',
        status: alert.item.status,
        listingType: alert.item.listingType,
        seller: alert.item.seller,
        category: alert.item.category,
      },
      priceAlerts: {
        enabled: true,
        targetPrice: alert.targetPrice ? Number(alert.targetPrice) : null,
      },
      notifyOnPriceDrop: alert.notifyOnPriceDrop,
      notifyOnBackInStock: alert.notifyOnBackInStock,
      addedAt: alert.createdAt.toISOString(),
    }));

    res.json({
      success: true,
      data: {
        watchlist,
        total: watchlist.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Add item to watchlist
 * POST /api/v1/watchlist
 */
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { itemId, targetPrice, notifyOnPriceDrop = true, notifyOnBackInStock = true } = req.body;

    if (!itemId) {
      throw new AppError('Item ID is required', 400);
    }

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Check if already in watchlist
    const existing = await prisma.priceAlert.findFirst({
      where: { userId, itemId },
    });

    if (existing) {
      throw new AppError('Item already in watchlist', 400);
    }

    // Create price alert (used as watchlist item)
    const watchlistItem = await prisma.priceAlert.create({
      data: {
        userId,
        itemId,
        targetPrice: targetPrice || null,
        notifyOnPriceDrop,
        notifyOnBackInStock,
        isActive: true,
      },
      include: {
        item: {
          include: {
            category: true,
            seller: {
              select: {
                id: true,
                fullName: true,
                rating: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Item added to watchlist',
      data: {
        id: watchlistItem.id,
        itemId: watchlistItem.itemId,
        item: watchlistItem.item,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update watchlist item settings
 * PUT /api/v1/watchlist/:id
 */
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { targetPrice, notifyOnPriceDrop, notifyOnBackInStock } = req.body;

    const watchlistItem = await prisma.priceAlert.findFirst({
      where: { id, userId },
    });

    if (!watchlistItem) {
      throw new AppError('Watchlist item not found', 404);
    }

    const updated = await prisma.priceAlert.update({
      where: { id },
      data: {
        targetPrice: targetPrice !== undefined ? targetPrice : watchlistItem.targetPrice,
        notifyOnPriceDrop: notifyOnPriceDrop !== undefined ? notifyOnPriceDrop : watchlistItem.notifyOnPriceDrop,
        notifyOnBackInStock: notifyOnBackInStock !== undefined ? notifyOnBackInStock : watchlistItem.notifyOnBackInStock,
      },
    });

    res.json({
      success: true,
      message: 'Watchlist item updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Remove item from watchlist
 * DELETE /api/v1/watchlist/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const watchlistItem = await prisma.priceAlert.findFirst({
      where: { id, userId },
    });

    if (!watchlistItem) {
      throw new AppError('Watchlist item not found', 404);
    }

    await prisma.priceAlert.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Item removed from watchlist',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Check if item is in watchlist
 * GET /api/v1/watchlist/check/:itemId
 */
router.get('/check/:itemId', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    const exists = await prisma.priceAlert.findFirst({
      where: { userId, itemId },
    });

    res.json({
      success: true,
      data: {
        inWatchlist: !!exists,
        watchlistItemId: exists?.id || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
