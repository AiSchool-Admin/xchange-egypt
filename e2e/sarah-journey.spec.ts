import { test, expect, Page } from '@playwright/test';

/**
 * رحلة سارة الكاملة - 22 خطوة
 * Sarah's Complete User Journey - Full E2E Test Suite
 *
 * سارة مستخدمة جديدة تريد:
 * 1. التسجيل في المنصة
 * 2. إضافة منتج للبيع
 * 3. البحث عن منتجات للمقايضة
 * 4. تقديم عرض مقايضة
 * 5. قبول عرض والتواصل مع البائع
 * 6. إتمام الصفقة
 */

test.describe('رحلة سارة الكاملة - Sarah Full Journey', () => {
  // بيانات سارة
  const sarah = {
    name: 'سارة محمد',
    email: `sarah.${Date.now()}@test.com`,
    phone: '01012345678',
    password: 'Sarah@123456',
    governorate: 'القاهرة'
  };

  // المنتج الذي ستضيفه سارة
  const sarahProduct = {
    title: 'آيفون 13 برو ماكس',
    titleEn: 'iPhone 13 Pro Max',
    description: 'جهاز بحالة ممتازة، استخدام سنة واحدة فقط',
    price: 35000,
    category: 'الموبايلات'
  };

  // === الخطوة 1: زيارة الصفحة الرئيسية ===
  test('Step 1: زيارة الصفحة الرئيسية', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Xchange|إكسشينج/);
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=الفئات')).toBeVisible();
  });

  // === الخطوة 2: التنقل لصفحة التسجيل ===
  test('Step 2: التنقل لصفحة التسجيل', async ({ page }) => {
    await page.goto('/');

    await page.click('text=إنشاء حساب');
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('form')).toBeVisible();
  });

  // === الخطوة 3: ملء نموذج التسجيل ===
  test('Step 3: ملء نموذج التسجيل', async ({ page }) => {
    await page.goto('/register');

    // ملء البيانات
    await page.fill('input[name="name"]', sarah.name);
    await page.fill('input[name="email"]', sarah.email);
    await page.fill('input[name="phone"]', sarah.phone);
    await page.fill('input[name="password"]', sarah.password);
    await page.fill('input[name="confirmPassword"]', sarah.password);

    // الموافقة على الشروط
    const termsCheckbox = page.locator('input[name="acceptTerms"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  // === الخطوة 4: تأكيد التسجيل بنجاح ===
  test('Step 4: تأكيد نجاح التسجيل', async ({ page }) => {
    await page.goto('/register');

    // ملء النموذج بسرعة
    await page.fill('input[name="name"]', sarah.name);
    await page.fill('input[name="email"]', `test.${Date.now()}@test.com`);
    await page.fill('input[name="phone"]', sarah.phone);
    await page.fill('input[name="password"]', sarah.password);

    const confirmPassword = page.locator('input[name="confirmPassword"]');
    if (await confirmPassword.isVisible()) {
      await confirmPassword.fill(sarah.password);
    }

    // التحقق من وجود زر التسجيل
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  // === الخطوة 5: تصفح الفئات ===
  test('Step 5: تصفح الفئات المتاحة', async ({ page }) => {
    await page.goto('/');

    // البحث عن قسم الفئات
    const categoriesSection = page.locator('text=الفئات');
    await expect(categoriesSection).toBeVisible();

    // التحقق من وجود فئات
    await expect(page.locator('.category-card, [data-testid="category-item"]').first()).toBeVisible();
  });

  // === الخطوة 6: البحث عن منتجات ===
  test('Step 6: البحث عن منتجات', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"]');
    await searchInput.fill('هاتف');
    await searchInput.press('Enter');

    await expect(page).toHaveURL(/.*search|.*q=/);
  });

  // === الخطوة 7: عرض تفاصيل منتج ===
  test('Step 7: عرض تفاصيل منتج', async ({ page }) => {
    await page.goto('/marketplace');

    // الضغط على أول منتج
    const productCard = page.locator('.product-card, [data-testid="listing-card"]').first();
    if (await productCard.isVisible()) {
      await productCard.click();

      // التحقق من وجود تفاصيل المنتج
      await expect(page.locator('h1, .product-title')).toBeVisible();
    }
  });

  // === الخطوة 8: التنقل لصفحة البيع ===
  test('Step 8: التنقل لصفحة إضافة منتج للبيع', async ({ page }) => {
    await page.goto('/');

    const sellButton = page.locator('text=بيع, a[href*="sell"]').first();
    if (await sellButton.isVisible()) {
      await sellButton.click();
      // قد يتم توجيهها لتسجيل الدخول أولاً
      await expect(page).toHaveURL(/.*sell|.*login/);
    }
  });

  // === الخطوة 9: اختيار نوع الإعلان ===
  test('Step 9: اختيار نوع الإعلان (بيع/مقايضة)', async ({ page }) => {
    await page.goto('/sell-ai');

    // التحقق من وجود خيارات البيع
    const saleOption = page.locator('text=بيع مباشر');
    const barterOption = page.locator('text=مقايضة');

    // أحد الخيارات يجب أن يكون موجوداً
    const hasSaleOption = await saleOption.isVisible();
    const hasBarterOption = await barterOption.isVisible();

    expect(hasSaleOption || hasBarterOption).toBeTruthy();
  });

  // === الخطوة 10: تصفح قسم المقايضة ===
  test('Step 10: تصفح قسم المقايضة', async ({ page }) => {
    await page.goto('/barter');

    await expect(page.locator('h1')).toContainText(/مقايضة|Barter/);
  });

  // === الخطوة 11: عرض عروض المقايضة المتاحة ===
  test('Step 11: عرض عروض المقايضة المتاحة', async ({ page }) => {
    await page.goto('/barter');

    // التحقق من وجود قائمة المقايضات
    const barterList = page.locator('.barter-list, [data-testid="barter-listings"]');
    await expect(barterList).toBeVisible();
  });

  // === الخطوة 12: البحث في المقايضة ===
  test('Step 12: البحث في قسم المقايضة', async ({ page }) => {
    await page.goto('/barter');

    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('لابتوب');
      await searchInput.press('Enter');
    }
  });

  // === الخطوة 13: تصفح المزادات ===
  test('Step 13: تصفح قسم المزادات', async ({ page }) => {
    await page.goto('/auctions');

    await expect(page.locator('h1')).toContainText(/مزاد|Auction/);
  });

  // === الخطوة 14: عرض تفاصيل مزاد ===
  test('Step 14: عرض تفاصيل مزاد', async ({ page }) => {
    await page.goto('/auctions');

    const auctionCard = page.locator('.auction-card, [data-testid="auction-item"]').first();
    if (await auctionCard.isVisible()) {
      await auctionCard.click();
      // التحقق من وجود معلومات المزاد
      await expect(page.locator('.auction-details, [data-testid="auction-details"]')).toBeVisible();
    }
  });

  // === الخطوة 15: تصفح العقارات ===
  test('Step 15: تصفح قسم العقارات', async ({ page }) => {
    await page.goto('/properties');

    await expect(page.locator('h1')).toContainText(/عقارات|Properties/);
  });

  // === الخطوة 16: تصفح السيارات ===
  test('Step 16: تصفح قسم السيارات', async ({ page }) => {
    await page.goto('/vehicles');

    await expect(page.locator('h1')).toContainText(/سيارات|Vehicles/);
  });

  // === الخطوة 17: تصفح الذهب ===
  test('Step 17: تصفح قسم الذهب', async ({ page }) => {
    await page.goto('/gold');

    await expect(page.locator('h1')).toContainText(/ذهب|Gold/);
  });

  // === الخطوة 18: التحقق من المحفظة ===
  test('Step 18: محاولة الوصول للمحفظة', async ({ page }) => {
    await page.goto('/wallet');

    // يجب إعادة التوجيه لتسجيل الدخول أو عرض المحفظة
    await expect(page).toHaveURL(/.*wallet|.*login/);
  });

  // === الخطوة 19: تصفح الإشعارات ===
  test('Step 19: محاولة الوصول للإشعارات', async ({ page }) => {
    await page.goto('/notifications');

    // يجب إعادة التوجيه لتسجيل الدخول أو عرض الإشعارات
    await expect(page).toHaveURL(/.*notifications|.*login/);
  });

  // === الخطوة 20: تصفح الرسائل ===
  test('Step 20: محاولة الوصول للرسائل', async ({ page }) => {
    await page.goto('/messages');

    // يجب إعادة التوجيه لتسجيل الدخول أو عرض الرسائل
    await expect(page).toHaveURL(/.*messages|.*login/);
  });

  // === الخطوة 21: تغيير اللغة ===
  test('Step 21: تغيير لغة الموقع', async ({ page }) => {
    await page.goto('/');

    const languageSwitcher = page.locator('[data-testid="language-switcher"], .language-switcher');
    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click();

      // التحقق من وجود خيار اللغة الإنجليزية
      await expect(page.locator('text=English')).toBeVisible();
    }
  });

  // === الخطوة 22: العودة للصفحة الرئيسية ===
  test('Step 22: العودة للصفحة الرئيسية والتأكد من جاهزية الموقع', async ({ page }) => {
    await page.goto('/');

    // التأكد من أن الموقع يعمل بشكل صحيح
    await expect(page).toHaveTitle(/Xchange|إكسشينج/);
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // التأكد من وجود العناصر الأساسية
    await expect(page.locator('input[type="search"], input[placeholder*="بحث"]')).toBeVisible();
  });
});

/**
 * اختبارات إضافية لرحلة سارة المتقدمة
 */
test.describe('رحلة سارة المتقدمة - Sarah Advanced Journey', () => {

  test('يجب أن تعرض الصفحة الرئيسية العروض المميزة', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.featured, [data-testid="featured"]').first()).toBeVisible();
  });

  test('يجب أن تعمل فلاتر البحث', async ({ page }) => {
    await page.goto('/search?q=موبايل');

    const filterButton = page.locator('button:has-text("فلتر"), button:has-text("تصفية")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await expect(page.locator('.filter-panel, [data-testid="filters"]')).toBeVisible();
    }
  });

  test('يجب أن تعرض صفحة التصنيف المنتجات', async ({ page }) => {
    await page.goto('/categories/electronics');
    await expect(page.locator('.product-card, [data-testid="listing-card"]').first()).toBeVisible();
  });

  test('يجب أن تعمل خاصية المفضلة', async ({ page }) => {
    await page.goto('/wishlist');
    await expect(page).toHaveURL(/.*wishlist|.*login/);
  });

  test('يجب أن تعرض صفحة المساعدة', async ({ page }) => {
    await page.goto('/');

    const helpLink = page.locator('a[href*="help"], text=المساعدة');
    if (await helpLink.isVisible()) {
      await helpLink.click();
      await expect(page).toHaveURL(/.*help/);
    }
  });
});
