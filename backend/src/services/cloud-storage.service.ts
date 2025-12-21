/**
 * Cloud Storage Service
 *
 * Handles file uploads to Cloudflare R2 (S3-compatible)
 * Falls back to local storage if R2 is not configured
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { env, isProduction } from '../config/env';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// ============================================
// Configuration
// ============================================

const isR2Configured = !!(
  env.storage.r2.accountId &&
  env.storage.r2.accessKeyId &&
  env.storage.r2.secretAccessKey &&
  env.storage.r2.bucketName
);

let s3Client: S3Client | null = null;

if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.storage.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.storage.r2.accessKeyId,
      secretAccessKey: env.storage.r2.secretAccessKey,
    },
  });
  console.log('✅ Cloudflare R2 storage configured');
} else {
  console.log('⚠️  R2 not configured, using local storage');
}

// Local storage paths
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
const ITEMS_DIR = path.join(UPLOAD_DIR, 'items');
const AVATARS_DIR = path.join(UPLOAD_DIR, 'avatars');

// Image sizes for processing
const IMAGE_SIZES = {
  original: { width: 1920, height: 1920, quality: 90 },
  large: { width: 1200, height: 1200, quality: 85 },
  medium: { width: 800, height: 800, quality: 80 },
  thumbnail: { width: 300, height: 300, quality: 75 },
};

// ============================================
// Types
// ============================================

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export interface ProcessedImageUrls {
  original: string;
  large: string;
  medium: string;
  thumbnail: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate unique filename
 */
const generateFilename = (originalName: string, suffix: string = ''): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = '.webp'; // Always convert to webp for optimization
  const safeName = path.basename(originalName, path.extname(originalName))
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase();

  return `${safeName}-${timestamp}-${random}${suffix}${ext}`;
};

/**
 * Process image with sharp
 */
const processImage = async (
  buffer: Buffer,
  options: { width: number; height: number; quality: number }
): Promise<Buffer> => {
  return sharp(buffer)
    .resize(options.width, options.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: options.quality })
    .toBuffer();
};

/**
 * Ensure local directories exist
 */
const ensureLocalDirs = async (): Promise<void> => {
  const dirs = [UPLOAD_DIR, ITEMS_DIR, AVATARS_DIR];
  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
};

// ============================================
// Cloud Storage Operations
// ============================================

/**
 * Upload file to R2
 */
const uploadToR2 = async (
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> => {
  if (!s3Client) {
    throw new Error('R2 not configured');
  }

  const command = new PutObjectCommand({
    Bucket: env.storage.r2.bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  const publicUrl = env.storage.r2.publicUrl
    ? `${env.storage.r2.publicUrl}/${key}`
    : `https://${env.storage.r2.bucketName}.${env.storage.r2.accountId}.r2.cloudflarestorage.com/${key}`;

  return {
    url: publicUrl,
    key,
    size: buffer.length,
    mimeType: contentType,
  };
};

/**
 * Delete file from R2
 */
const deleteFromR2 = async (key: string): Promise<void> => {
  if (!s3Client) {
    throw new Error('R2 not configured');
  }

  const command = new DeleteObjectCommand({
    Bucket: env.storage.r2.bucketName,
    Key: key,
  });

  await s3Client.send(command);
};

/**
 * Upload file to local storage
 */
const uploadToLocal = async (
  buffer: Buffer,
  filename: string,
  category: 'items' | 'avatars'
): Promise<UploadResult> => {
  await ensureLocalDirs();

  const dir = category === 'items' ? ITEMS_DIR : AVATARS_DIR;
  const filePath = path.join(dir, filename);

  await fs.writeFile(filePath, buffer);

  const url = `/uploads/${category}/${filename}`;

  return {
    url,
    key: filename,
    size: buffer.length,
    mimeType: 'image/webp',
  };
};

/**
 * Delete file from local storage
 */
const deleteFromLocal = async (filename: string, category: 'items' | 'avatars'): Promise<void> => {
  const dir = category === 'items' ? ITEMS_DIR : AVATARS_DIR;
  const filePath = path.join(dir, filename);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore if file doesn't exist
  }
};

// ============================================
// Public API
// ============================================

/**
 * Check if cloud storage is available
 */
export const isCloudStorageAvailable = (): boolean => {
  return isR2Configured;
};

/**
 * Upload single image with multiple sizes
 */
export const uploadImage = async (
  file: Express.Multer.File,
  category: 'items' | 'avatars' = 'items'
): Promise<ProcessedImageUrls> => {
  const baseFilename = generateFilename(file.originalname);
  const urls: ProcessedImageUrls = {
    original: '',
    large: '',
    medium: '',
    thumbnail: '',
  };

  // Process and upload each size
  for (const [sizeName, options] of Object.entries(IMAGE_SIZES)) {
    const processedBuffer = await processImage(file.buffer, options);
    const filename = baseFilename.replace('.webp', `-${sizeName}.webp`);

    if (isR2Configured && isProduction) {
      // Upload to R2 in production
      const key = `${category}/${filename}`;
      const result = await uploadToR2(processedBuffer, key, 'image/webp');
      urls[sizeName as keyof ProcessedImageUrls] = result.url;
    } else {
      // Use local storage in development or if R2 not configured
      const result = await uploadToLocal(processedBuffer, filename, category);
      urls[sizeName as keyof ProcessedImageUrls] = result.url;
    }
  }

  return urls;
};

/**
 * Upload multiple images
 */
export const uploadImages = async (
  files: Express.Multer.File[],
  category: 'items' | 'avatars' = 'items'
): Promise<ProcessedImageUrls[]> => {
  const uploadPromises = files.map(file => uploadImage(file, category));
  return Promise.all(uploadPromises);
};

/**
 * Delete image (all sizes)
 */
export const deleteImage = async (
  imageUrl: string,
  category: 'items' | 'avatars' = 'items'
): Promise<void> => {
  // Extract base filename from URL
  const urlParts = imageUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  const baseName = filename.replace(/-(?:original|large|medium|thumbnail)\.webp$/, '');

  for (const sizeName of Object.keys(IMAGE_SIZES)) {
    const sizedFilename = `${baseName}-${sizeName}.webp`;

    if (isR2Configured && isProduction) {
      const key = `${category}/${sizedFilename}`;
      await deleteFromR2(key).catch(() => {});
    } else {
      await deleteFromLocal(sizedFilename, category).catch(() => {});
    }
  }
};

/**
 * Get storage info
 */
export const getStorageInfo = (): {
  provider: 'r2' | 'local';
  configured: boolean;
  publicUrl?: string;
} => {
  if (isR2Configured) {
    return {
      provider: 'r2',
      configured: true,
      publicUrl: env.storage.r2.publicUrl,
    };
  }
  return {
    provider: 'local',
    configured: true,
  };
};
