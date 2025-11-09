/**
 * Image Controller
 *
 * HTTP request handlers for image upload and management
 */

import { Request, Response, NextFunction } from 'express';
import * as imageService from '../services/image.service';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';
import { handleMulterError } from '../middleware/upload.middleware';

// ============================================
// Upload Controllers
// ============================================

/**
 * Upload single image
 * POST /api/v1/images/upload
 */
export const uploadSingleImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new BadRequestError('No image file provided');
    }

    const category = (req.body.category || 'item') as imageService.ImageCategory;
    const processMultipleSizes = req.body.processMultipleSizes !== 'false';

    const result = await imageService.uploadImage(req.file, category, processMultipleSizes);

    res.status(201).json(
      successResponse(result, 'Image uploaded successfully')
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'MulterError') {
      handleMulterError(error);
    }
    next(error);
  }
};

/**
 * Upload multiple images
 * POST /api/v1/images/upload-multiple
 */
export const uploadMultipleImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new BadRequestError('No image files provided');
    }

    const category = (req.body.category || 'item') as imageService.ImageCategory;
    const maxCount = parseInt(req.body.maxCount || '10', 10);

    const results = await imageService.uploadImages(req.files, category, maxCount);

    res.status(201).json(
      successResponse(
        {
          count: results.length,
          images: results,
        },
        `${results.length} images uploaded successfully`
      )
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'MulterError') {
      handleMulterError(error);
    }
    next(error);
  }
};

/**
 * Upload avatar
 * POST /api/v1/images/upload-avatar
 */
export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new BadRequestError('No avatar file provided');
    }

    const result = await imageService.uploadImage(req.file, 'avatar', true);

    res.status(201).json(
      successResponse(result, 'Avatar uploaded successfully')
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'MulterError') {
      handleMulterError(error);
    }
    next(error);
  }
};

/**
 * Upload item images
 * POST /api/v1/images/upload-item-images
 */
export const uploadItemImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new BadRequestError('No image files provided');
    }

    const results = await imageService.uploadImages(req.files, 'item', 20);

    res.status(201).json(
      successResponse(
        {
          count: results.length,
          images: results,
        },
        `${results.length} item images uploaded successfully`
      )
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'MulterError') {
      handleMulterError(error);
    }
    next(error);
  }
};

/**
 * Upload bid images
 * POST /api/v1/images/upload-bid-images
 */
export const uploadBidImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new BadRequestError('No image files provided');
    }

    const results = await imageService.uploadImages(req.files, 'bid', 10);

    res.status(201).json(
      successResponse(
        {
          count: results.length,
          images: results,
        },
        `${results.length} bid images uploaded successfully`
      )
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'MulterError') {
      handleMulterError(error);
    }
    next(error);
  }
};

// ============================================
// Delete Controllers
// ============================================

/**
 * Delete single image
 * DELETE /api/v1/images/:filename
 */
export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename } = req.params;
    const category = (req.query.category || 'item') as imageService.ImageCategory;

    await imageService.deleteImage(filename, category);

    res.json(
      successResponse(null, 'Image deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete multiple images
 * POST /api/v1/images/delete-multiple
 */
export const deleteMultipleImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filenames, category = 'item' } = req.body;

    if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
      throw new BadRequestError('No filenames provided');
    }

    await imageService.deleteImages(filenames, category as imageService.ImageCategory);

    res.json(
      successResponse(
        { count: filenames.length },
        `${filenames.length} images deleted successfully`
      )
    );
  } catch (error) {
    next(error);
  }
};

// ============================================
// Utility Controllers
// ============================================

/**
 * Get image URLs for a filename
 * GET /api/v1/images/:filename/urls
 */
export const getImageUrls = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename } = req.params;
    const category = (req.query.category || 'item') as imageService.ImageCategory;

    const urls = imageService.getImageUrls(filename, category);

    res.json(
      successResponse(urls, 'Image URLs retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get storage statistics
 * GET /api/v1/images/stats
 */
export const getStorageStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await imageService.getStorageStats();

    res.json(
      successResponse(stats, 'Storage statistics retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Clean up old temp files
 * POST /api/v1/images/cleanup-temp
 */
export const cleanupTempFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const olderThanHours = parseInt(req.body.olderThanHours || '24', 10);
    const deletedCount = await imageService.cleanupTempFiles(olderThanHours);

    res.json(
      successResponse(
        { deletedCount },
        `${deletedCount} temp files cleaned up successfully`
      )
    );
  } catch (error) {
    next(error);
  }
};
