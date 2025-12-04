import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Wallet info
router.get('/', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);

// Actions
router.post('/transfer', walletController.transfer);
router.post('/redeem', walletController.redeem);
router.post('/claim-daily', walletController.claimDailyReward);

// Opportunities
router.get('/opportunities', walletController.getEarningOpportunities);
router.get('/leaderboard', walletController.getLeaderboard);

export default router;
