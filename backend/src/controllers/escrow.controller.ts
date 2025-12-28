import { Request, Response, NextFunction } from 'express';
import * as escrowService from '../services/escrow.service';
import { successResponse, errorResponse } from '../utils/response';

// Helper to safely get user ID from request
const getUserId = (req: Request): string | null => req.user?.id || null;

/**
 * Get user's escrows
 * GET /api/v1/escrow/my-escrows
 */
export const getMyEscrows = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { role, status, limit, offset } = req.query;

    const result = await escrowService.getUserEscrows(userId, {
      role: role as 'BUYER' | 'SELLER' | 'ALL',
      status: status as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    return successResponse(res, result, 'Escrows retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get escrow by ID
 * GET /api/v1/escrow/:id
 */
export const getEscrow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const escrow = await escrowService.getEscrow(id);

    if (!escrow) {
      return errorResponse(res, 'Escrow not found', 404);
    }

    return successResponse(res, escrow, 'Escrow retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create escrow
 * POST /api/v1/escrow
 */
export const createEscrow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const escrow = await escrowService.createEscrow({
      ...req.body,
      buyerId: userId,
    });

    return successResponse(res, escrow, 'Escrow created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Fund escrow
 * POST /api/v1/escrow/:id/fund
 */
export const fundEscrow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const result = await escrowService.fundEscrow(id, userId);

    if (!result.success) {
      return errorResponse(res, result.error || 'Failed to fund escrow', 400);
    }

    return successResponse(res, result, 'Escrow funded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark as delivered
 * POST /api/v1/escrow/:id/deliver
 */
export const markDelivered = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { evidence } = req.body;

    const result = await escrowService.markDelivered(id, userId, evidence);

    if (!result.success) {
      return errorResponse(res, result.error || 'Failed to mark as delivered', 400);
    }

    return successResponse(res, result, 'Marked as delivered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm receipt
 * POST /api/v1/escrow/:id/confirm
 */
export const confirmReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const result = await escrowService.confirmReceipt(id, userId);

    if (!result.success) {
      return errorResponse(res, result.error || 'Failed to confirm receipt', 400);
    }

    return successResponse(res, result, 'Receipt confirmed, funds released');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel escrow
 * POST /api/v1/escrow/:id/cancel
 */
export const cancelEscrow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { reason } = req.body;

    const result = await escrowService.cancelEscrow(id, userId, reason || 'Cancelled by user');

    if (!result.success) {
      return errorResponse(res, result.error || 'Failed to cancel escrow', 400);
    }

    return successResponse(res, result, 'Escrow cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Open dispute
 * POST /api/v1/escrow/:id/dispute
 */
export const openDispute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { reason, description, evidence, requestedAmount, requestedOutcome } = req.body;

    const result = await escrowService.openDispute({
      escrowId: id,
      initiatorId: userId,
      reason,
      description,
      evidence,
      requestedAmount,
      requestedOutcome,
    });

    if (!result.success) {
      return errorResponse(res, result.error || 'Failed to open dispute', 400);
    }

    return successResponse(res, result.dispute, 'Dispute opened successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get dispute details
 * GET /api/v1/escrow/disputes/:disputeId
 */
export const getDispute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { disputeId } = req.params;
    const dispute = await escrowService.getDispute(disputeId);

    if (!dispute) {
      return errorResponse(res, 'Dispute not found', 404);
    }

    return successResponse(res, dispute, 'Dispute retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to dispute
 * POST /api/v1/escrow/disputes/:disputeId/respond
 */
export const respondToDispute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { disputeId } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { message, attachments } = req.body;

    const result = await escrowService.respondToDispute(disputeId, userId, message, attachments);

    if (!result.success) {
      return errorResponse(res, result.error || 'Failed to submit response', 400);
    }

    return successResponse(res, result, 'Response submitted successfully');
  } catch (error) {
    next(error);
  }
};
