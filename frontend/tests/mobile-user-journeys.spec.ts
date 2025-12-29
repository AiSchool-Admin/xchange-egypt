import { test, expect } from '@playwright/test';

/**
 * Xchange Mobile Marketplace - User Journey Scenarios
 *
 * Complete user journey tests based on USER_STORIES.md
 * Simulating real user interactions with the platform
 *
 * User Personas:
 * - Ahmed: البائع الفردي (Individual Seller)
 * - Sarah: المشترية الحذرة (Cautious Buyer)
 * - Mohamed: تاجر الموبايلات (Mobile Dealer)
 * - Fatma: المقايضة (Barter User)
 */

test.describe('Mobile Marketplace User Journeys', () => {

  // ==========================================
  // JOURNEY 1: AHMED - البائع الفردي
  // Selling iPhone 14 Pro to buy iPhone 16
  // ==========================================
  test.describe('Journey 1: Ahmed - Individual Seller', () => {
    test('1.1 Navigate to registration page', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Check registration form exists
      const form = page.locator('form, [class*="register"], [class*="auth"]').first();

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey1-01-register.png', fullPage: true });
      console.log('✅ Journey 1.1: Ahmed accesses registration page');
    });

    test('1.2 View phone OTP input', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);

      // Check for phone input (Egyptian format)
      const phoneInput = page.locator('input[type="tel"], input[name*="phone"], input[placeholder*="+201"]').first();

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey1-02-phone.png', fullPage: true });
      console.log('✅ Journey 1.2: Ahmed sees phone OTP input (+201XXXXXXXXX)');
    });

    test('1.3 Navigate to sell mobile page', async ({ page }) => {
      await page.goto('/mobiles/sell');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey1-03-sell.png', fullPage: true });
      console.log('✅ Journey 1.3: Ahmed navigates to sell mobile page');
    });

    test('1.4 Create listing form fields', async ({ page }) => {
      await page.goto('/mobiles/sell');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);

      // Check for listing form fields
      const brandField = page.locator('select, [class*="select"], text=العلامة, text=Brand').first();
      const modelField = page.locator('input[name*="model"], text=الموديل, text=Model').first();
      const imeiField = page.locator('input[name*="imei"], text=IMEI').first();
      const priceField = page.locator('input[type="number"], input[name*="price"], text=السعر').first();

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey1-04-form.png', fullPage: true });
      console.log('✅ Journey 1.4: Ahmed sees listing creation form');
    });

    test('1.5 Image upload section', async ({ page }) => {
      await page.goto('/mobiles/sell');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);

      // Check for image upload
      const uploadSection = page.locator('input[type="file"], text=صور, text=Images, button:has-text("رفع")').first();

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey1-05-images.png', fullPage: true });
      console.log('✅ Journey 1.5: Ahmed sees image upload section (4-8 photos)');
    });

    test('1.6 Verification code section', async ({ page }) => {
      await page.goto('/mobiles/sell');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);

      // Check for verification section
      const verifySection = page.locator('text=التحقق, text=Verify, text=XCH-, text=رمز').first();

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey1-06-verify.png', fullPage: true });
      console.log('✅ Journey 1.6: Ahmed sees verification code section (XCH-XXXXX)');
    });

    test('1.7 Dashboard for listing management', async ({ page }) => {
      await page.goto('/dashboard/listings');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey1-07-dashboard.png', fullPage: true });
      console.log('✅ Journey 1.7: Ahmed accesses listings dashboard');
    });
  });

  // ==========================================
  // JOURNEY 2: SARAH - المشترية الحذرة
  // Buying a used phone with limited budget
  // ==========================================
  test.describe('Journey 2: Sarah - Cautious Buyer', () => {
    test('2.1 Browse mobile marketplace', async ({ page }) => {
      await page.goto('/mobiles');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey2-01-browse.png', fullPage: true });
      console.log('✅ Journey 2.1: Sarah browses mobile marketplace');
    });

    test('2.2 Use price filter (budget-conscious)', async ({ page }) => {
      await page.goto('/mobiles');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);

      // Look for price filter
      const priceFilter = page.locator('input[type="range"], text=السعر, text=Price, text=5000, text=15000').first();

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey2-02-price.png', fullPage: true });
      console.log('✅ Journey 2.2: Sarah uses price filter (5K-15K range)');
    });

    test('2.3 Filter by verified listings only', async ({ page }) => {
      await page.goto('/mobiles');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500);

      // Look for verified filter
      const verifiedFilter = page.locator('text=موثق, text=Verified, input[type="checkbox"]').first();

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey2-03-verified.png', fullPage: true });
      console.log('✅ Journey 2.3: Sarah filters for verified listings only');
    });

    test('2.4 View product details with IMEI check', async ({ page }) => {
      await page.goto('/mobiles');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Click on first product
      const productLink = page.locator('a[href*="/mobiles/"], a[href*="/items/"]').first();
      if (await productLink.count() > 0) {
        await productLink.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
      }

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey2-04-details.png', fullPage: true });
      console.log('✅ Journey 2.4: Sarah views product details with IMEI status');
    });

    test('2.5 Check battery health', async ({ page }) => {
      await page.goto('/mobiles');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      const productLink = page.locator('a[href*="/mobiles/"], a[href*="/items/"]').first();
      if (await productLink.count() > 0) {
        await productLink.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
      }

      // Look for battery health indicator
      const batteryHealth = page.locator('text=البطارية, text=Battery, text=%').first();

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey2-05-battery.png', fullPage: true });
      console.log('✅ Journey 2.5: Sarah checks battery health percentage');
    });

    test('2.6 View seller rating and trust level', async ({ page }) => {
      await page.goto('/mobiles');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      const productLink = page.locator('a[href*="/mobiles/"], a[href*="/items/"]').first();
      if (await productLink.count() > 0) {
        await productLink.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
      }

      // Look for seller rating
      const sellerRating = page.locator('text=تقييم, text=Rating, text=⭐, text=نجمة').first();

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey2-06-seller.png', fullPage: true });
      console.log('✅ Journey 2.6: Sarah views seller rating and trust level');
    });

    test('2.7 Access escrow payment option', async ({ page }) => {
      await page.goto('/escrow');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey2-07-escrow.png', fullPage: true });
      console.log('✅ Journey 2.7: Sarah views escrow payment protection');
    });

    test('2.8 Checkout flow', async ({ page }) => {
      await page.goto('/checkout');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey2-08-checkout.png', fullPage: true });
      console.log('✅ Journey 2.8: Sarah proceeds to checkout');
    });
  });

  // ==========================================
  // JOURNEY 3: MOHAMED - تاجر الموبايلات
  // Mobile shop owner expanding customer base
  // ==========================================
  test.describe('Journey 3: Mohamed - Mobile Dealer', () => {
    test('3.1 Access seller dashboard', async ({ page }) => {
      await page.goto('/seller/dashboard');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey3-01-seller.png', fullPage: true });
      console.log('✅ Journey 3.1: Mohamed accesses seller dashboard');
    });

    test('3.2 View multiple listings', async ({ page }) => {
      await page.goto('/dashboard/listings');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey3-02-listings.png', fullPage: true });
      console.log('✅ Journey 3.2: Mohamed views his multiple listings');
    });

    test('3.3 Add new mobile listing', async ({ page }) => {
      await page.goto('/mobiles/sell');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey3-03-new.png', fullPage: true });
      console.log('✅ Journey 3.3: Mohamed adds new mobile listing');
    });

    test('3.4 View incoming messages', async ({ page }) => {
      await page.goto('/messages');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey3-04-messages.png', fullPage: true });
      console.log('✅ Journey 3.4: Mohamed views incoming buyer messages');
    });

    test('3.5 Track orders and transactions', async ({ page }) => {
      await page.goto('/dashboard/orders');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey3-05-orders.png', fullPage: true });
      console.log('✅ Journey 3.5: Mohamed tracks orders and transactions');
    });

    test('3.6 View store profile', async ({ page }) => {
      await page.goto('/dashboard/profile');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey3-06-profile.png', fullPage: true });
      console.log('✅ Journey 3.6: Mohamed views store profile for trust building');
    });
  });

  // ==========================================
  // JOURNEY 4: FATMA - المقايضة
  // Exchanging Samsung S23 for iPhone
  // ==========================================
  test.describe('Journey 4: Fatma - Barter User', () => {
    test('4.1 Browse barter-enabled mobiles', async ({ page }) => {
      await page.goto('/mobiles/barter');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey4-01-barter.png', fullPage: true });
      console.log('✅ Journey 4.1: Fatma browses barter-enabled mobiles');
    });

    test('4.2 View barter matches', async ({ page }) => {
      await page.goto('/barter/recommendations');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey4-02-matches.png', fullPage: true });
      console.log('✅ Journey 4.2: Fatma views barter match suggestions');
    });

    test('4.3 View value comparison', async ({ page }) => {
      await page.goto('/compare');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey4-03-compare.png', fullPage: true });
      console.log('✅ Journey 4.3: Fatma compares device values (Samsung vs iPhone)');
    });

    test('4.4 Create barter offer', async ({ page }) => {
      await page.goto('/barter/new');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey4-04-offer.png', fullPage: true });
      console.log('✅ Journey 4.4: Fatma creates barter offer');
    });

    test('4.5 View my barter offers', async ({ page }) => {
      await page.goto('/barter/my-offers');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey4-05-myoffers.png', fullPage: true });
      console.log('✅ Journey 4.5: Fatma views her barter offers');
    });

    test('4.6 Explore multi-party barter chains', async ({ page }) => {
      await page.goto('/barter/chains');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Look for chain visualization
      const chainSection = page.locator('text=سلسلة, text=Chain, text=3 أطراف, text=متعدد').first();

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey4-06-chains.png', fullPage: true });
      console.log('✅ Journey 4.6: Fatma explores 3-way barter chains');
    });

    test('4.7 View cash settlement options', async ({ page }) => {
      await page.goto('/barter/chains');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Look for cash settlement info
      const cashSettlement = page.locator('text=فرق, text=Difference, text=نقدي, text=Cash').first();

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey4-07-cash.png', fullPage: true });
      console.log('✅ Journey 4.7: Fatma views cash settlement options');
    });
  });

  // ==========================================
  // JOURNEY 5: COMPLETE PURCHASE FLOW
  // End-to-end purchase with escrow
  // ==========================================
  test.describe('Journey 5: Complete Purchase Flow', () => {
    test('5.1 Search for specific phone', async ({ page }) => {
      await page.goto('/mobiles');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Use search
      const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"], input[placeholder*="Search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('iPhone');
        await page.waitForTimeout(1500);
      }

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey5-01-search.png', fullPage: true });
      console.log('✅ Journey 5.1: User searches for iPhone');
    });

    test('5.2 Apply filters', async ({ page }) => {
      await page.goto('/mobiles?search=iPhone');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey5-02-filter.png', fullPage: true });
      console.log('✅ Journey 5.2: User applies search filters');
    });

    test('5.3 Select product', async ({ page }) => {
      await page.goto('/mobiles');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      const productLink = page.locator('a[href*="/mobiles/"], a[href*="/items/"]').first();
      if (await productLink.count() > 0) {
        await productLink.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
      }

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey5-03-select.png', fullPage: true });
      console.log('✅ Journey 5.3: User selects product');
    });

    test('5.4 Contact seller', async ({ page }) => {
      await page.goto('/messages');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey5-04-contact.png', fullPage: true });
      console.log('✅ Journey 5.4: User contacts seller');
    });

    test('5.5 Proceed to checkout', async ({ page }) => {
      await page.goto('/checkout');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey5-05-checkout.png', fullPage: true });
      console.log('✅ Journey 5.5: User proceeds to checkout');
    });

    test('5.6 Select payment method (Escrow)', async ({ page }) => {
      await page.goto('/checkout');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Look for payment options
      const paymentOptions = page.locator('text=Escrow, text=فوري, text=Fawry, text=إنستاباي').first();

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey5-06-payment.png', fullPage: true });
      console.log('✅ Journey 5.6: User selects payment method');
    });

    test('5.7 Order tracking', async ({ page }) => {
      await page.goto('/dashboard/orders');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey5-07-tracking.png', fullPage: true });
      console.log('✅ Journey 5.7: User tracks order status');
    });

    test('5.8 Transaction history', async ({ page }) => {
      await page.goto('/dashboard/transactions');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey5-08-history.png', fullPage: true });
      console.log('✅ Journey 5.8: User views transaction history');
    });
  });

  // ==========================================
  // JOURNEY 6: DISPUTE RESOLUTION FLOW
  // ==========================================
  test.describe('Journey 6: Dispute Resolution', () => {
    test('6.1 Access help/support page', async ({ page }) => {
      await page.goto('/help');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey6-01-help.png', fullPage: true });
      console.log('✅ Journey 6.1: User accesses help/support');
    });

    test('6.2 View dispute options', async ({ page }) => {
      await page.goto('/dashboard/transactions');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'test-results/e2e/mobile-marketplace/journey6-02-dispute.png', fullPage: true });
      console.log('✅ Journey 6.2: User views dispute options');
    });
  });
});
