import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../utils/errors';
import { env } from './env';

/**
 * File filter for images only
 */
const imageFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  // Allowed extensions
  const allowedExtensions = /jpeg|jpg|png|gif|webp/;
  const allowedMimeTypes = /image\/(jpeg|jpg|png|gif|webp)/;

  // Check extension
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname && mimetype) {
    callback(null, true);
  } else {
    callback(
      new BadRequestError('Only image files (JPEG, PNG, GIF, WebP) are allowed') as any
    );
  }
};

/**
 * Storage configuration for local file system
 */
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Determine destination based on field name
    const uploadPath =
      file.fieldname === 'avatar'
        ? path.join(process.cwd(), 'public', 'uploads', 'avatars')
        : path.join(process.cwd(), 'public', 'uploads', 'items');

    callback(null, uploadPath);
  },
  filename: (req, file, callback) => {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

/**
 * Multer configuration for avatar upload
 */
export const uploadAvatar = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: env.upload.maxFileSizeMB * 1024 * 1024, // Convert MB to bytes
  },
}).single('avatar');

/**
 * Multer configuration for item images upload (multiple)
 */
export const uploadItemImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: env.upload.maxFileSizeMB * 1024 * 1024,
    files: env.upload.maxFilesPerUpload,
  },
}).array('images', env.upload.maxFilesPerUpload);

/**
 * Handle multer errors
 */
export const handleMulterError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: `File size too large. Maximum size is ${env.upload.maxFileSizeMB}MB`,
        },
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: {
          message: `Too many files. Maximum is ${env.upload.maxFilesPerUpload} files`,
        },
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Unexpected field name in file upload',
        },
      });
    }
  }
  next(error);
};
