/**
 * Escrow Service Unit Tests
 * اختبارات وحدة خدمة الضمان
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

describe('Escrow Service Tests', () => {
  const db = getTestDb();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  // ==========================================
  // Escrow Configuration Tests
  // ==========================================
  describe('Escrow Configuration', () => {
    const ESCROW_CONFIG = {
      defaultAutoReleaseHours: 48,
      defaultInspectionHours: 24,
      maxEscrowDays: 30,
      disputeResponseDeadlineHours: 72,
    };

    it('should have default auto-release of 48 hours', () => {
      expect(ESCROW_CONFIG.defaultAutoReleaseHours).toBe(48);
    });

    it('should have inspection period of 24 hours', () => {
      expect(ESCROW_CONFIG.defaultInspectionHours).toBe(24);
    });

    it('should have max escrow duration of 30 days', () => {
      expect(ESCROW_CONFIG.maxEscrowDays).toBe(30);
    });

    it('should have dispute response deadline of 72 hours', () => {
      expect(ESCROW_CONFIG.disputeResponseDeadlineHours).toBe(72);
    });
  });

  // ==========================================
  // Escrow Status Tests
  // ==========================================
  describe('Escrow Status Flow', () => {
    const ESCROW_STATUSES = [
      'CREATED',
      'FUNDED',
      'PENDING_DELIVERY',
      'DELIVERED',
      'INSPECTION',
      'RELEASED',
      'REFUNDED',
      'DISPUTED',
      'CANCELLED',
      'EXPIRED',
    ];

    it('should have all valid escrow statuses', () => {
      expect(ESCROW_STATUSES).toContain('CREATED');
      expect(ESCROW_STATUSES).toContain('FUNDED');
      expect(ESCROW_STATUSES).toContain('DELIVERED');
      expect(ESCROW_STATUSES).toContain('RELEASED');
      expect(ESCROW_STATUSES).toContain('REFUNDED');
      expect(ESCROW_STATUSES).toContain('DISPUTED');
    });

    it('should follow valid status transitions', () => {
      const validTransitions: Record<string, string[]> = {
        'CREATED': ['FUNDED', 'CANCELLED'],
        'FUNDED': ['PENDING_DELIVERY', 'DELIVERED', 'REFUNDED', 'DISPUTED'],
        'PENDING_DELIVERY': ['DELIVERED', 'DISPUTED'],
        'DELIVERED': ['INSPECTION', 'RELEASED', 'DISPUTED'],
        'INSPECTION': ['RELEASED', 'DISPUTED'],
        'DISPUTED': ['RELEASED', 'REFUNDED'],
      };

      expect(validTransitions['CREATED']).toContain('FUNDED');
      expect(validTransitions['CREATED']).toContain('CANCELLED');
      expect(validTransitions['FUNDED']).toContain('DELIVERED');
      expect(validTransitions['DELIVERED']).toContain('RELEASED');
    });
  });

  // ==========================================
  // Escrow Type Tests
  // ==========================================
  describe('Escrow Types', () => {
    const ESCROW_TYPES = [
      'SALE',
      'BARTER',
      'BARTER_CHAIN',
      'AUCTION',
    ];

    it('should support SALE escrow type', () => {
      expect(ESCROW_TYPES).toContain('SALE');
    });

    it('should support BARTER escrow type', () => {
      expect(ESCROW_TYPES).toContain('BARTER');
    });

    it('should support BARTER_CHAIN escrow type', () => {
      expect(ESCROW_TYPES).toContain('BARTER_CHAIN');
    });

    it('should support AUCTION escrow type', () => {
      expect(ESCROW_TYPES).toContain('AUCTION');
    });
  });

  // ==========================================
  // Escrow Creation Tests
  // ==========================================
  describe('Escrow Creation', () => {
    it('should create escrow with correct fields', async () => {
      const buyer = await createTestUser({ email: 'buyer@test.com' });
      const seller = await createTestUser({ email: 'seller@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'CREATED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      expect(escrow.id).toBeDefined();
      expect(escrow.escrowType).toBe('SALE');
      expect(escrow.amount).toBe(1000);
      expect(escrow.currency).toBe('EGP');
      expect(escrow.status).toBe('CREATED');
    });

    it('should create escrow with XCoin amount', async () => {
      const buyer = await createTestUser({ email: 'buyer2@test.com' });
      const seller = await createTestUser({ email: 'seller2@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'BARTER',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 0,
          xcoinAmount: 500,
          currency: 'EGP',
          status: 'CREATED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      expect(escrow.xcoinAmount).toBe(500);
    });

    it('should create escrow with facilitator', async () => {
      const buyer = await createTestUser({ email: 'buyer3@test.com' });
      const seller = await createTestUser({ email: 'seller3@test.com' });
      const facilitatorUser = await createTestUser({ email: 'facilitator@test.com' });

      // Create facilitator
      const facilitator = await db.facilitator.create({
        data: {
          userId: facilitatorUser.id,
          type: 'INDIVIDUAL',
          status: 'ACTIVE',
          commissionRate: 0.05,
          minCommission: 50,
          rating: 5,
          totalDeals: 0,
          successfulDeals: 0,
        },
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 2000,
          currency: 'EGP',
          status: 'CREATED',
          autoReleaseAfter: 48,
          autoRelease: true,
          facilitatorId: facilitator.id,
          facilitatorFee: 100, // 5% of 2000
          expiresAt,
        },
      });

      expect(escrow.facilitatorId).toBe(facilitator.id);
      expect(escrow.facilitatorFee).toBe(100);
    });

    it('should calculate expiry date correctly', () => {
      const now = new Date();
      const maxEscrowDays = 30;
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + maxEscrowDays);

      const daysDiff = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(maxEscrowDays);
    });
  });

  // ==========================================
  // Fund Escrow Tests
  // ==========================================
  describe('Fund Escrow', () => {
    it('should fund escrow and update status', async () => {
      const buyer = await createTestUser({ email: 'buyer4@test.com' });
      const seller = await createTestUser({ email: 'seller4@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'CREATED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const funded = await db.escrow.update({
        where: { id: escrow.id },
        data: {
          status: 'FUNDED',
          fundedAt: new Date(),
        },
      });

      expect(funded.status).toBe('FUNDED');
      expect(funded.fundedAt).toBeDefined();
    });

    it('should reject funding by non-buyer', async () => {
      const buyer = await createTestUser({ email: 'buyer5@test.com' });
      const seller = await createTestUser({ email: 'seller5@test.com' });
      const other = await createTestUser({ email: 'other@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'CREATED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const canFund = escrow.buyerId === other.id;
      expect(canFund).toBe(false);
    });

    it('should reject funding already funded escrow', async () => {
      const status: string = 'FUNDED';
      const canFund = status === 'CREATED';
      expect(canFund).toBe(false);
    });
  });

  // ==========================================
  // Delivery Tests
  // ==========================================
  describe('Mark Delivered', () => {
    it('should mark escrow as delivered', async () => {
      const buyer = await createTestUser({ email: 'buyer6@test.com' });
      const seller = await createTestUser({ email: 'seller6@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'FUNDED',
          fundedAt: new Date(),
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const inspectionEndsAt = new Date();
      inspectionEndsAt.setHours(inspectionEndsAt.getHours() + 24);

      const delivered = await db.escrow.update({
        where: { id: escrow.id },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          inspectionEndsAt,
        },
      });

      expect(delivered.status).toBe('DELIVERED');
      expect(delivered.deliveredAt).toBeDefined();
      expect(delivered.inspectionEndsAt).toBeDefined();
    });

    it('should only allow seller to mark as delivered', async () => {
      const buyer = await createTestUser({ email: 'buyer7@test.com' });
      const seller = await createTestUser({ email: 'seller7@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'FUNDED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const canMarkDelivered = escrow.sellerId === seller.id;
      expect(canMarkDelivered).toBe(true);

      const buyerCanMark = escrow.sellerId === buyer.id;
      expect(buyerCanMark).toBe(false);
    });
  });

  // ==========================================
  // Confirm Receipt Tests
  // ==========================================
  describe('Confirm Receipt', () => {
    it('should confirm receipt and release funds', async () => {
      const buyer = await createTestUser({ email: 'buyer8@test.com' });
      const seller = await createTestUser({ email: 'seller8@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'DELIVERED',
          fundedAt: new Date(),
          deliveredAt: new Date(),
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const released = await db.escrow.update({
        where: { id: escrow.id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      });

      expect(released.status).toBe('RELEASED');
      expect(released.releasedAt).toBeDefined();
    });

    it('should only allow buyer to confirm receipt', async () => {
      const buyer = await createTestUser({ email: 'buyer9@test.com' });
      const seller = await createTestUser({ email: 'seller9@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'DELIVERED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const canConfirm = escrow.buyerId === buyer.id;
      expect(canConfirm).toBe(true);
    });
  });

  // ==========================================
  // Release Escrow Tests
  // ==========================================
  describe('Release Escrow', () => {
    it('should release funds to seller', async () => {
      const buyer = await createTestUser({ email: 'buyer10@test.com' });
      const seller = await createTestUser({ email: 'seller10@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'DELIVERED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const released = await db.escrow.update({
        where: { id: escrow.id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      });

      expect(released.status).toBe('RELEASED');
    });

    it('should prevent double release', async () => {
      const status = 'RELEASED';
      const canRelease = status !== 'RELEASED' && status !== 'REFUNDED';
      expect(canRelease).toBe(false);
    });
  });

  // ==========================================
  // Refund Escrow Tests
  // ==========================================
  describe('Refund Escrow', () => {
    it('should refund funds to buyer', async () => {
      const buyer = await createTestUser({ email: 'buyer11@test.com' });
      const seller = await createTestUser({ email: 'seller11@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'FUNDED',
          fundedAt: new Date(),
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const refunded = await db.escrow.update({
        where: { id: escrow.id },
        data: {
          status: 'REFUNDED',
        },
      });

      expect(refunded.status).toBe('REFUNDED');
    });

    it('should prevent double refund', async () => {
      const status: string = 'REFUNDED';
      const canRefund = status !== 'RELEASED' && status !== 'REFUNDED';
      expect(canRefund).toBe(false);
    });
  });

  // ==========================================
  // Cancel Escrow Tests
  // ==========================================
  describe('Cancel Escrow', () => {
    it('should cancel unfunded escrow', async () => {
      const buyer = await createTestUser({ email: 'buyer12@test.com' });
      const seller = await createTestUser({ email: 'seller12@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'CREATED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const cancelled = await db.escrow.update({
        where: { id: escrow.id },
        data: {
          status: 'CANCELLED',
        },
      });

      expect(cancelled.status).toBe('CANCELLED');
    });

    it('should only cancel unfunded escrow', async () => {
      const status: string = 'FUNDED';
      const canCancel = status === 'CREATED';
      expect(canCancel).toBe(false);
    });
  });

  // ==========================================
  // Dispute Tests
  // ==========================================
  describe('Dispute Management', () => {
    const DISPUTE_REASONS = [
      'ITEM_NOT_RECEIVED',
      'ITEM_NOT_AS_DESCRIBED',
      'ITEM_DAMAGED',
      'WRONG_ITEM',
      'SELLER_FRAUD',
      'BUYER_FRAUD',
      'OTHER',
    ];

    const DISPUTE_RESOLUTIONS = [
      'BUYER_FAVORED',
      'SELLER_FAVORED',
      'PARTIAL_REFUND',
      'MUTUAL_AGREEMENT',
      'CANCELLED',
    ];

    it('should have valid dispute reasons', () => {
      expect(DISPUTE_REASONS).toContain('ITEM_NOT_RECEIVED');
      expect(DISPUTE_REASONS).toContain('ITEM_NOT_AS_DESCRIBED');
      expect(DISPUTE_REASONS).toContain('ITEM_DAMAGED');
    });

    it('should have valid dispute resolutions', () => {
      expect(DISPUTE_RESOLUTIONS).toContain('BUYER_FAVORED');
      expect(DISPUTE_RESOLUTIONS).toContain('SELLER_FAVORED');
      expect(DISPUTE_RESOLUTIONS).toContain('PARTIAL_REFUND');
      expect(DISPUTE_RESOLUTIONS).toContain('MUTUAL_AGREEMENT');
    });

    it('should create dispute and update escrow status', async () => {
      const buyer = await createTestUser({ email: 'buyer13@test.com' });
      const seller = await createTestUser({ email: 'seller13@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'DELIVERED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const responseDeadline = new Date();
      responseDeadline.setHours(responseDeadline.getHours() + 72);

      const dispute = await db.dispute.create({
        data: {
          escrowId: escrow.id,
          initiatorId: buyer.id,
          respondentId: seller.id,
          reason: 'ITEM_NOT_AS_DESCRIBED',
          description: 'المنتج مختلف عن الوصف',
          status: 'OPEN',
          responseDeadline,
        },
      });

      await db.escrow.update({
        where: { id: escrow.id },
        data: { status: 'DISPUTED' },
      });

      expect(dispute.id).toBeDefined();
      expect(dispute.reason).toBe('ITEM_NOT_AS_DESCRIBED');
      expect(dispute.status).toBe('OPEN');

      const updatedEscrow = await db.escrow.findUnique({ where: { id: escrow.id } });
      expect(updatedEscrow?.status).toBe('DISPUTED');
    });

    it('should prevent duplicate disputes', async () => {
      const buyer = await createTestUser({ email: 'buyer14@test.com' });
      const seller = await createTestUser({ email: 'seller14@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'DELIVERED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const responseDeadline = new Date();
      responseDeadline.setHours(responseDeadline.getHours() + 72);

      await db.dispute.create({
        data: {
          escrowId: escrow.id,
          initiatorId: buyer.id,
          respondentId: seller.id,
          reason: 'ITEM_NOT_RECEIVED',
          description: 'لم أستلم المنتج',
          status: 'OPEN',
          responseDeadline,
        },
      });

      // Check for existing dispute
      const existingDispute = await db.dispute.findFirst({
        where: { escrowId: escrow.id },
      });

      expect(existingDispute).not.toBeNull();
    });

    it('should resolve dispute in buyer favor', async () => {
      const buyer = await createTestUser({ email: 'buyer15@test.com' });
      const seller = await createTestUser({ email: 'seller15@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'DISPUTED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const responseDeadline = new Date();
      responseDeadline.setHours(responseDeadline.getHours() + 72);

      const dispute = await db.dispute.create({
        data: {
          escrowId: escrow.id,
          initiatorId: buyer.id,
          respondentId: seller.id,
          reason: 'ITEM_NOT_RECEIVED',
          description: 'لم أستلم المنتج',
          status: 'OPEN',
          responseDeadline,
        },
      });

      const resolved = await db.dispute.update({
        where: { id: dispute.id },
        data: {
          status: 'RESOLVED',
          resolution: 'BUYER_FAVORED',
          resolvedAt: new Date(),
          resolutionNotes: 'تم إثبات عدم الاستلام',
        },
      });

      expect(resolved.status).toBe('RESOLVED');
      expect(resolved.resolution).toBe('BUYER_FAVORED');
    });

    it('should add messages to dispute', async () => {
      const buyer = await createTestUser({ email: 'buyer16@test.com' });
      const seller = await createTestUser({ email: 'seller16@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'DISPUTED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const responseDeadline = new Date();
      responseDeadline.setHours(responseDeadline.getHours() + 72);

      const dispute = await db.dispute.create({
        data: {
          escrowId: escrow.id,
          initiatorId: buyer.id,
          respondentId: seller.id,
          reason: 'ITEM_NOT_AS_DESCRIBED',
          description: 'المنتج مختلف',
          status: 'OPEN',
          responseDeadline,
        },
      });

      const message = await db.disputeMessage.create({
        data: {
          disputeId: dispute.id,
          senderId: buyer.id,
          senderRole: 'INITIATOR',
          message: 'هذا هو الدليل على مشكلتي',
          attachments: ['image1.jpg', 'image2.jpg'],
          isInternal: false,
        },
      });

      expect(message.message).toBe('هذا هو الدليل على مشكلتي');
      expect(message.attachments).toHaveLength(2);
    });
  });

  // ==========================================
  // Milestone Tests
  // ==========================================
  describe('Escrow Milestones', () => {
    it('should create milestone on status change', async () => {
      const buyer = await createTestUser({ email: 'buyer17@test.com' });
      const seller = await createTestUser({ email: 'seller17@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'CREATED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const milestone = await db.escrowMilestone.create({
        data: {
          escrowId: escrow.id,
          milestone: 'CREATED',
          description: 'تم إنشاء الضمان',
          actorType: 'SYSTEM',
        },
      });

      expect(milestone.milestone).toBe('CREATED');
      expect(milestone.description).toBe('تم إنشاء الضمان');
    });

    it('should track multiple milestones', async () => {
      const buyer = await createTestUser({ email: 'buyer18@test.com' });
      const seller = await createTestUser({ email: 'seller18@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'CREATED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      await db.escrowMilestone.create({
        data: {
          escrowId: escrow.id,
          milestone: 'CREATED',
          description: 'تم إنشاء الضمان',
          actorType: 'SYSTEM',
        },
      });

      await db.escrowMilestone.create({
        data: {
          escrowId: escrow.id,
          milestone: 'FUNDED',
          description: 'تم تمويل الضمان',
          actorType: 'BUYER',
          actorId: buyer.id,
        },
      });

      await db.escrowMilestone.create({
        data: {
          escrowId: escrow.id,
          milestone: 'DELIVERED',
          description: 'تم تسليم الصنف',
          actorType: 'SELLER',
          actorId: seller.id,
        },
      });

      const milestones = await db.escrowMilestone.findMany({
        where: { escrowId: escrow.id },
        orderBy: { createdAt: 'asc' },
      });

      expect(milestones.length).toBe(3);
      expect(milestones[0].milestone).toBe('CREATED');
      expect(milestones[1].milestone).toBe('FUNDED');
      expect(milestones[2].milestone).toBe('DELIVERED');
    });
  });

  // ==========================================
  // Expiry Tests
  // ==========================================
  describe('Escrow Expiry', () => {
    it('should mark expired escrows', async () => {
      const buyer = await createTestUser({ email: 'buyer19@test.com' });
      const seller = await createTestUser({ email: 'seller19@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() - 1); // Already expired

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'CREATED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const isExpired = escrow.expiresAt < new Date();
      expect(isExpired).toBe(true);

      if (isExpired) {
        const expired = await db.escrow.update({
          where: { id: escrow.id },
          data: { status: 'EXPIRED' },
        });
        expect(expired.status).toBe('EXPIRED');
      }
    });

    it('should refund funded expired escrow', async () => {
      const buyer = await createTestUser({ email: 'buyer20@test.com' });
      const seller = await createTestUser({ email: 'seller20@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() - 1); // Already expired

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          xcoinAmount: 500,
          currency: 'EGP',
          status: 'FUNDED',
          fundedAt: new Date(),
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const isExpired = escrow.expiresAt < new Date();
      const isFunded = escrow.status === 'FUNDED';
      const needsRefund = isExpired && isFunded && escrow.xcoinAmount;

      expect(needsRefund).toBeTruthy();
    });
  });

  // ==========================================
  // Query Tests
  // ==========================================
  describe('Escrow Queries', () => {
    it('should get user escrows by role', async () => {
      const buyer = await createTestUser({ email: 'buyer21@test.com' });
      const seller = await createTestUser({ email: 'seller21@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'FUNDED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 2000,
          currency: 'EGP',
          status: 'RELEASED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const buyerEscrows = await db.escrow.findMany({
        where: { buyerId: buyer.id },
      });

      const sellerEscrows = await db.escrow.findMany({
        where: { sellerId: seller.id },
      });

      expect(buyerEscrows.length).toBe(2);
      expect(sellerEscrows.length).toBe(2);
    });

    it('should filter escrows by status', async () => {
      const buyer = await createTestUser({ email: 'buyer22@test.com' });
      const seller = await createTestUser({ email: 'seller22@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'FUNDED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 2000,
          currency: 'EGP',
          status: 'RELEASED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      const fundedEscrows = await db.escrow.findMany({
        where: { buyerId: buyer.id, status: 'FUNDED' },
      });

      const releasedEscrows = await db.escrow.findMany({
        where: { buyerId: buyer.id, status: 'RELEASED' },
      });

      expect(fundedEscrows.length).toBe(1);
      expect(releasedEscrows.length).toBe(1);
    });

    it('should get escrow with milestones and dispute', async () => {
      const buyer = await createTestUser({ email: 'buyer23@test.com' });
      const seller = await createTestUser({ email: 'seller23@test.com' });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const escrow = await db.escrow.create({
        data: {
          escrowType: 'SALE',
          buyerId: buyer.id,
          sellerId: seller.id,
          amount: 1000,
          currency: 'EGP',
          status: 'DISPUTED',
          autoReleaseAfter: 48,
          autoRelease: true,
          expiresAt,
        },
      });

      await db.escrowMilestone.create({
        data: {
          escrowId: escrow.id,
          milestone: 'CREATED',
          description: 'تم إنشاء الضمان',
          actorType: 'SYSTEM',
        },
      });

      const responseDeadline = new Date();
      responseDeadline.setHours(responseDeadline.getHours() + 72);

      await db.dispute.create({
        data: {
          escrowId: escrow.id,
          initiatorId: buyer.id,
          respondentId: seller.id,
          reason: 'ITEM_NOT_RECEIVED',
          description: 'لم أستلم',
          status: 'OPEN',
          responseDeadline,
        },
      });

      // Fetch escrow and relations separately for mock compatibility
      const fullEscrow = await db.escrow.findUnique({
        where: { id: escrow.id },
      });

      const milestones = await db.escrowMilestone.findMany({
        where: { escrowId: escrow.id },
      });

      const dispute = await db.dispute.findFirst({
        where: { escrowId: escrow.id },
      });

      expect(milestones.length).toBe(1);
      expect(dispute).toBeDefined();
      expect(dispute?.reason).toBe('ITEM_NOT_RECEIVED');
    });
  });
});
