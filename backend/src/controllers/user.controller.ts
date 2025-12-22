import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { sendSuccess, sendNoContent } from '../utils/response';
import { processAvatar, getPublicUrl, deleteFile } from '../utils/image';
import { BadRequestError } from '../utils/errors';
import type {
  UpdateIndividualProfileInput,
  UpdateBusinessProfileInput,
  ChangePasswordInput,
  GetUserByIdParams,
} from '../validations/user.validation';

/**
 * Get user by ID (public profile)
 * GET /api/v1/users/:id
 */
export const getUserById = async (
  req: Request<GetUserByIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, user, 'User profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics
 * GET /api/v1/users/:id/stats
 */
export const getUserStats = async (
  req: Request<GetUserByIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await userService.getUserStats(req.params.id);
    return sendSuccess(res, stats, 'User statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update individual profile
 * PUT /api/v1/users/profile/individual
 */
export const updateIndividualProfile = async (
  req: Request<object, object, UpdateIndividualProfileInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new BadRequestError('User ID not found');
    }

    const user = await userService.updateIndividualProfile(req.userId, req.body);
    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update business profile
 * PUT /api/v1/users/profile/business
 */
export const updateBusinessProfile = async (
  req: Request<object, object, UpdateBusinessProfileInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new BadRequestError('User ID not found');
    }

    const user = await userService.updateBusinessProfile(req.userId, req.body);
    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload avatar
 * POST /api/v1/users/avatar
 */
export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new BadRequestError('User ID not found');
    }

    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    // Process image with Sharp
    const processedPath = await processAvatar(req.file.path);

    // Get public URL
    const avatarUrl = getPublicUrl(processedPath);

    // Update user avatar in database
    const user = await userService.updateAvatar(req.userId, avatarUrl);

    return sendSuccess(res, user, 'Avatar uploaded successfully');
  } catch (error) {
    // Clean up uploaded file if processing fails
    if (req.file) {
      await deleteFile(req.file.path);
    }
    next(error);
  }
};

/**
 * Delete avatar
 * DELETE /api/v1/users/avatar
 */
export const deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new BadRequestError('User ID not found');
    }

    const user = await userService.deleteAvatar(req.userId);
    return sendSuccess(res, user, 'Avatar deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * PUT /api/v1/users/password
 */
export const changePassword = async (
  req: Request<object, object, ChangePasswordInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new BadRequestError('User ID not found');
    }

    const result = await userService.changePassword(req.userId, req.body);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete account
 * DELETE /api/v1/users/account
 */
export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      throw new BadRequestError('User ID not found');
    }

    const { password } = req.body as { password: string };

    if (!password) {
      throw new BadRequestError('Password is required');
    }

    const result = await userService.deleteAccount(req.userId, password);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
