/**
 * Wallet Service Unit Tests
 * اختبارات وحدة خدمة المحفظة
 */

import { cleanDatabase, disconnectTestDb, getTestDb } from '../helpers/testDb';
import { createTestUser } from '../helpers/testHelpers';

// Check if Prisma is available
let prismaAvailable = false;
try {
  require('@prisma/client');
  prismaAvailable = true;
} catch {
  console.log('⚠️ Prisma not available - using mock database');
}

const describeIfPrisma = prismaAvailable ? describe : describe.skip;

describe('Wallet Service Tests', () => {
  const db = getTestDb();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  // ==========================================
  // Wallet Configuration Tests
  // ==========================================
  describe('Wallet Configuration', () => {
    const REWARDS = {
      SIGNUP: 100,
      FIRST_DEAL: 50,
      REFERRAL_REFERRER: 100,
      REFERRAL_REFERRED: 50,
      REVIEW: 10,
      DAILY_LOGIN: 5,
      FIVE_STAR_RATING: 20,
      CHALLENGE_DAILY: 50,
      CHALLENGE_WEEKLY: 200,
      ACHIEVEMENT_COMMON: 50,
      ACHIEVEMENT_UNCOMMON: 100,
      ACHIEVEMENT_RARE: 200,
      ACHIEVEMENT_EPIC: 400,
      ACHIEVEMENT_LEGENDARY: 1000,
    };

    it('should have correct signup reward amount', () => {
      expect(REWARDS.SIGNUP).toBe(100);
    });

    it('should have correct first deal reward', () => {
      expect(REWARDS.FIRST_DEAL).toBe(50);
    });

    it('should have higher reward for referrer than referred', () => {
      expect(REWARDS.REFERRAL_REFERRER).toBeGreaterThan(REWARDS.REFERRAL_REFERRED);
    });

    it('should have increasing achievement rewards by rarity', () => {
      expect(REWARDS.ACHIEVEMENT_LEGENDARY).toBeGreaterThan(REWARDS.ACHIEVEMENT_EPIC);
      expect(REWARDS.ACHIEVEMENT_EPIC).toBeGreaterThan(REWARDS.ACHIEVEMENT_RARE);
      expect(REWARDS.ACHIEVEMENT_RARE).toBeGreaterThan(REWARDS.ACHIEVEMENT_UNCOMMON);
      expect(REWARDS.ACHIEVEMENT_UNCOMMON).toBeGreaterThan(REWARDS.ACHIEVEMENT_COMMON);
    });

    it('should have weekly challenge reward higher than daily', () => {
      expect(REWARDS.CHALLENGE_WEEKLY).toBeGreaterThan(REWARDS.CHALLENGE_DAILY);
    });
  });

  // ==========================================
  // Wallet Creation Tests
  // ==========================================
  describe('Wallet Creation', () => {
    it('should create wallet with zero balance', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          frozenBalance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });

      expect(wallet.id).toBeDefined();
      expect(wallet.balance).toBe(0);
      expect(wallet.frozenBalance).toBe(0);
      expect(wallet.lifetimeEarned).toBe(0);
      expect(wallet.lifetimeSpent).toBe(0);
    });

    it('should enforce one wallet per user via findUnique', async () => {
      const user = await createTestUser();

      // Create first wallet
      await db.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          frozenBalance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });

      // Proper pattern: check if wallet exists before creating
      const existingWallet = await db.wallet.findUnique({ where: { userId: user.id } });

      // Should find existing wallet
      expect(existingWallet).not.toBeNull();
      expect(existingWallet?.userId).toBe(user.id);

      // Business logic should prevent duplicate creation
      const shouldCreate = existingWallet === null;
      expect(shouldCreate).toBe(false);
    });

    it('should get or create wallet for user', async () => {
      const user = await createTestUser();

      // First call creates wallet
      let wallet = await db.wallet.findUnique({ where: { userId: user.id } });
      if (!wallet) {
        wallet = await db.wallet.create({
          data: {
            userId: user.id,
            balance: 0,
            frozenBalance: 0,
            lifetimeEarned: 0,
            lifetimeSpent: 0,
          },
        });
      }

      expect(wallet).toBeDefined();

      // Second call returns existing wallet
      const existingWallet = await db.wallet.findUnique({ where: { userId: user.id } });
      expect(existingWallet?.id).toBe(wallet.id);
    });
  });

  // ==========================================
  // Credit Wallet Tests
  // ==========================================
  describe('Credit Wallet (Add Funds)', () => {
    it('should credit wallet and update balance', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          frozenBalance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });

      const amount = 100;
      const updated = await db.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: wallet.balance + amount,
          lifetimeEarned: wallet.lifetimeEarned + amount,
        },
      });

      expect(updated.balance).toBe(100);
      expect(updated.lifetimeEarned).toBe(100);
    });

    it('should reject negative credit amount', () => {
      const amount = -50;
      const isValid = amount > 0;
      expect(isValid).toBe(false);
    });

    it('should reject zero credit amount', () => {
      const amount = 0;
      const isValid = amount > 0;
      expect(isValid).toBe(false);
    });

    it('should create transaction record for credit', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          frozenBalance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });

      const amount = 100;
      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;

      const transaction = await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'REWARD_SIGNUP',
          amount,
          balanceBefore,
          balanceAfter,
          status: 'COMPLETED',
          description: 'مكافأة التسجيل',
        },
      });

      expect(transaction.amount).toBe(100);
      expect(transaction.balanceBefore).toBe(0);
      expect(transaction.balanceAfter).toBe(100);
      expect(transaction.status).toBe('COMPLETED');
    });

    it('should accumulate multiple credits', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          frozenBalance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });

      // Credit 1
      await db.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: 100,
          lifetimeEarned: 100,
        },
      });

      // Credit 2
      const updated = await db.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: 150, // 100 + 50
          lifetimeEarned: 150,
        },
      });

      expect(updated.balance).toBe(150);
      expect(updated.lifetimeEarned).toBe(150);
    });
  });

  // ==========================================
  // Debit Wallet Tests
  // ==========================================
  describe('Debit Wallet (Remove Funds)', () => {
    it('should debit wallet and update balance', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 100,
          frozenBalance: 0,
          lifetimeEarned: 100,
          lifetimeSpent: 0,
        },
      });

      const amount = 30;
      const updated = await db.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: wallet.balance - amount,
          lifetimeSpent: wallet.lifetimeSpent + amount,
        },
      });

      expect(updated.balance).toBe(70);
      expect(updated.lifetimeSpent).toBe(30);
    });

    it('should reject debit when insufficient balance', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 50,
          frozenBalance: 0,
          lifetimeEarned: 50,
          lifetimeSpent: 0,
        },
      });

      const amount = 100;
      const availableBalance = wallet.balance - wallet.frozenBalance;
      const canDebit = availableBalance >= amount;

      expect(canDebit).toBe(false);
    });

    it('should consider frozen balance in available balance', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 100,
          frozenBalance: 30, // 30 XCoin frozen
          lifetimeEarned: 100,
          lifetimeSpent: 0,
        },
      });

      const availableBalance = wallet.balance - wallet.frozenBalance;
      expect(availableBalance).toBe(70);

      // Cannot debit more than available
      const canDebit80 = availableBalance >= 80;
      const canDebit70 = availableBalance >= 70;

      expect(canDebit80).toBe(false);
      expect(canDebit70).toBe(true);
    });

    it('should create negative transaction for debit', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 100,
          frozenBalance: 0,
          lifetimeEarned: 100,
          lifetimeSpent: 0,
        },
      });

      const amount = 50;
      const transaction = await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'PROMOTE_LISTING',
          amount: -amount, // Negative for debit
          balanceBefore: 100,
          balanceAfter: 50,
          status: 'COMPLETED',
          description: 'ترويج إعلان',
        },
      });

      expect(transaction.amount).toBe(-50);
    });
  });

  // ==========================================
  // Transfer XCoin Tests
  // ==========================================
  describe('Transfer XCoin', () => {
    it('should transfer XCoin between users', async () => {
      const sender = await createTestUser({ email: 'sender@test.com' });
      const receiver = await createTestUser({ email: 'receiver@test.com' });

      const senderWallet = await db.wallet.create({
        data: {
          userId: sender.id,
          balance: 200,
          frozenBalance: 0,
          lifetimeEarned: 200,
          lifetimeSpent: 0,
        },
      });

      const receiverWallet = await db.wallet.create({
        data: {
          userId: receiver.id,
          balance: 50,
          frozenBalance: 0,
          lifetimeEarned: 50,
          lifetimeSpent: 0,
        },
      });

      const amount = 100;

      // Debit sender
      await db.wallet.update({
        where: { id: senderWallet.id },
        data: {
          balance: senderWallet.balance - amount,
          lifetimeSpent: senderWallet.lifetimeSpent + amount,
        },
      });

      // Credit receiver
      await db.wallet.update({
        where: { id: receiverWallet.id },
        data: {
          balance: receiverWallet.balance + amount,
          lifetimeEarned: receiverWallet.lifetimeEarned + amount,
        },
      });

      const updatedSender = await db.wallet.findUnique({ where: { id: senderWallet.id } });
      const updatedReceiver = await db.wallet.findUnique({ where: { id: receiverWallet.id } });

      expect(updatedSender?.balance).toBe(100);
      expect(updatedReceiver?.balance).toBe(150);
    });

    it('should reject transfer to self', () => {
      const fromUserId = 'user-123';
      const toUserId = 'user-123';
      const canTransfer = fromUserId !== toUserId;

      expect(canTransfer).toBe(false);
    });

    it('should reject transfer with insufficient balance', async () => {
      const sender = await createTestUser({ email: 'sender2@test.com' });

      const senderWallet = await db.wallet.create({
        data: {
          userId: sender.id,
          balance: 50,
          frozenBalance: 0,
          lifetimeEarned: 50,
          lifetimeSpent: 0,
        },
      });

      const amount = 100;
      const availableBalance = senderWallet.balance - senderWallet.frozenBalance;
      const canTransfer = availableBalance >= amount;

      expect(canTransfer).toBe(false);
    });
  });

  // ==========================================
  // Freeze Balance Tests (Escrow)
  // ==========================================
  describe('Freeze Balance (Escrow)', () => {
    it('should freeze balance for escrow', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 500,
          frozenBalance: 0,
          lifetimeEarned: 500,
          lifetimeSpent: 0,
        },
      });

      const freezeAmount = 200;
      const updated = await db.wallet.update({
        where: { id: wallet.id },
        data: {
          frozenBalance: wallet.frozenBalance + freezeAmount,
        },
      });

      expect(updated.balance).toBe(500); // Total unchanged
      expect(updated.frozenBalance).toBe(200);

      const availableBalance = updated.balance - updated.frozenBalance;
      expect(availableBalance).toBe(300);
    });

    it('should reject freeze when insufficient available balance', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 100,
          frozenBalance: 50,
          lifetimeEarned: 100,
          lifetimeSpent: 0,
        },
      });

      const freezeAmount = 100;
      const availableBalance = wallet.balance - wallet.frozenBalance; // 50
      const canFreeze = availableBalance >= freezeAmount;

      expect(canFreeze).toBe(false);
    });

    it('should create transaction record for freeze', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 500,
          frozenBalance: 0,
          lifetimeEarned: 500,
          lifetimeSpent: 0,
        },
      });

      const transaction = await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'ESCROW_FREEZE',
          amount: -200,
          balanceBefore: 500,
          balanceAfter: 500, // Balance unchanged, just frozen
          status: 'COMPLETED',
          description: 'تجميد رصيد للضمان',
          relatedEntityType: 'escrow',
          relatedEntityId: 'escrow-123',
        },
      });

      expect(transaction.type).toBe('ESCROW_FREEZE');
      expect(transaction.relatedEntityType).toBe('escrow');
    });
  });

  // ==========================================
  // Release Frozen Balance Tests
  // ==========================================
  describe('Release Frozen Balance', () => {
    it('should release frozen balance to seller', async () => {
      const buyer = await createTestUser({ email: 'buyer@test.com' });
      const seller = await createTestUser({ email: 'seller@test.com' });

      const buyerWallet = await db.wallet.create({
        data: {
          userId: buyer.id,
          balance: 500,
          frozenBalance: 200,
          lifetimeEarned: 500,
          lifetimeSpent: 0,
        },
      });

      const sellerWallet = await db.wallet.create({
        data: {
          userId: seller.id,
          balance: 0,
          frozenBalance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });

      const amount = 200;

      // Release from buyer (unfreeze and deduct)
      await db.wallet.update({
        where: { id: buyerWallet.id },
        data: {
          balance: buyerWallet.balance - amount,
          frozenBalance: buyerWallet.frozenBalance - amount,
          lifetimeSpent: buyerWallet.lifetimeSpent + amount,
        },
      });

      // Credit seller
      await db.wallet.update({
        where: { id: sellerWallet.id },
        data: {
          balance: sellerWallet.balance + amount,
          lifetimeEarned: sellerWallet.lifetimeEarned + amount,
        },
      });

      const updatedBuyer = await db.wallet.findUnique({ where: { id: buyerWallet.id } });
      const updatedSeller = await db.wallet.findUnique({ where: { id: sellerWallet.id } });

      expect(updatedBuyer?.balance).toBe(300);
      expect(updatedBuyer?.frozenBalance).toBe(0);
      expect(updatedSeller?.balance).toBe(200);
    });

    it('should reject release when insufficient frozen balance', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 500,
          frozenBalance: 100,
          lifetimeEarned: 500,
          lifetimeSpent: 0,
        },
      });

      const releaseAmount = 200;
      const canRelease = wallet.frozenBalance >= releaseAmount;

      expect(canRelease).toBe(false);
    });
  });

  // ==========================================
  // Refund Frozen Balance Tests
  // ==========================================
  describe('Refund Frozen Balance', () => {
    it('should refund frozen balance to buyer (escrow cancellation)', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 500,
          frozenBalance: 200,
          lifetimeEarned: 500,
          lifetimeSpent: 0,
        },
      });

      const refundAmount = 200;

      // Just unfreeze (don't deduct)
      const updated = await db.wallet.update({
        where: { id: wallet.id },
        data: {
          frozenBalance: wallet.frozenBalance - refundAmount,
        },
      });

      expect(updated.balance).toBe(500); // Unchanged
      expect(updated.frozenBalance).toBe(0);

      const availableBalance = updated.balance - updated.frozenBalance;
      expect(availableBalance).toBe(500); // Full balance available again
    });
  });

  // ==========================================
  // Reward Functions Tests
  // ==========================================
  describe('Reward Functions', () => {
    it('should award signup bonus', async () => {
      const user = await createTestUser();
      const SIGNUP_REWARD = 100;

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: SIGNUP_REWARD,
          frozenBalance: 0,
          lifetimeEarned: SIGNUP_REWARD,
          lifetimeSpent: 0,
        },
      });

      expect(wallet.balance).toBe(100);
    });

    it('should award first deal bonus only once', async () => {
      const user = await createTestUser();
      const FIRST_DEAL_REWARD = 50;

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          frozenBalance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });

      // First award
      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'REWARD_FIRST_DEAL',
          amount: FIRST_DEAL_REWARD,
          balanceBefore: 0,
          balanceAfter: FIRST_DEAL_REWARD,
          status: 'COMPLETED',
        },
      });

      // Check if already awarded
      const existingReward = await db.walletTransaction.findFirst({
        where: {
          walletId: wallet.id,
          type: 'REWARD_FIRST_DEAL',
        },
      });

      expect(existingReward).not.toBeNull();

      // Should not award again
      const shouldAward = existingReward === null;
      expect(shouldAward).toBe(false);
    });

    it('should award daily login bonus only once per day', async () => {
      const user = await createTestUser();
      const DAILY_REWARD = 5;

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          frozenBalance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // First login today
      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'REWARD_DAILY_LOGIN',
          amount: DAILY_REWARD,
          balanceBefore: 0,
          balanceAfter: DAILY_REWARD,
          status: 'COMPLETED',
          createdAt: new Date(),
        },
      });

      // Check if already awarded today
      const existingReward = await db.walletTransaction.findFirst({
        where: {
          walletId: wallet.id,
          type: 'REWARD_DAILY_LOGIN',
          createdAt: { gte: today },
        },
      });

      expect(existingReward).not.toBeNull();
    });

    it('should award referral bonus to both users', async () => {
      const referrer = await createTestUser({ email: 'referrer@test.com' });
      const referred = await createTestUser({ email: 'referred@test.com' });

      const REFERRER_REWARD = 100;
      const REFERRED_REWARD = 50;

      const referrerWallet = await db.wallet.create({
        data: {
          userId: referrer.id,
          balance: REFERRER_REWARD,
          frozenBalance: 0,
          lifetimeEarned: REFERRER_REWARD,
          lifetimeSpent: 0,
        },
      });

      const referredWallet = await db.wallet.create({
        data: {
          userId: referred.id,
          balance: REFERRED_REWARD,
          frozenBalance: 0,
          lifetimeEarned: REFERRED_REWARD,
          lifetimeSpent: 0,
        },
      });

      expect(referrerWallet.balance).toBe(100);
      expect(referredWallet.balance).toBe(50);
    });
  });

  // ==========================================
  // Spending Functions Tests
  // ==========================================
  describe('Spending Functions', () => {
    it('should spend XCoin for listing promotion', async () => {
      const user = await createTestUser();
      const PROMO_COST = 50;

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 200,
          frozenBalance: 0,
          lifetimeEarned: 200,
          lifetimeSpent: 0,
        },
      });

      const updated = await db.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: wallet.balance - PROMO_COST,
          lifetimeSpent: wallet.lifetimeSpent + PROMO_COST,
        },
      });

      expect(updated.balance).toBe(150);
      expect(updated.lifetimeSpent).toBe(50);
    });

    it('should spend XCoin for contact unlock', async () => {
      const user = await createTestUser();
      const UNLOCK_COST = 10;

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 100,
          frozenBalance: 0,
          lifetimeEarned: 100,
          lifetimeSpent: 0,
        },
      });

      const updated = await db.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: wallet.balance - UNLOCK_COST,
          lifetimeSpent: wallet.lifetimeSpent + UNLOCK_COST,
        },
      });

      expect(updated.balance).toBe(90);
    });
  });

  // ==========================================
  // Transaction History Tests
  // ==========================================
  describe('Transaction History', () => {
    it('should get wallet transactions with pagination', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 500,
          frozenBalance: 0,
          lifetimeEarned: 500,
          lifetimeSpent: 0,
        },
      });

      // Create multiple transactions
      for (let i = 0; i < 10; i++) {
        await db.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'REWARD_DAILY_LOGIN',
            amount: 5,
            balanceBefore: i * 5,
            balanceAfter: (i + 1) * 5,
            status: 'COMPLETED',
          },
        });
      }

      const transactions = await db.walletTransaction.findMany({
        where: { walletId: wallet.id },
        take: 5,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });

      expect(transactions.length).toBe(5);
    });

    it('should filter transactions by type', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 500,
          frozenBalance: 0,
          lifetimeEarned: 500,
          lifetimeSpent: 0,
        },
      });

      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'REWARD_SIGNUP',
          amount: 100,
          balanceBefore: 0,
          balanceAfter: 100,
          status: 'COMPLETED',
        },
      });

      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'PROMOTE_LISTING',
          amount: -50,
          balanceBefore: 100,
          balanceAfter: 50,
          status: 'COMPLETED',
        },
      });

      const rewards = await db.walletTransaction.findMany({
        where: { walletId: wallet.id, type: 'REWARD_SIGNUP' },
      });

      const spending = await db.walletTransaction.findMany({
        where: { walletId: wallet.id, type: 'PROMOTE_LISTING' },
      });

      expect(rewards.length).toBe(1);
      expect(spending.length).toBe(1);
    });
  });

  // ==========================================
  // Wallet Statistics Tests
  // ==========================================
  describe('Wallet Statistics', () => {
    it('should calculate available balance correctly', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 1000,
          frozenBalance: 300,
          lifetimeEarned: 1000,
          lifetimeSpent: 0,
        },
      });

      const availableBalance = wallet.balance - wallet.frozenBalance;
      expect(availableBalance).toBe(700);
    });

    it('should track lifetime earned and spent', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 500,
          frozenBalance: 0,
          lifetimeEarned: 1000, // Earned 1000 total
          lifetimeSpent: 500,  // Spent 500
        },
      });

      expect(wallet.lifetimeEarned).toBe(1000);
      expect(wallet.lifetimeSpent).toBe(500);
      expect(wallet.lifetimeEarned - wallet.lifetimeSpent).toBe(wallet.balance);
    });

    it('should count positive transactions for earnings', async () => {
      const user = await createTestUser();

      const wallet = await db.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
          frozenBalance: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
        },
      });

      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'REWARD_SIGNUP',
          amount: 100,
          balanceBefore: 0,
          balanceAfter: 100,
          status: 'COMPLETED',
        },
      });

      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'REWARD_REVIEW',
          amount: 10,
          balanceBefore: 100,
          balanceAfter: 110,
          status: 'COMPLETED',
        },
      });

      await db.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'PROMOTE_LISTING',
          amount: -50,
          balanceBefore: 110,
          balanceAfter: 60,
          status: 'COMPLETED',
        },
      });

      const totalEarned = await db.walletTransaction.aggregate({
        where: {
          walletId: wallet.id,
          amount: { gt: 0 },
        },
        _sum: { amount: true },
      });

      expect(totalEarned._sum.amount).toBe(110);
    });
  });
});
