/**
 * Upload Middleware
 *
 * Multer configuration for handling file uploads
 */

import multer from 'multer';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors';

// ============================================
// Configuration
// ============================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 20; // Maximum files per request

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// ============================================
// Multer Configuration
// ============================================

/**
 * Configure multer storage (memory storage for processing)
 */
const storage = multer.memoryStorage();

/**
 * File filter to validate uploads
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  // Check mime type
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      )
    );
  }
};

/**
 * Base multer configuration
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

// ============================================
// Middleware Exports
// ============================================

/**
 * Upload single image
 * Usage: upload.single('image')
 */
export const uploadSingle = upload.single('image');

/**
 * Upload multiple images (up to 10)
 * Usage: upload.multiple('images')
 */
export const uploadMultiple = upload.array('images', 10);

/**
 * Upload multiple images with custom limit
 */
export const uploadMultipleWithLimit = (maxCount: number) => {
  return upload.array('images', Math.min(maxCount, MAX_FILES));
};

/**
 * Upload avatar (single image, smaller size limit)
 */
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for avatars
    files: 1,
  },
}).single('avatar');

/**
 * Upload item images (up to 20)
 */
export const uploadItemImages = upload.array('images', 20);

/**
 * Upload bid images (up to 10)
 */
export const uploadBidImages = upload.array('images', 10);

/**
 * Handle multer errors
 */
export const handleMulterError = (error: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        throw new BadRequestError(
          `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
        );
      case 'LIMIT_FILE_COUNT':
        throw new BadRequestError(`Too many files. Maximum is ${MAX_FILES} files`);
      case 'LIMIT_UNEXPECTED_FILE':
        throw new BadRequestError('Unexpected field name');
      default:
        throw new BadRequestError(`Upload error: ${error.message}`);
    }
  }
  throw error;
};

export default upload;
