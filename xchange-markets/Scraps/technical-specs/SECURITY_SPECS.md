# 🔐 مواصفات الأمان - Xchange Scrap Marketplace

## Security Specifications

---

## 📋 الفهرس

1. [نظرة عامة](#1-نظرة-عامة)
2. [المصادقة والتفويض](#2-المصادقة-والتفويض)
3. [حماية البيانات](#3-حماية-البيانات)
4. [أمان API](#4-أمان-api)
5. [أمان قاعدة البيانات](#5-أمان-قاعدة-البيانات)
6. [منع الاحتيال](#6-منع-الاحتيال)
7. [الامتثال والخصوصية](#7-الامتثال-والخصوصية)
8. [المراقبة والاستجابة](#8-المراقبة-والاستجابة)

---

## 1. نظرة عامة

### 1.1 مبادئ الأمان

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Principles                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔒 Defense in Depth    →  طبقات متعددة من الحماية         │
│                                                              │
│  🔑 Least Privilege     →  أقل صلاحيات ممكنة               │
│                                                              │
│  🛡️ Secure by Default   →  الأمان افتراضياً                │
│                                                              │
│  📊 Audit Everything    →  تسجيل كل العمليات               │
│                                                              │
│  🚨 Fail Securely       →  الفشل بأمان                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 تصنيف البيانات

| التصنيف | الوصف | أمثلة |
|---------|-------|-------|
| **حساس جداً** | بيانات شخصية حرجة | الرقم القومي، البطاقة البنكية |
| **حساس** | بيانات شخصية | الاسم، رقم الموبايل، العنوان |
| **داخلي** | بيانات تشغيلية | المعاملات، الأسعار |
| **عام** | بيانات متاحة | أسعار الخردة، قائمة المحافظات |

---

## 2. المصادقة والتفويض

### 2.1 نظام OTP

```typescript
// config/otp.config.ts

export const otpConfig = {
  // طول الرمز
  length: 6,
  
  // صلاحية الرمز (بالثواني)
  expiry: 300, // 5 دقائق
  
  // أقصى عدد محاولات
  maxAttempts: 3,
  
  // فترة الانتظار بين الطلبات (بالثواني)
  cooldown: 60,
  
  // حد الطلبات في الساعة
  hourlyLimit: 5,
  
  // حد الطلبات اليومية
  dailyLimit: 10,
};
```

**التنفيذ الآمن:**

```typescript
// services/otp.service.ts

import crypto from 'crypto';
import bcrypt from 'bcrypt';

class OTPService {
  /**
   * إنشاء OTP آمن
   */
  generateOTP(): string {
    // استخدام crypto للأرقام العشوائية الآمنة
    const buffer = crypto.randomBytes(4);
    const number = buffer.readUInt32BE(0);
    const otp = (number % 900000 + 100000).toString();
    return otp;
  }

  /**
   * تخزين OTP مشفر
   */
  async storeOTP(phone: string, otp: string): Promise<void> {
    // تشفير OTP قبل التخزين
    const hashedOTP = await bcrypt.hash(otp, 10);
    
    await prisma.oTP.create({
      data: {
        phone,
        code: hashedOTP,
        expiresAt: new Date(Date.now() + otpConfig.expiry * 1000),
      },
    });
  }

  /**
   * التحقق من OTP
   */
  async verifyOTP(phone: string, inputOTP: string): Promise<boolean> {
    const record = await prisma.oTP.findFirst({
      where: {
        phone,
        expiresAt: { gt: new Date() },
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) return false;
    
    // التحقق من عدد المحاولات
    if (record.attempts >= otpConfig.maxAttempts) {
      throw new Error('MAX_ATTEMPTS_EXCEEDED');
    }

    // زيادة عدد المحاولات
    await prisma.oTP.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    // مقارنة مع الـ hash
    const isValid = await bcrypt.compare(inputOTP, record.code);
    
    if (isValid) {
      await prisma.oTP.update({
        where: { id: record.id },
        data: { verifiedAt: new Date() },
      });
    }

    return isValid;
  }
}
```

### 2.2 JWT Configuration

```typescript
// config/jwt.config.ts

export const jwtConfig = {
  // خوارزمية التشفير
  algorithm: 'RS256' as const,
  
  // صلاحية Access Token
  accessTokenExpiry: '1h',
  
  // صلاحية Refresh Token
  refreshTokenExpiry: '30d',
  
  // Issuer
  issuer: 'xchange-scrap-api',
  
  // Audience
  audience: 'xchange-scrap-app',
};

// استخدام مفاتيح RSA
const privateKey = fs.readFileSync('keys/private.pem');
const publicKey = fs.readFileSync('keys/public.pem');

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, privateKey, {
    algorithm: jwtConfig.algorithm,
    expiresIn: jwtConfig.accessTokenExpiry,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, publicKey, {
    algorithms: [jwtConfig.algorithm],
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  }) as TokenPayload;
}
```

### 2.3 مستويات الصلاحيات

```typescript
// types/permissions.ts

export enum Permission {
  // User
  READ_OWN_PROFILE = 'read:own_profile',
  UPDATE_OWN_PROFILE = 'update:own_profile',
  
  // Pickups
  CREATE_PICKUP = 'create:pickup',
  READ_OWN_PICKUPS = 'read:own_pickups',
  CANCEL_OWN_PICKUP = 'cancel:own_pickup',
  
  // Listings
  CREATE_LISTING = 'create:listing',
  READ_LISTINGS = 'read:listings',
  UPDATE_OWN_LISTING = 'update:own_listing',
  DELETE_OWN_LISTING = 'delete:own_listing',
  
  // Collector
  ACCEPT_PICKUP = 'accept:pickup',
  UPDATE_PICKUP_STATUS = 'update:pickup_status',
  
  // Dealer
  MANAGE_DEALER_PROFILE = 'manage:dealer_profile',
  MANAGE_DEALER_PRICES = 'manage:dealer_prices',
  
  // Admin
  MANAGE_USERS = 'manage:users',
  MANAGE_PRICES = 'manage:prices',
  VIEW_ANALYTICS = 'view:analytics',
  MANAGE_SYSTEM = 'manage:system',
}

export const rolePermissions: Record<UserType, Permission[]> = {
  individual: [
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.CREATE_PICKUP,
    Permission.READ_OWN_PICKUPS,
    Permission.CANCEL_OWN_PICKUP,
    Permission.CREATE_LISTING,
    Permission.READ_LISTINGS,
    Permission.UPDATE_OWN_LISTING,
    Permission.DELETE_OWN_LISTING,
  ],
  
  collector: [
    // all individual permissions
    ...rolePermissions.individual,
    Permission.ACCEPT_PICKUP,
    Permission.UPDATE_PICKUP_STATUS,
  ],
  
  dealer: [
    ...rolePermissions.individual,
    Permission.MANAGE_DEALER_PROFILE,
    Permission.MANAGE_DEALER_PRICES,
  ],
  
  company: [
    ...rolePermissions.individual,
    // B2B permissions
  ],
  
  admin: [
    // All permissions
    ...Object.values(Permission),
  ],
};
```

### 2.4 Rate Limiting

```typescript
// middleware/rateLimiter.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '@/lib/redis';

// General API rate limit
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'تجاوزت الحد الأقصى للطلبات، يرجى المحاولة لاحقاً',
    },
  },
  keyGenerator: (req) => req.user?.id || req.ip,
});

// OTP rate limit (stricter)
export const otpLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:otp:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 OTP requests per hour
  message: {
    success: false,
    error: {
      code: 'OTP_RATE_LIMIT',
      message: 'تجاوزت الحد الأقصى لطلبات رمز التحقق',
    },
  },
  keyGenerator: (req) => req.body.phone,
});

// Login attempts limiter
export const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:login:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  skipSuccessfulRequests: true,
});
```

---

## 3. حماية البيانات

### 3.1 التشفير

```typescript
// lib/encryption.ts

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// للبيانات الحساسة جداً
export function hashSensitive(data: string): string {
  return crypto
    .createHmac('sha256', process.env.HASH_SECRET!)
    .update(data)
    .digest('hex');
}
```

### 3.2 حماية الحقول الحساسة

```typescript
// middleware/dataProtection.ts

// حقول يجب تشفيرها في قاعدة البيانات
const ENCRYPTED_FIELDS = ['nationalId', 'bankAccount'];

// حقول يجب إخفاؤها في الـ API
const HIDDEN_FIELDS = ['password', 'refreshToken', 'otpCode'];

// حقول يجب إخفاء جزء منها
const MASKED_FIELDS = {
  phone: (value: string) => value.replace(/(\+20\d{2})\d{4}(\d{4})/, '$1****$2'),
  nationalId: (value: string) => value.replace(/(\d{2})\d{10}(\d{2})/, '$1**********$2'),
  email: (value: string) => value.replace(/(.{2}).*(@.*)/, '$1***$2'),
};

export function sanitizeResponse(data: any, level: 'owner' | 'public' = 'public'): any {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeResponse(item, level));
  }
  
  if (typeof data === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // إخفاء الحقول تماماً
      if (HIDDEN_FIELDS.includes(key)) continue;
      
      // إخفاء جزئي للبيانات العامة
      if (level === 'public' && MASKED_FIELDS[key]) {
        sanitized[key] = MASKED_FIELDS[key](value as string);
      } else {
        sanitized[key] = sanitizeResponse(value, level);
      }
    }
    
    return sanitized;
  }
  
  return data;
}
```

### 3.3 Secure Headers

```typescript
// middleware/securityHeaders.ts

import helmet from 'helmet';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://maps.googleapis.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.xchange.com.eg', 'wss:'],
      frameSrc: ["'self'", 'https://accept.paymob.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});
```

---

## 4. أمان API

### 4.1 Input Validation

```typescript
// middleware/validation.ts

import { z } from 'zod';

// Phone validation (Egyptian)
const phoneSchema = z.string()
  .regex(/^(\+20|0)1[0125]\d{8}$/, 'رقم موبايل مصري غير صحيح')
  .transform(phone => {
    // Normalize to +20 format
    return phone.startsWith('0') ? `+2${phone}` : phone;
  });

// National ID validation
const nationalIdSchema = z.string()
  .length(14, 'الرقم القومي يجب أن يكون 14 رقم')
  .regex(/^\d{14}$/, 'الرقم القومي يجب أن يحتوي على أرقام فقط');

// Sanitize text input
const sanitizedString = z.string()
  .transform(str => str.trim())
  .transform(str => str.replace(/<[^>]*>/g, '')) // Remove HTML
  .transform(str => str.replace(/[<>"'&]/g, '')); // Remove special chars

// Request schemas
export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const createPickupSchema = z.object({
  materials: z.array(z.object({
    materialTypeId: z.string().uuid(),
    estimatedKg: z.number().min(0.5).max(10000),
    qualityGrade: z.enum(['premium', 'standard', 'mixed', 'low']).optional(),
  })).min(1).max(10),
  
  address: z.object({
    governorate: sanitizedString.min(2).max(50),
    city: sanitizedString.min(2).max(100),
    street: sanitizedString.min(5).max(200),
    building: sanitizedString.max(50).optional(),
    floor: sanitizedString.max(10).optional(),
    landmark: sanitizedString.max(200).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }),
  
  preferredDate: z.string().refine(date => {
    const parsed = new Date(date);
    return parsed >= new Date(new Date().setHours(0, 0, 0, 0));
  }, 'لا يمكن اختيار تاريخ في الماضي'),
  
  preferredTimeSlot: z.enum(['morning', 'afternoon', 'evening']),
  
  notes: sanitizedString.max(500).optional(),
});
```

### 4.2 SQL Injection Prevention

```typescript
// Prisma يحمي من SQL Injection تلقائياً
// لكن للاستعلامات الخام:

// ❌ خطأ - عرضة للحقن
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE phone = ${phone}
`;

// ✅ صحيح - استخدام Prisma.sql
import { Prisma } from '@prisma/client';

const result = await prisma.$queryRaw(
  Prisma.sql`SELECT * FROM users WHERE phone = ${phone}`
);

// ✅ الأفضل - استخدام Prisma Query Builder
const result = await prisma.user.findUnique({
  where: { phone },
});
```

### 4.3 CORS Configuration

```typescript
// config/cors.ts

import cors from 'cors';

const allowedOrigins = [
  'https://xchange.com.eg',
  'https://www.xchange.com.eg',
  'https://app.xchange.com.eg',
];

if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:3000');
}

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};
```

---

## 5. أمان قاعدة البيانات

### 5.1 Connection Security

```typescript
// prisma/client.ts

const databaseUrl = new URL(process.env.DATABASE_URL!);

// إضافة SSL في الإنتاج
if (process.env.NODE_ENV === 'production') {
  databaseUrl.searchParams.set('sslmode', 'require');
  databaseUrl.searchParams.set('sslcert', '/path/to/cert.pem');
}

// Connection pooling
databaseUrl.searchParams.set('connection_limit', '10');
databaseUrl.searchParams.set('pool_timeout', '10');
```

### 5.2 Audit Logging

```typescript
// middleware/auditLog.ts

import { prisma } from '@/lib/prisma';

interface AuditLogEntry {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      ...entry,
      oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
      newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
    },
  });
}

// Middleware للتسجيل التلقائي
export function auditMiddleware(action: string, entityType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Log after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAudit({
          userId: req.user?.id,
          action,
          entityType,
          entityId: req.params.id || body?.data?.id,
          newValue: req.body,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}
```

### 5.3 Backup & Recovery

```yaml
# Database Backup Strategy

Daily Backups:
  - Full database backup at 3:00 AM
  - Retention: 30 days
  - Storage: AWS S3 (encrypted)

Hourly Backups:
  - Transaction logs
  - Retention: 7 days

Point-in-Time Recovery:
  - Enabled
  - Window: 7 days

Backup Encryption:
  - Algorithm: AES-256
  - Key Management: AWS KMS

Testing:
  - Weekly restore tests
  - Document recovery time
```

---

## 6. منع الاحتيال

### 6.1 كشف الأنماط المشبوهة

```typescript
// services/fraud.service.ts

interface FraudIndicator {
  type: string;
  score: number;
  details: string;
}

class FraudDetectionService {
  /**
   * فحص طلب جمع
   */
  async checkPickupRequest(
    userId: string,
    pickup: CreatePickupDto
  ): Promise<FraudIndicator[]> {
    const indicators: FraudIndicator[] = [];
    
    // 1. فحص عدد الطلبات في الساعة الأخيرة
    const recentPickups = await this.getRecentPickups(userId, '1h');
    if (recentPickups > 3) {
      indicators.push({
        type: 'HIGH_FREQUENCY',
        score: 30,
        details: `${recentPickups} طلبات في الساعة الأخيرة`,
      });
    }
    
    // 2. فحص القيمة المتوقعة
    if (pickup.estimatedPrice > 50000) {
      indicators.push({
        type: 'HIGH_VALUE',
        score: 20,
        details: `قيمة عالية: ${pickup.estimatedPrice} ج`,
      });
    }
    
    // 3. فحص العنوان
    const addressUsage = await this.getAddressUsage(pickup.address);
    if (addressUsage.differentUsers > 5) {
      indicators.push({
        type: 'SHARED_ADDRESS',
        score: 40,
        details: `العنوان مستخدم من ${addressUsage.differentUsers} حسابات`,
      });
    }
    
    // 4. فحص الجهاز
    const deviceFingerprint = await this.getDeviceInfo(userId);
    if (deviceFingerprint.accountsCount > 2) {
      indicators.push({
        type: 'MULTIPLE_ACCOUNTS',
        score: 50,
        details: `الجهاز مرتبط بـ ${deviceFingerprint.accountsCount} حسابات`,
      });
    }
    
    return indicators;
  }

  /**
   * حساب درجة المخاطر
   */
  calculateRiskScore(indicators: FraudIndicator[]): number {
    return Math.min(100, indicators.reduce((sum, i) => sum + i.score, 0));
  }

  /**
   * اتخاذ إجراء بناءً على المخاطر
   */
  async handleRisk(userId: string, riskScore: number): Promise<'allow' | 'review' | 'block'> {
    if (riskScore >= 80) {
      // حظر مؤقت
      await this.temporaryBlock(userId, '24h');
      await this.alertAdmins(userId, 'HIGH_RISK');
      return 'block';
    }
    
    if (riskScore >= 50) {
      // مراجعة يدوية
      await this.flagForReview(userId);
      return 'review';
    }
    
    return 'allow';
  }
}
```

### 6.2 التحقق من الهوية

```typescript
// services/verification.service.ts

interface VerificationLevel {
  level: 'basic' | 'verified' | 'premium';
  limits: {
    dailyTransactionLimit: number;
    monthlyTransactionLimit: number;
    singleTransactionLimit: number;
  };
}

const verificationLevels: Record<string, VerificationLevel> = {
  basic: {
    level: 'basic',
    limits: {
      dailyTransactionLimit: 5000,
      monthlyTransactionLimit: 20000,
      singleTransactionLimit: 2000,
    },
  },
  verified: {
    level: 'verified',
    limits: {
      dailyTransactionLimit: 50000,
      monthlyTransactionLimit: 200000,
      singleTransactionLimit: 20000,
    },
  },
  premium: {
    level: 'premium',
    limits: {
      dailyTransactionLimit: 500000,
      monthlyTransactionLimit: 2000000,
      singleTransactionLimit: 100000,
    },
  },
};

class VerificationService {
  /**
   * التحقق من البطاقة الشخصية
   */
  async verifyNationalId(userId: string, frontImage: Buffer, backImage: Buffer): Promise<boolean> {
    // 1. استخراج البيانات بـ OCR
    const extractedData = await this.ocrService.extract(frontImage, backImage);
    
    // 2. التحقق من صلاحية الرقم القومي
    if (!this.validateNationalIdChecksum(extractedData.nationalId)) {
      return false;
    }
    
    // 3. مطابقة مع بيانات المستخدم
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // 4. تحديث حالة التحقق
    if (extractedData.name.includes(user.name)) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          nationalId: this.encrypt(extractedData.nationalId),
          nationalIdVerified: true,
          isVerified: true,
        },
      });
      return true;
    }
    
    return false;
  }

  /**
   * التحقق من صلاحية الرقم القومي
   */
  validateNationalIdChecksum(nationalId: string): boolean {
    if (nationalId.length !== 14) return false;
    
    // فحص رقم القرن (2 أو 3)
    const century = nationalId[0];
    if (!['2', '3'].includes(century)) return false;
    
    // فحص تاريخ الميلاد
    const birthYear = century === '2' ? `19${nationalId.slice(1, 3)}` : `20${nationalId.slice(1, 3)}`;
    const birthMonth = nationalId.slice(3, 5);
    const birthDay = nationalId.slice(5, 7);
    
    const birthDate = new Date(`${birthYear}-${birthMonth}-${birthDay}`);
    if (isNaN(birthDate.getTime())) return false;
    
    // فحص كود المحافظة
    const governorateCode = nationalId.slice(7, 9);
    if (parseInt(governorateCode) < 1 || parseInt(governorateCode) > 35) return false;
    
    return true;
  }
}
```

---

## 7. الامتثال والخصوصية

### 7.1 سياسة الخصوصية

```markdown
# سياسة الخصوصية - Xchange Scrap

## البيانات التي نجمعها:
1. بيانات الهوية: الاسم، رقم الموبايل، الرقم القومي (اختياري)
2. بيانات الموقع: العنوان، الإحداثيات
3. بيانات المعاملات: الطلبات، المدفوعات
4. بيانات الاستخدام: سجل التصفح، الجهاز

## كيف نستخدم البيانات:
- تقديم الخدمات
- تحسين التجربة
- منع الاحتيال
- التواصل معك

## مشاركة البيانات:
- الجامعين (اسمك وعنوانك فقط لتنفيذ الطلب)
- مزودي الدفع (للمعاملات المالية)
- الجهات القانونية (عند الطلب)

## حقوقك:
- الوصول لبياناتك
- تصحيح بياناتك
- حذف بياناتك
- نقل بياناتك

## الاحتفاظ بالبيانات:
- بيانات الحساب: طوال فترة الحساب + 2 سنة
- المعاملات: 5 سنوات (متطلب قانوني)
- سجلات الأمان: 1 سنة
```

### 7.2 Data Retention

```typescript
// jobs/dataRetention.job.ts

import { schedule } from 'node-cron';

// تشغيل يومياً الساعة 2 صباحاً
schedule('0 2 * * *', async () => {
  console.log('Starting data retention cleanup...');
  
  // حذف OTPs المنتهية
  await prisma.oTP.deleteMany({
    where: {
      expiresAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  
  // حذف Refresh Tokens المنتهية
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  
  // أرشفة الحسابات غير النشطة (سنتين)
  const inactiveDate = new Date();
  inactiveDate.setFullYear(inactiveDate.getFullYear() - 2);
  
  const inactiveUsers = await prisma.user.findMany({
    where: {
      updatedAt: { lt: inactiveDate },
      isActive: true,
    },
  });
  
  for (const user of inactiveUsers) {
    await archiveUser(user.id);
  }
  
  // حذف سجلات المراقبة القديمة (سنة)
  const auditRetentionDate = new Date();
  auditRetentionDate.setFullYear(auditRetentionDate.getFullYear() - 1);
  
  await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: auditRetentionDate },
    },
  });
  
  console.log('Data retention cleanup completed');
});
```

---

## 8. المراقبة والاستجابة

### 8.1 Security Monitoring

```typescript
// services/monitoring.service.ts

import { Sentry } from '@sentry/node';

class SecurityMonitor {
  /**
   * تسجيل محاولة تسجيل دخول فاشلة
   */
  async logFailedLogin(phone: string, ip: string, reason: string): Promise<void> {
    await prisma.securityEvent.create({
      data: {
        type: 'FAILED_LOGIN',
        phone,
        ip,
        details: { reason },
      },
    });
    
    // فحص لهجمات Brute Force
    const failedAttempts = await this.getFailedAttempts(ip, '15m');
    if (failedAttempts > 10) {
      await this.blockIP(ip, '1h');
      await this.alertSecurityTeam('BRUTE_FORCE_DETECTED', { ip, attempts: failedAttempts });
    }
  }

  /**
   * تنبيه فريق الأمان
   */
  async alertSecurityTeam(type: string, details: any): Promise<void> {
    // Sentry
    Sentry.captureMessage(`Security Alert: ${type}`, {
      level: 'warning',
      extra: details,
    });
    
    // Email
    await emailService.send({
      to: 'security@xchange.com.eg',
      subject: `🚨 Security Alert: ${type}`,
      body: JSON.stringify(details, null, 2),
    });
    
    // Slack webhook
    await fetch(process.env.SLACK_SECURITY_WEBHOOK!, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 *Security Alert*: ${type}\n\`\`\`${JSON.stringify(details, null, 2)}\`\`\``,
      }),
    });
  }
}
```

### 8.2 Incident Response Plan

```yaml
# خطة الاستجابة للحوادث الأمنية

Level 1 - Low (تسرب بيانات محدود):
  Response Time: 24 hours
  Actions:
    - تحديد نطاق التسرب
    - إخطار المستخدمين المتأثرين
    - تصحيح الثغرة
    - توثيق الحادثة

Level 2 - Medium (اختراق حساب):
  Response Time: 4 hours
  Actions:
    - تعطيل الحساب المخترق
    - إعادة تعيين جميع الـ tokens
    - إخطار المستخدم
    - فحص الأنشطة المشبوهة
    - تصعيد إذا لزم الأمر

Level 3 - High (هجوم على النظام):
  Response Time: 1 hour
  Actions:
    - تفعيل وضع الطوارئ
    - عزل الأنظمة المتأثرة
    - إخطار الإدارة
    - التواصل مع الجهات المختصة
    - بدء التحقيق الجنائي الرقمي

Level 4 - Critical (تسرب بيانات واسع):
  Response Time: 15 minutes
  Actions:
    - إيقاف الخدمة مؤقتاً
    - تفعيل خطة الكوارث
    - إخطار الإدارة العليا
    - التواصل مع المحامين
    - إعداد بيان صحفي
    - إخطار السلطات
```

---

## 📝 Security Checklist

### قبل الإطلاق:

- [ ] تفعيل HTTPS (TLS 1.3)
- [ ] تكوين Security Headers
- [ ] تفعيل Rate Limiting
- [ ] اختبار Input Validation
- [ ] فحص SQL Injection
- [ ] فحص XSS
- [ ] تشفير البيانات الحساسة
- [ ] إعداد النسخ الاحتياطي
- [ ] تكوين المراقبة
- [ ] توثيق سياسة الخصوصية
- [ ] اختبار الاختراق

### دوري:

- [ ] مراجعة صلاحيات المستخدمين (شهرياً)
- [ ] تحديث المكتبات (أسبوعياً)
- [ ] فحص الثغرات (أسبوعياً)
- [ ] مراجعة سجلات الأمان (يومياً)
- [ ] اختبار النسخ الاحتياطي (أسبوعياً)
- [ ] تدريب الفريق (ربع سنوي)

---

*آخر تحديث: ديسمبر 2024*
*Xchange Scrap - Security Team*
