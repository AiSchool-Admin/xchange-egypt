/**
 * Image Routes
 *
 * All routes for image upload and management
 */

import { Router } from 'express';
import * as imageController from '../controllers/image.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  uploadSingle,
  uploadMultiple,
  uploadAvatar,
  uploadItemImages,
  uploadBidImages,
} from '../middleware/upload.middleware';
import {
  validateUploadedFile,
  secureFilenameMiddleware,
  logUpload,
} from '../middleware/upload-security';
import { uploadLimiter } from '../middleware/security';

const router = Router();

// ============================================
// Upload Routes (Authenticated)
// ============================================

/**
 * Upload single image
 * POST /api/v1/images/upload
 * Body (multipart/form-data):
 *   - image: File (required)
 *   - category: string (optional, default: 'item') - 'item', 'avatar', 'bid'
 *   - processMultipleSizes: boolean (optional, default: true)
 */
router.post(
  '/upload',
  authenticate,
  uploadLimiter,
  uploadSingle,
  validateUploadedFile,
  secureFilenameMiddleware,
  logUpload,
  imageController.uploadSingleImage
);

/**
 * Upload multiple images
 * POST /api/v1/images/upload-multiple
 * Body (multipart/form-data):
 *   - images: File[] (required, max 10)
 *   - category: string (optional, default: 'item')
 *   - maxCount: number (optional, default: 10)
 */
router.post(
  '/upload-multiple',
  authenticate,
  uploadLimiter,
  uploadMultiple,
  validateUploadedFile,
  secureFilenameMiddleware,
  logUpload,
  imageController.uploadMultipleImages
);

/**
 * Upload avatar
 * POST /api/v1/images/upload-avatar
 * Body (multipart/form-data):
 *   - avatar: File (required, max 5MB)
 */
router.post(
  '/upload-avatar',
  authenticate,
  uploadLimiter,
  uploadAvatar,
  validateUploadedFile,
  secureFilenameMiddleware,
  logUpload,
  imageController.uploadAvatar
);

/**
 * Upload item images (up to 20)
 * POST /api/v1/images/upload-item-images
 * Body (multipart/form-data):
 *   - images: File[] (required, max 20)
 */
router.post(
  '/upload-item-images',
  authenticate,
  uploadLimiter,
  uploadItemImages,
  validateUploadedFile,
  secureFilenameMiddleware,
  logUpload,
  imageController.uploadItemImages
);

/**
 * Upload bid images (up to 10)
 * POST /api/v1/images/upload-bid-images
 * Body (multipart/form-data):
 *   - images: File[] (required, max 10)
 */
router.post(
  '/upload-bid-images',
  authenticate,
  uploadLimiter,
  uploadBidImages,
  validateUploadedFile,
  secureFilenameMiddleware,
  logUpload,
  imageController.uploadBidImages
);

// ============================================
// Delete Routes (Authenticated)
// ============================================

/**
 * Delete single image
 * DELETE /api/v1/images/:filename
 * Query params:
 *   - category: string (optional, default: 'item')
 */
router.delete(
  '/:filename',
  authenticate,
  imageController.deleteImage
);

/**
 * Delete multiple images
 * POST /api/v1/images/delete-multiple
 * Body:
 *   - filenames: string[] (required)
 *   - category: string (optional, default: 'item')
 */
router.post(
  '/delete-multiple',
  authenticate,
  imageController.deleteMultipleImages
);

// ============================================
// Utility Routes
// ============================================

/**
 * Get all URLs for an image (all sizes)
 * GET /api/v1/images/:filename/urls
 * Query params:
 *   - category: string (optional, default: 'item')
 */
router.get(
  '/:filename/urls',
  imageController.getImageUrls
);

/**
 * Get storage statistics
 * GET /api/v1/images/stats
 */
router.get(
  '/stats',
  authenticate,
  imageController.getStorageStats
);

/**
 * Clean up old temp files
 * POST /api/v1/images/cleanup-temp
 * Body:
 *   - olderThanHours: number (optional, default: 24)
 */
router.post(
  '/cleanup-temp',
  authenticate,
  imageController.cleanupTempFiles
);

/**
 * Get storage provider info
 * GET /api/v1/images/storage-info
 */
router.get(
  '/storage-info',
  imageController.getStorageInfo
);

export default router;
