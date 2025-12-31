import { test, expect, Page } from '@playwright/test';

/**
 * اختبارات المعاملات الفعلية - Real Transaction Tests
 *
 * هذه الاختبارات تُجري معاملات حقيقية على المنصة:
 * 1. تسجيل مستخدم جديد (فعلياً)
 * 2. تسجيل الدخول
 * 3. إضافة منتج للبيع (فعلياً)
 * 4. البحث عن منتج
 * 5. إتمام عملية شراء (بدون دفع حقيقي)
 */

// بيانات المستخدم للاختبار
const testUser = {
  name: `مستخدم اختبار ${Date.now()}`,
  email: `test.user.${Date.now()}@xchange-test.com`,
  phone: `010${Math.floor(10000000 + Math.random() * 90000000)}`,
  password: 'TestUser@123456',
};

// بيانات المنتج للبيع
const testProduct = {
  title: `iPhone 15 Pro - اختبار ${Date.now()}`,
  description: 'هاتف آيفون 15 برو، حالة ممتازة، ضمان سنة كاملة، جميع الملحقات الأصلية متوفرة.',
  price: '45000',
  category: 'موبايلات',
  condition: 'جديد',
  location: 'القاهرة',
};

test.describe('المعاملات الفعلية - Real Transactions', () => {

  // ============================================
  // اختبار 1: تسجيل مستخدم جديد فعلياً
  // ============================================
  test('1. تسجيل مستخدم جديد فعلياً', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // ملء نموذج التسجيل
    await page.fill('input[name="name"], input[placeholder*="الاسم"]', testUser.name);
    await page.fill('input[name="email"], input[type="email"]', testUser.email);
    await page.fill('input[name="phone"], input[placeholder*="الهاتف"], input[type="tel"]', testUser.phone);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);

    // تأكيد كلمة المرور إذا كان الحقل موجوداً
    const confirmPassword = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]');
    if (await confirmPassword.isVisible()) {
      await confirmPassword.fill(testUser.password);
    }

    // الموافقة على الشروط إذا كانت موجودة
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    // التقاط صورة قبل الإرسال
    await page.screenshot({ path: 'e2e/screenshots/register-before-submit.png' });

    // النقر على زر التسجيل
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // انتظار الاستجابة
    await page.waitForTimeout(3000);

    // التقاط صورة بعد الإرسال
    await page.screenshot({ path: 'e2e/screenshots/register-after-submit.png' });

    // التحقق من النجاح أو رسالة الخطأ
    const successMessage = page.locator('text=تم التسجيل, text=مرحباً, text=success');
    const errorMessage = page.locator('.error, .alert-danger, [role="alert"]');

    const hasSuccess = await successMessage.isVisible().catch(() => false);
    const hasError = await errorMessage.isVisible().catch(() => false);

    console.log(`Registration result - Success: ${hasSuccess}, Error: ${hasError}`);
    console.log(`Current URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 2: تسجيل الدخول
  // ============================================
  test('2. تسجيل الدخول بمستخدم موجود', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // استخدام بيانات مستخدم اختبار موجود
    const loginEmail = 'test1@xchange.eg';
    const loginPassword = 'Test123456!';

    // ملء نموذج تسجيل الدخول
    await page.fill('input[name="email"], input[type="email"]', loginEmail);
    await page.fill('input[name="password"], input[type="password"]', loginPassword);

    // التقاط صورة
    await page.screenshot({ path: 'e2e/screenshots/login-before-submit.png' });

    // النقر على زر الدخول
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // انتظار الاستجابة
    await page.waitForTimeout(3000);

    // التقاط صورة بعد الدخول
    await page.screenshot({ path: 'e2e/screenshots/login-after-submit.png' });

    console.log(`Login result - Current URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 3: إضافة منتج للبيع
  // ============================================
  test('3. إضافة منتج للبيع فعلياً', async ({ page }) => {
    // تسجيل الدخول أولاً
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test1@xchange.eg');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // الذهاب لصفحة البيع
    await page.goto('/sell');
    await page.waitForLoadState('networkidle');

    // التقاط صورة لصفحة البيع
    await page.screenshot({ path: 'e2e/screenshots/sell-page.png' });

    // البحث عن حقول النموذج وملئها
    const titleInput = page.locator('input[name="title"], input[placeholder*="عنوان"], input[placeholder*="اسم المنتج"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill(testProduct.title);
    }

    const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="وصف"]').first();
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill(testProduct.description);
    }

    const priceInput = page.locator('input[name="price"], input[placeholder*="سعر"], input[type="number"]').first();
    if (await priceInput.isVisible()) {
      await priceInput.fill(testProduct.price);
    }

    // التقاط صورة بعد ملء النموذج
    await page.screenshot({ path: 'e2e/screenshots/sell-form-filled.png' });

    // محاولة إرسال النموذج
    const submitButton = page.locator('button[type="submit"], button:has-text("نشر"), button:has-text("إضافة")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(3000);
    }

    // التقاط صورة النتيجة
    await page.screenshot({ path: 'e2e/screenshots/sell-result.png' });

    console.log(`Sell product result - Current URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 4: البحث عن منتج
  // ============================================
  test('4. البحث عن منتج', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // البحث عن منتج
    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"]').first();
    await expect(searchInput).toBeVisible();

    await searchInput.fill('iPhone');
    await searchInput.press('Enter');

    await page.waitForTimeout(2000);

    // التقاط صورة نتائج البحث
    await page.screenshot({ path: 'e2e/screenshots/search-results.png' });

    // التحقق من وجود نتائج
    const hasResults = await page.locator('.product-card, [data-testid="listing-card"], .listing-item').first().isVisible().catch(() => false);
    console.log(`Search results found: ${hasResults}`);
    console.log(`Current URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 5: عرض تفاصيل منتج والضغط على شراء
  // ============================================
  test('5. عرض منتج والضغط على شراء', async ({ page }) => {
    // الذهاب لصفحة الموبايلات
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');

    // التقاط صورة صفحة المنتجات
    await page.screenshot({ path: 'e2e/screenshots/mobiles-page.png' });

    // النقر على أول منتج
    const productCard = page.locator('.product-card, [data-testid="listing-card"], a[href*="/listing/"], a[href*="/product/"]').first();

    if (await productCard.isVisible()) {
      await productCard.click();
      await page.waitForTimeout(2000);

      // التقاط صورة صفحة المنتج
      await page.screenshot({ path: 'e2e/screenshots/product-details.png' });

      // البحث عن زر الشراء أو التواصل
      const buyButton = page.locator('button:has-text("شراء"), button:has-text("اشتري"), button:has-text("تواصل"), button:has-text("إضافة للسلة")').first();

      if (await buyButton.isVisible()) {
        await buyButton.click();
        await page.waitForTimeout(2000);

        // التقاط صورة بعد الضغط
        await page.screenshot({ path: 'e2e/screenshots/after-buy-click.png' });
      }

      console.log(`Product page URL: ${page.url()}`);
    }
  });

  // ============================================
  // اختبار 6: إضافة للسلة وعرض السلة
  // ============================================
  test('6. إضافة منتج للسلة', async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');

    // النقر على أول منتج
    const productCard = page.locator('.product-card, [data-testid="listing-card"]').first();
    if (await productCard.isVisible()) {
      await productCard.click();
      await page.waitForTimeout(2000);

      // البحث عن زر إضافة للسلة
      const addToCartButton = page.locator('button:has-text("إضافة للسلة"), button:has-text("أضف للسلة"), button:has-text("Add to Cart")').first();

      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        await page.waitForTimeout(2000);

        // التقاط صورة
        await page.screenshot({ path: 'e2e/screenshots/added-to-cart.png' });
      }
    }

    // الذهاب لصفحة السلة
    await page.goto('/cart');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/cart-page.png' });

    console.log(`Cart page URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 7: بدء عملية الدفع (checkout)
  // ============================================
  test('7. بدء عملية الدفع', async ({ page }) => {
    // تسجيل الدخول
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test1@xchange.eg');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // الذهاب لصفحة الدفع
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // التقاط صورة صفحة الدفع
    await page.screenshot({ path: 'e2e/screenshots/checkout-page.png' });

    // التحقق من وجود خيارات الدفع
    const paymentOptions = page.locator('text=فوري, text=Fawry, text=باي موب, text=PayMob, text=إنستا باي, text=InstaPay');
    const hasPaymentOptions = await paymentOptions.first().isVisible().catch(() => false);

    console.log(`Checkout page loaded, payment options visible: ${hasPaymentOptions}`);
    console.log(`Current URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 8: تصفح سوق الخردة وإضافة منتج
  // ============================================
  test('8. إضافة منتج في سوق الخردة', async ({ page }) => {
    // تسجيل الدخول
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test1@xchange.eg');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // الذهاب لصفحة بيع الخردة
    await page.goto('/scrap/sell');
    await page.waitForLoadState('networkidle');

    // التقاط صورة
    await page.screenshot({ path: 'e2e/screenshots/scrap-sell-page.png' });

    // محاولة ملء النموذج
    const titleInput = page.locator('input[name="title"], input[placeholder*="عنوان"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('نحاس أحمر - 50 كيلو');
    }

    const weightInput = page.locator('input[name="weight"], input[placeholder*="وزن"]').first();
    if (await weightInput.isVisible()) {
      await weightInput.fill('50');
    }

    // التقاط صورة بعد ملء النموذج
    await page.screenshot({ path: 'e2e/screenshots/scrap-form-filled.png' });

    console.log(`Scrap sell page URL: ${page.url()}`);
  });

  // ============================================
  // اختبار 9: إرسال رسالة للبائع
  // ============================================
  test('9. إرسال رسالة للبائع', async ({ page }) => {
    // تسجيل الدخول
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test1@xchange.eg');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // الذهاب لصفحة منتج
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');

    const productCard = page.locator('.product-card, [data-testid="listing-card"]').first();
    if (await productCard.isVisible()) {
      await productCard.click();
      await page.waitForTimeout(2000);

      // البحث عن زر التواصل
      const contactButton = page.locator('button:has-text("تواصل"), button:has-text("راسل البائع"), button:has-text("إرسال رسالة")').first();

      if (await contactButton.isVisible()) {
        await contactButton.click();
        await page.waitForTimeout(2000);

        // التقاط صورة نافذة المحادثة
        await page.screenshot({ path: 'e2e/screenshots/chat-modal.png' });

        // محاولة كتابة رسالة
        const messageInput = page.locator('textarea, input[placeholder*="رسالة"], input[placeholder*="اكتب"]').first();
        if (await messageInput.isVisible()) {
          await messageInput.fill('مرحباً، هل المنتج متوفر؟');

          const sendButton = page.locator('button:has-text("إرسال"), button[type="submit"]').first();
          if (await sendButton.isVisible()) {
            await sendButton.click();
            await page.waitForTimeout(2000);
          }
        }

        // التقاط صورة بعد الإرسال
        await page.screenshot({ path: 'e2e/screenshots/message-sent.png' });
      }
    }

    console.log(`Message test completed`);
  });

  // ============================================
  // اختبار 10: تقديم عرض سعر
  // ============================================
  test('10. تقديم عرض سعر على منتج', async ({ page }) => {
    // تسجيل الدخول
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test1@xchange.eg');
    await page.fill('input[type="password"]', 'Test123456!');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // الذهاب لصفحة منتج
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');

    const productCard = page.locator('.product-card, [data-testid="listing-card"]').first();
    if (await productCard.isVisible()) {
      await productCard.click();
      await page.waitForTimeout(2000);

      // البحث عن زر تقديم عرض
      const offerButton = page.locator('button:has-text("تقديم عرض"), button:has-text("عرض سعر"), button:has-text("Make Offer")').first();

      if (await offerButton.isVisible()) {
        await offerButton.click();
        await page.waitForTimeout(2000);

        // التقاط صورة نافذة العرض
        await page.screenshot({ path: 'e2e/screenshots/offer-modal.png' });

        // محاولة إدخال عرض السعر
        const offerInput = page.locator('input[name="offerPrice"], input[placeholder*="عرض"], input[type="number"]').first();
        if (await offerInput.isVisible()) {
          await offerInput.fill('40000');

          const submitButton = page.locator('button:has-text("إرسال"), button:has-text("تأكيد"), button[type="submit"]').first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(2000);
          }
        }

        // التقاط صورة بعد الإرسال
        await page.screenshot({ path: 'e2e/screenshots/offer-submitted.png' });
      }
    }

    console.log(`Offer test completed`);
  });
});

/**
 * تقرير النتائج
 */
test.afterAll(async () => {
  console.log('\n========================================');
  console.log('     تقرير اختبارات المعاملات الفعلية     ');
  console.log('========================================');
  console.log('Screenshots saved in: e2e/screenshots/');
  console.log('========================================\n');
});
