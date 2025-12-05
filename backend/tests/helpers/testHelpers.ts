/**
 * Test Helper Functions
 * Common utilities for testing
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient, UserType, UserStatus } from '@prisma/client';
import { getTestDb } from './testDb';

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

  const defaultData = {
    email: `test-${Date.now()}@example.com`,
    passwordHash: await bcrypt.hash('Test123!@#', 10),
    fullName: 'Test User',
    phone: '+201234567890',
    userType: 'INDIVIDUAL' as UserType,
    status: 'ACTIVE' as UserStatus,
    emailVerified: true,
    phoneVerified: true,
    governorate: overrides.governorate || null,
    city: overrides.city || null,
    district: overrides.district || null,
    ...overrides,
  };

  const user = await db.user.create({
    data: defaultData,
  });

  return user;
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
 */
export const createTestCategory = async (overrides: any = {}) => {
  const db = getTestDb();

  const category = await db.category.create({
    data: {
      nameEn: `Test Category ${Date.now()}`,
      nameAr: `فئة تجريبية ${Date.now()}`,
      slug: `test-category-${Date.now()}`,
      icon: '📦',
      level: 1,
      isActive: true,
      ...overrides,
    },
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
