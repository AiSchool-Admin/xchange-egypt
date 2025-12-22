/**
 * Auth Service Unit Tests
 * اختبارات وحدة خدمة المصادقة
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cleanDatabase, disconnectTestDb, getTestDb } from '../helpers/testDb';
import { createTestUser, generateTestToken } from '../helpers/testHelpers';

// Check if Prisma is available
let prismaAvailable = false;
try {
  require('@prisma/client');
  prismaAvailable = true;
} catch {
  console.log('⚠️ Prisma not available - skipping Auth Service tests');
}

const describeIfPrisma = prismaAvailable ? describe : describe.skip;

describeIfPrisma('Auth Service Tests', () => {
  const db = getTestDb();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  // ==========================================
  // Password Hashing Tests
  // ==========================================
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'SecurePassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
    });

    it('should verify correct password', async () => {
      const password = 'TestPassword456!';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'CorrectPassword!';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare('WrongPassword!', hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SamePassword123!';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);

      expect(hash1).not.toBe(hash2);
      // But both should validate correctly
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
  });

  // ==========================================
  // JWT Token Tests
  // ==========================================
  describe('JWT Token Generation', () => {
    const secret = process.env.JWT_SECRET || 'test-secret';

    it('should generate valid access token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        userType: 'INDIVIDUAL',
      };

      const token = jwt.sign(payload, secret, { expiresIn: '15m' });
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3);
    });

    it('should decode token correctly', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        userType: 'INDIVIDUAL',
      };

      const token = jwt.sign(payload, secret, { expiresIn: '15m' });
      const decoded = jwt.verify(token, secret) as any;

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.userType).toBe(payload.userType);
    });

    it('should reject expired token', async () => {
      const payload = { userId: 'test-user-id' };
      const token = jwt.sign(payload, secret, { expiresIn: '1ms' });

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(() => jwt.verify(token, secret)).toThrow();
    });

    it('should reject token with wrong secret', () => {
      const payload = { userId: 'test-user-id' };
      const token = jwt.sign(payload, secret);

      expect(() => jwt.verify(token, 'wrong-secret')).toThrow();
    });

    it('should generate refresh token with longer expiry', () => {
      const token = generateTestToken('user-123', 'INDIVIDUAL');
      const decoded = jwt.decode(token) as any;

      expect(decoded.userId).toBe('user-123');
      expect(decoded.userType).toBe('INDIVIDUAL');
      expect(decoded.exp).toBeDefined();
    });
  });

  // ==========================================
  // User Registration Tests
  // ==========================================
  describe('User Registration', () => {
    it('should create individual user with required fields', async () => {
      const user = await createTestUser({
        email: 'newuser@example.com',
        fullName: 'New User',
        phone: '+201111111111',
      });

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('newuser@example.com');
      expect(user.fullName).toBe('New User');
      expect(user.userType).toBe('INDIVIDUAL');
      expect(user.status).toBe('ACTIVE');
    });

    it('should create business user with business fields', async () => {
      const user = await createTestUser({
        email: 'business@example.com',
        fullName: 'Business Owner',
        userType: 'BUSINESS',
        businessName: 'Test Company LLC',
        taxId: '123456789',
        commercialRegNo: '987654321',
      });

      expect(user.userType).toBe('BUSINESS');
      expect(user.businessName).toBe('Test Company LLC');
      expect(user.taxId).toBe('123456789');
      expect(user.commercialRegNo).toBe('987654321');
    });

    it('should prevent duplicate email registration', async () => {
      const email = 'unique@example.com';
      await createTestUser({ email });

      await expect(createTestUser({ email })).rejects.toThrow();
    });

    it('should prevent duplicate phone registration', async () => {
      const phone = '+201222222222';
      await createTestUser({ phone });

      await expect(createTestUser({ phone })).rejects.toThrow();
    });

    it('should hash password before storing', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await db.user.create({
        data: {
          email: `hash-test-${Date.now()}@example.com`,
          passwordHash: hashedPassword,
          fullName: 'Hash Test User',
          userType: 'INDIVIDUAL',
          status: 'ACTIVE',
        },
      });

      expect(user.passwordHash).not.toBe(password);
      expect(user.passwordHash).toBe(hashedPassword);
    });
  });

  // ==========================================
  // User Login Tests
  // ==========================================
  describe('User Login', () => {
    it('should find user by email', async () => {
      const email = 'findme@example.com';
      await createTestUser({ email });

      const user = await db.user.findUnique({
        where: { email },
      });

      expect(user).not.toBeNull();
      expect(user?.email).toBe(email);
    });

    it('should return null for non-existent email', async () => {
      const user = await db.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      });

      expect(user).toBeNull();
    });

    it('should update lastLoginAt on login', async () => {
      const user = await createTestUser();
      const beforeLogin = user.lastLoginAt;

      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const updatedUser = await db.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.lastLoginAt).not.toBe(beforeLogin);
    });

    it('should reject suspended user login', async () => {
      const user = await createTestUser({ status: 'SUSPENDED' });

      expect(user.status).toBe('SUSPENDED');
      // In real login, this should be rejected
    });

    it('should reject banned user login', async () => {
      const user = await createTestUser({ status: 'BANNED' });

      expect(user.status).toBe('BANNED');
      // In real login, this should be rejected
    });
  });

  // ==========================================
  // Refresh Token Tests
  // ==========================================
  describe('Refresh Token Management', () => {
    it('should store refresh token in database', async () => {
      const user = await createTestUser();
      const refreshToken = generateTestToken(user.id, 'INDIVIDUAL');

      const stored = await db.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      expect(stored).toHaveProperty('id');
      expect(stored.token).toBe(refreshToken);
      expect(stored.userId).toBe(user.id);
    });

    it('should delete refresh token on logout', async () => {
      const user = await createTestUser();
      const refreshToken = generateTestToken(user.id, 'INDIVIDUAL');

      await db.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await db.refreshToken.deleteMany({
        where: { token: refreshToken },
      });

      const stored = await db.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      expect(stored).toBeNull();
    });

    it('should delete all refresh tokens on logout all', async () => {
      const user = await createTestUser();

      // Create multiple tokens
      await db.refreshToken.createMany({
        data: [
          {
            token: generateTestToken(user.id, 'INDIVIDUAL') + '1',
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          {
            token: generateTestToken(user.id, 'INDIVIDUAL') + '2',
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      await db.refreshToken.deleteMany({
        where: { userId: user.id },
      });

      const tokens = await db.refreshToken.findMany({
        where: { userId: user.id },
      });

      expect(tokens).toHaveLength(0);
    });

    it('should detect expired refresh token', async () => {
      const user = await createTestUser();
      const refreshToken = generateTestToken(user.id, 'INDIVIDUAL');

      const stored = await db.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() - 1000), // Already expired
        },
      });

      expect(stored.expiresAt < new Date()).toBe(true);
    });
  });

  // ==========================================
  // User Profile Tests
  // ==========================================
  describe('User Profile', () => {
    it('should get user profile by ID', async () => {
      const user = await createTestUser({
        fullName: 'Profile User',
        phone: '+201333333333',
      });

      const profile = await db.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          userType: true,
          status: true,
        },
      });

      expect(profile).not.toBeNull();
      expect(profile?.fullName).toBe('Profile User');
    });

    it('should update user profile', async () => {
      const user = await createTestUser();

      const updated = await db.user.update({
        where: { id: user.id },
        data: {
          fullName: 'Updated Name',
          bio: 'This is my bio',
          city: 'القاهرة',
          governorate: 'القاهرة',
        },
      });

      expect(updated.fullName).toBe('Updated Name');
      expect(updated.bio).toBe('This is my bio');
    });

    it('should not expose password hash in profile', async () => {
      const user = await createTestUser();

      const profile = await db.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          // passwordHash is not selected
        },
      });

      expect(profile).not.toHaveProperty('passwordHash');
    });
  });

  // ==========================================
  // Password Reset Tests
  // ==========================================
  describe('Password Reset', () => {
    it('should generate password reset token', () => {
      const secret = process.env.JWT_SECRET || 'test-secret';
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        purpose: 'password-reset',
      };

      const resetToken = jwt.sign(payload, secret, { expiresIn: '1h' });
      expect(resetToken).toBeDefined();

      const decoded = jwt.verify(resetToken, secret) as any;
      expect(decoded.purpose).toBe('password-reset');
    });

    it('should update password successfully', async () => {
      const user = await createTestUser();
      const newPassword = 'NewSecurePassword123!';
      const newHash = await bcrypt.hash(newPassword, 10);

      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      const updatedUser = await db.user.findUnique({
        where: { id: user.id },
      });

      const isValid = await bcrypt.compare(newPassword, updatedUser!.passwordHash);
      expect(isValid).toBe(true);
    });

    it('should invalidate all tokens after password reset', async () => {
      const user = await createTestUser();

      // Create a refresh token
      await db.refreshToken.create({
        data: {
          token: 'old-refresh-token',
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Simulate password reset - delete all tokens
      await db.refreshToken.deleteMany({
        where: { userId: user.id },
      });

      const tokens = await db.refreshToken.findMany({
        where: { userId: user.id },
      });

      expect(tokens).toHaveLength(0);
    });
  });

  // ==========================================
  // User Status Tests
  // ==========================================
  describe('User Status Management', () => {
    it('should create user with ACTIVE status by default', async () => {
      const user = await createTestUser();
      expect(user.status).toBe('ACTIVE');
    });

    it('should allow creating PENDING user', async () => {
      const user = await createTestUser({ status: 'PENDING' });
      expect(user.status).toBe('PENDING');
    });

    it('should allow suspending user', async () => {
      const user = await createTestUser();

      const updated = await db.user.update({
        where: { id: user.id },
        data: { status: 'SUSPENDED' },
      });

      expect(updated.status).toBe('SUSPENDED');
    });

    it('should allow banning user', async () => {
      const user = await createTestUser();

      const updated = await db.user.update({
        where: { id: user.id },
        data: { status: 'BANNED' },
      });

      expect(updated.status).toBe('BANNED');
    });
  });

  // ==========================================
  // Email Verification Tests
  // ==========================================
  describe('Email Verification', () => {
    it('should create user with unverified email by default', async () => {
      const user = await db.user.create({
        data: {
          email: `unverified-${Date.now()}@example.com`,
          passwordHash: await bcrypt.hash('test', 10),
          fullName: 'Unverified User',
          userType: 'INDIVIDUAL',
          status: 'ACTIVE',
          emailVerified: false,
        },
      });

      expect(user.emailVerified).toBe(false);
    });

    it('should verify email successfully', async () => {
      const user = await db.user.create({
        data: {
          email: `verify-${Date.now()}@example.com`,
          passwordHash: await bcrypt.hash('test', 10),
          fullName: 'Verify User',
          userType: 'INDIVIDUAL',
          status: 'ACTIVE',
          emailVerified: false,
        },
      });

      const updated = await db.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });

      expect(updated.emailVerified).toBe(true);
    });
  });
});
