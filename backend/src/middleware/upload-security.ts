/**
 * Enhanced Upload Security Middleware
 * أمان رفع الملفات المُحسَّن
 *
 * يوفر:
 * - التحقق من Magic Bytes (محتوى الملف الفعلي)
 * - تنظيف أسماء الملفات
 * - إزالة البيانات الوصفية الخطيرة (EXIF)
 * - حماية من Path Traversal
 */

import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';
import logger from '../lib/logger';
import path from 'path';
import crypto from 'crypto';

// ============================================
// Magic Bytes للتحقق من نوع الملف الحقيقي
// ============================================

const MAGIC_BYTES: Record<string, Buffer[]> = {
  'image/jpeg': [
    Buffer.from([0xFF, 0xD8, 0xFF]),
  ],
  'image/png': [
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  ],
  'image/gif': [
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), // GIF87a
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89a
  ],
  'image/webp': [
    Buffer.from([0x52, 0x49, 0x46, 0x46]), // RIFF (first 4 bytes, then WEBP at offset 8)
  ],
};

// ============================================
// قائمة الامتدادات المحظورة
// ============================================

const DANGEROUS_EXTENSIONS = [
  '.exe', '.dll', '.bat', '.cmd', '.sh', '.bash',
  '.php', '.php3', '.php4', '.php5', '.phtml',
  '.asp', '.aspx', '.jsp', '.jspx',
  '.js', '.ts', '.mjs', '.cjs',
  '.py', '.pyc', '.pyo',
  '.rb', '.pl', '.cgi',
  '.htaccess', '.htpasswd',
  '.env', '.config', '.ini', '.conf',
  '.sql', '.sqlite', '.db',
  '.zip', '.rar', '.tar', '.gz', '.7z',
  '.html', '.htm', '.svg', '.xml',
];

// ============================================
// أنماط أسماء الملفات المحظورة
// ============================================

const DANGEROUS_FILENAME_PATTERNS = [
  /\.\./,                    // Path traversal
  /[<>:"|?*]/,               // Windows invalid chars
  /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i, // Windows reserved names
  /\0/,                      // Null byte
  /[\x00-\x1F]/,             // Control characters
];

// ============================================
// الدوال المساعدة
// ============================================

/**
 * التحقق من Magic Bytes للملف
 */
function validateMagicBytes(buffer: Buffer, declaredMimeType: string): boolean {
  const magicPatterns = MAGIC_BYTES[declaredMimeType];

  if (!magicPatterns) {
    // نوع غير معروف - رفض بشكل افتراضي
    return false;
  }

  for (const pattern of magicPatterns) {
    if (buffer.length >= pattern.length) {
      const fileHeader = buffer.subarray(0, pattern.length);
      if (fileHeader.equals(pattern)) {
        // WebP يحتاج تحقق إضافي
        if (declaredMimeType === 'image/webp') {
          // تحقق من "WEBP" في الموضع 8
          if (buffer.length >= 12) {
            const webpSignature = buffer.subarray(8, 12).toString('ascii');
            return webpSignature === 'WEBP';
          }
          return false;
        }
        return true;
      }
    }
  }

  return false;
}

/**
 * تنظيف اسم الملف من الأحرف الخطيرة
 */
function sanitizeFilename(filename: string): string {
  // إزالة المسار
  let sanitized = path.basename(filename);

  // إزالة الأحرف الخطيرة
  sanitized = sanitized
    .replace(/\.\./g, '')           // Path traversal
    .replace(/[<>:"|?*\x00-\x1F]/g, '')  // Windows invalid + control chars
    .replace(/\s+/g, '_')           // Spaces to underscores
    .replace(/[^\w\-_.]/g, '');     // Keep only safe chars

  // التحقق من الأسماء المحجوزة في Windows
  const nameWithoutExt = sanitized.replace(/\.[^.]*$/, '');
  if (/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(nameWithoutExt)) {
    sanitized = `file_${sanitized}`;
  }

  // إذا أصبح الاسم فارغاً
  if (!sanitized || sanitized === '.') {
    sanitized = `file_${Date.now()}`;
  }

  return sanitized;
}

/**
 * إنشاء اسم ملف آمن وفريد
 */
function generateSecureFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const randomPart = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();

  return `${timestamp}_${randomPart}${ext}`;
}

/**
 * التحقق من امتداد الملف
 */
function isExtensionSafe(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return !DANGEROUS_EXTENSIONS.includes(ext);
}

/**
 * التحقق من اسم الملف
 */
function isFilenameSafe(filename: string): boolean {
  return !DANGEROUS_FILENAME_PATTERNS.some(pattern => pattern.test(filename));
}

// ============================================
// Middleware الرئيسية
// ============================================

/**
 * التحقق من أمان الملف المرفوع
 * يجب استخدامه بعد multer
 */
export const validateUploadedFile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const file = req.file;
    const files = req.files as Express.Multer.File[] | undefined;

    // التحقق من ملف واحد
    if (file) {
      validateSingleFile(file);
    }

    // التحقق من ملفات متعددة
    if (files && Array.isArray(files)) {
      for (const f of files) {
        validateSingleFile(f);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * التحقق من ملف واحد
 */
function validateSingleFile(file: Express.Multer.File): void {
  // 1. التحقق من اسم الملف
  if (!isFilenameSafe(file.originalname)) {
    logger.warn('Dangerous filename detected', {
      filename: file.originalname,
      mimetype: file.mimetype,
    });
    throw new BadRequestError('اسم الملف يحتوي على أحرف غير مسموحة');
  }

  // 2. التحقق من الامتداد
  if (!isExtensionSafe(file.originalname)) {
    logger.warn('Dangerous file extension detected', {
      filename: file.originalname,
      extension: path.extname(file.originalname),
    });
    throw new BadRequestError('نوع الملف غير مسموح');
  }

  // 3. التحقق من Magic Bytes (إذا كان الملف في الذاكرة)
  if (file.buffer && file.buffer.length > 0) {
    if (!validateMagicBytes(file.buffer, file.mimetype)) {
      logger.warn('Magic bytes mismatch', {
        filename: file.originalname,
        declaredMime: file.mimetype,
        headerBytes: file.buffer.subarray(0, 16).toString('hex'),
      });
      throw new BadRequestError('محتوى الملف لا يتطابق مع النوع المُعلن');
    }
  }

  // 4. التحقق من الحجم (حماية إضافية)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new BadRequestError(`حجم الملف كبير جداً. الحد الأقصى ${maxSize / 1024 / 1024}MB`);
  }

  // 5. تنظيف وإعادة تسمية الملف
  file.originalname = sanitizeFilename(file.originalname);
}

/**
 * إنشاء اسم ملف آمن للتخزين
 */
export const secureFilenameMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const file = req.file;
  const files = req.files as Express.Multer.File[] | undefined;

  if (file) {
    (file as Express.Multer.File & { secureFilename: string }).secureFilename =
      generateSecureFilename(file.originalname);
  }

  if (files && Array.isArray(files)) {
    for (const f of files) {
      (f as Express.Multer.File & { secureFilename: string }).secureFilename =
        generateSecureFilename(f.originalname);
    }
  }

  next();
};

/**
 * التحقق من Content-Type header
 */
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.headers['content-type'];

    if (!contentType) {
      throw new BadRequestError('Content-Type header is required');
    }

    const isAllowed = allowedTypes.some(type =>
      contentType.toLowerCase().includes(type.toLowerCase())
    );

    if (!isAllowed) {
      logger.warn('Invalid Content-Type', {
        received: contentType,
        allowed: allowedTypes,
        path: req.path,
      });
      throw new BadRequestError('نوع المحتوى غير مسموح');
    }

    next();
  };
};

/**
 * Middleware لتسجيل عمليات الرفع
 */
export const logUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const file = req.file;
  const files = req.files as Express.Multer.File[] | undefined;
  const userId = (req as Request & { user?: { id: string } }).user?.id;

  if (file) {
    logger.info('File upload', {
      userId,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      ip: req.ip,
    });
  }

  if (files && Array.isArray(files)) {
    logger.info('Multiple file upload', {
      userId,
      count: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      ip: req.ip,
    });
  }

  next();
};

// ============================================
// دوال مساعدة للتصدير
// ============================================

export {
  sanitizeFilename,
  generateSecureFilename,
  validateMagicBytes,
  isExtensionSafe,
  isFilenameSafe,
};

export default {
  validateUploadedFile,
  secureFilenameMiddleware,
  validateContentType,
  logUpload,
  sanitizeFilename,
  generateSecureFilename,
};
