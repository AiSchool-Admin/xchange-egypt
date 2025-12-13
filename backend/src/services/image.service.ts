/**
 * Image Service
 *
 * Handles image upload, processing, compression, and management
 * Uses cloud storage (R2) when configured, falls back to local storage
 */

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { BadRequestError, NotFoundError } from '../utils/errors';
import * as cloudStorage from './cloud-storage.service';

// ============================================
// Configuration
// ============================================

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
const ITEMS_DIR = path.join(UPLOAD_DIR, 'items');
const AVATARS_DIR = path.join(UPLOAD_DIR, 'avatars');
const BIDS_DIR = path.join(UPLOAD_DIR, 'bids');
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp');

// Image size configurations
const IMAGE_SIZES = {
  // Item images
  item: {
    original: { width: 1920, height: 1920, quality: 90 },
    large: { width: 1200, height: 1200, quality: 85 },
    medium: { width: 800, height: 800, quality: 80 },
    thumbnail: { width: 300, height: 300, quality: 75 },
  },
  // Avatar images
  avatar: {
    large: { width: 400, height: 400, quality: 85 },
    medium: { width: 200, height: 200, quality: 80 },
    small: { width: 100, height: 100, quality: 75 },
  },
  // Bid images
  bid: {
    large: { width: 1200, height: 1200, quality: 85 },
    medium: { width: 800, height: 800, quality: 80 },
    thumbnail: { width: 300, height: 300, quality: 75 },
  },
};

// Allowed file types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ============================================
// Types
// ============================================

export interface UploadedImage {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface ProcessedImages {
  original: UploadedImage;
  large?: UploadedImage;
  medium?: UploadedImage;
  thumbnail?: UploadedImage;
  small?: UploadedImage;
}

export type ImageCategory = 'item' | 'avatar' | 'bid';

// ============================================
// Directory Management
// ============================================

/**
 * Initialize upload directories
 */
export const initializeUploadDirectories = async (): Promise<void> => {
  const directories = [UPLOAD_DIR, ITEMS_DIR, AVATARS_DIR, BIDS_DIR, TEMP_DIR];

  for (const dir of directories) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  }
};

/**
 * Get directory for image category
 */
const getDirectoryForCategory = (category: ImageCategory): string => {
  switch (category) {
    case 'item':
      return ITEMS_DIR;
    case 'avatar':
      return AVATARS_DIR;
    case 'bid':
      return BIDS_DIR;
    default:
      return ITEMS_DIR;
  }
};

// ============================================
// Image Validation
// ============================================

/**
 * Validate image file
 */
export const validateImage = (file: Express.Multer.File): void => {
  // Check if file exists
  if (!file) {
    throw new BadRequestError('No file provided');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestError(
      `File size too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  // Check mime type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new BadRequestError(
      `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    );
  }
};

/**
 * Validate multiple images
 */
export const validateImages = (files: Express.Multer.File[], maxCount: number = 10): void => {
  if (!files || files.length === 0) {
    throw new BadRequestError('No files provided');
  }

  if (files.length > maxCount) {
    throw new BadRequestError(`Maximum ${maxCount} images allowed`);
  }

  files.forEach((file) => validateImage(file));
};

// ============================================
// Image Processing
// ============================================

/**
 * Generate unique filename
 */
export const generateFilename = (originalName: string, suffix: string = ''): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalName).toLowerCase();
  const safeName = path.basename(originalName, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();

  return `${safeName}-${timestamp}-${random}${suffix}${ext}`;
};

/**
 * Get image metadata
 */
export const getImageMetadata = async (
  filePath: string
): Promise<{ width: number; height: number; size: number }> => {
  const metadata = await sharp(filePath).metadata();
  const stats = await fs.stat(filePath);

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    size: stats.size,
  };
};

/**
 * Process and resize single image
 */
export const processImage = async (
  inputPath: string,
  outputPath: string,
  options: { width: number; height: number; quality: number }
): Promise<void> => {
  await sharp(inputPath)
    .resize(options.width, options.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: options.quality, progressive: true })
    .webp({ quality: options.quality })
    .toFile(outputPath);
};

/**
 * Create multiple sizes for an image
 */
export const createImageSizes = async (
  inputPath: string,
  category: ImageCategory,
  baseFilename: string
): Promise<ProcessedImages> => {
  const sizes = IMAGE_SIZES[category];
  const directory = getDirectoryForCategory(category);
  const results: ProcessedImages = {} as ProcessedImages;

  // Process each size
  for (const [sizeName, options] of Object.entries(sizes)) {
    const filename = generateFilename(baseFilename, `-${sizeName}`);
    const outputPath = path.join(directory, filename);

    await processImage(inputPath, outputPath, options);

    const metadata = await getImageMetadata(outputPath);
    const urlPath = `/uploads/${category}s/${filename}`;

    results[sizeName as keyof ProcessedImages] = {
      filename,
      originalName: baseFilename,
      path: outputPath,
      url: urlPath,
      size: metadata.size,
      mimeType: 'image/jpeg',
      dimensions: {
        width: metadata.width,
        height: metadata.height,
      },
    };
  }

  return results;
};

// ============================================
// Upload Operations
// ============================================

/**
 * Upload single image
 * Uses cloud storage (R2) when configured, falls back to local storage
 */
export const uploadImage = async (
  file: Express.Multer.File,
  category: ImageCategory = 'item',
  processMultipleSizes: boolean = true
): Promise<ProcessedImages | UploadedImage> => {
  validateImage(file);

  // Try cloud storage first (R2)
  const cloudCategory = category === 'bid' ? 'items' : (category === 'item' ? 'items' : 'avatars');

  try {
    // Use cloud storage service which handles both cloud and local fallback
    const cloudUrls = await cloudStorage.uploadImage(file, cloudCategory);

    // Convert cloud storage response to ProcessedImages format
    if (processMultipleSizes) {
      const processedImages: ProcessedImages = {
        original: {
          filename: path.basename(cloudUrls.original),
          originalName: file.originalname,
          path: cloudUrls.original,
          url: cloudUrls.original,
          size: file.size,
          mimeType: 'image/webp',
          dimensions: { width: 1920, height: 1920 },
        },
        large: {
          filename: path.basename(cloudUrls.large),
          originalName: file.originalname,
          path: cloudUrls.large,
          url: cloudUrls.large,
          size: file.size,
          mimeType: 'image/webp',
          dimensions: { width: 1200, height: 1200 },
        },
        medium: {
          filename: path.basename(cloudUrls.medium),
          originalName: file.originalname,
          path: cloudUrls.medium,
          url: cloudUrls.medium,
          size: file.size,
          mimeType: 'image/webp',
          dimensions: { width: 800, height: 800 },
        },
        thumbnail: {
          filename: path.basename(cloudUrls.thumbnail),
          originalName: file.originalname,
          path: cloudUrls.thumbnail,
          url: cloudUrls.thumbnail,
          size: file.size,
          mimeType: 'image/webp',
          dimensions: { width: 300, height: 300 },
        },
      };
      return processedImages;
    } else {
      return {
        filename: path.basename(cloudUrls.medium),
        originalName: file.originalname,
        path: cloudUrls.medium,
        url: cloudUrls.medium,
        size: file.size,
        mimeType: 'image/webp',
        dimensions: { width: 800, height: 800 },
      };
    }
  } catch (cloudError) {
    // Log error but continue with local storage fallback
    console.error('Cloud storage upload failed, using local storage:', cloudError);

    // Fall back to local storage
    const directory = getDirectoryForCategory(category);
    const filename = generateFilename(file.originalname);
    const filePath = path.join(directory, filename);

    // Save original file
    await fs.writeFile(filePath, file.buffer);

    if (processMultipleSizes) {
      // Create multiple sizes
      const processedImages = await createImageSizes(filePath, category, file.originalname);

      // Delete original unprocessed file
      await fs.unlink(filePath);

      return processedImages;
    } else {
      // Return single image
      const metadata = await getImageMetadata(filePath);
      const urlPath = `/uploads/${category}s/${filename}`;

      return {
        filename,
        originalName: file.originalname,
        path: filePath,
        url: urlPath,
        size: metadata.size,
        mimeType: file.mimetype,
        dimensions: {
          width: metadata.width,
          height: metadata.height,
        },
      };
    }
  }
};

/**
 * Upload multiple images
 */
export const uploadImages = async (
  files: Express.Multer.File[],
  category: ImageCategory = 'item',
  maxCount: number = 10
): Promise<Array<ProcessedImages | UploadedImage>> => {
  validateImages(files, maxCount);

  const uploadPromises = files.map((file) => uploadImage(file, category, true));
  return Promise.all(uploadPromises);
};

/**
 * Check if cloud storage is available
 */
export const isCloudStorageEnabled = (): boolean => {
  return cloudStorage.isCloudStorageAvailable();
};

/**
 * Get storage provider info
 */
export const getStorageProvider = () => {
  return cloudStorage.getStorageInfo();
};

// ============================================
// Delete Operations
// ============================================

/**
 * Delete single image file
 */
export const deleteImageFile = async (filename: string, category: ImageCategory): Promise<void> => {
  const directory = getDirectoryForCategory(category);
  const filePath = path.join(directory, filename);

  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
  } catch (error) {
    throw new NotFoundError('Image file not found');
  }
};

/**
 * Delete image and all its sizes
 */
export const deleteImage = async (
  baseFilename: string,
  category: ImageCategory
): Promise<void> => {
  const directory = getDirectoryForCategory(category);
  const sizes = Object.keys(IMAGE_SIZES[category]);

  // Delete all size variants
  const deletePromises = sizes.map(async (sizeName) => {
    try {
      // Extract base name without size suffix
      const nameWithoutExt = baseFilename.replace(/\.[^/.]+$/, '');
      const pattern = new RegExp(`${nameWithoutExt}-\\d+-[a-z0-9]+-${sizeName}\\.(jpg|jpeg|png|webp)$`, 'i');

      const files = await fs.readdir(directory);
      const matchingFiles = files.filter((file) => pattern.test(file));

      for (const file of matchingFiles) {
        const filePath = path.join(directory, file);
        await fs.unlink(filePath);
      }
    } catch (error) {
      // Ignore errors for missing files
    }
  });

  await Promise.all(deletePromises);
};

/**
 * Delete multiple images
 */
export const deleteImages = async (
  filenames: string[],
  category: ImageCategory
): Promise<void> => {
  const deletePromises = filenames.map((filename) => deleteImage(filename, category));
  await Promise.all(deletePromises);
};

// ============================================
// Utility Functions
// ============================================

/**
 * Get image URL from filename
 */
export const getImageUrl = (filename: string, category: ImageCategory, size: string = 'medium'): string => {
  if (!filename) return '';

  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const ext = path.extname(filename);
  const sizedFilename = `${nameWithoutExt}-${size}${ext}`;

  return `/uploads/${category}s/${sizedFilename}`;
};

/**
 * Get all image URLs for a base filename
 */
export const getImageUrls = (
  filename: string,
  category: ImageCategory
): Record<string, string> => {
  const sizes = Object.keys(IMAGE_SIZES[category]);
  const urls: Record<string, string> = {};

  sizes.forEach((size) => {
    urls[size] = getImageUrl(filename, category, size);
  });

  return urls;
};

/**
 * Clean up old temp files
 */
export const cleanupTempFiles = async (olderThanHours: number = 24): Promise<number> => {
  const files = await fs.readdir(TEMP_DIR);
  const now = Date.now();
  const maxAge = olderThanHours * 60 * 60 * 1000;
  let deletedCount = 0;

  for (const file of files) {
    const filePath = path.join(TEMP_DIR, file);
    const stats = await fs.stat(filePath);
    const age = now - stats.mtimeMs;

    if (age > maxAge) {
      await fs.unlink(filePath);
      deletedCount++;
    }
  }

  return deletedCount;
};

/**
 * Get storage statistics
 */
export const getStorageStats = async (): Promise<{
  items: { count: number; totalSize: number };
  avatars: { count: number; totalSize: number };
  bids: { count: number; totalSize: number };
  temp: { count: number; totalSize: number };
  total: { count: number; totalSize: number };
}> => {
  const getDirectoryStats = async (dir: string) => {
    try {
      const files = await fs.readdir(dir);
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      }

      return { count: files.length, totalSize };
    } catch {
      return { count: 0, totalSize: 0 };
    }
  };

  const [items, avatars, bids, temp] = await Promise.all([
    getDirectoryStats(ITEMS_DIR),
    getDirectoryStats(AVATARS_DIR),
    getDirectoryStats(BIDS_DIR),
    getDirectoryStats(TEMP_DIR),
  ]);

  return {
    items,
    avatars,
    bids,
    temp,
    total: {
      count: items.count + avatars.count + bids.count + temp.count,
      totalSize: items.totalSize + avatars.totalSize + bids.totalSize + temp.totalSize,
    },
  };
};

// ============================================
// Initialization
// ============================================

// Initialize directories on module load
initializeUploadDirectories().catch((error) => {
  console.error('Failed to initialize upload directories:', error);
});
