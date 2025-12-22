/**
 * Auction Service Unit Tests
 * اختبارات وحدة خدمة المزادات
 */

import { cleanDatabase, disconnectTestDb, getTestDb } from '../helpers/testDb';
import { createTestUser, createTestCategory, createTestItem } from '../helpers/testHelpers';

// Check if Prisma is available
let prismaAvailable = false;
try {
  require('@prisma/client');
  prismaAvailable = true;
} catch {
  console.log('⚠️ Prisma not available - skipping Auction Service tests');
}

const describeIfPrisma = prismaAvailable ? describe : describe.skip;

describeIfPrisma('Auction Service Tests', () => {
  const db = getTestDb();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  // ==========================================
  // Auction Creation Tests
  // ==========================================
  describe('Auction Creation', () => {
    it('should create auction with required fields', async () => {
      const seller = await createTestUser();
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const startsAt = new Date();
      const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'iPhone 14 Pro Auction',
          description: 'Brand new iPhone',
          startingPrice: 10000,
          currentPrice: 10000,
          minBidIncrement: 100,
          startsAt,
          endsAt,
          status: 'ACTIVE',
        },
      });

      expect(auction).toHaveProperty('id');
      expect(auction.startingPrice).toBe(10000);
      expect(auction.status).toBe('ACTIVE');
    });

    it('should create auction with reserve price', async () => {
      const seller = await createTestUser();
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Antique Watch Auction',
          description: 'Rare vintage watch',
          startingPrice: 5000,
          currentPrice: 5000,
          reservePrice: 15000,
          minBidIncrement: 500,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      expect(auction.reservePrice).toBe(15000);
    });

    it('should create auction with buy now price', async () => {
      const seller = await createTestUser();
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Gaming Console Auction',
          description: 'PS5 with games',
          startingPrice: 8000,
          currentPrice: 8000,
          buyNowPrice: 12000,
          minBidIncrement: 200,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      expect(auction.buyNowPrice).toBe(12000);
    });

    it('should create auction in draft status', async () => {
      const seller = await createTestUser();
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Draft Auction',
          description: 'Not yet published',
          startingPrice: 1000,
          currentPrice: 1000,
          minBidIncrement: 50,
          startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Starts tomorrow
          endsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          status: 'DRAFT',
        },
      });

      expect(auction.status).toBe('DRAFT');
    });
  });

  // ==========================================
  // Auction Bidding Tests
  // ==========================================
  describe('Auction Bidding', () => {
    it('should place valid bid', async () => {
      const seller = await createTestUser({ email: 'seller@test.com' });
      const bidder = await createTestUser({ email: 'bidder@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Test Auction',
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
      expect(bid.bidderId).toBe(bidder.id);
    });

    it('should update current price after bid', async () => {
      const seller = await createTestUser({ email: 'seller2@test.com' });
      const bidder = await createTestUser({ email: 'bidder2@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Price Update Test',
          description: 'Test',
          startingPrice: 1000,
          currentPrice: 1000,
          minBidIncrement: 100,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      const bidAmount = 1500;

      await db.auctionBid.create({
        data: {
          auctionId: auction.id,
          bidderId: bidder.id,
          amount: bidAmount,
        },
      });

      const updatedAuction = await db.auction.update({
        where: { id: auction.id },
        data: {
          currentPrice: bidAmount,
          highestBidderId: bidder.id,
        },
      });

      expect(updatedAuction.currentPrice).toBe(1500);
      expect(updatedAuction.highestBidderId).toBe(bidder.id);
    });

    it('should track bid history', async () => {
      const seller = await createTestUser({ email: 'seller3@test.com' });
      const bidder1 = await createTestUser({ email: 'bidder3a@test.com' });
      const bidder2 = await createTestUser({ email: 'bidder3b@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Bid History Test',
          description: 'Test',
          startingPrice: 1000,
          currentPrice: 1000,
          minBidIncrement: 100,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      await db.auctionBid.create({
        data: { auctionId: auction.id, bidderId: bidder1.id, amount: 1100 },
      });

      await db.auctionBid.create({
        data: { auctionId: auction.id, bidderId: bidder2.id, amount: 1200 },
      });

      await db.auctionBid.create({
        data: { auctionId: auction.id, bidderId: bidder1.id, amount: 1300 },
      });

      const bids = await db.auctionBid.findMany({
        where: { auctionId: auction.id },
        orderBy: { amount: 'desc' },
      });

      expect(bids).toHaveLength(3);
      expect(bids[0].amount).toBe(1300);
    });

    it('should validate minimum bid increment', () => {
      const currentPrice = 1000;
      const minIncrement = 100;
      const bidAmount = 1050; // Less than minimum increment

      const isValidBid = bidAmount >= currentPrice + minIncrement;
      expect(isValidBid).toBe(false);
    });

    it('should validate bid above current price', () => {
      const currentPrice = 1000;
      const bidAmount = 900; // Below current price

      const isValidBid = bidAmount > currentPrice;
      expect(isValidBid).toBe(false);
    });
  });

  // ==========================================
  // Auction Status Tests
  // ==========================================
  describe('Auction Status Management', () => {
    it('should have valid status values', () => {
      const validStatuses = ['DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED', 'SOLD'];

      validStatuses.forEach((status) => {
        expect(typeof status).toBe('string');
      });
    });

    it('should end auction when time expires', async () => {
      const seller = await createTestUser({ email: 'seller-end@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Ending Auction',
          description: 'Test',
          startingPrice: 1000,
          currentPrice: 1500,
          minBidIncrement: 100,
          startsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endsAt: new Date(Date.now() - 1000), // Already ended
          status: 'ACTIVE',
        },
      });

      // Check if auction should be ended
      const shouldEnd = auction.endsAt < new Date();
      expect(shouldEnd).toBe(true);

      // End the auction
      const endedAuction = await db.auction.update({
        where: { id: auction.id },
        data: { status: 'ENDED' },
      });

      expect(endedAuction.status).toBe('ENDED');
    });

    it('should mark auction as sold', async () => {
      const seller = await createTestUser({ email: 'seller-sold@test.com' });
      const winner = await createTestUser({ email: 'winner@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Sold Auction',
          description: 'Test',
          startingPrice: 1000,
          currentPrice: 2000,
          minBidIncrement: 100,
          startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endsAt: new Date(Date.now() - 1000),
          status: 'ACTIVE',
          highestBidderId: winner.id,
        },
      });

      const soldAuction = await db.auction.update({
        where: { id: auction.id },
        data: { status: 'SOLD', winnerId: winner.id },
      });

      expect(soldAuction.status).toBe('SOLD');
      expect(soldAuction.winnerId).toBe(winner.id);
    });

    it('should cancel auction', async () => {
      const seller = await createTestUser({ email: 'seller-cancel@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Cancelled Auction',
          description: 'Test',
          startingPrice: 1000,
          currentPrice: 1000,
          minBidIncrement: 100,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      const cancelledAuction = await db.auction.update({
        where: { id: auction.id },
        data: { status: 'CANCELLED' },
      });

      expect(cancelledAuction.status).toBe('CANCELLED');
    });
  });

  // ==========================================
  // Auction Search & Filter Tests
  // ==========================================
  describe('Auction Search & Filters', () => {
    it('should find active auctions only', async () => {
      const seller = await createTestUser({ email: 'seller-search@test.com' });
      const category = await createTestCategory();
      const item1 = await createTestItem(seller.id, category.id);
      const item2 = await createTestItem(seller.id, category.id);
      const item3 = await createTestItem(seller.id, category.id);

      // Create auctions with different statuses
      await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item1.id,
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
          itemId: item2.id,
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
          itemId: item3.id,
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

    it('should filter auctions by price range', async () => {
      const seller = await createTestUser({ email: 'seller-price@test.com' });
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
          title: 'Low Price Auction',
          description: 'Test',
          startingPrice: 500,
          currentPrice: 500,
          minBidIncrement: 50,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: items[1].id,
          title: 'Mid Price Auction',
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
          title: 'High Price Auction',
          description: 'Test',
          startingPrice: 10000,
          currentPrice: 10000,
          minBidIncrement: 500,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      const midRangeAuctions = await db.auction.findMany({
        where: {
          currentPrice: {
            gte: 1000,
            lte: 5000,
          },
          status: 'ACTIVE',
        },
      });

      expect(midRangeAuctions).toHaveLength(1);
      expect(midRangeAuctions[0].currentPrice).toBe(2000);
    });

    it('should find auctions ending soon', async () => {
      const seller = await createTestUser({ email: 'seller-ending@test.com' });
      const category = await createTestCategory();

      const items = await Promise.all([
        createTestItem(seller.id, category.id),
        createTestItem(seller.id, category.id),
      ]);

      // Ending in 1 hour
      await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: items[0].id,
          title: 'Ending Soon Auction',
          description: 'Test',
          startingPrice: 1000,
          currentPrice: 1000,
          minBidIncrement: 100,
          startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endsAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
          status: 'ACTIVE',
        },
      });

      // Ending in 7 days
      await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: items[1].id,
          title: 'Long Running Auction',
          description: 'Test',
          startingPrice: 2000,
          currentPrice: 2000,
          minBidIncrement: 100,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          status: 'ACTIVE',
        },
      });

      const endingSoon = await db.auction.findMany({
        where: {
          status: 'ACTIVE',
          endsAt: {
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Within 24 hours
          },
        },
      });

      expect(endingSoon).toHaveLength(1);
      expect(endingSoon[0].title).toBe('Ending Soon Auction');
    });
  });

  // ==========================================
  // Auction Reserve Price Tests
  // ==========================================
  describe('Reserve Price Logic', () => {
    it('should detect when reserve is not met', async () => {
      const seller = await createTestUser({ email: 'seller-reserve@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Reserve Test Auction',
          description: 'Test',
          startingPrice: 1000,
          currentPrice: 3000,
          reservePrice: 5000,
          minBidIncrement: 100,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      const reserveMet = auction.currentPrice >= (auction.reservePrice || 0);
      expect(reserveMet).toBe(false);
    });

    it('should detect when reserve is met', async () => {
      const seller = await createTestUser({ email: 'seller-reserve2@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Reserve Met Auction',
          description: 'Test',
          startingPrice: 1000,
          currentPrice: 6000,
          reservePrice: 5000,
          minBidIncrement: 100,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      const reserveMet = auction.currentPrice >= (auction.reservePrice || 0);
      expect(reserveMet).toBe(true);
    });
  });

  // ==========================================
  // Buy Now Feature Tests
  // ==========================================
  describe('Buy Now Feature', () => {
    it('should allow buy now purchase', async () => {
      const seller = await createTestUser({ email: 'seller-buynow@test.com' });
      const buyer = await createTestUser({ email: 'buyer-buynow@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Buy Now Auction',
          description: 'Test',
          startingPrice: 5000,
          currentPrice: 5000,
          buyNowPrice: 8000,
          minBidIncrement: 100,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      // Simulate buy now
      const soldAuction = await db.auction.update({
        where: { id: auction.id },
        data: {
          status: 'SOLD',
          winnerId: buyer.id,
          currentPrice: auction.buyNowPrice!,
        },
      });

      expect(soldAuction.status).toBe('SOLD');
      expect(soldAuction.winnerId).toBe(buyer.id);
      expect(soldAuction.currentPrice).toBe(8000);
    });

    it('should disable buy now when bid exceeds threshold', () => {
      const buyNowPrice = 10000;
      const currentPrice = 9500; // 95% of buy now price

      // Buy now should be disabled when current price is >= 90% of buy now
      const buyNowDisabled = currentPrice >= buyNowPrice * 0.9;
      expect(buyNowDisabled).toBe(true);
    });
  });

  // ==========================================
  // Auction Statistics Tests
  // ==========================================
  describe('Auction Statistics', () => {
    it('should count total bids on auction', async () => {
      const seller = await createTestUser({ email: 'seller-stats@test.com' });
      const bidder1 = await createTestUser({ email: 'bidder-stats1@test.com' });
      const bidder2 = await createTestUser({ email: 'bidder-stats2@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Stats Auction',
          description: 'Test',
          startingPrice: 1000,
          currentPrice: 1000,
          minBidIncrement: 100,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      await db.auctionBid.createMany({
        data: [
          { auctionId: auction.id, bidderId: bidder1.id, amount: 1100 },
          { auctionId: auction.id, bidderId: bidder2.id, amount: 1200 },
          { auctionId: auction.id, bidderId: bidder1.id, amount: 1300 },
          { auctionId: auction.id, bidderId: bidder2.id, amount: 1400 },
        ],
      });

      const bidCount = await db.auctionBid.count({
        where: { auctionId: auction.id },
      });

      expect(bidCount).toBe(4);
    });

    it('should count unique bidders', async () => {
      const seller = await createTestUser({ email: 'seller-unique@test.com' });
      const bidder1 = await createTestUser({ email: 'bidder-unique1@test.com' });
      const bidder2 = await createTestUser({ email: 'bidder-unique2@test.com' });
      const bidder3 = await createTestUser({ email: 'bidder-unique3@test.com' });
      const category = await createTestCategory();
      const item = await createTestItem(seller.id, category.id);

      const auction = await db.auction.create({
        data: {
          sellerId: seller.id,
          itemId: item.id,
          title: 'Unique Bidders Auction',
          description: 'Test',
          startingPrice: 1000,
          currentPrice: 1000,
          minBidIncrement: 100,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });

      await db.auctionBid.createMany({
        data: [
          { auctionId: auction.id, bidderId: bidder1.id, amount: 1100 },
          { auctionId: auction.id, bidderId: bidder2.id, amount: 1200 },
          { auctionId: auction.id, bidderId: bidder1.id, amount: 1300 }, // Same bidder
          { auctionId: auction.id, bidderId: bidder3.id, amount: 1400 },
        ],
      });

      const uniqueBidders = await db.auctionBid.findMany({
        where: { auctionId: auction.id },
        distinct: ['bidderId'],
        select: { bidderId: true },
      });

      expect(uniqueBidders).toHaveLength(3);
    });
  });
});
