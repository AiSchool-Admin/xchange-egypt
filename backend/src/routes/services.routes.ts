// ============================================
// Services Marketplace Routes
// سوق الخدمات - المسارات
// ============================================

import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

// Controllers
import {
  getCategories,
  getCategory,
  searchServices,
  getService,
  getFeaturedServices,
  getRecommendations,
  getAuctionWinnerRecommendations,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  trackServiceView,
} from '../controllers/services.controller';

import {
  createBooking,
  calculatePrice,
  getMyBookings,
  getBooking,
  cancelBooking,
  confirmCompletion,
  acceptBooking,
  rejectBooking,
  startOnWay,
  startService,
  completeService,
  getProviderBookings,
} from '../controllers/services-bookings.controller';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const searchServicesSchema = z.object({
  query: z.object({
    query: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    linkedMarketplace: z.enum([
      'CARS', 'PROPERTIES', 'MOBILES', 'GOLD', 'SILVER',
      'LUXURY', 'SCRAP', 'AUCTIONS', 'TENDERS', 'BARTER', 'GENERAL'
    ]).optional(),
    governorate: z.string().optional(),
    city: z.string().optional(),
    minPrice: z.string().regex(/^\d+$/).optional(),
    maxPrice: z.string().regex(/^\d+$/).optional(),
    minRating: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    pricingType: z.enum(['FIXED', 'HOURLY', 'DAILY', 'QUOTE_BASED', 'STARTING_FROM', 'PACKAGE']).optional(),
    locationType: z.enum(['AT_PROVIDER', 'AT_CUSTOMER', 'ONLINE', 'BOTH']).optional(),
    isExpressAvailable: z.string().optional(),
    sortBy: z.enum(['price', 'rating', 'reviews', 'distance', 'newest', 'bookings']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    radius: z.string().optional(),
  }),
});

const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().uuid(),
    scheduledDate: z.string().datetime(),
    scheduledTimeStart: z.string().regex(/^\d{2}:\d{2}$/),
    scheduledTimeEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    locationType: z.enum(['AT_PROVIDER', 'AT_CUSTOMER', 'ONLINE', 'BOTH']),
    serviceAddress: z.string().optional(),
    serviceCity: z.string().optional(),
    serviceGovernorate: z.string().optional(),
    serviceLatitude: z.number().optional(),
    serviceLongitude: z.number().optional(),
    customerNotes: z.string().max(1000).optional(),
    selectedAddOnIds: z.array(z.string().uuid()).optional(),
    protectLevel: z.enum(['NONE', 'BASIC', 'STANDARD', 'PREMIUM', 'ELITE']).default('NONE'),
    payWithCredits: z.number().min(0).optional(),
    discountCode: z.string().optional(),
    linkedProductId: z.string().optional(),
    linkedProductType: z.string().optional(),
    isExpressService: z.boolean().optional(),
  }),
});

const calculatePriceSchema = z.object({
  body: z.object({
    serviceId: z.string().uuid(),
    selectedAddOnIds: z.array(z.string().uuid()).optional(),
    protectLevel: z.enum(['NONE', 'BASIC', 'STANDARD', 'PREMIUM', 'ELITE']).default('NONE'),
    isExpressService: z.boolean().optional(),
    discountCode: z.string().optional(),
  }),
});

const recommendationsSchema = z.object({
  body: z.object({
    productId: z.string(),
    productType: z.enum([
      'CARS', 'PROPERTIES', 'MOBILES', 'GOLD', 'SILVER',
      'LUXURY', 'SCRAP', 'AUCTIONS', 'TENDERS', 'BARTER', 'GENERAL'
    ]),
    transactionStage: z.enum(['viewing', 'before_payment', 'after_purchase', 'sold']),
  }),
});

const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().min(10).max(500),
  }),
});

const rejectBookingSchema = z.object({
  body: z.object({
    reason: z.string().min(10).max(500),
  }),
});

const startServiceSchema = z.object({
  body: z.object({
    beforePhotos: z.array(z.string().url()).optional(),
  }),
});

const completeServiceSchema = z.object({
  body: z.object({
    afterPhotos: z.array(z.string().url()).optional(),
    notes: z.string().max(1000).optional(),
  }),
});

// ============================================
// Category Routes
// ============================================

// Get all categories
router.get('/categories', getCategories);

// Get category by ID or slug
router.get('/categories/:idOrSlug', getCategory);

// ============================================
// Service Routes
// ============================================

// Search services
router.get('/search', optionalAuth, validate(searchServicesSchema), searchServices);

// Get featured services
router.get('/featured', getFeaturedServices);

// Get user's favorite services
router.get('/favorites', authenticate, getFavorites);

// Get service by ID
router.get('/:id', optionalAuth, getService);

// Track service view
router.post('/:id/view', trackServiceView);

// Add to favorites
router.post('/:id/favorite', authenticate, addToFavorites);

// Remove from favorites
router.delete('/:id/favorite', authenticate, removeFromFavorites);

// ============================================
// Recommendations Routes (Smart Linking)
// ============================================

// Get service recommendations for a product
router.post('/recommend', optionalAuth, validate(recommendationsSchema), getRecommendations);

// Get recommendations for auction winner
router.post('/recommend/auction-winner', authenticate, getAuctionWinnerRecommendations);

// ============================================
// Booking Routes
// ============================================

// Calculate booking price
router.post('/bookings/calculate-price', optionalAuth, validate(calculatePriceSchema), calculatePrice);

// Create booking
router.post('/bookings', authenticate, validate(createBookingSchema), createBooking);

// Get customer's bookings
router.get('/bookings/my', authenticate, getMyBookings);

// Get provider's bookings
router.get('/bookings/provider', authenticate, getProviderBookings);

// Get booking by ID
router.get('/bookings/:id', authenticate, getBooking);

// Cancel booking (customer)
router.post('/bookings/:id/cancel', authenticate, validate(cancelBookingSchema), cancelBooking);

// Confirm completion (customer)
router.post('/bookings/:id/confirm-completion', authenticate, confirmCompletion);

// Accept booking (provider)
router.post('/bookings/:id/accept', authenticate, acceptBooking);

// Reject booking (provider)
router.post('/bookings/:id/reject', authenticate, validate(rejectBookingSchema), rejectBooking);

// Start on way (provider)
router.post('/bookings/:id/on-way', authenticate, startOnWay);

// Start service (provider)
router.post('/bookings/:id/start', authenticate, validate(startServiceSchema), startService);

// Complete service (provider)
router.post('/bookings/:id/complete', authenticate, validate(completeServiceSchema), completeService);

export default router;
