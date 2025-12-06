import { Router } from 'express';
import { searchAlertsController } from '../controllers/search-alerts.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Saved Searches
router.post('/saved', searchAlertsController.createSavedSearch);
router.get('/saved', searchAlertsController.getSavedSearches);
router.get('/saved/:id', searchAlertsController.getSavedSearch);
router.put('/saved/:id', searchAlertsController.updateSavedSearch);
router.delete('/saved/:id', searchAlertsController.deleteSavedSearch);
router.get('/saved/:id/execute', searchAlertsController.executeSavedSearch);
router.get('/saved/:id/matches', searchAlertsController.getRecentMatches);

// Alerts
router.get('/alerts', searchAlertsController.getAlerts);
router.post('/alerts', searchAlertsController.createAlert);
router.post('/alerts/:id/toggle', searchAlertsController.toggleAlert);
router.delete('/alerts/:id', searchAlertsController.deleteAlert);

// Stats
router.get('/stats', searchAlertsController.getAlertStats);

export default router;
