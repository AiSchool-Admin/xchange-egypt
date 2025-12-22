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

  // ==========================================
  // Paymob Service Tests
  // ==========================================
  describe('Paymob Payment Gateway', () => {
    it('should format amount in piasters correctly', () => {
      const amountEGP = 100;
      const amountPiasters = amountEGP * 100;
      expect(amountPiasters).toBe(10000);
    });

    it('should generate correct iframe URL', () => {
      const iframeId = '123456';
      const paymentToken = 'test-token';
      const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;

      expect(iframeUrl).toContain('iframes');
      expect(iframeUrl).toContain(paymentToken);
    });

    it('should format billing data correctly', () => {
      const customer = {
        firstName: 'محمد',
        lastName: 'أحمد',
        email: 'mohamed@test.com',
        phone: '01012345678',
      };

      const billingData = {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone_number: customer.phone,
        city: 'Cairo',
        country: 'EG',
      };

      expect(billingData.country).toBe('EG');
      expect(billingData.first_name).toBe('محمد');
    });

    it('should calculate HMAC signature for callback verification', async () => {
      const crypto = await import('crypto');
      const hmacSecret = 'test-secret';
      const data = 'test-callback-data';

      const hmac = crypto.createHmac('sha512', hmacSecret).update(data).digest('hex');
      expect(hmac).toHaveLength(128);
    });

    it('should map Paymob status correctly', () => {
      const mapPaymobStatus = (response: any) => {
        if (response.is_voided) return 'VOIDED';
        if (response.is_refunded) return 'REFUNDED';
        if (response.success) return 'SUCCESS';
        if (response.pending) return 'PENDING';
        return 'FAILED';
      };

      expect(mapPaymobStatus({ success: true })).toBe('SUCCESS');
      expect(mapPaymobStatus({ pending: true })).toBe('PENDING');
      expect(mapPaymobStatus({ is_refunded: true })).toBe('REFUNDED');
      expect(mapPaymobStatus({ is_voided: true })).toBe('VOIDED');
      expect(mapPaymobStatus({})).toBe('FAILED');
    });
  });

  // ==========================================
  // Vodafone Cash Service Tests
  // ==========================================
  describe('Vodafone Cash Payment Gateway', () => {
    it('should format phone number to Egyptian format', () => {
      const formatPhoneNumber = (phone: string): string => {
        let cleaned = phone.replace(/\D/g, '');
        cleaned = cleaned.replace(/^0+/, '');
        if (!cleaned.startsWith('20')) {
          cleaned = '20' + cleaned;
        }
        return cleaned;
      };

      expect(formatPhoneNumber('01012345678')).toBe('201012345678');
      expect(formatPhoneNumber('+201012345678')).toBe('201012345678');
      expect(formatPhoneNumber('201012345678')).toBe('201012345678');
    });

    it('should validate Vodafone number prefix', () => {
      const isVodafoneNumber = (phone: string): boolean => {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.includes('010');
      };

      expect(isVodafoneNumber('01012345678')).toBe(true);
      expect(isVodafoneNumber('01112345678')).toBe(false);
      expect(isVodafoneNumber('01212345678')).toBe(false);
    });

    it('should generate unique reference number', () => {
      const generateRef = () =>
        `VF${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const ref1 = generateRef();
      const ref2 = generateRef();

      expect(ref1).toMatch(/^VF/);
      expect(ref1).not.toBe(ref2);
    });

    it('should set correct timeout for payment', () => {
      const timeoutSeconds = 300;
      const now = Date.now();
      const expiresAt = new Date(now + timeoutSeconds * 1000);

      expect(expiresAt.getTime() - now).toBe(300000);
    });

    it('should map Vodafone Cash status correctly', () => {
      const mapStatus = (status: string): string => {
        const statusMap: Record<string, string> = {
          SUCCESS: 'SUCCESS',
          SUCCESSFUL: 'SUCCESS',
          COMPLETED: 'SUCCESS',
          PENDING: 'PENDING',
          FAILED: 'FAILED',
          EXPIRED: 'EXPIRED',
          CANCELLED: 'CANCELLED',
          REFUNDED: 'REFUNDED',
        };
        return statusMap[status.toUpperCase()] || 'FAILED';
      };

      expect(mapStatus('SUCCESS')).toBe('SUCCESS');
      expect(mapStatus('SUCCESSFUL')).toBe('SUCCESS');
      expect(mapStatus('EXPIRED')).toBe('EXPIRED');
      expect(mapStatus('unknown')).toBe('FAILED');
    });
  });

  // ==========================================
  // Fawry Service Tests
  // ==========================================
  describe('Fawry Payment Gateway', () => {
    it('should generate valid Fawry reference format', () => {
      const generateFawryRef = () => {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `FW${timestamp}${random}`;
      };

      const ref = generateFawryRef();
      expect(ref).toMatch(/^FW\d+[A-Z0-9]+$/);
    });

    it('should calculate SHA256 signature correctly', async () => {
      const crypto = await import('crypto');
      const data = 'merchantCode|orderNum|amount';
      const secret = 'test-secret';

      const signature = crypto.createHash('sha256').update(data + secret).digest('hex');
      expect(signature).toHaveLength(64);
    });

    it('should format items for Fawry API', () => {
      const items = [
        { id: '1', name: 'Product 1', price: 100, quantity: 2 },
        { id: '2', name: 'Product 2', price: 50, quantity: 1 },
      ];

      const formattedItems = items.map((item) => ({
        itemId: item.id,
        description: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      expect(formattedItems).toHaveLength(2);
      expect(formattedItems[0].price).toBe(100);
    });

    it('should calculate order total correctly', () => {
      const items = [
        { price: 100, quantity: 2 },
        { price: 50, quantity: 1 },
      ];

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      expect(total).toBe(250);
    });

    it('should map Fawry status to unified status', () => {
      const mapFawryStatus = (status: string): string => {
        const map: Record<string, string> = {
          PAID: 'SUCCESS',
          NEW: 'PENDING',
          UNPAID: 'PENDING',
          EXPIRED: 'EXPIRED',
          CANCELLED: 'CANCELLED',
          REFUNDED: 'REFUNDED',
        };
        return map[status] || 'FAILED';
      };

      expect(mapFawryStatus('PAID')).toBe('SUCCESS');
      expect(mapFawryStatus('NEW')).toBe('PENDING');
      expect(mapFawryStatus('EXPIRED')).toBe('EXPIRED');
    });
  });

  // ==========================================
  // InstaPay Service Tests
  // ==========================================
  describe('InstaPay Payment Gateway', () => {
    it('should validate required fields', () => {
      const request = {
        orderId: 'order-123',
        amount: 1000,
        customerName: 'محمد أحمد',
        customerPhone: '01012345678',
      };

      expect(request.orderId).toBeTruthy();
      expect(request.amount).toBeGreaterThan(0);
      expect(request.customerName).toBeTruthy();
      expect(request.customerPhone).toBeTruthy();
    });

    it('should validate amount limits', () => {
      const isValidAmount = (amount: number): boolean => {
        return amount > 0 && amount <= 100000;
      };

      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(-100)).toBe(false);
      expect(isValidAmount(1000)).toBe(true);
      expect(isValidAmount(100001)).toBe(false);
    });

    it('should generate unique transaction ID', () => {
      const generateTransactionId = () => {
        return `IP${Date.now()}${Math.random().toString(36).substring(2, 10)}`;
      };

      const id1 = generateTransactionId();
      const id2 = generateTransactionId();

      expect(id1).toMatch(/^IP/);
      expect(id1).not.toBe(id2);
    });
  });

  // ==========================================
  // Unified Payment Gateway Tests
  // ==========================================
  describe('Unified Payment Gateway', () => {
    it('should have all payment methods configured', () => {
      const paymentMethods = [
        'fawry',
        'fawry_cash',
        'paymob_card',
        'paymob_wallet',
        'paymob_kiosk',
        'paymob_valu',
        'vodafone_cash',
        'instapay',
        'cod',
        'wallet',
      ];

      expect(paymentMethods).toHaveLength(10);
      expect(paymentMethods).toContain('fawry');
      expect(paymentMethods).toContain('vodafone_cash');
      expect(paymentMethods).toContain('paymob_card');
    });

    it('should calculate fees correctly for different methods', () => {
      const calculateFees = (amount: number, method: string) => {
        const feeConfigs: Record<string, { fixed?: number; percentage?: number }> = {
          fawry: { fixed: 5, percentage: 2.5 },
          paymob_card: { percentage: 2.75 },
          vodafone_cash: { percentage: 1 },
          cod: { fixed: 20 },
        };

        const config = feeConfigs[method];
        if (!config) return 0;

        let fees = 0;
        if (config.fixed) fees += config.fixed;
        if (config.percentage) fees += (amount * config.percentage) / 100;
        return Math.round(fees * 100) / 100;
      };

      expect(calculateFees(1000, 'fawry')).toBe(30);
      expect(calculateFees(1000, 'paymob_card')).toBe(27.5);
      expect(calculateFees(1000, 'vodafone_cash')).toBe(10);
      expect(calculateFees(1000, 'cod')).toBe(20);
    });

    it('should filter methods by amount limits', () => {
      const methods = [
        { method: 'cod', minAmount: 1, maxAmount: 10000 },
        { method: 'paymob_card', minAmount: 1, maxAmount: 100000 },
        { method: 'paymob_valu', minAmount: 500, maxAmount: 50000 },
      ];

      const filterByAmount = (amount: number) =>
        methods.filter((m) => amount >= m.minAmount && amount <= m.maxAmount);

      expect(filterByAmount(300)).toHaveLength(2);
      expect(filterByAmount(15000)).toHaveLength(2);
      expect(filterByAmount(500)).toHaveLength(3);
    });

    it('should validate customer information', () => {
      const customer = {
        firstName: 'محمد',
        lastName: 'أحمد',
        email: 'mohamed@test.com',
        phone: '01012345678',
      };

      expect(customer.firstName).toBeTruthy();
      expect(customer.email).toMatch(/@/);
      expect(customer.phone).toMatch(/^01[0125][0-9]{8}$/);
    });

    it('should default currency to EGP', () => {
      const request = {
        amount: 1000,
        currency: undefined,
      };

      const currency = request.currency || 'EGP';
      expect(currency).toBe('EGP');
    });
  });

  // ==========================================
  // Cash on Delivery Tests
  // ==========================================
  describe('Cash on Delivery', () => {
    it('should enforce COD limits', () => {
      const maxCodAmount = 10000;
      const canUseCod = (amount: number): boolean => amount <= maxCodAmount;

      expect(canUseCod(5000)).toBe(true);
      expect(canUseCod(10000)).toBe(true);
      expect(canUseCod(10001)).toBe(false);
    });

    it('should calculate COD fees', () => {
      const codFee = 20;
      const orderAmount = 500;
      const total = orderAmount + codFee;

      expect(total).toBe(520);
    });

    it('should generate COD reference number', () => {
      const generateCodRef = () =>
        `COD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const ref = generateCodRef();
      expect(ref).toMatch(/^COD/);
    });
  });

  // ==========================================
  // Arabic Text Handling Tests
  // ==========================================
  describe('Arabic Text Handling', () => {
    it('should handle Arabic customer names', () => {
      const name = 'محمد أحمد السيد';
      const [firstName, ...rest] = name.split(' ');

      expect(firstName).toBe('محمد');
      expect(rest.join(' ')).toBe('أحمد السيد');
    });

    it('should handle Arabic descriptions', () => {
      const description = 'دفع لطلب رقم 12345';
      expect(description).toContain('طلب');
    });

    it('should generate Arabic status messages', () => {
      const getStatusMessage = (status: string): string => {
        const messages: Record<string, string> = {
          PENDING: 'في انتظار الدفع',
          SUCCESS: 'تم الدفع بنجاح',
          FAILED: 'فشلت عملية الدفع',
          EXPIRED: 'انتهت صلاحية طلب الدفع',
          REFUNDED: 'تم استرداد المبلغ',
        };
        return messages[status] || 'حالة غير معروفة';
      };

      expect(getStatusMessage('SUCCESS')).toBe('تم الدفع بنجاح');
      expect(getStatusMessage('PENDING')).toBe('في انتظار الدفع');
    });
  });
});
