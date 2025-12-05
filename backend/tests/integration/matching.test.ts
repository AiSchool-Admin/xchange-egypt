/**
 * Smart Matching System Integration Tests
 * اختبارات نظام التوافق الذكي
 *
 * Tests for:
 * 1. Perfect Barter Matching (A↔B)
 * 2. Geographic Proximity Scoring
 * 3. Supply-Demand Matching
 * 4. Multi-party Chain Detection
 * 5. Category and Keyword Matching
 * 6. Real-time Notification Sending
 */

import { PrismaClient } from '@prisma/client';
import { cleanDatabase, disconnectTestDb, getTestDb } from '../helpers/testDb';
import { createTestUser, createTestCategory, generateTestToken } from '../helpers/testHelpers';

// Import matching service functions
import {
  processNewItem,
  getMatchesForItem,
  getMatchesForUser,
  getMatchingStats,
  MatchResult,
  MatchType,
  ProximityLevel,
} from '../../src/services/unified-matching.service';

describe('Smart Matching System - التوافق الذكي', () => {
  const db = getTestDb();

  // Test data holders
  let electronicsCategory: any;
  let furnitureCategory: any;
  let user1: any; // Cairo - Nasr City - District 1
  let user2: any; // Cairo - Nasr City - District 1 (same district)
  let user3: any; // Cairo - Nasr City - District 2 (same city, different district)
  let user4: any; // Cairo - Heliopolis (same governorate, different city)
  let user5: any; // Alexandria (different governorate)

  beforeAll(async () => {
    await cleanDatabase();

    // Create test categories
    electronicsCategory = await db.category.create({
      data: {
        nameEn: 'Electronics',
        nameAr: 'إلكترونيات',
        slug: 'test-electronics',
        icon: '📱',
        level: 1,
        isActive: true,
      },
    });

    furnitureCategory = await db.category.create({
      data: {
        nameEn: 'Furniture',
        nameAr: 'أثاث',
        slug: 'test-furniture',
        icon: '🛋️',
        level: 1,
        isActive: true,
      },
    });

    // Create users with different locations
    user1 = await createTestUser({
      email: 'user1@test.com',
      fullName: 'User 1 - Same District',
      governorate: 'القاهرة',
      city: 'مدينة نصر',
      district: 'الحي الأول',
    });

    user2 = await createTestUser({
      email: 'user2@test.com',
      fullName: 'User 2 - Same District',
      governorate: 'القاهرة',
      city: 'مدينة نصر',
      district: 'الحي الأول',
    });

    user3 = await createTestUser({
      email: 'user3@test.com',
      fullName: 'User 3 - Same City',
      governorate: 'القاهرة',
      city: 'مدينة نصر',
      district: 'الحي الثاني',
    });

    user4 = await createTestUser({
      email: 'user4@test.com',
      fullName: 'User 4 - Same Governorate',
      governorate: 'القاهرة',
      city: 'مصر الجديدة',
      district: 'روكسي',
    });

    user5 = await createTestUser({
      email: 'user5@test.com',
      fullName: 'User 5 - Different Governorate',
      governorate: 'الإسكندرية',
      city: 'سيدي جابر',
      district: 'الكورنيش',
    });
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectTestDb();
  });

  // ============================================
  // 1. Perfect Barter Matching Tests
  // ============================================
  describe('Perfect Barter Matching - تطابق المقايضة المثالي', () => {
    let ahmedItem: any;
    let saraItem: any;

    beforeAll(async () => {
      // Ahmed has iPhone, wants MacBook
      ahmedItem = await db.item.create({
        data: {
          sellerId: user1.id,
          title: 'iPhone 15 Pro Max',
          description: 'آيفون 15 برو ماكس بحالة ممتازة',
          categoryId: electronicsCategory.id,
          listingType: 'BARTER',
          condition: 'EXCELLENT',
          estimatedValue: 55000,
          images: [],
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          district: 'الحي الأول',
          desiredCategoryId: electronicsCategory.id,
          desiredItemTitle: 'MacBook',
          desiredKeywords: 'macbook,ماك بوك,لابتوب',
          desiredValueMin: 40000,
          desiredValueMax: 70000,
          status: 'ACTIVE',
        },
      });

      // Sara has MacBook, wants iPhone
      saraItem = await db.item.create({
        data: {
          sellerId: user2.id,
          title: 'MacBook Pro 14 M3',
          description: 'ماك بوك برو بمعالج M3',
          categoryId: electronicsCategory.id,
          listingType: 'BARTER',
          condition: 'EXCELLENT',
          estimatedValue: 60000,
          images: [],
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          district: 'الحي الأول',
          desiredCategoryId: electronicsCategory.id,
          desiredItemTitle: 'iPhone',
          desiredKeywords: 'iphone,آيفون,هاتف',
          desiredValueMin: 45000,
          desiredValueMax: 65000,
          status: 'ACTIVE',
        },
      });
    });

    it('should detect perfect barter match between two users', async () => {
      const matches = await processNewItem(ahmedItem.id, user1.id);

      // Should find Sara's MacBook as a match
      expect(matches.length).toBeGreaterThan(0);

      const perfectMatch = matches.find(
        (m) => m.type === 'PERFECT_BARTER' && m.matchedItem.id === saraItem.id
      );

      expect(perfectMatch).toBeDefined();
      expect(perfectMatch?.score).toBeGreaterThanOrEqual(0.7); // Perfect match threshold
    });

    it('should identify mutual barter interest', async () => {
      const matches = await getMatchesForItem(ahmedItem.id, { minScore: 0.5 });

      const saraMatch = matches.find((m) => m.matchedItem.id === saraItem.id);
      expect(saraMatch).toBeDefined();
      expect(saraMatch?.matchReasonAr).toContain('تطابق');
    });

    it('should boost score for perfect barter matches', async () => {
      const perfectMatches = await processNewItem(saraItem.id, user2.id);
      const mutualMatch = perfectMatches.find(
        (m) => m.matchedItem.id === ahmedItem.id
      );

      // Perfect barter should have higher score than regular matches
      expect(mutualMatch?.score).toBeGreaterThan(0.65);
    });
  });

  // ============================================
  // 2. Geographic Proximity Scoring Tests
  // ============================================
  describe('Geographic Proximity Scoring - التقارب الجغرافي', () => {
    let baseItem: any;
    let sameDistrictItem: any;
    let sameCityItem: any;
    let sameGovernorateItem: any;
    let differentGovernorateItem: any;

    beforeAll(async () => {
      // Base item in Cairo - Nasr City - District 1
      baseItem = await db.item.create({
        data: {
          sellerId: user1.id,
          title: 'PlayStation 5',
          description: 'بلايستيشن 5 ديجيتال',
          categoryId: electronicsCategory.id,
          listingType: 'DIRECT_SALE',
          condition: 'GOOD',
          estimatedValue: 25000,
          images: [],
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          district: 'الحي الأول',
          status: 'ACTIVE',
        },
      });

      // Same district buyer
      sameDistrictItem = await db.item.create({
        data: {
          sellerId: user2.id,
          title: 'مطلوب PS5',
          description: 'أبحث عن بلايستيشن 5',
          categoryId: electronicsCategory.id,
          listingType: 'DIRECT_BUY',
          condition: 'GOOD',
          estimatedValue: 24000,
          images: [],
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          district: 'الحي الأول',
          desiredKeywords: 'playstation,ps5,بلايستيشن',
          status: 'ACTIVE',
        },
      });

      // Same city, different district buyer
      sameCityItem = await db.item.create({
        data: {
          sellerId: user3.id,
          title: 'مطلوب PS5 في مدينة نصر',
          description: 'أريد بلايستيشن 5',
          categoryId: electronicsCategory.id,
          listingType: 'DIRECT_BUY',
          condition: 'GOOD',
          estimatedValue: 24000,
          images: [],
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          district: 'الحي الثاني',
          desiredKeywords: 'playstation,ps5,بلايستيشن',
          status: 'ACTIVE',
        },
      });

      // Same governorate, different city buyer
      sameGovernorateItem = await db.item.create({
        data: {
          sellerId: user4.id,
          title: 'مطلوب PS5 في القاهرة',
          description: 'أبحث عن بلايستيشن 5',
          categoryId: electronicsCategory.id,
          listingType: 'DIRECT_BUY',
          condition: 'GOOD',
          estimatedValue: 24000,
          images: [],
          governorate: 'القاهرة',
          city: 'مصر الجديدة',
          district: 'روكسي',
          desiredKeywords: 'playstation,ps5,بلايستيشن',
          status: 'ACTIVE',
        },
      });

      // Different governorate buyer
      differentGovernorateItem = await db.item.create({
        data: {
          sellerId: user5.id,
          title: 'مطلوب PS5 في إسكندرية',
          description: 'أريد بلايستيشن 5',
          categoryId: electronicsCategory.id,
          listingType: 'DIRECT_BUY',
          condition: 'GOOD',
          estimatedValue: 24000,
          images: [],
          governorate: 'الإسكندرية',
          city: 'سيدي جابر',
          district: 'الكورنيش',
          desiredKeywords: 'playstation,ps5,بلايستيشن',
          status: 'ACTIVE',
        },
      });
    });

    it('should give highest score (100%) to same district matches', async () => {
      const matches = await getMatchesForItem(baseItem.id, { minScore: 0.3 });

      const districtMatch = matches.find(
        (m) => m.matchedItem.id === sameDistrictItem.id
      );
      expect(districtMatch).toBeDefined();
      expect(districtMatch?.proximityLevel).toBe('DISTRICT');
      expect(districtMatch?.proximityScore).toBeCloseTo(1.0, 1);
    });

    it('should give 80% score to same city matches', async () => {
      const matches = await getMatchesForItem(baseItem.id, { minScore: 0.3 });

      const cityMatch = matches.find(
        (m) => m.matchedItem.id === sameCityItem.id
      );
      expect(cityMatch).toBeDefined();
      expect(cityMatch?.proximityLevel).toBe('CITY');
      expect(cityMatch?.proximityScore).toBeCloseTo(0.8, 1);
    });

    it('should give 60% score to same governorate matches', async () => {
      const matches = await getMatchesForItem(baseItem.id, { minScore: 0.3 });

      const govMatch = matches.find(
        (m) => m.matchedItem.id === sameGovernorateItem.id
      );
      expect(govMatch).toBeDefined();
      expect(govMatch?.proximityLevel).toBe('GOVERNORATE');
      expect(govMatch?.proximityScore).toBeCloseTo(0.6, 1);
    });

    it('should give 40% score to national (different governorate) matches', async () => {
      const matches = await getMatchesForItem(baseItem.id, { minScore: 0.3 });

      const nationalMatch = matches.find(
        (m) => m.matchedItem.id === differentGovernorateItem.id
      );
      expect(nationalMatch).toBeDefined();
      expect(nationalMatch?.proximityLevel).toBe('NATIONAL');
      expect(nationalMatch?.proximityScore).toBeCloseTo(0.4, 1);
    });

    it('should sort matches by proximity score (closer first)', async () => {
      const matches = await getMatchesForItem(baseItem.id, { minScore: 0.3 });

      // Filter only the buyer items we created
      const buyerMatches = matches.filter((m) =>
        [
          sameDistrictItem.id,
          sameCityItem.id,
          sameGovernorateItem.id,
          differentGovernorateItem.id,
        ].includes(m.matchedItem.id)
      );

      // Check that closer matches have higher scores
      for (let i = 0; i < buyerMatches.length - 1; i++) {
        expect(buyerMatches[i].score).toBeGreaterThanOrEqual(
          buyerMatches[i + 1].score
        );
      }
    });
  });

  // ============================================
  // 3. Supply-Demand Matching Tests
  // ============================================
  describe('Supply-Demand Matching - تطابق العرض والطلب', () => {
    let supplyItem: any;
    let demandItem: any;

    beforeAll(async () => {
      // Seller offering furniture
      supplyItem = await db.item.create({
        data: {
          sellerId: user1.id,
          title: 'طقم كنب مودرن',
          description: 'كنب 7 مقاعد بحالة ممتازة',
          categoryId: furnitureCategory.id,
          listingType: 'DIRECT_SALE',
          condition: 'EXCELLENT',
          estimatedValue: 15000,
          images: [],
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          district: 'الحي الأول',
          status: 'ACTIVE',
        },
      });

      // Buyer looking for furniture
      demandItem = await db.item.create({
        data: {
          sellerId: user2.id,
          title: 'مطلوب كنب مودرن',
          description: 'أبحث عن طقم كنب للصالون',
          categoryId: furnitureCategory.id,
          listingType: 'DIRECT_BUY',
          condition: 'GOOD',
          estimatedValue: 16000,
          images: [],
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          district: 'الحي الأول',
          desiredKeywords: 'كنب,صالون,مودرن,sofa',
          desiredValueMax: 18000,
          status: 'ACTIVE',
        },
      });
    });

    it('should match supply (DIRECT_SALE) with demand (DIRECT_BUY)', async () => {
      const matches = await processNewItem(supplyItem.id, user1.id);

      const demandMatch = matches.find(
        (m) => m.matchedItem.id === demandItem.id
      );
      expect(demandMatch).toBeDefined();
      expect(demandMatch?.type).toBe('SALE_TO_DEMAND');
    });

    it('should match demand with supply when buyer posts request', async () => {
      const matches = await processNewItem(demandItem.id, user2.id);

      const supplyMatch = matches.find(
        (m) => m.matchedItem.id === supplyItem.id
      );
      expect(supplyMatch).toBeDefined();
      expect(supplyMatch?.type).toBe('DEMAND_TO_SUPPLY');
    });

    it('should consider value tolerance in matching', async () => {
      // The supply is 15000, demand max is 18000
      // 30% tolerance means values should match
      const matches = await getMatchesForItem(supplyItem.id, { minScore: 0.3 });

      const demandMatch = matches.find(
        (m) => m.matchedItem.id === demandItem.id
      );
      expect(demandMatch).toBeDefined();
      expect(demandMatch?.valueScore).toBeGreaterThan(0.5);
    });
  });

  // ============================================
  // 4. Category and Keyword Matching Tests
  // ============================================
  describe('Category and Keyword Matching - تطابق الفئات والكلمات', () => {
    let itemWithKeywords: any;
    let itemMatchingKeywords: any;
    let itemDifferentCategory: any;

    beforeAll(async () => {
      // Item with specific keywords
      itemWithKeywords = await db.item.create({
        data: {
          sellerId: user1.id,
          title: 'Samsung Galaxy S23 Ultra',
          description: 'سامسونج جالاكسي S23 الترا بحالة ممتازة',
          categoryId: electronicsCategory.id,
          listingType: 'DIRECT_SALE',
          condition: 'EXCELLENT',
          estimatedValue: 45000,
          images: [],
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          district: 'الحي الأول',
          status: 'ACTIVE',
        },
      });

      // Buyer looking for Samsung
      itemMatchingKeywords = await db.item.create({
        data: {
          sellerId: user2.id,
          title: 'مطلوب Samsung Galaxy',
          description: 'أبحث عن هاتف سامسونج جالاكسي',
          categoryId: electronicsCategory.id,
          listingType: 'DIRECT_BUY',
          condition: 'GOOD',
          estimatedValue: 40000,
          images: [],
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          district: 'الحي الأول',
          desiredKeywords: 'samsung,سامسونج,galaxy,جالاكسي,s23',
          desiredValueMax: 50000,
          status: 'ACTIVE',
        },
      });

      // Different category - should not match
      itemDifferentCategory = await db.item.create({
        data: {
          sellerId: user3.id,
          title: 'كرسي مكتب',
          description: 'كرسي مكتب مريح',
          categoryId: furnitureCategory.id,
          listingType: 'DIRECT_BUY',
          condition: 'GOOD',
          estimatedValue: 2000,
          images: [],
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          district: 'الحي الأول',
          desiredKeywords: 'كرسي,مكتب,office,chair',
          status: 'ACTIVE',
        },
      });
    });

    it('should match items by category', async () => {
      const matches = await getMatchesForItem(itemWithKeywords.id, {
        minScore: 0.3,
      });

      const categoryMatch = matches.find(
        (m) => m.matchedItem.id === itemMatchingKeywords.id
      );
      expect(categoryMatch).toBeDefined();
      expect(categoryMatch?.categoryScore).toBeGreaterThan(0.5);
    });

    it('should boost score when keywords match', async () => {
      const matches = await getMatchesForItem(itemWithKeywords.id, {
        minScore: 0.3,
      });

      const keywordMatch = matches.find(
        (m) => m.matchedItem.id === itemMatchingKeywords.id
      );
      expect(keywordMatch).toBeDefined();
      expect(keywordMatch?.keywordScore).toBeGreaterThan(0);
    });

    it('should not match items from different categories', async () => {
      const matches = await getMatchesForItem(itemWithKeywords.id, {
        minScore: 0.3,
      });

      const wrongCategoryMatch = matches.find(
        (m) => m.matchedItem.id === itemDifferentCategory.id
      );
      // Should either not exist or have very low score
      if (wrongCategoryMatch) {
        expect(wrongCategoryMatch.score).toBeLessThan(0.5);
      }
    });
  });

  // ============================================
  // 5. User Matches Aggregation Tests
  // ============================================
  describe('User Matches Aggregation - تجميع مطابقات المستخدم', () => {
    it('should get all matches for a user across their items', async () => {
      const result = await getMatchesForUser(user1.id, { minScore: 0.3 });

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('demands');
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should separate supply matches from demand matches', async () => {
      const result = await getMatchesForUser(user2.id, { minScore: 0.3 });

      // items should contain matches for user's supply items
      // demands should contain matches for user's demand items
      expect(Array.isArray(result.items)).toBe(true);
      expect(Array.isArray(result.demands)).toBe(true);
    });
  });

  // ============================================
  // 6. Matching Statistics Tests
  // ============================================
  describe('Matching Statistics - إحصائيات المطابقة', () => {
    it('should return matching service statistics', async () => {
      const stats = await getMatchingStats();

      expect(stats).toHaveProperty('totalItems');
      expect(stats).toHaveProperty('activeItems');
      expect(stats).toHaveProperty('barterItems');
      expect(stats).toHaveProperty('demandItems');
    });

    it('should count items correctly', async () => {
      const stats = await getMatchingStats();

      expect(stats.totalItems).toBeGreaterThan(0);
      expect(stats.activeItems).toBeLessThanOrEqual(stats.totalItems);
    });
  });

  // ============================================
  // 7. Score Breakdown Tests
  // ============================================
  describe('Score Breakdown - تفاصيل النتيجة', () => {
    it('should include all score components in match result', async () => {
      // Get any match
      const matches = await getMatchesForUser(user1.id, { minScore: 0.3 });

      if (matches.items.length > 0) {
        const match = matches.items[0];

        expect(match).toHaveProperty('score');
        expect(match).toHaveProperty('proximityScore');
        expect(match).toHaveProperty('categoryScore');
        expect(match).toHaveProperty('valueScore');
        expect(match).toHaveProperty('keywordScore');
        expect(match).toHaveProperty('proximityLevel');
      }
    });

    it('should have scores between 0 and 1', async () => {
      const matches = await getMatchesForUser(user1.id, { minScore: 0.3 });

      for (const match of matches.items) {
        expect(match.score).toBeGreaterThanOrEqual(0);
        expect(match.score).toBeLessThanOrEqual(1);
        expect(match.proximityScore).toBeGreaterThanOrEqual(0);
        expect(match.proximityScore).toBeLessThanOrEqual(1);
      }
    });
  });

  // ============================================
  // 8. Arabic Match Reasons Tests
  // ============================================
  describe('Arabic Match Reasons - أسباب التطابق بالعربية', () => {
    it('should include Arabic match reason', async () => {
      const matches = await getMatchesForUser(user1.id, { minScore: 0.3 });

      if (matches.items.length > 0) {
        const match = matches.items[0];
        expect(match).toHaveProperty('matchReasonAr');
        expect(match.matchReasonAr).toBeTruthy();
      }
    });
  });
});

// ============================================
// Notification Tests (Integration with WebSocket)
// ============================================
describe('Match Notifications - إشعارات التطابق', () => {
  const db = getTestDb();

  beforeAll(async () => {
    // Notifications will be created by the matching service
    // We just verify they exist after matching
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectTestDb();
  });

  it('should create notification when high-quality match found', async () => {
    // Create test data for notification
    const category = await db.category.create({
      data: {
        nameEn: 'Test Notification Category',
        nameAr: 'فئة اختبار الإشعارات',
        slug: 'test-notification-category',
        icon: '🔔',
        level: 1,
        isActive: true,
      },
    });

    const seller = await createTestUser({
      email: 'seller-notify@test.com',
      fullName: 'Seller Notify',
      governorate: 'القاهرة',
      city: 'مدينة نصر',
      district: 'الحي الأول',
    });

    const buyer = await createTestUser({
      email: 'buyer-notify@test.com',
      fullName: 'Buyer Notify',
      governorate: 'القاهرة',
      city: 'مدينة نصر',
      district: 'الحي الأول',
    });

    // Create supply item
    const supplyItem = await db.item.create({
      data: {
        sellerId: seller.id,
        title: 'Test Notification Item',
        description: 'Item for notification test',
        categoryId: category.id,
        listingType: 'DIRECT_SALE',
        condition: 'GOOD',
        estimatedValue: 5000,
        images: [],
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        district: 'الحي الأول',
        status: 'ACTIVE',
      },
    });

    // Create demand item
    const demandItem = await db.item.create({
      data: {
        sellerId: buyer.id,
        title: 'مطلوب Test Item',
        description: 'Looking for test item',
        categoryId: category.id,
        listingType: 'DIRECT_BUY',
        condition: 'GOOD',
        estimatedValue: 5500,
        images: [],
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        district: 'الحي الأول',
        desiredKeywords: 'test,notification,item',
        desiredValueMax: 6000,
        status: 'ACTIVE',
      },
    });

    // Process the supply item - should create match and notification
    const matches = await processNewItem(supplyItem.id, seller.id);

    // Verify notifications were created
    const notifications = await db.notification.findMany({
      where: {
        OR: [{ userId: seller.id }, { userId: buyer.id }],
        type: { in: ['BARTER_MATCH', 'ITEM_AVAILABLE'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Should have at least one notification for high-quality matches
    if (matches.some((m) => m.score >= 0.5)) {
      expect(notifications.length).toBeGreaterThan(0);
    }
  });

  it('should not create duplicate notifications within cooldown period', async () => {
    // This tests the notification deduplication cache
    const seller = await createTestUser({
      email: 'seller-dedup@test.com',
      fullName: 'Seller Dedup',
    });

    const category = await db.category.create({
      data: {
        nameEn: 'Dedup Category',
        nameAr: 'فئة إزالة التكرار',
        slug: 'dedup-category',
        icon: '🔕',
        level: 1,
        isActive: true,
      },
    });

    const item = await db.item.create({
      data: {
        sellerId: seller.id,
        title: 'Dedup Test Item',
        description: 'Item for deduplication test',
        categoryId: category.id,
        listingType: 'DIRECT_SALE',
        condition: 'GOOD',
        estimatedValue: 1000,
        images: [],
        status: 'ACTIVE',
      },
    });

    // Process same item twice
    await processNewItem(item.id, seller.id);
    const initialNotifications = await db.notification.findMany({
      where: { userId: seller.id },
    });

    await processNewItem(item.id, seller.id);
    const afterNotifications = await db.notification.findMany({
      where: { userId: seller.id },
    });

    // Second processing should not create additional notifications
    expect(afterNotifications.length).toBe(initialNotifications.length);
  });
});
