import { test, expect } from '@playwright/test';

// Comprehensive E2E Tests for Xchange Egypt Platform
test.describe('Xchange Egypt - Comprehensive E2E Tests', () => {

  // ==========================================
  // 1. HOMEPAGE & NAVIGATION
  // ==========================================
  test.describe('1. Homepage & Navigation', () => {
    test('1.1 Homepage loads correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/01-homepage.png', fullPage: true });

      // Check main elements
      await expect(page).toHaveTitle(/.*[Xx]change.*/i);
      console.log('✅ Homepage loaded successfully');
    });

    test('1.2 Main navigation works', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const navLinks = page.locator('nav a, header a');
      const count = await navLinks.count();
      console.log(`✅ Found ${count} navigation links`);

      await page.screenshot({ path: 'test-results/e2e/02-navigation.png', fullPage: true });
    });
  });

  // ==========================================
  // 2. MARKETS - MOBILES
  // ==========================================
  test.describe('2. Mobiles Market', () => {
    test('2.1 Mobiles listing page', async ({ page }) => {
      await page.goto('/mobiles');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/03-mobiles-listing.png', fullPage: true });
      console.log('✅ Mobiles listing page loaded');
    });

    test('2.2 Mobiles sell page', async ({ page }) => {
      await page.goto('/mobiles/sell');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/04-mobiles-sell.png', fullPage: true });
      console.log('✅ Mobiles sell page loaded');
    });

    test('2.3 Mobiles barter page', async ({ page }) => {
      await page.goto('/mobiles/barter');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/05-mobiles-barter.png', fullPage: true });
      console.log('✅ Mobiles barter page loaded');
    });
  });

  // ==========================================
  // 3. MARKETS - CARS
  // ==========================================
  test.describe('3. Cars Market', () => {
    test('3.1 Cars listing page', async ({ page }) => {
      await page.goto('/cars');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/06-cars-listing.png', fullPage: true });
      console.log('✅ Cars listing page loaded');
    });

    test('3.2 Cars sell page', async ({ page }) => {
      await page.goto('/cars/sell');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/07-cars-sell.png', fullPage: true });
      console.log('✅ Cars sell page loaded');
    });

    test('3.3 Cars barter page', async ({ page }) => {
      await page.goto('/cars/barter');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/08-cars-barter.png', fullPage: true });
      console.log('✅ Cars barter page loaded');
    });

    test('3.4 Cars calculator page', async ({ page }) => {
      await page.goto('/cars/calculator');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/09-cars-calculator.png', fullPage: true });
      console.log('✅ Cars calculator page loaded');
    });
  });

  // ==========================================
  // 4. MARKETS - PROPERTIES
  // ==========================================
  test.describe('4. Properties Market', () => {
    test('4.1 Properties listing page', async ({ page }) => {
      await page.goto('/properties');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/10-properties-listing.png', fullPage: true });
      console.log('✅ Properties listing page loaded');
    });

    test('4.2 Properties create page', async ({ page }) => {
      await page.goto('/properties/create');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/11-properties-create.png', fullPage: true });
      console.log('✅ Properties create page loaded');
    });
  });

  // ==========================================
  // 5. MARKETS - GOLD
  // ==========================================
  test.describe('5. Gold Market', () => {
    test('5.1 Gold listing page', async ({ page }) => {
      await page.goto('/gold');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/12-gold-listing.png', fullPage: true });
      console.log('✅ Gold listing page loaded');
    });

    test('5.2 Gold sell page', async ({ page }) => {
      await page.goto('/gold/sell');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/13-gold-sell.png', fullPage: true });
      console.log('✅ Gold sell page loaded');
    });

    test('5.3 Gold calculator page', async ({ page }) => {
      await page.goto('/gold/calculator');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/14-gold-calculator.png', fullPage: true });
      console.log('✅ Gold calculator page loaded');
    });
  });

  // ==========================================
  // 6. MARKETS - LUXURY
  // ==========================================
  test.describe('6. Luxury Market', () => {
    test('6.1 Luxury listing page', async ({ page }) => {
      await page.goto('/luxury');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/15-luxury-listing.png', fullPage: true });
      console.log('✅ Luxury listing page loaded');
    });

    test('6.2 Luxury sell page', async ({ page }) => {
      await page.goto('/luxury/sell');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/16-luxury-sell.png', fullPage: true });
      console.log('✅ Luxury sell page loaded');
    });
  });

  // ==========================================
  // 7. GENERAL ITEMS
  // ==========================================
  test.describe('7. General Items', () => {
    test('7.1 Items listing page', async ({ page }) => {
      await page.goto('/items');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/17-items-listing.png', fullPage: true });
      console.log('✅ Items listing page loaded');
    });

    test('7.2 New item page', async ({ page }) => {
      await page.goto('/items/new');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/18-items-new.png', fullPage: true });
      console.log('✅ New item page loaded');
    });
  });

  // ==========================================
  // 8. BARTER SYSTEM
  // ==========================================
  test.describe('8. Barter System', () => {
    test('8.1 Barter main page', async ({ page }) => {
      await page.goto('/barter');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/19-barter-main.png', fullPage: true });
      console.log('✅ Barter main page loaded');
    });

    test('8.2 Barter new offer page', async ({ page }) => {
      await page.goto('/barter/new');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/20-barter-new.png', fullPage: true });
      console.log('✅ Barter new offer page loaded');
    });

    test('8.3 Barter chains page', async ({ page }) => {
      await page.goto('/barter/chains');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/21-barter-chains.png', fullPage: true });
      console.log('✅ Barter chains page loaded');
    });

    test('8.4 Barter guide page', async ({ page }) => {
      await page.goto('/barter/guide');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/22-barter-guide.png', fullPage: true });
      console.log('✅ Barter guide page loaded');
    });

    test('8.5 Barter recommendations page', async ({ page }) => {
      await page.goto('/barter/recommendations');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/23-barter-recommendations.png', fullPage: true });
      console.log('✅ Barter recommendations page loaded');
    });
  });

  // ==========================================
  // 9. AUCTIONS
  // ==========================================
  test.describe('9. Auctions', () => {
    test('9.1 Auctions listing page', async ({ page }) => {
      await page.goto('/auctions');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/24-auctions-listing.png', fullPage: true });
      console.log('✅ Auctions listing page loaded');
    });

    test('9.2 Live auctions page', async ({ page }) => {
      await page.goto('/auctions/live');
      // Use domcontentloaded instead of networkidle because page has live timers
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000); // Wait for React to render
      await page.screenshot({ path: 'test-results/e2e/25-auctions-live.png', fullPage: true });
      console.log('✅ Live auctions page loaded');
    });

    test('9.3 New auction page', async ({ page }) => {
      await page.goto('/auctions/new');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/26-auctions-new.png', fullPage: true });
      console.log('✅ New auction page loaded');
    });
  });

  // ==========================================
  // 10. AUTHENTICATION
  // ==========================================
  test.describe('10. Authentication', () => {
    test('10.1 Login page', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/27-login.png', fullPage: true });

      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"]');

      expect(await emailInput.count() > 0 || await passwordInput.count() > 0).toBeTruthy();
      console.log('✅ Login page loaded with form fields');
    });

    test('10.2 Register page', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/28-register.png', fullPage: true });
      console.log('✅ Register page loaded');
    });

    test('10.3 Forgot password page', async ({ page }) => {
      await page.goto('/forgot-password');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/29-forgot-password.png', fullPage: true });
      console.log('✅ Forgot password page loaded');
    });
  });

  // ==========================================
  // 11. USER DASHBOARD
  // ==========================================
  test.describe('11. User Dashboard', () => {
    test('11.1 Dashboard main page', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/30-dashboard.png', fullPage: true });
      console.log('✅ Dashboard page loaded');
    });

    test('11.2 Dashboard profile page', async ({ page }) => {
      await page.goto('/dashboard/profile');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/31-dashboard-profile.png', fullPage: true });
      console.log('✅ Dashboard profile page loaded');
    });

    test('11.3 Dashboard orders page', async ({ page }) => {
      await page.goto('/dashboard/orders');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/32-dashboard-orders.png', fullPage: true });
      console.log('✅ Dashboard orders page loaded');
    });

    test('11.4 Dashboard transactions page', async ({ page }) => {
      await page.goto('/dashboard/transactions');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/33-dashboard-transactions.png', fullPage: true });
      console.log('✅ Dashboard transactions page loaded');
    });
  });

  // ==========================================
  // 12. CART & CHECKOUT
  // ==========================================
  test.describe('12. Cart & Checkout', () => {
    test('12.1 Cart page', async ({ page }) => {
      await page.goto('/cart');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/34-cart.png', fullPage: true });
      console.log('✅ Cart page loaded');
    });

    test('12.2 Checkout page', async ({ page }) => {
      await page.goto('/checkout');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/35-checkout.png', fullPage: true });
      console.log('✅ Checkout page loaded');
    });
  });

  // ==========================================
  // 13. MESSAGING
  // ==========================================
  test.describe('13. Messaging', () => {
    test('13.1 Messages page', async ({ page }) => {
      await page.goto('/messages');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/36-messages.png', fullPage: true });
      console.log('✅ Messages page loaded');
    });

    test('13.2 Notifications page', async ({ page }) => {
      await page.goto('/notifications');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/37-notifications.png', fullPage: true });
      console.log('✅ Notifications page loaded');
    });
  });

  // ==========================================
  // 14. ADDITIONAL FEATURES
  // ==========================================
  test.describe('14. Additional Features', () => {
    test('14.1 Deals page', async ({ page }) => {
      await page.goto('/deals');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/38-deals.png', fullPage: true });
      console.log('✅ Deals page loaded');
    });

    test('14.2 Donations page', async ({ page }) => {
      await page.goto('/donations');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/39-donations.png', fullPage: true });
      console.log('✅ Donations page loaded');
    });

    test('14.3 Pools page', async ({ page }) => {
      await page.goto('/pools');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/40-pools.png', fullPage: true });
      console.log('✅ Pools page loaded');
    });

    test('14.4 Escrow page', async ({ page }) => {
      await page.goto('/escrow');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/41-escrow.png', fullPage: true });
      console.log('✅ Escrow page loaded');
    });

    test('14.5 Compare page', async ({ page }) => {
      await page.goto('/compare');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/42-compare.png', fullPage: true });
      console.log('✅ Compare page loaded');
    });

    test('14.6 Map page', async ({ page }) => {
      await page.goto('/map');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/43-map.png', fullPage: true });
      console.log('✅ Map page loaded');
    });

    test('14.7 Pricing page', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/44-pricing.png', fullPage: true });
      console.log('✅ Pricing page loaded');
    });

    test('14.8 Premium page', async ({ page }) => {
      await page.goto('/premium');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/45-premium.png', fullPage: true });
      console.log('✅ Premium page loaded');
    });

    test('14.9 Badges page', async ({ page }) => {
      await page.goto('/badges');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/46-badges.png', fullPage: true });
      console.log('✅ Badges page loaded');
    });

    test('14.10 AI Assistant page', async ({ page }) => {
      await page.goto('/assistant');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/47-assistant.png', fullPage: true });
      console.log('✅ AI Assistant page loaded');
    });
  });

  // ==========================================
  // 15. INVENTORY & MARKETPLACE
  // ==========================================
  test.describe('15. Inventory & Marketplace', () => {
    test('15.1 Inventory page', async ({ page }) => {
      await page.goto('/inventory');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/48-inventory.png', fullPage: true });
      console.log('✅ Inventory page loaded');
    });

    test('15.2 Inventory add page', async ({ page }) => {
      await page.goto('/inventory/add');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/49-inventory-add.png', fullPage: true });
      console.log('✅ Inventory add page loaded');
    });

    test('15.3 Marketplace page', async ({ page }) => {
      await page.goto('/marketplace');
      // Use domcontentloaded for faster load detection
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000); // Wait for React to render
      await page.screenshot({ path: 'test-results/e2e/50-marketplace.png', fullPage: true });
      console.log('✅ Marketplace page loaded');
    });

    test('15.4 Facilitators page', async ({ page }) => {
      await page.goto('/facilitators');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/51-facilitators.png', fullPage: true });
      console.log('✅ Facilitators page loaded');
    });
  });

  // ==========================================
  // 16. SEARCH FUNCTIONALITY
  // ==========================================
  test.describe('16. Search Functionality', () => {
    test('16.1 Search for "موبايل"', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"], input[placeholder*="search"]').first();

      if (await searchInput.count() > 0) {
        await searchInput.click();
        await searchInput.fill('موبايل');
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');
      }

      await page.screenshot({ path: 'test-results/e2e/52-search-mobile.png', fullPage: true });
      console.log('✅ Search for "موبايل" completed');
    });

    test('16.2 Search for "سيارة"', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"], input[placeholder*="search"]').first();

      if (await searchInput.count() > 0) {
        await searchInput.click();
        await searchInput.fill('سيارة');
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');
      }

      await page.screenshot({ path: 'test-results/e2e/53-search-car.png', fullPage: true });
      console.log('✅ Search for "سيارة" completed');
    });

    test('16.3 Search for "شقة"', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"], input[placeholder*="search"]').first();

      if (await searchInput.count() > 0) {
        await searchInput.click();
        await searchInput.fill('شقة');
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');
      }

      await page.screenshot({ path: 'test-results/e2e/54-search-apartment.png', fullPage: true });
      console.log('✅ Search for "شقة" completed');
    });
  });

  // ==========================================
  // 17. ADMIN PANEL
  // ==========================================
  test.describe('17. Admin Panel', () => {
    test('17.1 Admin login page', async ({ page }) => {
      await page.goto('/admin/login');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/55-admin-login.png', fullPage: true });
      console.log('✅ Admin login page loaded');
    });
  });

  // ==========================================
  // 18. AI BOARD
  // ==========================================
  test.describe('18. AI Board', () => {
    test('18.1 Founder login page', async ({ page }) => {
      await page.goto('/founder/login');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/e2e/56-founder-login.png', fullPage: true });
      console.log('✅ Founder login page loaded');
    });
  });
});
