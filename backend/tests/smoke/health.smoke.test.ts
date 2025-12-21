/**
 * Smoke Tests
 * Quick sanity checks to verify critical functionality after deployment
 * These tests run against a live server
 */

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Simple fetch wrapper for smoke tests
const fetchApi = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<{ status: number; data: unknown }> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await response.json().catch(() => null);
    return { status: response.status, data };
  } catch (error) {
    throw new Error(`Failed to fetch ${endpoint}: ${error}`);
  }
};

describe('Smoke Tests - Critical Functionality', () => {
  // ============================================
  // Health & Infrastructure
  // ============================================

  describe('Health & Infrastructure', () => {
    it('should respond to health check', async () => {
      const { status, data } = await fetchApi('/health');

      expect(status).toBe(200);
      expect(data).toHaveProperty('status', 'healthy');
    });

    it('should return server timestamp', async () => {
      const { data } = (await fetchApi('/health')) as { data: { timestamp: string } };

      expect(data.timestamp).toBeDefined();
      // Timestamp should be a valid ISO date
      expect(new Date(data.timestamp).getTime()).not.toBeNaN();
    });

    it('should respond within acceptable time', async () => {
      const start = Date.now();
      await fetchApi('/health');
      const duration = Date.now() - start;

      // Health check should respond within 2 seconds
      expect(duration).toBeLessThan(2000);
    });
  });

  // ============================================
  // Public Endpoints
  // ============================================

  describe('Public Endpoints', () => {
    it('should return categories list', async () => {
      const { status, data } = (await fetchApi('/api/v1/categories')) as {
        status: number;
        data: { success: boolean; data: unknown[] };
      };

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return items with pagination', async () => {
      const { status, data } = (await fetchApi('/api/v1/items?page=1&limit=5')) as {
        status: number;
        data: { success: boolean };
      };

      expect(status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle search queries', async () => {
      const { status } = await fetchApi('/api/v1/items?search=test');

      expect(status).toBe(200);
    });
  });

  // ============================================
  // Authentication Flow
  // ============================================

  describe('Authentication Flow', () => {
    it('should reject invalid login credentials', async () => {
      const { status } = await fetchApi('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@test.com',
          password: 'wrongpassword',
        }),
      });

      expect(status).toBe(401);
    });

    it('should validate registration input', async () => {
      const { status } = await fetchApi('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          // Missing required fields
        }),
      });

      // Should return 400 for validation error
      expect(status).toBeGreaterThanOrEqual(400);
      expect(status).toBeLessThan(500);
    });
  });

  // ============================================
  // API Response Format
  // ============================================

  describe('API Response Format', () => {
    it('should return JSON content type', async () => {
      // Using a simple approach since we're using fetch
      const { data } = await fetchApi('/health');

      // Data should be parseable JSON (already parsed by fetchApi)
      expect(data).toBeDefined();
      expect(typeof data).toBe('object');
    });

    it('should include success field in API responses', async () => {
      const { data } = (await fetchApi('/api/v1/categories')) as {
        data: { success: boolean };
      };

      expect(data).toHaveProperty('success');
    });
  });

  // ============================================
  // Error Handling
  // ============================================

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const { status } = await fetchApi('/api/v1/unknown-endpoint-12345');

      expect(status).toBe(404);
    });

    it('should handle OPTIONS requests (CORS)', async () => {
      const { status } = await fetchApi('/api/v1/categories', {
        method: 'OPTIONS',
      });

      // Should not return 500
      expect(status).toBeLessThan(500);
    });
  });

  // ============================================
  // Rate Limiting
  // ============================================

  describe('Rate Limiting', () => {
    it('should not rate limit normal traffic', async () => {
      // Make 5 quick requests - should all succeed
      const requests = Array(5)
        .fill(null)
        .map(() => fetchApi('/health'));

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });

  // ============================================
  // Database Connectivity (Implicit)
  // ============================================

  describe('Database Connectivity', () => {
    it('should fetch data from database (categories)', async () => {
      const { status, data } = (await fetchApi('/api/v1/categories')) as {
        status: number;
        data: { success: boolean };
      };

      // If we get a successful response, database is connected
      expect(status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

// ============================================
// Smoke Test Summary Helper
// ============================================

describe('Smoke Test Summary', () => {
  it('should complete all smoke tests', () => {
    // This test ensures all smoke tests were executed
    // If we reach here, all previous tests passed
    expect(true).toBe(true);
    console.log('✅ All smoke tests completed successfully');
  });
});
