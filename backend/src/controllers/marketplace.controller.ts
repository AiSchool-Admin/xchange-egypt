/**
 * Xchange Marketplace API Controller
 * ===================================
 *
 * API endpoints for the request-quote marketplace system
 */

import { Request, Response } from 'express';
import {
  marketplaceEngine,
  CreateRequestInput,
  SubmitQuoteInput,
  RequestFilters,
} from '../lib/marketplace/marketplace-engine';
import { ServiceType, VehicleType } from '../lib/marketplace/types';

// =====================================================
// REQUEST ENDPOINTS
// =====================================================

/**
 * POST /api/v1/marketplace/requests
 * Create a new service request
 */
export const createRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data: CreateRequestInput = req.body;

    // Validate required fields
    if (!data.serviceType || !data.pickup || !data.dropoff) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: serviceType, pickup, dropoff',
      });
    }

    // Validate service-specific details
    if (data.serviceType === 'SHIPPING' && !data.shippingDetails) {
      return res.status(400).json({
        success: false,
        message: 'Shipping details required for shipping requests',
      });
    }

    if (data.serviceType === 'INTERCITY_RIDE' && !data.rideDetails) {
      return res.status(400).json({
        success: false,
        message: 'Ride details required for ride requests',
      });
    }

    const request = await marketplaceEngine.createRequest(userId, data);

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      data: request,
    });
  } catch (error: any) {
    console.error('Create request error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * GET /api/v1/marketplace/requests
 * Get user's requests
 */
export const getUserRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { status, serviceType, page = 1, limit = 20 } = req.query;

    // TODO: Fetch from database with filters
    const requests: any[] = [];

    return res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Get user requests error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * GET /api/v1/marketplace/requests/:id
 * Get request details with quotes
 */
export const getRequestDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    // TODO: Fetch request with quotes from database

    return res.json({
      success: true,
      data: null,
    });
  } catch (error: any) {
    console.error('Get request details error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/marketplace/requests/:id/cancel
 * Cancel a request
 */
export const cancelRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const request = await marketplaceEngine.cancelRequest(userId, id, reason);

    return res.json({
      success: true,
      message: 'تم إلغاء الطلب',
      data: request,
    });
  } catch (error: any) {
    console.error('Cancel request error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/marketplace/estimate
 * Get price estimation before creating request
 */
export const getEstimate = async (req: Request, res: Response) => {
  try {
    const data: CreateRequestInput = req.body;

    if (!data.serviceType || !data.pickup || !data.dropoff) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const estimate = await marketplaceEngine.estimatePrice(data);

    return res.json({
      success: true,
      data: estimate,
    });
  } catch (error: any) {
    console.error('Get estimate error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// =====================================================
// PROVIDER ENDPOINTS
// =====================================================

/**
 * GET /api/v1/marketplace/provider/requests
 * Get open requests for provider's coverage area
 */
export const getOpenRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // TODO: Get provider ID from user
    const providerId = userId;

    const filters: RequestFilters = {
      serviceType: req.query.serviceType as ServiceType,
      governorate: req.query.governorate as string,
      city: req.query.city as string,
      minBudget: req.query.minBudget ? Number(req.query.minBudget) : undefined,
      maxBudget: req.query.maxBudget ? Number(req.query.maxBudget) : undefined,
    };

    const requests = await marketplaceEngine.findOpenRequests(providerId, filters);

    return res.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    console.error('Get open requests error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/marketplace/requests/:id/quote
 * Submit a quote for a request
 */
export const submitQuote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id: requestId } = req.params;
    // TODO: Get provider ID from user
    const providerId = userId;

    const data: SubmitQuoteInput = req.body;

    if (!data.price || !data.vehicleType || !data.estimatedArrival) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: price, vehicleType, estimatedArrival',
      });
    }

    const quote = await marketplaceEngine.submitQuote(providerId, requestId, data);

    return res.status(201).json({
      success: true,
      message: 'تم تقديم العرض بنجاح',
      data: quote,
    });
  } catch (error: any) {
    console.error('Submit quote error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * GET /api/v1/marketplace/provider/quotes
 * Get provider's submitted quotes
 */
export const getProviderQuotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { status, page = 1, limit = 20 } = req.query;

    // TODO: Fetch provider's quotes from database

    return res.json({
      success: true,
      data: {
        quotes: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Get provider quotes error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// =====================================================
// QUOTE ACTIONS
// =====================================================

/**
 * POST /api/v1/marketplace/quotes/:id/accept
 * Accept a quote (customer)
 */
export const acceptQuote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id: quoteId } = req.params;

    const result = await marketplaceEngine.acceptQuote(userId, quoteId);

    return res.json({
      success: true,
      message: 'تم قبول العرض',
      data: result,
    });
  } catch (error: any) {
    console.error('Accept quote error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/marketplace/quotes/:id/reject
 * Reject a quote (customer)
 */
export const rejectQuote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id: quoteId } = req.params;
    const { reason } = req.body;

    const quote = await marketplaceEngine.rejectQuote(userId, quoteId, reason);

    return res.json({
      success: true,
      message: 'تم رفض العرض',
      data: quote,
    });
  } catch (error: any) {
    console.error('Reject quote error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// =====================================================
// PROVIDER REGISTRATION
// =====================================================

/**
 * POST /api/v1/marketplace/provider/register
 * Register as a service provider
 */
export const registerProvider = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      type,           // INDIVIDUAL, SMALL_BUSINESS, COMPANY
      name,
      nameAr,
      phone,
      email,
      companyName,
      commercialRegister,
      taxNumber,
      coverageAreas,  // Array of governorates
      serviceTypes,   // Array: SHIPPING, INTERCITY_RIDE
    } = req.body;

    if (!type || !name || !phone || !coverageAreas || !serviceTypes) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // TODO: Create provider in database
    // TODO: Send verification notification

    return res.status(201).json({
      success: true,
      message: 'تم تسجيل مزود الخدمة بنجاح. سيتم مراجعة طلبك.',
      data: {
        id: 'provider_' + Date.now(),
        type,
        name,
        isVerified: false,
        isActive: true,
      },
    });
  } catch (error: any) {
    console.error('Register provider error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/marketplace/provider/vehicles
 * Add a vehicle
 */
export const addVehicle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { type, make, model, year, plateNumber, color, capacity, photos } = req.body;

    if (!type || !make || !model || !plateNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // TODO: Create vehicle in database

    return res.status(201).json({
      success: true,
      message: 'تم إضافة المركبة بنجاح',
      data: {
        id: 'vehicle_' + Date.now(),
        type,
        make,
        model,
        plateNumber,
        isActive: true,
      },
    });
  } catch (error: any) {
    console.error('Add vehicle error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// =====================================================
// NOTIFICATIONS
// =====================================================

/**
 * GET /api/v1/marketplace/notifications
 * Get user's notifications
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { unreadOnly, page = 1, limit = 50 } = req.query;

    // TODO: Fetch notifications from database

    return res.json({
      success: true,
      data: {
        notifications: [],
        unreadCount: 0,
      },
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * POST /api/v1/marketplace/notifications/:id/read
 * Mark notification as read
 */
export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    // TODO: Update notification in database

    return res.json({
      success: true,
      message: 'Done',
    });
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
