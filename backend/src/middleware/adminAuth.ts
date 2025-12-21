import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { verifyAdminAccessToken } from '../utils/adminJwt';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

/**
 * Type alias for Request with authenticated admin
 * This is now properly typed via global Express.Request augmentation
 */
export type AdminRequest = Request;

// Admin role values (matching Prisma schema)
export const AdminRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  SUPPORT: 'SUPPORT',
} as const;
export type AdminRole = typeof AdminRole[keyof typeof AdminRole];

// Admin status values (matching Prisma schema)
export const AdminStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
} as const;
export type AdminStatus = typeof AdminStatus[keyof typeof AdminStatus];

// صلاحيات كل دور
const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: [
    'admin:create', 'admin:read', 'admin:update', 'admin:delete',
    'users:read', 'users:update', 'users:suspend', 'users:delete',
    'listings:read', 'listings:update', 'listings:delete', 'listings:feature',
    'orders:read', 'orders:update', 'orders:cancel',
    'reports:read', 'reports:resolve',
    'settings:read', 'settings:update',
    'stats:read', 'logs:read',
    'donations:manage', 'charities:manage',
    'categories:manage', 'promotions:manage'
  ],
  ADMIN: [
    'users:read', 'users:update', 'users:suspend',
    'listings:read', 'listings:update', 'listings:delete', 'listings:feature',
    'orders:read', 'orders:update',
    'reports:read', 'reports:resolve',
    'settings:read',
    'stats:read', 'logs:read',
    'donations:manage', 'charities:manage',
    'categories:manage', 'promotions:manage'
  ],
  MODERATOR: [
    'users:read',
    'listings:read', 'listings:update', 'listings:delete',
    'reports:read', 'reports:resolve',
    'stats:read'
  ],
  SUPPORT: [
    'users:read',
    'listings:read',
    'orders:read',
    'reports:read'
  ]
};

/**
 * Get all permissions for an admin (role + custom)
 */
export const getAdminPermissions = (role: AdminRole, customPermissions: string[] = []): string[] => {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return [...new Set([...rolePermissions, ...customPermissions])];
};

/**
 * Middleware to authenticate admin using JWT
 */
export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('لم يتم توفير رمز المصادقة');
    }

    const token = authHeader.substring(7);
    const decoded = verifyAdminAccessToken(token);

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        avatar: true,
        customPermissions: true,
        twoFactorEnabled: true,
        lockedUntil: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedError('المدير غير موجود');
    }

    if (admin.status !== AdminStatus.ACTIVE) {
      throw new UnauthorizedError('حساب المدير غير نشط');
    }

    if (admin.lockedUntil && new Date(admin.lockedUntil) > new Date()) {
      throw new UnauthorizedError('حساب المدير مقفل مؤقتاً');
    }

    // Attach admin with permissions
    req.admin = {
      ...admin,
      permissions: getAdminPermissions(admin.role, admin.customPermissions),
    };
    req.adminId = admin.id;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('رمز مصادقة غير صالح أو منتهي'));
    }
  }
};

/**
 * Middleware to check specific permission
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new UnauthorizedError('مطلوب مصادقة المدير'));
    }

    const permissions = req.admin.permissions || [];

    if (!permissions.includes(permission)) {
      return next(new ForbiddenError(`ليس لديك صلاحية: ${permission}`));
    }

    next();
  };
};

/**
 * Middleware to check if admin has one of the given roles
 */
export const requireRole = (...roles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new UnauthorizedError('مطلوب مصادقة المدير'));
    }

    if (!roles.includes(req.admin.role)) {
      return next(new ForbiddenError('ليس لديك الدور المطلوب لهذه العملية'));
    }

    next();
  };
};

/**
 * Middleware for super admin only
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.admin) {
    return next(new UnauthorizedError('مطلوب مصادقة المدير'));
  }

  if (req.admin.role !== AdminRole.SUPER_ADMIN) {
    return next(new ForbiddenError('هذه العملية متاحة فقط لمدير النظام الأعلى'));
  }

  next();
};

/**
 * Log admin activity
 */
export const logAdminActivity = async (
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>,
  req?: Request
) => {
  try {
    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details,
        ipAddress: req?.ip || req?.headers['x-forwarded-for']?.toString(),
        userAgent: req?.headers['user-agent'],
      },
    });
  } catch (error) {
    logger.error('Failed to log admin activity:', error);
  }
};
