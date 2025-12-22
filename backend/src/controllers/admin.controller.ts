/**
 * Admin Controller
 * Comprehensive endpoints for platform administration
 */

import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import * as matchingService from '../services/barter-matching.service';
import { successResponse } from '../utils/response';
import prisma from '../lib/prisma';
import { AdminRequest } from '../middleware/adminAuth';
import { getAdminPermissions } from '../middleware/adminAuth';

// ==========================================
// Authentication
// ==========================================

/**
 * Admin Login
 * POST /api/v1/admin/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const result = await adminService.loginAdmin({
      email,
      password,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return successResponse(res, result, 'تم تسجيل الدخول بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Token
 * POST /api/v1/admin/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    const result = await adminService.refreshAdminToken(
      refreshToken,
      req.ip,
      req.headers['user-agent']
    );

    return successResponse(res, result, 'تم تحديث الرمز بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Logout
 * POST /api/v1/admin/auth/logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { refreshToken } = req.body;

    await adminService.logoutAdmin(adminReq.adminId, refreshToken);

    return successResponse(res, null, 'تم تسجيل الخروج بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Admin
 * GET /api/v1/admin/auth/me
 */
export const getCurrentAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;

    return successResponse(res, {
      admin: adminReq.admin,
      permissions: adminReq.admin.permissions,
    }, 'تم جلب بيانات المدير بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Initial Setup - Create first super admin
 * POST /api/v1/admin/auth/setup
 */
export const initialSetup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور والاسم مطلوبون',
      });
    }

    const admin = await adminService.createInitialSuperAdmin(email, password, fullName);

    return successResponse(res, { admin }, 'تم إنشاء مدير النظام الأول بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Force Setup - Create or reset super admin (requires ADMIN_SETUP_KEY)
 * POST /api/v1/admin/auth/force-setup
 */
export const forceSetup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName, setupKey } = req.body;

    if (!email || !password || !fullName || !setupKey) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة: email, password, fullName, setupKey',
      });
    }

    const result = await adminService.forceCreateSuperAdmin(email, password, fullName, setupKey);

    const message = result.created
      ? 'تم إنشاء مدير النظام بنجاح'
      : 'تم تحديث مدير النظام بنجاح';

    return successResponse(res, { admin: result.admin }, message);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password - Reset admin password (requires ADMIN_SETUP_KEY)
 * POST /api/v1/admin/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, newPassword, setupKey } = req.body;

    if (!email || !newPassword || !setupKey) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة: email, newPassword, setupKey',
      });
    }

    const admin = await adminService.resetAdminPassword(email, newPassword, setupKey);

    return successResponse(res, { admin }, 'تم إعادة تعيين كلمة المرور بنجاح');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Admin Management
// ==========================================

/**
 * Get All Admins
 * GET /api/v1/admin/admins
 */
export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const admins = await adminService.getAllAdmins(adminReq.admin.role);

    return successResponse(res, { admins }, 'تم جلب قائمة المديرين بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Create Admin
 * POST /api/v1/admin/admins
 */
export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { email, password, fullName, phone, role } = req.body;

    const admin = await adminService.createAdmin({
      email,
      password,
      fullName,
      phone,
      role,
      createdBy: adminReq.adminId,
    });

    return successResponse(res, { admin }, 'تم إنشاء المدير بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Admin
 * PUT /api/v1/admin/admins/:adminId
 */
export const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { adminId } = req.params;
    const updateData = req.body;

    const admin = await adminService.updateAdmin(adminId, updateData, adminReq.adminId);

    return successResponse(res, { admin }, 'تم تحديث المدير بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Admin
 * DELETE /api/v1/admin/admins/:adminId
 */
export const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { adminId } = req.params;

    // Prevent self-deletion
    if (adminId === adminReq.adminId) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك حذف حسابك الخاص',
      });
    }

    await adminService.updateAdmin(adminId, { status: 'DELETED' }, adminReq.adminId);

    return successResponse(res, null, 'تم حذف المدير بنجاح');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Dashboard & Statistics
// ==========================================

/**
 * Get Dashboard Statistics
 * GET /api/v1/admin/dashboard/stats
 */
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();

    return successResponse(res, stats, 'تم جلب الإحصائيات بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Activity Logs
 * GET /api/v1/admin/logs
 */
export const getActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, adminId, action, startDate, endDate } = req.query;

    const result = await adminService.getActivityLogs({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      adminId: adminId as string,
      action: action as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    return successResponse(res, result, 'تم جلب سجل النشاط بنجاح');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// User Management
// ==========================================

/**
 * Get All Users
 * GET /api/v1/admin/users
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, status, userType, sortBy, sortOrder } = req.query;

    const result = await adminService.getUsers({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string,
      status: status as any,
      userType: userType as any,
      sortBy: sortBy as string,
      sortOrder: sortOrder as any,
    });

    return successResponse(res, result, 'تم جلب قائمة المستخدمين بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Details
 * GET /api/v1/admin/users/:userId
 */
export const getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const user = await adminService.getUserDetails(userId);

    return successResponse(res, { user }, 'تم جلب بيانات المستخدم بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Suspend User
 * POST /api/v1/admin/users/:userId/suspend
 */
export const suspendUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await adminService.suspendUser(userId, reason || 'مخالفة شروط الاستخدام', adminReq.adminId);

    return successResponse(res, { user }, 'تم إيقاف المستخدم بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Activate User
 * POST /api/v1/admin/users/:userId/activate
 */
export const activateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { userId } = req.params;

    const user = await adminService.activateUser(userId, adminReq.adminId);

    return successResponse(res, { user }, 'تم تفعيل المستخدم بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete User
 * DELETE /api/v1/admin/users/:userId
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { userId } = req.params;

    const user = await adminService.deleteUser(userId, adminReq.adminId);

    return successResponse(res, { user }, 'تم حذف المستخدم بنجاح');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Listings Management
// ==========================================

/**
 * Get All Listings
 * GET /api/v1/admin/listings
 */
export const getListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, status, categoryId, sortBy, sortOrder } = req.query;

    const result = await adminService.getListings({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string,
      status: status as any,
      categoryId: categoryId as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as any,
    });

    return successResponse(res, result, 'تم جلب قائمة الإعلانات بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Listing
 * DELETE /api/v1/admin/listings/:itemId
 */
export const deleteListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { itemId } = req.params;
    const { reason } = req.body;

    const item = await adminService.deleteListing(itemId, reason || 'مخالفة شروط الاستخدام', adminReq.adminId);

    return successResponse(res, { item }, 'تم حذف الإعلان بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Feature Listing
 * POST /api/v1/admin/listings/:itemId/feature
 */
export const featureListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { itemId } = req.params;
    const { featured } = req.body;

    const item = await prisma.item.update({
      where: { id: itemId },
      data: { promotionTier: featured ? 'FEATURED' : 'BASIC' },
    });

    return successResponse(res, { item }, featured ? 'تم تمييز الإعلان بنجاح' : 'تم إلغاء تمييز الإعلان');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Platform Settings
// ==========================================

/**
 * Get All Settings
 * GET /api/v1/admin/settings
 */
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;
    const settings = await adminService.getSettings(category as string);

    return successResponse(res, { settings }, 'تم جلب الإعدادات بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Setting
 * PUT /api/v1/admin/settings/:key
 */
export const updateSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { key } = req.params;
    const { value } = req.body;

    const setting = await adminService.updateSetting(key, value, adminReq.adminId);

    return successResponse(res, { setting }, 'تم تحديث الإعداد بنجاح');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Content Reports
// ==========================================

/**
 * Get Content Reports
 * GET /api/v1/admin/reports
 */
export const getContentReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, targetType } = req.query;

    const result = await adminService.getContentReports({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string,
      targetType: targetType as string,
    });

    return successResponse(res, result, 'تم جلب البلاغات بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve Report
 * PUT /api/v1/admin/reports/:reportId
 */
export const resolveReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { reportId } = req.params;
    const { resolution, status } = req.body;

    const report = await adminService.resolveReport(reportId, resolution, status, adminReq.adminId);

    return successResponse(res, { report }, 'تم معالجة البلاغ بنجاح');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Categories Management
// ==========================================

/**
 * Create Category
 * POST /api/v1/admin/categories
 */
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const categoryData = req.body;

    const category = await adminService.createCategory(categoryData, adminReq.adminId);

    return successResponse(res, { category }, 'تم إنشاء الفئة بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Category
 * PUT /api/v1/admin/categories/:categoryId
 */
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { categoryId } = req.params;
    const updateData = req.body;

    const category = await adminService.updateCategory(categoryId, updateData, adminReq.adminId);

    return successResponse(res, { category }, 'تم تحديث الفئة بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Category
 * DELETE /api/v1/admin/categories/:categoryId
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminReq = req as AdminRequest;
    const { categoryId } = req.params;

    await adminService.deleteCategory(categoryId, adminReq.adminId);

    return successResponse(res, null, 'تم حذف الفئة بنجاح');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Legacy Admin Functions
// ==========================================

// Mapping of English governorate names to Arabic
const GOVERNORATE_EN_TO_AR: Record<string, string> = {
  'Cairo': 'القاهرة',
  'cairo': 'القاهرة',
  'Giza': 'الجيزة',
  'giza': 'الجيزة',
  'Alexandria': 'الإسكندرية',
  'alexandria': 'الإسكندرية',
  'Dakahlia': 'الدقهلية',
  'dakahlia': 'الدقهلية',
  'Sharqia': 'الشرقية',
  'sharqia': 'الشرقية',
  'Qalyubia': 'القليوبية',
  'qalyubia': 'القليوبية',
  'Gharbia': 'الغربية',
  'gharbia': 'الغربية',
  'Menoufia': 'المنوفية',
  'menoufia': 'المنوفية',
  'Beheira': 'البحيرة',
  'beheira': 'البحيرة',
  'Kafr El Sheikh': 'كفر الشيخ',
  'kafr-el-sheikh': 'كفر الشيخ',
  'Damietta': 'دمياط',
  'damietta': 'دمياط',
  'Port Said': 'بورسعيد',
  'port-said': 'بورسعيد',
  'Ismailia': 'الإسماعيلية',
  'ismailia': 'الإسماعيلية',
  'Suez': 'السويس',
  'suez': 'السويس',
  'North Sinai': 'شمال سيناء',
  'north-sinai': 'شمال سيناء',
  'South Sinai': 'جنوب سيناء',
  'south-sinai': 'جنوب سيناء',
  'Red Sea': 'البحر الأحمر',
  'red-sea': 'البحر الأحمر',
  'Matrouh': 'مطروح',
  'matrouh': 'مطروح',
  'New Valley': 'الوادي الجديد',
  'new-valley': 'الوادي الجديد',
  'Fayoum': 'الفيوم',
  'fayoum': 'الفيوم',
  'Beni Suef': 'بني سويف',
  'beni-suef': 'بني سويف',
  'Minya': 'المنيا',
  'minya': 'المنيا',
  'Assiut': 'أسيوط',
  'assiut': 'أسيوط',
  'Sohag': 'سوهاج',
  'sohag': 'سوهاج',
  'Qena': 'قنا',
  'qena': 'قنا',
  'Luxor': 'الأقصر',
  'luxor': 'الأقصر',
  'Aswan': 'أسوان',
  'aswan': 'أسوان',
};

const toArabicGovernorate = (governorate: string): string => {
  return GOVERNORATE_EN_TO_AR[governorate] || GOVERNORATE_EN_TO_AR[governorate.toLowerCase()] || governorate;
};

/**
 * Populate governorate field for items based on seller's governorate
 * POST /api/v1/admin/populate-governorates
 */
export const populateGovernorates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('[Admin] Starting governorate population...');

    const usersWithEnglishGov = await prisma.user.findMany({
      where: { governorate: { not: null } },
      select: { id: true, governorate: true },
    });

    let usersUpdated = 0;
    for (const user of usersWithEnglishGov) {
      if (user.governorate && GOVERNORATE_EN_TO_AR[user.governorate]) {
        await prisma.user.update({
          where: { id: user.id },
          data: { governorate: GOVERNORATE_EN_TO_AR[user.governorate] },
        });
        usersUpdated++;
      }
    }

    const itemsWithEnglishGov = await prisma.item.findMany({
      where: { governorate: { not: null } },
      select: { id: true, governorate: true },
    });

    let itemsConvertedToArabic = 0;
    for (const item of itemsWithEnglishGov) {
      if (item.governorate && GOVERNORATE_EN_TO_AR[item.governorate]) {
        await prisma.item.update({
          where: { id: item.id },
          data: { governorate: GOVERNORATE_EN_TO_AR[item.governorate] },
        });
        itemsConvertedToArabic++;
      }
    }

    const itemsWithoutGovernorate = await prisma.item.findMany({
      where: { governorate: null },
      include: {
        seller: { select: { id: true, governorate: true } },
      },
    });

    let updatedCount = 0;
    let skippedCount = 0;

    for (const item of itemsWithoutGovernorate) {
      if (item.seller?.governorate) {
        const arabicGovernorate = toArabicGovernorate(item.seller.governorate);
        await prisma.item.update({
          where: { id: item.id },
          data: { governorate: arabicGovernorate },
        });
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    return successResponse(res, {
      usersUpdated,
      itemsConvertedToArabic,
      itemsWithoutGovernorate: itemsWithoutGovernorate.length,
      itemsPopulated: updatedCount,
      itemsSkipped: skippedCount,
    }, 'Governorate population completed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Run retroactive matching for all existing items
 * POST /api/v1/admin/retroactive-matching
 */
export const runRetroactiveMatching = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('[Admin] Starting retroactive matching...');

    const items = await prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        desiredCategoryId: { not: null },
      },
      select: { id: true, sellerId: true, title: true },
    });

    let notificationsSent = 0;
    const notifiedUsers = new Set<string>();

    for (const item of items) {
      try {
        const matches = await matchingService.findMatchesForUser(
          item.sellerId,
          item.id,
          { includeCycles: true, maxResults: 10 }
        );

        const highQualityMatches = matches.cycles.filter(
          cycle => cycle.averageScore >= 0.60
        );

        for (const cycle of highQualityMatches.slice(0, 3)) {
          for (const participant of cycle.participants) {
            if (notifiedUsers.has(participant.userId)) continue;

            const existing = await prisma.notification.findFirst({
              where: {
                userId: participant.userId,
                type: 'BARTER_MATCH',
                entityId: item.id,
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
              },
            });

            if (!existing) {
              await prisma.notification.create({
                data: {
                  userId: participant.userId,
                  type: 'BARTER_MATCH',
                  title: '🎉 New Barter Match Found!',
                  message: `Your item matches with ${cycle.participants.length} other items (${(cycle.averageScore * 100).toFixed(0)}% match)`,
                  entityId: item.id,
                  entityType: 'Item',
                } as any,
              });

              notificationsSent++;
              notifiedUsers.add(participant.userId);
            }
          }
        }
      } catch (error) {
        console.error(`[Admin] Error processing item ${item.id}:`, error);
      }
    }

    return successResponse(res, {
      itemsProcessed: items.length,
      notificationsSent,
      usersNotified: notifiedUsers.size,
    }, 'Retroactive matching completed successfully');
  } catch (error) {
    next(error);
  }
};
