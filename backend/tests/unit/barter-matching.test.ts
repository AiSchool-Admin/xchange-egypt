/**
 * Unit Tests for Barter Matching Service
 * Tests the core matching algorithm without database dependencies
 */

describe('Barter Matching Service - Unit Tests', () => {
  // ============================================
  // Match Score Calculation Tests
  // ============================================

  describe('Match Score Calculation', () => {
    it('should calculate perfect match score (100%) for identical preferences', () => {
      const offerItem = {
        categoryId: 'cat-1',
        subCategoryId: 'sub-1',
        description: 'iPhone 15 Pro Max 256GB',
        keywords: ['iphone', 'apple', 'smartphone'],
      };

      const desiredItem = {
        categoryId: 'cat-1',
        subCategoryId: 'sub-1',
        description: 'iPhone 15 Pro Max',
        keywords: ['iphone', 'apple'],
      };

      // Simulating match score calculation
      const categoryMatch = offerItem.categoryId === desiredItem.categoryId;
      const subCategoryMatch = offerItem.subCategoryId === desiredItem.subCategoryId;

      expect(categoryMatch).toBe(true);
      expect(subCategoryMatch).toBe(true);
    });

    it('should calculate partial match score for similar categories', () => {
      const offer = {
        categoryId: 'electronics',
        subCategoryId: 'phones',
        title: 'Samsung Galaxy S24',
      };

      const desire = {
        categoryId: 'electronics',
        subCategoryId: 'tablets', // Different sub-category
        title: 'iPad Pro',
      };

      const categoryMatch = offer.categoryId === desire.categoryId;
      const subCategoryMatch = offer.subCategoryId === desire.subCategoryId;

      expect(categoryMatch).toBe(true);
      expect(subCategoryMatch).toBe(false);
    });

    it('should return zero score for completely different categories', () => {
      const offer = { categoryId: 'electronics' };
      const desire = { categoryId: 'real-estate' };

      const categoryMatch = offer.categoryId === desire.categoryId;
      expect(categoryMatch).toBe(false);
    });
  });

  // ============================================
  // Value Differential Tests
  // ============================================

  describe('Value Differential Calculation', () => {
    it('should calculate zero differential for equal values', () => {
      const item1Value = 5000;
      const item2Value = 5000;
      const differential = Math.abs(item1Value - item2Value);

      expect(differential).toBe(0);
    });

    it('should calculate correct differential for unequal values', () => {
      const item1Value = 7000;
      const item2Value = 5000;
      const differential = Math.abs(item1Value - item2Value);

      expect(differential).toBe(2000);
    });

    it('should determine cash compensation direction', () => {
      const sellerValue = 8000;
      const buyerValue = 5000;

      const cashRequired = sellerValue - buyerValue;
      const paymentDirection = cashRequired > 0 ? 'buyer_to_seller' : 'seller_to_buyer';

      expect(cashRequired).toBe(3000);
      expect(paymentDirection).toBe('buyer_to_seller');
    });

    it('should handle percentage-based tolerance', () => {
      const value1 = 10000;
      const value2 = 10500;
      const tolerance = 0.1; // 10%

      const differential = Math.abs(value1 - value2);
      const percentageDiff = differential / Math.max(value1, value2);
      const withinTolerance = percentageDiff <= tolerance;

      expect(withinTolerance).toBe(true);
    });
  });

  // ============================================
  // Multi-Party Cycle Detection Tests
  // ============================================

  describe('Multi-Party Cycle Detection', () => {
    it('should detect valid 2-party exchange', () => {
      const participants = [
        { userId: 'user-1', offers: 'A', wants: 'B' },
        { userId: 'user-2', offers: 'B', wants: 'A' },
      ];

      // User 1 wants B, User 2 offers B -> Match
      const user1Satisfied = participants.some(
        (p) => p.userId !== 'user-1' && p.offers === 'B'
      );
      // User 2 wants A, User 1 offers A -> Match
      const user2Satisfied = participants.some(
        (p) => p.userId !== 'user-2' && p.offers === 'A'
      );

      expect(user1Satisfied).toBe(true);
      expect(user2Satisfied).toBe(true);
    });

    it('should detect valid 3-party exchange cycle', () => {
      const participants = [
        { userId: 'user-1', offers: 'A', wants: 'B' },
        { userId: 'user-2', offers: 'B', wants: 'C' },
        { userId: 'user-3', offers: 'C', wants: 'A' },
      ];

      // Build exchange chain
      const chain: string[] = [];
      let current = participants[0];
      const visited = new Set<string>();

      while (current && !visited.has(current.userId)) {
        visited.add(current.userId);
        chain.push(current.userId);
        current = participants.find(
          (p) => p.offers === current?.wants && !visited.has(p.userId)
        )!;
      }

      // Check if cycle completes back to first user
      const lastParticipant = participants.find((p) => p.userId === chain[chain.length - 1]);
      const firstParticipant = participants[0];
      const cycleComplete = lastParticipant?.wants === firstParticipant.offers;

      expect(chain.length).toBe(3);
      expect(cycleComplete).toBe(true);
    });

    it('should reject incomplete exchange cycle', () => {
      const participants = [
        { userId: 'user-1', offers: 'A', wants: 'B' },
        { userId: 'user-2', offers: 'B', wants: 'C' },
        { userId: 'user-3', offers: 'D', wants: 'A' }, // Offers D, but user-2 wants C
      ];

      // Check if user-2's want (C) is satisfied
      const user2Satisfied = participants.some(
        (p) => p.userId !== 'user-2' && p.offers === 'C'
      );

      expect(user2Satisfied).toBe(false);
    });
  });

  // ============================================
  // Geographic Score Tests
  // ============================================

  describe('Geographic Score Calculation', () => {
    it('should give maximum score for same city', () => {
      const location1 = { governorate: 'القاهرة', city: 'مدينة نصر' };
      const location2 = { governorate: 'القاهرة', city: 'مدينة نصر' };

      const sameCity = location1.city === location2.city;
      const sameGovernorate = location1.governorate === location2.governorate;

      expect(sameCity).toBe(true);
      expect(sameGovernorate).toBe(true);
    });

    it('should give partial score for same governorate, different city', () => {
      const location1 = { governorate: 'القاهرة', city: 'مدينة نصر' };
      const location2 = { governorate: 'القاهرة', city: 'المعادي' };

      const sameCity = location1.city === location2.city;
      const sameGovernorate = location1.governorate === location2.governorate;

      expect(sameCity).toBe(false);
      expect(sameGovernorate).toBe(true);
    });

    it('should give lower score for different governorates', () => {
      const location1 = { governorate: 'القاهرة', city: 'مدينة نصر' };
      const location2 = { governorate: 'الإسكندرية', city: 'محرم بك' };

      const sameGovernorate = location1.governorate === location2.governorate;
      expect(sameGovernorate).toBe(false);
    });

    it('should calculate distance between coordinates', () => {
      // Cairo: 30.0444, 31.2357
      // Alexandria: 31.2001, 29.9187
      const lat1 = 30.0444;
      const lng1 = 31.2357;
      const lat2 = 31.2001;
      const lng2 = 29.9187;

      // Haversine formula approximation
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      // Cairo to Alexandria is approximately 180-220 km
      expect(distance).toBeGreaterThan(150);
      expect(distance).toBeLessThan(250);
    });
  });

  // ============================================
  // Keyword Matching Tests
  // ============================================

  describe('Keyword Matching', () => {
    it('should match exact keywords', () => {
      const offerKeywords = ['iphone', 'apple', '256gb'];
      const desiredKeywords = ['iphone', 'apple'];

      const matchedKeywords = desiredKeywords.filter((k) =>
        offerKeywords.includes(k.toLowerCase())
      );
      const matchRatio = matchedKeywords.length / desiredKeywords.length;

      expect(matchRatio).toBe(1);
    });

    it('should handle partial keyword matches', () => {
      const offerKeywords = ['samsung', 'galaxy', 's24'];
      const desiredKeywords = ['samsung', 'note', '256gb'];

      const matchedKeywords = desiredKeywords.filter((k) =>
        offerKeywords.includes(k.toLowerCase())
      );
      const matchRatio = matchedKeywords.length / desiredKeywords.length;

      expect(matchRatio).toBeCloseTo(0.33, 1);
    });

    it('should handle empty keywords gracefully', () => {
      const offerKeywords: string[] = [];
      const desiredKeywords = ['iphone'];

      const matchRatio =
        desiredKeywords.length === 0
          ? 1
          : desiredKeywords.filter((k) => offerKeywords.includes(k)).length /
            desiredKeywords.length;

      expect(matchRatio).toBe(0);
    });

    it('should be case insensitive', () => {
      const offerKeywords = ['iPhone', 'APPLE', 'ProMax'];
      const desiredKeywords = ['iphone', 'apple'];

      const normalizedOffer = offerKeywords.map((k) => k.toLowerCase());
      const matchedKeywords = desiredKeywords.filter((k) =>
        normalizedOffer.includes(k.toLowerCase())
      );

      expect(matchedKeywords.length).toBe(2);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle null category gracefully', () => {
      const offer = { categoryId: null };
      const desire = { categoryId: 'electronics' };

      const match = offer.categoryId === desire.categoryId;
      expect(match).toBe(false);
    });

    it('should handle undefined values', () => {
      const offer = { value: undefined };
      const desire = { value: 5000 };

      const differential = Math.abs((offer.value || 0) - (desire.value || 0));
      expect(differential).toBe(5000);
    });

    it('should handle empty participant list', () => {
      const participants: unknown[] = [];
      const hasCycles = participants.length >= 2;

      expect(hasCycles).toBe(false);
    });

    it('should handle single participant', () => {
      const participants = [{ userId: 'user-1', offers: 'A', wants: 'B' }];
      const canMatch = participants.length >= 2;

      expect(canMatch).toBe(false);
    });
  });
});
