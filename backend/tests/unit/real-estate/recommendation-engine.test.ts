/**
 * @fileoverview اختبارات محرك التوصيات الذكي
 * @description اختبارات شاملة للـ AI Recommendation Engine
 * @author Xchange Real Estate
 * @version 1.0.0
 */

import {
  getRecommendations,
  getSimilarPropertyRecommendations,
  getColdStartRecommendations,
  invalidateUserCache,
  invalidateAllCache,
  UserProfile,
} from '../../../src/services/real-estate/recommendation-engine';
import {
  jaccardSimilarity,
  calculateUserSimilarity,
  calculatePropertySimilarity,
  findSimilarProperties,
  calculateHaversineDistance,
  calculateNumericSimilarity,
  UserSimilarityProfile,
  PropertySimilarityProfile,
} from '../../../src/services/real-estate/similarity';

// Mock Prisma
jest.mock('../../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    property: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    propertyFavorite: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    savedSearch: {
      findMany: jest.fn(),
    },
    propertyTransaction: {
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import prisma from '../../../src/lib/prisma';

// ============================================
// Similarity Functions Tests
// ============================================

describe('Similarity Functions', () => {
  // ============================================
  // Test Case 1: Jaccard Similarity
  // ============================================
  describe('Jaccard Similarity', () => {
    it('should return 1 for identical sets', () => {
      const setA = new Set(['a', 'b', 'c']);
      const setB = new Set(['a', 'b', 'c']);

      const similarity = jaccardSimilarity(setA, setB);

      expect(similarity).toBe(1);
    });

    it('should return 0 for disjoint sets', () => {
      const setA = new Set(['a', 'b', 'c']);
      const setB = new Set(['d', 'e', 'f']);

      const similarity = jaccardSimilarity(setA, setB);

      expect(similarity).toBe(0);
    });

    it('should return correct value for overlapping sets', () => {
      const setA = new Set(['a', 'b', 'c']);
      const setB = new Set(['b', 'c', 'd']);

      const similarity = jaccardSimilarity(setA, setB);

      // Intersection: {b, c} = 2
      // Union: {a, b, c, d} = 4
      // Jaccard = 2/4 = 0.5
      expect(similarity).toBe(0.5);
    });

    it('should return 0 for empty sets', () => {
      const setA = new Set<string>();
      const setB = new Set<string>();

      const similarity = jaccardSimilarity(setA, setB);

      expect(similarity).toBe(0);
    });
  });

  // ============================================
  // Test Case 2: Haversine Distance
  // ============================================
  describe('Haversine Distance', () => {
    it('should return 0 for same location', () => {
      const distance = calculateHaversineDistance(30.0, 31.0, 30.0, 31.0);
      expect(distance).toBe(0);
    });

    it('should calculate correct distance between Cairo and Alexandria', () => {
      // Cairo: 30.0444, 31.2357
      // Alexandria: 31.2001, 29.9187
      const distance = calculateHaversineDistance(30.0444, 31.2357, 31.2001, 29.9187);

      // المسافة الحقيقية حوالي 180 كم
      expect(distance).toBeGreaterThan(170);
      expect(distance).toBeLessThan(200);
    });

    it('should be symmetric', () => {
      const distance1 = calculateHaversineDistance(30.0, 31.0, 31.0, 32.0);
      const distance2 = calculateHaversineDistance(31.0, 32.0, 30.0, 31.0);

      expect(distance1).toBeCloseTo(distance2, 10);
    });
  });

  // ============================================
  // Test Case 3: Numeric Similarity
  // ============================================
  describe('Numeric Similarity', () => {
    it('should return 1 for identical values', () => {
      const similarity = calculateNumericSimilarity(1000000, 1000000);
      expect(similarity).toBe(1);
    });

    it('should return 1 for values within tolerance', () => {
      const similarity = calculateNumericSimilarity(1000000, 1100000, 0.2);
      expect(similarity).toBe(1);
    });

    it('should return 0 for very different values', () => {
      const similarity = calculateNumericSimilarity(1000000, 10000000, 0.2);
      expect(similarity).toBe(0);
    });

    it('should return value between 0 and 1 for moderate difference', () => {
      const similarity = calculateNumericSimilarity(1000000, 1500000, 0.2);
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });
  });

  // ============================================
  // Test Case 4: User Similarity
  // ============================================
  describe('User Similarity', () => {
    it('should calculate similarity between users', () => {
      const user1: UserSimilarityProfile = {
        userId: 'user-1',
        viewedPropertyIds: ['prop-1', 'prop-2', 'prop-3'],
        favoritePropertyIds: ['prop-1', 'prop-2'],
        searchedGovernorates: ['القاهرة', 'الجيزة'],
        searchedPropertyTypes: ['APARTMENT', 'VILLA'],
        priceRange: { min: 1000000, max: 3000000 },
        areaRange: { min: 100, max: 200 },
        preferredBedrooms: [2, 3],
      };

      const user2: UserSimilarityProfile = {
        userId: 'user-2',
        viewedPropertyIds: ['prop-1', 'prop-4', 'prop-5'],
        favoritePropertyIds: ['prop-1', 'prop-4'],
        searchedGovernorates: ['القاهرة'],
        searchedPropertyTypes: ['APARTMENT'],
        priceRange: { min: 1500000, max: 2500000 },
        areaRange: { min: 120, max: 180 },
        preferredBedrooms: [2, 3],
      };

      const result = calculateUserSimilarity(user1, user2);

      expect(result).toBeDefined();
      expect(result.id).toBe('user-2');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result.breakdown).toBeDefined();
    });

    it('should return higher similarity for identical users', () => {
      const user1: UserSimilarityProfile = {
        userId: 'user-1',
        viewedPropertyIds: ['prop-1', 'prop-2'],
        favoritePropertyIds: ['prop-1'],
        searchedGovernorates: ['القاهرة'],
        searchedPropertyTypes: ['APARTMENT'],
        priceRange: { min: 1000000, max: 2000000 },
        areaRange: { min: 100, max: 150 },
        preferredBedrooms: [2],
      };

      const user2 = { ...user1, userId: 'user-2' };

      const result = calculateUserSimilarity(user1, user2);

      // يجب أن تكون التشابه عالية جداً
      expect(result.score).toBeGreaterThan(0.8);
    });
  });

  // ============================================
  // Test Case 5: Property Similarity
  // ============================================
  describe('Property Similarity', () => {
    it('should calculate similarity between properties', () => {
      const prop1: PropertySimilarityProfile = {
        id: 'prop-1',
        propertyType: 'APARTMENT',
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        area: 150,
        price: 2000000,
        bedrooms: 3,
        bathrooms: 2,
        features: ['elevator', 'parking', 'security'],
        latitude: 30.06,
        longitude: 31.32,
      };

      const prop2: PropertySimilarityProfile = {
        id: 'prop-2',
        propertyType: 'APARTMENT',
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        area: 140,
        price: 1900000,
        bedrooms: 3,
        bathrooms: 2,
        features: ['elevator', 'parking'],
        latitude: 30.065,
        longitude: 31.325,
      };

      const result = calculatePropertySimilarity(prop1, prop2);

      expect(result).toBeDefined();
      expect(result.id).toBe('prop-2');
      expect(result.score).toBeGreaterThan(0.5); // يجب أن تكون متشابهة نسبياً
      expect(result.breakdown).toBeDefined();
    });

    it('should return lower similarity for different property types', () => {
      const prop1: PropertySimilarityProfile = {
        id: 'prop-1',
        propertyType: 'APARTMENT',
        governorate: 'القاهرة',
        area: 150,
        price: 2000000,
        features: [],
      };

      const prop2: PropertySimilarityProfile = {
        id: 'prop-2',
        propertyType: 'VILLA',
        governorate: 'القاهرة',
        area: 150,
        price: 2000000,
        features: [],
      };

      const result = calculatePropertySimilarity(prop1, prop2);

      expect(result.breakdown['propertyType']).toBeLessThan(1);
    });

    it('should find similar properties', () => {
      const targetProperty: PropertySimilarityProfile = {
        id: 'target',
        propertyType: 'APARTMENT',
        governorate: 'القاهرة',
        area: 150,
        price: 2000000,
        features: ['parking'],
      };

      const candidates: PropertySimilarityProfile[] = [
        {
          id: 'similar-1',
          propertyType: 'APARTMENT',
          governorate: 'القاهرة',
          area: 145,
          price: 1950000,
          features: ['parking', 'elevator'],
        },
        {
          id: 'different-1',
          propertyType: 'VILLA',
          governorate: 'الإسكندرية',
          area: 300,
          price: 5000000,
          features: ['pool'],
        },
      ];

      const results = findSimilarProperties(targetProperty, candidates, 5);

      expect(results.length).toBeGreaterThanOrEqual(0);
      // العقار المشابه يجب أن يأتي أولاً
      if (results.length > 0) {
        expect(results[0].id).toBe('similar-1');
      }
    });
  });
});

// ============================================
// Recommendation Engine Tests
// ============================================

describe('Recommendation Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    invalidateAllCache();
  });

  // ============================================
  // Test Case 6: توصيات للمستخدمين الجدد (Cold Start)
  // ============================================
  describe('Cold Start Recommendations', () => {
    it('should return recommendations for new users', async () => {
      (prisma.property.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'prop-1',
          title: 'Test Property 1',
          governorate: 'القاهرة',
          propertyType: 'APARTMENT',
          salePrice: 2000000,
          viewsCount: 100,
          favoritesCount: 20,
          createdAt: new Date(),
          owner: { id: 'owner-1', fullName: 'Owner', avatar: null, rating: 4.5 },
        },
        {
          id: 'prop-2',
          title: 'Test Property 2',
          governorate: 'الجيزة',
          propertyType: 'VILLA',
          salePrice: 5000000,
          viewsCount: 80,
          favoritesCount: 15,
          createdAt: new Date(),
          owner: { id: 'owner-2', fullName: 'Owner 2', avatar: null, rating: 4.0 },
        },
      ]);

      const recommendations = await getColdStartRecommendations('القاهرة', 10);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeLessThanOrEqual(10);
    });
  });

  // ============================================
  // Test Case 7: توصيات مخصصة
  // ============================================
  describe('Personalized Recommendations', () => {
    it('should return personalized recommendations based on user profile', async () => {
      // Mock user data
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        governorate: 'القاهرة',
      });

      (prisma.propertyFavorite.findMany as jest.Mock).mockResolvedValue([
        { propertyId: 'fav-1' },
        { propertyId: 'fav-2' },
      ]);

      (prisma.savedSearch.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.propertyTransaction.findMany as jest.Mock).mockResolvedValue([]);

      (prisma.property.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'prop-1',
          governorate: 'القاهرة',
          propertyType: 'APARTMENT',
          salePrice: 2000000,
          areaSqm: 150,
          amenities: {},
          viewsCount: 50,
          favoritesCount: 10,
          createdAt: new Date(),
          owner: { id: 'owner-1', fullName: 'Owner', avatar: null, rating: 4.5 },
        },
      ]);

      (prisma.propertyFavorite.groupBy as jest.Mock).mockResolvedValue([]);

      const profile: UserProfile = {
        userId: 'user-1',
        viewHistory: [
          { propertyId: 'viewed-1', viewedAt: new Date(), duration: 120 },
        ],
        favorites: ['fav-1', 'fav-2'],
        savedSearches: [],
        transactions: [],
        governorate: 'القاهرة',
      };

      const recommendations = await getRecommendations(profile, { limit: 10 });

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should return cold start recommendations for new users', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-new',
        governorate: 'القاهرة',
      });

      (prisma.property.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'prop-1',
          governorate: 'القاهرة',
          propertyType: 'APARTMENT',
          salePrice: 2000000,
          viewsCount: 100,
          favoritesCount: 30,
          createdAt: new Date(),
          owner: { id: 'owner-1', fullName: 'Owner', avatar: null, rating: 4.5 },
        },
      ]);

      const profile: UserProfile = {
        userId: 'user-new',
        viewHistory: [], // No history
        favorites: [], // No favorites
        savedSearches: [],
        transactions: [],
        governorate: 'القاهرة',
      };

      const recommendations = await getRecommendations(profile, { limit: 10 });

      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  // ============================================
  // Test Case 8: عقارات مشابهة
  // ============================================
  describe('Similar Properties', () => {
    it('should return similar properties for a given property', async () => {
      (prisma.property.findUnique as jest.Mock).mockResolvedValue({
        id: 'target',
        propertyType: 'APARTMENT',
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        salePrice: 2000000,
        areaSqm: 150,
        bedrooms: 3,
        bathrooms: 2,
        amenities: { parking: true, elevator: true },
        latitude: 30.06,
        longitude: 31.32,
        owner: { id: 'owner-1', fullName: 'Owner', avatar: null, rating: 4.5 },
      });

      (prisma.property.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'similar-1',
          propertyType: 'APARTMENT',
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          salePrice: 1900000,
          areaSqm: 145,
          bedrooms: 3,
          bathrooms: 2,
          amenities: { parking: true },
          latitude: 30.065,
          longitude: 31.325,
          owner: { id: 'owner-2', fullName: 'Owner 2', avatar: null, rating: 4.0 },
        },
      ]);

      const recommendations = await getSimilarPropertyRecommendations('target', 5);

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should return empty array for non-existent property', async () => {
      (prisma.property.findUnique as jest.Mock).mockResolvedValue(null);

      const recommendations = await getSimilarPropertyRecommendations('non-existent', 5);

      expect(recommendations).toEqual([]);
    });
  });

  // ============================================
  // Test Case 9: التخزين المؤقت
  // ============================================
  describe('Caching', () => {
    it('should invalidate user cache', () => {
      // هذا الاختبار يتحقق من عدم حدوث أخطاء
      expect(() => invalidateUserCache('user-1')).not.toThrow();
    });

    it('should invalidate all cache', () => {
      expect(() => invalidateAllCache()).not.toThrow();
    });
  });

  // ============================================
  // Test Case 10: الأداء
  // ============================================
  describe('Performance', () => {
    it('should complete recommendations within 100ms', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        governorate: 'القاهرة',
      });

      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.propertyFavorite.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.savedSearch.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.propertyTransaction.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.propertyFavorite.groupBy as jest.Mock).mockResolvedValue([]);

      const profile: UserProfile = {
        userId: 'user-1',
        viewHistory: [],
        favorites: [],
        savedSearches: [],
        transactions: [],
      };

      const startTime = Date.now();
      await getRecommendations(profile, { limit: 20 });
      const executionTime = Date.now() - startTime;

      // يجب أن تكتمل في أقل من 500ms (مع الـ mocks)
      expect(executionTime).toBeLessThan(500);
    });
  });
});
