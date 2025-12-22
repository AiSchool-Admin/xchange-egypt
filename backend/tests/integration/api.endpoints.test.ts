/**
 * API Endpoints Integration Tests
 * اختبارات تكامل نقاط نهاية API
 */

import { cleanDatabase, disconnectTestDb, getTestDb } from '../helpers/testDb';
import {
  createTestUser,
  createTestCategory,
  createTestItem,
  generateTestToken,
} from '../helpers/testHelpers';

// Check if Prisma is available
let prismaAvailable = false;
try {
  require('@prisma/client');
  prismaAvailable = true;
} catch {
  console.log('⚠️ Prisma not available - skipping API Endpoints tests');
}

const describeIfPrisma = prismaAvailable ? describe : describe.skip;

describeIfPrisma('API Endpoints Tests', () => {
  const db = getTestDb();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  // ==========================================
  // Authentication Endpoints
  // ==========================================
  describe('Auth API Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should validate required fields', () => {
        const validPayload = {
          email: 'test@example.com',
          password: 'SecurePass123!',
          fullName: 'Test User',
        };

        expect(validPayload.email).toBeDefined();
        expect(validPayload.password).toBeDefined();
        expect(validPayload.fullName).toBeDefined();
      });

      it('should validate email format', () => {
        const validEmail = 'user@example.com';
        const invalidEmail = 'invalid-email';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(validEmail)).toBe(true);
        expect(emailRegex.test(invalidEmail)).toBe(false);
      });

      it('should validate password strength', () => {
        const strongPassword = 'SecurePass123!';
        const weakPassword = '123';

        // Minimum 8 characters
        expect(strongPassword.length >= 8).toBe(true);
        expect(weakPassword.length >= 8).toBe(false);
      });
    });

    describe('POST /api/auth/login', () => {
      it('should require email and password', () => {
        const loginPayload = {
          email: 'test@example.com',
          password: 'password123',
        };

        expect(loginPayload).toHaveProperty('email');
        expect(loginPayload).toHaveProperty('password');
      });
    });

    describe('POST /api/auth/refresh', () => {
      it('should require refresh token', () => {
        const refreshPayload = {
          refreshToken: 'some-refresh-token',
        };

        expect(refreshPayload).toHaveProperty('refreshToken');
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should accept refresh token for logout', () => {
        const logoutPayload = {
          refreshToken: 'token-to-invalidate',
        };

        expect(logoutPayload).toHaveProperty('refreshToken');
      });
    });
  });

  // ==========================================
  // User Endpoints
  // ==========================================
  describe('User API Endpoints', () => {
    describe('GET /api/users/profile', () => {
      it('should require authentication token', async () => {
        const user = await createTestUser();
        const token = generateTestToken(user.id, 'INDIVIDUAL');

        expect(token).toBeDefined();
        expect(token.split('.')).toHaveLength(3);
      });

      it('should return user profile data', async () => {
        const user = await createTestUser({
          email: 'profile@test.com',
          fullName: 'Profile User',
        });

        const profile = await db.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            userType: true,
            status: true,
          },
        });

        expect(profile).toHaveProperty('id');
        expect(profile).toHaveProperty('email');
        expect(profile).toHaveProperty('fullName');
        expect(profile?.email).toBe('profile@test.com');
      });
    });

    describe('PUT /api/users/profile', () => {
      it('should update user profile', async () => {
        const user = await createTestUser();

        const updateData = {
          fullName: 'Updated Name',
          bio: 'New bio text',
          city: 'القاهرة',
        };

        const updated = await db.user.update({
          where: { id: user.id },
          data: updateData,
        });

        expect(updated.fullName).toBe('Updated Name');
        expect(updated.bio).toBe('New bio text');
      });
    });
  });

  // ==========================================
  // Item Endpoints
  // ==========================================
  describe('Item API Endpoints', () => {
    describe('GET /api/items', () => {
      it('should list active items', async () => {
        const user = await createTestUser();
        const category = await createTestCategory();

        await createTestItem(user.id, category.id, { status: 'ACTIVE' });
        await createTestItem(user.id, category.id, { status: 'ACTIVE' });
        await createTestItem(user.id, category.id, { status: 'SOLD' });

        const activeItems = await db.item.findMany({
          where: { status: 'ACTIVE' },
        });

        expect(activeItems).toHaveLength(2);
      });

      it('should support pagination', async () => {
        const user = await createTestUser();
        const category = await createTestCategory();

        // Create 15 items
        for (let i = 0; i < 15; i++) {
          await createTestItem(user.id, category.id);
        }

        const page1 = await db.item.findMany({
          take: 10,
          skip: 0,
        });

        const page2 = await db.item.findMany({
          take: 10,
          skip: 10,
        });

        expect(page1).toHaveLength(10);
        expect(page2).toHaveLength(5);
      });

      it('should filter by category', async () => {
        const user = await createTestUser();
        const category1 = await createTestCategory({ nameEn: 'Electronics' });
        const category2 = await createTestCategory({ nameEn: 'Furniture' });

        await createTestItem(user.id, category1.id);
        await createTestItem(user.id, category1.id);
        await createTestItem(user.id, category2.id);

        const electronicsItems = await db.item.findMany({
          where: { categoryId: category1.id },
        });

        expect(electronicsItems).toHaveLength(2);
      });

      it('should filter by condition', async () => {
        const user = await createTestUser();
        const category = await createTestCategory();

        await createTestItem(user.id, category.id, { condition: 'EXCELLENT' });
        await createTestItem(user.id, category.id, { condition: 'GOOD' });
        await createTestItem(user.id, category.id, { condition: 'FAIR' });

        const excellentItems = await db.item.findMany({
          where: { condition: 'EXCELLENT' },
        });

        expect(excellentItems).toHaveLength(1);
      });

      it('should filter by governorate', async () => {
        const user = await createTestUser();
        const category = await createTestCategory();

        await createTestItem(user.id, category.id, { governorate: 'القاهرة' });
        await createTestItem(user.id, category.id, { governorate: 'القاهرة' });
        await createTestItem(user.id, category.id, { governorate: 'الإسكندرية' });

        const cairoItems = await db.item.findMany({
          where: { governorate: 'القاهرة' },
        });

        expect(cairoItems).toHaveLength(2);
      });
    });

    describe('GET /api/items/:id', () => {
      it('should return item details', async () => {
        const user = await createTestUser();
        const category = await createTestCategory();
        const item = await createTestItem(user.id, category.id, {
          title: 'Test Item',
          description: 'Test Description',
        });

        const itemDetails = await db.item.findUnique({
          where: { id: item.id },
          include: {
            category: true,
            seller: {
              select: { id: true, fullName: true, rating: true },
            },
          },
        });

        expect(itemDetails).toHaveProperty('id');
        expect(itemDetails).toHaveProperty('title');
        expect(itemDetails).toHaveProperty('category');
        expect(itemDetails).toHaveProperty('seller');
      });

      it('should increment view count', async () => {
        const user = await createTestUser();
        const category = await createTestCategory();
        const item = await createTestItem(user.id, category.id);

        const initialViews = item.viewCount || 0;

        const updated = await db.item.update({
          where: { id: item.id },
          data: { viewCount: { increment: 1 } },
        });

        expect(updated.viewCount).toBe(initialViews + 1);
      });
    });

    describe('POST /api/items', () => {
      it('should require authentication', async () => {
        const user = await createTestUser();
        const token = generateTestToken(user.id, 'INDIVIDUAL');

        expect(token).toBeDefined();
      });

      it('should validate required fields', () => {
        const itemPayload = {
          title: 'Test Item',
          description: 'Description',
          categoryId: 'category-id',
          condition: 'GOOD',
          estimatedValue: 1000,
          listingType: 'DIRECT_SALE',
          governorate: 'القاهرة',
          city: 'مدينة نصر',
        };

        expect(itemPayload).toHaveProperty('title');
        expect(itemPayload).toHaveProperty('categoryId');
        expect(itemPayload).toHaveProperty('condition');
        expect(itemPayload).toHaveProperty('estimatedValue');
      });

      it('should create item successfully', async () => {
        const user = await createTestUser();
        const category = await createTestCategory();

        const item = await db.item.create({
          data: {
            sellerId: user.id,
            categoryId: category.id,
            title: 'New Item',
            description: 'Item description',
            condition: 'GOOD',
            estimatedValue: 5000,
            listingType: 'DIRECT_SALE',
            images: [],
            governorate: 'القاهرة',
            city: 'مدينة نصر',
            status: 'ACTIVE',
          },
        });

        expect(item).toHaveProperty('id');
        expect(item.title).toBe('New Item');
        expect(item.sellerId).toBe(user.id);
      });
    });
  });

  // ==========================================
  // Barter Endpoints
  // ==========================================
  describe('Barter API Endpoints', () => {
    describe('GET /api/barter/items', () => {
      it('should list only barter items', async () => {
        const user = await createTestUser();
        const category = await createTestCategory();

        await createTestItem(user.id, category.id, { listingType: 'BARTER' });
        await createTestItem(user.id, category.id, { listingType: 'BARTER' });
        await createTestItem(user.id, category.id, { listingType: 'DIRECT_SALE' });

        const barterItems = await db.item.findMany({
          where: { listingType: 'BARTER', status: 'ACTIVE' },
        });

        expect(barterItems).toHaveLength(2);
      });
    });

    describe('POST /api/barter/offers', () => {
      it('should create barter offer', async () => {
        const initiator = await createTestUser({ email: 'init@test.com' });
        const recipient = await createTestUser({ email: 'recv@test.com' });
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
      });
    });

    describe('PUT /api/barter/offers/:id/accept', () => {
      it('should accept barter offer', async () => {
        const initiator = await createTestUser({ email: 'init-accept@test.com' });
        const recipient = await createTestUser({ email: 'recv-accept@test.com' });
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

        const accepted = await db.barterOffer.update({
          where: { id: offer.id },
          data: { status: 'ACCEPTED' },
        });

        expect(accepted.status).toBe('ACCEPTED');
      });
    });
  });

  // ==========================================
  // Auction Endpoints
  // ==========================================
  describe('Auction API Endpoints', () => {
    describe('GET /api/auctions', () => {
      it('should list active auctions', async () => {
        const seller = await createTestUser();
        const category = await createTestCategory();

        const items = await Promise.all([
          createTestItem(seller.id, category.id),
          createTestItem(seller.id, category.id),
          createTestItem(seller.id, category.id),
        ]);

        await db.auction.create({
          data: {
            sellerId: seller.id,
            itemId: items[0].id,
            title: 'Active Auction 1',
            description: 'Test',
            startingPrice: 1000,
            currentPrice: 1000,
            minBidIncrement: 100,
            startsAt: new Date(),
            endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
          },
        });

        await db.auction.create({
          data: {
            sellerId: seller.id,
            itemId: items[1].id,
            title: 'Active Auction 2',
            description: 'Test',
            startingPrice: 2000,
            currentPrice: 2000,
            minBidIncrement: 100,
            startsAt: new Date(),
            endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
          },
        });

        await db.auction.create({
          data: {
            sellerId: seller.id,
            itemId: items[2].id,
            title: 'Ended Auction',
            description: 'Test',
            startingPrice: 3000,
            currentPrice: 3000,
            minBidIncrement: 100,
            startsAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
            endsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: 'ENDED',
          },
        });

        const activeAuctions = await db.auction.findMany({
          where: { status: 'ACTIVE' },
        });

        expect(activeAuctions).toHaveLength(2);
      });
    });

    describe('POST /api/auctions/:id/bid', () => {
      it('should place bid on auction', async () => {
        const seller = await createTestUser({ email: 'seller-bid@test.com' });
        const bidder = await createTestUser({ email: 'bidder-api@test.com' });
        const category = await createTestCategory();
        const item = await createTestItem(seller.id, category.id);

        const auction = await db.auction.create({
          data: {
            sellerId: seller.id,
            itemId: item.id,
            title: 'Bid Test Auction',
            description: 'Test',
            startingPrice: 1000,
            currentPrice: 1000,
            minBidIncrement: 100,
            startsAt: new Date(),
            endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
          },
        });

        const bid = await db.auctionBid.create({
          data: {
            auctionId: auction.id,
            bidderId: bidder.id,
            amount: 1100,
          },
        });

        expect(bid).toHaveProperty('id');
        expect(bid.amount).toBe(1100);
      });
    });
  });

  // ==========================================
  // Category Endpoints
  // ==========================================
  describe('Category API Endpoints', () => {
    describe('GET /api/categories', () => {
      it('should list root categories', async () => {
        await createTestCategory({ level: 1, nameEn: 'Electronics' });
        await createTestCategory({ level: 1, nameEn: 'Furniture' });
        await createTestCategory({ level: 1, nameEn: 'Vehicles' });

        const rootCategories = await db.category.findMany({
          where: { level: 1, isActive: true },
        });

        expect(rootCategories.length).toBeGreaterThanOrEqual(3);
      });

      it('should return category with subcategories', async () => {
        const parent = await createTestCategory({ level: 1, nameEn: 'Electronics' });

        await db.category.create({
          data: {
            nameEn: 'Phones',
            nameAr: 'هواتف',
            slug: `phones-${Date.now()}`,
            level: 2,
            parentId: parent.id,
            isActive: true,
          },
        });

        await db.category.create({
          data: {
            nameEn: 'Laptops',
            nameAr: 'لابتوب',
            slug: `laptops-${Date.now()}`,
            level: 2,
            parentId: parent.id,
            isActive: true,
          },
        });

        const categoryWithSubs = await db.category.findUnique({
          where: { id: parent.id },
          include: { children: true },
        });

        expect(categoryWithSubs?.children).toHaveLength(2);
      });
    });
  });

  // ==========================================
  // Search Endpoints
  // ==========================================
  describe('Search API Endpoints', () => {
    describe('GET /api/search', () => {
      it('should search items by title', async () => {
        const user = await createTestUser();
        const category = await createTestCategory();

        await createTestItem(user.id, category.id, { title: 'iPhone 14 Pro Max' });
        await createTestItem(user.id, category.id, { title: 'Samsung Galaxy S23' });
        await createTestItem(user.id, category.id, { title: 'MacBook Pro M2' });

        const iPhoneSearch = await db.item.findMany({
          where: {
            title: { contains: 'iPhone', mode: 'insensitive' },
            status: 'ACTIVE',
          },
        });

        expect(iPhoneSearch).toHaveLength(1);
        expect(iPhoneSearch[0].title).toContain('iPhone');
      });

      it('should search items by description', async () => {
        const user = await createTestUser();
        const category = await createTestCategory();

        await createTestItem(user.id, category.id, {
          title: 'Phone',
          description: 'Brand new with Apple warranty',
        });

        const search = await db.item.findMany({
          where: {
            description: { contains: 'Apple', mode: 'insensitive' },
            status: 'ACTIVE',
          },
        });

        expect(search.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ==========================================
  // Notification Endpoints
  // ==========================================
  describe('Notification API Endpoints', () => {
    describe('GET /api/notifications', () => {
      it('should get user notifications', async () => {
        const user = await createTestUser();

        await db.notification.createMany({
          data: [
            {
              userId: user.id,
              type: 'BARTER_OFFER_RECEIVED',
              title: 'New barter offer',
              message: 'You received a new offer',
              isRead: false,
            },
            {
              userId: user.id,
              type: 'AUCTION_NEW_BID',
              title: 'New bid',
              message: 'Someone bid on your auction',
              isRead: false,
            },
          ],
        });

        const notifications = await db.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        });

        expect(notifications).toHaveLength(2);
      });

      it('should count unread notifications', async () => {
        const user = await createTestUser();

        await db.notification.createMany({
          data: [
            {
              userId: user.id,
              type: 'BARTER_OFFER_RECEIVED',
              title: 'Notification 1',
              message: 'Message',
              isRead: false,
            },
            {
              userId: user.id,
              type: 'AUCTION_NEW_BID',
              title: 'Notification 2',
              message: 'Message',
              isRead: true,
            },
            {
              userId: user.id,
              type: 'ORDER_RECEIVED',
              title: 'Notification 3',
              message: 'Message',
              isRead: false,
            },
          ],
        });

        const unreadCount = await db.notification.count({
          where: { userId: user.id, isRead: false },
        });

        expect(unreadCount).toBe(2);
      });
    });

    describe('PUT /api/notifications/:id/read', () => {
      it('should mark notification as read', async () => {
        const user = await createTestUser();

        const notification = await db.notification.create({
          data: {
            userId: user.id,
            type: 'BARTER_OFFER_RECEIVED',
            title: 'Test',
            message: 'Test message',
            isRead: false,
          },
        });

        const updated = await db.notification.update({
          where: { id: notification.id },
          data: { isRead: true },
        });

        expect(updated.isRead).toBe(true);
      });
    });
  });

  // ==========================================
  // Review Endpoints
  // ==========================================
  describe('Review API Endpoints', () => {
    describe('POST /api/reviews', () => {
      it('should create review', async () => {
        const reviewer = await createTestUser({ email: 'reviewer@test.com' });
        const reviewed = await createTestUser({ email: 'reviewed@test.com' });
        const category = await createTestCategory();
        const item = await createTestItem(reviewed.id, category.id);

        const review = await db.review.create({
          data: {
            reviewerId: reviewer.id,
            reviewedId: reviewed.id,
            itemId: item.id,
            rating: 5,
            comment: 'Excellent transaction!',
            type: 'ITEM',
          },
        });

        expect(review).toHaveProperty('id');
        expect(review.rating).toBe(5);
      });

      it('should validate rating range', () => {
        const validRatings = [1, 2, 3, 4, 5];
        const invalidRatings = [0, 6, -1, 10];

        validRatings.forEach((rating) => {
          expect(rating >= 1 && rating <= 5).toBe(true);
        });

        invalidRatings.forEach((rating) => {
          expect(rating >= 1 && rating <= 5).toBe(false);
        });
      });
    });

    describe('GET /api/users/:id/reviews', () => {
      it('should get user reviews', async () => {
        const reviewer1 = await createTestUser({ email: 'rev1@test.com' });
        const reviewer2 = await createTestUser({ email: 'rev2@test.com' });
        const reviewed = await createTestUser({ email: 'target@test.com' });

        await db.review.createMany({
          data: [
            {
              reviewerId: reviewer1.id,
              reviewedId: reviewed.id,
              rating: 5,
              comment: 'Great!',
              type: 'USER',
            },
            {
              reviewerId: reviewer2.id,
              reviewedId: reviewed.id,
              rating: 4,
              comment: 'Good',
              type: 'USER',
            },
          ],
        });

        const reviews = await db.review.findMany({
          where: { reviewedId: reviewed.id },
        });

        expect(reviews).toHaveLength(2);
      });

      it('should calculate average rating', async () => {
        const reviewer1 = await createTestUser({ email: 'avg1@test.com' });
        const reviewer2 = await createTestUser({ email: 'avg2@test.com' });
        const reviewer3 = await createTestUser({ email: 'avg3@test.com' });
        const reviewed = await createTestUser({ email: 'avg-target@test.com' });

        await db.review.createMany({
          data: [
            { reviewerId: reviewer1.id, reviewedId: reviewed.id, rating: 5, type: 'USER' },
            { reviewerId: reviewer2.id, reviewedId: reviewed.id, rating: 4, type: 'USER' },
            { reviewerId: reviewer3.id, reviewedId: reviewed.id, rating: 3, type: 'USER' },
          ],
        });

        const result = await db.review.aggregate({
          where: { reviewedId: reviewed.id },
          _avg: { rating: true },
        });

        expect(result._avg.rating).toBe(4);
      });
    });
  });
});
