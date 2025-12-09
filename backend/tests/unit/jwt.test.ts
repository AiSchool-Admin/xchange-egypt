/**
 * JWT Token Unit Tests
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
const JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-testing';

describe('JWT Token Tests', () => {
  const testUser = {
    id: 'user-123',
    email: 'test@example.com',
    userType: 'INDIVIDUAL',
  };

  describe('Access Token', () => {
    it('should generate valid access token', () => {
      const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '15m' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should decode access token correctly', () => {
      const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '15m' });
      const decoded = jwt.verify(token, JWT_SECRET) as typeof testUser;

      expect(decoded.id).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.userType).toBe(testUser.userType);
    });

    it('should fail with wrong secret', () => {
      const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '15m' });

      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });

    it('should include expiration time', () => {
      const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '15m' });
      const decoded = jwt.decode(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('Refresh Token', () => {
    it('should generate valid refresh token', () => {
      const token = jwt.sign({ id: testUser.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should decode refresh token correctly', () => {
      const token = jwt.sign({ id: testUser.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };

      expect(decoded.id).toBe(testUser.id);
    });

    it('should have longer expiry than access token', () => {
      const accessToken = jwt.sign(testUser, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: testUser.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

      const accessDecoded = jwt.decode(accessToken) as any;
      const refreshDecoded = jwt.decode(refreshToken) as any;

      expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
    });
  });

  describe('Token Expiration', () => {
    it('should detect expired tokens', () => {
      const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '-1s' }); // Already expired

      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).toThrow(jwt.TokenExpiredError);
    });

    it('should accept valid non-expired tokens', () => {
      const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '1h' });

      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).not.toThrow();
    });
  });

  describe('Token Structure', () => {
    it('should create token with correct header', () => {
      const token = jwt.sign(testUser, JWT_SECRET);
      const [header] = token.split('.');
      const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString());

      expect(decodedHeader.alg).toBe('HS256');
      expect(decodedHeader.typ).toBe('JWT');
    });

    it('should not expose sensitive data in payload', () => {
      const userWithPassword = {
        ...testUser,
        password: 'secret123',
      };

      // In real app, password should be removed before signing
      const { password, ...safeUser } = userWithPassword;
      const token = jwt.sign(safeUser, JWT_SECRET);
      const decoded = jwt.decode(token) as any;

      expect(decoded.password).toBeUndefined();
    });
  });
});
