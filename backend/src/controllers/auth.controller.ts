import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response';
import type {
  RegisterIndividualInput,
  RegisterBusinessInput,
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validations/auth.validation';

/**
 * Register individual user
 * POST /api/v1/auth/register/individual
 */
export const registerIndividual = async (
  req: Request<object, object, RegisterIndividualInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.registerIndividual(req.body);

    return sendCreated(res, result, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Register business user
 * POST /api/v1/auth/register/business
 */
export const registerBusiness = async (
  req: Request<object, object, RegisterBusinessInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.registerBusiness(req.body);

    return sendCreated(res, result, 'Business account registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Login
 * POST /api/v1/auth/login
 */
export const login = async (
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.login(req.body);

    return sendSuccess(res, result, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = async (
  req: Request<object, object, RefreshTokenInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);

    return sendSuccess(res, result, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 * POST /api/v1/auth/logout
 */
export const logout = async (
  req: Request<object, object, RefreshTokenInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.logout(req.body.refreshToken);

    return sendSuccess(res, result, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout from all devices
 * POST /api/v1/auth/logout-all
 */
export const logoutAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await authService.logoutAll(req.userId);

    return sendSuccess(res, result, 'Logged out from all devices');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await authService.getUserProfile(req.userId);

    return sendSuccess(res, user, 'User profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PUT /api/v1/auth/me
 */
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await authService.updateProfile(req.userId, req.body);

    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * POST /api/v1/auth/forgot-password
 */
export const forgotPassword = async (
  req: Request<object, object, ForgotPasswordInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.forgotPassword(req.body);

    return sendSuccess(res, result, 'Password reset request processed');
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using token
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = async (
  req: Request<object, object, ResetPasswordInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.resetPassword(req.body);

    return sendSuccess(res, result, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};
