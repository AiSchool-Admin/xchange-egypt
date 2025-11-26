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
    password_hash: await bcrypt.hash('Test123!@#', 10),
    full_name: 'Test User',
    phone: '+201234567890',
    user_type: 'INDIVIDUAL' as UserType,
    status: 'ACTIVE' as UserStatus,
    email_verified: true,
    phone_verified: true,
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
      name_en: `Test Category ${Date.now()}`,
      name_ar: `فئة تجريبية ${Date.now()}`,
      slug: `test-category-${Date.now()}`,
      icon: '📦',
      level: 1,
      is_active: true,
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
      user_id: userId,
      category_id: categoryId,
      title: `Test Item ${Date.now()}`,
      description: 'Test item description',
      condition: 'NEW',
      estimated_value: 1000,
      quantity: 1,
      unit: 'piece',
      location_city: 'Cairo',
      location_area: 'Nasr City',
      is_active: true,
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
