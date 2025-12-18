// ============================================
// Service Providers Routes
// مقدمي الخدمات - المسارات
// ============================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import { z } from 'zod';

// Import controllers (to be created)
import {
  registerProvider,
  getProvider,
  searchProviders,
  updateProfile,
  uploadProfileImage,
  getMyServices,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  uploadServiceImages,
  getAvailability,
  updateAvailability,
  blockDates,
  toggleOnlineStatus,
  getCertifications,
  addCertification,
  deleteCertification,
  getStats,
  getEarnings,
  getPayouts,
  requestPayout,
  updateBankDetails,
  getSubscription,
  upgradeSubscription,
  joinExpressPool,
  updateLocation,
  toggleExpressStatus,
  getProviderReviews,
  respondToReview,
} from '../controllers/providers.controller';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const registerProviderSchema = z.object({
  body: z.object({
    displayNameAr: z.string().min(3).max(100),
    displayNameEn: z.string().min(3).max(100).optional(),
    bioAr: z.string().max(500).optional(),
    bioEn: z.string().max(500).optional(),
    businessType: z.enum(['INDIVIDUAL', 'COMPANY', 'FREELANCER']),
    businessName: z.string().optional(),
    phone: z.string().min(10).max(15),
    alternatePhone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email(),
    website: z.string().url().optional(),
    governorate: z.string(),
    city: z.string(),
    district: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    serviceRadius: z.number().min(1).max(100).optional(),
    nationalIdNumber: z.string(),
    nationalIdImage: z.string(),
    selfieWithId: z.string(),
    categoryIds: z.array(z.string().uuid()),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    displayNameAr: z.string().min(3).max(100).optional(),
    displayNameEn: z.string().min(3).max(100).optional(),
    bioAr: z.string().max(500).optional(),
    bioEn: z.string().max(500).optional(),
    phone: z.string().min(10).max(15).optional(),
    alternatePhone: z.string().optional(),
    whatsapp: z.string().optional(),
    website: z.string().url().optional(),
    governorate: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    serviceRadius: z.number().min(1).max(100).optional(),
  }),
});

const createServiceSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    titleAr: z.string().min(5).max(200),
    titleEn: z.string().min(5).max(200).optional(),
    descriptionAr: z.string().min(20).max(2000),
    descriptionEn: z.string().max(2000).optional(),
    shortDescriptionAr: z.string().max(200).optional(),
    shortDescriptionEn: z.string().max(200).optional(),
    pricingType: z.enum(['FIXED', 'HOURLY', 'DAILY', 'QUOTE_BASED', 'STARTING_FROM', 'PACKAGE']),
    price: z.number().min(0),
    priceMax: z.number().min(0).optional(),
    durationMinutes: z.number().min(15).optional(),
    durationHours: z.number().min(0.5).optional(),
    locationType: z.enum(['AT_PROVIDER', 'AT_CUSTOMER', 'ONLINE', 'BOTH']),
    includedItemsAr: z.array(z.string()).optional(),
    includedItemsEn: z.array(z.string()).optional(),
    excludedItemsAr: z.array(z.string()).optional(),
    excludedItemsEn: z.array(z.string()).optional(),
    requirementsAr: z.array(z.string()).optional(),
    requirementsEn: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    linkedMarketplace: z.enum([
      'CARS', 'PROPERTIES', 'MOBILES', 'GOLD', 'SILVER',
      'LUXURY', 'SCRAP', 'AUCTIONS', 'TENDERS', 'BARTER', 'GENERAL'
    ]).optional(),
    acceptsInstantBooking: z.boolean().optional(),
    acceptsExpressService: z.boolean().optional(),
    expressExtraCharge: z.number().min(0).max(100).optional(),
  }),
});

const availabilitySchema = z.object({
  body: z.object({
    availability: z.array(z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      isAvailable: z.boolean(),
    })),
  }),
});

const blockDatesSchema = z.object({
  body: z.object({
    dates: z.array(z.string().datetime()),
  }),
});

const certificationSchema = z.object({
  body: z.object({
    type: z.enum([
      'PROFESSIONAL_LICENSE', 'TRADE_CERTIFICATE', 'ACADEMIC_DEGREE',
      'TRAINING_CERTIFICATE', 'XCHANGE_ACADEMY', 'INDUSTRY_CERTIFICATION', 'INSURANCE_CERTIFICATE'
    ]),
    titleAr: z.string(),
    titleEn: z.string().optional(),
    issuingAuthority: z.string(),
    certificateNumber: z.string().optional(),
    certificateImage: z.string().optional(),
    issuedAt: z.string().datetime(),
    expiresAt: z.string().datetime().optional(),
  }),
});

const bankDetailsSchema = z.object({
  body: z.object({
    bankName: z.string(),
    bankAccountName: z.string(),
    bankAccountNumber: z.string(),
    bankIban: z.string().optional(),
  }),
});

const payoutRequestSchema = z.object({
  body: z.object({
    amount: z.number().min(100), // Minimum 100 EGP
  }),
});

const locationUpdateSchema = z.object({
  body: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

const reviewResponseSchema = z.object({
  body: z.object({
    response: z.string().min(10).max(500),
  }),
});

// ============================================
// Registration & Profile Routes
// ============================================

// Register as provider
router.post('/register', authenticate, validate(registerProviderSchema), registerProvider);

// Get provider by ID
router.get('/:id', getProvider);

// Search providers
router.get('/search', searchProviders);

// Update provider profile
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);

// Upload profile image
router.post('/profile/image', authenticate, uploadSingle('image'), uploadProfileImage);

// ============================================
// Services Management Routes
// ============================================

// Get my services
router.get('/services', authenticate, getMyServices);

// Create service
router.post('/services', authenticate, validate(createServiceSchema), createService);

// Update service
router.put('/services/:serviceId', authenticate, updateService);

// Delete service
router.delete('/services/:serviceId', authenticate, deleteService);

// Toggle service status
router.post('/services/:serviceId/toggle-status', authenticate, toggleServiceStatus);

// Upload service images
router.post('/services/:serviceId/images', authenticate, uploadMultiple('images', 10), uploadServiceImages);

// ============================================
// Availability Routes
// ============================================

// Get availability settings
router.get('/availability', authenticate, getAvailability);

// Update availability
router.put('/availability', authenticate, validate(availabilitySchema), updateAvailability);

// Block specific dates
router.post('/availability/block', authenticate, validate(blockDatesSchema), blockDates);

// Toggle online status
router.post('/status', authenticate, toggleOnlineStatus);

// ============================================
// Certifications Routes
// ============================================

// Get certifications
router.get('/certifications', authenticate, getCertifications);

// Add certification
router.post('/certifications', authenticate, validate(certificationSchema), addCertification);

// Delete certification
router.delete('/certifications/:certificationId', authenticate, deleteCertification);

// ============================================
// Statistics & Earnings Routes
// ============================================

// Get provider stats
router.get('/stats', authenticate, getStats);

// Get earnings
router.get('/earnings', authenticate, getEarnings);

// Get payouts
router.get('/payouts', authenticate, getPayouts);

// Request payout
router.post('/payouts', authenticate, validate(payoutRequestSchema), requestPayout);

// Update bank details
router.put('/bank-details', authenticate, validate(bankDetailsSchema), updateBankDetails);

// ============================================
// Subscription Routes
// ============================================

// Get subscription
router.get('/subscription', authenticate, getSubscription);

// Upgrade subscription
router.post('/subscription/upgrade', authenticate, upgradeSubscription);

// ============================================
// Express Service Routes
// ============================================

// Join express pool
router.post('/express/join', authenticate, joinExpressPool);

// Update location (for express tracking)
router.post('/express/location', authenticate, validate(locationUpdateSchema), updateLocation);

// Toggle express status
router.post('/express/status', authenticate, toggleExpressStatus);

// ============================================
// Reviews Routes
// ============================================

// Get provider reviews
router.get('/:id/reviews', getProviderReviews);

// Respond to review
router.post('/reviews/:reviewId/respond', authenticate, validate(reviewResponseSchema), respondToReview);

export default router;
