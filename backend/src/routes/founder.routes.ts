/**
 * Founder Routes
 * مسارات المؤسس ورئيس مجلس الإدارة
 */

import { Router } from 'express';
import { authenticateFounder } from '../middleware/founderAuth';
import * as founderController from '../controllers/founder.controller';

const router = Router();

// ============================================
// Authentication Routes - المصادقة
// ============================================

// Login
router.post('/login', founderController.login);

// Refresh token
router.post('/refresh', founderController.refreshToken);

// Logout
router.post('/logout', founderController.logout);

// ============================================
// Profile Routes - الملف الشخصي
// ============================================

// Get profile
router.get('/profile', authenticateFounder, founderController.getProfile);

// Update profile
router.patch('/profile', authenticateFounder, founderController.updateProfile);

// Change password
router.post('/change-password', authenticateFounder, founderController.changePassword);

// ============================================
// Dashboard Routes - لوحة التحكم
// ============================================

// Get board statistics
router.get('/board-stats', authenticateFounder, founderController.getBoardStats);

export default router;
