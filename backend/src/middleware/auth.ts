import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { verifyAccessToken } from '../utils/jwt';
import prisma from '../lib/prisma';

/**
 * Type alias for Request with authenticated user
 * This is now properly typed via global Express.Request augmentation
 */
export type AuthRequest = Request;

// User type enum (matching Prisma schema)
export enum UserType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS'
}

// User status enum (matching Prisma schema)
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

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
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // Check if user has admin privileges by email (admin emails list)
  const adminEmails = ['admin@xchange.com', 'admin@xchange-egypt.com'];
  if (!adminEmails.includes(req.user.email)) {
    return next(new ForbiddenError('Admin access required'));
  }

  next();
};

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
