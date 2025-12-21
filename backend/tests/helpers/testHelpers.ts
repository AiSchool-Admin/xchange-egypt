/**
 * Test Helper Functions
 * Common utilities for testing
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getTestDb } from './testDb';

// Type definitions for user enums
type UserType = 'INDIVIDUAL' | 'BUSINESS' | 'ADMIN';
type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';

/**
 * Generate a test JWT token
 */
export const generateTestToken = (userId: string, userType: UserType = 'INDIVIDUAL') => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(
    {
      userId,
      userType,
      iat: Math.floor(Date.now() / 1000),
    },
    secret,
    { expiresIn: '1h' }
  );
};

/**
 * Create a test user
 */
export const createTestUser = async (overrides: any = {}) => {
  const db = getTestDb();

  // Generate unique identifiers for phone and email
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  // Normalize field names to camelCase
  const normalized = { ...overrides };
  if ('full_name' in normalized) {
    normalized.fullName = normalized.full_name;
    delete normalized.full_name;
  }
  if ('user_type' in normalized) {
    normalized.userType = normalized.user_type;
    delete normalized.user_type;
  }
  if ('password_hash' in normalized) {
    normalized.passwordHash = normalized.password_hash;
    delete normalized.password_hash;
  }
  if ('email_verified' in normalized) {
    normalized.emailVerified = normalized.email_verified;
    delete normalized.email_verified;
  }
  if ('phone_verified' in normalized) {
    normalized.phoneVerified = normalized.phone_verified;
    delete normalized.phone_verified;
  }

  const defaultData = {
    email: `test-${uniqueId}@example.com`,
    passwordHash: await bcrypt.hash('Test123!@#', 10),
    fullName: 'Test User',
    phone: `+20${Math.floor(1000000000 + Math.random() * 900000000)}`,
    userType: 'INDIVIDUAL' as UserType,
    status: 'ACTIVE' as UserStatus,
    emailVerified: true,
    phoneVerified: true,
    governorate: normalized.governorate || null,
    city: normalized.city || null,
    district: normalized.district || null,
    ...normalized,
  };

  const user = await db.user.create({
    data: defaultData,
  });

  // Return with both camelCase and snake_case for compatibility
  return {
    ...user,
    full_name: user.fullName,
    user_type: user.userType,
    password_hash: user.passwordHash,
    email_verified: user.emailVerified,
    phone_verified: user.phoneVerified,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
};

/**
 * Create a test admin user
 */
export const createTestAdmin = async (overrides: any = {}) => {
  return createTestUser({
    user_type: 'ADMIN',
    full_name: 'Test Admin',
    email: `admin-${Date.now()}@example.com`,
    ...overrides,
  });
};

/**
 * Create test category
 * Supports both camelCase (nameEn, parentId) and snake_case (name_en, parent_id) field names
 */
export const createTestCategory = async (overrides: any = {}) => {
  const db = getTestDb();

  // Normalize field names to camelCase
  const normalized = { ...overrides };
  if ('name_en' in normalized) {
    normalized.nameEn = normalized.name_en;
    delete normalized.name_en;
  }
  if ('name_ar' in normalized) {
    normalized.nameAr = normalized.name_ar;
    delete normalized.name_ar;
  }
  if ('parent_id' in normalized) {
    normalized.parentId = normalized.parent_id;
    delete normalized.parent_id;
  }
  if ('is_active' in normalized) {
    normalized.isActive = normalized.is_active;
    delete normalized.is_active;
  }
  if ('description_en' in normalized) {
    normalized.descriptionEn = normalized.description_en;
    delete normalized.description_en;
  }
  if ('description_ar' in normalized) {
    normalized.descriptionAr = normalized.description_ar;
    delete normalized.description_ar;
  }

  const defaultData = {
    nameEn: `Test Category ${Date.now()}`,
    nameAr: `فئة تجريبية ${Date.now()}`,
    slug: `test-category-${Date.now()}`,
    icon: '📦',
    level: 1,
    isActive: true,
    ...normalized,
  };

  // Store with both camelCase and snake_case in the database for compatibility
  const dataWithBothCases = {
    ...defaultData,
    name_en: defaultData.nameEn,
    name_ar: defaultData.nameAr,
    parent_id: defaultData.parentId,
    is_active: defaultData.isActive,
    description_en: defaultData.descriptionEn,
    description_ar: defaultData.descriptionAr,
  };

  const category = await db.category.create({
    data: dataWithBothCases,
  });

  return category;
};

/**
 * Create test item
 */
export const createTestItem = async (userId: string, categoryId: string, overrides: any = {}) => {
  const db = getTestDb();

  const item = await db.item.create({
    data: {
      sellerId: userId,
      categoryId: categoryId,
      title: `Test Item ${Date.now()}`,
      description: 'Test item description',
      condition: 'GOOD',
      estimatedValue: 1000,
      listingType: 'DIRECT_SALE',
      images: [],
      governorate: overrides.governorate || 'القاهرة',
      city: overrides.city || 'مدينة نصر',
      district: overrides.district || 'الحي الأول',
      status: 'ACTIVE',
      ...overrides,
    },
  });

  return item;
};

/**
 * Create test barter item with preferences
 */
export const createTestBarterItem = async (
  userId: string,
  categoryId: string,
  desiredCategoryId: string,
  overrides: any = {}
) => {
  const db = getTestDb();

  const item = await db.item.create({
    data: {
      sellerId: userId,
      categoryId: categoryId,
      title: `Test Barter Item ${Date.now()}`,
      description: 'Test barter item for exchange',
      condition: 'GOOD',
      estimatedValue: 5000,
      listingType: 'BARTER',
      images: [],
      governorate: overrides.governorate || 'القاهرة',
      city: overrides.city || 'مدينة نصر',
      district: overrides.district || 'الحي الأول',
      desiredCategoryId: desiredCategoryId,
      desiredItemTitle: overrides.desiredItemTitle || null,
      desiredKeywords: overrides.desiredKeywords || null,
      desiredValueMin: overrides.desiredValueMin || null,
      desiredValueMax: overrides.desiredValueMax || null,
      status: 'ACTIVE',
      ...overrides,
    },
  });

  return item;
};

/**
 * Create test demand item (DIRECT_BUY)
 */
export const createTestDemandItem = async (
  userId: string,
  categoryId: string,
  overrides: any = {}
) => {
  const db = getTestDb();

  const item = await db.item.create({
    data: {
      sellerId: userId,
      categoryId: categoryId,
      title: `مطلوب: ${overrides.title || 'Test Item'}`,
      description: overrides.description || 'Looking for this item',
      condition: 'GOOD',
      estimatedValue: overrides.estimatedValue || 5000,
      listingType: 'DIRECT_BUY',
      images: [],
      governorate: overrides.governorate || 'القاهرة',
      city: overrides.city || 'مدينة نصر',
      district: overrides.district || 'الحي الأول',
      desiredKeywords: overrides.desiredKeywords || null,
      desiredValueMax: overrides.desiredValueMax || null,
      status: 'ACTIVE',
      ...overrides,
    },
  });

  return item;
};

/**
 * Create test listing
 */
export const createTestListing = async (overrides: any = {}) => {
  const db = getTestDb();

  const listing = await db.listing.create({
    data: {
      itemId: overrides.itemId,
      userId: overrides.userId,
      price: overrides.price || 1000,
      currency: overrides.currency || 'EGP',
      status: overrides.status || 'ACTIVE',
      listingType: overrides.listingType || 'DIRECT_SALE',
      expiresAt: overrides.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ...overrides,
    },
  });

  return listing;
};

/**
 * Mock Redis client (for tests that don't need real Redis)
 */
export const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  expire: jest.fn().mockResolvedValue(1),
  quit: jest.fn().mockResolvedValue('OK'),
  disconnect: jest.fn().mockResolvedValue(undefined),
};
