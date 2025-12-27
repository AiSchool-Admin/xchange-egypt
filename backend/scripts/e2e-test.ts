/**
 * E2E Test Script - سكريبت اختبار شامل للمنصة
 *
 * يختبر جميع الـ APIs الأساسية
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'https://xchange-egypt-production.up.railway.app';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test1@xchange.eg';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test@1234';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  error?: string;
  responseTime?: number;
}

const results: TestResult[] = [];
let authToken = '';

// Helper function to make API calls
async function apiCall(
  method: string,
  endpoint: string,
  body?: any,
  auth = false
): Promise<{ status: number; data: any; time: number }> {
  const start = Date.now();
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (auth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));
    return { status: response.status, data, time: Date.now() - start };
  } catch (error: any) {
    return { status: 0, data: { error: error.message }, time: Date.now() - start };
  }
}

// Test function wrapper
async function test(
  name: string,
  method: string,
  endpoint: string,
  body?: any,
  auth = false,
  expectedStatus = 200
) {
  console.log(`Testing: ${method} ${endpoint}...`);
  const { status, data, time } = await apiCall(method, endpoint, body, auth);

  const passed = status === expectedStatus || (status >= 200 && status < 300);

  results.push({
    endpoint,
    method,
    status: passed ? 'PASS' : 'FAIL',
    statusCode: status,
    error: passed ? undefined : JSON.stringify(data).substring(0, 200),
    responseTime: time,
  });

  if (passed) {
    console.log(`  ✅ PASS (${status}) - ${time}ms`);
  } else {
    console.log(`  ❌ FAIL (${status}) - ${JSON.stringify(data).substring(0, 100)}`);
  }

  return { passed, data, status };
}

// ===========================
// TEST SUITES
// ===========================

async function testHealth() {
  console.log('\n========== HEALTH CHECKS ==========\n');
  await test('Health Check', 'GET', '/health');
  await test('Health Detailed', 'GET', '/health/detailed');
  await test('Ready Check', 'GET', '/ready');
}

async function testAuth() {
  console.log('\n========== AUTHENTICATION ==========\n');

  // Login
  const loginResult = await test('Login', 'POST', '/api/auth/login', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (loginResult.passed && loginResult.data?.data?.accessToken) {
    authToken = loginResult.data.data.accessToken;
    console.log('  🔑 Token obtained successfully');
  } else if (loginResult.data?.accessToken) {
    authToken = loginResult.data.accessToken;
    console.log('  🔑 Token obtained successfully');
  } else {
    console.log('  ⚠️ Could not obtain auth token');
  }

  // Get current user
  if (authToken) {
    await test('Get Current User', 'GET', '/api/users/me', undefined, true);
  }
}

async function testMarketplaces() {
  console.log('\n========== MARKETPLACES ==========\n');

  // Mobile marketplace
  await test('Mobile Listings', 'GET', '/api/mobile?page=1&limit=10');
  await test('Mobile Categories', 'GET', '/api/categories?type=mobile');

  // Scrap marketplace
  await test('Scrap Listings', 'GET', '/api/scrap?page=1&limit=10');

  // General items
  await test('All Items', 'GET', '/api/items?page=1&limit=10');
  await test('Search Items', 'GET', '/api/search?q=test&page=1&limit=10');
}

async function testAuction() {
  console.log('\n========== AUCTION SYSTEM ==========\n');

  await test('Active Auctions', 'GET', '/api/auctions?status=active&page=1&limit=10');
  await test('Auction Categories', 'GET', '/api/auctions/categories');
}

async function testReverseAuction() {
  console.log('\n========== REVERSE AUCTION ==========\n');

  await test('Reverse Auctions', 'GET', '/api/reverse-auctions?page=1&limit=10');
}

async function testBarter() {
  console.log('\n========== BARTER SYSTEM ==========\n');

  await test('Barter Listings', 'GET', '/api/barter?page=1&limit=10');
  await test('Barter Pool', 'GET', '/api/barter-pool?page=1&limit=10');

  if (authToken) {
    await test('My Barter Offers', 'GET', '/api/barter/my-offers', undefined, true);
  }
}

async function testTender() {
  console.log('\n========== TENDER SYSTEM ==========\n');

  await test('Tender Statistics', 'GET', '/api/v1/tenders/statistics');
  await test('Browse Vendors', 'GET', '/api/v1/tenders/vendors?page=1&limit=10');

  if (authToken) {
    await test('Service Requests', 'GET', '/api/v1/tenders/service-requests', undefined, true);
    await test('Tender Dashboard', 'GET', '/api/v1/tenders/dashboard', undefined, true);
    await test('My Contracts', 'GET', '/api/v1/tenders/contracts', undefined, true);
  }
}

async function testPaymentEscrow() {
  console.log('\n========== PAYMENT & ESCROW ==========\n');

  if (authToken) {
    await test('Wallet Balance', 'GET', '/api/wallet/balance', undefined, true);
    await test('Escrow Transactions', 'GET', '/api/escrow/transactions', undefined, true);
  }
}

async function testCategories() {
  console.log('\n========== CATEGORIES ==========\n');

  await test('All Categories', 'GET', '/api/categories');
  await test('Categories Tree', 'GET', '/api/categories/tree');
}

async function testLocations() {
  console.log('\n========== LOCATIONS ==========\n');

  await test('Governorates', 'GET', '/api/locations/governorates');
  await test('Cities', 'GET', '/api/locations/cities');
}

async function testOrders() {
  console.log('\n========== ORDERS ==========\n');

  if (authToken) {
    await test('My Orders', 'GET', '/api/orders', undefined, true);
  }
}

async function testNotifications() {
  console.log('\n========== NOTIFICATIONS ==========\n');

  if (authToken) {
    await test('My Notifications', 'GET', '/api/notifications', undefined, true);
  }
}

// ===========================
// MAIN EXECUTION
// ===========================

async function runAllTests() {
  console.log('🚀 Starting E2E Tests for XChange Egypt Platform');
  console.log(`📍 API URL: ${API_URL}`);
  console.log(`📧 Test User: ${TEST_EMAIL}`);
  console.log('='.repeat(50));

  await testHealth();
  await testAuth();
  await testCategories();
  await testLocations();
  await testMarketplaces();
  await testAuction();
  await testReverseAuction();
  await testBarter();
  await testTender();
  await testPaymentEscrow();
  await testOrders();
  await testNotifications();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  - ${r.method} ${r.endpoint} (${r.statusCode}): ${r.error}`);
      });
  }

  // Export results as JSON
  const fs = await import('fs');
  fs.writeFileSync(
    'test-results.json',
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
  );
  console.log('\n📁 Results saved to test-results.json');
}

runAllTests().catch(console.error);
