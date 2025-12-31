import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../lib/prisma';
import { env } from '../config/env';

/**
 * Type alias for Request with authenticated user
 * This is now properly typed via global Express.Request augmentation
 */
export type AuthRequest = Request;

// User type values (matching Prisma schema)
export const UserType = {
  INDIVIDUAL: 'INDIVIDUAL',
  BUSINESS: 'BUSINESS',
} as const;
export type UserType = typeof UserType[keyof typeof UserType];

// User status values (matching Prisma schema)
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
} as const;
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

/**
 * Middleware to authenticate user using JWT
 * Attaches user object to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        userType: true,
        status: true,
        avatar: true,
        rating: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError('User account is not active');
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};

/**
 * Middleware to check if user is a business account
 */
export const requireBusiness = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.userType !== UserType.BUSINESS) {
    return next(new ForbiddenError('This action requires a business account'));
  }

  next();
};

/**
 * Middleware to check if user is an individual account
 */
export const requireIndividual = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.userType !== UserType.INDIVIDUAL) {
    return next(new ForbiddenError('This action requires an individual account'));
  }

  next();
};

/**
 * Middleware to check if user is an admin
 * Admin emails are configured via ADMIN_EMAILS environment variable
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // Check if user has admin privileges by email (from environment variable)
  const adminEmails = env.admin.emails;
  if (adminEmails.length === 0 || !adminEmails.includes(req.user.email.toLowerCase())) {
    return next(new ForbiddenError('Admin access required'));
  }

  next();
};

/**
 * Alias for isAdmin (for backward compatibility)
 */
export const requireAdmin = isAdmin;

/**
 * Optional authentication - doesn't fail if no token provided
 * But validates token if present
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        userType: true,
        status: true,
        avatar: true,
        rating: true,
      },
    });

    if (user && user.status === UserStatus.ACTIVE) {
      req.user = user;
      req.userId = user.id;
    }

    next();
  } catch (error) {
    // Token is invalid, but we don't fail - just continue without auth
    next();
  }
};
