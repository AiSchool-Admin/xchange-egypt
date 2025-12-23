/**
 * Barter Chain Controller
 * Handles multi-party smart barter chains
 */

import { Request, Response, NextFunction } from 'express';
import * as barterChainService from '../services/barter-chain.service';
import { successResponse } from '../utils/response';

/**
 * Discover smart barter opportunities for user's item
 * GET /api/v1/barter/opportunities/:itemId
 */
export const discoverOpportunities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const opportunities = await barterChainService.discoverBarterOpportunities(userId, itemId);

    return successResponse(
      res,
      opportunities,
      'Barter opportunities discovered successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create a smart barter proposal
 * POST /api/v1/barter/chains
 */
export const createSmartProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const proposalData = req.body;

    const proposal = await barterChainService.createSmartProposal(userId, proposalData);

    return successResponse(
      res,
      proposal,
      'Smart barter proposal created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get barter chain by ID
 * GET /api/v1/barter/chains/:chainId
 */
export const getBarterChain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chainId } = req.params;
    const userId = req.user.id;

    const chain = await barterChainService.getBarterChainById(chainId, userId);

    return successResponse(res, chain, 'Barter chain retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to a barter chain proposal (accept/reject)
 * POST /api/v1/barter/chains/:chainId/respond
 */
export const respondToProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chainId } = req.params;
    const userId = req.user.id;
    const response = req.body;

    const chain = await barterChainService.respondToChainProposal(
      chainId,
      userId,
      response
    );

    return successResponse(
      res,
      chain,
      `Proposal ${response.accept ? 'accepted' : 'rejected'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a barter chain
 * DELETE /api/v1/barter/chains/:chainId
 */
export const cancelBarterChain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chainId } = req.params;
    const userId = req.user.id;

    const chain = await barterChainService.cancelBarterChain(chainId, userId);

    return successResponse(res, chain, 'Barter chain cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Execute/complete a barter chain
 * POST /api/v1/barter/chains/:chainId/execute
 */
export const executeBarterChain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chainId } = req.params;
    const userId = req.user.id;

    const chain = await barterChainService.executeBarterChain(chainId, userId);

    return successResponse(res, chain, 'Barter chain execution confirmed');
  } catch (error) {
    next(error);
  }
};

/**
 * Get my barter chains
 * GET /api/v1/barter/chains/my
 */
export const getMyBarterChains = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { status, page, limit } = req.query;

    const chains = await barterChainService.getMyBarterChains(
      userId,
      status as any,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    return successResponse(res, chains, 'Barter chains retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending barter chain proposals
 * GET /api/v1/barter/chains/pending
 */
export const getPendingProposals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const proposals = await barterChainService.getPendingProposals(userId);

    return successResponse(res, proposals, 'Pending proposals retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get barter chain statistics
 * GET /api/v1/barter/chains/stats
 */
export const getBarterChainStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const stats = await barterChainService.getBarterChainStats(userId);

    return successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};
