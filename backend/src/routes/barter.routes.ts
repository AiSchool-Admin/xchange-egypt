import { Router, Request, Response, NextFunction } from 'express';
import * as barterController from '../controllers/barter.controller';
import * as barterChainController from '../controllers/barter-chain.controller';
import * as realtimeMatchingService from '../services/realtime-matching.service';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import prisma from '../lib/prisma';
import {
  createBarterOfferSchema,
  acceptBarterOfferSchema,
  rejectBarterOfferSchema,
  cancelBarterOfferSchema,
  getBarterOfferByIdSchema,
  getMyBarterOffersSchema,
  searchBarterableItemsSchema,
  findBarterMatchesSchema,
  completeBarterExchangeSchema,
  discoverOpportunitiesSchema,
  createSmartProposalSchema,
  getBarterChainSchema,
  respondToChainSchema,
  cancelBarterChainSchema,
  executeBarterChainSchema,
  getMyBarterChainsSchema,
  getPendingProposalsSchema,
  getMatchingOffersSchema,
  getBestMatchSchema,
} from '../validations/barter.validation';

const router = Router();

// Public routes

/**
 * Get public platform statistics for barter homepage
 * GET /api/v1/barter/stats
 */
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Get counts in parallel for better performance
    const [
      totalItems,
      activeOffers,
      completedTrades,
      activeUsers,
      categoryCounts,
    ] = await Promise.all([
      // Total barterable items
      prisma.item.count({
        where: { allowBarter: true, status: 'ACTIVE' },
      }),
      // Active barter offers
      prisma.barterOffer.count({
        where: { status: 'PENDING' },
      }),
      // Completed barter trades
      prisma.barterOffer.count({
        where: { status: 'COMPLETED' },
      }),
      // Active users (users with at least one item or transaction in last 30 days)
      prisma.user.count({
        where: {
          OR: [
            { items: { some: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } },
            { sentBarterOffers: { some: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } },
          ],
        },
      }),
      // Category counts with icons
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          icon: true,
          slug: true,
          _count: {
            select: {
              items: {
                where: { status: 'ACTIVE', allowBarter: true },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
        take: 8,
      }),
    ]);

    // Calculate success rate (completed / total offers * 100)
    const totalOffers = await prisma.barterOffer.count();
    const successRate = totalOffers > 0 ? Math.round((completedTrades / totalOffers) * 100) : 95;

    // Estimate saved money (sum of completed trade values)
    const savedMoneyResult = await prisma.barterOffer.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { cashAddition: true },
    });

    // Calculate total value from completed items
    const completedItemValues = await prisma.item.aggregate({
      where: {
        barterOffersAsOffered: { some: { status: 'COMPLETED' } },
      },
      _sum: { estimatedValue: true },
    });

    const savedMoney = (completedItemValues._sum.estimatedValue ? Number(completedItemValues._sum.estimatedValue) : 0) + (savedMoneyResult._sum.cashAddition ? Number(savedMoneyResult._sum.cashAddition) : 0);

    // Format categories
    const categories = categoryCounts.map((cat, index) => ({
      id: cat.id,
      name: cat.nameAr || cat.nameEn || 'عام',
      icon: cat.icon || getDefaultCategoryIcon(index),
      count: cat._count.items,
      slug: cat.slug,
      color: getCategoryGradient(index),
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalItems,
          activeOffers,
          completedTrades,
          successRate,
          savedMoney,
          activeUsers,
        },
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions for category styling
function getDefaultCategoryIcon(index: number): string {
  const icons = ['📱', '🛋️', '👗', '📚', '🚗', '⚽', '🧸', '🔌'];
  return icons[index % icons.length];
}

function getCategoryGradient(index: number): string {
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-emerald-500 to-teal-600',
    'from-slate-600 to-gray-800',
    'from-green-500 to-emerald-600',
    'from-purple-500 to-violet-600',
    'from-red-500 to-rose-600',
  ];
  return gradients[index % gradients.length];
}

/**
 * Search barterable items
 * GET /api/v1/barter/items
 */
router.get(
  '/items',
  validate(searchBarterableItemsSchema),
  barterController.searchBarterableItems
);

// Protected routes (require authentication)

/**
 * Get my barter offers
 * GET /api/v1/barter/offers/my
 */
router.get(
  '/offers/my',
  authenticate,
  validate(getMyBarterOffersSchema),
  barterController.getMyBarterOffers
);

/**
 * Get matching offers for my items (Bundle feature)
 * GET /api/v1/barter/offers/matching
 */
router.get(
  '/offers/matching',
  authenticate,
  validate(getMatchingOffersSchema),
  barterController.getMatchingOffers
);

/**
 * Create a barter offer (with bundles & preferences)
 * POST /api/v1/barter/offers
 */
router.post(
  '/offers',
  authenticate,
  validate(createBarterOfferSchema),
  barterController.createBarterOffer
);

/**
 * Get barter offer by ID
 * GET /api/v1/barter/offers/:offerId
 */
router.get(
  '/offers/:offerId',
  authenticate,
  validate(getBarterOfferByIdSchema),
  barterController.getBarterOfferById
);

/**
 * Get best matching preference set for this offer (Bundle feature)
 * GET /api/v1/barter/offers/:offerId/best-match
 */
router.get(
  '/offers/:offerId/best-match',
  authenticate,
  validate(getBestMatchSchema),
  barterController.getBestMatch
);

/**
 * Get smart matches for an offer's item requests
 * GET /api/v1/barter/offers/:offerId/smart-matches
 */
router.get(
  '/offers/:offerId/smart-matches',
  authenticate,
  barterController.getSmartMatches
);

/**
 * Accept a barter offer (with preference set selection)
 * POST /api/v1/barter/offers/:offerId/accept
 */
router.post(
  '/offers/:offerId/accept',
  authenticate,
  validate(acceptBarterOfferSchema),
  barterController.acceptBarterOffer
);

/**
 * Reject a barter offer
 * POST /api/v1/barter/offers/:offerId/reject
 */
router.post(
  '/offers/:offerId/reject',
  authenticate,
  validate(rejectBarterOfferSchema),
  barterController.rejectBarterOffer
);

/**
 * Create a counter offer
 * POST /api/v1/barter/offers/:offerId/counter
 */
router.post(
  '/offers/:offerId/counter',
  authenticate,
  validate(createBarterOfferSchema),
  barterController.createCounterOffer
);

/**
 * Cancel a barter offer
 * POST /api/v1/barter/offers/:offerId/cancel
 */
router.post(
  '/offers/:offerId/cancel',
  authenticate,
  validate(cancelBarterOfferSchema),
  barterController.cancelBarterOffer
);

/**
 * Complete barter exchange
 * POST /api/v1/barter/offers/:offerId/complete
 */
router.post(
  '/offers/:offerId/complete',
  authenticate,
  validate(completeBarterExchangeSchema),
  barterController.completeBarterExchange
);

/**
 * Find barter matches for an item
 * GET /api/v1/barter/matches/:itemId
 */
router.get(
  '/matches/:itemId',
  authenticate,
  validate(findBarterMatchesSchema),
  barterController.findBarterMatches
);

/**
 * Find if current user has an item that matches what target item owner wants
 * GET /api/v1/barter/find-my-match/:itemId
 * Returns the user's matching item for direct barter completion
 */
router.get(
  '/find-my-match/:itemId',
  authenticate,
  barterController.findMyMatchingItem
);

// ============================================
// Multi-Party Smart Barter Chains
// ============================================

/**
 * Discover smart barter opportunities
 * GET /api/v1/barter/opportunities/:itemId
 */
router.get(
  '/opportunities/:itemId',
  authenticate,
  validate(discoverOpportunitiesSchema),
  barterChainController.discoverOpportunities
);

/**
 * Get my barter chains (must come before /:chainId)
 * GET /api/v1/barter/chains/my
 */
router.get(
  '/chains/my',
  authenticate,
  validate(getMyBarterChainsSchema),
  barterChainController.getMyBarterChains
);

/**
 * Get pending barter chain proposals
 * GET /api/v1/barter/chains/pending
 */
router.get(
  '/chains/pending',
  authenticate,
  validate(getPendingProposalsSchema),
  barterChainController.getPendingProposals
);

/**
 * Get barter chain statistics
 * GET /api/v1/barter/chains/stats
 */
router.get(
  '/chains/stats',
  authenticate,
  barterChainController.getBarterChainStats
);

/**
 * Create smart barter proposal
 * POST /api/v1/barter/chains
 */
router.post(
  '/chains',
  authenticate,
  validate(createSmartProposalSchema),
  barterChainController.createSmartProposal
);

/**
 * Get barter chain by ID
 * GET /api/v1/barter/chains/:chainId
 */
router.get(
  '/chains/:chainId',
  authenticate,
  validate(getBarterChainSchema),
  barterChainController.getBarterChain
);

/**
 * Respond to barter chain proposal (accept/reject)
 * POST /api/v1/barter/chains/:chainId/respond
 */
router.post(
  '/chains/:chainId/respond',
  authenticate,
  validate(respondToChainSchema),
  barterChainController.respondToProposal
);

/**
 * Execute/complete barter chain
 * POST /api/v1/barter/chains/:chainId/execute
 */
router.post(
  '/chains/:chainId/execute',
  authenticate,
  validate(executeBarterChainSchema),
  barterChainController.executeBarterChain
);

/**
 * Cancel barter chain
 * DELETE /api/v1/barter/chains/:chainId
 */
router.delete(
  '/chains/:chainId',
  authenticate,
  validate(cancelBarterChainSchema),
  barterChainController.cancelBarterChain
);

// ============================================
// Real-Time Matching (Testing/Admin)
// ============================================

/**
 * Get real-time matching statistics
 * GET /api/v1/barter/realtime/stats
 */
router.get(
  '/realtime/stats',
  authenticate,
  async (_req, res, next) => {
    try {
      const stats = realtimeMatchingService.getRealtimeMatchingStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Manually trigger matching for a specific item
 * POST /api/v1/barter/realtime/trigger/:itemId
 */
router.post(
  '/realtime/trigger/:itemId',
  authenticate,
  async (req: Request & { user?: { userId: string } }, res: Response, next: NextFunction) => {
    try {
      const { itemId } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const result = await realtimeMatchingService.triggerMatchingForItem(userId, itemId);

      res.json({
        success: true,
        data: result,
        message: `Found ${result.matchCount} matches, sent ${result.notificationsSent} notifications`,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
