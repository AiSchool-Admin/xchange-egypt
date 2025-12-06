import { Router } from 'express';
import { aiListingController } from '../controllers/ai-listing.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/price-suggestion', aiListingController.getPriceSuggestion);

// Protected routes
router.use(authenticate);

// Analysis
router.post('/analyze-image', aiListingController.analyzeImage);
router.post('/analyze-text', aiListingController.analyzeText);

// Drafts
router.get('/drafts', aiListingController.getDrafts);
router.get('/drafts/:id', aiListingController.getDraft);
router.put('/drafts/:id', aiListingController.updateDraft);
router.post('/drafts/:id/publish', aiListingController.publishDraft);
router.delete('/drafts/:id', aiListingController.discardDraft);

export default router;
