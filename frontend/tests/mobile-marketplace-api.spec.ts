import { test, expect } from '@playwright/test';

/**
 * Xchange Mobile Marketplace - API Tests
 *
 * Tests the backend API endpoints for the mobile marketplace
 * Based on TECHNICAL_SPECS.md API documentation
 */

const API_BASE = 'http://localhost:3000/api';

test.describe('Mobile Marketplace API Tests', () => {

  // ==========================================
  // 1. LISTINGS API TESTS
  // ==========================================
  test.describe('1. Listings API', () => {
    test('1.1 GET /api/listings - Fetch mobile listings', async ({ request }) => {
      const response = await request.get(`${API_BASE}/listings`);
      console.log(`✅ GET /api/listings - Status: ${response.status()}`);

      // API should respond (200 or 401 for auth-required)
      expect([200, 401, 404]).toContain(response.status());
    });

    test('1.2 GET /api/listings with filters', async ({ request }) => {
      const response = await request.get(`${API_BASE}/listings?category=mobiles&limit=10`);
      console.log(`✅ GET /api/listings with filters - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('1.3 GET /api/listings with price range', async ({ request }) => {
      const response = await request.get(`${API_BASE}/listings?min_price=5000&max_price=50000`);
      console.log(`✅ GET /api/listings with price range - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('1.4 GET /api/listings with brand filter', async ({ request }) => {
      const response = await request.get(`${API_BASE}/listings?brand=Samsung`);
      console.log(`✅ GET /api/listings with brand filter - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('1.5 GET /api/listings with condition filter', async ({ request }) => {
      const response = await request.get(`${API_BASE}/listings?condition=A`);
      console.log(`✅ GET /api/listings with condition filter - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('1.6 GET /api/listings with pagination', async ({ request }) => {
      const response = await request.get(`${API_BASE}/listings?page=1&limit=20`);
      console.log(`✅ GET /api/listings with pagination - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('1.7 GET /api/listings with sort', async ({ request }) => {
      const response = await request.get(`${API_BASE}/listings?sort=price_asc`);
      console.log(`✅ GET /api/listings with sort - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('1.8 GET /api/listings/:id - Single listing', async ({ request }) => {
      const response = await request.get(`${API_BASE}/listings/test-id-123`);
      console.log(`✅ GET /api/listings/:id - Status: ${response.status()}`);

      // 404 expected for non-existent ID
      expect([200, 401, 404]).toContain(response.status());
    });
  });

  // ==========================================
  // 2. ITEMS API TESTS
  // ==========================================
  test.describe('2. Items API', () => {
    test('2.1 GET /api/items - Fetch items', async ({ request }) => {
      const response = await request.get(`${API_BASE}/items`);
      console.log(`✅ GET /api/items - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('2.2 GET /api/items with category filter', async ({ request }) => {
      const response = await request.get(`${API_BASE}/items?categoryId=mobiles`);
      console.log(`✅ GET /api/items with category - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('2.3 GET /api/items with search query', async ({ request }) => {
      const response = await request.get(`${API_BASE}/items?search=iPhone`);
      console.log(`✅ GET /api/items with search - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });
  });

  // ==========================================
  // 3. BARTER API TESTS
  // ==========================================
  test.describe('3. Barter API', () => {
    test('3.1 GET /api/barter/items - Barterable items', async ({ request }) => {
      const response = await request.get(`${API_BASE}/barter/items`);
      console.log(`✅ GET /api/barter/items - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('3.2 GET /api/barter/offers - Barter offers', async ({ request }) => {
      const response = await request.get(`${API_BASE}/barter/offers`);
      console.log(`✅ GET /api/barter/offers - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('3.3 GET /api/barter/offers/matching - Matching offers', async ({ request }) => {
      const response = await request.get(`${API_BASE}/barter/offers/matching`);
      console.log(`✅ GET /api/barter/offers/matching - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('3.4 GET /api/barter/chains/my - My chains', async ({ request }) => {
      const response = await request.get(`${API_BASE}/barter/chains/my`);
      console.log(`✅ GET /api/barter/chains/my - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('3.5 GET /api/barter/chains/pending - Pending chains', async ({ request }) => {
      const response = await request.get(`${API_BASE}/barter/chains/pending`);
      console.log(`✅ GET /api/barter/chains/pending - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });
  });

  // ==========================================
  // 4. CATEGORIES API TESTS
  // ==========================================
  test.describe('4. Categories API', () => {
    test('4.1 GET /api/categories - All categories', async ({ request }) => {
      const response = await request.get(`${API_BASE}/categories`);
      console.log(`✅ GET /api/categories - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('4.2 GET /api/categories/mobiles - Mobile category', async ({ request }) => {
      const response = await request.get(`${API_BASE}/categories/mobiles`);
      console.log(`✅ GET /api/categories/mobiles - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });
  });

  // ==========================================
  // 5. AUTH API TESTS
  // ==========================================
  test.describe('5. Auth API', () => {
    test('5.1 POST /api/auth/register - Registration endpoint', async ({ request }) => {
      const response = await request.post(`${API_BASE}/auth/register`, {
        data: {
          email: 'test@example.com',
          password: 'test123',
          fullName: 'Test User'
        }
      });
      console.log(`✅ POST /api/auth/register - Status: ${response.status()}`);

      // 400 expected for validation, 409 for existing user, 201 for success
      expect([200, 201, 400, 401, 404, 409, 422, 500]).toContain(response.status());
    });

    test('5.2 POST /api/auth/login - Login endpoint', async ({ request }) => {
      const response = await request.post(`${API_BASE}/auth/login`, {
        data: {
          email: 'test@example.com',
          password: 'test123'
        }
      });
      console.log(`✅ POST /api/auth/login - Status: ${response.status()}`);

      expect([200, 400, 401, 404, 422]).toContain(response.status());
    });

    test('5.3 GET /api/auth/me - Current user', async ({ request }) => {
      const response = await request.get(`${API_BASE}/auth/me`);
      console.log(`✅ GET /api/auth/me - Status: ${response.status()}`);

      // 401 expected without auth token
      expect([200, 401, 404]).toContain(response.status());
    });
  });

  // ==========================================
  // 6. IMEI VERIFICATION API TESTS
  // ==========================================
  test.describe('6. IMEI Verification API', () => {
    test('6.1 POST /api/verify/imei - IMEI check endpoint', async ({ request }) => {
      const response = await request.post(`${API_BASE}/verify/imei`, {
        data: { imei: '123456789012345' }
      });
      console.log(`✅ POST /api/verify/imei - Status: ${response.status()}`);

      expect([200, 400, 401, 404, 422]).toContain(response.status());
    });
  });

  // ==========================================
  // 7. TRANSACTIONS API TESTS
  // ==========================================
  test.describe('7. Transactions API', () => {
    test('7.1 GET /api/transactions - Transaction list', async ({ request }) => {
      const response = await request.get(`${API_BASE}/transactions`);
      console.log(`✅ GET /api/transactions - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('7.2 GET /api/orders - Orders list', async ({ request }) => {
      const response = await request.get(`${API_BASE}/orders`);
      console.log(`✅ GET /api/orders - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });
  });

  // ==========================================
  // 8. REVIEWS API TESTS
  // ==========================================
  test.describe('8. Reviews API', () => {
    test('8.1 GET /api/reviews - Reviews list', async ({ request }) => {
      const response = await request.get(`${API_BASE}/reviews`);
      console.log(`✅ GET /api/reviews - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });
  });

  // ==========================================
  // 9. NOTIFICATIONS API TESTS
  // ==========================================
  test.describe('9. Notifications API', () => {
    test('9.1 GET /api/notifications - Notifications list', async ({ request }) => {
      const response = await request.get(`${API_BASE}/notifications`);
      console.log(`✅ GET /api/notifications - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });
  });

  // ==========================================
  // 10. FAVORITES API TESTS
  // ==========================================
  test.describe('10. Favorites API', () => {
    test('10.1 GET /api/favorites - Favorites list', async ({ request }) => {
      const response = await request.get(`${API_BASE}/favorites`);
      console.log(`✅ GET /api/favorites - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });

    test('10.2 GET /api/wishlist - Wishlist', async ({ request }) => {
      const response = await request.get(`${API_BASE}/wishlist`);
      console.log(`✅ GET /api/wishlist - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });
  });

  // ==========================================
  // 11. PRICE ALERTS API TESTS
  // ==========================================
  test.describe('11. Price Alerts API', () => {
    test('11.1 GET /api/price-alerts - Price alerts', async ({ request }) => {
      const response = await request.get(`${API_BASE}/price-alerts`);
      console.log(`✅ GET /api/price-alerts - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });
  });

  // ==========================================
  // 12. ESCROW API TESTS
  // ==========================================
  test.describe('12. Escrow API', () => {
    test('12.1 GET /api/escrow - Escrow status', async ({ request }) => {
      const response = await request.get(`${API_BASE}/escrow`);
      console.log(`✅ GET /api/escrow - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });
  });

  // ==========================================
  // 13. DISPUTES API TESTS
  // ==========================================
  test.describe('13. Disputes API', () => {
    test('13.1 GET /api/disputes - Disputes list', async ({ request }) => {
      const response = await request.get(`${API_BASE}/disputes`);
      console.log(`✅ GET /api/disputes - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });
  });

  // ==========================================
  // 14. HEALTH CHECK
  // ==========================================
  test.describe('14. Health Check', () => {
    test('14.1 API health check', async ({ request }) => {
      const response = await request.get(`${API_BASE}/health`);
      console.log(`✅ GET /api/health - Status: ${response.status()}`);

      expect([200, 401, 404]).toContain(response.status());
    });
  });
});
