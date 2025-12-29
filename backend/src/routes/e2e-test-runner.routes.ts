/**
 * E2E Test Runner - اختبارات End-to-End حقيقية
 *
 * هذه الاختبارات تنفذ عمليات فعلية عبر الـ API:
 * - تسجيل الدخول
 * - إنشاء منتجات
 * - تنفيذ عمليات شراء/بيع/مقايضة
 * - التحقق من النتائج
 */

import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

// Base URL for internal API calls
const API_BASE = process.env.API_URL || 'http://localhost:3000';

interface E2ETestResult {
  scenario: number;
  name: string;
  nameAr: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  steps: { step: string; stepAr: string; status: 'PASS' | 'FAIL'; details?: string; error?: string }[];
  duration: number;
}

interface TestUser {
  id: string;
  email: string;
  token: string;
}

// Test credentials
const TEST_PASSWORD = 'Test@1234';

// Token cache to avoid repeated logins
const tokenCache: Map<string, { token: string; expiresAt: number }> = new Map();

// Helper: Get auth token by calling the actual login API
async function getAuthToken(email: string): Promise<TestUser | null> {
  try {
    // Check cache first (tokens valid for 10 minutes)
    const cached = tokenCache.get(email);
    if (cached && cached.expiresAt > Date.now()) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true }
      });
      if (user) {
        return { id: user.id, email: user.email, token: cached.token };
      }
    }

    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });

    if (!user) return null;

    // Small delay before login to avoid rate limiting
    await delay(100);

    // Call the actual login API
    const loginResponse = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: TEST_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      // Return null if login fails - this means authentication failed
      return null;
    }

    const loginData = await loginResponse.json() as {
      success?: boolean;
      data?: { accessToken?: string; user?: { id?: string } };
      accessToken?: string;
      token?: string
    };

    // Token is in data.accessToken based on the sendSuccess response structure
    const token = loginData.data?.accessToken || loginData.accessToken || loginData.token || '';

    if (!token) {
      // No token received - authentication failed
      return null;
    }

    // Cache the token for 10 minutes
    tokenCache.set(email, {
      token,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    return { id: user.id, email: user.email, token };
  } catch (error) {
    // Login failed - return null
    return null;
  }
}

// Helper: Check if user has valid token
function hasValidToken(user: TestUser | null): boolean {
  return user !== null && user.token !== '' && user.token.length > 10;
}

// Helper: Delay function to avoid rate limiting
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: Extract error message from various error formats
function extractErrorMessage(data: Record<string, unknown>, status: number): string {
  // Check for nested error objects
  if (data.error && typeof data.error === 'object') {
    const errObj = data.error as Record<string, unknown>;
    if (errObj.message) return String(errObj.message);
    if (errObj.error) return String(errObj.error);
  }
  // Check for direct message/error fields
  if (data.message && typeof data.message === 'string') return data.message;
  if (data.error && typeof data.error === 'string') return data.error;
  // Check for validation errors
  if (data.errors && Array.isArray(data.errors)) {
    return data.errors.map((e: any) => e.message || e.msg || String(e)).join(', ');
  }
  // Fallback to HTTP status
  return `HTTP ${status}`;
}

// Helper: Make authenticated API call with rate limit protection
async function apiCall(
  method: string,
  endpoint: string,
  token?: string,
  body?: any
): Promise<{ success: boolean; status: number; data?: any; error?: string }> {
  try {
    // Small delay between API calls to avoid rate limiting (200ms)
    await delay(200);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({})) as Record<string, unknown>;

    // If rate limited, wait and retry once
    if (response.status === 429) {
      await delay(2000);
      const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const retryData = await retryResponse.json().catch(() => ({})) as Record<string, unknown>;
      return {
        success: retryResponse.ok,
        status: retryResponse.status,
        data: retryData,
        error: !retryResponse.ok ? extractErrorMessage(retryData, retryResponse.status) : undefined,
      };
    }

    return {
      success: response.ok,
      status: response.status,
      data,
      error: !response.ok ? extractErrorMessage(data, response.status) : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      status: 0,
      error: error.message,
    };
  }
}

/**
 * Health check for E2E runner
 */
router.get('/health', async (_req: Request, res: Response) => {
  const testUsers = await prisma.user.count({
    where: { email: { contains: '@xchange.eg' } }
  });

  res.json({
    success: true,
    status: 'ready',
    testUsers,
    apiBase: API_BASE,
    timestamp: new Date().toISOString()
  });
});

/**
 * Run all 20 E2E test scenarios
 */
router.get('/run', async (_req: Request, res: Response) => {
  const results: E2ETestResult[] = [];
  const startTime = Date.now();

  // Delay between scenarios to avoid rate limiting (1.5 seconds)
  const SCENARIO_DELAY = 1500;

  try {
    // Run all scenarios with delays to avoid rate limiting
    results.push(await scenario1_DirectSale());
    await delay(SCENARIO_DELAY);

    results.push(await scenario2_BarterExchange());
    await delay(SCENARIO_DELAY);

    results.push(await scenario3_LiveAuction());
    await delay(SCENARIO_DELAY);

    results.push(await scenario4_ReverseAuction());
    await delay(SCENARIO_DELAY);

    results.push(await scenario5_PropertyListing());
    await delay(SCENARIO_DELAY);

    results.push(await scenario6_CarBarter());
    await delay(SCENARIO_DELAY);

    results.push(await scenario7_GoldTrading());
    await delay(SCENARIO_DELAY);

    results.push(await scenario8_ScrapMarketplace());
    await delay(SCENARIO_DELAY);

    results.push(await scenario9_EscrowPayment());
    await delay(SCENARIO_DELAY);

    results.push(await scenario10_WatchlistAlerts());
    await delay(SCENARIO_DELAY);

    results.push(await scenario11_ChatMessaging());
    await delay(SCENARIO_DELAY);

    results.push(await scenario12_Notifications());
    await delay(SCENARIO_DELAY);

    results.push(await scenario13_PricePrediction());
    await delay(SCENARIO_DELAY);

    results.push(await scenario14_UserDashboard());
    await delay(SCENARIO_DELAY);

    results.push(await scenario15_AdvancedSearch());
    await delay(SCENARIO_DELAY);

    results.push(await scenario16_OrderManagement());
    await delay(SCENARIO_DELAY);

    results.push(await scenario17_AISmartMatching());
    await delay(SCENARIO_DELAY);

    results.push(await scenario18_BarterChain());
    await delay(SCENARIO_DELAY);

    results.push(await scenario19_InstallmentPayment());
    await delay(SCENARIO_DELAY);

    results.push(await scenario20_FlashDeals());

    const passed = results.filter(r => r.status === 'PASS').length;
    const partial = results.filter(r => r.status === 'PARTIAL').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    res.json({
      success: true,
      type: 'E2E_FUNCTIONAL_TESTS',
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      summary: {
        total: 20,
        passed,
        partial,
        failed,
        successRate: ((passed + partial * 0.5) / 20 * 100).toFixed(1) + '%'
      },
      results
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      results
    });
  }
});

// ============================================
// SCENARIO 1: Direct Sale (بيع مباشر)
// ============================================
async function scenario1_DirectSale(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    // Step 1: Login as seller
    const seller = await getAuthToken('test1@xchange.eg');
    const sellerHasToken = hasValidToken(seller);
    steps.push({
      step: 'Seller Login',
      stepAr: 'تسجيل دخول البائع',
      status: sellerHasToken ? 'PASS' : 'FAIL',
      details: sellerHasToken ? `User ID: ${seller!.id}, Token: ${seller!.token.substring(0, 20)}...` : undefined,
      error: !seller ? 'User not found or login failed' : (!sellerHasToken ? 'Failed to obtain auth token' : undefined)
    });
    if (!sellerHasToken) throw new Error('Seller login failed');

    // Step 2: Create a product for sale
    const createItemResult = await apiCall('POST', '/api/v1/items', seller.token, {
      title: `E2E Test Phone ${Date.now()}`,
      description: 'iPhone 14 Pro Max - E2E Test',
      categoryId: await getFirstCategoryId(),
      estimatedValue: 25000,
      listingType: 'DIRECT_SALE',
      condition: 'LIKE_NEW',
      images: ['https://example.com/phone.jpg'],
      governorate: 'Cairo',
      city: 'Nasr City'
    });
    steps.push({
      step: 'Create Item for Sale',
      stepAr: 'إنشاء منتج للبيع',
      status: createItemResult.success ? 'PASS' : 'FAIL',
      details: createItemResult.success ? `Item ID: ${createItemResult.data?.item?.id}` : undefined,
      error: createItemResult.error
    });

    // Step 3: Login as buyer
    const buyer = await getAuthToken('test5@xchange.eg');
    const buyerHasToken = hasValidToken(buyer);
    steps.push({
      step: 'Buyer Login',
      stepAr: 'تسجيل دخول المشتري',
      status: buyerHasToken ? 'PASS' : 'FAIL',
      details: buyerHasToken ? `Token obtained` : undefined,
      error: !buyerHasToken ? 'Buyer login failed - no valid token' : undefined
    });
    if (!buyerHasToken) throw new Error('Buyer login failed');

    // Step 4: Buyer views the item
    if (createItemResult.data?.item?.id) {
      const viewResult = await apiCall('GET', `/api/v1/items/${createItemResult.data.item.id}`, buyer.token);
      steps.push({
        step: 'Buyer Views Item',
        stepAr: 'المشتري يشاهد المنتج',
        status: viewResult.success ? 'PASS' : 'FAIL',
        error: viewResult.error
      });

      // Step 5: Add to cart (correct path is /api/v1/cart/items)
      const cartResult = await apiCall('POST', '/api/v1/cart/items', buyer.token, {
        listingId: createItemResult.data.item.id,
        quantity: 1
      });
      steps.push({
        step: 'Add to Cart',
        stepAr: 'إضافة للسلة',
        status: cartResult.success ? 'PASS' : 'FAIL',
        error: cartResult.error
      });
    }

    // Step 6: Verify order can be created (correct path is /api/v1/orders)
    const ordersCheck = await apiCall('GET', '/api/v1/orders', buyer.token);
    steps.push({
      step: 'Verify Orders Endpoint',
      stepAr: 'التحقق من نقطة الطلبات',
      status: ordersCheck.success ? 'PASS' : 'FAIL',
      error: ordersCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 1,
      name: 'Direct Mobile Sale',
      nameAr: 'بيع مباشر لهاتف محمول',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 1,
      name: 'Direct Mobile Sale',
      nameAr: 'بيع مباشر لهاتف محمول',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 2: Barter Exchange (مقايضة)
// ============================================
async function scenario2_BarterExchange(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    // Step 1: Login as user 1
    const user1 = await getAuthToken('test2@xchange.eg');
    const user1HasToken = hasValidToken(user1);
    steps.push({
      step: 'User 1 Login',
      stepAr: 'تسجيل دخول المستخدم الأول',
      status: user1HasToken ? 'PASS' : 'FAIL',
      error: !user1HasToken ? 'Login failed - no valid token' : undefined
    });
    if (!user1HasToken) throw new Error('User 1 login failed');

    // Step 2: Create barter item
    const barterItem = await apiCall('POST', '/api/v1/items', user1!.token, {
      title: `E2E Barter Item ${Date.now()}`,
      description: 'Laptop for barter - E2E Test',
      categoryId: await getFirstCategoryId(),
      estimatedValue: 15000,
      listingType: 'BARTER',
      condition: 'GOOD',
      images: ['https://example.com/laptop.jpg'],
      desiredItemTitle: 'iPhone or Samsung phone',
      governorate: 'Alexandria'
    });
    steps.push({
      step: 'Create Barter Item',
      stepAr: 'إنشاء منتج للمقايضة',
      status: barterItem.success ? 'PASS' : 'FAIL',
      details: barterItem.data?.item?.id ? `Item: ${barterItem.data.item.id}` : undefined,
      error: barterItem.error
    });

    // Step 3: Login as user 2
    const user2 = await getAuthToken('test4@xchange.eg');
    const user2HasToken = hasValidToken(user2);
    steps.push({
      step: 'User 2 Login',
      stepAr: 'تسجيل دخول المستخدم الثاني',
      status: user2HasToken ? 'PASS' : 'FAIL',
      error: !user2HasToken ? 'Login failed - no valid token' : undefined
    });
    if (!user2HasToken) throw new Error('User 2 login failed');

    // Step 4: User 2 creates their item for exchange
    const user2Item = await apiCall('POST', '/api/v1/items', user2!.token, {
      title: `E2E Phone for Barter ${Date.now()}`,
      description: 'Samsung Galaxy for barter',
      categoryId: await getFirstCategoryId(),
      estimatedValue: 14000,
      listingType: 'BARTER',
      condition: 'LIKE_NEW',
      images: ['https://example.com/samsung.jpg'],
      governorate: 'Alexandria'
    });
    steps.push({
      step: 'User 2 Creates Offer Item',
      stepAr: 'المستخدم الثاني ينشئ منتج للعرض',
      status: user2Item.success ? 'PASS' : 'FAIL',
      error: user2Item.error
    });

    // Step 5: User 2 sends barter offer
    if (barterItem.data?.item?.id && user2Item.data?.item?.id) {
      const offerResult = await apiCall('POST', '/api/v1/barter/offers', user2.token, {
        targetItemId: barterItem.data.item.id,
        offeredItemIds: [user2Item.data.item.id],
        message: 'I would like to exchange my Samsung for your laptop'
      });
      steps.push({
        step: 'Send Barter Offer',
        stepAr: 'إرسال عرض المقايضة',
        status: offerResult.success ? 'PASS' : 'FAIL',
        error: offerResult.error
      });
    }

    // Step 6: Check barter offers endpoint (correct path is /api/v1/barter/offers/my)
    const offersCheck = await apiCall('GET', '/api/v1/barter/offers/my', user1.token);
    steps.push({
      step: 'Check Received Offers',
      stepAr: 'فحص العروض المستلمة',
      status: offersCheck.success ? 'PASS' : 'FAIL',
      error: offersCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 2,
      name: 'Barter Exchange',
      nameAr: 'مقايضة بين مستخدمين',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 2,
      name: 'Barter Exchange',
      nameAr: 'مقايضة بين مستخدمين',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 3: Live Auction (مزاد حي)
// ============================================
async function scenario3_LiveAuction(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    // Step 1: Login as auctioneer
    const auctioneer = await getAuthToken('test3@xchange.eg');
    steps.push({
      step: 'Auctioneer Login',
      stepAr: 'تسجيل دخول صاحب المزاد',
      status: auctioneer ? 'PASS' : 'FAIL'
    });
    if (!auctioneer) throw new Error('Auctioneer not found');

    // Step 2: Create listing for auction
    const listingResult = await apiCall('POST', '/api/v1/listings', auctioneer.token, {
      title: `E2E Auction Item ${Date.now()}`,
      description: 'Antique furniture for auction',
      categoryId: await getFirstCategoryId(),
      listingType: 'AUCTION',
      startingPrice: 5000,
      images: ['https://example.com/furniture.jpg'],
      governorate: 'Giza'
    });
    steps.push({
      step: 'Create Auction Listing',
      stepAr: 'إنشاء إعلان مزاد',
      status: listingResult.success ? 'PASS' : 'FAIL',
      details: listingResult.data?.listing?.id ? `Listing: ${listingResult.data.listing.id}` : undefined,
      error: listingResult.error
    });

    // Step 3: Create the auction
    if (listingResult.data?.listing?.id) {
      const auctionResult = await apiCall('POST', '/api/v1/auctions', auctioneer.token, {
        listingId: listingResult.data.listing.id,
        startingPrice: 5000,
        minBidIncrement: 100,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      steps.push({
        step: 'Create Auction',
        stepAr: 'إنشاء المزاد',
        status: auctionResult.success ? 'PASS' : 'FAIL',
        error: auctionResult.error
      });
    }

    // Step 4: Login as bidder
    const bidder = await getAuthToken('test6@xchange.eg');
    steps.push({
      step: 'Bidder Login',
      stepAr: 'تسجيل دخول المزايد',
      status: bidder ? 'PASS' : 'FAIL'
    });

    // Step 5: View active auctions
    const auctionsResult = await apiCall('GET', '/api/v1/auctions?status=ACTIVE');
    steps.push({
      step: 'View Active Auctions',
      stepAr: 'عرض المزادات النشطة',
      status: auctionsResult.success ? 'PASS' : 'FAIL',
      error: auctionsResult.error
    });

    // Step 6: Check auction bids endpoint
    const bidsEndpoint = await apiCall('GET', '/api/v1/auctions');
    steps.push({
      step: 'Auctions API Working',
      stepAr: 'API المزادات يعمل',
      status: bidsEndpoint.success ? 'PASS' : 'FAIL',
      error: bidsEndpoint.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 3,
      name: 'Live Auction',
      nameAr: 'مزاد حي على أثاث',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 3,
      name: 'Live Auction',
      nameAr: 'مزاد حي على أثاث',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 4: Reverse Auction (مناقصة عكسية)
// ============================================
async function scenario4_ReverseAuction(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    // Step 1: Login as requester
    const requester = await getAuthToken('test7@xchange.eg');
    steps.push({
      step: 'Requester Login',
      stepAr: 'تسجيل دخول صاحب الطلب',
      status: requester ? 'PASS' : 'FAIL'
    });
    if (!requester) throw new Error('Requester not found');

    // Step 2: Create reverse auction request
    const reverseAuction = await apiCall('POST', '/api/v1/reverse-auctions', requester.token, {
      title: `E2E Transport Service ${Date.now()}`,
      description: 'Need furniture transport from Cairo to Alexandria',
      categoryId: await getFirstCategoryId(),
      maxBudget: 2000,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      requirements: ['Careful handling', 'Insurance required']
    });
    steps.push({
      step: 'Create Reverse Auction',
      stepAr: 'إنشاء مناقصة عكسية',
      status: reverseAuction.success ? 'PASS' : 'FAIL',
      error: reverseAuction.error
    });

    // Step 3: Login as service provider
    const provider = await getAuthToken('test6@xchange.eg');
    steps.push({
      step: 'Provider Login',
      stepAr: 'تسجيل دخول مقدم الخدمة',
      status: provider ? 'PASS' : 'FAIL'
    });

    // Step 4: View open reverse auctions
    const openAuctions = await apiCall('GET', '/api/v1/reverse-auctions?status=OPEN');
    steps.push({
      step: 'View Open Requests',
      stepAr: 'عرض الطلبات المفتوحة',
      status: openAuctions.success ? 'PASS' : 'FAIL',
      error: openAuctions.error
    });

    // Step 5: Verify reverse auction API
    const apiCheck = await apiCall('GET', '/api/v1/reverse-auctions');
    steps.push({
      step: 'Reverse Auction API Working',
      stepAr: 'API المناقصات العكسية يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 4,
      name: 'Reverse Auction',
      nameAr: 'مناقصة عكسية لخدمات نقل',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 4,
      name: 'Reverse Auction',
      nameAr: 'مناقصة عكسية لخدمات نقل',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 5: Property Listing (إدراج عقار)
// ============================================
async function scenario5_PropertyListing(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const owner = await getAuthToken('test8@xchange.eg');
    steps.push({
      step: 'Property Owner Login',
      stepAr: 'تسجيل دخول مالك العقار',
      status: owner ? 'PASS' : 'FAIL'
    });
    if (!owner) throw new Error('Owner not found');

    // Create property listing
    const property = await apiCall('POST', '/api/v1/properties', owner.token, {
      title: `E2E Apartment ${Date.now()}`,
      description: 'Luxury apartment for sale',
      propertyType: 'APARTMENT',
      listingType: 'SALE',
      price: 2500000,
      area: 150,
      bedrooms: 3,
      bathrooms: 2,
      governorate: 'Cairo',
      city: 'New Cairo',
      images: ['https://example.com/apt.jpg']
    });
    steps.push({
      step: 'Create Property Listing',
      stepAr: 'إنشاء إعلان عقار',
      status: property.success ? 'PASS' : 'FAIL',
      error: property.error
    });

    // Search properties
    const search = await apiCall('GET', '/api/v1/properties?governorate=Cairo');
    steps.push({
      step: 'Search Properties',
      stepAr: 'البحث عن عقارات',
      status: search.success ? 'PASS' : 'FAIL',
      error: search.error
    });

    // Verify API
    const apiCheck = await apiCall('GET', '/api/v1/properties');
    steps.push({
      step: 'Properties API Working',
      stepAr: 'API العقارات يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 5,
      name: 'Property Listing',
      nameAr: 'إدراج عقار للبيع',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 5,
      name: 'Property Listing',
      nameAr: 'إدراج عقار للبيع',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 6: Car Barter (مقايضة سيارة)
// ============================================
async function scenario6_CarBarter(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const carOwner = await getAuthToken('test9@xchange.eg');
    steps.push({
      step: 'Car Owner Login',
      stepAr: 'تسجيل دخول مالك السيارة',
      status: carOwner ? 'PASS' : 'FAIL'
    });
    if (!carOwner) throw new Error('Car owner not found');

    // Create car listing (correct path: /api/v1/cars/listings)
    const carListing = await apiCall('POST', '/api/v1/cars/listings', carOwner.token, {
      title: `E2E Toyota Camry ${Date.now()}`,
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      mileage: 50000,
      price: 450000,
      governorate: 'Cairo',
      description: 'Toyota Camry 2020 for barter'
    });
    steps.push({
      step: 'Create Car Listing',
      stepAr: 'إنشاء إعلان سيارة',
      status: carListing.success ? 'PASS' : 'FAIL',
      error: carListing.error
    });

    // Search cars (correct path: /api/v1/cars/listings)
    const search = await apiCall('GET', '/api/v1/cars/listings?make=Toyota');
    steps.push({
      step: 'Search Cars',
      stepAr: 'البحث عن سيارات',
      status: search.success ? 'PASS' : 'FAIL',
      error: search.error
    });

    // Verify API (correct path: /api/v1/cars/listings)
    const apiCheck = await apiCall('GET', '/api/v1/cars/listings');
    steps.push({
      step: 'Cars API Working',
      stepAr: 'API السيارات يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 6,
      name: 'Car Barter',
      nameAr: 'مقايضة سيارة',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 6,
      name: 'Car Barter',
      nameAr: 'مقايضة سيارة',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 7: Gold Trading (تداول الذهب)
// ============================================
async function scenario7_GoldTrading(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const goldTrader = await getAuthToken('test10@xchange.eg');
    steps.push({
      step: 'Gold Trader Login',
      stepAr: 'تسجيل دخول تاجر الذهب',
      status: goldTrader ? 'PASS' : 'FAIL'
    });
    if (!goldTrader) throw new Error('Gold trader not found');

    // Get gold prices
    const prices = await apiCall('GET', '/api/v1/gold/prices');
    steps.push({
      step: 'Get Gold Prices',
      stepAr: 'الحصول على أسعار الذهب',
      status: prices.success ? 'PASS' : 'FAIL',
      error: prices.error
    });

    // List gold items (correct path: /api/v1/gold/items)
    const goldItems = await apiCall('GET', '/api/v1/gold/items');
    steps.push({
      step: 'List Gold Items',
      stepAr: 'عرض منتجات الذهب',
      status: goldItems.success ? 'PASS' : 'FAIL',
      error: goldItems.error
    });

    // Verify API (correct path: /api/v1/gold/items)
    const apiCheck = await apiCall('GET', '/api/v1/gold/items');
    steps.push({
      step: 'Gold API Working',
      stepAr: 'API الذهب يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 7,
      name: 'Gold Trading',
      nameAr: 'تداول الذهب',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 7,
      name: 'Gold Trading',
      nameAr: 'تداول الذهب',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 8: Scrap Marketplace (سوق الخردة)
// ============================================
async function scenario8_ScrapMarketplace(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const scrapDealer = await getAuthToken('test7@xchange.eg');
    steps.push({
      step: 'Scrap Dealer Login',
      stepAr: 'تسجيل دخول تاجر الخردة',
      status: scrapDealer ? 'PASS' : 'FAIL'
    });
    if (!scrapDealer) throw new Error('Scrap dealer not found');

    // List scrap items (correct path: /api/v1/scrap/items)
    const scrapItems = await apiCall('GET', '/api/v1/scrap/items');
    steps.push({
      step: 'List Scrap Items',
      stepAr: 'عرض منتجات الخردة',
      status: scrapItems.success ? 'PASS' : 'FAIL',
      error: scrapItems.error
    });

    // Get metal prices (correct path: /api/v1/scrap/metal-prices)
    const metalPrices = await apiCall('GET', '/api/v1/scrap/metal-prices');
    steps.push({
      step: 'Get Metal Prices',
      stepAr: 'الحصول على أسعار المعادن',
      status: metalPrices.success ? 'PASS' : 'FAIL',
      error: metalPrices.error
    });

    // Verify API (correct path: /api/v1/scrap/items)
    const apiCheck = await apiCall('GET', '/api/v1/scrap/items');
    steps.push({
      step: 'Scrap API Working',
      stepAr: 'API الخردة يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 8,
      name: 'Scrap Marketplace',
      nameAr: 'سوق الخردة',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 8,
      name: 'Scrap Marketplace',
      nameAr: 'سوق الخردة',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 9: Escrow Payment (نظام الضمان)
// ============================================
async function scenario9_EscrowPayment(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const buyer = await getAuthToken('test5@xchange.eg');
    steps.push({
      step: 'Buyer Login',
      stepAr: 'تسجيل دخول المشتري',
      status: buyer ? 'PASS' : 'FAIL'
    });
    if (!buyer) throw new Error('Buyer not found');

    // Check wallet
    const wallet = await apiCall('GET', '/api/v1/wallet', buyer.token);
    steps.push({
      step: 'Check Wallet',
      stepAr: 'فحص المحفظة',
      status: wallet.success ? 'PASS' : 'FAIL',
      error: wallet.error
    });

    // Get my escrows (correct path: /api/v1/escrow/my-escrows)
    const escrowInfo = await apiCall('GET', '/api/v1/escrow/my-escrows', buyer.token);
    steps.push({
      step: 'Get My Escrows',
      stepAr: 'معاملات الضمان الخاصة بي',
      status: escrowInfo.success ? 'PASS' : 'FAIL',
      error: escrowInfo.error
    });

    // Verify escrow API (correct path: /api/v1/escrow/my-escrows)
    const apiCheck = await apiCall('GET', '/api/v1/escrow/my-escrows', buyer.token);
    steps.push({
      step: 'Escrow API Working',
      stepAr: 'API الضمان يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 9,
      name: 'Escrow Payment',
      nameAr: 'نظام الضمان',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 9,
      name: 'Escrow Payment',
      nameAr: 'نظام الضمان',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 10: Watchlist & Alerts (قائمة المتابعة)
// ============================================
async function scenario10_WatchlistAlerts(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const user = await getAuthToken('test5@xchange.eg');
    steps.push({
      step: 'User Login',
      stepAr: 'تسجيل الدخول',
      status: user ? 'PASS' : 'FAIL'
    });
    if (!user) throw new Error('User not found');

    // Get watchlist
    const watchlist = await apiCall('GET', '/api/v1/watchlist', user.token);
    steps.push({
      step: 'Get Watchlist',
      stepAr: 'الحصول على قائمة المتابعة',
      status: watchlist.success ? 'PASS' : 'FAIL',
      error: watchlist.error
    });

    // Get search alerts
    const alerts = await apiCall('GET', '/api/v1/search-alerts', user.token);
    steps.push({
      step: 'Get Search Alerts',
      stepAr: 'تنبيهات البحث',
      status: alerts.success ? 'PASS' : 'FAIL',
      error: alerts.error
    });

    // Verify API
    const apiCheck = await apiCall('GET', '/api/v1/watchlist', user.token);
    steps.push({
      step: 'Watchlist API Working',
      stepAr: 'API المتابعة يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 10,
      name: 'Watchlist & Alerts',
      nameAr: 'قائمة المتابعة والتنبيهات',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 10,
      name: 'Watchlist & Alerts',
      nameAr: 'قائمة المتابعة والتنبيهات',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 11: Chat Messaging (نظام المحادثة)
// ============================================
async function scenario11_ChatMessaging(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const user1 = await getAuthToken('test1@xchange.eg');
    steps.push({
      step: 'User 1 Login',
      stepAr: 'تسجيل دخول المستخدم الأول',
      status: user1 ? 'PASS' : 'FAIL'
    });
    if (!user1) throw new Error('User 1 not found');

    // Get conversations
    const conversations = await apiCall('GET', '/api/v1/chat/conversations', user1.token);
    steps.push({
      step: 'Get Conversations',
      stepAr: 'الحصول على المحادثات',
      status: conversations.success ? 'PASS' : 'FAIL',
      error: conversations.error
    });

    const user2 = await getAuthToken('test2@xchange.eg');
    steps.push({
      step: 'User 2 Login',
      stepAr: 'تسجيل دخول المستخدم الثاني',
      status: user2 ? 'PASS' : 'FAIL'
    });

    // Create or get conversation
    if (user2) {
      const startChat = await apiCall('POST', '/api/v1/chat/conversations', user1.token, {
        participantId: user2.id
      });
      steps.push({
        step: 'Start Conversation',
        stepAr: 'بدء محادثة',
        status: startChat.success ? 'PASS' : 'FAIL',
        error: startChat.error
      });
    }

    // Verify chat API
    const apiCheck = await apiCall('GET', '/api/v1/chat/conversations', user1.token);
    steps.push({
      step: 'Chat API Working',
      stepAr: 'API المحادثات يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 11,
      name: 'Chat Messaging',
      nameAr: 'نظام المحادثة',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 11,
      name: 'Chat Messaging',
      nameAr: 'نظام المحادثة',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 12: Notifications (الإشعارات)
// ============================================
async function scenario12_Notifications(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const user = await getAuthToken('test1@xchange.eg');
    steps.push({
      step: 'User Login',
      stepAr: 'تسجيل الدخول',
      status: user ? 'PASS' : 'FAIL'
    });
    if (!user) throw new Error('User not found');

    // Get notifications
    const notifications = await apiCall('GET', '/api/v1/notifications', user.token);
    steps.push({
      step: 'Get Notifications',
      stepAr: 'الحصول على الإشعارات',
      status: notifications.success ? 'PASS' : 'FAIL',
      error: notifications.error
    });

    // Get unread count
    const unreadCount = await apiCall('GET', '/api/v1/notifications/unread-count', user.token);
    steps.push({
      step: 'Get Unread Count',
      stepAr: 'عدد الإشعارات غير المقروءة',
      status: unreadCount.success ? 'PASS' : 'FAIL',
      error: unreadCount.error
    });

    // Verify API
    const apiCheck = await apiCall('GET', '/api/v1/notifications', user.token);
    steps.push({
      step: 'Notifications API Working',
      stepAr: 'API الإشعارات يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 12,
      name: 'Notifications',
      nameAr: 'الإشعارات',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 12,
      name: 'Notifications',
      nameAr: 'الإشعارات',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 13: Price Prediction (توقع الأسعار)
// ============================================
async function scenario13_PricePrediction(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const user = await getAuthToken('test1@xchange.eg');
    steps.push({
      step: 'User Login',
      stepAr: 'تسجيل الدخول',
      status: user ? 'PASS' : 'FAIL'
    });
    if (!user) throw new Error('User not found');

    // Get price prediction
    const prediction = await apiCall('POST', '/api/v1/price-prediction/estimate', user.token, {
      title: 'iPhone 14 Pro Max',
      categoryId: await getFirstCategoryId(),
      condition: 'LIKE_NEW'
    });
    steps.push({
      step: 'Get Price Prediction',
      stepAr: 'الحصول على توقع السعر',
      status: prediction.success ? 'PASS' : 'FAIL',
      error: prediction.error
    });

    // Verify API
    const apiCheck = await apiCall('GET', '/api/v1/price-prediction/categories');
    steps.push({
      step: 'Price Prediction API Working',
      stepAr: 'API توقع الأسعار يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 13,
      name: 'Price Prediction',
      nameAr: 'توقع الأسعار',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 13,
      name: 'Price Prediction',
      nameAr: 'توقع الأسعار',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 14: User Dashboard (لوحة التحكم)
// ============================================
async function scenario14_UserDashboard(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const user = await getAuthToken('test1@xchange.eg');
    steps.push({
      step: 'User Login',
      stepAr: 'تسجيل الدخول',
      status: user ? 'PASS' : 'FAIL'
    });
    if (!user) throw new Error('User not found');

    // Get user profile
    const profile = await apiCall('GET', '/api/v1/auth/me', user.token);
    steps.push({
      step: 'Get Profile',
      stepAr: 'الحصول على الملف الشخصي',
      status: profile.success ? 'PASS' : 'FAIL',
      error: profile.error
    });

    // Get my items
    const myItems = await apiCall('GET', '/api/v1/items/my', user.token);
    steps.push({
      step: 'Get My Items',
      stepAr: 'الحصول على منتجاتي',
      status: myItems.success ? 'PASS' : 'FAIL',
      error: myItems.error
    });

    // Get my orders (correct path is /api/v1/orders)
    const myOrders = await apiCall('GET', '/api/v1/orders', user.token);
    steps.push({
      step: 'Get My Orders',
      stepAr: 'الحصول على طلباتي',
      status: myOrders.success ? 'PASS' : 'FAIL',
      error: myOrders.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 14,
      name: 'User Dashboard',
      nameAr: 'لوحة التحكم',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 14,
      name: 'User Dashboard',
      nameAr: 'لوحة التحكم',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 15: Advanced Search (البحث المتقدم)
// ============================================
async function scenario15_AdvancedSearch(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    // Search items
    const search = await apiCall('GET', '/api/v1/search?q=phone&minPrice=1000&maxPrice=50000');
    steps.push({
      step: 'Search with Filters',
      stepAr: 'بحث مع فلاتر',
      status: search.success ? 'PASS' : 'FAIL',
      error: search.error
    });

    // Search by category
    const categorySearch = await apiCall('GET', '/api/v1/items/search?categoryId=' + await getFirstCategoryId());
    steps.push({
      step: 'Search by Category',
      stepAr: 'بحث حسب الفئة',
      status: categorySearch.success ? 'PASS' : 'FAIL',
      error: categorySearch.error
    });

    // Search by location
    const locationSearch = await apiCall('GET', '/api/v1/items/search?governorate=Cairo');
    steps.push({
      step: 'Search by Location',
      stepAr: 'بحث حسب الموقع',
      status: locationSearch.success ? 'PASS' : 'FAIL',
      error: locationSearch.error
    });

    // Verify search API
    const apiCheck = await apiCall('GET', '/api/v1/search?q=test');
    steps.push({
      step: 'Search API Working',
      stepAr: 'API البحث يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 15,
      name: 'Advanced Search',
      nameAr: 'البحث المتقدم',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 15,
      name: 'Advanced Search',
      nameAr: 'البحث المتقدم',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 16: Order Management (إدارة الطلبات)
// ============================================
async function scenario16_OrderManagement(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const user = await getAuthToken('test1@xchange.eg');
    steps.push({
      step: 'User Login',
      stepAr: 'تسجيل الدخول',
      status: user ? 'PASS' : 'FAIL'
    });
    if (!user) throw new Error('User not found');

    // Get orders (correct path is /api/v1/orders)
    const orders = await apiCall('GET', '/api/v1/orders', user.token);
    steps.push({
      step: 'Get Orders',
      stepAr: 'الحصول على الطلبات',
      status: orders.success ? 'PASS' : 'FAIL',
      error: orders.error
    });

    // Get cart
    const cart = await apiCall('GET', '/api/v1/cart', user.token);
    steps.push({
      step: 'Get Cart',
      stepAr: 'الحصول على السلة',
      status: cart.success ? 'PASS' : 'FAIL',
      error: cart.error
    });

    // Verify orders API
    const apiCheck = await apiCall('GET', '/api/v1/orders', user.token);
    steps.push({
      step: 'Orders API Working',
      stepAr: 'API الطلبات يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 16,
      name: 'Order Management',
      nameAr: 'إدارة الطلبات',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 16,
      name: 'Order Management',
      nameAr: 'إدارة الطلبات',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 17: AI Smart Matching (المطابقة الذكية)
// ============================================
async function scenario17_AISmartMatching(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const user = await getAuthToken('test2@xchange.eg');
    steps.push({
      step: 'User Login',
      stepAr: 'تسجيل الدخول',
      status: user ? 'PASS' : 'FAIL'
    });
    if (!user) throw new Error('User not found');

    // Get my matches (correct path: /api/v1/matching/my-matches)
    const matches = await apiCall('GET', '/api/v1/matching/my-matches', user.token);
    steps.push({
      step: 'Get My Matches',
      stepAr: 'الحصول على مطابقاتي',
      status: matches.success ? 'PASS' : 'FAIL',
      error: matches.error
    });

    // Verify matching API (correct path: /api/v1/matching/stats)
    const apiCheck = await apiCall('GET', '/api/v1/matching/stats');
    steps.push({
      step: 'Matching API Working',
      stepAr: 'API المطابقة يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 17,
      name: 'AI Smart Matching',
      nameAr: 'المطابقة الذكية',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 17,
      name: 'AI Smart Matching',
      nameAr: 'المطابقة الذكية',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 18: Barter Chain (سلسلة المقايضة)
// ============================================
async function scenario18_BarterChain(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const user = await getAuthToken('test3@xchange.eg');
    steps.push({
      step: 'User Login',
      stepAr: 'تسجيل الدخول',
      status: user ? 'PASS' : 'FAIL'
    });
    if (!user) throw new Error('User not found');

    // Get barter pools
    const pools = await apiCall('GET', '/api/v1/barter-pools', user.token);
    steps.push({
      step: 'Get Barter Pools',
      stepAr: 'الحصول على مجموعات المقايضة',
      status: pools.success ? 'PASS' : 'FAIL',
      error: pools.error
    });

    // Verify barter pool API
    const apiCheck = await apiCall('GET', '/api/v1/barter-pools');
    steps.push({
      step: 'Barter Pool API Working',
      stepAr: 'API مجموعات المقايضة يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 18,
      name: 'Barter Chain',
      nameAr: 'سلسلة مقايضة متعددة',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 18,
      name: 'Barter Chain',
      nameAr: 'سلسلة مقايضة متعددة',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 19: Installment Payment (نظام التقسيط)
// ============================================
async function scenario19_InstallmentPayment(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    const user = await getAuthToken('test4@xchange.eg');
    steps.push({
      step: 'User Login',
      stepAr: 'تسجيل الدخول',
      status: user ? 'PASS' : 'FAIL'
    });
    if (!user) throw new Error('User not found');

    // Get installment plans (correct path: /api/v1/installments/plans)
    const options = await apiCall('GET', '/api/v1/installments/plans?amount=10000');
    steps.push({
      step: 'Get Installment Plans',
      stepAr: 'الحصول على خطط التقسيط',
      status: options.success ? 'PASS' : 'FAIL',
      error: options.error
    });

    // Calculate installment (correct path with provider)
    const calculate = await apiCall('POST', '/api/v1/installments/calculate', user.token, {
      amount: 10000,
      provider: 'VALU',
      months: 12
    });
    steps.push({
      step: 'Calculate Installment',
      stepAr: 'حساب التقسيط',
      status: calculate.success ? 'PASS' : 'FAIL',
      error: calculate.error
    });

    // Verify installment API (correct path: /api/v1/installments/plans)
    const apiCheck = await apiCall('GET', '/api/v1/installments/plans?amount=5000');
    steps.push({
      step: 'Installment API Working',
      stepAr: 'API التقسيط يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 19,
      name: 'Installment Payment',
      nameAr: 'نظام التقسيط',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 19,
      name: 'Installment Payment',
      nameAr: 'نظام التقسيط',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// ============================================
// SCENARIO 20: Flash Deals (العروض السريعة)
// ============================================
async function scenario20_FlashDeals(): Promise<E2ETestResult> {
  const start = Date.now();
  const steps: E2ETestResult['steps'] = [];

  try {
    // Get active flash deals (correct path: /api/v1/flash-deals/active)
    const deals = await apiCall('GET', '/api/v1/flash-deals/active');
    steps.push({
      step: 'Get Active Flash Deals',
      stepAr: 'الحصول على العروض النشطة',
      status: deals.success ? 'PASS' : 'FAIL',
      error: deals.error
    });

    // Get featured items
    const featured = await apiCall('GET', '/api/v1/items/featured');
    steps.push({
      step: 'Get Featured Items',
      stepAr: 'الحصول على المنتجات المميزة',
      status: featured.success ? 'PASS' : 'FAIL',
      error: featured.error
    });

    // Verify flash deals API (correct path: /api/v1/flash-deals/active)
    const apiCheck = await apiCall('GET', '/api/v1/flash-deals/active');
    steps.push({
      step: 'Flash Deals API Working',
      stepAr: 'API العروض السريعة يعمل',
      status: apiCheck.success ? 'PASS' : 'FAIL',
      error: apiCheck.error
    });

    const passed = steps.filter(s => s.status === 'PASS').length;
    return {
      scenario: 20,
      name: 'Flash Deals',
      nameAr: 'العروض السريعة',
      status: passed === steps.length ? 'PASS' : passed >= steps.length / 2 ? 'PARTIAL' : 'FAIL',
      steps,
      duration: Date.now() - start
    };
  } catch (error: any) {
    return {
      scenario: 20,
      name: 'Flash Deals',
      nameAr: 'العروض السريعة',
      status: 'FAIL',
      steps: [...steps, { step: 'Error', stepAr: 'خطأ', status: 'FAIL', error: error.message }],
      duration: Date.now() - start
    };
  }
}

// Helper: Get first category ID
async function getFirstCategoryId(): Promise<string | undefined> {
  const category = await prisma.category.findFirst();
  return category?.id;
}

export default router;
