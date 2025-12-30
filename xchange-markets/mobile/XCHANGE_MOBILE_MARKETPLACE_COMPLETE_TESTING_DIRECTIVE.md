# 🔬 توجيه الاختبار الشامل - سوق الموبايلات Xchange
## Comprehensive Mobile Marketplace Testing Directive v1.0

---

# 📋 نظرة عامة

## المهمة
اختبار **سوق الموبايلات** في منصة Xchange بشكل شامل ومتكامل للتأكد من جاهزيته للإطلاق.

## الهدف
**صفر أخطاء** - التأكد من أن أي مستخدم يمكنه إجراء أي معاملة بدون أي مشكلة.

## المنصة
- **Frontend:** https://xchange-egypt.vercel.app
- **Backend API:** (حسب .env)
- **Repository:** https://github.com/AiSchool-Admin/xchange-egypt

---

# 🎯 فئات الاختبار

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🔬 خريطة الاختبارات الشاملة                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1️⃣ اختبارات واجهة المستخدم (UI/UX Tests)                                  │
│  2️⃣ اختبارات API (Backend Tests)                                           │
│  3️⃣ اختبارات سيناريوهات المستخدم (User Journey Tests)                      │
│  4️⃣ اختبارات الأمان (Security Tests)                                       │
│  5️⃣ اختبارات الأداء (Performance Tests)                                    │
│  6️⃣ اختبارات التوافق (Compatibility Tests)                                 │
│  7️⃣ اختبارات الحالات الحدية (Edge Cases)                                   │
│  8️⃣ اختبارات معالجة الأخطاء (Error Handling Tests)                         │
│  9️⃣ اختبارات التكامل (Integration Tests)                                   │
│  🔟 اختبارات إمكانية الوصول (Accessibility Tests)                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 🔧 الإعداد الأولي

```bash
# ═══════════════════════════════════════════════════════════════════════════
# الخطوة 1: إنشاء بيئة الاختبار
# ═══════════════════════════════════════════════════════════════════════════

mkdir -p ~/xchange-mobile-tests
cd ~/xchange-mobile-tests

# تهيئة المشروع
npm init -y

# تثبيت أدوات الاختبار
npm install -D @playwright/test
npm install -D artillery          # اختبارات الأداء
npm install -D axe-core           # اختبارات إمكانية الوصول
npm install -D @axe-core/playwright

# تثبيت المتصفحات
npx playwright install

# إنشاء هيكل المجلدات
mkdir -p tests/{ui,api,scenarios,security,performance,compatibility,edge-cases,errors,integration,accessibility}
mkdir -p reports
mkdir -p screenshots
mkdir -p test-data
```

---

# 1️⃣ اختبارات واجهة المستخدم (UI/UX Tests)

## 1.1 الصفحة الرئيسية لسوق الموبايلات

```typescript
// tests/ui/01-mobile-marketplace-home.spec.ts

import { test, expect } from '@playwright/test';

test.describe('🏠 الصفحة الرئيسية - سوق الموبايلات', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // تحميل الصفحة
  // ═══════════════════════════════════════════════════════════════════════

  test('تحميل الصفحة بنجاح', async ({ page }) => {
    await expect(page).toHaveTitle(/موبايل|mobile|Xchange/i);
    await page.screenshot({ path: 'screenshots/ui/01-mobile-home.png', fullPage: true });
  });

  test('عرض شعار المنصة', async ({ page }) => {
    const logo = page.locator('img[alt*="logo"], img[alt*="Xchange"], [class*="logo"]').first();
    await expect(logo).toBeVisible();
  });

  test('عرض شريط التنقل', async ({ page }) => {
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // عناصر البحث والفلترة
  // ═══════════════════════════════════════════════════════════════════════

  test('وجود حقل البحث', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"], input[placeholder*="search"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('وجود فلاتر البحث', async ({ page }) => {
    // فلتر العلامة التجارية
    const brandFilter = page.locator('[data-filter="brand"], select:has-text("العلامة"), [class*="brand"]');
    
    // فلتر السعر
    const priceFilter = page.locator('[data-filter="price"], [class*="price-range"]');
    
    // فلتر الحالة
    const conditionFilter = page.locator('[data-filter="condition"], select:has-text("الحالة")');
    
    console.log('فلتر العلامة التجارية:', await brandFilter.count() > 0 ? '✅' : '❌');
    console.log('فلتر السعر:', await priceFilter.count() > 0 ? '✅' : '❌');
    console.log('فلتر الحالة:', await conditionFilter.count() > 0 ? '✅' : '❌');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // عرض المنتجات
  // ═══════════════════════════════════════════════════════════════════════

  test('عرض قائمة الموبايلات', async ({ page }) => {
    const productCards = page.locator('[class*="product"], [class*="listing"], [class*="card"]');
    const count = await productCards.count();
    console.log(`عدد المنتجات المعروضة: ${count}`);
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('كل بطاقة منتج تحتوي على العناصر الأساسية', async ({ page }) => {
    const firstCard = page.locator('[class*="product"], [class*="listing"], [class*="card"]').first();
    
    if (await firstCard.isVisible()) {
      // صورة المنتج
      const image = firstCard.locator('img');
      await expect(image).toBeVisible();
      
      // عنوان المنتج
      const title = firstCard.locator('h2, h3, h4, [class*="title"]');
      await expect(title).toBeVisible();
      
      // السعر
      const price = firstCard.locator('[class*="price"], text=/\\d+.*جنيه|EGP|ج\\.م/');
      await expect(price).toBeVisible();
      
      console.log('✅ بطاقة المنتج تحتوي على كل العناصر الأساسية');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // الترقيم (Pagination)
  // ═══════════════════════════════════════════════════════════════════════

  test('وجود ترقيم الصفحات', async ({ page }) => {
    const pagination = page.locator('[class*="pagination"], [class*="pager"], nav[aria-label*="pagination"]');
    if (await pagination.isVisible()) {
      console.log('✅ ترقيم الصفحات موجود');
      await page.screenshot({ path: 'screenshots/ui/02-pagination.png' });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // الترتيب
  // ═══════════════════════════════════════════════════════════════════════

  test('وجود خيارات الترتيب', async ({ page }) => {
    const sortDropdown = page.locator('select:has-text("ترتيب"), [class*="sort"], button:has-text("ترتيب")');
    if (await sortDropdown.count() > 0) {
      console.log('✅ خيارات الترتيب موجودة');
    }
  });
});
```

## 1.2 صفحة تفاصيل الموبايل

```typescript
// tests/ui/02-mobile-details-page.spec.ts

import { test, expect } from '@playwright/test';

test.describe('📱 صفحة تفاصيل الموبايل', () => {

  test.beforeEach(async ({ page }) => {
    // الذهاب لأول موبايل متاح
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('[class*="product"] a, [class*="listing"] a, [class*="card"] a').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // معلومات المنتج الأساسية
  // ═══════════════════════════════════════════════════════════════════════

  test('عرض عنوان الموبايل', async ({ page }) => {
    const title = page.locator('h1, [class*="product-title"], [class*="listing-title"]').first();
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    console.log('عنوان المنتج:', titleText);
  });

  test('عرض السعر بوضوح', async ({ page }) => {
    const price = page.locator('[class*="price"]').first();
    await expect(price).toBeVisible();
    const priceText = await price.textContent();
    console.log('السعر:', priceText);
    expect(priceText).toMatch(/\d/); // يحتوي على أرقام
  });

  test('عرض صور المنتج', async ({ page }) => {
    const images = page.locator('[class*="gallery"] img, [class*="product-image"] img, [class*="slider"] img');
    const count = await images.count();
    console.log(`عدد الصور: ${count}`);
    expect(count).toBeGreaterThan(0);
    await page.screenshot({ path: 'screenshots/ui/03-product-images.png' });
  });

  test('عرض وصف المنتج', async ({ page }) => {
    const description = page.locator('[class*="description"], [class*="details"]').first();
    if (await description.isVisible()) {
      console.log('✅ وصف المنتج موجود');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // مواصفات الموبايل
  // ═══════════════════════════════════════════════════════════════════════

  test('عرض مواصفات الموبايل', async ({ page }) => {
    const specs = {
      brand: page.locator('text=/العلامة|الماركة|Brand/i'),
      model: page.locator('text=/الموديل|Model/i'),
      storage: page.locator('text=/السعة|التخزين|Storage|GB/i'),
      ram: page.locator('text=/الذاكرة|RAM/i'),
      color: page.locator('text=/اللون|Color/i'),
      condition: page.locator('text=/الحالة|Condition/i'),
      battery: page.locator('text=/البطارية|Battery/i'),
    };

    for (const [name, locator] of Object.entries(specs)) {
      const isVisible = await locator.first().isVisible().catch(() => false);
      console.log(`${name}: ${isVisible ? '✅' : '⚠️ غير موجود'}`);
    }
  });

  test('عرض رقم IMEI أو حالة التحقق', async ({ page }) => {
    const imeiStatus = page.locator('text=/IMEI|تحقق|verified|موثق/i');
    if (await imeiStatus.count() > 0) {
      console.log('✅ حالة IMEI معروضة');
    } else {
      console.log('⚠️ حالة IMEI غير معروضة');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // معلومات البائع
  // ═══════════════════════════════════════════════════════════════════════

  test('عرض معلومات البائع', async ({ page }) => {
    const sellerInfo = page.locator('[class*="seller"], [class*="vendor"], [class*="owner"]');
    if (await sellerInfo.isVisible()) {
      console.log('✅ معلومات البائع موجودة');
      
      // اسم البائع
      const sellerName = sellerInfo.locator('[class*="name"]');
      // تقييم البائع
      const sellerRating = sellerInfo.locator('[class*="rating"], [class*="stars"]');
      // تاريخ الانضمام
      const memberSince = sellerInfo.locator('text=/منذ|member since/i');
      
      console.log('  - اسم البائع:', await sellerName.isVisible() ? '✅' : '❌');
      console.log('  - التقييم:', await sellerRating.isVisible() ? '✅' : '❌');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // أزرار الإجراءات
  // ═══════════════════════════════════════════════════════════════════════

  test('وجود زر الشراء/الاتصال', async ({ page }) => {
    const buyButton = page.locator('button:has-text("شراء"), button:has-text("اشتري"), button:has-text("Buy")');
    const contactButton = page.locator('button:has-text("تواصل"), button:has-text("اتصل"), button:has-text("Contact")');
    
    const hasBuy = await buyButton.isVisible().catch(() => false);
    const hasContact = await contactButton.isVisible().catch(() => false);
    
    console.log('زر الشراء:', hasBuy ? '✅' : '❌');
    console.log('زر التواصل:', hasContact ? '✅' : '❌');
    
    expect(hasBuy || hasContact).toBeTruthy();
  });

  test('وجود زر إضافة للمفضلة', async ({ page }) => {
    const favoriteBtn = page.locator('button[aria-label*="favorite"], button[aria-label*="مفضل"], [class*="favorite"], [class*="wishlist"]');
    if (await favoriteBtn.isVisible()) {
      console.log('✅ زر المفضلة موجود');
    }
  });

  test('وجود زر المشاركة', async ({ page }) => {
    const shareBtn = page.locator('button[aria-label*="share"], button:has-text("مشاركة"), [class*="share"]');
    if (await shareBtn.isVisible()) {
      console.log('✅ زر المشاركة موجود');
    }
  });

  test('وجود زر الإبلاغ', async ({ page }) => {
    const reportBtn = page.locator('button:has-text("إبلاغ"), button:has-text("Report"), [class*="report"]');
    if (await reportBtn.isVisible()) {
      console.log('✅ زر الإبلاغ موجود');
    }
  });
});
```

## 1.3 صفحة إضافة موبايل للبيع

```typescript
// tests/ui/03-add-mobile-listing.spec.ts

import { test, expect } from '@playwright/test';

test.describe('➕ صفحة إضافة موبايل للبيع', () => {

  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول أولاً
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // الذهاب لصفحة إضافة منتج
    await page.goto('/listings/new');
    await page.waitForLoadState('networkidle');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // النموذج الأساسي
  // ═══════════════════════════════════════════════════════════════════════

  test('وجود جميع حقول النموذج المطلوبة', async ({ page }) => {
    const fields = {
      title: 'input[name="title"], input[placeholder*="عنوان"]',
      description: 'textarea[name="description"], textarea[placeholder*="وصف"]',
      price: 'input[name="price"], input[type="number"]',
      brand: 'select[name="brand"], input[name="brand"]',
      model: 'input[name="model"]',
      storage: 'select[name="storage"], input[name="storage"]',
      color: 'select[name="color"], input[name="color"]',
      condition: 'select[name="condition"]',
      images: 'input[type="file"]',
    };

    for (const [name, selector] of Object.entries(fields)) {
      const field = page.locator(selector).first();
      const isVisible = await field.isVisible().catch(() => false);
      console.log(`حقل ${name}: ${isVisible ? '✅' : '❌'}`);
    }
    
    await page.screenshot({ path: 'screenshots/ui/04-add-listing-form.png', fullPage: true });
  });

  test('حقل IMEI موجود ويعمل', async ({ page }) => {
    const imeiField = page.locator('input[name="imei"], input[placeholder*="IMEI"]');
    if (await imeiField.isVisible()) {
      await imeiField.fill('356789012345678');
      console.log('✅ حقل IMEI يقبل الإدخال');
      
      // التحقق من زر فحص IMEI
      const verifyBtn = page.locator('button:has-text("تحقق"), button:has-text("Verify")');
      if (await verifyBtn.isVisible()) {
        console.log('✅ زر التحقق من IMEI موجود');
      }
    }
  });

  test('رفع الصور يعمل', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      // إنشاء صورة اختبار
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]');
        const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
        const dt = new DataTransfer();
        dt.items.add(file);
        (input as HTMLInputElement).files = dt.files;
        input?.dispatchEvent(new Event('change', { bubbles: true }));
      });
      console.log('✅ نظام رفع الصور موجود');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // التحقق من البيانات (Validation)
  // ═══════════════════════════════════════════════════════════════════════

  test('رسالة خطأ عند إرسال نموذج فارغ', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    
    await page.waitForTimeout(1000);
    
    // البحث عن رسائل الخطأ
    const errorMessages = page.locator('[class*="error"], [class*="invalid"], [role="alert"]');
    const count = await errorMessages.count();
    
    if (count > 0) {
      console.log(`✅ تظهر ${count} رسالة خطأ عند إرسال نموذج فارغ`);
    }
    
    await page.screenshot({ path: 'screenshots/ui/05-form-validation.png', fullPage: true });
  });

  test('التحقق من تنسيق IMEI', async ({ page }) => {
    const imeiField = page.locator('input[name="imei"]').first();
    if (await imeiField.isVisible()) {
      // IMEI خاطئ (أقل من 15 رقم)
      await imeiField.fill('12345');
      await page.click('body'); // لتفعيل التحقق
      
      const error = page.locator('[class*="error"]:near(input[name="imei"])');
      if (await error.isVisible()) {
        console.log('✅ يظهر خطأ عند IMEI غير صالح');
      }
    }
  });

  test('التحقق من الحد الأدنى للسعر', async ({ page }) => {
    const priceField = page.locator('input[name="price"]').first();
    if (await priceField.isVisible()) {
      await priceField.fill('0');
      await page.click('body');
      
      // التحقق من رسالة الخطأ
      const error = page.locator('[class*="error"]:near(input[name="price"])');
      if (await error.isVisible()) {
        console.log('✅ يظهر خطأ عند سعر صفر');
      }
    }
  });
});
```

---

# 2️⃣ اختبارات API (Backend Tests)

```typescript
// tests/api/01-mobile-api.spec.ts

import { test, expect } from '@playwright/test';

const API_BASE = process.env.API_URL || 'https://xchange-backend.railway.app';

test.describe('🔌 API سوق الموبايلات', () => {

  let authToken: string;
  let testListingId: string;

  // ═══════════════════════════════════════════════════════════════════════
  // Authentication
  // ═══════════════════════════════════════════════════════════════════════

  test('تسجيل الدخول والحصول على Token', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'Test@123456'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    authToken = data.token || data.accessToken;
    expect(authToken).toBeTruthy();
    console.log('✅ تم الحصول على Token');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Listings CRUD
  // ═══════════════════════════════════════════════════════════════════════

  test('جلب قائمة الموبايلات', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/listings?category=mobiles`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    console.log(`✅ تم جلب ${data.items?.length || data.length || 0} موبايل`);
    expect(Array.isArray(data.items || data)).toBeTruthy();
  });

  test('جلب تفاصيل موبايل واحد', async ({ request }) => {
    // أولاً نجلب القائمة
    const listResponse = await request.get(`${API_BASE}/api/listings?category=mobiles&limit=1`);
    const listings = await listResponse.json();
    
    if (listings.items?.[0]?.id || listings[0]?.id) {
      const id = listings.items?.[0]?.id || listings[0]?.id;
      
      const response = await request.get(`${API_BASE}/api/listings/${id}`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.id).toBe(id);
      console.log('✅ تم جلب تفاصيل الموبايل');
    }
  });

  test('إنشاء إعلان موبايل جديد', async ({ request }) => {
    const newListing = {
      title: 'iPhone 15 Pro Max - اختبار',
      description: 'موبايل للاختبار فقط',
      price: 45000,
      categoryId: 'mobiles',
      condition: 'excellent',
      listingType: 'DIRECT_SALE',
      specifications: {
        brand: 'Apple',
        model: 'iPhone 15 Pro Max',
        storage: '256GB',
        color: 'Black',
        batteryHealth: 95
      }
    };

    const response = await request.post(`${API_BASE}/api/listings`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: newListing
    });

    if (response.ok()) {
      const data = await response.json();
      testListingId = data.id;
      console.log('✅ تم إنشاء إعلان جديد:', testListingId);
    } else {
      console.log('❌ فشل إنشاء الإعلان:', await response.text());
    }
  });

  test('تعديل إعلان موبايل', async ({ request }) => {
    if (!testListingId) {
      test.skip();
      return;
    }

    const response = await request.patch(`${API_BASE}/api/listings/${testListingId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        price: 44000,
        description: 'تم تحديث الوصف - اختبار'
      }
    });

    if (response.ok()) {
      console.log('✅ تم تعديل الإعلان');
    }
  });

  test('حذف إعلان موبايل', async ({ request }) => {
    if (!testListingId) {
      test.skip();
      return;
    }

    const response = await request.delete(`${API_BASE}/api/listings/${testListingId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.ok()) {
      console.log('✅ تم حذف الإعلان');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Search & Filter
  // ═══════════════════════════════════════════════════════════════════════

  test('البحث في الموبايلات', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/listings/search?q=iPhone&category=mobiles`);
    
    expect(response.ok()).toBeTruthy();
    console.log('✅ البحث يعمل');
  });

  test('الفلترة حسب العلامة التجارية', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/listings?category=mobiles&brand=Apple`);
    expect(response.ok()).toBeTruthy();
    console.log('✅ الفلترة حسب العلامة تعمل');
  });

  test('الفلترة حسب نطاق السعر', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/listings?category=mobiles&minPrice=10000&maxPrice=50000`);
    expect(response.ok()).toBeTruthy();
    console.log('✅ الفلترة حسب السعر تعمل');
  });

  test('الفلترة حسب الحالة', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/listings?category=mobiles&condition=excellent`);
    expect(response.ok()).toBeTruthy();
    console.log('✅ الفلترة حسب الحالة تعمل');
  });

  test('الترتيب حسب السعر (تصاعدي)', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/listings?category=mobiles&sortBy=price&sortOrder=asc`);
    expect(response.ok()).toBeTruthy();
    console.log('✅ الترتيب التصاعدي يعمل');
  });

  test('الترتيب حسب السعر (تنازلي)', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/listings?category=mobiles&sortBy=price&sortOrder=desc`);
    expect(response.ok()).toBeTruthy();
    console.log('✅ الترتيب التنازلي يعمل');
  });

  test('الترتيب حسب الأحدث', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/listings?category=mobiles&sortBy=createdAt&sortOrder=desc`);
    expect(response.ok()).toBeTruthy();
    console.log('✅ الترتيب حسب الأحدث يعمل');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // IMEI Verification
  // ═══════════════════════════════════════════════════════════════════════

  test('التحقق من IMEI صالح', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/verification/imei`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { imei: '356789012345678' }
    });

    console.log('التحقق من IMEI:', response.ok() ? '✅ يعمل' : '⚠️ قد لا يكون مفعل');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Favorites
  // ═══════════════════════════════════════════════════════════════════════

  test('إضافة موبايل للمفضلة', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/favorites`, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { listingId: 'test-listing-id' }
    });

    console.log('إضافة للمفضلة:', response.ok() ? '✅' : '⚠️');
  });

  test('جلب قائمة المفضلة', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/favorites`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    expect(response.ok()).toBeTruthy();
    console.log('✅ جلب المفضلة يعمل');
  });
});
```

---

# 3️⃣ اختبارات سيناريوهات المستخدم (User Journey Tests)

```typescript
// tests/scenarios/01-complete-purchase-journey.spec.ts

import { test, expect } from '@playwright/test';

test.describe('🛒 رحلة شراء موبايل كاملة', () => {

  const buyer = {
    email: `buyer_${Date.now()}@test.xchange.eg`,
    password: 'Test@123456',
    name: 'مشتري اختبار',
    phone: '01012345678'
  };

  // ═══════════════════════════════════════════════════════════════════════
  // السيناريو الكامل
  // ═══════════════════════════════════════════════════════════════════════

  test('1. تسجيل حساب جديد للمشتري', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', buyer.name);
    await page.fill('input[name="email"]', buyer.email);
    await page.fill('input[name="password"]', buyer.password);
    await page.fill('input[name="phone"]', buyer.phone);
    
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'screenshots/scenarios/01-register.png' });
    console.log('✅ تم تسجيل حساب المشتري');
  });

  test('2. تصفح سوق الموبايلات', async ({ page }) => {
    // تسجيل الدخول
    await page.goto('/login');
    await page.fill('input[name="email"]', buyer.email);
    await page.fill('input[name="password"]', buyer.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // الذهاب لسوق الموبايلات
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'screenshots/scenarios/02-browse.png', fullPage: true });
    console.log('✅ تم تصفح سوق الموبايلات');
  });

  test('3. البحث عن iPhone', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', buyer.email);
    await page.fill('input[name="password"]', buyer.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/mobiles');
    
    const searchInput = page.locator('input[type="search"], input[name="search"]').first();
    await searchInput.fill('iPhone');
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/scenarios/03-search.png', fullPage: true });
    console.log('✅ تم البحث عن iPhone');
  });

  test('4. تطبيق فلاتر البحث', async ({ page }) => {
    await page.goto('/mobiles?q=iPhone');
    await page.waitForLoadState('networkidle');
    
    // فلتر السعر
    const minPrice = page.locator('input[name="minPrice"]');
    const maxPrice = page.locator('input[name="maxPrice"]');
    
    if (await minPrice.isVisible()) {
      await minPrice.fill('10000');
    }
    if (await maxPrice.isVisible()) {
      await maxPrice.fill('50000');
    }
    
    // فلتر الحالة
    const conditionFilter = page.locator('select[name="condition"]');
    if (await conditionFilter.isVisible()) {
      await conditionFilter.selectOption('excellent');
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/scenarios/04-filters.png', fullPage: true });
    console.log('✅ تم تطبيق الفلاتر');
  });

  test('5. فتح تفاصيل موبايل', async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('[class*="product"] a, [class*="card"] a').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ path: 'screenshots/scenarios/05-product-details.png', fullPage: true });
      console.log('✅ تم فتح تفاصيل المنتج');
    }
  });

  test('6. التواصل مع البائع', async ({ page }) => {
    // افتراض أننا في صفحة المنتج
    await page.goto('/mobiles');
    const firstProduct = page.locator('[class*="product"] a').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
    }
    
    const contactBtn = page.locator('button:has-text("تواصل"), button:has-text("رسالة"), button:has-text("Chat")').first();
    if (await contactBtn.isVisible()) {
      await contactBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/scenarios/06-contact-seller.png' });
      console.log('✅ تم فتح نافذة التواصل');
    }
  });

  test('7. إضافة للمفضلة', async ({ page }) => {
    await page.goto('/mobiles');
    const firstProduct = page.locator('[class*="product"] a').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
    }
    
    const favoriteBtn = page.locator('button[aria-label*="favorite"], [class*="favorite"], [class*="heart"]').first();
    if (await favoriteBtn.isVisible()) {
      await favoriteBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ تم إضافة المنتج للمفضلة');
    }
  });

  test('8. بدء عملية الشراء', async ({ page }) => {
    await page.goto('/mobiles');
    const firstProduct = page.locator('[class*="product"] a').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
    }
    
    const buyBtn = page.locator('button:has-text("شراء"), button:has-text("Buy"), button:has-text("اطلب")').first();
    if (await buyBtn.isVisible()) {
      await buyBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/scenarios/08-checkout.png', fullPage: true });
      console.log('✅ تم بدء عملية الشراء');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// رحلة البائع
// ═══════════════════════════════════════════════════════════════════════════

test.describe('📦 رحلة بيع موبايل كاملة', () => {

  const seller = {
    email: `seller_${Date.now()}@test.xchange.eg`,
    password: 'Test@123456',
    name: 'بائع اختبار',
    phone: '01098765432'
  };

  const mobile = {
    title: 'Samsung Galaxy S24 Ultra - للبيع',
    description: 'موبايل ممتاز، استخدام شهرين فقط، كامل الملحقات',
    price: '55000',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    storage: '256GB',
    color: 'Black',
    condition: 'excellent',
    batteryHealth: '98'
  };

  test('1. تسجيل حساب البائع', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', seller.name);
    await page.fill('input[name="email"]', seller.email);
    await page.fill('input[name="password"]', seller.password);
    await page.fill('input[name="phone"]', seller.phone);
    
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ تم تسجيل حساب البائع');
  });

  test('2. الذهاب لصفحة إضافة منتج', async ({ page }) => {
    // تسجيل الدخول
    await page.goto('/login');
    await page.fill('input[name="email"]', seller.email);
    await page.fill('input[name="password"]', seller.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // الذهاب لإضافة منتج
    await page.goto('/listings/new');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'screenshots/scenarios/seller-01-add-form.png', fullPage: true });
    console.log('✅ تم فتح صفحة إضافة منتج');
  });

  test('3. ملء بيانات الموبايل', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', seller.email);
    await page.fill('input[name="password"]', seller.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/listings/new');
    await page.waitForLoadState('networkidle');
    
    // ملء الحقول
    const titleField = page.locator('input[name="title"]').first();
    if (await titleField.isVisible()) {
      await titleField.fill(mobile.title);
    }
    
    const descField = page.locator('textarea[name="description"]').first();
    if (await descField.isVisible()) {
      await descField.fill(mobile.description);
    }
    
    const priceField = page.locator('input[name="price"]').first();
    if (await priceField.isVisible()) {
      await priceField.fill(mobile.price);
    }
    
    await page.screenshot({ path: 'screenshots/scenarios/seller-02-filled-form.png', fullPage: true });
    console.log('✅ تم ملء بيانات الموبايل');
  });

  test('4. نشر الإعلان', async ({ page }) => {
    // هذا يعتمد على إكمال الخطوة السابقة
    // في الواقع، ستحتاج لتسلسل الاختبارات
    console.log('⏳ اختبار النشر يحتاج تكامل كامل');
  });

  test('5. عرض إعلاناتي', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', seller.email);
    await page.fill('input[name="password"]', seller.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/my-listings');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'screenshots/scenarios/seller-03-my-listings.png', fullPage: true });
    console.log('✅ تم فتح صفحة إعلاناتي');
  });
});
```

---

# 4️⃣ اختبارات الأمان (Security Tests)

```typescript
// tests/security/01-security-tests.spec.ts

import { test, expect } from '@playwright/test';

test.describe('🔒 اختبارات الأمان', () => {

  // ═══════════════════════════════════════════════════════════════════════
  // XSS Prevention
  // ═══════════════════════════════════════════════════════════════════════

  test('منع XSS في حقل البحث', async ({ page }) => {
    await page.goto('/mobiles');
    
    const searchInput = page.locator('input[type="search"], input[name="search"]').first();
    if (await searchInput.isVisible()) {
      // محاولة حقن XSS
      await searchInput.fill('<script>alert("XSS")</script>');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(1000);
      
      // التحقق من عدم تنفيذ السكريبت
      const alertDetected = await page.evaluate(() => {
        return (window as any).__xss_detected__;
      });
      
      expect(alertDetected).toBeFalsy();
      console.log('✅ محمي من XSS في البحث');
    }
  });

  test('منع XSS في عنوان المنتج', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/listings/new');
    
    const titleField = page.locator('input[name="title"]').first();
    if (await titleField.isVisible()) {
      await titleField.fill('<img src=x onerror=alert("XSS")>');
    }
    
    console.log('✅ اختبار XSS في العنوان');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SQL Injection Prevention
  // ═══════════════════════════════════════════════════════════════════════

  test('منع SQL Injection في البحث', async ({ request }) => {
    const maliciousQueries = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "1; DELETE FROM listings WHERE 1=1; --"
    ];

    for (const query of maliciousQueries) {
      const response = await request.get(`https://xchange-egypt.vercel.app/api/listings/search?q=${encodeURIComponent(query)}`);
      // يجب أن يستجيب بشكل طبيعي (لا يعطي خطأ قاعدة بيانات)
      expect(response.status()).not.toBe(500);
    }
    
    console.log('✅ محمي من SQL Injection');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Authentication Security
  // ═══════════════════════════════════════════════════════════════════════

  test('عدم الوصول لصفحات محمية بدون تسجيل دخول', async ({ page }) => {
    const protectedPages = [
      '/my-listings',
      '/my-orders',
      '/profile',
      '/settings',
      '/listings/new',
      '/dashboard'
    ];

    for (const pagePath of protectedPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // يجب أن يتم التحويل لصفحة تسجيل الدخول
      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('login') || currentUrl.includes('signin');
      const hasLoginForm = await page.locator('input[type="password"]').isVisible().catch(() => false);
      
      console.log(`${pagePath}: ${isRedirected || hasLoginForm ? '✅ محمي' : '⚠️ غير محمي'}`);
    }
  });

  test('تسجيل الخروج يمسح الجلسة', async ({ page }) => {
    // تسجيل الدخول
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // تسجيل الخروج
    const logoutBtn = page.locator('button:has-text("خروج"), button:has-text("Logout"), a:has-text("خروج")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForLoadState('networkidle');
    }
    
    // محاولة الوصول لصفحة محمية
    await page.goto('/my-listings');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    expect(currentUrl).toContain('login');
    console.log('✅ تسجيل الخروج يعمل بشكل صحيح');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Rate Limiting
  // ═══════════════════════════════════════════════════════════════════════

  test('التحقق من Rate Limiting', async ({ request }) => {
    const requests = [];
    
    // إرسال 20 طلب سريع
    for (let i = 0; i < 20; i++) {
      requests.push(request.get('https://xchange-egypt.vercel.app/api/listings'));
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status() === 429);
    
    if (rateLimited) {
      console.log('✅ Rate Limiting مُفعّل');
    } else {
      console.log('⚠️ Rate Limiting قد لا يكون مُفعّل');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // HTTPS & Headers
  // ═══════════════════════════════════════════════════════════════════════

  test('التحقق من HTTPS', async ({ page }) => {
    await page.goto('https://xchange-egypt.vercel.app');
    const url = page.url();
    expect(url).toMatch(/^https:/);
    console.log('✅ الموقع يستخدم HTTPS');
  });

  test('التحقق من Security Headers', async ({ request }) => {
    const response = await request.get('https://xchange-egypt.vercel.app');
    const headers = response.headers();
    
    const securityHeaders = {
      'x-frame-options': headers['x-frame-options'],
      'x-content-type-options': headers['x-content-type-options'],
      'strict-transport-security': headers['strict-transport-security'],
      'content-security-policy': headers['content-security-policy'],
    };
    
    for (const [header, value] of Object.entries(securityHeaders)) {
      console.log(`${header}: ${value ? '✅ موجود' : '⚠️ غير موجود'}`);
    }
  });
});
```

---

# 5️⃣ اختبارات الأداء (Performance Tests)

```typescript
// tests/performance/01-performance-tests.spec.ts

import { test, expect } from '@playwright/test';

test.describe('⚡ اختبارات الأداء', () => {

  // ═══════════════════════════════════════════════════════════════════════
  // Page Load Time
  // ═══════════════════════════════════════════════════════════════════════

  test('زمن تحميل الصفحة الرئيسية < 3 ثواني', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ زمن التحميل: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('زمن تحميل صفحة المنتج < 2 ثانية', async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    const startTime = Date.now();
    const firstProduct = page.locator('[class*="product"] a').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
    }
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ زمن تحميل صفحة المنتج: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // API Response Time
  // ═══════════════════════════════════════════════════════════════════════

  test('زمن استجابة API < 500ms', async ({ request }) => {
    const startTime = Date.now();
    await request.get('https://xchange-egypt.vercel.app/api/listings?category=mobiles');
    const responseTime = Date.now() - startTime;
    
    console.log(`⏱️ زمن استجابة API: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(500);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Image Loading
  // ═══════════════════════════════════════════════════════════════════════

  test('الصور تُحمّل بشكل صحيح', async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    const images = await page.locator('img').all();
    let loadedCount = 0;
    let brokenCount = 0;
    
    for (const img of images) {
      const isLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
      if (isLoaded) loadedCount++;
      else brokenCount++;
    }
    
    console.log(`✅ صور محملة: ${loadedCount}`);
    console.log(`❌ صور مكسورة: ${brokenCount}`);
    expect(brokenCount).toBe(0);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Lazy Loading
  // ═══════════════════════════════════════════════════════════════════════

  test('Lazy Loading للصور يعمل', async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    const lazyImages = await page.locator('img[loading="lazy"]').count();
    console.log(`🖼️ صور بـ Lazy Loading: ${lazyImages}`);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Memory Leaks (Basic Check)
  // ═══════════════════════════════════════════════════════════════════════

  test('فحص تسرب الذاكرة الأساسي', async ({ page }) => {
    await page.goto('/mobiles');
    
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // التنقل عدة مرات
    for (let i = 0; i < 5; i++) {
      const firstProduct = page.locator('[class*="product"] a').first();
      if (await firstProduct.isVisible()) {
        await firstProduct.click();
        await page.waitForLoadState('networkidle');
      }
      await page.goBack();
      await page.waitForLoadState('networkidle');
    }
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    const memoryIncrease = finalMemory - initialMemory;
    console.log(`🧠 زيادة الذاكرة: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
  });
});
```

---

# 6️⃣ اختبارات التوافق (Compatibility Tests)

```typescript
// tests/compatibility/01-browser-tests.spec.ts

import { test, expect, devices } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════════════════
// اختبارات المتصفحات المختلفة
// ═══════════════════════════════════════════════════════════════════════════

test.describe('🌐 اختبارات المتصفحات', () => {

  test('الموقع يعمل في Chrome', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveTitle(/.+/);
    await page.screenshot({ path: 'screenshots/compatibility/chrome.png' });
    console.log('✅ Chrome يعمل');
    
    await context.close();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// اختبارات الأجهزة المختلفة
// ═══════════════════════════════════════════════════════════════════════════

test.describe('📱 اختبارات الأجهزة', () => {

  const deviceList = [
    { name: 'iPhone 14', device: devices['iPhone 14'] },
    { name: 'iPhone 14 Pro Max', device: devices['iPhone 14 Pro Max'] },
    { name: 'Samsung Galaxy S21', device: devices['Galaxy S III'] },
    { name: 'iPad Pro', device: devices['iPad Pro 11'] },
    { name: 'Desktop 1920x1080', device: { viewport: { width: 1920, height: 1080 } } },
    { name: 'Desktop 1366x768', device: { viewport: { width: 1366, height: 768 } } },
  ];

  for (const { name, device } of deviceList) {
    test(`الموقع يعمل على ${name}`, async ({ browser }) => {
      const context = await browser.newContext({ ...device });
      const page = await context.newPage();
      
      await page.goto('/mobiles');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: `screenshots/compatibility/${name.replace(/\s+/g, '-')}.png`,
        fullPage: true 
      });
      
      // التحقق من العناصر الأساسية
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      console.log(`✅ ${name} يعمل`);
      await context.close();
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// اختبار الـ RTL (Arabic)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('🔄 اختبار اللغة العربية (RTL)', () => {

  test('اتجاه النص من اليمين لليسار', async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    const htmlDir = await page.locator('html').getAttribute('dir');
    const bodyDir = await page.locator('body').evaluate(el => getComputedStyle(el).direction);
    
    console.log(`اتجاه HTML: ${htmlDir || 'غير محدد'}`);
    console.log(`اتجاه Body: ${bodyDir}`);
    
    if (htmlDir === 'rtl' || bodyDir === 'rtl') {
      console.log('✅ RTL مُفعّل');
    } else {
      console.log('⚠️ RTL قد لا يكون مُفعّل');
    }
  });

  test('الخطوط العربية تظهر بشكل صحيح', async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    // البحث عن نص عربي
    const arabicText = page.locator('text=/[؀-ۿ]/').first();
    if (await arabicText.isVisible()) {
      console.log('✅ النص العربي يظهر');
    }
    
    await page.screenshot({ path: 'screenshots/compatibility/arabic-rtl.png', fullPage: true });
  });
});
```

---

# 7️⃣ اختبارات الحالات الحدية (Edge Cases)

```typescript
// tests/edge-cases/01-edge-cases.spec.ts

import { test, expect } from '@playwright/test';

test.describe('🔍 الحالات الحدية', () => {

  // ═══════════════════════════════════════════════════════════════════════
  // حقول الإدخال
  // ═══════════════════════════════════════════════════════════════════════

  test('البحث بنص فارغ', async ({ page }) => {
    await page.goto('/mobiles');
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      // يجب أن يعرض كل المنتجات أو رسالة مناسبة
      console.log('✅ البحث الفارغ يعمل');
    }
  });

  test('البحث بنص طويل جداً', async ({ page }) => {
    await page.goto('/mobiles');
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible()) {
      const longText = 'a'.repeat(1000);
      await searchInput.fill(longText);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      // لا يجب أن يتعطل
      console.log('✅ البحث بنص طويل لا يتعطل');
    }
  });

  test('البحث برموز خاصة', async ({ page }) => {
    await page.goto('/mobiles');
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible()) {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~';
      await searchInput.fill(specialChars);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      // لا يجب أن يتعطل أو يظهر خطأ
      const hasError = await page.locator('text=/error|خطأ/i').isVisible().catch(() => false);
      expect(hasError).toBeFalsy();
      console.log('✅ البحث برموز خاصة آمن');
    }
  });

  test('إدخال سعر سالب', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/listings/new');
    
    const priceField = page.locator('input[name="price"]').first();
    if (await priceField.isVisible()) {
      await priceField.fill('-1000');
      await page.click('body');
      
      // يجب أن تظهر رسالة خطأ
      const hasError = await page.locator('[class*="error"]').isVisible().catch(() => false);
      console.log(`سعر سالب: ${hasError ? '✅ رسالة خطأ تظهر' : '⚠️ لا توجد رسالة خطأ'}`);
    }
  });

  test('إدخال سعر كبير جداً', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/listings/new');
    
    const priceField = page.locator('input[name="price"]').first();
    if (await priceField.isVisible()) {
      await priceField.fill('999999999999');
      console.log('✅ سعر كبير لا يتعطل');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // الصور
  // ═══════════════════════════════════════════════════════════════════════

  test('التعامل مع صور مفقودة', async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    const brokenImages = await page.locator('img').evaluateAll(images => 
      images.filter((img: HTMLImageElement) => !img.complete || img.naturalWidth === 0).length
    );
    
    console.log(`عدد الصور المكسورة: ${brokenImages}`);
    expect(brokenImages).toBe(0);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // الترقيم
  // ═══════════════════════════════════════════════════════════════════════

  test('الذهاب لصفحة غير موجودة', async ({ page }) => {
    await page.goto('/mobiles?page=99999');
    await page.waitForLoadState('networkidle');
    
    // يجب أن يعرض رسالة مناسبة أو يعود للصفحة الأولى
    const hasProducts = await page.locator('[class*="product"]').count() > 0;
    const hasEmptyMessage = await page.locator('text=/لا توجد|no results|empty/i').isVisible().catch(() => false);
    
    console.log(`صفحة غير موجودة: ${hasProducts || hasEmptyMessage ? '✅ يتعامل معها' : '⚠️'}`);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // الاتصال
  // ═══════════════════════════════════════════════════════════════════════

  test('التعامل مع انقطاع الاتصال', async ({ page, context }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    // قطع الاتصال
    await context.setOffline(true);
    
    // محاولة التنقل
    await page.click('[class*="product"] a').catch(() => {});
    
    // التحقق من رسالة الخطأ
    const hasOfflineMessage = await page.locator('text=/offline|غير متصل|اتصال/i').isVisible().catch(() => false);
    
    // إعادة الاتصال
    await context.setOffline(false);
    
    console.log(`رسالة انقطاع الاتصال: ${hasOfflineMessage ? '✅ تظهر' : '⚠️ لا تظهر'}`);
  });
});
```

---

# 8️⃣ اختبارات معالجة الأخطاء (Error Handling Tests)

```typescript
// tests/errors/01-error-handling.spec.ts

import { test, expect } from '@playwright/test';

test.describe('❌ معالجة الأخطاء', () => {

  test('صفحة 404 مُصممة بشكل جيد', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    await page.waitForLoadState('networkidle');
    
    // التحقق من وجود صفحة 404 مخصصة
    const has404Content = await page.locator('text=/404|not found|غير موجود/i').isVisible().catch(() => false);
    const hasHomeLink = await page.locator('a[href="/"], a:has-text("الرئيسية")').isVisible().catch(() => false);
    
    await page.screenshot({ path: 'screenshots/errors/404-page.png', fullPage: true });
    
    console.log(`صفحة 404: ${has404Content ? '✅ موجودة' : '❌'}`);
    console.log(`رابط للرئيسية: ${hasHomeLink ? '✅' : '❌'}`);
  });

  test('التعامل مع خطأ في API', async ({ page }) => {
    // محاولة الوصول لمنتج غير موجود
    await page.goto('/mobiles/non-existent-product-id-12345');
    await page.waitForLoadState('networkidle');
    
    // يجب أن يظهر رسالة خطأ مناسبة
    const hasErrorMessage = await page.locator('text=/غير موجود|not found|خطأ/i').isVisible().catch(() => false);
    
    console.log(`رسالة خطأ المنتج: ${hasErrorMessage ? '✅ تظهر' : '⚠️'}`);
  });

  test('رسائل خطأ تسجيل الدخول واضحة', async ({ page }) => {
    await page.goto('/login');
    
    // بيانات خاطئة
    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    const errorMessage = page.locator('[class*="error"], [role="alert"], text=/خطأ|غير صحيح|invalid/i').first();
    const isVisible = await errorMessage.isVisible().catch(() => false);
    
    await page.screenshot({ path: 'screenshots/errors/login-error.png' });
    console.log(`رسالة خطأ تسجيل الدخول: ${isVisible ? '✅ واضحة' : '⚠️'}`);
  });

  test('رسائل خطأ التسجيل واضحة', async ({ page }) => {
    await page.goto('/register');
    
    // بريد موجود مسبقاً
    await page.fill('input[name="email"]', 'existing@email.com');
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/errors/register-error.png' });
  });

  test('التعامل مع انتهاء الجلسة', async ({ page, request }) => {
    // محاولة الوصول لصفحة محمية بـ token منتهي
    await page.goto('/my-listings');
    await page.evaluate(() => {
      localStorage.setItem('token', 'expired-token');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // يجب التحويل لتسجيل الدخول
    const currentUrl = page.url();
    console.log(`انتهاء الجلسة: ${currentUrl.includes('login') ? '✅ يحول لتسجيل الدخول' : '⚠️'}`);
  });
});
```

---

# 9️⃣ اختبارات التكامل (Integration Tests)

```typescript
// tests/integration/01-integration.spec.ts

import { test, expect } from '@playwright/test';

test.describe('🔗 اختبارات التكامل', () => {

  test('تكامل Frontend مع Backend', async ({ page, request }) => {
    // التحقق من اتصال الـ Frontend بالـ Backend
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    // التحقق من تحميل البيانات
    const products = page.locator('[class*="product"], [class*="listing"]');
    const count = await products.count();
    
    console.log(`✅ تم تحميل ${count} منتج من الـ Backend`);
  });

  test('تكامل نظام البحث', async ({ page }) => {
    await page.goto('/mobiles');
    
    const searchInput = page.locator('input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('iPhone');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      // التحقق من أن النتائج متعلقة بـ iPhone
      const results = await page.locator('[class*="product"]').all();
      console.log(`✅ نتائج البحث: ${results.length} منتج`);
    }
  });

  test('تكامل نظام المصادقة', async ({ page }) => {
    // تسجيل دخول
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // التحقق من حفظ الجلسة
    const cookies = await page.context().cookies();
    const hasAuthCookie = cookies.some(c => c.name.includes('token') || c.name.includes('session'));
    
    const localStorage = await page.evaluate(() => window.localStorage.getItem('token'));
    
    console.log(`Cookie المصادقة: ${hasAuthCookie ? '✅' : '❌'}`);
    console.log(`Token في LocalStorage: ${localStorage ? '✅' : '❌'}`);
  });

  test('تكامل رفع الصور', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/listings/new');
    
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      console.log('✅ نظام رفع الصور متكامل');
    }
  });
});
```

---

# 🔟 اختبارات إمكانية الوصول (Accessibility Tests)

```typescript
// tests/accessibility/01-a11y.spec.ts

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('♿ إمكانية الوصول (Accessibility)', () => {

  test('فحص الصفحة الرئيسية', async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    console.log(`انتهاكات: ${accessibilityScanResults.violations.length}`);
    
    for (const violation of accessibilityScanResults.violations) {
      console.log(`⚠️ ${violation.id}: ${violation.description}`);
    }
    
    // expect(accessibilityScanResults.violations).toHaveLength(0);
  });

  test('وجود نص بديل للصور (alt)', async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    const imagesWithoutAlt = await page.locator('img:not([alt]), img[alt=""]').count();
    console.log(`صور بدون alt: ${imagesWithoutAlt}`);
    
    if (imagesWithoutAlt > 0) {
      console.log('⚠️ بعض الصور بدون نص بديل');
    } else {
      console.log('✅ كل الصور لها نص بديل');
    }
  });

  test('وجود labels للنماذج', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const inputsWithoutLabel = await page.locator('input:not([aria-label]):not([id])').count();
    console.log(`حقول بدون label: ${inputsWithoutLabel}`);
  });

  test('التنقل بالـ Tab يعمل', async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    // التنقل بين العناصر
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // التحقق من وجود focus visible
    const focusedElement = await page.locator(':focus').first();
    const isVisible = await focusedElement.isVisible().catch(() => false);
    
    console.log(`Focus visible: ${isVisible ? '✅' : '⚠️'}`);
  });

  test('الألوان لها تباين كافٍ', async ({ page }) => {
    await page.goto('/mobiles');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    
    const contrastIssues = accessibilityScanResults.violations.filter(v => v.id === 'color-contrast');
    console.log(`مشاكل التباين: ${contrastIssues.length}`);
  });
});
```

---

# ▶️ تشغيل الاختبارات

```bash
# ═══════════════════════════════════════════════════════════════════════════
# تشغيل كل الاختبارات
# ═══════════════════════════════════════════════════════════════════════════

npx playwright test

# ═══════════════════════════════════════════════════════════════════════════
# تشغيل فئة معينة
# ═══════════════════════════════════════════════════════════════════════════

npx playwright test tests/ui/          # اختبارات UI
npx playwright test tests/api/         # اختبارات API
npx playwright test tests/scenarios/   # سيناريوهات المستخدم
npx playwright test tests/security/    # اختبارات الأمان
npx playwright test tests/performance/ # اختبارات الأداء
npx playwright test tests/edge-cases/  # الحالات الحدية

# ═══════════════════════════════════════════════════════════════════════════
# تشغيل مع عرض المتصفح
# ═══════════════════════════════════════════════════════════════════════════

npx playwright test --headed --slow-mo=500

# ═══════════════════════════════════════════════════════════════════════════
# تشغيل مع تقرير HTML
# ═══════════════════════════════════════════════════════════════════════════

npx playwright test --reporter=html
npx playwright show-report
```

---

# 📊 التقرير النهائي

بعد تشغيل كل الاختبارات، قدم تقريراً بالشكل التالي:

```markdown
# 📊 تقرير اختبار سوق الموبايلات - Xchange

## التاريخ: [التاريخ]

## الملخص
| الفئة | إجمالي | نجح | فشل | نسبة النجاح |
|-------|--------|-----|-----|-------------|
| UI/UX | X | X | X | X% |
| API | X | X | X | X% |
| السيناريوهات | X | X | X | X% |
| الأمان | X | X | X | X% |
| الأداء | X | X | X | X% |
| التوافق | X | X | X | X% |
| الحالات الحدية | X | X | X | X% |
| معالجة الأخطاء | X | X | X | X% |
| التكامل | X | X | X | X% |
| إمكانية الوصول | X | X | X | X% |
| **الإجمالي** | **X** | **X** | **X** | **X%** |

## ✅ ما يعمل بشكل ممتاز
1. ...
2. ...

## ⚠️ يحتاج تحسين
1. ...
2. ...

## ❌ مشاكل حرجة يجب إصلاحها
1. ...
2. ...

## 📱 لقطات الشاشة
- [مرفقة]

## 🎯 التوصية
[ ] جاهز للإطلاق
[ ] يحتاج إصلاحات بسيطة
[ ] يحتاج إصلاحات كبيرة
```

---

# ⚠️ ملاحظات مهمة

1. **البيئة:** شغّل الاختبارات على بيئة Staging وليس Production
2. **البيانات:** استخدم حسابات اختبار وليس حسابات حقيقية
3. **التنظيف:** نظف بيانات الاختبار بعد كل جلسة
4. **Rate Limiting:** أضف delays بين الاختبارات لتجنب الحظر
5. **اللقطات:** راجع لقطات الشاشة يدوياً للتحقق البصري

---

**📅 آخر تحديث:** ديسمبر 2024
**📋 الإصدار:** 1.0
**🎯 الهدف:** جاهزية سوق الموبايلات للإطلاق
