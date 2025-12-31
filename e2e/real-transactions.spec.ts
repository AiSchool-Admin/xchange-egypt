import { test, expect } from '@playwright/test';

/**
 * اختبارات المعاملات الفعلية - Real Transaction Tests
 * تعمل على الموقع الحقيقي: https://xchange.com.eg
 *
 * Screenshots are attached to the test report using testInfo.attach()
 */

// الموقع الحقيقي
const BASE_URL = 'https://xchange.com.eg';

// بيانات مستخدم اختبار موجود
const existingUser = {
  email: 'test1@xchange.eg',
  password: 'Test123456!',
};

// Helper function to take and attach screenshot
async function takeScreenshot(page: any, testInfo: any, name: string) {
  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach(name, {
    body: screenshot,
    contentType: 'image/png',
  });
  console.log(`📸 Screenshot attached: ${name}`);
}

test.describe('اختبارات المعاملات الفعلية', () => {

  // إعدادات قبل كل اختبار
  test.beforeEach(async ({ page }) => {
    // تعيين viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  // ============================================
  // اختبار 1: فتح الصفحة الرئيسية
  // ============================================
  test('1. فتح الصفحة الرئيسية', async ({ page }, testInfo) => {
    console.log('🏠 Opening homepage...');

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // التقاط صورة
    await takeScreenshot(page, testInfo, '01-homepage.png');

    // التحقق من العنوان
    const title = await page.title();
    console.log(`Page title: ${title}`);

    expect(title).toBeTruthy();
  });

  // ============================================
  // اختبار 2: تصفح سوق الموبايلات
  // ============================================
  test('2. تصفح سوق الموبايلات', async ({ page }, testInfo) => {
    console.log('📱 Opening mobiles marketplace...');

    await page.goto(`${BASE_URL}/mobiles`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    await takeScreenshot(page, testInfo, '02-mobiles-page.png');

    const url = page.url();
    console.log(`Current URL: ${url}`);

    expect(url).toContain('mobiles');
  });

  // ============================================
  // اختبار 3: تصفح سوق الخردة
  // ============================================
  test('3. تصفح سوق الخردة', async ({ page }, testInfo) => {
    console.log('♻️ Opening scrap marketplace...');

    await page.goto(`${BASE_URL}/scrap`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    await takeScreenshot(page, testInfo, '03-scrap-page.png');

    const url = page.url();
    console.log(`Current URL: ${url}`);
  });

  // ============================================
  // اختبار 4: صفحة تسجيل الدخول
  // ============================================
  test('4. فتح صفحة تسجيل الدخول', async ({ page }, testInfo) => {
    console.log('🔐 Opening login page...');

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    await takeScreenshot(page, testInfo, '04-login-page.png');

    // البحث عن نموذج تسجيل الدخول
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    const hasEmailInput = await emailInput.isVisible().catch(() => false);
    const hasPasswordInput = await passwordInput.isVisible().catch(() => false);

    console.log(`Email input found: ${hasEmailInput}`);
    console.log(`Password input found: ${hasPasswordInput}`);
  });

  // ============================================
  // اختبار 5: تسجيل الدخول فعلياً
  // ============================================
  test('5. تسجيل الدخول فعلياً', async ({ page }, testInfo) => {
    console.log('🔑 Attempting login...');

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // التقاط صورة قبل الدخول
    await takeScreenshot(page, testInfo, '05a-before-login.png');

    // محاولة ملء النموذج
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill(existingUser.email);
      console.log('✅ Email filled');
    }

    if (await passwordInput.isVisible().catch(() => false)) {
      await passwordInput.fill(existingUser.password);
      console.log('✅ Password filled');
    }

    // التقاط صورة بعد ملء البيانات
    await takeScreenshot(page, testInfo, '05b-login-filled.png');

    // محاولة الضغط على زر الدخول
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();
      console.log('✅ Submit button clicked');
      await page.waitForTimeout(3000);
    }

    // التقاط صورة بعد محاولة الدخول
    await takeScreenshot(page, testInfo, '05c-after-login.png');

    console.log(`Final URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 6: صفحة التسجيل
  // ============================================
  test('6. فتح صفحة التسجيل', async ({ page }, testInfo) => {
    console.log('📝 Opening register page...');

    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    await takeScreenshot(page, testInfo, '06-register-page.png');

    console.log(`Register page URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 7: البحث عن منتج
  // ============================================
  test('7. البحث عن منتج', async ({ page }, testInfo) => {
    console.log('🔍 Testing search...');

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // البحث عن حقل البحث
    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"], input[placeholder*="Search"]').first();

    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('iPhone');
      await searchInput.press('Enter');
      console.log('✅ Search submitted');
      await page.waitForTimeout(3000);
    }

    await takeScreenshot(page, testInfo, '07-search-results.png');

    console.log(`Search results URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 8: صفحة البيع
  // ============================================
  test('8. فتح صفحة البيع', async ({ page }, testInfo) => {
    console.log('💰 Opening sell page...');

    await page.goto(`${BASE_URL}/sell`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    await takeScreenshot(page, testInfo, '08-sell-page.png');

    console.log(`Sell page URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 9: صفحة السلة
  // ============================================
  test('9. فتح صفحة السلة', async ({ page }, testInfo) => {
    console.log('🛒 Opening cart page...');

    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    await takeScreenshot(page, testInfo, '09-cart-page.png');

    console.log(`Cart page URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 10: صفحة الدفع
  // ============================================
  test('10. فتح صفحة الدفع', async ({ page }, testInfo) => {
    console.log('💳 Opening checkout page...');

    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    await takeScreenshot(page, testInfo, '10-checkout-page.png');

    console.log(`Checkout page URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 11: صفحة الملف الشخصي
  // ============================================
  test('11. فتح صفحة الملف الشخصي', async ({ page }, testInfo) => {
    console.log('👤 Opening profile page...');

    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    await takeScreenshot(page, testInfo, '11-profile-page.png');

    console.log(`Profile page URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 12: صفحة المحفظة
  // ============================================
  test('12. فتح صفحة المحفظة', async ({ page }, testInfo) => {
    console.log('👛 Opening wallet page...');

    await page.goto(`${BASE_URL}/wallet`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    await takeScreenshot(page, testInfo, '12-wallet-page.png');

    console.log(`Wallet page URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 13: النقر على منتج
  // ============================================
  test('13. النقر على منتج وعرض تفاصيله', async ({ page }, testInfo) => {
    console.log('📦 Clicking on a product...');

    await page.goto(`${BASE_URL}/mobiles`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // التقاط صورة قبل النقر
    await takeScreenshot(page, testInfo, '13a-before-click.png');

    // البحث عن كارت منتج والنقر عليه
    const productLink = page.locator('a[href*="/listing/"], a[href*="/product/"], .product-card a').first();

    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();
      console.log('✅ Product clicked');
      await page.waitForTimeout(3000);
    } else {
      // محاولة النقر على أي رابط يبدو كمنتج
      const anyProductLink = page.locator('a').filter({ hasText: /iPhone|سامسونج|هاتف|موبايل/i }).first();
      if (await anyProductLink.isVisible().catch(() => false)) {
        await anyProductLink.click();
        console.log('✅ Alternative product link clicked');
        await page.waitForTimeout(3000);
      }
    }

    // التقاط صورة صفحة المنتج
    await takeScreenshot(page, testInfo, '13b-product-details.png');

    console.log(`Product page URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 14: التقاط جميع الأخطاء في Console
  // ============================================
  test('14. فحص أخطاء Console في الصفحات الرئيسية', async ({ page }, testInfo) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });

    // زيارة الصفحات الرئيسية
    const pages = ['/', '/mobiles', '/scrap', '/login', '/register'];

    for (const pagePath of pages) {
      console.log(`Checking ${pagePath}...`);
      await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
    }

    // طباعة الأخطاء
    if (errors.length > 0) {
      console.log('\n❌ Console Errors Found:');
      errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    } else {
      console.log('\n✅ No console errors found!');
    }

    await takeScreenshot(page, testInfo, '14-console-check.png');
  });
});

// تقرير النتائج
test.afterAll(async () => {
  console.log('\n' + '='.repeat(50));
  console.log('   📊 تقرير اختبارات المعاملات الفعلية');
  console.log('='.repeat(50));
  console.log('Screenshots are attached to the Playwright HTML report');
  console.log('='.repeat(50) + '\n');
});
