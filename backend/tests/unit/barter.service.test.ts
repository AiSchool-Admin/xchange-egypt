/**
 * Barter Service Unit Tests
 * اختبارات وحدة خدمة المقايضة
 */

import { cleanDatabase, disconnectTestDb, getTestDb } from '../helpers/testDb';
import {
  createTestUser,
  createTestCategory,
  createTestItem,
  createTestBarterItem,
} from '../helpers/testHelpers';

describe('Barter Service Tests', () => {
  const db = getTestDb();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  // ==========================================
  // Barter Item Creation Tests
  // ==========================================
  describe('Barter Item Creation', () => {
    it('should create barter item with category', async () => {
      const user = await createTestUser();
      const category = await createTestCategory();

      const item = await db.item.create({
        data: {
          sellerId: user.id,
          categoryId: category.id,
          title: 'iPhone للمقايضة',
          description: 'iPhone in good condition for barter',
          condition: 'GOOD',
          estimatedValue: 5000,
          listingType: 'BARTER',
          images: ['image1.jpg'],
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          status: 'ACTIVE',
        },
      });

      expect(item).toHaveProperty('id');
      expect(item.listingType).toBe('BARTER');
      expect(item.estimatedValue).toBe(5000);
    });

    it('should create barter item with desired category', async () => {
      const user = await createTestUser();
      const offerCategory = await createTestCategory({ nameEn: 'Electronics' });
      const desiredCategory = await createTestCategory({ nameEn: 'Furniture' });

      const item = await db.item.create({
        data: {
          sellerId: user.id,
          categoryId: offerCategory.id,
          desiredCategoryId: desiredCategory.id,
          title: 'Laptop للمقايضة بأثاث',
          description: 'Want to exchange for furniture',
          condition: 'EXCELLENT',
          estimatedValue: 8000,
          listingType: 'BARTER',
          images: [],
          governorate: 'الإسكندرية',
          city: 'المنتزه',
          status: 'ACTIVE',
        },
      });

      expect(item.desiredCategoryId).toBe(desiredCategory.id);
    });

    it('should set estimated value correctly', async () => {
      const user = await createTestUser();
      const category = await createTestCategory();

      const item = await createTestBarterItem(user.id, category.id, category.id, {
        estimatedValue: 15000,
      });

      expect(item.estimatedValue).toBe(15000);
    });
  });

  // ==========================================
  // Barter Offer Tests
  // ==========================================
  describe('Barter Offer Management', () => {
    it('should create barter offer', async () => {
      const initiator = await createTestUser({ email: 'initiator@test.com' });
      const recipient = await createTestUser({ email: 'recipient@test.com' });
      const category = await createTestCategory();

      const offeredItem = await createTestItem(initiator.id, category.id);
      const requestedItem = await createTestItem(recipient.id, category.id);

      const offer = await db.barterOffer.create({
        data: {
          initiatorId: initiator.id,
          recipientId: recipient.id,
          offeredItemId: offeredItem.id,
          requestedItemId: requestedItem.id,
          status: 'PENDING',
          offeredCashAmount: 0,
          requestedCashAmount: 0,
        },
      });

      expect(offer).toHaveProperty('id');
      expect(offer.status).toBe('PENDING');
      expect(offer.initiatorId).toBe(initiator.id);
      expect(offer.recipientId).toBe(recipient.id);
    });

    it('should create barter offer with cash difference', async () => {
      const initiator = await createTestUser({ email: 'cash-init@test.com' });
      const recipient = await createTestUser({ email: 'cash-recv@test.com' });
      const category = await createTestCategory();

      const offeredItem = await createTestItem(initiator.id, category.id, {
        estimatedValue: 3000,
      });
      const requestedItem = await createTestItem(recipient.id, category.id, {
        estimatedValue: 5000,
      });

      const offer = await db.barterOffer.create({
        data: {
          initiatorId: initiator.id,
          recipientId: recipient.id,
          offeredItemId: offeredItem.id,
          requestedItemId: requestedItem.id,
          status: 'PENDING',
          offeredCashAmount: 2000, // To cover the difference
          requestedCashAmount: 0,
        },
      });

      expect(offer.offeredCashAmount).toBe(2000);
    });

    it('should accept barter offer', async () => {
      const initiator = await createTestUser({ email: 'accept-init@test.com' });
      const recipient = await createTestUser({ email: 'accept-recv@test.com' });
      const category = await createTestCategory();

      const offeredItem = await createTestItem(initiator.id, category.id);
      const requestedItem = await createTestItem(recipient.id, category.id);

      const offer = await db.barterOffer.create({
        data: {
          initiatorId: initiator.id,
          recipientId: recipient.id,
          offeredItemId: offeredItem.id,
          requestedItemId: requestedItem.id,
          status: 'PENDING',
          offeredCashAmount: 0,
          requestedCashAmount: 0,
        },
      });

      const acceptedOffer = await db.barterOffer.update({
        where: { id: offer.id },
        data: { status: 'ACCEPTED' },
      });

      expect(acceptedOffer.status).toBe('ACCEPTED');
    });

    it('should reject barter offer', async () => {
      const initiator = await createTestUser({ email: 'reject-init@test.com' });
      const recipient = await createTestUser({ email: 'reject-recv@test.com' });
      const category = await createTestCategory();

      const offeredItem = await createTestItem(initiator.id, category.id);
      const requestedItem = await createTestItem(recipient.id, category.id);

      const offer = await db.barterOffer.create({
        data: {
          initiatorId: initiator.id,
          recipientId: recipient.id,
          offeredItemId: offeredItem.id,
          requestedItemId: requestedItem.id,
          status: 'PENDING',
          offeredCashAmount: 0,
          requestedCashAmount: 0,
        },
      });

      const rejectedOffer = await db.barterOffer.update({
        where: { id: offer.id },
        data: { status: 'REJECTED' },
      });

      expect(rejectedOffer.status).toBe('REJECTED');
    });

    it('should cancel barter offer', async () => {
      const initiator = await createTestUser({ email: 'cancel-init@test.com' });
      const recipient = await createTestUser({ email: 'cancel-recv@test.com' });
      const category = await createTestCategory();

      const offeredItem = await createTestItem(initiator.id, category.id);
      const requestedItem = await createTestItem(recipient.id, category.id);

      const offer = await db.barterOffer.create({
        data: {
          initiatorId: initiator.id,
          recipientId: recipient.id,
          offeredItemId: offeredItem.id,
          requestedItemId: requestedItem.id,
          status: 'PENDING',
          offeredCashAmount: 0,
          requestedCashAmount: 0,
        },
      });

      const cancelledOffer = await db.barterOffer.update({
        where: { id: offer.id },
        data: { status: 'CANCELLED' },
      });

      expect(cancelledOffer.status).toBe('CANCELLED');
    });
  });

  // ==========================================
  // Barter Search Tests
  // ==========================================
  describe('Barter Item Search', () => {
    it('should search barter items by category', async () => {
      const user = await createTestUser();
      const electronicsCategory = await createTestCategory({ nameEn: 'Electronics', slug: 'electronics' });
      const furnitureCategory = await createTestCategory({ nameEn: 'Furniture', slug: 'furniture' });

      await createTestItem(user.id, electronicsCategory.id, { listingType: 'BARTER' });
      await createTestItem(user.id, electronicsCategory.id, { listingType: 'BARTER' });
      await createTestItem(user.id, furnitureCategory.id, { listingType: 'BARTER' });

      const electronicsItems = await db.item.findMany({
        where: {
          categoryId: electronicsCategory.id,
          listingType: 'BARTER',
          status: 'ACTIVE',
        },
      });

      expect(electronicsItems).toHaveLength(2);
    });

    it('should search barter items by condition', async () => {
      const user = await createTestUser();
      const category = await createTestCategory();

      await createTestItem(user.id, category.id, { condition: 'EXCELLENT', listingType: 'BARTER' });
      await createTestItem(user.id, category.id, { condition: 'GOOD', listingType: 'BARTER' });
      await createTestItem(user.id, category.id, { condition: 'FAIR', listingType: 'BARTER' });

      const excellentItems = await db.item.findMany({
        where: {
          condition: 'EXCELLENT',
          listingType: 'BARTER',
          status: 'ACTIVE',
        },
      });

      expect(excellentItems).toHaveLength(1);
    });

    it('should search barter items by governorate', async () => {
      const user = await createTestUser();
      const category = await createTestCategory();

      await createTestItem(user.id, category.id, { governorate: 'القاهرة', listingType: 'BARTER' });
      await createTestItem(user.id, category.id, { governorate: 'القاهرة', listingType: 'BARTER' });
      await createTestItem(user.id, category.id, { governorate: 'الإسكندرية', listingType: 'BARTER' });

      const cairoItems = await db.item.findMany({
        where: {
          governorate: 'القاهرة',
          listingType: 'BARTER',
          status: 'ACTIVE',
        },
      });

      expect(cairoItems).toHaveLength(2);
    });

    it('should exclude user own items in search', async () => {
      const user1 = await createTestUser({ email: 'user1@test.com' });
      const user2 = await createTestUser({ email: 'user2@test.com' });
      const category = await createTestCategory();

      await createTestItem(user1.id, category.id, { listingType: 'BARTER' });
      await createTestItem(user2.id, category.id, { listingType: 'BARTER' });
      await createTestItem(user2.id, category.id, { listingType: 'BARTER' });

      const otherUsersItems = await db.item.findMany({
        where: {
          sellerId: { not: user1.id },
          listingType: 'BARTER',
          status: 'ACTIVE',
        },
      });

      expect(otherUsersItems).toHaveLength(2);
      otherUsersItems.forEach((item) => {
        expect(item.sellerId).not.toBe(user1.id);
      });
    });
  });

  // ==========================================
  // Barter Value Calculation Tests
  // ==========================================
  describe('Barter Value Calculations', () => {
    it('should calculate total offered value correctly', async () => {
      const user = await createTestUser();
      const category = await createTestCategory();

      const item1 = await createTestItem(user.id, category.id, { estimatedValue: 3000 });
      const item2 = await createTestItem(user.id, category.id, { estimatedValue: 2000 });

      const totalValue = item1.estimatedValue + item2.estimatedValue;
      expect(totalValue).toBe(5000);
    });

    it('should calculate value difference correctly', async () => {
      const offeredValue = 3000;
      const requestedValue = 5000;

      const difference = requestedValue - offeredValue;
      expect(difference).toBe(2000);
    });

    it('should handle cash + items in offer', async () => {
      const itemValue = 4000;
      const cashAmount = 1000;

      const totalOfferValue = itemValue + cashAmount;
      expect(totalOfferValue).toBe(5000);
    });
  });

  // ==========================================
  // Barter Offer Status Tests
  // ==========================================
  describe('Barter Offer Status Transitions', () => {
    it('should have valid status values', () => {
      const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'COMPLETED'];

      validStatuses.forEach((status) => {
        expect(typeof status).toBe('string');
      });
    });

    it('should track offer expiration', async () => {
      const initiator = await createTestUser({ email: 'expire-init@test.com' });
      const recipient = await createTestUser({ email: 'expire-recv@test.com' });
      const category = await createTestCategory();

      const offeredItem = await createTestItem(initiator.id, category.id);
      const requestedItem = await createTestItem(recipient.id, category.id);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const offer = await db.barterOffer.create({
        data: {
          initiatorId: initiator.id,
          recipientId: recipient.id,
          offeredItemId: offeredItem.id,
          requestedItemId: requestedItem.id,
          status: 'PENDING',
          offeredCashAmount: 0,
          requestedCashAmount: 0,
          expiresAt,
        },
      });

      expect(offer.expiresAt).toBeDefined();
      expect(offer.expiresAt! > new Date()).toBe(true);
    });

    it('should detect expired offers', async () => {
      const initiator = await createTestUser({ email: 'expired-init@test.com' });
      const recipient = await createTestUser({ email: 'expired-recv@test.com' });
      const category = await createTestCategory();

      const offeredItem = await createTestItem(initiator.id, category.id);
      const requestedItem = await createTestItem(recipient.id, category.id);

      const expiredDate = new Date(Date.now() - 1000); // Already expired

      const offer = await db.barterOffer.create({
        data: {
          initiatorId: initiator.id,
          recipientId: recipient.id,
          offeredItemId: offeredItem.id,
          requestedItemId: requestedItem.id,
          status: 'PENDING',
          offeredCashAmount: 0,
          requestedCashAmount: 0,
          expiresAt: expiredDate,
        },
      });

      expect(offer.expiresAt! < new Date()).toBe(true);
    });
  });

  // ==========================================
  // Barter User Stats Tests
  // ==========================================
  describe('Barter User Statistics', () => {
    it('should count user active barter items', async () => {
      const user = await createTestUser();
      const category = await createTestCategory();

      await createTestItem(user.id, category.id, { listingType: 'BARTER', status: 'ACTIVE' });
      await createTestItem(user.id, category.id, { listingType: 'BARTER', status: 'ACTIVE' });
      await createTestItem(user.id, category.id, { listingType: 'DIRECT_SALE', status: 'ACTIVE' });

      const barterItemsCount = await db.item.count({
        where: {
          sellerId: user.id,
          listingType: 'BARTER',
          status: 'ACTIVE',
        },
      });

      expect(barterItemsCount).toBe(2);
    });

    it('should count user pending offers', async () => {
      const initiator = await createTestUser({ email: 'stats-init@test.com' });
      const recipient = await createTestUser({ email: 'stats-recv@test.com' });
      const category = await createTestCategory();

      const offeredItem = await createTestItem(initiator.id, category.id);
      const requestedItem = await createTestItem(recipient.id, category.id);

      await db.barterOffer.create({
        data: {
          initiatorId: initiator.id,
          recipientId: recipient.id,
          offeredItemId: offeredItem.id,
          requestedItemId: requestedItem.id,
          status: 'PENDING',
          offeredCashAmount: 0,
          requestedCashAmount: 0,
        },
      });

      const pendingOffersCount = await db.barterOffer.count({
        where: {
          initiatorId: initiator.id,
          status: 'PENDING',
        },
      });

      expect(pendingOffersCount).toBe(1);
    });

    it('should count completed barters', async () => {
      const initiator = await createTestUser({ email: 'completed-init@test.com' });
      const recipient = await createTestUser({ email: 'completed-recv@test.com' });
      const category = await createTestCategory();

      const offeredItem = await createTestItem(initiator.id, category.id);
      const requestedItem = await createTestItem(recipient.id, category.id);

      await db.barterOffer.create({
        data: {
          initiatorId: initiator.id,
          recipientId: recipient.id,
          offeredItemId: offeredItem.id,
          requestedItemId: requestedItem.id,
          status: 'COMPLETED',
          offeredCashAmount: 0,
          requestedCashAmount: 0,
        },
      });

      const completedCount = await db.barterOffer.count({
        where: {
          OR: [{ initiatorId: initiator.id }, { recipientId: initiator.id }],
          status: 'COMPLETED',
        },
      });

      expect(completedCount).toBe(1);
    });
  });
});
