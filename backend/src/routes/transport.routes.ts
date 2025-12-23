import { Router } from 'express';
import {
  getPriceEstimates,
  getProviders,
  getSurgeInfo,
  createPriceAlert,
  getPriceAlerts,
  deletePriceAlert,
  saveAddress,
  getSavedAddresses,
  getRideHistory,
  getRideStats,
} from '../controllers/transport.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// ============================================
// Public Routes (No Auth Required)
// ============================================

/**
 * @route   GET /api/v1/transport/estimates
 * @desc    Get price estimates from all providers
 * @query   pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleTypes (optional)
 * @access  Public
 */
router.get('/estimates', getPriceEstimates);

/**
 * @route   GET /api/v1/transport/providers
 * @desc    Get all available transport providers
 * @access  Public
 */
router.get('/providers', getProviders);

/**
 * @route   GET /api/v1/transport/surge
 * @desc    Get surge information for a location
 * @query   lat, lng
 * @access  Public
 */
router.get('/surge', getSurgeInfo);

// ============================================
// Protected Routes (Auth Required)
// ============================================

/**
 * @route   POST /api/v1/transport/alerts
 * @desc    Create a new price alert
 * @body    pickupLat, pickupLng, pickupAddress, dropoffLat, dropoffLng, dropoffAddress, targetPrice, provider?, vehicleType?, expiresInDays?, notifyPush?, notifyEmail?, notifySms?
 * @access  Private
 */
router.post('/alerts', authenticate, createPriceAlert);

/**
 * @route   GET /api/v1/transport/alerts
 * @desc    Get user's price alerts
 * @access  Private
 */
router.get('/alerts', authenticate, getPriceAlerts);

/**
 * @route   DELETE /api/v1/transport/alerts/:alertId
 * @desc    Delete a price alert
 * @access  Private
 */
router.delete('/alerts/:alertId', authenticate, deletePriceAlert);

/**
 * @route   POST /api/v1/transport/addresses
 * @desc    Save an address
 * @body    name?, nameAr?, type?, lat, lng, address, addressAr?, buildingName?, floor?, apartment?, landmark?, instructions?
 * @access  Private
 */
router.post('/addresses', authenticate, saveAddress);

/**
 * @route   GET /api/v1/transport/addresses
 * @desc    Get user's saved addresses
 * @access  Private
 */
router.get('/addresses', authenticate, getSavedAddresses);

/**
 * @route   GET /api/v1/transport/history
 * @desc    Get user's ride history
 * @query   limit?, offset?, status?
 * @access  Private
 */
router.get('/history', authenticate, getRideHistory);

/**
 * @route   GET /api/v1/transport/stats
 * @desc    Get user's ride statistics
 * @query   period? (week, month, year, all)
 * @access  Private
 */
router.get('/stats', authenticate, getRideStats);

// ============================================
// Routes with Optional Auth
// ============================================

/**
 * @route   GET /api/v1/transport/estimates/compare
 * @desc    Compare prices between providers (with personalized recommendations if logged in)
 * @query   pickupLat, pickupLng, dropoffLat, dropoffLng
 * @access  Public (enhanced if authenticated)
 */
router.get('/estimates/compare', optionalAuth, getPriceEstimates);

export default router;
