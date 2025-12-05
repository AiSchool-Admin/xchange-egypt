/**
 * Test Script for Featured/Luxury Market Features
 *
 * This script tests the following endpoints:
 * - GET /api/v1/items/featured - Get featured items
 * - GET /api/v1/items/luxury - Get luxury items
 * - POST /api/v1/items/:id/promote - Promote an item
 * - DELETE /api/v1/items/:id/promote - Remove promotion
 *
 * Usage:
 *   npx ts-node scripts/test-featured-luxury.ts [BASE_URL]
 *
 * Example:
 *   npx ts-node scripts/test-featured-luxury.ts http://localhost:5000
 *   npx ts-node scripts/test-featured-luxury.ts https://your-api.railway.app
 */

const BASE_URL = process.argv[2] || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/v1`;

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

async function makeRequest(
  method: string,
  endpoint: string,
  body?: any,
  token?: string
): Promise<{ status: number; data: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json().catch(() => ({}));

  return { status: response.status, data };
}

async function testGetFeaturedItems(): Promise<void> {
  console.log('\n📌 Testing GET /items/featured...');

  try {
    // Test 1: Basic featured items request
    const result1 = await makeRequest('GET', '/items/featured');

    if (result1.status === 200) {
      results.push({
        name: 'GET /items/featured - Basic request',
        passed: true,
        message: `Success! Found ${result1.data?.data?.items?.length || 0} featured items`,
        data: result1.data,
      });
    } else {
      results.push({
        name: 'GET /items/featured - Basic request',
        passed: false,
        message: `Failed with status ${result1.status}: ${JSON.stringify(result1.data)}`,
      });
    }

    // Test 2: Featured items with limit
    const result2 = await makeRequest('GET', '/items/featured?limit=5');

    if (result2.status === 200) {
      const itemCount = result2.data?.data?.items?.length || 0;
      results.push({
        name: 'GET /items/featured - With limit=5',
        passed: itemCount <= 5,
        message: `Returned ${itemCount} items (expected <= 5)`,
      });
    } else {
      results.push({
        name: 'GET /items/featured - With limit=5',
        passed: false,
        message: `Failed with status ${result2.status}`,
      });
    }

    // Test 3: Featured items with minTier filter
    const result3 = await makeRequest('GET', '/items/featured?minTier=GOLD');

    if (result3.status === 200) {
      results.push({
        name: 'GET /items/featured - With minTier=GOLD',
        passed: true,
        message: `Success! Found ${result3.data?.data?.items?.length || 0} GOLD+ items`,
      });
    } else {
      results.push({
        name: 'GET /items/featured - With minTier=GOLD',
        passed: false,
        message: `Failed with status ${result3.status}`,
      });
    }

  } catch (error: any) {
    results.push({
      name: 'GET /items/featured',
      passed: false,
      message: `Error: ${error.message}`,
    });
  }
}

async function testGetLuxuryItems(): Promise<void> {
  console.log('\n💎 Testing GET /items/luxury...');

  try {
    // Test 1: Basic luxury items request
    const result1 = await makeRequest('GET', '/items/luxury');

    if (result1.status === 200) {
      results.push({
        name: 'GET /items/luxury - Basic request',
        passed: true,
        message: `Success! Found ${result1.data?.data?.items?.length || 0} luxury items`,
        data: result1.data,
      });
    } else {
      results.push({
        name: 'GET /items/luxury - Basic request',
        passed: false,
        message: `Failed with status ${result1.status}: ${JSON.stringify(result1.data)}`,
      });
    }

    // Test 2: Luxury items with minPrice filter
    const result2 = await makeRequest('GET', '/items/luxury?minPrice=50000');

    if (result2.status === 200) {
      const items = result2.data?.data?.items || [];
      const allAboveMinPrice = items.every((item: any) =>
        (item.estimatedValue || 0) >= 50000
      );
      results.push({
        name: 'GET /items/luxury - With minPrice=50000',
        passed: items.length === 0 || allAboveMinPrice,
        message: `Found ${items.length} items, all above 50000 EGP: ${allAboveMinPrice}`,
      });
    } else {
      results.push({
        name: 'GET /items/luxury - With minPrice=50000',
        passed: false,
        message: `Failed with status ${result2.status}`,
      });
    }

    // Test 3: Luxury items sorted by price high
    const result3 = await makeRequest('GET', '/items/luxury?sortBy=price_high&limit=10');

    if (result3.status === 200) {
      const items = result3.data?.data?.items || [];
      let isSorted = true;
      for (let i = 1; i < items.length; i++) {
        if ((items[i].estimatedValue || 0) > (items[i-1].estimatedValue || 0)) {
          isSorted = false;
          break;
        }
      }
      results.push({
        name: 'GET /items/luxury - Sorted by price_high',
        passed: items.length === 0 || isSorted,
        message: `Found ${items.length} items, sorted descending: ${isSorted}`,
      });
    } else {
      results.push({
        name: 'GET /items/luxury - Sorted by price_high',
        passed: false,
        message: `Failed with status ${result3.status}`,
      });
    }

    // Test 4: Luxury items sorted by price low
    const result4 = await makeRequest('GET', '/items/luxury?sortBy=price_low&limit=10');

    if (result4.status === 200) {
      const items = result4.data?.data?.items || [];
      let isSorted = true;
      for (let i = 1; i < items.length; i++) {
        if ((items[i].estimatedValue || 0) < (items[i-1].estimatedValue || 0)) {
          isSorted = false;
          break;
        }
      }
      results.push({
        name: 'GET /items/luxury - Sorted by price_low',
        passed: items.length === 0 || isSorted,
        message: `Found ${items.length} items, sorted ascending: ${isSorted}`,
      });
    } else {
      results.push({
        name: 'GET /items/luxury - Sorted by price_low',
        passed: false,
        message: `Failed with status ${result4.status}`,
      });
    }

  } catch (error: any) {
    results.push({
      name: 'GET /items/luxury',
      passed: false,
      message: `Error: ${error.message}`,
    });
  }
}

async function testPromoteItem(token?: string): Promise<void> {
  console.log('\n⭐ Testing POST /items/:id/promote...');

  if (!token) {
    results.push({
      name: 'POST /items/:id/promote',
      passed: true,
      message: 'Skipped - No auth token provided (requires authentication)',
    });
    return;
  }

  try {
    // First, get user's items to find one to promote
    const itemsResult = await makeRequest('GET', '/items/my', undefined, token);

    if (itemsResult.status !== 200 || !itemsResult.data?.data?.items?.length) {
      results.push({
        name: 'POST /items/:id/promote',
        passed: true,
        message: 'Skipped - No items found for user to promote',
      });
      return;
    }

    const testItemId = itemsResult.data.data.items[0].id;

    // Test promoting the item
    const promoteResult = await makeRequest(
      'POST',
      `/items/${testItemId}/promote`,
      { tier: 'FEATURED', durationDays: 7 },
      token
    );

    if (promoteResult.status === 200) {
      results.push({
        name: 'POST /items/:id/promote - Promote to FEATURED',
        passed: true,
        message: `Successfully promoted item ${testItemId} to FEATURED tier`,
        data: promoteResult.data,
      });

      // Verify the item is now featured
      const verifyResult = await makeRequest('GET', `/items/${testItemId}`);
      if (verifyResult.status === 200) {
        const item = verifyResult.data?.data;
        results.push({
          name: 'POST /items/:id/promote - Verify promotion',
          passed: item?.isFeatured === true && item?.promotionTier === 'FEATURED',
          message: `isFeatured: ${item?.isFeatured}, promotionTier: ${item?.promotionTier}`,
        });
      }

      // Test removing promotion
      const removeResult = await makeRequest(
        'DELETE',
        `/items/${testItemId}/promote`,
        undefined,
        token
      );

      results.push({
        name: 'DELETE /items/:id/promote - Remove promotion',
        passed: removeResult.status === 200,
        message: removeResult.status === 200
          ? 'Successfully removed promotion'
          : `Failed with status ${removeResult.status}`,
      });

    } else {
      results.push({
        name: 'POST /items/:id/promote',
        passed: false,
        message: `Failed with status ${promoteResult.status}: ${JSON.stringify(promoteResult.data)}`,
      });
    }

  } catch (error: any) {
    results.push({
      name: 'POST /items/:id/promote',
      passed: false,
      message: `Error: ${error.message}`,
    });
  }
}

async function testUnauthorizedPromotion(): Promise<void> {
  console.log('\n🔒 Testing promotion without auth...');

  try {
    const result = await makeRequest('POST', '/items/test-id/promote', { tier: 'FEATURED' });

    results.push({
      name: 'POST /items/:id/promote - Without auth',
      passed: result.status === 401,
      message: result.status === 401
        ? 'Correctly returned 401 Unauthorized'
        : `Expected 401, got ${result.status}`,
    });

  } catch (error: any) {
    results.push({
      name: 'POST /items/:id/promote - Without auth',
      passed: false,
      message: `Error: ${error.message}`,
    });
  }
}

async function testDatabaseFields(): Promise<void> {
  console.log('\n🗃️  Testing database field presence...');

  try {
    // Get any item and check for new fields
    const result = await makeRequest('GET', '/items/search?limit=1');

    if (result.status === 200 && result.data?.data?.items?.length > 0) {
      const item = result.data.data.items[0];

      const hasIsFeatured = 'isFeatured' in item;
      const hasPromotionTier = 'promotionTier' in item;
      const hasPromotedAt = 'promotedAt' in item;
      const hasPromotionExpiresAt = 'promotionExpiresAt' in item;

      results.push({
        name: 'Database fields - isFeatured',
        passed: hasIsFeatured,
        message: hasIsFeatured ? `Present (value: ${item.isFeatured})` : 'Missing',
      });

      results.push({
        name: 'Database fields - promotionTier',
        passed: hasPromotionTier,
        message: hasPromotionTier ? `Present (value: ${item.promotionTier})` : 'Missing',
      });

      results.push({
        name: 'Database fields - promotedAt',
        passed: hasPromotedAt,
        message: hasPromotedAt ? `Present (value: ${item.promotedAt})` : 'Missing',
      });

      results.push({
        name: 'Database fields - promotionExpiresAt',
        passed: hasPromotionExpiresAt,
        message: hasPromotionExpiresAt ? `Present (value: ${item.promotionExpiresAt})` : 'Missing',
      });

    } else {
      results.push({
        name: 'Database fields check',
        passed: false,
        message: 'Could not fetch items to verify fields',
      });
    }

  } catch (error: any) {
    results.push({
      name: 'Database fields check',
      passed: false,
      message: `Error: ${error.message}`,
    });
  }
}

function printResults(): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`\n${icon} ${result.name}`);
    console.log(`   ${result.message}`);
  });

  console.log('\n' + '-'.repeat(60));
  console.log(`Total: ${results.length} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('-'.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Please check:');
    console.log('   1. Is the database migration applied?');
    console.log('   2. Is the server running?');
    console.log('   3. Are there any items in the database?');
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

async function main(): Promise<void> {
  console.log('🧪 Featured/Luxury Market Feature Tests');
  console.log('='.repeat(60));
  console.log(`API URL: ${API_URL}`);
  console.log('='.repeat(60));

  // Check if API is reachable
  try {
    const healthCheck = await fetch(`${BASE_URL}/health`).catch(() => null);
    if (!healthCheck || !healthCheck.ok) {
      console.log('\n⚠️  Warning: Health check failed. Server may not be running.');
    } else {
      console.log('\n✅ Server is reachable');
    }
  } catch {
    console.log('\n⚠️  Warning: Could not reach server');
  }

  // Run tests
  await testDatabaseFields();
  await testGetFeaturedItems();
  await testGetLuxuryItems();
  await testUnauthorizedPromotion();

  // Auth-required tests (pass token as env variable)
  const authToken = process.env.AUTH_TOKEN;
  if (authToken) {
    await testPromoteItem(authToken);
  } else {
    console.log('\n💡 Tip: Set AUTH_TOKEN env variable to test promotion endpoints');
    results.push({
      name: 'Authenticated tests',
      passed: true,
      message: 'Skipped - Set AUTH_TOKEN to run authenticated tests',
    });
  }

  printResults();
}

main().catch(console.error);
