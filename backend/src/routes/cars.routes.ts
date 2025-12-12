/**
 * Cars Marketplace Routes
 * مسارات سوق السيارات
 */

import { Router } from 'express';
import * as carsController from '../controllers/cars.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// ============================================
// Public Routes (لا تحتاج تسجيل دخول)
// ============================================

// Car Prices - أسعار السيارات المرجعية
router.get('/prices', carsController.getPriceReference);
router.get('/prices/:make', carsController.getPricesByMake);

// Price Calculator - حاسبة السعر
router.post('/calculate', carsController.calculatePrice);

// Car Listings - إعلانات السيارات (قراءة فقط)
router.get('/listings', carsController.getListings);
router.get('/listings/:id', carsController.getListingById);

// Car Partners - مراكز الفحص
router.get('/partners', carsController.getPartners);
router.get('/partners/:id', carsController.getPartnerById);

// Statistics - الإحصائيات
router.get('/statistics', carsController.getStatistics);
router.get('/popular', carsController.getPopularCars);

// ============================================
// Protected Routes (تحتاج تسجيل دخول)
// ============================================

// Car Listings - إدارة إعلانات السيارات
router.post('/listings', authenticate, carsController.createListing);
router.put('/listings/:id', authenticate, carsController.updateListing);
router.delete('/listings/:id', authenticate, carsController.deleteListing);
router.get('/my-listings', authenticate, carsController.getMyListings);

// Car Transactions - المعاملات
router.post('/transactions', authenticate, carsController.createTransaction);
router.put('/transactions/:id/status', authenticate, carsController.updateTransactionStatus);
router.get('/transactions', authenticate, carsController.getMyTransactions);

// Car Inspections - الفحوصات
router.post('/inspections', authenticate, carsController.requestInspection);
router.put('/inspections/:id', authenticate, carsController.updateInspection);

// Barter Proposals - عروض المقايضة
router.post('/barter', authenticate, carsController.createBarterProposal);
router.put('/barter/:id/respond', authenticate, carsController.respondToBarterProposal);
router.get('/barter', authenticate, carsController.getMyBarterProposals);

// Admin Routes - مسارات الإدارة
router.post('/prices', authenticate, carsController.updatePrices);

export default router;
