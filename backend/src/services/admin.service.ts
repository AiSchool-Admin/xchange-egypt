import prisma from '../config/database';
import { AdminRole, AdminStatus, UserStatus, ItemStatus, OrderStatus } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAdminAccessToken, generateAdminRefreshToken, verifyAdminRefreshToken } from '../utils/adminJwt';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

// ==========================================
// Admin Authentication
// ==========================================

interface AdminLoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

interface CreateAdminInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: AdminRole;
  createdBy?: string;
}

/**
 * Login admin
 */
export const loginAdmin = async (input: AdminLoginInput) => {
  const { email, password, ipAddress, userAgent } = input;

  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!admin) {
    throw new UnauthorizedError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // Check if account is locked
  if (admin.lockedUntil && new Date(admin.lockedUntil) > new Date()) {
    const remainingMinutes = Math.ceil(
      (new Date(admin.lockedUntil).getTime() - Date.now()) / 60000
    );
    throw new UnauthorizedError(`الحساب مقفل. يرجى المحاولة بعد ${remainingMinutes} دقيقة`);
  }

  // Verify password
  const isValidPassword = await comparePassword(password, admin.passwordHash);

  if (!isValidPassword) {
    // Increment failed attempts
    const failedAttempts = admin.failedLoginAttempts + 1;
    const updates: any = { failedLoginAttempts: failedAttempts };

    // Lock account after 5 failed attempts
    if (failedAttempts >= 5) {
      updates.lockedUntil = new Date(Date.now() + 30 * 60000); // 30 minutes
      updates.failedLoginAttempts = 0;
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: updates,
    });

    throw new UnauthorizedError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  if (admin.status !== AdminStatus.ACTIVE) {
    throw new UnauthorizedError('حساب المدير غير نشط');
  }

  // Generate tokens
  const accessToken = generateAdminAccessToken({
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  });

  const refreshToken = generateAdminRefreshToken({
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  });

  // Store refresh token
  await prisma.adminRefreshToken.create({
    data: {
      token: refreshToken,
      adminId: admin.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      ipAddress,
      userAgent,
    },
  });

  // Update login info and reset failed attempts
  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  // Log activity
  await prisma.adminActivityLog.create({
    data: {
      adminId: admin.id,
      action: 'admin_login',
      ipAddress,
      userAgent,
    },
  });

  return {
    accessToken,
    refreshToken,
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      avatar: admin.avatar,
    },
  };
};

/**
 * Refresh admin token
 */
export const refreshAdminToken = async (refreshToken: string, ipAddress?: string, userAgent?: string) => {
  // Verify token
  let decoded;
  try {
    decoded = verifyAdminRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('رمز التحديث غير صالح');
  }

  // Check if token exists in database
  const storedToken = await prisma.adminRefreshToken.findUnique({
    where: { token: refreshToken },
    include: { admin: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError('رمز التحديث منتهي الصلاحية');
  }

  if (storedToken.admin.status !== AdminStatus.ACTIVE) {
    throw new UnauthorizedError('حساب المدير غير نشط');
  }

  // Generate new tokens
  const newAccessToken = generateAdminAccessToken({
    adminId: storedToken.admin.id,
    email: storedToken.admin.email,
    role: storedToken.admin.role,
  });

  const newRefreshToken = generateAdminRefreshToken({
    adminId: storedToken.admin.id,
    email: storedToken.admin.email,
    role: storedToken.admin.role,
  });

  // Delete old token and create new one
  await prisma.adminRefreshToken.delete({
    where: { id: storedToken.id },
  });

  await prisma.adminRefreshToken.create({
    data: {
      token: newRefreshToken,
      adminId: storedToken.admin.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ipAddress,
      userAgent,
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logout admin
 */
export const logoutAdmin = async (adminId: string, refreshToken?: string) => {
  if (refreshToken) {
    await prisma.adminRefreshToken.deleteMany({
      where: { token: refreshToken },
    });
  } else {
    // Logout from all devices
    await prisma.adminRefreshToken.deleteMany({
      where: { adminId },
    });
  }

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: 'admin_logout',
    },
  });
};

/**
 * Create new admin (Super Admin only)
 */
export const createAdmin = async (input: CreateAdminInput) => {
  const { email, password, fullName, phone, role, createdBy } = input;

  // Check if email already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingAdmin) {
    throw new BadRequestError('البريد الإلكتروني مستخدم بالفعل');
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.admin.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      phone,
      role,
      createdBy,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  // Log activity
  if (createdBy) {
    await prisma.adminActivityLog.create({
      data: {
        adminId: createdBy,
        action: 'admin_create',
        targetType: 'admin',
        targetId: admin.id,
        details: { role, email: admin.email },
      },
    });
  }

  return admin;
};

/**
 * Get all admins
 */
export const getAllAdmins = async (requestingAdminRole: AdminRole) => {
  // Only Super Admin can see all admins
  const admins = await prisma.admin.findMany({
    where: requestingAdminRole === AdminRole.SUPER_ADMIN ? {} : { status: AdminStatus.ACTIVE },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      status: true,
      avatar: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return admins;
};

/**
 * Update admin
 */
export const updateAdmin = async (
  adminId: string,
  updateData: Partial<{
    fullName: string;
    phone: string;
    role: AdminRole;
    status: AdminStatus;
    customPermissions: string[];
  }>,
  updatedBy: string
) => {
  const admin = await prisma.admin.update({
    where: { id: adminId },
    data: updateData,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      status: true,
    },
  });

  await prisma.adminActivityLog.create({
    data: {
      adminId: updatedBy,
      action: 'admin_update',
      targetType: 'admin',
      targetId: adminId,
      details: updateData,
    },
  });

  return admin;
};

// ==========================================
// User Management
// ==========================================

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  userType?: 'INDIVIDUAL' | 'BUSINESS';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all users with pagination and filtering
 */
export const getUsers = async (params: GetUsersParams) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    userType,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const where: any = {};

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (userType) {
    where.userType = userType;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        userType: true,
        status: true,
        avatar: true,
        rating: true,
        totalReviews: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            items: true,
            listings: true,
            transactionsAsBuyer: true,
            transactionsAsSeller: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user details
 */
export const getUserDetails = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          items: true,
          listings: true,
          transactionsAsBuyer: true,
          transactionsAsSeller: true,
          reviewsGiven: true,
          reviewsReceived: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('المستخدم غير موجود');
  }

  // Remove sensitive data
  const { passwordHash, ...userData } = user;

  return userData;
};

/**
 * Suspend user
 */
export const suspendUser = async (userId: string, reason: string, adminId: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.SUSPENDED },
    select: { id: true, email: true, fullName: true, status: true },
  });

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: 'user_suspend',
      targetType: 'user',
      targetId: userId,
      details: { reason },
    },
  });

  return user;
};

/**
 * Activate user
 */
export const activateUser = async (userId: string, adminId: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.ACTIVE },
    select: { id: true, email: true, fullName: true, status: true },
  });

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: 'user_activate',
      targetType: 'user',
      targetId: userId,
    },
  });

  return user;
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (userId: string, adminId: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.DELETED },
    select: { id: true, email: true, fullName: true, status: true },
  });

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: 'user_delete',
      targetType: 'user',
      targetId: userId,
    },
  });

  return user;
};

// ==========================================
// Listings Management
// ==========================================

interface GetListingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ItemStatus;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all listings with pagination
 */
export const getListings = async (params: GetListingsParams) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    categoryId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      include: {
        seller: {
          select: { id: true, fullName: true, email: true },
        },
        category: {
          select: { id: true, nameAr: true, nameEn: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.item.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete listing
 */
export const deleteListing = async (itemId: string, reason: string, adminId: string) => {
  const item = await prisma.item.update({
    where: { id: itemId },
    data: { status: ItemStatus.DELETED },
    select: { id: true, title: true, status: true },
  });

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: 'listing_delete',
      targetType: 'item',
      targetId: itemId,
      details: { reason },
    },
  });

  return item;
};

// ==========================================
// Platform Settings
// ==========================================

/**
 * Get all settings
 */
export const getSettings = async (category?: string) => {
  const where = category ? { category } : {};

  return prisma.platformSetting.findMany({
    where,
    orderBy: [{ category: 'asc' }, { key: 'asc' }],
  });
};

/**
 * Get setting by key
 */
export const getSetting = async (key: string) => {
  return prisma.platformSetting.findUnique({
    where: { key },
  });
};

/**
 * Update setting
 */
export const updateSetting = async (key: string, value: any, adminId: string) => {
  const setting = await prisma.platformSetting.upsert({
    where: { key },
    update: { value, updatedBy: adminId },
    create: {
      key,
      value,
      category: 'general',
      updatedBy: adminId,
    },
  });

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: 'setting_update',
      targetType: 'setting',
      targetId: key,
      details: { value },
    },
  });

  return setting;
};

/**
 * Initialize default settings
 */
export const initializeDefaultSettings = async () => {
  const defaultSettings = [
    { key: 'site_name', value: 'XChange Egypt', category: 'general', description: 'اسم المنصة' },
    { key: 'site_description', value: 'منصة التبادل والمقايضة في مصر', category: 'general', description: 'وصف المنصة' },
    { key: 'maintenance_mode', value: false, category: 'general', description: 'وضع الصيانة' },
    { key: 'registration_enabled', value: true, category: 'general', description: 'تفعيل التسجيل' },
    { key: 'listing_approval_required', value: false, category: 'listings', description: 'تتطلب الإعلانات موافقة' },
    { key: 'max_images_per_listing', value: 10, category: 'listings', description: 'أقصى عدد صور للإعلان' },
    { key: 'featured_listing_price', value: 50, category: 'payments', description: 'سعر الإعلان المميز' },
    { key: 'commission_percentage', value: 2.5, category: 'payments', description: 'نسبة العمولة' },
    { key: 'min_withdrawal', value: 100, category: 'payments', description: 'أقل مبلغ للسحب' },
    { key: 'xcoin_to_egp_rate', value: 1, category: 'payments', description: 'سعر صرف XCoin' },
    { key: 'support_email', value: 'support@xchange.eg', category: 'contact', description: 'بريد الدعم' },
    { key: 'support_phone', value: '+20 123 456 789', category: 'contact', description: 'هاتف الدعم' },
  ];

  for (const setting of defaultSettings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
};

// ==========================================
// Statistics & Analytics
// ==========================================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const [
    totalUsers,
    newUsersToday,
    newUsersWeek,
    activeUsers,
    totalListings,
    activeListings,
    newListingsToday,
    totalOrders,
    completedOrders,
    totalOrdersValue,
    pendingReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: lastWeek } } }),
    prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
    prisma.item.count(),
    prisma.item.count({ where: { status: ItemStatus.ACTIVE } }),
    prisma.item.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: OrderStatus.DELIVERED } }),
    prisma.contentReport.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      newToday: newUsersToday,
      newThisWeek: newUsersWeek,
    },
    listings: {
      total: totalListings,
      active: activeListings,
      newToday: newListingsToday,
    },
    orders: {
      total: totalOrders,
      completed: completedOrders,
      totalValue: totalOrdersValue._sum.total || 0,
    },
    reports: {
      pending: pendingReports,
    },
  };
};

/**
 * Get activity logs
 */
export const getActivityLogs = async (params: {
  page?: number;
  limit?: number;
  adminId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const { page = 1, limit = 50, adminId, action, startDate, endDate } = params;

  const where: any = {};

  if (adminId) where.adminId = adminId;
  if (action) where.action = action;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.adminActivityLog.findMany({
      where,
      include: {
        admin: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.adminActivityLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==========================================
// Content Reports
// ==========================================

/**
 * Get content reports
 */
export const getContentReports = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  targetType?: string;
}) => {
  const { page = 1, limit = 20, status, targetType } = params;

  const where: any = {};
  if (status) where.status = status;
  if (targetType) where.targetType = targetType;

  const [reports, total] = await Promise.all([
    prisma.contentReport.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contentReport.count({ where }),
  ]);

  return {
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Resolve content report
 */
export const resolveReport = async (
  reportId: string,
  resolution: string,
  status: 'RESOLVED' | 'DISMISSED',
  adminId: string
) => {
  const report = await prisma.contentReport.update({
    where: { id: reportId },
    data: {
      status,
      resolution,
      resolvedBy: adminId,
      resolvedAt: new Date(),
    },
  });

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: 'report_resolve',
      targetType: 'report',
      targetId: reportId,
      details: { status, resolution },
    },
  });

  return report;
};

// ==========================================
// Categories Management
// ==========================================

/**
 * Create category
 */
export const createCategory = async (data: {
  nameAr: string;
  nameEn: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentId?: string;
  order?: number;
}, adminId: string) => {
  const category = await prisma.category.create({
    data,
  });

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: 'category_create',
      targetType: 'category',
      targetId: category.id,
      details: data,
    },
  });

  return category;
};

/**
 * Update category
 */
export const updateCategory = async (
  categoryId: string,
  data: Partial<{
    nameAr: string;
    nameEn: string;
    slug: string;
    description: string;
    icon: string;
    image: string;
    parentId: string;
    order: number;
    isActive: boolean;
  }>,
  adminId: string
) => {
  const category = await prisma.category.update({
    where: { id: categoryId },
    data,
  });

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: 'category_update',
      targetType: 'category',
      targetId: categoryId,
      details: data,
    },
  });

  return category;
};

/**
 * Delete category
 */
export const deleteCategory = async (categoryId: string, adminId: string) => {
  // Check if category has items
  const itemsCount = await prisma.item.count({
    where: { categoryId },
  });

  if (itemsCount > 0) {
    throw new BadRequestError(`لا يمكن حذف الفئة لأنها تحتوي على ${itemsCount} منتج`);
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: 'category_delete',
      targetType: 'category',
      targetId: categoryId,
    },
  });
};

/**
 * Create first super admin (for initial setup)
 */
export const createInitialSuperAdmin = async (email: string, password: string, fullName: string) => {
  // Check if any admin exists
  const existingAdmin = await prisma.admin.findFirst();

  if (existingAdmin) {
    throw new BadRequestError('يوجد مدير بالفعل في النظام');
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.admin.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      role: AdminRole.SUPER_ADMIN,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
    },
  });

  // Initialize default settings
  await initializeDefaultSettings();

  return admin;
};
