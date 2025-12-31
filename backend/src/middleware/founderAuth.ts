import { Request, Response, NextFunction } from 'express';
import { verifyFounderAccessToken } from '../utils/founderJwt';
import prisma from '../lib/prisma';
import { UnauthorizedError } from '../utils/errors';

// Extend Express Request to include founder
declare global {
  namespace Express {
    interface Request {
      founder?: {
        id: string;
        email: string;
        fullName: string;
        title: string;
        companyName: string;
      };
    }
  }
}

/**
 * Authenticate Founder - مصادقة المؤسس
 * This middleware is REQUIRED for all board routes
 */
export const authenticateFounder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('مطلوب تسجيل الدخول كمؤسس');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyFounderAccessToken(token);

    // Get founder from database
    const founder = await prisma.founder.findUnique({
      where: { id: decoded.founderId },
      select: {
        id: true,
        email: true,
        fullName: true,
        title: true,
        companyName: true,
      },
    });

    if (!founder) {
      throw new UnauthorizedError('حساب المؤسس غير موجود');
    }

    // Attach founder to request
    req.founder = founder;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        success: false,
        message: error.message,
        code: 'FOUNDER_AUTH_REQUIRED',
      });
    }

    // JWT errors
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صالح',
        code: 'INVALID_TOKEN',
      });
    }

    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية رمز المصادقة',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'فشل المصادقة',
      code: 'AUTH_FAILED',
    });
  }
};

/**
 * Require Founder - التحقق من أن المستخدم هو المؤسس
 * Use after authenticateFounder middleware
 */
export const requireFounder = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.founder) {
    return res.status(403).json({
      success: false,
      message: 'هذه الصفحة متاحة للمؤسس فقط',
      code: 'FOUNDER_ONLY',
    });
  }

  next();
};
