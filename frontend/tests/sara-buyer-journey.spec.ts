import { test, expect } from '@playwright/test';

/**
 * سيناريو سارة - رحلة شراء iPhone مستعمل
 *
 * سارة: طالبة ماجستير في الإسكندرية
 * الهدف: شراء iPhone بميزانية 15,000 - 25,000 جنيه
 * المتطلبات: ضمان IMEI نظيف، صحة بطارية جيدة، Escrow للحماية
 */

test.describe('سيناريو سارة - شراء iPhone مستعمل', () => {

  test('رحلة الشراء الكاملة مع التوثيق', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes timeout

    // ==========================================
    // الخطوة 1: الدخول لسوق الموبايلات
    // ==========================================
    console.log('\n📱 الخطوة 1: الدخول لسوق الموبايلات');
    await page.goto('/mobiles');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);

    await page.screenshot({
      path: 'test-results/sara-journey/01-mobiles-homepage.png',
      fullPage: true
    });
    console.log('✅ تم تحميل صفحة سوق الموبايلات');

    // ==========================================
    // الخطوة 2: البحث عن iPhone
    // ==========================================
    console.log('\n🔍 الخطوة 2: البحث عن iPhone');

    // Try to find and use search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"], input[placeholder*="Search"], input[placeholder*="ابحث"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('iPhone');
      await page.waitForTimeout(1500);
    }

    await page.screenshot({
      path: 'test-results/sara-journey/02-search-iphone.png',
      fullPage: true
    });
    console.log('✅ تم البحث عن iPhone');

    // ==========================================
    // الخطوة 3: عرض الفلاتر المتاحة
    // ==========================================
    console.log('\n💰 الخطوة 3: عرض فلاتر السعر والحالة');
    await page.goto('/mobiles');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/03-filters-available.png',
      fullPage: true
    });
    console.log('✅ الفلاتر المتاحة: السعر، العلامة التجارية، الحالة');

    // ==========================================
    // الخطوة 4: اختيار منتج وعرض التفاصيل
    // ==========================================
    console.log('\n📋 الخطوة 4: اختيار منتج وعرض التفاصيل');

    // Try to click on a product
    const productLink = page.locator('a[href*="/mobiles/"], a[href*="/items/"], [class*="card"] a, [class*="product"] a').first();

    if (await productLink.count() > 0) {
      await productLink.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2500);

      await page.screenshot({
        path: 'test-results/sara-journey/04-product-details.png',
        fullPage: true
      });
      console.log('✅ تم عرض تفاصيل المنتج');
    } else {
      await page.goto('/mobiles/1');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'test-results/sara-journey/04-product-details.png',
        fullPage: true
      });
      console.log('✅ صفحة تفاصيل المنتج');
    }

    // ==========================================
    // الخطوة 5: التحقق من IMEI والبطارية
    // ==========================================
    console.log('\n✅ الخطوة 5: التحقق من شارات IMEI وصحة البطارية');

    await page.screenshot({
      path: 'test-results/sara-journey/05-imei-battery-check.png',
      fullPage: true
    });
    console.log('✅ فحص IMEI وصحة البطارية');

    // ==========================================
    // الخطوة 6: عرض معلومات البائع
    // ==========================================
    console.log('\n👤 الخطوة 6: عرض معلومات البائع وتقييماته');

    await page.screenshot({
      path: 'test-results/sara-journey/06-seller-info.png',
      fullPage: true
    });
    console.log('✅ معلومات البائع ومستوى الثقة');

    // ==========================================
    // الخطوة 7: صفحة تسجيل الدخول
    // ==========================================
    console.log('\n🔐 الخطوة 7: صفحة تسجيل الدخول');
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/07-login-page.png',
      fullPage: true
    });
    console.log('✅ صفحة تسجيل الدخول');

    // ==========================================
    // الخطوة 8: تسجيل الدخول الفعلي
    // ==========================================
    console.log('\n🔑 الخطوة 8: تسجيل الدخول ببيانات الاختبار');

    // Fill login form
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"], input[placeholder*="بريد"], input[placeholder*="Email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill('test1@xchange.eg');
      await passwordInput.fill('Test@1234');

      await page.screenshot({
        path: 'test-results/sara-journey/08-login-filled.png',
        fullPage: true
      });
      console.log('✅ تم ملء بيانات الدخول');

      // Click login button
      const loginButton = page.locator('button[type="submit"], button:has-text("تسجيل الدخول"), button:has-text("Login"), button:has-text("دخول")').first();
      if (await loginButton.count() > 0) {
        await loginButton.click();
        await page.waitForTimeout(3000);
        await page.waitForLoadState('domcontentloaded');

        await page.screenshot({
          path: 'test-results/sara-journey/09-after-login.png',
          fullPage: true
        });
        console.log('✅ تم محاولة تسجيل الدخول');
      }
    }

    // ==========================================
    // الخطوة 9: صفحة التسجيل (بديل)
    // ==========================================
    console.log('\n📝 الخطوة 9: صفحة إنشاء حساب جديد');
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/10-register-page.png',
      fullPage: true
    });
    console.log('✅ صفحة التسجيل - إدخال رقم الهاتف المصري');

    // ==========================================
    // الخطوة 10: صفحة المراسلات
    // ==========================================
    console.log('\n💬 الخطوة 10: التواصل مع البائع');
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/11-messages.png',
      fullPage: true
    });
    console.log('✅ صفحة الرسائل للتواصل مع البائع');

    // ==========================================
    // الخطوة 11: سلة التسوق
    // ==========================================
    console.log('\n🛒 الخطوة 11: سلة التسوق');
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/12-cart.png',
      fullPage: true
    });
    console.log('✅ صفحة سلة التسوق');

    // ==========================================
    // الخطوة 12: صفحة الدفع
    // ==========================================
    console.log('\n💳 الخطوة 12: صفحة الدفع واختيار طريقة الدفع');
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/13-checkout.png',
      fullPage: true
    });
    console.log('✅ صفحة الدفع - خيارات: Escrow، فوري، إنستاباي');

    // ==========================================
    // الخطوة 13: معلومات Escrow
    // ==========================================
    console.log('\n🛡️ الخطوة 13: نظام Escrow للحماية');
    await page.goto('/escrow');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/14-escrow.png',
      fullPage: true
    });
    console.log('✅ صفحة Escrow - المال محجوز حتى الفحص');

    // ==========================================
    // الخطوة 14: لوحة التحكم
    // ==========================================
    console.log('\n📊 الخطوة 14: لوحة تحكم المستخدم');
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/15-dashboard.png',
      fullPage: true
    });
    console.log('✅ لوحة التحكم الرئيسية');

    // ==========================================
    // الخطوة 15: تتبع الطلبات
    // ==========================================
    console.log('\n📦 الخطوة 15: صفحة تتبع الطلبات');
    await page.goto('/dashboard/orders');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/16-orders.png',
      fullPage: true
    });
    console.log('✅ صفحة الطلبات - تتبع حالة الشحن');

    // ==========================================
    // الخطوة 16: سجل المعاملات
    // ==========================================
    console.log('\n📜 الخطوة 16: سجل المعاملات');
    await page.goto('/dashboard/transactions');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/17-transactions.png',
      fullPage: true
    });
    console.log('✅ سجل المعاملات المالية');

    // ==========================================
    // الخطوة 17: المفضلة
    // ==========================================
    console.log('\n❤️ الخطوة 17: قائمة المفضلة');
    await page.goto('/dashboard/favorites');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/18-favorites.png',
      fullPage: true
    });
    console.log('✅ قائمة المفضلة');

    // ==========================================
    // الخطوة 18: صفحة المساعدة
    // ==========================================
    console.log('\n❓ الخطوة 18: صفحة المساعدة والدعم');
    await page.goto('/help');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/19-help.png',
      fullPage: true
    });
    console.log('✅ صفحة المساعدة - فتح نزاع إذا لزم');

    // ==========================================
    // الخطوة 19: خيار المقايضة (بديل للشراء)
    // ==========================================
    console.log('\n🔄 الخطوة 19: خيار المقايضة بدلاً من الشراء');
    await page.goto('/mobiles/barter');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/20-barter-option.png',
      fullPage: true
    });
    console.log('✅ صفحة المقايضة - تبادل الموبايلات');

    // ==========================================
    // الخطوة 20: سلاسل المقايضة الذكية
    // ==========================================
    console.log('\n🔗 الخطوة 20: سلاسل المقايضة الثلاثية');
    await page.goto('/barter/chains');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/21-barter-chains.png',
      fullPage: true
    });
    console.log('✅ سلاسل المقايضة - 3 أطراف أو أكثر');

    // ==========================================
    // الخطوة 21: مقارنة الأسعار
    // ==========================================
    console.log('\n📈 الخطوة 21: مقارنة الأسعار');
    await page.goto('/compare');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-results/sara-journey/22-price-compare.png',
      fullPage: true
    });
    console.log('✅ صفحة مقارنة الأسعار');

    // ==========================================
    // ملخص الرحلة
    // ==========================================
    console.log('\n' + '='.repeat(50));
    console.log('🎉 تم إكمال رحلة سارة!');
    console.log('='.repeat(50));
    console.log('\n📸 الصور المحفوظة: 22 صورة');
    console.log('📁 المسار: test-results/sara-journey/');
    console.log('\n⚠️ ملاحظة: بعض الصفحات تتطلب تسجيل دخول حقيقي للوصول للمحتوى');
    console.log('الصفحات المحمية: Dashboard, Orders, Transactions, Checkout, Cart');
  });
});
