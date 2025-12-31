import { z } from 'zod';

// =====================================================
// AUTHENTICATION SCHEMAS
// =====================================================

// POST /api/v1/admin/auth/login
export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('بريد إلكتروني غير صالح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  }),
});

// POST /api/v1/admin/auth/refresh
export const adminRefreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'رمز التحديث مطلوب'),
  }),
});

// POST /api/v1/admin/auth/setup
export const adminSetupSchema = z.object({
  body: z.object({
    email: z.string().email('بريد إلكتروني غير صالح'),
    password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  }),
});

// POST /api/v1/admin/auth/force-setup
export const adminForceSetupSchema = z.object({
  body: z.object({
    setupKey: z.string().min(1, 'مفتاح الإعداد مطلوب'),
    email: z.string().email('بريد إلكتروني غير صالح'),
    password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  }),
});

// POST /api/v1/admin/auth/reset-password
export const adminResetPasswordSchema = z.object({
  body: z.object({
    setupKey: z.string().min(1, 'مفتاح الإعداد مطلوب'),
    email: z.string().email('بريد إلكتروني غير صالح'),
    newPassword: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  }),
});

// =====================================================
// ADMIN MANAGEMENT SCHEMAS
// =====================================================

// POST /api/v1/admin/admins
export const createAdminSchema = z.object({
  body: z.object({
    email: z.string().email('بريد إلكتروني غير صالح'),
    password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    role: z.enum(['ADMIN', 'MODERATOR', 'SUPPORT', 'ANALYST']),
    permissions: z.array(z.string()).optional(),
  }),
});

// PUT /api/v1/admin/admins/:adminId
export const updateAdminSchema = z.object({
  params: z.object({
    adminId: z.string().min(1, 'معرف المسؤول مطلوب'),
  }),
  body: z.object({
    email: z.string().email('بريد إلكتروني غير صالح').optional(),
    fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').optional(),
    role: z.enum(['ADMIN', 'MODERATOR', 'SUPPORT', 'ANALYST']).optional(),
    permissions: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

// DELETE /api/v1/admin/admins/:adminId
export const deleteAdminSchema = z.object({
  params: z.object({
    adminId: z.string().min(1, 'معرف المسؤول مطلوب'),
  }),
});

// =====================================================
// USER MANAGEMENT SCHEMAS
// =====================================================

// GET /api/v1/admin/users
export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).optional(),
    search: z.string().optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']).optional(),
    sort: z.enum(['createdAt', 'fullName', 'email']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

// GET /api/v1/admin/users/:userId
export const getUserSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'معرف المستخدم مطلوب'),
  }),
});

// POST /api/v1/admin/users/:userId/suspend
export const suspendUserSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'معرف المستخدم مطلوب'),
  }),
  body: z.object({
    reason: z.string().min(10, 'السبب يجب أن يكون 10 أحرف على الأقل').max(500),
    duration: z.number().int().positive().optional(), // Duration in days
  }),
});

// POST /api/v1/admin/users/:userId/activate
export const activateUserSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'معرف المستخدم مطلوب'),
  }),
});

// DELETE /api/v1/admin/users/:userId
export const deleteUserSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'معرف المستخدم مطلوب'),
  }),
});

// =====================================================
// LISTING MANAGEMENT SCHEMAS
// =====================================================

// GET /api/v1/admin/listings
export const listListingsSchema = z.object({
  query: z.object({
    page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)).optional(),
    status: z.enum(['ACTIVE', 'PENDING', 'SOLD', 'EXPIRED', 'REJECTED']).optional(),
    categoryId: z.string().optional(),
    userId: z.string().optional(),
  }),
});

// DELETE /api/v1/admin/listings/:itemId
export const deleteListingSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, 'معرف المنتج مطلوب'),
  }),
  body: z.object({
    reason: z.string().min(5, 'السبب مطلوب').max(500).optional(),
  }),
});

// POST /api/v1/admin/listings/:itemId/feature
export const featureListingSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, 'معرف المنتج مطلوب'),
  }),
  body: z.object({
    featured: z.boolean(),
    duration: z.number().int().positive().optional(), // Duration in days
  }),
});

// =====================================================
// SETTINGS SCHEMAS
// =====================================================

// PUT /api/v1/admin/settings/:key
export const updateSettingSchema = z.object({
  params: z.object({
    key: z.string().min(1, 'مفتاح الإعداد مطلوب'),
  }),
  body: z.object({
    value: z.unknown(),
  }),
});

// =====================================================
// REPORTS SCHEMAS
// =====================================================

// PUT /api/v1/admin/reports/:reportId
export const updateReportSchema = z.object({
  params: z.object({
    reportId: z.string().min(1, 'معرف البلاغ مطلوب'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED']),
    resolution: z.string().max(1000).optional(),
    action: z.enum(['NONE', 'WARNING', 'SUSPEND', 'DELETE']).optional(),
  }),
});

// =====================================================
// CATEGORY MANAGEMENT SCHEMAS
// =====================================================

// POST /api/v1/admin/categories
export const createCategorySchema = z.object({
  body: z.object({
    nameAr: z.string().min(2, 'الاسم بالعربية مطلوب'),
    nameEn: z.string().min(2, 'الاسم بالإنجليزية مطلوب'),
    slug: z.string().min(2, 'المعرف مطلوب').regex(/^[a-z0-9-]+$/, 'المعرف يجب أن يحتوي على حروف صغيرة وأرقام وشرطات فقط'),
    parentId: z.string().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// PUT /api/v1/admin/categories/:categoryId
export const updateCategorySchema = z.object({
  params: z.object({
    categoryId: z.string().min(1, 'معرف الفئة مطلوب'),
  }),
  body: z.object({
    nameAr: z.string().min(2).optional(),
    nameEn: z.string().min(2).optional(),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
    parentId: z.string().nullable().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// DELETE /api/v1/admin/categories/:categoryId
export const deleteCategorySchema = z.object({
  params: z.object({
    categoryId: z.string().min(1, 'معرف الفئة مطلوب'),
  }),
});

// Type exports
export type AdminLoginInput = z.infer<typeof adminLoginSchema>['body'];
export type CreateAdminInput = z.infer<typeof createAdminSchema>['body'];
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>['body'];
export type SuspendUserInput = z.infer<typeof suspendUserSchema>['body'];
export type UpdateReportInput = z.infer<typeof updateReportSchema>['body'];
export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
