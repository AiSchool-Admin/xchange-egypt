import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  getTransactionsSchema,
  transferSchema,
  redeemSchema,
} from '../validations/wallet.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Wallet info
router.get('/', walletController.getWallet);
router.get('/transactions', validate(getTransactionsSchema), walletController.getTransactions);

// Actions
router.post('/transfer', validate(transferSchema), walletController.transfer);
router.post('/redeem', validate(redeemSchema), walletController.redeem);
router.post('/claim-daily', walletController.claimDailyReward);

// Opportunities
router.get('/opportunities', walletController.getEarningOpportunities);
router.get('/leaderboard', walletController.getLeaderboard);

export default router;
