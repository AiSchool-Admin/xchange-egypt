/**
 * Mobile Marketplace Routes
 * مسارات سوق الموبايلات
 */

import { Router } from 'express';
import * as mobileController from '../controllers/mobile.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// ============================================
// Public Routes (لا تحتاج تسجيل دخول)
// ============================================

// Price References - أسعار مرجعية
router.get('/prices', mobileController.getPriceReferences);
router.get('/prices/:brand', mobileController.getPricesByBrand);
router.get('/prices/:brand/:model', mobileController.getPricesByModel);

// Price Calculator - حاسبة السعر
router.post('/calculate-price', mobileController.calculatePrice);

// Listings - إعلانات الموبايلات (قراءة فقط)
router.get('/listings', mobileController.getListings);
router.get('/listings/featured', mobileController.getFeaturedListings);
router.get('/listings/recent', mobileController.getRecentListings);
router.get('/listings/:id', mobileController.getListingById);

// Statistics - الإحصائيات
router.get('/statistics', mobileController.getStatistics);
router.get('/popular-brands', mobileController.getPopularBrands);
router.get('/popular-models', mobileController.getPopularModels);

// Brands & Models - العلامات والموديلات
router.get('/brands', mobileController.getBrands);
router.get('/brands/:brand/models', mobileController.getModelsByBrand);

// ============================================
// IMEI Verification - التحقق من IMEI
// ============================================

// Public IMEI check (basic - for preview)
router.post('/verify/imei/check', mobileController.checkIMEI);

// Full IMEI verification (requires auth)
router.post('/verify/imei', authenticate, mobileController.verifyIMEI);
router.get('/verify/imei/:imei/certificate', authenticate, mobileController.getIMEICertificate);
router.get('/verify/imei/:imei/status', mobileController.getIMEIStatus);

// ============================================
// Protected Routes (تحتاج تسجيل دخول)
// ============================================

// Listings Management - إدارة الإعلانات
router.post('/listings', authenticate, mobileController.createListing);
router.put('/listings/:id', authenticate, mobileController.updateListing);
router.delete('/listings/:id', authenticate, mobileController.deleteListing);
router.get('/my-listings', authenticate, mobileController.getMyListings);
router.post('/listings/:id/verify-image', authenticate, mobileController.uploadVerificationImage);
router.post('/listings/:id/publish', authenticate, mobileController.publishListing);
router.post('/listings/:id/mark-sold', authenticate, mobileController.markAsSold);

// Favorites - المفضلة
router.get('/favorites', authenticate, mobileController.getMyFavorites);
router.post('/favorites/:listingId', authenticate, mobileController.addToFavorites);
router.delete('/favorites/:listingId', authenticate, mobileController.removeFromFavorites);

// Price Alerts - تنبيهات الأسعار
router.get('/alerts', authenticate, mobileController.getMyPriceAlerts);
router.post('/alerts', authenticate, mobileController.createPriceAlert);
router.put('/alerts/:id', authenticate, mobileController.updatePriceAlert);
router.delete('/alerts/:id', authenticate, mobileController.deletePriceAlert);

// ============================================
// Transactions - المعاملات
// ============================================

router.post('/transactions', authenticate, mobileController.createTransaction);
router.get('/transactions', authenticate, mobileController.getMyTransactions);
router.get('/transactions/:id', authenticate, mobileController.getTransactionById);
router.put('/transactions/:id/status', authenticate, mobileController.updateTransactionStatus);
router.post('/transactions/:id/confirm-delivery', authenticate, mobileController.confirmDelivery);
router.post('/transactions/:id/release-escrow', authenticate, mobileController.releaseEscrow);

// ============================================
// Barter System - نظام المقايضة
// ============================================

// Direct Barter Proposals - عروض المقايضة المباشرة
router.post('/barter/propose', authenticate, mobileController.createBarterProposal);
router.get('/barter/proposals', authenticate, mobileController.getMyBarterProposals);
router.get('/barter/proposals/received', authenticate, mobileController.getReceivedBarterProposals);
router.put('/barter/proposals/:id/respond', authenticate, mobileController.respondToBarterProposal);
router.delete('/barter/proposals/:id', authenticate, mobileController.withdrawBarterProposal);

// Barter Matches - مطابقات المقايضة الذكية
router.get('/barter/matches', authenticate, mobileController.getBarterMatches);
router.get('/barter/matches/:id', authenticate, mobileController.getBarterMatchById);
router.post('/barter/matches/:id/accept', authenticate, mobileController.acceptBarterMatch);
router.post('/barter/matches/:id/reject', authenticate, mobileController.rejectBarterMatch);

// Barter Suggestions - اقتراحات المقايضة الذكية
router.get('/barter/suggestions', authenticate, mobileController.getBarterSuggestions);
router.get('/barter/suggestions/:listingId', authenticate, mobileController.getBarterSuggestionsForListing);

// ============================================
// Disputes - النزاعات
// ============================================

router.post('/disputes', authenticate, mobileController.createDispute);
router.get('/disputes', authenticate, mobileController.getMyDisputes);
router.get('/disputes/:id', authenticate, mobileController.getDisputeById);
router.post('/disputes/:id/respond', authenticate, mobileController.respondToDispute);
router.post('/disputes/:id/evidence', authenticate, mobileController.addDisputeEvidence);

// ============================================
// Reviews - التقييمات
// ============================================

router.post('/reviews', authenticate, mobileController.createReview);
router.get('/reviews/user/:userId', mobileController.getUserReviews);
router.get('/reviews/listing/:listingId', mobileController.getListingSellerReviews);
router.post('/reviews/:id/respond', authenticate, mobileController.respondToReview);

// ============================================
// Admin Routes - مسارات الإدارة
// ============================================

router.post('/prices', authenticate, mobileController.updatePriceReferences);
router.put('/listings/:id/status', authenticate, mobileController.adminUpdateListingStatus);
router.put('/disputes/:id/resolve', authenticate, mobileController.resolveDispute);

export default router;
