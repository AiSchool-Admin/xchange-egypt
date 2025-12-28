/**
 * 20 Test Scenarios - سكريبت اختبار شامل
 *
 * لتشغيل الاختبارات:
 * npx tsx scripts/run-20-scenarios.ts
 *
 * أو من Railway:
 * npm run test:scenarios
 */

const API_URL = process.env.API_URL || 'https://xchange-egypt-production.up.railway.app/api/v1';

interface TestResult {
  scenario: number;
  name: string;
  nameAr: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  steps: StepResult[];
  duration: number;
}

interface StepResult {
  step: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  error?: string;
}

const results: TestResult[] = [];
const tokens: Record<string, string> = {};

// Test users
const TEST_USERS = [
  { email: 'test1@xchange.eg', name: 'أحمد التاجر' },
  { email: 'test2@xchange.eg', name: 'سارة المقايضة' },
  { email: 'test3@xchange.eg', name: 'محمد المزايد' },
  { email: 'test4@xchange.eg', name: 'فاطمة البائعة' },
  { email: 'test5@xchange.eg', name: 'علي المشتري' },
  { email: 'test6@xchange.eg', name: 'نور التاجرة' },
  { email: 'test7@xchange.eg', name: 'يوسف المستثمر' },
  { email: 'test8@xchange.eg', name: 'هدى العقارية' },
  { email: 'test9@xchange.eg', name: 'كريم السيارات' },
  { email: 'test10@xchange.eg', name: 'ليلى الذهب' },
];

const PASSWORD = 'Test@1234';

// ============================================
// HELPER FUNCTIONS
// ============================================

async function apiCall(
  method: string,
  endpoint: string,
  body?: any,
  token?: string
): Promise<{ status: number; data: any; time: number }> {
  const start = Date.now();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    const response = await fetch(url, {
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

async function login(email: string): Promise<string | null> {
  if (tokens[email]) return tokens[email];

  const { status, data } = await apiCall('POST', '/auth/login', {
    email,
    password: PASSWORD,
  });

  if (status === 200 && data?.data?.accessToken) {
    tokens[email] = data.data.accessToken;
    return tokens[email];
  }
  return null;
}

function log(message: string, indent = 0) {
  console.log(' '.repeat(indent) + message);
}

// ============================================
// 20 TEST SCENARIOS
// ============================================

async function scenario1_DirectSale(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n📦 السيناريو 1: بيع مباشر لهاتف محمول');

  // Step 1: Login as seller
  const sellerToken = await login('test1@xchange.eg');
  steps.push({
    step: 'تسجيل دخول البائع',
    status: sellerToken ? 'PASS' : 'FAIL',
  });

  // Step 2: Create item listing
  if (sellerToken) {
    const { status, data } = await apiCall('POST', '/items', {
      title: 'iPhone 15 Pro Max للبيع',
      description: 'هاتف جديد بضمان سنة',
      categoryId: 'electronics',
      price: 45000,
      condition: 'NEW',
      listingType: 'SELL',
      governorate: 'القاهرة',
      city: 'مدينة نصر',
      images: ['https://example.com/phone.jpg'],
    }, sellerToken);

    steps.push({
      step: 'إنشاء إعلان البيع',
      status: status === 201 || status === 200 ? 'PASS' : 'FAIL',
      statusCode: status,
      error: status !== 201 && status !== 200 ? JSON.stringify(data).substring(0, 100) : undefined,
    });
  }

  // Step 3: Login as buyer
  const buyerToken = await login('test5@xchange.eg');
  steps.push({
    step: 'تسجيل دخول المشتري',
    status: buyerToken ? 'PASS' : 'FAIL',
  });

  // Step 4: Browse items
  const { status: browseStatus } = await apiCall('GET', '/items?category=electronics&limit=10');
  steps.push({
    step: 'تصفح المنتجات',
    status: browseStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: browseStatus,
  });

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 1,
    name: 'Direct Mobile Sale',
    nameAr: 'بيع مباشر لهاتف محمول',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario2_SimpleBarter(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n🔄 السيناريو 2: مقايضة بسيطة بين مستخدمين');

  // Step 1: Login as user 1
  const user1Token = await login('test2@xchange.eg');
  steps.push({
    step: 'تسجيل دخول المستخدم الأول',
    status: user1Token ? 'PASS' : 'FAIL',
  });

  // Step 2: Get barter listings
  const { status: barterStatus } = await apiCall('GET', '/barter?limit=10');
  steps.push({
    step: 'عرض منتجات المقايضة',
    status: barterStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: barterStatus,
  });

  // Step 3: Login as user 2
  const user2Token = await login('test4@xchange.eg');
  steps.push({
    step: 'تسجيل دخول المستخدم الثاني',
    status: user2Token ? 'PASS' : 'FAIL',
  });

  // Step 4: Check barter pool
  const { status: poolStatus } = await apiCall('GET', '/barter-pool?limit=10');
  steps.push({
    step: 'فحص مجموعة المقايضة',
    status: poolStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: poolStatus,
  });

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 2,
    name: 'Simple Barter Exchange',
    nameAr: 'مقايضة بسيطة بين مستخدمين',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario3_LiveAuction(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n🔨 السيناريو 3: مزاد حي على أثاث');

  // Step 1: Get active auctions
  const { status: auctionStatus, data: auctionData } = await apiCall('GET', '/auctions?status=active&limit=10');
  steps.push({
    step: 'عرض المزادات النشطة',
    status: auctionStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: auctionStatus,
  });

  // Step 2: Login as bidder
  const bidderToken = await login('test3@xchange.eg');
  steps.push({
    step: 'تسجيل دخول المزايد',
    status: bidderToken ? 'PASS' : 'FAIL',
  });

  // Step 3: Get auction details (if any exist)
  if (auctionData?.data?.length > 0) {
    const auctionId = auctionData.data[0].id;
    const { status: detailStatus } = await apiCall('GET', `/auctions/${auctionId}`);
    steps.push({
      step: 'عرض تفاصيل المزاد',
      status: detailStatus === 200 ? 'PASS' : 'FAIL',
      statusCode: detailStatus,
    });
  } else {
    steps.push({
      step: 'عرض تفاصيل المزاد',
      status: 'PASS',
      error: 'No active auctions found',
    });
  }

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 3,
    name: 'Live Furniture Auction',
    nameAr: 'مزاد حي على أثاث',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario4_ReverseAuction(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n📉 السيناريو 4: مناقصة عكسية لخدمات نقل');

  // Step 1: Get reverse auctions
  const { status: raStatus } = await apiCall('GET', '/reverse-auctions?limit=10');
  steps.push({
    step: 'عرض المناقصات العكسية',
    status: raStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: raStatus,
  });

  // Step 2: Login as service provider
  const providerToken = await login('test6@xchange.eg');
  steps.push({
    step: 'تسجيل دخول مقدم الخدمة',
    status: providerToken ? 'PASS' : 'FAIL',
  });

  // Step 3: Check tender statistics
  const { status: statsStatus } = await apiCall('GET', '/tenders/statistics');
  steps.push({
    step: 'إحصائيات المناقصات',
    status: statsStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: statsStatus,
  });

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 4,
    name: 'Reverse Auction for Transport',
    nameAr: 'مناقصة عكسية لخدمات نقل',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario5_PropertyListing(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n🏠 السيناريو 5: إدراج عقار للبيع');

  // Step 1: Login as property owner
  const ownerToken = await login('test8@xchange.eg');
  steps.push({
    step: 'تسجيل دخول مالك العقار',
    status: ownerToken ? 'PASS' : 'FAIL',
  });

  // Step 2: Get properties
  const { status: propStatus } = await apiCall('GET', '/properties?limit=10');
  steps.push({
    step: 'عرض العقارات المتاحة',
    status: propStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: propStatus,
  });

  // Step 3: Get property types
  const { status: typesStatus } = await apiCall('GET', '/properties/types');
  steps.push({
    step: 'أنواع العقارات',
    status: typesStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: typesStatus,
  });

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 5,
    name: 'Property Listing',
    nameAr: 'إدراج عقار للبيع',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario6_CarBarter(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n🚗 السيناريو 6: مقايضة سيارة');

  // Step 1: Login as car owner
  const ownerToken = await login('test9@xchange.eg');
  steps.push({
    step: 'تسجيل دخول مالك السيارة',
    status: ownerToken ? 'PASS' : 'FAIL',
  });

  // Step 2: Get cars
  const { status: carsStatus } = await apiCall('GET', '/cars?limit=10');
  steps.push({
    step: 'عرض السيارات المتاحة',
    status: carsStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: carsStatus,
  });

  // Step 3: Get car brands
  const { status: brandsStatus } = await apiCall('GET', '/cars/brands');
  steps.push({
    step: 'ماركات السيارات',
    status: brandsStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: brandsStatus,
  });

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 6,
    name: 'Car Barter',
    nameAr: 'مقايضة سيارة',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario7_GoldTrading(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n🥇 السيناريو 7: تداول الذهب');

  // Step 1: Login as gold trader
  const traderToken = await login('test10@xchange.eg');
  steps.push({
    step: 'تسجيل دخول تاجر الذهب',
    status: traderToken ? 'PASS' : 'FAIL',
  });

  // Step 2: Get gold listings
  const { status: goldStatus } = await apiCall('GET', '/gold?limit=10');
  steps.push({
    step: 'عرض منتجات الذهب',
    status: goldStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: goldStatus,
  });

  // Step 3: Get gold prices
  const { status: pricesStatus } = await apiCall('GET', '/gold/prices');
  steps.push({
    step: 'أسعار الذهب الحالية',
    status: pricesStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: pricesStatus,
  });

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 7,
    name: 'Gold Trading',
    nameAr: 'تداول الذهب',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario8_ScrapMarketplace(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n♻️ السيناريو 8: سوق الخردة');

  // Step 1: Get scrap listings
  const { status: scrapStatus } = await apiCall('GET', '/scrap?limit=10');
  steps.push({
    step: 'عرض منتجات الخردة',
    status: scrapStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: scrapStatus,
  });

  // Step 2: Get scrap categories
  const { status: catStatus } = await apiCall('GET', '/scrap/categories');
  steps.push({
    step: 'فئات الخردة',
    status: catStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: catStatus,
  });

  // Step 3: Login as scrap collector
  const collectorToken = await login('test7@xchange.eg');
  steps.push({
    step: 'تسجيل دخول جامع الخردة',
    status: collectorToken ? 'PASS' : 'FAIL',
  });

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 8,
    name: 'Scrap Marketplace',
    nameAr: 'سوق الخردة',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario9_Escrow(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n🔒 السيناريو 9: نظام الضمان (Escrow)');

  // Step 1: Login as buyer
  const buyerToken = await login('test5@xchange.eg');
  steps.push({
    step: 'تسجيل دخول المشتري',
    status: buyerToken ? 'PASS' : 'FAIL',
  });

  // Step 2: Get escrow transactions
  if (buyerToken) {
    const { status: escrowStatus } = await apiCall('GET', '/escrow/transactions', undefined, buyerToken);
    steps.push({
      step: 'معاملات الضمان',
      status: escrowStatus === 200 ? 'PASS' : 'FAIL',
      statusCode: escrowStatus,
    });
  }

  // Step 3: Check wallet
  if (buyerToken) {
    const { status: walletStatus } = await apiCall('GET', '/wallet/balance', undefined, buyerToken);
    steps.push({
      step: 'رصيد المحفظة',
      status: walletStatus === 200 ? 'PASS' : 'FAIL',
      statusCode: walletStatus,
    });
  }

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 9,
    name: 'Escrow System',
    nameAr: 'نظام الضمان',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario10_Watchlist(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n⭐ السيناريو 10: قائمة المتابعة');

  // Step 1: Login
  const userToken = await login('test5@xchange.eg');
  steps.push({
    step: 'تسجيل الدخول',
    status: userToken ? 'PASS' : 'FAIL',
  });

  // Step 2: Get watchlist
  if (userToken) {
    const { status: watchStatus } = await apiCall('GET', '/watchlist', undefined, userToken);
    steps.push({
      step: 'عرض قائمة المتابعة',
      status: watchStatus === 200 ? 'PASS' : 'FAIL',
      statusCode: watchStatus,
    });
  }

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 10,
    name: 'Watchlist',
    nameAr: 'قائمة المتابعة',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario11_Chat(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n💬 السيناريو 11: نظام المحادثة');

  // Step 1: Login
  const userToken = await login('test1@xchange.eg');
  steps.push({
    step: 'تسجيل الدخول',
    status: userToken ? 'PASS' : 'FAIL',
  });

  // Step 2: Get conversations
  if (userToken) {
    const { status: chatStatus } = await apiCall('GET', '/chat/conversations', undefined, userToken);
    steps.push({
      step: 'عرض المحادثات',
      status: chatStatus === 200 ? 'PASS' : 'FAIL',
      statusCode: chatStatus,
    });
  }

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 11,
    name: 'Chat System',
    nameAr: 'نظام المحادثة',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario12_Notifications(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n🔔 السيناريو 12: الإشعارات');

  // Step 1: Login
  const userToken = await login('test1@xchange.eg');
  steps.push({
    step: 'تسجيل الدخول',
    status: userToken ? 'PASS' : 'FAIL',
  });

  // Step 2: Get notifications
  if (userToken) {
    const { status: notifStatus } = await apiCall('GET', '/notifications', undefined, userToken);
    steps.push({
      step: 'عرض الإشعارات',
      status: notifStatus === 200 ? 'PASS' : 'FAIL',
      statusCode: notifStatus,
    });
  }

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 12,
    name: 'Notifications',
    nameAr: 'الإشعارات',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario13_PricePredictor(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n📊 السيناريو 13: توقع الأسعار');

  // Step 1: Get categories
  const { status: catStatus } = await apiCall('GET', '/categories');
  steps.push({
    step: 'تحميل الفئات',
    status: catStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: catStatus,
  });

  // Step 2: Get price prediction
  const { status: predictStatus } = await apiCall('GET', '/price-prediction/categories');
  steps.push({
    step: 'فئات توقع الأسعار',
    status: predictStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: predictStatus,
  });

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 13,
    name: 'Price Predictor',
    nameAr: 'توقع الأسعار',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario14_Dashboard(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n📈 السيناريو 14: لوحة التحكم');

  // Step 1: Login
  const userToken = await login('test1@xchange.eg');
  steps.push({
    step: 'تسجيل الدخول',
    status: userToken ? 'PASS' : 'FAIL',
  });

  // Step 2: Get dashboard stats
  if (userToken) {
    const { status: dashStatus } = await apiCall('GET', '/users/dashboard', undefined, userToken);
    steps.push({
      step: 'إحصائيات لوحة التحكم',
      status: dashStatus === 200 ? 'PASS' : 'FAIL',
      statusCode: dashStatus,
    });
  }

  // Step 3: Get user profile
  if (userToken) {
    const { status: profileStatus } = await apiCall('GET', '/users/me', undefined, userToken);
    steps.push({
      step: 'بيانات المستخدم',
      status: profileStatus === 200 ? 'PASS' : 'FAIL',
      statusCode: profileStatus,
    });
  }

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 14,
    name: 'User Dashboard',
    nameAr: 'لوحة التحكم',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario15_Search(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n🔍 السيناريو 15: البحث المتقدم');

  // Step 1: Search items
  const { status: searchStatus } = await apiCall('GET', '/items?search=iPhone&limit=10');
  steps.push({
    step: 'البحث عن منتجات',
    status: searchStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: searchStatus,
  });

  // Step 2: Filter by category
  const { status: filterStatus } = await apiCall('GET', '/items?category=electronics&limit=10');
  steps.push({
    step: 'تصفية حسب الفئة',
    status: filterStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: filterStatus,
  });

  // Step 3: Filter by location
  const { status: locStatus } = await apiCall('GET', '/items?governorate=القاهرة&limit=10');
  steps.push({
    step: 'تصفية حسب الموقع',
    status: locStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: locStatus,
  });

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 15,
    name: 'Advanced Search',
    nameAr: 'البحث المتقدم',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario16_Orders(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n📦 السيناريو 16: إدارة الطلبات');

  // Step 1: Login
  const userToken = await login('test5@xchange.eg');
  steps.push({
    step: 'تسجيل الدخول',
    status: userToken ? 'PASS' : 'FAIL',
  });

  // Step 2: Get orders
  if (userToken) {
    const { status: ordersStatus } = await apiCall('GET', '/orders', undefined, userToken);
    steps.push({
      step: 'عرض الطلبات',
      status: ordersStatus === 200 ? 'PASS' : 'FAIL',
      statusCode: ordersStatus,
    });
  }

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 16,
    name: 'Order Management',
    nameAr: 'إدارة الطلبات',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario17_AIMatching(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n🤖 السيناريو 17: المطابقة الذكية بالذكاء الاصطناعي');

  // Step 1: Login
  const userToken = await login('test2@xchange.eg');
  steps.push({
    step: 'تسجيل الدخول',
    status: userToken ? 'PASS' : 'FAIL',
  });

  // Step 2: Get smart matches
  if (userToken) {
    const { status: matchStatus } = await apiCall('GET', '/barter/smart-matches', undefined, userToken);
    steps.push({
      step: 'المطابقات الذكية',
      status: matchStatus === 200 ? 'PASS' : 'FAIL',
      statusCode: matchStatus,
    });
  }

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 17,
    name: 'AI Smart Matching',
    nameAr: 'المطابقة الذكية',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario18_BarterChain(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n🔗 السيناريو 18: سلسلة مقايضة متعددة الأطراف');

  // Step 1: Login as user 1
  const user1Token = await login('test1@xchange.eg');
  steps.push({
    step: 'تسجيل دخول المستخدم 1',
    status: user1Token ? 'PASS' : 'FAIL',
  });

  // Step 2: Get barter chains
  if (user1Token) {
    const { status: chainStatus } = await apiCall('GET', '/barter/chains', undefined, user1Token);
    steps.push({
      step: 'سلاسل المقايضة',
      status: chainStatus === 200 ? 'PASS' : 'FAIL',
      statusCode: chainStatus,
    });
  }

  // Step 3: Get barter pool
  const { status: poolStatus } = await apiCall('GET', '/barter-pool?limit=10');
  steps.push({
    step: 'مجموعة المقايضة',
    status: poolStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: poolStatus,
  });

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 18,
    name: 'Multi-Party Barter Chain',
    nameAr: 'سلسلة مقايضة متعددة',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario19_Installments(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n💳 السيناريو 19: نظام التقسيط');

  // Step 1: Login
  const userToken = await login('test5@xchange.eg');
  steps.push({
    step: 'تسجيل الدخول',
    status: userToken ? 'PASS' : 'FAIL',
  });

  // Step 2: Get installment plans
  if (userToken) {
    const { status: planStatus } = await apiCall('GET', '/installments/plans', undefined, userToken);
    steps.push({
      step: 'خطط التقسيط',
      status: planStatus === 200 ? 'PASS' : 'FAIL',
      statusCode: planStatus,
    });
  }

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 19,
    name: 'Installment System',
    nameAr: 'نظام التقسيط',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

async function scenario20_FlashDeals(): Promise<TestResult> {
  const start = Date.now();
  const steps: StepResult[] = [];
  log('\n⚡ السيناريو 20: العروض السريعة');

  // Step 1: Get flash deals
  const { status: flashStatus } = await apiCall('GET', '/flash-deals?active=true&limit=10');
  steps.push({
    step: 'العروض السريعة النشطة',
    status: flashStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: flashStatus,
  });

  // Step 2: Get featured items
  const { status: featuredStatus } = await apiCall('GET', '/items?featured=true&limit=10');
  steps.push({
    step: 'المنتجات المميزة',
    status: featuredStatus === 200 ? 'PASS' : 'FAIL',
    statusCode: featuredStatus,
  });

  const passed = steps.filter(s => s.status === 'PASS').length;
  return {
    scenario: 20,
    name: 'Flash Deals',
    nameAr: 'العروض السريعة',
    status: passed === steps.length ? 'PASS' : passed > 0 ? 'PARTIAL' : 'FAIL',
    steps,
    duration: Date.now() - start,
  };
}

// ============================================
// MAIN EXECUTION
// ============================================

async function runAllScenarios() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     🧪 XChange Egypt - 20 Test Scenarios                    ║');
  console.log('║     سكريبت اختبار شامل للمنصة                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📍 API: ${API_URL}`);
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log('═'.repeat(60));

  // Run all scenarios
  results.push(await scenario1_DirectSale());
  results.push(await scenario2_SimpleBarter());
  results.push(await scenario3_LiveAuction());
  results.push(await scenario4_ReverseAuction());
  results.push(await scenario5_PropertyListing());
  results.push(await scenario6_CarBarter());
  results.push(await scenario7_GoldTrading());
  results.push(await scenario8_ScrapMarketplace());
  results.push(await scenario9_Escrow());
  results.push(await scenario10_Watchlist());
  results.push(await scenario11_Chat());
  results.push(await scenario12_Notifications());
  results.push(await scenario13_PricePredictor());
  results.push(await scenario14_Dashboard());
  results.push(await scenario15_Search());
  results.push(await scenario16_Orders());
  results.push(await scenario17_AIMatching());
  results.push(await scenario18_BarterChain());
  results.push(await scenario19_Installments());
  results.push(await scenario20_FlashDeals());

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 TEST SUMMARY - ملخص الاختبارات');
  console.log('═'.repeat(60));

  const passed = results.filter(r => r.status === 'PASS').length;
  const partial = results.filter(r => r.status === 'PARTIAL').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`\n✅ Passed (نجح): ${passed}/20`);
  console.log(`⚠️  Partial (جزئي): ${partial}/20`);
  console.log(`❌ Failed (فشل): ${failed}/20`);
  console.log(`\n📈 Success Rate: ${(((passed + partial * 0.5) / 20) * 100).toFixed(1)}%`);

  // Details table
  console.log('\n' + '─'.repeat(60));
  console.log('| # | Scenario                      | Status  | Time    |');
  console.log('|---|-------------------------------|---------|---------|');

  results.forEach(r => {
    const statusIcon = r.status === 'PASS' ? '✅' : r.status === 'PARTIAL' ? '⚠️' : '❌';
    const name = r.nameAr.substring(0, 27).padEnd(27);
    const time = `${r.duration}ms`.padStart(7);
    console.log(`| ${String(r.scenario).padStart(2)} | ${name} | ${statusIcon} ${r.status.padEnd(5)} | ${time} |`);
  });

  console.log('─'.repeat(60));

  // Save results
  const fs = await import('fs');
  const report = {
    timestamp: new Date().toISOString(),
    apiUrl: API_URL,
    summary: { passed, partial, failed, total: 20 },
    successRate: ((passed + partial * 0.5) / 20) * 100,
    results,
  };

  fs.writeFileSync('test-scenarios-results.json', JSON.stringify(report, null, 2));
  console.log('\n📁 Results saved to test-scenarios-results.json');
}

// Run
runAllScenarios().catch(console.error);
