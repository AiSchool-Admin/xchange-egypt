import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { BadRequestError } from './errors';

/**
 * Password Security Configuration
 * إعدادات أمان كلمة المرور
 */
const PASSWORD_CONFIG = {
  // عدد جولات التشفير (12 موصى به للإنتاج)
  saltRounds: 12,
  // الحد الأدنى لطول كلمة المرور
  minLength: 8,
  // الحد الأقصى لطول كلمة المرور (لمنع DoS)
  maxLength: 128,
  // متطلبات كلمة المرور
  requirements: {
    uppercase: true,    // حرف كبير
    lowercase: true,    // حرف صغير
    number: true,       // رقم
    special: false,     // رمز خاص (اختياري)
  },
};

/**
 * قائمة كلمات المرور الشائعة المحظورة
 */
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'password123', 'admin', 'letmein', 'welcome', 'monkey',
  '111111', '1234567', 'dragon', 'master', 'sunshine',
  'password1', '123456789', 'football', 'iloveyou', 'trustno1',
];

/**
 * التحقق من قوة كلمة المرور
 * @param password - كلمة المرور للفحص
 * @throws BadRequestError إذا كانت كلمة المرور ضعيفة
 */
export const validatePasswordStrength = (password: string): void => {
  const errors: string[] = [];

  // فحص الطول
  if (password.length < PASSWORD_CONFIG.minLength) {
    errors.push(`كلمة المرور قصيرة جداً (الحد الأدنى ${PASSWORD_CONFIG.minLength} أحرف)`);
  }

  if (password.length > PASSWORD_CONFIG.maxLength) {
    errors.push(`كلمة المرور طويلة جداً (الحد الأقصى ${PASSWORD_CONFIG.maxLength} حرف)`);
  }

  // فحص وجود حرف كبير
  if (PASSWORD_CONFIG.requirements.uppercase && !/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
  }

  // فحص وجود حرف صغير
  if (PASSWORD_CONFIG.requirements.lowercase && !/[a-z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف صغير واحد على الأقل');
  }

  // فحص وجود رقم
  if (PASSWORD_CONFIG.requirements.number && !/[0-9]/.test(password)) {
    errors.push('يجب أن تحتوي على رقم واحد على الأقل');
  }

  // فحص وجود رمز خاص
  if (PASSWORD_CONFIG.requirements.special && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('يجب أن تحتوي على رمز خاص واحد على الأقل');
  }

  // فحص كلمات المرور الشائعة
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('كلمة المرور شائعة جداً وغير آمنة');
  }

  // فحص الأنماط المتكررة
  if (/(.)\1{3,}/.test(password)) {
    errors.push('كلمة المرور تحتوي على أحرف متكررة كثيراً');
  }

  // فحص التسلسلات
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    errors.push('كلمة المرور تحتوي على تسلسل سهل التخمين');
  }

  if (errors.length > 0) {
    throw new BadRequestError(`كلمة المرور ضعيفة: ${errors.join('. ')}`);
  }
};

/**
 * تشفير كلمة المرور باستخدام bcrypt
 * @param password - كلمة المرور النصية
 * @returns كلمة المرور المشفرة
 */
export const hashPassword = async (password: string): Promise<string> => {
  // التحقق من قوة كلمة المرور (اختياري - يمكن تعطيله في بعض الحالات)
  // validatePasswordStrength(password);

  return await bcrypt.hash(password, PASSWORD_CONFIG.saltRounds);
};

/**
 * تشفير كلمة المرور مع التحقق من القوة
 * @param password - كلمة المرور النصية
 * @returns كلمة المرور المشفرة
 */
export const hashPasswordWithValidation = async (password: string): Promise<string> => {
  validatePasswordStrength(password);
  return await bcrypt.hash(password, PASSWORD_CONFIG.saltRounds);
};

/**
 * مقارنة كلمة المرور مع التشفير
 * محمية من هجمات التوقيت (Timing Attacks)
 * @param password - كلمة المرور النصية
 * @param hashedPassword - كلمة المرور المشفرة من قاعدة البيانات
 * @returns صح إذا تطابقت كلمات المرور
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  // التحقق من وجود قيم صالحة
  if (!password || !hashedPassword) {
    // استخدام مقارنة وهمية لمنع كشف وجود المستخدم
    await bcrypt.compare('dummy', '$2a$12$dummy.hash.to.prevent.timing.attacks');
    return false;
  }

  return await bcrypt.compare(password, hashedPassword);
};

/**
 * إنشاء رمز إعادة تعيين كلمة المرور
 * @returns رمز آمن عشوائي
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * تشفير رمز إعادة التعيين للتخزين
 * @param token - الرمز العشوائي
 * @returns الرمز المشفر
 */
export const hashResetToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * التحقق من انتهاء صلاحية الرمز
 * @param expiresAt - تاريخ انتهاء الصلاحية
 * @returns صح إذا انتهت الصلاحية
 */
export const isTokenExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

/**
 * حساب قوة كلمة المرور (0-100)
 * @param password - كلمة المرور
 * @returns درجة القوة
 */
export const calculatePasswordStrength = (password: string): number => {
  let score = 0;

  // الطول
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // الأحرف الكبيرة والصغيرة
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;

  // الأرقام
  if (/[0-9]/.test(password)) score += 15;

  // الرموز الخاصة
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

  // تنوع الأحرف
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 8) score += 10;

  return Math.min(score, 100);
};

export default {
  hashPassword,
  hashPasswordWithValidation,
  comparePassword,
  validatePasswordStrength,
  generateResetToken,
  hashResetToken,
  isTokenExpired,
  calculatePasswordStrength,
};
