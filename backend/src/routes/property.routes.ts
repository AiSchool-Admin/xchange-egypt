import { Router } from 'express';
import * as propertyController from '../controllers/property.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// ============================================
// Property Listings
// ============================================

// Search properties (public)
router.get('/', optionalAuth, propertyController.searchProperties);

// Estimate property value (public)
router.post('/estimate-value', propertyController.estimateValue);

// Get user's properties
router.get('/my-properties', authenticate, propertyController.getUserProperties);

// Get favorites
router.get('/favorites', authenticate, propertyController.getFavorites);

// Get property by ID (public with optional auth for favorites check)
router.get('/:id', optionalAuth, propertyController.getProperty);

// Create property
router.post('/', authenticate, propertyController.createProperty);

// Update property
router.put('/:id', authenticate, propertyController.updateProperty);

// Delete property
router.delete('/:id', authenticate, propertyController.deleteProperty);

// ============================================
// Property Status
// ============================================

// Submit for verification
router.post('/:id/submit-verification', authenticate, propertyController.submitForVerification);

// Activate property (admin)
router.post('/:id/activate', authenticate, propertyController.activateProperty);

// Reject property (admin)
router.post('/:id/reject', authenticate, propertyController.rejectProperty);

// Mark as sold
router.post('/:id/mark-sold', authenticate, propertyController.markAsSold);

// Mark as rented
router.post('/:id/mark-rented', authenticate, propertyController.markAsRented);

// ============================================
// Favorites
// ============================================

// Add to favorites
router.post('/:id/favorite', authenticate, propertyController.addToFavorites);

// Remove from favorites
router.delete('/:id/favorite', authenticate, propertyController.removeFromFavorites);

// ============================================
// Property Barter
// ============================================

// Get barter suggestions for a property
router.get('/:id/barter-suggestions', authenticate, propertyController.getBarterSuggestions);

// Create barter proposal
router.post('/barter/propose', authenticate, propertyController.createBarterProposal);

// Get user's barter proposals
router.get('/barter/proposals', authenticate, propertyController.getUserBarterProposals);

// Get barter proposal by ID
router.get('/barter/:id', authenticate, propertyController.getBarterProposal);

// Respond to barter proposal
router.post('/barter/:id/respond', authenticate, propertyController.respondToBarterProposal);

// Cancel barter proposal
router.delete('/barter/:id', authenticate, propertyController.cancelBarterProposal);

// ============================================
// Rental Management
// ============================================

// Get user's rental contracts
router.get('/rentals/contracts', authenticate, propertyController.getUserRentalContracts);

// Create rental contract
router.post('/rentals/contracts', authenticate, propertyController.createRentalContract);

// Get rental contract by ID
router.get('/rentals/contracts/:id', authenticate, propertyController.getRentalContract);

// Activate rental contract
router.post('/rentals/contracts/:id/activate', authenticate, propertyController.activateRentalContract);

// Terminate rental contract
router.post('/rentals/contracts/:id/terminate', authenticate, propertyController.terminateRentalContract);

// ============================================
// Deposit Protection
// ============================================

// Protect deposit
router.post('/rentals/contracts/:id/protect-deposit', authenticate, propertyController.protectDeposit);

// Request deposit return
router.post('/rentals/contracts/:id/request-deposit-return', authenticate, propertyController.requestDepositReturn);

// Release deposit
router.post('/rentals/contracts/:id/release-deposit', authenticate, propertyController.releaseDeposit);

// Dispute deposit
router.post('/rentals/contracts/:id/dispute-deposit', authenticate, propertyController.disputeDeposit);

// ============================================
// Rental Payments
// ============================================

// Record payment
router.post('/rentals/payments/:id/record', authenticate, propertyController.recordRentalPayment);

// ============================================
// Field Inspection
// ============================================

// Get user's inspections
router.get('/inspections', authenticate, propertyController.getUserInspections);

// Request inspection
router.post('/inspections', authenticate, propertyController.requestInspection);

// Get inspection by ID
router.get('/inspections/:id', authenticate, propertyController.getInspection);

// Pay for inspection
router.post('/inspections/:id/pay', authenticate, propertyController.payForInspection);

// ============================================
// Inspector Routes
// ============================================

// Register as inspector
router.post('/inspectors/register', authenticate, propertyController.registerAsInspector);

// Get inspector's inspections
router.get('/inspectors/inspections', authenticate, propertyController.getInspectorInspections);

// Schedule inspection (inspector)
router.post('/inspections/:id/schedule', authenticate, propertyController.scheduleInspection);

// Start inspection (inspector)
router.post('/inspections/:id/start', authenticate, propertyController.startInspection);

// Complete inspection (inspector)
router.post('/inspections/:id/complete', authenticate, propertyController.completeInspection);

export default router;
