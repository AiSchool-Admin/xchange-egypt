/**
 * Xchange Marketplace Routes
 * ==========================
 *
 * API routes for the request-quote marketplace system
 */

import { Router } from 'express';
import {
  // Request endpoints
  createRequest,
  getUserRequests,
  getRequestDetails,
  cancelRequest,
  getEstimate,

  // Provider endpoints
  getOpenRequests,
  submitQuote,
  getProviderQuotes,

  // Quote actions
  acceptQuote,
  rejectQuote,

  // Provider registration
  registerProvider,
  addVehicle,

  // Notifications
  getNotifications,
  markNotificationRead,
} from '../controllers/marketplace.controller';

// Auth middleware placeholder (use your existing auth middleware)
const authMiddleware = (req: any, res: any, next: any) => {
  // TODO: Replace with actual auth middleware
  req.user = { id: 'user_demo' };
  next();
};

const router = Router();

// =====================================================
// PUBLIC ENDPOINTS
// =====================================================

/**
 * @route   POST /api/v1/marketplace/estimate
 * @desc    Get price estimation (no auth required)
 * @access  Public
 */
router.post('/estimate', getEstimate);

// =====================================================
// CUSTOMER ENDPOINTS
// =====================================================

/**
 * @route   POST /api/v1/marketplace/requests
 * @desc    Create a new service request
 * @access  Private
 */
router.post('/requests', authMiddleware, createRequest);

/**
 * @route   GET /api/v1/marketplace/requests
 * @desc    Get user's requests
 * @access  Private
 */
router.get('/requests', authMiddleware, getUserRequests);

/**
 * @route   GET /api/v1/marketplace/requests/:id
 * @desc    Get request details with quotes
 * @access  Private
 */
router.get('/requests/:id', authMiddleware, getRequestDetails);

/**
 * @route   POST /api/v1/marketplace/requests/:id/cancel
 * @desc    Cancel a request
 * @access  Private
 */
router.post('/requests/:id/cancel', authMiddleware, cancelRequest);

/**
 * @route   POST /api/v1/marketplace/quotes/:id/accept
 * @desc    Accept a quote
 * @access  Private
 */
router.post('/quotes/:id/accept', authMiddleware, acceptQuote);

/**
 * @route   POST /api/v1/marketplace/quotes/:id/reject
 * @desc    Reject a quote
 * @access  Private
 */
router.post('/quotes/:id/reject', authMiddleware, rejectQuote);

// =====================================================
// PROVIDER ENDPOINTS
// =====================================================

/**
 * @route   POST /api/v1/marketplace/provider/register
 * @desc    Register as a service provider
 * @access  Private
 */
router.post('/provider/register', authMiddleware, registerProvider);

/**
 * @route   POST /api/v1/marketplace/provider/vehicles
 * @desc    Add a vehicle
 * @access  Private (Provider only)
 */
router.post('/provider/vehicles', authMiddleware, addVehicle);

/**
 * @route   GET /api/v1/marketplace/provider/requests
 * @desc    Get open requests matching provider's coverage
 * @access  Private (Provider only)
 */
router.get('/provider/requests', authMiddleware, getOpenRequests);

/**
 * @route   POST /api/v1/marketplace/requests/:id/quote
 * @desc    Submit a quote for a request
 * @access  Private (Provider only)
 */
router.post('/requests/:id/quote', authMiddleware, submitQuote);

/**
 * @route   GET /api/v1/marketplace/provider/quotes
 * @desc    Get provider's submitted quotes
 * @access  Private (Provider only)
 */
router.get('/provider/quotes', authMiddleware, getProviderQuotes);

// =====================================================
// NOTIFICATION ENDPOINTS
// =====================================================

/**
 * @route   GET /api/v1/marketplace/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/notifications', authMiddleware, getNotifications);

/**
 * @route   POST /api/v1/marketplace/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.post('/notifications/:id/read', authMiddleware, markNotificationRead);

export default router;
