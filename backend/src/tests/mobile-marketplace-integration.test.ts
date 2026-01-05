/**
 * Mobile Marketplace Integration Tests
 * اختبارات تكامل سوق الموبايلات
 *
 * هذا الملف يختبر المعاملات الحقيقية كأن مستخدم فعلي يستخدم المنصة
 */

import prisma from '../lib/prisma';

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
};

// Test results storage
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
  duration: number;
}

const testResults: TestResult[] = [];
let authToken: string = '';
let testUserId: string = '';
let secondUserToken: string = '';
let secondUserId: string = '';
let createdListingId: string = '';
let createdTransactionId: string = '';

// Helper function to log test results
function logTest(name: string, passed: boolean, error?: string, details?: any, duration: number = 0) {
  testResults.push({ name, passed, error, details, duration });
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}${error ? `: ${error}` : ''} (${duration}ms)`);
}

// Helper function to make API calls
async function apiCall(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
): Promise<{ status: number; data: any; error?: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error: any) {
    return { status: 0, data: null, error: error.message };
  }
}

// ============================================
// المرحلة 1: اختبار التسجيل وتسجيل الدخول
// ============================================

async function testAuthentication() {
  console.log('\n📋 المرحلة 1: اختبار المصادقة (Authentication)\n');

  const startTime = Date.now();

  // Test 1.1: Register first user (seller)
  const seller = {
    fullName: `Test Seller ${Date.now()}`,
    email: `seller_${Date.now()}@test.com`,
    password: 'Test@123456',
    phone: `010${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
  };

  let result = await apiCall('/auth/register', 'POST', seller);
  let duration = Date.now() - startTime;

  if (result.status === 201 || result.status === 200) {
    authToken = result.data.data?.accessToken || result.data.data?.token;
    testUserId = result.data.data?.user?.id;
    logTest('1.1 تسجيل مستخدم بائع', true, undefined, { userId: testUserId }, duration);
  } else {
    logTest('1.1 تسجيل مستخدم بائع', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 1.2: Register second user (buyer)
  const buyer = {
    fullName: `Test Buyer ${Date.now()}`,
    email: `buyer_${Date.now()}@test.com`,
    password: 'Test@123456',
    phone: `011${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
  };

  const startTime2 = Date.now();
  result = await apiCall('/auth/register', 'POST', buyer);
  duration = Date.now() - startTime2;

  if (result.status === 201 || result.status === 200) {
    secondUserToken = result.data.data?.accessToken || result.data.data?.token;
    secondUserId = result.data.data?.user?.id;
    logTest('1.2 تسجيل مستخدم مشتري', true, undefined, { userId: secondUserId }, duration);
  } else {
    logTest('1.2 تسجيل مستخدم مشتري', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 1.3: Login test
  const startTime3 = Date.now();
  result = await apiCall('/auth/login', 'POST', {
    email: seller.email,
    password: seller.password,
  });
  duration = Date.now() - startTime3;

  if (result.status === 200 && result.data.data?.accessToken) {
    authToken = result.data.data.accessToken;
    logTest('1.3 تسجيل دخول البائع', true, undefined, undefined, duration);
  } else {
    logTest('1.3 تسجيل دخول البائع', false, result.data?.error || 'No token received', result.data, duration);
  }
}

// ============================================
// المرحلة 2: اختبار إنشاء إعلان موبايل
// ============================================

async function testCreateMobileListing() {
  console.log('\n📱 المرحلة 2: اختبار إنشاء إعلان موبايل\n');

  if (!authToken) {
    logTest('2.0 التحقق من المصادقة', false, 'No auth token available', undefined, 0);
    return;
  }

  // Test 2.1: Create mobile listing
  const listing = {
    brand: 'APPLE',
    model: 'iPhone 13 Pro',
    storageGb: 256,
    color: 'سييرا الأزرق',
    conditionGrade: 'A',
    batteryHealth: 92,
    askingPrice: 35000,
    acceptsBarter: true,
    barterPreferences: {
      wanted_brands: ['SAMSUNG', 'APPLE'],
      min_value_percent: 80,
      max_value_percent: 120,
    },
    description: 'iPhone 13 Pro بحالة ممتازة، استخدام شخصي، مع جميع الملحقات الأصلية',
    imeiNumber: `35${Date.now().toString().slice(-13)}`,
    governorate: 'CAIRO',
    deliveryOptions: ['MEETUP', 'SHIPPING'],
    warrantyRemaining: 3,
    images: ['https://example.com/iphone.jpg'],
  };

  const startTime = Date.now();
  let result = await apiCall('/mobile/listings', 'POST', listing, authToken);
  let duration = Date.now() - startTime;

  if (result.status === 201 || result.status === 200) {
    createdListingId = result.data.data?.id;
    logTest('2.1 إنشاء إعلان موبايل', true, undefined, { listingId: createdListingId }, duration);
  } else {
    logTest('2.1 إنشاء إعلان موبايل', false, result.data?.error || result.error, result.data, duration);

    // Try alternative approach - check if it's a validation error
    if (result.data?.error?.includes('validation') || result.data?.error?.includes('required')) {
      console.log('   ⚠️ Validation Error Details:', JSON.stringify(result.data, null, 2));
    }
  }

  // Test 2.2: Get my listings
  const startTime2 = Date.now();
  result = await apiCall('/mobile/my-listings', 'GET', undefined, authToken);
  duration = Date.now() - startTime2;

  if (result.status === 200) {
    logTest('2.2 جلب إعلاناتي', true, undefined, { count: result.data.data?.length || 0 }, duration);
  } else {
    logTest('2.2 جلب إعلاناتي', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 2.3: Get listing by ID
  if (createdListingId) {
    const startTime3 = Date.now();
    result = await apiCall(`/mobile/listings/${createdListingId}`, 'GET');
    duration = Date.now() - startTime3;

    if (result.status === 200) {
      logTest('2.3 جلب تفاصيل الإعلان', true, undefined, { brand: result.data.data?.brand }, duration);
    } else {
      logTest('2.3 جلب تفاصيل الإعلان', false, result.data?.error || result.error, result.data, duration);
    }
  }
}

// ============================================
// المرحلة 3: اختبار البحث والفلترة
// ============================================

async function testSearchAndFilter() {
  console.log('\n🔍 المرحلة 3: اختبار البحث والفلترة\n');

  // Test 3.1: Get all listings
  let startTime = Date.now();
  let result = await apiCall('/mobile/listings');
  let duration = Date.now() - startTime;

  if (result.status === 200) {
    logTest('3.1 جلب جميع الإعلانات', true, undefined, { count: result.data.data?.length || 0 }, duration);
  } else {
    logTest('3.1 جلب جميع الإعلانات', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 3.2: Filter by brand
  startTime = Date.now();
  result = await apiCall('/mobile/listings?brand=APPLE');
  duration = Date.now() - startTime;

  if (result.status === 200) {
    logTest('3.2 فلترة حسب الماركة (Apple)', true, undefined, { count: result.data.data?.length || 0 }, duration);
  } else {
    logTest('3.2 فلترة حسب الماركة', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 3.3: Filter by price range
  startTime = Date.now();
  result = await apiCall('/mobile/listings?minPrice=10000&maxPrice=50000');
  duration = Date.now() - startTime;

  if (result.status === 200) {
    logTest('3.3 فلترة حسب السعر', true, undefined, { count: result.data.data?.length || 0 }, duration);
  } else {
    logTest('3.3 فلترة حسب السعر', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 3.4: Get price references
  startTime = Date.now();
  result = await apiCall('/mobile/prices');
  duration = Date.now() - startTime;

  if (result.status === 200) {
    logTest('3.4 جلب الأسعار المرجعية', true, undefined, { count: result.data.data?.length || 0 }, duration);
  } else {
    logTest('3.4 جلب الأسعار المرجعية', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 3.5: Calculate price
  startTime = Date.now();
  result = await apiCall('/mobile/calculate-price', 'POST', {
    brand: 'APPLE',
    model: 'iPhone 13',
    storageGb: 128,
    conditionGrade: 'B',
    batteryHealth: 85,
  });
  duration = Date.now() - startTime;

  if (result.status === 200) {
    logTest('3.5 حاسبة السعر', true, undefined, result.data.data?.estimatedPrice, duration);
  } else {
    logTest('3.5 حاسبة السعر', false, result.data?.error || result.error, result.data, duration);
  }
}

// ============================================
// المرحلة 4: اختبار المعاملات (Transactions)
// ============================================

async function testTransactions() {
  console.log('\n💰 المرحلة 4: اختبار المعاملات\n');

  if (!createdListingId || !secondUserToken) {
    logTest('4.0 التحقق من المتطلبات', false, 'Missing listing ID or buyer token', undefined, 0);
    return;
  }

  // Test 4.1: Create transaction (buyer purchases listing)
  let startTime = Date.now();
  let result = await apiCall('/mobile/transactions', 'POST', {
    listingId: createdListingId,
    paymentMethod: 'CASH',
    deliveryOption: 'MEETUP',
    meetupLocation: 'مدينة نصر، القاهرة',
    notes: 'أريد معاينة الجهاز قبل الشراء',
  }, secondUserToken);
  let duration = Date.now() - startTime;

  if (result.status === 201 || result.status === 200) {
    createdTransactionId = result.data.data?.id;
    logTest('4.1 إنشاء معاملة شراء', true, undefined, { transactionId: createdTransactionId }, duration);
  } else {
    logTest('4.1 إنشاء معاملة شراء', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 4.2: Get buyer transactions
  startTime = Date.now();
  result = await apiCall('/mobile/transactions', 'GET', undefined, secondUserToken);
  duration = Date.now() - startTime;

  if (result.status === 200) {
    logTest('4.2 جلب معاملات المشتري', true, undefined, { count: result.data.data?.length || 0 }, duration);
  } else {
    logTest('4.2 جلب معاملات المشتري', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 4.3: Get seller transactions
  startTime = Date.now();
  result = await apiCall('/mobile/transactions', 'GET', undefined, authToken);
  duration = Date.now() - startTime;

  if (result.status === 200) {
    logTest('4.3 جلب معاملات البائع', true, undefined, { count: result.data.data?.length || 0 }, duration);
  } else {
    logTest('4.3 جلب معاملات البائع', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 4.4: Update transaction status (seller accepts)
  if (createdTransactionId) {
    startTime = Date.now();
    result = await apiCall(`/mobile/transactions/${createdTransactionId}/status`, 'PUT', {
      status: 'ACCEPTED',
    }, authToken);
    duration = Date.now() - startTime;

    if (result.status === 200) {
      logTest('4.4 قبول المعاملة من البائع', true, undefined, undefined, duration);
    } else {
      logTest('4.4 قبول المعاملة من البائع', false, result.data?.error || result.error, result.data, duration);
    }
  }

  // Test 4.5: Confirm delivery (buyer confirms)
  if (createdTransactionId) {
    startTime = Date.now();
    result = await apiCall(`/mobile/transactions/${createdTransactionId}/confirm-delivery`, 'POST', {
      confirmed: true,
      rating: 5,
      review: 'جهاز ممتاز، البائع أمين جداً',
    }, secondUserToken);
    duration = Date.now() - startTime;

    if (result.status === 200) {
      logTest('4.5 تأكيد الاستلام', true, undefined, undefined, duration);
    } else {
      logTest('4.5 تأكيد الاستلام', false, result.data?.error || result.error, result.data, duration);
    }
  }
}

// ============================================
// المرحلة 5: اختبار نظام المقايضة (Barter)
// ============================================

async function testBarterSystem() {
  console.log('\n🔄 المرحلة 5: اختبار نظام المقايضة\n');

  if (!createdListingId || !secondUserToken) {
    logTest('5.0 التحقق من المتطلبات', false, 'Missing listing ID or second user token', undefined, 0);
    return;
  }

  // Test 5.1: Create barter proposal
  let startTime = Date.now();
  let result = await apiCall('/mobile/barter/propose', 'POST', {
    targetListingId: createdListingId,
    offeredItems: [{
      brand: 'SAMSUNG',
      model: 'Galaxy S22',
      storageGb: 128,
      conditionGrade: 'B',
      estimatedValue: 28000,
      description: 'سامسونج S22 بحالة جيدة جداً',
    }],
    cashAddition: 5000,
    message: 'مرحباً، أعرض عليك المقايضة مع إضافة نقدية',
  }, secondUserToken);
  let duration = Date.now() - startTime;

  if (result.status === 201 || result.status === 200) {
    logTest('5.1 إنشاء عرض مقايضة', true, undefined, { proposalId: result.data.data?.id }, duration);
  } else {
    logTest('5.1 إنشاء عرض مقايضة', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 5.2: Get received barter proposals (seller)
  startTime = Date.now();
  result = await apiCall('/mobile/barter/proposals/received', 'GET', undefined, authToken);
  duration = Date.now() - startTime;

  if (result.status === 200) {
    logTest('5.2 جلب عروض المقايضة الواردة', true, undefined, { count: result.data.data?.length || 0 }, duration);
  } else {
    logTest('5.2 جلب عروض المقايضة الواردة', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 5.3: Get barter suggestions
  startTime = Date.now();
  result = await apiCall('/mobile/barter/suggestions', 'GET', undefined, authToken);
  duration = Date.now() - startTime;

  if (result.status === 200) {
    logTest('5.3 جلب اقتراحات المقايضة', true, undefined, { count: result.data.data?.length || 0 }, duration);
  } else {
    logTest('5.3 جلب اقتراحات المقايضة', false, result.data?.error || result.error, result.data, duration);
  }
}

// ============================================
// المرحلة 6: اختبار التحقق من IMEI
// ============================================

async function testIMEIVerification() {
  console.log('\n🔐 المرحلة 6: اختبار التحقق من IMEI\n');

  // Test 6.1: Check IMEI (public)
  let startTime = Date.now();
  let result = await apiCall('/mobile/verify/imei/check', 'POST', {
    imei: '353456789012345',
  });
  let duration = Date.now() - startTime;

  if (result.status === 200) {
    logTest('6.1 فحص IMEI (عام)', true, undefined, result.data.data, duration);
  } else {
    logTest('6.1 فحص IMEI (عام)', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 6.2: Full IMEI verification (authenticated)
  if (authToken) {
    startTime = Date.now();
    result = await apiCall('/mobile/verify/imei', 'POST', {
      imei: '353456789012345',
    }, authToken);
    duration = Date.now() - startTime;

    if (result.status === 200) {
      logTest('6.2 التحقق الكامل من IMEI', true, undefined, result.data.data, duration);
    } else {
      logTest('6.2 التحقق الكامل من IMEI', false, result.data?.error || result.error, result.data, duration);
    }
  }
}

// ============================================
// المرحلة 7: اختبار المفضلة والتنبيهات
// ============================================

async function testFavoritesAndAlerts() {
  console.log('\n⭐ المرحلة 7: اختبار المفضلة والتنبيهات\n');

  if (!authToken || !createdListingId) {
    logTest('7.0 التحقق من المتطلبات', false, 'Missing auth token or listing ID', undefined, 0);
    return;
  }

  // Test 7.1: Add to favorites
  let startTime = Date.now();
  let result = await apiCall(`/mobile/favorites/${createdListingId}`, 'POST', undefined, secondUserToken);
  let duration = Date.now() - startTime;

  if (result.status === 200 || result.status === 201) {
    logTest('7.1 إضافة للمفضلة', true, undefined, undefined, duration);
  } else {
    logTest('7.1 إضافة للمفضلة', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 7.2: Get favorites
  startTime = Date.now();
  result = await apiCall('/mobile/favorites', 'GET', undefined, secondUserToken);
  duration = Date.now() - startTime;

  if (result.status === 200) {
    logTest('7.2 جلب المفضلة', true, undefined, { count: result.data.data?.length || 0 }, duration);
  } else {
    logTest('7.2 جلب المفضلة', false, result.data?.error || result.error, result.data, duration);
  }

  // Test 7.3: Create price alert
  startTime = Date.now();
  result = await apiCall('/mobile/alerts', 'POST', {
    brand: 'APPLE',
    model: 'iPhone 14',
    maxPrice: 40000,
    condition: 'A',
  }, authToken);
  duration = Date.now() - startTime;

  if (result.status === 200 || result.status === 201) {
    logTest('7.3 إنشاء تنبيه سعر', true, undefined, { alertId: result.data.data?.id }, duration);
  } else {
    logTest('7.3 إنشاء تنبيه سعر', false, result.data?.error || result.error, result.data, duration);
  }
}

// ============================================
// تقرير النتائج النهائي
// ============================================

function generateReport() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    📊 تقرير الاختبارات الشامل                   ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  const passed = testResults.filter(t => t.passed).length;
  const failed = testResults.filter(t => !t.passed).length;
  const total = testResults.length;
  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

  console.log(`  إجمالي الاختبارات: ${total}`);
  console.log(`  ✅ نجح: ${passed}`);
  console.log(`  ❌ فشل: ${failed}`);
  console.log(`  📈 نسبة النجاح: ${successRate}%`);
  console.log('');

  if (failed > 0) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    ❌ الاختبارات الفاشلة                        ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');

    testResults.filter(t => !t.passed).forEach((test, index) => {
      console.log(`${index + 1}. ${test.name}`);
      console.log(`   الخطأ: ${test.error}`);
      if (test.details) {
        console.log(`   التفاصيل: ${JSON.stringify(test.details, null, 2)}`);
      }
      console.log('');
    });
  }

  console.log('═══════════════════════════════════════════════════════════════');

  return {
    total,
    passed,
    failed,
    successRate: parseFloat(successRate),
    results: testResults,
  };
}

// ============================================
// Main Test Runner
// ============================================

export async function runMobileMarketplaceTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('        🚀 بدء اختبارات سوق الموبايلات الشاملة                   ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`   الوقت: ${new Date().toLocaleString('ar-EG')}`);
  console.log('');

  try {
    await testAuthentication();
    await testCreateMobileListing();
    await testSearchAndFilter();
    await testTransactions();
    await testBarterSystem();
    await testIMEIVerification();
    await testFavoritesAndAlerts();
  } catch (error: any) {
    console.error('Fatal error during tests:', error.message);
  }

  return generateReport();
}

// Jest test wrapper
describe('Mobile Marketplace Integration Tests', () => {
  it('should export runMobileMarketplaceTests function', () => {
    expect(typeof runMobileMarketplaceTests).toBe('function');
  });

  it('should have valid test configuration', () => {
    expect(TEST_CONFIG).toBeDefined();
    expect(TEST_CONFIG.baseUrl).toBeTruthy();
  });
});

// Run if executed directly
if (require.main === module) {
  runMobileMarketplaceTests()
    .then((report) => {
      process.exit(report.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}
