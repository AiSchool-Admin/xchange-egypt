/**
 * Tender Advanced Routes - مسارات المناقصات المتقدمة
 *
 * Routes for:
 * - Service Requests (C2C/C2B)
 * - Contracts Management
 * - Bid Evaluation
 * - Vendor Management
 * - Dashboard & Analytics
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as tenderAdvancedService from '../services/tender-advanced.service';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// ============================================
// SERVICE REQUESTS (C2C/C2B)
// ============================================

/**
 * POST /service-requests
 * Create a new service request
 */
router.post(
  '/service-requests',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const result = await tenderAdvancedService.createServiceRequest(userId, req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: 'تم نشر طلبك بنجاح',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /service-requests
 * Browse service requests (for providers)
 */
router.get(
  '/service-requests',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        category: req.query.category ? (String(req.query.category) as tenderAdvancedService.TenderCategory) : undefined,
        governorate: req.query.governorate ? String(req.query.governorate) : undefined,
        city: req.query.city ? String(req.query.city) : undefined,
        urgency: req.query.urgency ? (req.query.urgency as tenderAdvancedService.TenderUrgency) : undefined,
        minBudget: req.query.budgetMin ? parseFloat(req.query.budgetMin as string) : undefined,
        maxBudget: req.query.budgetMax ? parseFloat(req.query.budgetMax as string) : undefined,
        status: req.query.status ? (req.query.status as tenderAdvancedService.TenderRequestStatus) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };
      const result = await tenderAdvancedService.getServiceRequests(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /service-requests/:id
 * Get service request details
 */
router.get(
  '/service-requests/:id',
  optionalAuth,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const result = await tenderAdvancedService.getServiceRequestById(req.params.id, userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /service-requests/:id/quotes
 * Submit a quote for a service request
 */
router.post(
  '/service-requests/:id/quotes',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const providerId = req.user?.id;
      if (!providerId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const result = await tenderAdvancedService.submitQuote(providerId, {
        serviceRequestId: req.params.id,
        ...req.body,
      });
      res.status(201).json({
        success: true,
        data: result,
        message: 'تم تقديم عرض السعر بنجاح',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /service-requests/:id/quotes
 * Get quotes for a service request (owner only)
 */
router.get(
  '/service-requests/:id/quotes',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const requesterId = req.user?.id;
      if (!requesterId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const result = await tenderAdvancedService.getQuotesForRequest(req.params.id, requesterId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /service-requests/:id/quotes/:quoteId/accept
 * Accept a quote
 */
router.post(
  '/service-requests/:id/quotes/:quoteId/accept',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const requesterId = req.user?.id;
      if (!requesterId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const result = await tenderAdvancedService.acceptQuote(
        req.params.id,
        req.params.quoteId,
        requesterId
      );
      res.json({
        success: true,
        data: result,
        message: 'تم قبول العرض بنجاح',
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// BID EVALUATION
// ============================================

/**
 * POST /tenders/:id/bids/:bidId/evaluate
 * Evaluate a bid with criteria scoring
 */
router.post(
  '/tenders/:id/bids/:bidId/evaluate',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const evaluatorId = req.user?.id;
      if (!evaluatorId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const result = await tenderAdvancedService.evaluateBid(
        req.params.id,
        req.params.bidId,
        evaluatorId,
        req.body
      );
      res.json({
        success: true,
        data: result,
        message: 'تم تقييم العرض بنجاح',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /tenders/:id/evaluations
 * Get all evaluations for a tender
 */
router.get(
  '/tenders/:id/evaluations',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const evaluatorId = req.user?.id;
      if (!evaluatorId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const result = await tenderAdvancedService.getTenderEvaluations(req.params.id, evaluatorId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// CONTRACT MANAGEMENT
// ============================================

/**
 * GET /contracts
 * Get user's contracts
 */
router.get(
  '/contracts',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const filters = {
        role: req.query.role as 'buyer' | 'vendor',
        status: req.query.status ? (req.query.status as tenderAdvancedService.TenderContractStatus) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };
      const result = await tenderAdvancedService.getContracts(userId, filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /contracts/:id
 * Get contract details
 */
router.get(
  '/contracts/:id',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const result = await tenderAdvancedService.getContractById(req.params.id, userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /contracts/:id/sign
 * Sign a contract
 */
router.post(
  '/contracts/:id/sign',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const result = await tenderAdvancedService.signContract(req.params.id, userId);
      res.json({
        success: true,
        data: result,
        message: 'تم توقيع العقد بنجاح',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /contracts/:id/milestones/:milestoneId/complete
 * Mark milestone as complete (vendor)
 */
router.post(
  '/contracts/:id/milestones/:milestoneId/complete',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const result = await tenderAdvancedService.completeMilestone(
        req.params.id,
        req.params.milestoneId,
        vendorId,
        req.body
      );
      res.json({
        success: true,
        data: result,
        message: 'تم تحديث المرحلة بنجاح',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /contracts/:id/milestones/:milestoneId/approve
 * Approve milestone (buyer)
 */
router.post(
  '/contracts/:id/milestones/:milestoneId/approve',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const buyerId = req.user?.id;
      if (!buyerId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const result = await tenderAdvancedService.approveMilestone(
        req.params.id,
        req.params.milestoneId,
        buyerId
      );
      res.json({
        success: true,
        data: result,
        message: 'تم اعتماد المرحلة بنجاح',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /contracts/:id/milestones/:milestoneId/reject
 * Reject milestone (buyer)
 */
router.post(
  '/contracts/:id/milestones/:milestoneId/reject',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const buyerId = req.user?.id;
      if (!buyerId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const { reason } = req.body;
      const result = await tenderAdvancedService.rejectMilestone(
        req.params.id,
        req.params.milestoneId,
        buyerId,
        reason
      );
      res.json({
        success: true,
        data: result,
        message: 'تم رفض المرحلة',
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// VENDOR MANAGEMENT
// ============================================

/**
 * GET /vendors
 * Browse vendors
 */
router.get(
  '/vendors',
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        category: req.query.category ? (String(req.query.category) as tenderAdvancedService.ServiceCategory) : undefined,
        governorate: req.query.governorate ? String(req.query.governorate) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        verified: req.query.verified === 'true',
        search: req.query.search ? String(req.query.search) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };
      const result = await tenderAdvancedService.browseVendors(filters);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /vendors/:id
 * Get vendor profile
 */
router.get(
  '/vendors/:id',
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await tenderAdvancedService.getVendorProfile(req.params.id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

/**
 * GET /dashboard
 * Get user tender dashboard
 */
router.get(
  '/dashboard',
  authenticate,
  async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const result = await tenderAdvancedService.getUserDashboard(userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /statistics
 * Get platform tender statistics
 */
router.get(
  '/statistics',
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await tenderAdvancedService.getPlatformStatistics();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
