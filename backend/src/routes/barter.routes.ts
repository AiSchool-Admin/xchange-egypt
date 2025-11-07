import { Router } from 'express';
import * as barterController from '../controllers/barter.controller';
import * as barterChainController from '../controllers/barter-chain.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createBarterOfferSchema,
  createCounterOfferSchema,
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
} from '../validations/barter.validation';

const router = Router();

// Public routes

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
 * Create a barter offer
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
 * Accept a barter offer
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
  validate(createCounterOfferSchema),
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

export default router;
