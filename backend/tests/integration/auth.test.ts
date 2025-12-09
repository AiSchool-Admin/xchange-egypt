/**
 * Authentication Routes Integration Tests
 */

import request from 'supertest';
import { cleanDatabase, disconnectTestDb, getTestDb } from '../helpers/testDb';
import { createTestUser } from '../helpers/testHelpers';
import bcrypt from 'bcryptjs';

// Note: These tests require the full Express app
// For now, we'll test the logic separately until we can import the app

describe('Auth Routes - Unit Tests', () => {
  const db = getTestDb();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  describe('User Registration', () => {
    it('should hash password before storing', async () => {
      const password = 'Test123!@#';
      const hashedPassword = await bcrypt.hash(password, 10);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(password.length);
    });

    it('should verify hashed password correctly', async () => {
      const password = 'Test123!@#';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'Test123!@#';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare('WrongPassword', hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should create user with correct data structure', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        full_name: 'Test User',
      });

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('full_name');
      expect(user).toHaveProperty('user_type');
      expect(user).toHaveProperty('status');
      expect(user.email).toBe('test@example.com');
      expect(user.full_name).toBe('Test User');
    });

    it('should prevent duplicate email registration', async () => {
      const email = 'duplicate@example.com';

      await createTestUser({ email });

      await expect(
        createTestUser({ email })
      ).rejects.toThrow();
    });
  });

  describe('User Authentication', () => {
    it('should find user by email', async () => {
      const testEmail = 'findme@example.com';
      await createTestUser({ email: testEmail });

      const user = await db.user.findUnique({
        where: { email: testEmail },
      });

      expect(user).not.toBeNull();
      expect(user?.email).toBe(testEmail);
    });

    it('should return null for non-existent user', async () => {
      const user = await db.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      });

      expect(user).toBeNull();
    });
  });

  describe('User Types', () => {
    it('should create individual user', async () => {
      const user = await createTestUser({
        user_type: 'INDIVIDUAL',
      });

      expect(user.user_type).toBe('INDIVIDUAL');
    });

    it('should create business user', async () => {
      const user = await createTestUser({
        user_type: 'BUSINESS',
        business_name: 'Test Business LLC',
        commercial_registration: '123456789',
        tax_id: '987654321',
      });

      expect(user.user_type).toBe('BUSINESS');
      expect(user.business_name).toBe('Test Business LLC');
    });

    it('should create admin user', async () => {
      const user = await createTestUser({
        user_type: 'ADMIN',
      });

      expect(user.user_type).toBe('ADMIN');
    });
  });

  describe('User Status', () => {
    it('should set user status to ACTIVE by default', async () => {
      const user = await createTestUser();
      expect(user.status).toBe('ACTIVE');
    });

    it('should allow creating PENDING user', async () => {
      const user = await createTestUser({
        status: 'PENDING',
      });

      expect(user.status).toBe('PENDING');
    });

    it('should allow creating SUSPENDED user', async () => {
      const user = await createTestUser({
        status: 'SUSPENDED',
      });

      expect(user.status).toBe('SUSPENDED');
    });
  });
});
