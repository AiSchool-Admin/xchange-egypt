/**
 * Founder Controller
 * وحدة تحكم المؤسس
 */

import { Request, Response, NextFunction } from 'express';
import * as founderService from '../services/founder.service';
import { AppError } from '../utils/errors';

/**
 * Login founder - تسجيل دخول المؤسس
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'البريد الإلكتروني وكلمة المرور مطلوبان');
    }

    const result = await founderService.loginFounder({
      email,
      password,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token - تحديث الرمز
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(400, 'رمز التحديث مطلوب');
    }

    const result = await founderService.refreshFounderToken(
      refreshToken,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout - تسجيل الخروج
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await founderService.logoutFounder(refreshToken);
    }

    res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get profile - الحصول على الملف الشخصي
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const founderId = req.founder!.id;
    const profile = await founderService.getFounderProfile(founderId);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update profile - تحديث الملف الشخصي
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const founderId = req.founder!.id;
    const { fullName, phone, avatar, title, companyName } = req.body;

    const updated = await founderService.updateFounderProfile(founderId, {
      fullName,
      phone,
      avatar,
      title,
      companyName,
    });

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password - تغيير كلمة المرور
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const founderId = req.founder!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError(400, 'كلمة المرور الحالية والجديدة مطلوبتان');
    }

    if (newPassword.length < 8) {
      throw new AppError(400, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل');
    }

    const result = await founderService.changeFounderPassword(
      founderId,
      currentPassword,
      newPassword
    );

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get board statistics - إحصائيات مجلس الإدارة
 */
export const getBoardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const founderId = req.founder!.id;
    const stats = await founderService.getFounderBoardStats(founderId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
