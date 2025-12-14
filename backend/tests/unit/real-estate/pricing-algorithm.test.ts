/**
 * @fileoverview اختبارات خوارزمية التسعير العقاري
 * @description اختبارات شاملة لـ AVM (Automated Valuation Model)
 * @author Xchange Real Estate
 * @version 1.0.0
 */

import {
  estimatePropertyValue,
  PropertyInput,
  PriceEstimate,
} from '../../../src/services/real-estate/pricing-algorithm';

// Mock Prisma
jest.mock('../../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    property: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    propertyPrice: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

import prisma from '../../../src/lib/prisma';

describe('Pricing Algorithm (AVM)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Test Case 1: تقييم شقة أساسية
  // ============================================
  describe('Basic Apartment Valuation', () => {
    it('should estimate price for a basic apartment in Cairo', async () => {
      // Mock data
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.property.count as jest.Mock).mockResolvedValue(50);
      (prisma.propertyPrice.findFirst as jest.Mock).mockResolvedValue({
        pricePerSqmAvg: 25000,
        priceChangeMonthly: 2,
        rentalYieldAvg: 0.07,
      });

      const input: PropertyInput = {
        propertyType: 'APARTMENT',
        totalArea: 150,
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        condition: 'GOOD',
        features: [],
      };

      const result = await estimatePropertyValue(input);

      expect(result).toBeDefined();
      expect(result.estimatedPrice).toBeGreaterThan(0);
      expect(result.pricePerMeter).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(result.priceRange.min).toBeLessThan(result.priceRange.max);
      expect(result.marketDemand).toMatch(/^(HIGH|MEDIUM|LOW)$/);
    });

    it('should apply age adjustment for old building', async () => {
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.property.count as jest.Mock).mockResolvedValue(20);
      (prisma.propertyPrice.findFirst as jest.Mock).mockResolvedValue({
        pricePerSqmAvg: 25000,
        priceChangeMonthly: 0,
        rentalYieldAvg: 0.07,
      });

      const newBuilding: PropertyInput = {
        propertyType: 'APARTMENT',
        totalArea: 100,
        governorate: 'القاهرة',
        condition: 'NEW',
        buildingAge: 0,
        features: [],
      };

      const oldBuilding: PropertyInput = {
        ...newBuilding,
        condition: 'GOOD',
        buildingAge: 10,
      };

      const newResult = await estimatePropertyValue(newBuilding);
      const oldResult = await estimatePropertyValue(oldBuilding);

      // المبنى الجديد يجب أن يكون أغلى
      expect(newResult.estimatedPrice).toBeGreaterThan(oldResult.estimatedPrice);
    });
  });

  // ============================================
  // Test Case 2: تقييم فيلا
  // ============================================
  describe('Villa Valuation', () => {
    it('should estimate higher price for villa compared to apartment', async () => {
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.property.count as jest.Mock).mockResolvedValue(30);
      (prisma.propertyPrice.findFirst as jest.Mock).mockResolvedValue({
        pricePerSqmAvg: 30000,
        priceChangeMonthly: 1,
        rentalYieldAvg: 0.06,
      });

      const apartment: PropertyInput = {
        propertyType: 'APARTMENT',
        totalArea: 200,
        governorate: 'التجمع الخامس',
        condition: 'EXCELLENT',
        features: [],
      };

      const villa: PropertyInput = {
        ...apartment,
        propertyType: 'VILLA',
      };

      const apartmentResult = await estimatePropertyValue(apartment);
      const villaResult = await estimatePropertyValue(villa);

      // الفيلا يجب أن تكون أغلى من الشقة بنفس المساحة
      expect(villaResult.estimatedPrice).toBeGreaterThan(apartmentResult.estimatedPrice);
    });
  });

  // ============================================
  // Test Case 3: تأثير الموقع على السعر
  // ============================================
  describe('Location Impact', () => {
    it('should estimate higher price for premium locations', async () => {
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.property.count as jest.Mock).mockResolvedValue(25);
      (prisma.propertyPrice.findFirst as jest.Mock).mockResolvedValue(null);

      const cairoApartment: PropertyInput = {
        propertyType: 'APARTMENT',
        totalArea: 120,
        governorate: 'القاهرة',
        condition: 'GOOD',
        features: [],
      };

      const sahilApartment: PropertyInput = {
        ...cairoApartment,
        governorate: 'الساحل الشمالي',
      };

      const cairoResult = await estimatePropertyValue(cairoApartment);
      const sahilResult = await estimatePropertyValue(sahilApartment);

      // الساحل الشمالي أغلى من القاهرة
      expect(sahilResult.pricePerMeter).toBeGreaterThan(cairoResult.pricePerMeter);
    });

    it('should estimate lower price for Upper Egypt', async () => {
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.property.count as jest.Mock).mockResolvedValue(10);
      (prisma.propertyPrice.findFirst as jest.Mock).mockResolvedValue(null);

      const cairoApartment: PropertyInput = {
        propertyType: 'APARTMENT',
        totalArea: 100,
        governorate: 'القاهرة',
        condition: 'GOOD',
        features: [],
      };

      const assiutApartment: PropertyInput = {
        ...cairoApartment,
        governorate: 'أسيوط',
      };

      const cairoResult = await estimatePropertyValue(cairoApartment);
      const assiutResult = await estimatePropertyValue(assiutApartment);

      // أسيوط أرخص من القاهرة
      expect(assiutResult.pricePerMeter).toBeLessThan(cairoResult.pricePerMeter);
    });
  });

  // ============================================
  // Test Case 4: تأثير المميزات على السعر
  // ============================================
  describe('Features Impact', () => {
    it('should increase price with premium features', async () => {
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.property.count as jest.Mock).mockResolvedValue(20);
      (prisma.propertyPrice.findFirst as jest.Mock).mockResolvedValue({
        pricePerSqmAvg: 28000,
        priceChangeMonthly: 0,
        rentalYieldAvg: 0.07,
      });

      const basicApartment: PropertyInput = {
        propertyType: 'APARTMENT',
        totalArea: 150,
        governorate: 'الجيزة',
        condition: 'GOOD',
        features: [],
      };

      const premiumApartment: PropertyInput = {
        ...basicApartment,
        features: ['pool', 'gym', 'security', 'parking', 'elevator'],
      };

      const basicResult = await estimatePropertyValue(basicApartment);
      const premiumResult = await estimatePropertyValue(premiumApartment);

      // العقار المميز يجب أن يكون أغلى
      expect(premiumResult.estimatedPrice).toBeGreaterThan(basicResult.estimatedPrice);
      expect(premiumResult.breakdown.featuresAdjustment).toBeGreaterThan(0);
    });

    it('should include sea view premium', async () => {
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.property.count as jest.Mock).mockResolvedValue(15);
      (prisma.propertyPrice.findFirst as jest.Mock).mockResolvedValue({
        pricePerSqmAvg: 40000,
        priceChangeMonthly: 3,
        rentalYieldAvg: 0.05,
      });

      const regularApartment: PropertyInput = {
        propertyType: 'APARTMENT',
        totalArea: 100,
        governorate: 'الساحل الشمالي',
        condition: 'EXCELLENT',
        features: [],
      };

      const seaViewApartment: PropertyInput = {
        ...regularApartment,
        features: ['sea_view'],
      };

      const regularResult = await estimatePropertyValue(regularApartment);
      const seaViewResult = await estimatePropertyValue(seaViewApartment);

      // إطلالة البحر تزيد السعر
      expect(seaViewResult.estimatedPrice).toBeGreaterThan(regularResult.estimatedPrice);
    });
  });

  // ============================================
  // Test Case 5: تأثير الحالة على السعر
  // ============================================
  describe('Condition Impact', () => {
    it('should estimate different prices based on condition', async () => {
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.property.count as jest.Mock).mockResolvedValue(30);
      (prisma.propertyPrice.findFirst as jest.Mock).mockResolvedValue({
        pricePerSqmAvg: 25000,
        priceChangeMonthly: 0,
        rentalYieldAvg: 0.07,
      });

      const baseInput = {
        propertyType: 'APARTMENT' as const,
        totalArea: 100,
        governorate: 'القاهرة',
        features: [],
      };

      const newProperty = await estimatePropertyValue({ ...baseInput, condition: 'NEW' as const });
      const excellentProperty = await estimatePropertyValue({ ...baseInput, condition: 'EXCELLENT' as const });
      const goodProperty = await estimatePropertyValue({ ...baseInput, condition: 'GOOD' as const });
      const fairProperty = await estimatePropertyValue({ ...baseInput, condition: 'FAIR' as const });
      const poorProperty = await estimatePropertyValue({ ...baseInput, condition: 'POOR' as const });

      // الترتيب حسب الحالة
      expect(newProperty.estimatedPrice).toBeGreaterThan(excellentProperty.estimatedPrice);
      expect(excellentProperty.estimatedPrice).toBeGreaterThan(goodProperty.estimatedPrice);
      expect(goodProperty.estimatedPrice).toBeGreaterThan(fairProperty.estimatedPrice);
      expect(fairProperty.estimatedPrice).toBeGreaterThan(poorProperty.estimatedPrice);
    });
  });

  // ============================================
  // Test Case 6: استخدام العقارات المشابهة
  // ============================================
  describe('Comparable Properties', () => {
    it('should use comparable properties when available', async () => {
      const comparables = [
        { id: '1', salePrice: 3000000, pricePerSqm: 30000, areaSqm: 100, propertyType: 'APARTMENT', governorate: 'القاهرة', city: 'مدينة نصر', bedrooms: 3, bathrooms: 2, floorNumber: 5, finishingLevel: 'LUX', latitude: 30.06, longitude: 31.32, updatedAt: new Date() },
        { id: '2', salePrice: 2800000, pricePerSqm: 28000, areaSqm: 100, propertyType: 'APARTMENT', governorate: 'القاهرة', city: 'مدينة نصر', bedrooms: 3, bathrooms: 2, floorNumber: 4, finishingLevel: 'LUX', latitude: 30.06, longitude: 31.32, updatedAt: new Date() },
        { id: '3', salePrice: 3200000, pricePerSqm: 32000, areaSqm: 100, propertyType: 'APARTMENT', governorate: 'القاهرة', city: 'مدينة نصر', bedrooms: 3, bathrooms: 2, floorNumber: 6, finishingLevel: 'LUX', latitude: 30.06, longitude: 31.32, updatedAt: new Date() },
      ];

      (prisma.property.findMany as jest.Mock).mockResolvedValue(comparables);
      (prisma.property.count as jest.Mock).mockResolvedValue(15);
      (prisma.propertyPrice.findFirst as jest.Mock).mockResolvedValue(null);

      const input: PropertyInput = {
        propertyType: 'APARTMENT',
        totalArea: 100,
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        condition: 'GOOD',
        bedrooms: 3,
        features: [],
        latitude: 30.06,
        longitude: 31.32,
      };

      const result = await estimatePropertyValue(input);

      // يجب أن تكون الثقة أعلى مع وجود عقارات مشابهة
      expect(result.confidence).toBeGreaterThanOrEqual(50);
      // السعر يجب أن يكون قريب من متوسط المشابهات
      expect(result.estimatedPrice).toBeGreaterThan(2000000);
      expect(result.estimatedPrice).toBeLessThan(4000000);
    });
  });

  // ============================================
  // Test Case 7: الأداء
  // ============================================
  describe('Performance', () => {
    it('should complete estimation in under 500ms', async () => {
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.property.count as jest.Mock).mockResolvedValue(100);
      (prisma.propertyPrice.findFirst as jest.Mock).mockResolvedValue({
        pricePerSqmAvg: 25000,
        priceChangeMonthly: 1,
        rentalYieldAvg: 0.07,
      });

      const input: PropertyInput = {
        propertyType: 'APARTMENT',
        totalArea: 150,
        governorate: 'القاهرة',
        condition: 'GOOD',
        features: ['parking', 'elevator', 'security'],
      };

      const startTime = Date.now();
      await estimatePropertyValue(input);
      const executionTime = Date.now() - startTime;

      expect(executionTime).toBeLessThan(500);
    });
  });

  // ============================================
  // Test Case 8: نطاق السعر والثقة
  // ============================================
  describe('Price Range and Confidence', () => {
    it('should return valid price range', async () => {
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.property.count as jest.Mock).mockResolvedValue(40);
      (prisma.propertyPrice.findFirst as jest.Mock).mockResolvedValue({
        pricePerSqmAvg: 25000,
        priceChangeMonthly: 0,
        rentalYieldAvg: 0.07,
      });

      const input: PropertyInput = {
        propertyType: 'APARTMENT',
        totalArea: 100,
        governorate: 'القاهرة',
        condition: 'GOOD',
        features: [],
      };

      const result = await estimatePropertyValue(input);

      expect(result.priceRange.min).toBeLessThanOrEqual(result.estimatedPrice);
      expect(result.priceRange.max).toBeGreaterThanOrEqual(result.estimatedPrice);
      expect(result.priceRange.max - result.priceRange.min).toBeGreaterThan(0);
    });

    it('should provide breakdown of adjustments', async () => {
      (prisma.property.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.property.count as jest.Mock).mockResolvedValue(20);
      (prisma.propertyPrice.findFirst as jest.Mock).mockResolvedValue({
        pricePerSqmAvg: 30000,
        priceChangeMonthly: 2,
        rentalYieldAvg: 0.06,
      });

      const input: PropertyInput = {
        propertyType: 'VILLA',
        totalArea: 300,
        governorate: 'التجمع الخامس',
        condition: 'EXCELLENT',
        buildingAge: 2,
        floor: 0,
        furnishingType: 'FURNISHED',
        features: ['pool', 'garden', 'security'],
      };

      const result = await estimatePropertyValue(input);

      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.basePrice).toBeGreaterThan(0);
      expect(typeof result.breakdown.locationAdjustment).toBe('number');
      expect(typeof result.breakdown.ageAdjustment).toBe('number');
      expect(typeof result.breakdown.conditionAdjustment).toBe('number');
      expect(typeof result.breakdown.featuresAdjustment).toBe('number');
    });
  });
});
