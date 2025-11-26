/**
 * Admin Authorization Middleware
 * Ensures user has admin privileges
 */

import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserType } from '@prisma/client';

/**
 * Middleware to require admin role
 * MUST be used after authenticate middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Check if user is admin
    if (req.user.userType !== UserType.ADMIN) {
      throw new ForbiddenError('Admin access required');
    }

    // Log admin action for audit trail
    console.log(`[ADMIN ACTION] User ${req.user.email} (${req.user.id}) accessed ${req.method} ${req.path}`);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require super admin role (future feature)
 * For critical operations like deleting users, changing admin status
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.userType !== UserType.ADMIN) {
      throw new ForbiddenError('Admin access required');
    }

    // TODO: Add super admin check when role field is added
    // For now, all admins are super admins
    console.log(`[SUPER ADMIN ACTION] User ${req.user.email} (${req.user.id}) accessed ${req.method} ${req.path}`);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to log all admin actions for audit
 */
export const auditLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const action = `${req.method} ${req.path}`;
    const timestamp = new Date().toISOString();

    // Log to console (in production, this should go to a database/log service)
    console.log(JSON.stringify({
      timestamp,
      action,
      user: user ? { id: user.id, email: user.email, type: user.userType } : null,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      body: req.method !== 'GET' ? req.body : undefined,
    }));

    // TODO: Store in audit_logs table when implemented
    // await prisma.auditLog.create({ ... });

    next();
  } catch (error) {
    // Don't block request if audit logging fails
    console.error('Audit logging failed:', error);
    next();
  }
};
