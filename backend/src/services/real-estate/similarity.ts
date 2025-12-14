/**
 * @fileoverview خوارزميات التشابه للمستخدمين والعناصر
 * @description حساب تشابه المستخدمين والعقارات لنظام التوصيات
 * @author Xchange Real Estate
 * @version 1.0.0
 */

import { PropertyType, FinishingLevel } from '@prisma/client';

// ============================================
// Types & Interfaces
// ============================================

/**
 * ملف تعريف المستخدم للتشابه
 */
export interface UserSimilarityProfile {
  userId: string;
  viewedPropertyIds: string[];
  favoritePropertyIds: string[];
  searchedGovernorates: string[];
  searchedPropertyTypes: PropertyType[];
  priceRange: { min: number; max: number };
  areaRange: { min: number; max: number };
  preferredBedrooms: number[];
}

/**
 * ملف تعريف العقار للتشابه
 */
export interface PropertySimilarityProfile {
  id: string;
  propertyType: PropertyType;
  governorate: string;
  city?: string;
  area: number;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  finishingLevel?: FinishingLevel;
  features: string[];
  latitude?: number;
  longitude?: number;
}

/**
 * نتيجة تشابه
 */
export interface SimilarityResult {
  id: string;
  score: number;
  breakdown: Record<string, number>;
}

// ============================================
// User Similarity Functions
// ============================================

/**
 * حساب تشابه Jaccard بين مجموعتين
 * @param setA المجموعة الأولى
 * @param setB المجموعة الثانية
 * @returns معامل Jaccard (0-1)
 */
export function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

/**
 * حساب تشابه المستخدمين
 * @param user1 المستخدم الأول
 * @param user2 المستخدم الثاني
 * @returns درجة التشابه (0-1)
 */
export function calculateUserSimilarity(
  user1: UserSimilarityProfile,
  user2: UserSimilarityProfile
): SimilarityResult {
  const breakdown: Record<string, number> = {};
  let totalWeight = 0;
  let weightedScore = 0;

  // 1. تشابه العقارات المشاهدة (وزن 25%)
  const viewedSimilarity = jaccardSimilarity(
    new Set(user1.viewedPropertyIds),
    new Set(user2.viewedPropertyIds)
  );
  breakdown['viewed'] = viewedSimilarity;
  weightedScore += viewedSimilarity * 0.25;
  totalWeight += 0.25;

  // 2. تشابه المفضلات (وزن 35%)
  const favoriteSimilarity = jaccardSimilarity(
    new Set(user1.favoritePropertyIds),
    new Set(user2.favoritePropertyIds)
  );
  breakdown['favorites'] = favoriteSimilarity;
  weightedScore += favoriteSimilarity * 0.35;
  totalWeight += 0.35;

  // 3. تشابه المناطق المفضلة (وزن 15%)
  const governorateSimilarity = jaccardSimilarity(
    new Set(user1.searchedGovernorates),
    new Set(user2.searchedGovernorates)
  );
  breakdown['governorates'] = governorateSimilarity;
  weightedScore += governorateSimilarity * 0.15;
  totalWeight += 0.15;

  // 4. تشابه أنواع العقارات (وزن 10%)
  const typeSimilarity = jaccardSimilarity(
    new Set(user1.searchedPropertyTypes),
    new Set(user2.searchedPropertyTypes)
  );
  breakdown['propertyTypes'] = typeSimilarity;
  weightedScore += typeSimilarity * 0.10;
  totalWeight += 0.10;

  // 5. تشابه نطاق السعر (وزن 10%)
  const priceSimilarity = calculateRangeSimilarity(
    user1.priceRange.min, user1.priceRange.max,
    user2.priceRange.min, user2.priceRange.max
  );
  breakdown['priceRange'] = priceSimilarity;
  weightedScore += priceSimilarity * 0.10;
  totalWeight += 0.10;

  // 6. تشابه نطاق المساحة (وزن 5%)
  const areaSimilarity = calculateRangeSimilarity(
    user1.areaRange.min, user1.areaRange.max,
    user2.areaRange.min, user2.areaRange.max
  );
  breakdown['areaRange'] = areaSimilarity;
  weightedScore += areaSimilarity * 0.05;
  totalWeight += 0.05;

  const finalScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

  return {
    id: user2.userId,
    score: finalScore,
    breakdown,
  };
}

/**
 * حساب تشابه نطاقين
 * @param min1 الحد الأدنى للنطاق الأول
 * @param max1 الحد الأقصى للنطاق الأول
 * @param min2 الحد الأدنى للنطاق الثاني
 * @param max2 الحد الأقصى للنطاق الثاني
 * @returns درجة التشابه (0-1)
 */
export function calculateRangeSimilarity(
  min1: number,
  max1: number,
  min2: number,
  max2: number
): number {
  if (max1 < min2 || max2 < min1) return 0; // لا تداخل

  const overlapStart = Math.max(min1, min2);
  const overlapEnd = Math.min(max1, max2);
  const overlap = Math.max(0, overlapEnd - overlapStart);

  const unionStart = Math.min(min1, min2);
  const unionEnd = Math.max(max1, max2);
  const union = unionEnd - unionStart;

  return union > 0 ? overlap / union : 0;
}

/**
 * إيجاد المستخدمين المشابهين
 * @param targetUser المستخدم المستهدف
 * @param allUsers جميع المستخدمين
 * @param limit عدد النتائج
 * @returns قائمة المستخدمين المشابهين
 */
export function findSimilarUsers(
  targetUser: UserSimilarityProfile,
  allUsers: UserSimilarityProfile[],
  limit: number = 20
): SimilarityResult[] {
  const similarities = allUsers
    .filter(user => user.userId !== targetUser.userId)
    .map(user => calculateUserSimilarity(targetUser, user))
    .filter(result => result.score > 0.1) // الحد الأدنى للتشابه
    .sort((a, b) => b.score - a.score);

  return similarities.slice(0, limit);
}

// ============================================
// Property Similarity Functions
// ============================================

/**
 * حساب تشابه العقارات
 * @param prop1 العقار الأول
 * @param prop2 العقار الثاني
 * @returns درجة التشابه (0-1)
 */
export function calculatePropertySimilarity(
  prop1: PropertySimilarityProfile,
  prop2: PropertySimilarityProfile
): SimilarityResult {
  const breakdown: Record<string, number> = {};
  let weightedScore = 0;

  // 1. تطابق نوع العقار (وزن 20%)
  const typeSimilarity = prop1.propertyType === prop2.propertyType ? 1 : 0.3;
  breakdown['propertyType'] = typeSimilarity;
  weightedScore += typeSimilarity * 0.20;

  // 2. تشابه الموقع (وزن 35%)
  let locationSimilarity = 0;
  if (prop1.governorate === prop2.governorate) {
    locationSimilarity = 0.6;
    if (prop1.city && prop2.city && prop1.city === prop2.city) {
      locationSimilarity = 0.8;
    }
    // إضافة نقاط للقرب الجغرافي
    if (prop1.latitude && prop1.longitude && prop2.latitude && prop2.longitude) {
      const distance = calculateHaversineDistance(
        prop1.latitude, prop1.longitude,
        prop2.latitude, prop2.longitude
      );
      if (distance <= 1) locationSimilarity = 1;
      else if (distance <= 3) locationSimilarity = Math.max(locationSimilarity, 0.9);
      else if (distance <= 5) locationSimilarity = Math.max(locationSimilarity, 0.85);
    }
  }
  breakdown['location'] = locationSimilarity;
  weightedScore += locationSimilarity * 0.35;

  // 3. تشابه السعر (وزن 20%)
  const priceSimilarity = calculateNumericSimilarity(prop1.price, prop2.price, 0.3);
  breakdown['price'] = priceSimilarity;
  weightedScore += priceSimilarity * 0.20;

  // 4. تشابه المساحة (وزن 10%)
  const areaSimilarity = calculateNumericSimilarity(prop1.area, prop2.area, 0.25);
  breakdown['area'] = areaSimilarity;
  weightedScore += areaSimilarity * 0.10;

  // 5. تشابه عدد الغرف (وزن 5%)
  let bedroomSimilarity = 1;
  if (prop1.bedrooms !== undefined && prop2.bedrooms !== undefined) {
    const bedroomDiff = Math.abs(prop1.bedrooms - prop2.bedrooms);
    bedroomSimilarity = Math.max(0, 1 - bedroomDiff * 0.25);
  }
  breakdown['bedrooms'] = bedroomSimilarity;
  weightedScore += bedroomSimilarity * 0.05;

  // 6. تشابه المميزات (وزن 10%)
  const featureSimilarity = jaccardSimilarity(
    new Set(prop1.features.map(f => f.toLowerCase())),
    new Set(prop2.features.map(f => f.toLowerCase()))
  );
  breakdown['features'] = featureSimilarity;
  weightedScore += featureSimilarity * 0.10;

  return {
    id: prop2.id,
    score: weightedScore,
    breakdown,
  };
}

/**
 * حساب المسافة بين نقطتين (Haversine)
 * @param lat1 خط عرض النقطة الأولى
 * @param lon1 خط طول النقطة الأولى
 * @param lat2 خط عرض النقطة الثانية
 * @param lon2 خط طول النقطة الثانية
 * @returns المسافة بالكيلومتر
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * حساب تشابه قيمتين رقميتين
 * @param val1 القيمة الأولى
 * @param val2 القيمة الثانية
 * @param tolerance نسبة التسامح
 * @returns درجة التشابه (0-1)
 */
export function calculateNumericSimilarity(
  val1: number,
  val2: number,
  tolerance: number = 0.2
): number {
  if (val1 === 0 && val2 === 0) return 1;
  if (val1 === 0 || val2 === 0) return 0;

  const diff = Math.abs(val1 - val2);
  const avg = (val1 + val2) / 2;
  const ratio = diff / avg;

  if (ratio <= tolerance) return 1;
  if (ratio >= 1) return 0;

  // تدرج خطي بين tolerance و 1
  return 1 - (ratio - tolerance) / (1 - tolerance);
}

/**
 * إيجاد العقارات المشابهة
 * @param targetProperty العقار المستهدف
 * @param allProperties جميع العقارات
 * @param limit عدد النتائج
 * @returns قائمة العقارات المشابهة
 */
export function findSimilarProperties(
  targetProperty: PropertySimilarityProfile,
  allProperties: PropertySimilarityProfile[],
  limit: number = 10
): SimilarityResult[] {
  const similarities = allProperties
    .filter(prop => prop.id !== targetProperty.id)
    .map(prop => calculatePropertySimilarity(targetProperty, prop))
    .filter(result => result.score > 0.3) // الحد الأدنى للتشابه
    .sort((a, b) => b.score - a.score);

  return similarities.slice(0, limit);
}

// ============================================
// Cosine Similarity
// ============================================

/**
 * حساب تشابه Cosine بين متجهين
 * @param vec1 المتجه الأول
 * @param vec2 المتجه الثاني
 * @returns درجة التشابه (-1 إلى 1)
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  if (norm1 === 0 || norm2 === 0) return 0;

  return dotProduct / (norm1 * norm2);
}

/**
 * تحويل ملف تعريف العقار إلى متجه
 * @param property العقار
 * @param featureList قائمة المميزات المعيارية
 * @returns متجه الخصائص
 */
export function propertyToVector(
  property: PropertySimilarityProfile,
  featureList: string[]
): number[] {
  const vector: number[] = [];

  // تطبيع السعر (بفرض نطاق 0-10 مليون)
  vector.push(Math.min(property.price / 10000000, 1));

  // تطبيع المساحة (بفرض نطاق 0-1000 م²)
  vector.push(Math.min(property.area / 1000, 1));

  // عدد الغرف (بفرض نطاق 0-10)
  vector.push((property.bedrooms || 0) / 10);

  // عدد الحمامات (بفرض نطاق 0-5)
  vector.push((property.bathrooms || 0) / 5);

  // المميزات (one-hot encoding)
  const propertyFeatures = new Set(property.features.map(f => f.toLowerCase()));
  for (const feature of featureList) {
    vector.push(propertyFeatures.has(feature.toLowerCase()) ? 1 : 0);
  }

  return vector;
}

// ============================================
// Exports
// ============================================

export default {
  jaccardSimilarity,
  calculateUserSimilarity,
  calculateRangeSimilarity,
  findSimilarUsers,
  calculatePropertySimilarity,
  calculateHaversineDistance,
  calculateNumericSimilarity,
  findSimilarProperties,
  cosineSimilarity,
  propertyToVector,
};
