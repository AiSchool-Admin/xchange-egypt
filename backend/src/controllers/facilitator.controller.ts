import { Request, Response, NextFunction } from 'express';
import * as facilitatorService from '../services/facilitator.service';
import { successResponse, errorResponse } from '../utils/response';

// Helper to safely get user ID from request
const getUserId = (req: Request): string | null => req.user?.id || null;

/**
 * Apply to become facilitator
 * POST /api/v1/facilitators/apply
 */
export const applyForFacilitator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const result = await facilitatorService.applyForFacilitator(userId, req.body);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, result.facilitator, 'Application submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get available facilitators
 * GET /api/v1/facilitators
 */
export const getAvailableFacilitators = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { governorate, specialization, minRating, dealValue } = req.query;

    const facilitators = await facilitatorService.findAvailableFacilitators({
      governorate: governorate as string,
      specialization: specialization as string,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      dealValue: dealValue ? parseFloat(dealValue as string) : undefined,
    });

    return successResponse(res, { facilitators }, 'Facilitators retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get top facilitators
 * GET /api/v1/facilitators/top
 */
export const getTopFacilitators = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { governorate, specialization, limit } = req.query;

    const facilitators = await facilitatorService.getTopFacilitators({
      governorate: governorate as string,
      specialization: specialization as string,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    return successResponse(res, { facilitators }, 'Top facilitators retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get facilitator profile
 * GET /api/v1/facilitators/:id
 */
export const getFacilitatorProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const facilitator = await facilitatorService.getFacilitatorProfile(id);

    if (!facilitator) {
      return res.status(404).json({ success: false, message: 'Facilitator not found' });
    }

    return successResponse(res, facilitator, 'Facilitator profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get my facilitator profile
 * GET /api/v1/facilitators/me
 */
export const getMyFacilitatorProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const facilitator = await facilitatorService.getFacilitatorByUserId(userId);

    if (!facilitator) {
      return res.status(404).json({ success: false, message: 'Not registered as facilitator' });
    }

    return successResponse(res, facilitator, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update facilitator profile
 * PATCH /api/v1/facilitators/:id
 */
export const updateFacilitatorProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const result = await facilitatorService.updateFacilitatorProfile(id, userId, req.body);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, result, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle availability
 * POST /api/v1/facilitators/:id/toggle-availability
 */
export const toggleAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const result = await facilitatorService.toggleAvailability(id, userId);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, { isAvailable: result.isAvailable }, 'Availability toggled');
  } catch (error) {
    next(error);
  }
};

/**
 * Assign facilitator
 * POST /api/v1/facilitators/:id/assign
 */
export const assignFacilitator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const result = await facilitatorService.assignFacilitator(id, {
      ...req.body,
      buyerId: userId,
    });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, result.assignment, 'Facilitator assigned successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get my assignments (as facilitator)
 * GET /api/v1/facilitators/my-assignments
 */
export const getMyAssignments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { status, limit, offset } = req.query;

    const facilitator = await facilitatorService.getFacilitatorByUserId(userId);
    if (!facilitator) {
      return res.status(404).json({ success: false, message: 'Not registered as facilitator' });
    }

    const result = await facilitatorService.getFacilitatorAssignments(facilitator.id, {
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    return successResponse(res, result, 'Assignments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Start assignment
 * POST /api/v1/facilitators/assignments/:assignmentId/start
 */
export const startAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assignmentId } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const result = await facilitatorService.startAssignment(assignmentId, userId);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, result, 'Assignment started successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Complete assignment
 * POST /api/v1/facilitators/assignments/:assignmentId/complete
 */
export const completeAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assignmentId } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { completionNotes } = req.body;

    const result = await facilitatorService.completeAssignment(assignmentId, userId, completionNotes);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, result, 'Assignment completed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Submit review
 * POST /api/v1/facilitators/assignments/:assignmentId/review
 */
export const submitReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assignmentId } = req.params;
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const result = await facilitatorService.submitFacilitatorReview(assignmentId, userId, req.body);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    return successResponse(res, result, 'Review submitted successfully');
  } catch (error) {
    next(error);
  }
};
