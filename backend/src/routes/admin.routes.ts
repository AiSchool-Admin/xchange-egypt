/**
 * Admin Routes
 * Comprehensive administrative endpoints for platform management
 */

import { Router } from 'express';
import { authenticateAdmin, requirePermission, requireSuperAdmin, requireRole } from '../middleware/adminAuth';
import * as adminController from '../controllers/admin.controller';
import { AdminRole } from '../types';

const router = Router();

// ==========================================
// Authentication Routes (No auth required)
// ==========================================

/**
 * Admin Login
 * POST /api/v1/admin/auth/login
 */
router.post('/auth/login', adminController.login);

/**
 * Admin Refresh Token
 * POST /api/v1/admin/auth/refresh
 */
router.post('/auth/refresh', adminController.refreshToken);

/**
 * Initial Super Admin Setup (only works if no admin exists)
 * POST /api/v1/admin/auth/setup
 */
router.post('/auth/setup', adminController.initialSetup);

/**
 * Force Setup - Create or reset super admin (requires ADMIN_SETUP_KEY)
 * POST /api/v1/admin/auth/force-setup
 */
router.post('/auth/force-setup', adminController.forceSetup);

/**
 * Reset Password (requires ADMIN_SETUP_KEY)
 * POST /api/v1/admin/auth/reset-password
 */
router.post('/auth/reset-password', adminController.resetPassword);

// ==========================================
// Authenticated Routes
// ==========================================

/**
 * Admin Logout
 * POST /api/v1/admin/auth/logout
 */
router.post('/auth/logout', authenticateAdmin, adminController.logout);

/**
 * Get Current Admin Profile
 * GET /api/v1/admin/auth/me
 */
router.get('/auth/me', authenticateAdmin, adminController.getCurrentAdmin);

// ==========================================
// Admin Management (Super Admin Only)
// ==========================================

/**
 * Get All Admins
 * GET /api/v1/admin/admins
 */
router.get(
  '/admins',
  authenticateAdmin,
  requirePermission('admin:read'),
  adminController.getAllAdmins
);

/**
 * Create Admin
 * POST /api/v1/admin/admins
 */
router.post(
  '/admins',
  authenticateAdmin,
  requireSuperAdmin,
  adminController.createAdmin
);

/**
 * Update Admin
 * PUT /api/v1/admin/admins/:adminId
 */
router.put(
  '/admins/:adminId',
  authenticateAdmin,
  requireSuperAdmin,
  adminController.updateAdmin
);

/**
 * Delete Admin
 * DELETE /api/v1/admin/admins/:adminId
 */
router.delete(
  '/admins/:adminId',
  authenticateAdmin,
  requireSuperAdmin,
  adminController.deleteAdmin
);

// ==========================================
// Dashboard & Statistics
// ==========================================

/**
 * Get Dashboard Statistics
 * GET /api/v1/admin/dashboard/stats
 */
router.get(
  '/dashboard/stats',
  authenticateAdmin,
  requirePermission('stats:read'),
  adminController.getDashboardStats
);

/**
 * Get Activity Logs
 * GET /api/v1/admin/logs
 */
router.get(
  '/logs',
  authenticateAdmin,
  requirePermission('logs:read'),
  adminController.getActivityLogs
);

// ==========================================
// User Management
// ==========================================

/**
 * Get All Users
 * GET /api/v1/admin/users
 */
router.get(
  '/users',
  authenticateAdmin,
  requirePermission('users:read'),
  adminController.getUsers
);

/**
 * Get User Details
 * GET /api/v1/admin/users/:userId
 */
router.get(
  '/users/:userId',
  authenticateAdmin,
  requirePermission('users:read'),
  adminController.getUserDetails
);

/**
 * Suspend User
 * POST /api/v1/admin/users/:userId/suspend
 */
router.post(
  '/users/:userId/suspend',
  authenticateAdmin,
  requirePermission('users:suspend'),
  adminController.suspendUser
);

/**
 * Activate User
 * POST /api/v1/admin/users/:userId/activate
 */
router.post(
  '/users/:userId/activate',
  authenticateAdmin,
  requirePermission('users:update'),
  adminController.activateUser
);

/**
 * Delete User
 * DELETE /api/v1/admin/users/:userId
 */
router.delete(
  '/users/:userId',
  authenticateAdmin,
  requirePermission('users:delete'),
  adminController.deleteUser
);

// ==========================================
// Listings Management
// ==========================================

/**
 * Get All Listings
 * GET /api/v1/admin/listings
 */
router.get(
  '/listings',
  authenticateAdmin,
  requirePermission('listings:read'),
  adminController.getListings
);

/**
 * Delete Listing
 * DELETE /api/v1/admin/listings/:itemId
 */
router.delete(
  '/listings/:itemId',
  authenticateAdmin,
  requirePermission('listings:delete'),
  adminController.deleteListing
);

/**
 * Feature Listing
 * POST /api/v1/admin/listings/:itemId/feature
 */
router.post(
  '/listings/:itemId/feature',
  authenticateAdmin,
  requirePermission('listings:feature'),
  adminController.featureListing
);

// ==========================================
// Platform Settings
// ==========================================

/**
 * Get All Settings
 * GET /api/v1/admin/settings
 */
router.get(
  '/settings',
  authenticateAdmin,
  requirePermission('settings:read'),
  adminController.getSettings
);

/**
 * Update Setting
 * PUT /api/v1/admin/settings/:key
 */
router.put(
  '/settings/:key',
  authenticateAdmin,
  requirePermission('settings:update'),
  adminController.updateSetting
);

// ==========================================
// Content Reports
// ==========================================

/**
 * Get Content Reports
 * GET /api/v1/admin/reports
 */
router.get(
  '/reports',
  authenticateAdmin,
  requirePermission('reports:read'),
  adminController.getContentReports
);

/**
 * Resolve Report
 * PUT /api/v1/admin/reports/:reportId
 */
router.put(
  '/reports/:reportId',
  authenticateAdmin,
  requirePermission('reports:resolve'),
  adminController.resolveReport
);

// ==========================================
// Categories Management
// ==========================================

/**
 * Create Category
 * POST /api/v1/admin/categories
 */
router.post(
  '/categories',
  authenticateAdmin,
  requirePermission('categories:manage'),
  adminController.createCategory
);

/**
 * Update Category
 * PUT /api/v1/admin/categories/:categoryId
 */
router.put(
  '/categories/:categoryId',
  authenticateAdmin,
  requirePermission('categories:manage'),
  adminController.updateCategory
);

/**
 * Delete Category
 * DELETE /api/v1/admin/categories/:categoryId
 */
router.delete(
  '/categories/:categoryId',
  authenticateAdmin,
  requirePermission('categories:manage'),
  adminController.deleteCategory
);

// ==========================================
// Legacy Admin Routes (for maintenance)
// ==========================================

/**
 * Populate governorate field for items
 * POST /api/v1/admin/populate-governorates
 */
router.post(
  '/populate-governorates',
  authenticateAdmin,
  requireSuperAdmin,
  adminController.populateGovernorates
);

/**
 * Run retroactive matching
 * POST /api/v1/admin/retroactive-matching
 */
router.post(
  '/retroactive-matching',
  authenticateAdmin,
  requireSuperAdmin,
  adminController.runRetroactiveMatching
);

export default router;
