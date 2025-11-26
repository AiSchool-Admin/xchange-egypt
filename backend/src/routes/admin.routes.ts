/**
 * Admin Routes
 * All routes require admin authentication and authorization
 */

import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireSuperAdmin, auditLog } from '../middleware/admin';
import * as adminController from '../controllers/admin.controller';

const router = Router();
const execAsync = promisify(exec);

// ============================================
// IMPORTANT: All routes below require admin authentication
// ============================================

// Apply authentication + admin authorization to all routes
router.use(authenticate);
router.use(requireAdmin);
router.use(auditLog); // Log all admin actions

// ============================================
// DASHBOARD & STATISTICS
// ============================================

/**
 * @route   GET /api/v1/admin/dashboard/stats
 * @desc    Get platform statistics for admin dashboard
 * @access  Admin
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with pagination and filters
 * @access  Admin
 */
router.get('/users', adminController.getUsers);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get user details by ID
 * @access  Admin
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @route   PATCH /api/v1/admin/users/:id/status
 * @desc    Update user status (activate, suspend, ban)
 * @access  Admin
 */
router.patch('/users/:id/status', adminController.updateUserStatus);

/**
 * @route   POST /api/v1/admin/users/:id/verify-email
 * @desc    Manually verify user email (admin override)
 * @access  Admin
 */
router.post('/users/:id/verify-email', adminController.verifyUserEmail);

/**
 * @route   POST /api/v1/admin/users/:id/verify-phone
 * @desc    Manually verify user phone (admin override)
 * @access  Admin
 */
router.post('/users/:id/verify-phone', adminController.verifyUserPhone);

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Delete user account (soft or hard delete)
 * @access  Super Admin
 */
router.delete('/users/:id', requireSuperAdmin, adminController.deleteUser);

// ============================================
// CATEGORY MANAGEMENT
// ============================================

/**
 * @route   GET /api/v1/admin/categories
 * @desc    Get all categories (includes inactive)
 * @access  Admin
 */
router.get('/categories', adminController.getCategories);

/**
 * @route   POST /api/v1/admin/categories
 * @desc    Create new category
 * @access  Admin
 */
router.post('/categories', adminController.createCategory);

/**
 * @route   PATCH /api/v1/admin/categories/:id
 * @desc    Update category
 * @access  Admin
 */
router.patch('/categories/:id', adminController.updateCategory);

/**
 * @route   DELETE /api/v1/admin/categories/:id
 * @desc    Delete category (only if no items/children)
 * @access  Super Admin
 */
router.delete('/categories/:id', requireSuperAdmin, adminController.deleteCategory);

// ============================================
// LISTING MODERATION
// ============================================

/**
 * @route   GET /api/v1/admin/listings
 * @desc    Get all listings for moderation
 * @access  Admin
 */
router.get('/listings', adminController.getListings);

/**
 * @route   POST /api/v1/admin/listings/:id/flag
 * @desc    Flag listing for review
 * @access  Admin
 */
router.post('/listings/:id/flag', adminController.flagListing);

/**
 * @route   POST /api/v1/admin/listings/:id/approve
 * @desc    Approve listing (remove flag)
 * @access  Admin
 */
router.post('/listings/:id/approve', adminController.approveListing);

/**
 * @route   POST /api/v1/admin/listings/:id/reject
 * @desc    Reject/Remove listing
 * @access  Admin
 */
router.post('/listings/:id/reject', adminController.rejectListing);

// ============================================
// DISPUTE RESOLUTION
// ============================================

/**
 * @route   GET /api/v1/admin/disputes
 * @desc    Get all disputes
 * @access  Admin
 */
router.get('/disputes', adminController.getDisputes);

/**
 * @route   POST /api/v1/admin/disputes/:id/resolve
 * @desc    Resolve dispute
 * @access  Admin
 */
router.post('/disputes/:id/resolve', adminController.resolveDispute);

// ============================================
// UTILITY ENDPOINTS
// ============================================

// Admin seed endpoint - Protected with auth now
router.post('/seed-categories', async (_req: Request, res: Response) => {
  try {
    console.log('🌱 Starting category seeding...');

    // Run the seed script
    const { stdout, stderr } = await execAsync('cd /app/backend && npx tsx prisma/seed-categories.ts');

    console.log('Seed output:', stdout);
    if (stderr) console.error('Seed errors:', stderr);

    res.json({
      success: true,
      message: 'Categories seeded successfully!',
      output: stdout,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stdout || error.stderr,
    });
  }
});

// Health check for admin endpoints
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Admin endpoints are active',
    admin: req.user,
  });
});

export default router;
