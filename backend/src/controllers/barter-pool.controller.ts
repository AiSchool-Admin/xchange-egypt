import { Request, Response, NextFunction } from 'express';
import * as barterPoolService from '../services/barter-pool.service';
import { successResponse } from '../utils/response';

/**
 * Get open pools
 * GET /api/v1/barter-pools
 */
export const getOpenPools = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, minValue, maxValue, limit, offset } = req.query;

    const result = await barterPoolService.getOpenPools({
      categoryId: categoryId as string,
      minValue: minValue ? parseFloat(minValue as string) : undefined,
      maxValue: maxValue ? parseFloat(maxValue as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    return successResponse(res, result, 'Open pools retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get pool by ID
 * GET /api/v1/barter-pools/:id
 */
export const getPool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const pool = await barterPoolService.getPool(id);

    if (!pool) {
      return res.status(404).json({ success: false, message: 'Pool not found' });
    }

    return successResponse(res, pool, 'Pool retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create pool
 * POST /api/v1/barter-pools
 */
export const createPool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const pool = await barterPoolService.createPool({
      ...req.body,
      creatorId: userId,
    });

    return successResponse(res, pool, 'Pool created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Join pool
 * POST /api/v1/barter-pools/:id/join
 */
export const joinPool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { itemId, cashAmount, xcoinAmount } = req.body;

    const result = await barterPoolService.joinPool({
      poolId: id,
      userId,
      itemId,
      cashAmount,
      xcoinAmount,
    });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, result, 'Joined pool successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Leave pool
 * POST /api/v1/barter-pools/:id/leave
 */
export const leavePool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await barterPoolService.leavePool(id, userId);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, result, 'Left pool successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Approve participant
 * POST /api/v1/barter-pools/:id/approve/:participantUserId
 */
export const approveParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, participantUserId } = req.params;
    const userId = req.user!.id;

    const result = await barterPoolService.approveParticipant(id, participantUserId, userId);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, result, 'Participant approved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Start matching
 * POST /api/v1/barter-pools/:id/start-matching
 */
export const startMatching = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await barterPoolService.startMatching(id, userId);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, result, 'Matching started successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Accept match
 * POST /api/v1/barter-pools/:id/accept-match
 */
export const acceptMatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await barterPoolService.acceptMatch(id, userId);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, result, 'Match accepted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel pool
 * DELETE /api/v1/barter-pools/:id
 */
export const cancelPool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const result = await barterPoolService.cancelPool(id, userId);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, result, 'Pool cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get my pools
 * GET /api/v1/barter-pools/my-pools
 */
export const getMyPools = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { role, status, limit, offset } = req.query;

    const result = await barterPoolService.getUserPools(userId, {
      role: role as 'CREATOR' | 'PARTICIPANT' | 'ALL',
      status: status as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    return successResponse(res, result, 'My pools retrieved successfully');
  } catch (error) {
    next(error);
  }
};
