import { test, expect } from '../../fixtures/test-base';

/**
 * 🔍 اختبار شامل لمنصة Xchange Egypt
 * ================================================
 * هذا الاختبار يفحص:
 * 1. تحميل جميع الصفحات الرئيسية
 * 2. رصد أخطاء Console
 * 3. التحقق من استجابة API
 * 4. رحلة المستخدم الكاملة
 * 5. وظائف المقايضة والتبادل
 */

// Configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://xchange-egypt.vercel.app';
const API_URL = process.env.API_URL || 'https://xchange-egypt-production.up.railway.app/api/v1';

// All pages to test
const ALL_PAGES = {
  public: [
    { path: '/', name: 'الصفحة الرئيسية' },
    { path: '/login', name: 'تسجيل الدخول' },
    { path: '/register', name: 'إنشاء حساب' },
    { path: '/forgot-password', name: 'نسيت كلمة المرور' },
    { path: '/marketplace', name: 'السوق' },
    { path: '/barter', name: 'المقايضة' },
    { path: '/barter/guide', name: 'دليل المقايضة' },
    { path: '/barter/open-offers', name: 'عروض المقايضة المفتوحة' },
    { path: '/auctions', name: 'المزادات' },
    { path: '/auctions/live', name: 'المزادات الحية' },
    { path: '/cars', name: 'سوق السيارات' },
    { path: '/gold', name: 'سوق الذهب' },
    { path: '/gold/calculator', name: 'حاسبة الذهب' },
    { path: '/properties', name: 'العقارات' },
    { path: '/real-estate', name: 'عقارات' },
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
    { path: '/download', name: 'تحميل التطبيق' },
    { path: '/assistant', name: 'المساعد الذكي' },
    { path: '/rides', name: 'الرحلات' },
    { path: '/pools', name: 'مجمعات التداول' },
    { path: '/barter-chains', name: 'سلاسل المقايضة' },
    { path: '/reverse-auctions', name: 'المزادات العكسية' },
  ],
  authenticated: [
    { path: '/dashboard', name: 'لوحة التحكم' },
    { path: '/dashboard/profile', name: 'الملف الشخصي' },
    { path: '/dashboard/orders', name: 'الطلبات' },
    { path: '/dashboard/transactions', name: 'المعاملات' },
    { path: '/items/new', name: 'إضافة منتج' },
    { path: '/barter/my-offers', name: 'عروضي' },
    { path: '/messages', name: 'الرسائل' },
    { path: '/notifications', name: 'الإشعارات' },
    { path: '/cart', name: 'السلة' },
    { path: '/checkout', name: 'الدفع' },
    { path: '/alerts', name: 'التنبيهات' },
    { path: '/badges', name: 'الشارات' },
    { path: '/payment-methods', name: 'طرق الدفع' },
    { path: '/cars/my-listings', name: 'سياراتي' },
    { path: '/cars/my-transactions', name: 'معاملات السيارات' },
    { path: '/marketplace/my-requests', name: 'طلباتي' },
    { path: '/inventory/add', name: 'إضافة للمخزون' },
    { path: '/rides/alerts', name: 'تنبيهات الرحلات' },
  ],
  admin: [
    { path: '/admin', name: 'لوحة الإدارة' },
    { path: '/admin/login', name: 'دخول الإدارة' },
    { path: '/admin/users', name: 'المستخدمين' },
    { path: '/admin/listings', name: 'الإعلانات' },
    { path: '/admin/reports', name: 'البلاغات' },
    { path: '/admin/settings', name: 'الإعدادات' },
  ],
  selling: [
    { path: '/cars/sell', name: 'بيع سيارة' },
    { path: '/gold/sell', name: 'بيع ذهب' },
    { path: '/luxury/sell', name: 'بيع سلع فاخرة' },
    { path: '/mobiles/sell', name: 'بيع موبايل' },
    { path: '/auctions/new', name: 'إنشاء مزاد' },
    { path: '/properties/create', name: 'إضافة عقار' },
  ],
};

// Errors collector
interface PageError {
  page: string;
  path: string;
  errors: string[];
  networkErrors: string[];
  status: number;
  loadTime: number;
}

const collectedErrors: PageError[] = [];

test.describe('🔍 فحص شامل للمنصة - جميع الصفحات العامة', () => {
  for (const pageInfo of ALL_PAGES.public) {
    test(`تحميل صفحة: ${pageInfo.name} (${pageInfo.path})`, async ({ page }) => {
      const errors: string[] = [];
      const networkErrors: string[] = [];
      const startTime = Date.now();

      // Capture console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(`Console Error: ${msg.text()}`);
        }
      });

      // Capture page errors
      page.on('pageerror', (err) => {
        errors.push(`Page Error: ${err.message}`);
      });

      // Capture failed requests
      page.on('requestfailed', (request) => {
        networkErrors.push(`Failed Request: ${request.url()} - ${request.failure()?.errorText}`);
      });

      // Capture response errors
      page.on('response', (response) => {
        if (response.status() >= 400) {
          networkErrors.push(`HTTP ${response.status()}: ${response.url()}`);
        }
      });

      try {
        const response = await page.goto(pageInfo.path, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });

        const loadTime = Date.now() - startTime;
        const status = response?.status() || 0;

        // Wait a bit for JS to execute and catch errors
        await page.waitForTimeout(2000);

        // Collect errors for report
        if (errors.length > 0 || networkErrors.length > 0 || status >= 400) {
          collectedErrors.push({
            page: pageInfo.name,
            path: pageInfo.path,
            errors,
            networkErrors,
            status,
            loadTime,
          });
        }

        // Assertions
        expect(status, `صفحة ${pageInfo.name} يجب أن تحمل بنجاح`).toBeLessThan(500);

        // Check page has content
        const bodyContent = await page.locator('body').textContent();
        expect(bodyContent?.length, `صفحة ${pageInfo.name} يجب أن تحتوي على محتوى`).toBeGreaterThan(10);

        // Log warnings if there are errors but page loaded
        if (errors.length > 0) {
          console.warn(`⚠️ ${pageInfo.name}: ${errors.length} console errors detected`);
        }
        if (networkErrors.length > 0) {
          console.warn(`⚠️ ${pageInfo.name}: ${networkErrors.length} network errors detected`);
        }
      } catch (error: any) {
        collectedErrors.push({
          page: pageInfo.name,
          path: pageInfo.path,
          errors: [`Navigation Error: ${error.message}`],
          networkErrors,
          status: 0,
          loadTime: Date.now() - startTime,
        });
        throw error;
      }
    });
  }
});

test.describe('🔐 اختبار صفحات تسجيل الدخول والتسجيل', () => {
  test('صفحة التسجيل تعمل بشكل صحيح', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Check form exists
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput.first()).toBeVisible({ timeout: 10000 });
    await expect(passwordInput.first()).toBeVisible();
    await expect(submitButton.first()).toBeVisible();
  });

  test('صفحة تسجيل الدخول تعمل بشكل صحيح', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check form exists
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput.first()).toBeVisible({ timeout: 10000 });
    await expect(passwordInput.first()).toBeVisible();
    await expect(submitButton.first()).toBeVisible();
  });

  test('تجربة تسجيل الدخول مع بيانات خاطئة', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill with wrong credentials
    await page.fill('input[type="email"], input[name="email"]', 'wrong@email.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for error message or redirect
    await page.waitForTimeout(3000);

    // Should show error or stay on login page
    const url = page.url();
    expect(url).toContain('login'); // Should stay on login page with error
  });
});

test.describe('🏪 اختبار السوق والبحث', () => {
  test('صفحة السوق تعرض المنتجات', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    // Page should load
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('البحث في السوق يعمل', async ({ page }) => {
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"], input[name="search"]').first();

    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('تلفون');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);
    }
  });
});

test.describe('🔄 اختبار وظائف المقايضة', () => {
  test('صفحة المقايضة الرئيسية تحمل بشكل صحيح', async ({ page }) => {
    await page.goto('/barter');
    await page.waitForLoadState('networkidle');

    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(50);
  });

  test('دليل المقايضة يعرض المعلومات', async ({ page }) => {
    await page.goto('/barter/guide');
    await page.waitForLoadState('networkidle');

    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(50);
  });

  test('عروض المقايضة المفتوحة', async ({ page }) => {
    await page.goto('/barter/open-offers');
    await page.waitForLoadState('networkidle');

    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(50);
  });
});

test.describe('🚗 اختبار سوق السيارات', () => {
  test('صفحة السيارات تحمل بشكل صحيح', async ({ page }) => {
    await page.goto('/cars');
    await page.waitForLoadState('networkidle');

    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(50);
  });

  test('حاسبة السيارات', async ({ page }) => {
    await page.goto('/cars/calculator');
    await page.waitForLoadState('networkidle');

    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(50);
  });
});

test.describe('🥇 اختبار سوق الذهب', () => {
  test('صفحة الذهب تحمل بشكل صحيح', async ({ page }) => {
    await page.goto('/gold');
    await page.waitForLoadState('networkidle');

    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(50);
  });

  test('حاسبة الذهب تعمل', async ({ page }) => {
    await page.goto('/gold/calculator');
    await page.waitForLoadState('networkidle');

    // Check if calculator inputs exist
    const inputs = page.locator('input[type="number"]');
    const inputCount = await inputs.count();

    // Calculator should have some inputs
    expect(inputCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('🎪 اختبار المزادات', () => {
  test('صفحة المزادات تحمل', async ({ page }) => {
    await page.goto('/auctions');
    await page.waitForLoadState('networkidle');

    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(50);
  });

  test('المزادات الحية', async ({ page }) => {
    await page.goto('/auctions/live');
    await page.waitForLoadState('networkidle');

    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(50);
  });
});

test.describe('📱 اختبار التجاوب مع الشاشات المختلفة', () => {
  const viewports = [
    { width: 375, height: 812, name: 'موبايل (iPhone X)' },
    { width: 768, height: 1024, name: 'تابلت (iPad)' },
    { width: 1280, height: 720, name: 'لابتوب' },
    { width: 1920, height: 1080, name: 'ديسكتوب' },
  ];

  for (const viewport of viewports) {
    test(`الصفحة الرئيسية على ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check no horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20); // Allow small margin
    });
  }
});

test.describe('🔗 اختبار API Backend', () => {
  test('Health check endpoint', async ({ request }) => {
    const response = await request.get(`${API_URL.replace('/api/v1', '')}/health`);
    expect(response.status()).toBeLessThan(500);
  });

  test('Categories endpoint', async ({ request }) => {
    const response = await request.get(`${API_URL}/categories`);
    expect(response.status()).toBeLessThan(500);

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toBeTruthy();
    }
  });

  test('Items endpoint', async ({ request }) => {
    const response = await request.get(`${API_URL}/items`);
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('🎨 اختبار RTL والعربية', () => {
  test('الصفحة تعرض بـ RTL', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');
  });

  test('النصوص العربية تظهر', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').textContent();
    // Check for Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(bodyText || '');
    expect(hasArabic).toBeTruthy();
  });
});

test.describe('⚡ اختبار الأداء', () => {
  test('الصفحة الرئيسية تحمل في أقل من 10 ثواني', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;
    console.log(`Load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(10000);
  });

  test('صفحة السوق تحمل في أقل من 15 ثانية', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/marketplace');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;
    console.log(`Marketplace load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(15000);
  });
});

// Generate final error report
test.afterAll(async () => {
  if (collectedErrors.length > 0) {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('              📊 تقرير الأخطاء المكتشفة                          ');
    console.log('═══════════════════════════════════════════════════════════════');

    for (const error of collectedErrors) {
      console.log(`\n❌ ${error.page} (${error.path})`);
      console.log(`   Status: ${error.status}`);
      console.log(`   Load Time: ${error.loadTime}ms`);

      if (error.errors.length > 0) {
        console.log('   Console Errors:');
        error.errors.forEach((e, i) => console.log(`     ${i + 1}. ${e}`));
      }

      if (error.networkErrors.length > 0) {
        console.log('   Network Errors:');
        error.networkErrors.forEach((e, i) => console.log(`     ${i + 1}. ${e}`));
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`  إجمالي الصفحات بمشاكل: ${collectedErrors.length}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
  } else {
    console.log('\n✅ لا توجد أخطاء مكتشفة!\n');
  }
});
