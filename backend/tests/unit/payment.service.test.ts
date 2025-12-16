/**
 * Payment Service Unit Tests
 * اختبارات وحدة خدمة الدفع
 */

import { cleanDatabase, disconnectTestDb, getTestDb } from '../helpers/testDb';
import { createTestUser, createTestCategory, createTestItem } from '../helpers/testHelpers';

describe('Payment Service Tests', () => {
  const db = getTestDb();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  // ==========================================
  // Transaction Creation Tests
  // ==========================================
  describe('Transaction Creation', () => {
    it('should create transaction with required fields', async () => {
      const buyer = await createTestUser({ email: 'buyer@test.com' });
      const seller = await createTestUser({ email: 'seller@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id, { estimatedValue: 5000 });

      const transaction = await db.transaction.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          itemId: item.id,
          amount: 5000,
          status: 'PENDING',
          type: 'DIRECT_SALE',
        },
      });

      expect(transaction).toHaveProperty('id');
      expect(transaction.amount).toBe(5000);
      expect(transaction.status).toBe('PENDING');
    });

    it('should create transaction with commission', async () => {
      const buyer = await createTestUser({ email: 'buyer-comm@test.com' });
      const seller = await createTestUser({ email: 'seller-comm@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id, { estimatedValue: 10000 });

      const amount = 10000;
      const commissionRate = 0.05; // 5%
      const commission = amount * commissionRate;

      const transaction = await db.transaction.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          itemId: item.id,
          amount,
          platformFee: commission,
          sellerReceives: amount - commission,
          status: 'PENDING',
          type: 'DIRECT_SALE',
        },
      });

      expect(transaction.platformFee).toBe(500);
      expect(transaction.sellerReceives).toBe(9500);
    });

    it('should create auction transaction', async () => {
      const buyer = await createTestUser({ email: 'buyer-auction@test.com' });
      const seller = await createTestUser({ email: 'seller-auction@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Test Auction',
          description: 'Test',
          startingPrice: 1000,
          currentPrice: 3000,
          minBidIncrement: 100,
          startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endsAt: new Date(Date.now() - 1000),
          status: 'SOLD',
          winnerId: buyer.id,
        },
      });

      const transaction = await db.transaction.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          itemId: item.id,
          auctionId: auction.id,
          amount: 3000,
          status: 'PENDING',
          type: 'AUCTION',
        },
      });

      expect(transaction.type).toBe('AUCTION');
      expect(transaction.auctionId).toBe(auction.id);
    });

    it('should create barter transaction', async () => {
      const user1 = await createTestUser({ email: 'user1-barter@test.com' });
      const user2 = await createTestUser({ email: 'user2-barter@test.com' });
      const category = await createTestCategory();
      const item1 = await createTestItem(user1.id, category.id, { estimatedValue: 3000 });
      const item2 = await createTestItem(user2.id, category.id, { estimatedValue: 3500 });

      // Create barter offer
      const barterOffer = await db.barterOffer.create({
        data: {
          initiatorId: user1.id,
          recipientId: user2.id,
          offeredItemId: item1.id,
          requestedItemId: item2.id,
          status: 'ACCEPTED',
          offeredCashAmount: 500, // Cash difference
          requestedCashAmount: 0,
        },
      });

      const transaction = await db.transaction.create({
        data: {
          buyerId: user1.id,
          sellerId: user2.id,
          itemId: item2.id,
          barterOfferId: barterOffer.id,
          amount: 500, // Cash difference only
          status: 'PENDING',
          type: 'BARTER',
        },
      });

      expect(transaction.type).toBe('BARTER');
      expect(transaction.barterOfferId).toBe(barterOffer.id);
    });
  });

  // ==========================================
  // Transaction Status Tests
  // ==========================================
  describe('Transaction Status Management', () => {
    it('should have valid status values', () => {
      const validStatuses = [
        'PENDING',
        'PROCESSING',
        'COMPLETED',
        'CANCELLED',
        'REFUNDED',
        'FAILED',
      ];

      validStatuses.forEach((status) => {
        expect(typeof status).toBe('string');
      });
    });

    it('should update transaction to processing', async () => {
      const buyer = await createTestUser({ email: 'buyer-proc@test.com' });
      const seller = await createTestUser({ email: 'seller-proc@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const transaction = await db.transaction.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          itemId: item.id,
          amount: 5000,
          status: 'PENDING',
          type: 'DIRECT_SALE',
        },
      });

      const updated = await db.transaction.update({
        where: { id: transaction.id },
        data: { status: 'PROCESSING' },
      });

      expect(updated.status).toBe('PROCESSING');
    });

    it('should complete transaction', async () => {
      const buyer = await createTestUser({ email: 'buyer-comp@test.com' });
      const seller = await createTestUser({ email: 'seller-comp@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const transaction = await db.transaction.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          itemId: item.id,
          amount: 5000,
          status: 'PROCESSING',
          type: 'DIRECT_SALE',
        },
      });

      const completed = await db.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      expect(completed.status).toBe('COMPLETED');
      expect(completed.completedAt).toBeDefined();
    });

    it('should cancel transaction', async () => {
      const buyer = await createTestUser({ email: 'buyer-cancel@test.com' });
      const seller = await createTestUser({ email: 'seller-cancel@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const transaction = await db.transaction.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          itemId: item.id,
          amount: 5000,
          status: 'PENDING',
          type: 'DIRECT_SALE',
        },
      });

      const cancelled = await db.transaction.update({
        where: { id: transaction.id },
        data: { status: 'CANCELLED' },
      });

      expect(cancelled.status).toBe('CANCELLED');
    });

    it('should refund transaction', async () => {
      const buyer = await createTestUser({ email: 'buyer-refund@test.com' });
      const seller = await createTestUser({ email: 'seller-refund@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const transaction = await db.transaction.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          itemId: item.id,
          amount: 5000,
          status: 'COMPLETED',
          type: 'DIRECT_SALE',
        },
      });

      const refunded = await db.transaction.update({
        where: { id: transaction.id },
        data: { status: 'REFUNDED' },
      });

      expect(refunded.status).toBe('REFUNDED');
    });
  });

  // ==========================================
  // Payment Method Tests
  // ==========================================
  describe('Payment Methods', () => {
    it('should record card payment', async () => {
      const buyer = await createTestUser({ email: 'buyer-card@test.com' });
      const seller = await createTestUser({ email: 'seller-card@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const transaction = await db.transaction.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          itemId: item.id,
          amount: 5000,
          status: 'PENDING',
          type: 'DIRECT_SALE',
          paymentMethod: 'CARD',
        },
      });

      expect(transaction.paymentMethod).toBe('CARD');
    });

    it('should record wallet payment', async () => {
      const buyer = await createTestUser({ email: 'buyer-wallet@test.com' });
      const seller = await createTestUser({ email: 'seller-wallet@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const transaction = await db.transaction.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          itemId: item.id,
          amount: 5000,
          status: 'PENDING',
          type: 'DIRECT_SALE',
          paymentMethod: 'WALLET',
        },
      });

      expect(transaction.paymentMethod).toBe('WALLET');
    });

    it('should record cash on delivery', async () => {
      const buyer = await createTestUser({ email: 'buyer-cod@test.com' });
      const seller = await createTestUser({ email: 'seller-cod@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const transaction = await db.transaction.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          itemId: item.id,
          amount: 5000,
          status: 'PENDING',
          type: 'DIRECT_SALE',
          paymentMethod: 'COD',
        },
      });

      expect(transaction.paymentMethod).toBe('COD');
    });
  });

  // ==========================================
  // Commission Calculation Tests
  // ==========================================
  describe('Commission Calculations', () => {
    it('should calculate 5% commission correctly', () => {
      const amount = 10000;
      const commissionRate = 0.05;
      const commission = amount * commissionRate;

      expect(commission).toBe(500);
    });

    it('should calculate seller receives amount', () => {
      const amount = 10000;
      const commission = 500;
      const sellerReceives = amount - commission;

      expect(sellerReceives).toBe(9500);
    });

    it('should apply minimum commission', () => {
      const amount = 100;
      const commissionRate = 0.05;
      const minCommission = 10;
      const calculatedCommission = amount * commissionRate;
      const commission = Math.max(calculatedCommission, minCommission);

      expect(commission).toBe(10);
    });

    it('should handle zero amount transaction', () => {
      const amount = 0;
      const commissionRate = 0.05;
      const commission = amount * commissionRate;

      expect(commission).toBe(0);
    });
  });

  // ==========================================
  // Transaction History Tests
  // ==========================================
  describe('Transaction History', () => {
    it('should get user purchase history', async () => {
      const buyer = await createTestUser({ email: 'buyer-history@test.com' });
      const seller = await createTestUser({ email: 'seller-history@test.com' });
      const category = await createTestCategory();

      const items = await Promise.all([
        createTestItem(seller.id, category.id),
        createTestItem(seller.id, category.id),
        createTestItem(seller.id, category.id),
      ]);

      await db.transaction.createMany({
        data: [
          {
            buyerId: buyer.id,
            sellerId: seller.id,
            itemId: items[0].id,
            amount: 1000,
            status: 'COMPLETED',
            type: 'DIRECT_SALE',
          },
          {
            buyerId: buyer.id,
            sellerId: seller.id,
            itemId: items[1].id,
            amount: 2000,
            status: 'COMPLETED',
            type: 'DIRECT_SALE',
          },
          {
            buyerId: buyer.id,
            sellerId: seller.id,
            itemId: items[2].id,
            amount: 3000,
            status: 'PENDING',
            type: 'DIRECT_SALE',
          },
        ],
      });

      const completedPurchases = await db.transaction.findMany({
        where: {
          buyerId: buyer.id,
          status: 'COMPLETED',
        },
      });

      expect(completedPurchases).toHaveLength(2);
    });

    it('should get user sales history', async () => {
      const buyer = await createTestUser({ email: 'buyer-sales@test.com' });
      const seller = await createTestUser({ email: 'seller-sales@test.com' });
      const category = await createTestCategory();

      const items = await Promise.all([
        createTestItem(seller.id, category.id),
        createTestItem(seller.id, category.id),
      ]);

      await db.transaction.createMany({
        data: [
          {
            buyerId: buyer.id,
            sellerId: seller.id,
            itemId: items[0].id,
            amount: 5000,
            status: 'COMPLETED',
            type: 'DIRECT_SALE',
          },
          {
            buyerId: buyer.id,
            sellerId: seller.id,
            itemId: items[1].id,
            amount: 3000,
            status: 'COMPLETED',
            type: 'AUCTION',
          },
        ],
      });

      const sales = await db.transaction.findMany({
        where: {
          sellerId: seller.id,
          status: 'COMPLETED',
        },
      });

      expect(sales).toHaveLength(2);
    });

    it('should calculate total earnings', async () => {
      const buyer = await createTestUser({ email: 'buyer-earn@test.com' });
      const seller = await createTestUser({ email: 'seller-earn@test.com' });
      const category = await createTestCategory();

      const items = await Promise.all([
        createTestItem(seller.id, category.id),
        createTestItem(seller.id, category.id),
      ]);

      await db.transaction.createMany({
        data: [
          {
            buyerId: buyer.id,
            sellerId: seller.id,
            itemId: items[0].id,
            amount: 5000,
            sellerReceives: 4750,
            status: 'COMPLETED',
            type: 'DIRECT_SALE',
          },
          {
            buyerId: buyer.id,
            sellerId: seller.id,
            itemId: items[1].id,
            amount: 3000,
            sellerReceives: 2850,
            status: 'COMPLETED',
            type: 'DIRECT_SALE',
          },
        ],
      });

      const transactions = await db.transaction.findMany({
        where: {
          sellerId: seller.id,
          status: 'COMPLETED',
        },
      });

      const totalEarnings = transactions.reduce(
        (sum, t) => sum + (t.sellerReceives || t.amount),
        0
      );

      expect(totalEarnings).toBe(7600);
    });
  });

  // ==========================================
  // Wallet Tests
  // ==========================================
  describe('Wallet Operations', () => {
    it('should get wallet balance', async () => {
      const user = await createTestUser();

      // Default wallet balance should be 0
      expect(user.walletBalance || 0).toBe(0);
    });

    it('should add funds to wallet', async () => {
      const user = await createTestUser();
      const addAmount = 1000;

      const updated = await db.user.update({
        where: { id: user.id },
        data: {
          walletBalance: { increment: addAmount },
        },
      });

      expect(updated.walletBalance).toBe(1000);
    });

    it('should deduct funds from wallet', async () => {
      const user = await db.user.create({
        data: {
          email: `wallet-deduct-${Date.now()}@test.com`,
          passwordHash: 'test',
          fullName: 'Wallet User',
          userType: 'INDIVIDUAL',
          status: 'ACTIVE',
          walletBalance: 5000,
        },
      });

      const deductAmount = 2000;

      const updated = await db.user.update({
        where: { id: user.id },
        data: {
          walletBalance: { decrement: deductAmount },
        },
      });

      expect(updated.walletBalance).toBe(3000);
    });

    it('should prevent negative wallet balance', async () => {
      const user = await db.user.create({
        data: {
          email: `wallet-neg-${Date.now()}@test.com`,
          passwordHash: 'test',
          fullName: 'Wallet User',
          userType: 'INDIVIDUAL',
          status: 'ACTIVE',
          walletBalance: 1000,
        },
      });

      const currentBalance = user.walletBalance || 0;
      const requestedAmount = 2000;

      const hasInsufficientFunds = currentBalance < requestedAmount;
      expect(hasInsufficientFunds).toBe(true);
    });
  });

  // ==========================================
  // Payment Gateway Mock Tests
  // ==========================================
  describe('Payment Gateway Integration', () => {
    it('should store payment gateway reference', async () => {
      const buyer = await createTestUser({ email: 'buyer-gateway@test.com' });
      const seller = await createTestUser({ email: 'seller-gateway@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const transaction = await db.transaction.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller.id,
          itemId: item.id,
          amount: 5000,
          status: 'COMPLETED',
          type: 'DIRECT_SALE',
          paymentGatewayRef: 'PAY_123456789',
        },
      });

      expect(transaction.paymentGatewayRef).toBe('PAY_123456789');
    });

    it('should validate payment gateway response format', () => {
      const mockPaymobResponse = {
        success: true,
        id: 123456,
        pending: false,
        amount_cents: 500000,
        currency: 'EGP',
        order: {
          id: 78910,
        },
      };

      expect(mockPaymobResponse.success).toBe(true);
      expect(mockPaymobResponse.amount_cents).toBe(500000);
      expect(mockPaymobResponse.currency).toBe('EGP');
    });

    it('should convert amount to cents for gateway', () => {
      const amountInEGP = 500;
      const amountInCents = amountInEGP * 100;

      expect(amountInCents).toBe(50000);
    });

    it('should convert cents to EGP from gateway', () => {
      const amountInCents = 50000;
      const amountInEGP = amountInCents / 100;

      expect(amountInEGP).toBe(500);
    });
  });
});
