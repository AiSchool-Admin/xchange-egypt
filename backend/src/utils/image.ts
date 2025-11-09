import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

/**
 * Process and optimize avatar image
 * - Resize to 300x300
 * - Convert to JPEG
 * - Optimize quality
 */
export const processAvatar = async (inputPath: string): Promise<string> => {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const outputDir = path.dirname(inputPath);
  const outputPath = path.join(outputDir, `${filename}-processed.jpg`);

  await sharp(inputPath)
    .resize(300, 300, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({
      quality: 85,
      progressive: true,
    })
    .toFile(outputPath);

  // Delete original file
  await fs.unlink(inputPath);

  return outputPath;
};

/**
 * Process and optimize item image
 * - Resize to max 1200x1200 (maintain aspect ratio)
 * - Convert to JPEG
 * - Optimize quality
 */
export const processItemImage = async (inputPath: string): Promise<string> => {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const outputDir = path.dirname(inputPath);
  const outputPath = path.join(outputDir, `${filename}-processed.jpg`);

  await sharp(inputPath)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 90,
      progressive: true,
    })
    .toFile(outputPath);

  // Delete original file
  await fs.unlink(inputPath);

  return outputPath;
};

/**
 * Process multiple item images
 */
export const processItemImages = async (inputPaths: string[]): Promise<string[]> => {
  const processedPaths = await Promise.all(inputPaths.map((path) => processItemImage(path)));
  return processedPaths;
};

/**
 * Delete file from filesystem
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File might not exist, ignore error
    console.error('Error deleting file:', error);
  }
};

/**
 * Get public URL for uploaded file
 */
export const getPublicUrl = (filePath: string): string => {
  // Convert absolute path to relative URL
  // Example: /home/user/backend/public/uploads/avatars/file.jpg
  // -> /uploads/avatars/file.jpg

  const publicIndex = filePath.indexOf('/public/');
  if (publicIndex === -1) {
    // Fallback: return filename only
    return `/uploads/${path.basename(filePath)}`;
  }

  return filePath.substring(publicIndex + 7); // Remove '/public' prefix
};
