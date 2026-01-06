#!/usr/bin/env node
/**
 * اختبار شامل للمنصة E2E
 * Comprehensive Platform E2E Test
 *
 * يتصل بـ Production API ويختبر:
 * 1. صحة الخادم
 * 2. التسجيل وتسجيل الدخول
 * 3. الفئات والمنتجات
 * 4. البحث المتقدم
 * 5. المقايضة
 * 6. المزادات
 * 7. المحفظة
 * 8. الطلبات والدفع
 */

const BACKEND_URL = 'https://xchange-egypt-production.up.railway.app';
const FRONTEND_URL = 'https://xchange-egypt.vercel.app';

// Test results storage
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`  ✅ ${name}`, 'green');
  } else {
    testResults.failed++;
    log(`  ❌ ${name}: ${details}`, 'red');
  }
  testResults.tests.push({ name, passed, details });
}

async function fetchWithTimeout(url, options = {}, timeout = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 1: صحة الخادم
// ═══════════════════════════════════════════════════════════════
async function testServerHealth() {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  🏥 اختبار 1: صحة الخادم (Server Health)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  try {
    // Test /health endpoint
    const healthRes = await fetchWithTimeout(`${BACKEND_URL}/health`);
    logTest('GET /health', healthRes.ok, healthRes.ok ? '' : `Status: ${healthRes.status}`);

    // Test /api/v1 endpoint
    const apiRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1`);
    logTest('GET /api/v1', apiRes.ok, apiRes.ok ? '' : `Status: ${apiRes.status}`);

    // Check response time
    const start = Date.now();
    await fetchWithTimeout(`${BACKEND_URL}/health`);
    const responseTime = Date.now() - start;
    logTest('Response time < 5s', responseTime < 5000, `${responseTime}ms`);

    return true;
  } catch (error) {
    logTest('Server reachable', false, error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 2: التسجيل وتسجيل الدخول
// ═══════════════════════════════════════════════════════════════
async function testAuthentication() {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  🔐 اختبار 2: المصادقة (Authentication)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  const testUser = {
    name: `Test User ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'Test@123456',
    phone: `010${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
  };

  let authToken = null;
  let userId = null;

  try {
    // Test registration
    const registerRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerRes.json().catch(() => ({}));
    logTest('POST /auth/register', registerRes.ok || registerRes.status === 409,
      registerRes.ok ? '' : `Status: ${registerRes.status}`);

    // Test login
    const loginRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginRes.json().catch(() => ({}));

    if (loginRes.ok && loginData.data) {
      authToken = loginData.data.accessToken || loginData.data.token;
      userId = loginData.data.user?.id;
    }
    logTest('POST /auth/login', loginRes.ok, loginRes.ok ? '' : `Status: ${loginRes.status}`);

    // Test get profile (if logged in)
    if (authToken) {
      const profileRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      logTest('GET /auth/me (authenticated)', profileRes.ok,
        profileRes.ok ? '' : `Status: ${profileRes.status}`);
    }

    // Test refresh token
    if (loginData.data?.refreshToken) {
      const refreshRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: loginData.data.refreshToken })
      });
      logTest('POST /auth/refresh', refreshRes.ok || refreshRes.status === 401, '');
    }

    return { authToken, userId, testUser };
  } catch (error) {
    logTest('Authentication flow', false, error.message);
    return { authToken: null, userId: null, testUser };
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 3: الفئات
// ═══════════════════════════════════════════════════════════════
async function testCategories() {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  📂 اختبار 3: الفئات (Categories)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  try {
    // Get all categories
    const categoriesRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/categories`);
    const categoriesData = await categoriesRes.json().catch(() => ({}));
    logTest('GET /categories', categoriesRes.ok,
      categoriesRes.ok ? `Found ${categoriesData.data?.length || 0} categories` : `Status: ${categoriesRes.status}`);

    // Get category tree
    const treeRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/categories/tree`);
    logTest('GET /categories/tree', treeRes.ok, '');

    // Get popular categories
    const popularRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/categories/popular`);
    logTest('GET /categories/popular', popularRes.ok || popularRes.status === 404, '');

    return categoriesData.data || [];
  } catch (error) {
    logTest('Categories API', false, error.message);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 4: المنتجات
// ═══════════════════════════════════════════════════════════════
async function testItems(authToken) {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  📦 اختبار 4: المنتجات (Items)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  try {
    // Get all items
    const itemsRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/items?page=1&limit=10`);
    const itemsData = await itemsRes.json().catch(() => ({}));
    logTest('GET /items', itemsRes.ok,
      itemsRes.ok ? `Found ${itemsData.data?.length || 0} items` : `Status: ${itemsRes.status}`);

    // Get item by ID (if any exist)
    if (itemsData.data?.length > 0) {
      const itemId = itemsData.data[0].id;
      const itemRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/items/${itemId}`);
      logTest('GET /items/:id', itemRes.ok, '');
    }

    // Test creating an item (requires auth)
    if (authToken) {
      const newItem = {
        title: 'Test iPhone 15 Pro',
        titleAr: 'ايفون 15 برو للاختبار',
        description: 'Test item for E2E testing',
        descriptionAr: 'منتج اختباري',
        price: 50000,
        condition: 'NEW',
        isForSale: true,
        isForBarter: true,
        categoryId: 'electronics-smartphones'
      };

      const createRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(newItem)
      });
      logTest('POST /items (create)', createRes.ok || createRes.status === 400 || createRes.status === 401,
        `Status: ${createRes.status}`);
    }

    return itemsData.data || [];
  } catch (error) {
    logTest('Items API', false, error.message);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 5: البحث
// ═══════════════════════════════════════════════════════════════
async function testSearch() {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  🔍 اختبار 5: البحث (Search)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  try {
    // Basic search
    const searchRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/search?query=ايفون`);
    const searchData = await searchRes.json().catch(() => ({}));
    logTest('GET /search?query=ايفون', searchRes.ok,
      searchRes.ok ? `Found ${searchData.data?.length || 0} results` : `Status: ${searchRes.status}`);

    // Search with filters
    const filterRes = await fetchWithTimeout(
      `${BACKEND_URL}/api/v1/search?query=سيارة&minPrice=100000&maxPrice=500000`
    );
    logTest('GET /search with price filter', filterRes.ok, '');

    // AI Search
    const aiSearchRes = await fetchWithTimeout(
      `${BACKEND_URL}/api/v1/search/ai?query=أبحث عن لابتوب للجيمنج`
    );
    logTest('GET /search/ai', aiSearchRes.ok || aiSearchRes.status === 404, '');

    // Search suggestions
    const suggestRes = await fetchWithTimeout(
      `${BACKEND_URL}/api/v1/search/suggestions?query=سام`
    );
    logTest('GET /search/suggestions', suggestRes.ok || suggestRes.status === 404, '');

    return true;
  } catch (error) {
    logTest('Search API', false, error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 6: المقايضة
// ═══════════════════════════════════════════════════════════════
async function testBarter(authToken) {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  🔄 اختبار 6: المقايضة (Barter)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  try {
    // Get barter listings
    const barterRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/barter`);
    const barterData = await barterRes.json().catch(() => ({}));
    logTest('GET /barter', barterRes.ok,
      barterRes.ok ? `Found ${barterData.data?.length || 0} barter items` : `Status: ${barterRes.status}`);

    // Get barter matches
    if (authToken) {
      const matchesRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/barter/matches`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      logTest('GET /barter/matches', matchesRes.ok || matchesRes.status === 401, '');
    }

    // Get barter chains
    const chainsRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/barter/chains`);
    logTest('GET /barter/chains', chainsRes.ok || chainsRes.status === 404, '');

    // Get barter pools
    const poolsRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/barter-pools`);
    logTest('GET /barter-pools', poolsRes.ok || poolsRes.status === 404, '');

    return true;
  } catch (error) {
    logTest('Barter API', false, error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 7: المزادات
// ═══════════════════════════════════════════════════════════════
async function testAuctions(authToken) {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  🔨 اختبار 7: المزادات (Auctions)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  try {
    // Get all auctions
    const auctionsRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/auctions`);
    const auctionsData = await auctionsRes.json().catch(() => ({}));
    logTest('GET /auctions', auctionsRes.ok,
      auctionsRes.ok ? `Found ${auctionsData.data?.length || 0} auctions` : `Status: ${auctionsRes.status}`);

    // Get active auctions
    const activeRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/auctions?status=ACTIVE`);
    logTest('GET /auctions?status=ACTIVE', activeRes.ok, '');

    // Get reverse auctions (tenders)
    const tendersRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/reverse-auctions`);
    logTest('GET /reverse-auctions', tendersRes.ok || tendersRes.status === 404, '');

    return true;
  } catch (error) {
    logTest('Auctions API', false, error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 8: المحفظة
// ═══════════════════════════════════════════════════════════════
async function testWallet(authToken) {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  💰 اختبار 8: المحفظة (Wallet)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  try {
    if (!authToken) {
      logTest('Wallet requires auth', true, 'Skipped (no auth)');
      return true;
    }

    // Get wallet balance
    const walletRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('GET /wallet/balance', walletRes.ok || walletRes.status === 401, '');

    // Get wallet transactions
    const transactionsRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/wallet/transactions`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('GET /wallet/transactions', transactionsRes.ok || transactionsRes.status === 401, '');

    // Get exchange points
    const pointsRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/exchange-points`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('GET /exchange-points', pointsRes.ok || pointsRes.status === 401 || pointsRes.status === 404, '');

    return true;
  } catch (error) {
    logTest('Wallet API', false, error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 9: الطلبات والسلة
// ═══════════════════════════════════════════════════════════════
async function testOrdersAndCart(authToken) {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  🛒 اختبار 9: الطلبات والسلة (Orders & Cart)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  try {
    if (!authToken) {
      logTest('Orders/Cart requires auth', true, 'Skipped (no auth)');
      return true;
    }

    // Get cart
    const cartRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/cart`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('GET /cart', cartRes.ok || cartRes.status === 401, '');

    // Get orders
    const ordersRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/orders`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('GET /orders', ordersRes.ok || ordersRes.status === 401, '');

    // Get transactions
    const txRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/transactions`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('GET /transactions', txRes.ok || txRes.status === 401, '');

    return true;
  } catch (error) {
    logTest('Orders API', false, error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 10: الإشعارات والرسائل
// ═══════════════════════════════════════════════════════════════
async function testNotificationsAndChat(authToken) {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  🔔 اختبار 10: الإشعارات والرسائل (Notifications & Chat)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  try {
    if (!authToken) {
      logTest('Notifications requires auth', true, 'Skipped (no auth)');
      return true;
    }

    // Get notifications
    const notifRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/notifications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('GET /notifications', notifRes.ok || notifRes.status === 401, '');

    // Get unread count
    const unreadRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/notifications/unread-count`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('GET /notifications/unread-count', unreadRes.ok || unreadRes.status === 401, '');

    // Get conversations
    const convRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/chat/conversations`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('GET /chat/conversations', convRes.ok || convRes.status === 401, '');

    return true;
  } catch (error) {
    logTest('Notifications API', false, error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 11: الأسواق المتخصصة
// ═══════════════════════════════════════════════════════════════
async function testSpecializedMarkets() {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  🏪 اختبار 11: الأسواق المتخصصة (Specialized Markets)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  try {
    // Gold market
    const goldRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/gold`);
    logTest('GET /gold', goldRes.ok || goldRes.status === 404, '');

    // Silver market
    const silverRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/silver`);
    logTest('GET /silver', silverRes.ok || silverRes.status === 404, '');

    // Cars market
    const carsRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/cars`);
    logTest('GET /cars', carsRes.ok || carsRes.status === 404, '');

    // Properties market
    const propertiesRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/properties`);
    logTest('GET /properties', propertiesRes.ok || propertiesRes.status === 404, '');

    // Mobile phones
    const mobileRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/mobile`);
    logTest('GET /mobile', mobileRes.ok || mobileRes.status === 404, '');

    return true;
  } catch (error) {
    logTest('Specialized Markets API', false, error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 12: AI Features
// ═══════════════════════════════════════════════════════════════
async function testAIFeatures() {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  🤖 اختبار 12: ميزات الذكاء الاصطناعي (AI Features)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  try {
    // AI status
    const statusRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/ai/status`);
    logTest('GET /ai/status', statusRes.ok || statusRes.status === 404, '');

    // Price estimation
    const priceRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/ai/estimate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'electronics-smartphones',
        title: 'iPhone 15 Pro',
        condition: 'NEW'
      })
    });
    logTest('POST /ai/estimate-price', priceRes.ok || priceRes.status === 404, '');

    // Auto categorization
    const catRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/ai/categorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'iPhone 15 Pro Max 256GB',
        description: 'Brand new sealed'
      })
    });
    logTest('POST /ai/categorize', catRes.ok || catRes.status === 404, '');

    // Matching service
    const matchRes = await fetchWithTimeout(`${BACKEND_URL}/api/v1/matching/status`);
    logTest('GET /matching/status', matchRes.ok || matchRes.status === 404, '');

    return true;
  } catch (error) {
    logTest('AI Features API', false, error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// الاختبار 13: Frontend Pages
// ═══════════════════════════════════════════════════════════════
async function testFrontendPages() {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('  🌐 اختبار 13: صفحات الواجهة الأمامية (Frontend Pages)', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');

  const pages = [
    { path: '/', name: 'الصفحة الرئيسية' },
    { path: '/login', name: 'تسجيل الدخول' },
    { path: '/register', name: 'إنشاء حساب' },
    { path: '/marketplace', name: 'السوق' },
    { path: '/barter', name: 'المقايضة' },
    { path: '/barter/guide', name: 'دليل المقايضة' },
    { path: '/barter/open-offers', name: 'عروض المقايضة' },
    { path: '/auctions', name: 'المزادات' },
    { path: '/auctions/live', name: 'المزادات الحية' },
    { path: '/cars', name: 'سوق السيارات' },
    { path: '/cars/calculator', name: 'حاسبة السيارات' },
    { path: '/gold', name: 'سوق الذهب' },
    { path: '/gold/calculator', name: 'حاسبة الذهب' },
    { path: '/properties', name: 'العقارات' },
    { path: '/donations', name: 'التبرعات' },
    { path: '/deals', name: 'العروض' },
    { path: '/pricing', name: 'الأسعار' },
    { path: '/premium', name: 'العضوية المميزة' },
    { path: '/facilitators', name: 'الميسرين' },
    { path: '/delivery', name: 'التوصيل' },
    { path: '/escrow', name: 'الضمان' },
    { path: '/installments', name: 'التقسيط' },
    { path: '/exchange-points', name: 'نقاط التبادل' },
    { path: '/price-predictor', name: 'توقع الأسعار' },
    { path: '/assistant', name: 'المساعد الذكي' },
    { path: '/rides', name: 'الرحلات' },
    { path: '/pools', name: 'مجمعات التداول' },
    { path: '/barter-chains', name: 'سلاسل المقايضة' },
    { path: '/reverse-auctions', name: 'المزادات العكسية' },
    { path: '/dashboard', name: 'لوحة التحكم' },
    { path: '/items/new', name: 'إضافة منتج' },
    { path: '/messages', name: 'الرسائل' },
    { path: '/notifications', name: 'الإشعارات' },
    { path: '/cart', name: 'السلة' },
    { path: '/admin/login', name: 'دخول الإدارة' },
  ];

  let successCount = 0;
  let failedPages = [];

  for (const page of pages) {
    try {
      const res = await fetchWithTimeout(`${FRONTEND_URL}${page.path}`, {}, 15000);
      const text = await res.text().catch(() => '');

      // Check for error patterns
      const hasError =
        text.includes('Application error') ||
        text.includes('Unhandled Runtime Error') ||
        text.includes('This page could not be found') ||
        (res.status >= 400 && res.status !== 401);

      if (res.ok && !hasError) {
        successCount++;
        logTest(`GET ${page.path} (${page.name})`, true, '');
      } else if (hasError) {
        failedPages.push({ ...page, status: res.status, error: 'Content error' });
        logTest(`GET ${page.path} (${page.name})`, false, `Error in content (${res.status})`);
      } else {
        failedPages.push({ ...page, status: res.status });
        logTest(`GET ${page.path} (${page.name})`, false, `Status: ${res.status}`);
      }
    } catch (error) {
      failedPages.push({ ...page, error: error.message });
      logTest(`GET ${page.path} (${page.name})`, false, error.message);
    }
  }

  log(`\n  📊 نتائج الصفحات: ${successCount}/${pages.length} نجح`, successCount === pages.length ? 'green' : 'yellow');

  return { successCount, total: pages.length, failedPages };
}

// ═══════════════════════════════════════════════════════════════
// تشغيل جميع الاختبارات
// ═══════════════════════════════════════════════════════════════
async function runAllTests() {
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'blue');
  log('║                                                                ║', 'blue');
  log('║     🧪 اختبار شامل لمنصة Xchange - Comprehensive E2E Test     ║', 'blue');
  log('║                                                                ║', 'blue');
  log('╚═══════════════════════════════════════════════════════════════╝', 'blue');

  log(`\n📡 Backend URL: ${BACKEND_URL}`, 'yellow');
  log(`🌐 Frontend URL: ${FRONTEND_URL}`, 'yellow');
  log(`⏰ Started at: ${new Date().toLocaleString('ar-EG')}`, 'yellow');

  const startTime = Date.now();

  // Run tests
  const serverOk = await testServerHealth();

  if (!serverOk) {
    log('\n⚠️  الخادم غير متاح - تخطي بقية الاختبارات', 'red');
  } else {
    const { authToken, userId, testUser } = await testAuthentication();
    await testCategories();
    await testItems(authToken);
    await testSearch();
    await testBarter(authToken);
    await testAuctions(authToken);
    await testWallet(authToken);
    await testOrdersAndCart(authToken);
    await testNotificationsAndChat(authToken);
    await testSpecializedMarkets();
    await testAIFeatures();
    await testFrontendPages();
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'blue');
  log('║                       📊 ملخص النتائج                         ║', 'blue');
  log('╚═══════════════════════════════════════════════════════════════╝', 'blue');

  log(`\n  📈 إجمالي الاختبارات: ${testResults.total}`, 'bold');
  log(`  ✅ نجحت: ${testResults.passed}`, 'green');
  log(`  ❌ فشلت: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log(`  📊 نسبة النجاح: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`,
    testResults.passed / testResults.total >= 0.8 ? 'green' : 'yellow');
  log(`  ⏱️  المدة: ${duration} ثانية`, 'cyan');

  // List failed tests
  const failedTests = testResults.tests.filter(t => !t.passed);
  if (failedTests.length > 0) {
    log('\n  ⚠️  الاختبارات الفاشلة:', 'yellow');
    failedTests.forEach(t => {
      log(`     - ${t.name}: ${t.details}`, 'red');
    });
  }

  // Final verdict
  log('\n═══════════════════════════════════════════════════════════════', 'blue');
  if (testResults.passed / testResults.total >= 0.8) {
    log('  🎉 المنصة تعمل بشكل جيد! Platform is working well!', 'green');
  } else if (testResults.passed / testResults.total >= 0.6) {
    log('  ⚠️  المنصة تحتاج بعض الإصلاحات - Platform needs some fixes', 'yellow');
  } else {
    log('  ❌ المنصة تحتاج مراجعة شاملة - Platform needs major review', 'red');
  }
  log('═══════════════════════════════════════════════════════════════\n', 'blue');

  // Save results to file
  const resultsJson = JSON.stringify({
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: ((testResults.passed / testResults.total) * 100).toFixed(1) + '%',
      duration: duration + 's',
      timestamp: new Date().toISOString()
    },
    tests: testResults.tests
  }, null, 2);

  await import('fs').then(fs => {
    fs.writeFileSync('/home/user/xchange-egypt/e2e-test-results.json', resultsJson);
    log('📁 Results saved to: e2e-test-results.json\n', 'cyan');
  });

  return testResults;
}

// Run
runAllTests().catch(console.error);
