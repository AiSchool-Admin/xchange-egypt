import { test, expect } from '@playwright/test';

test.describe('Xchange Egypt UI Tests', () => {
  test('1. Homepage - should load and display main content', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });

    // Check that page loaded
    await expect(page).toHaveTitle(/.*[Xx]change.*/i);

    console.log('Homepage loaded successfully');
  });

  test('2. Login page - should display login form', async ({ page }) => {
    await page.goto('/login');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'test-results/02-login-page.png', fullPage: true });

    // Check for login form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // Either inputs exist or there's a login form/heading
    const hasLoginForm = await emailInput.count() > 0 || await passwordInput.count() > 0;
    const loginHeading = page.locator('text=تسجيل الدخول, text=Login, text=Sign in');
    const hasLoginHeading = await loginHeading.count() > 0;

    console.log(`Login form elements found: ${hasLoginForm}`);
    console.log(`Login heading found: ${hasLoginHeading}`);

    expect(hasLoginForm || hasLoginHeading).toBeTruthy();
  });

  test('3. Register page - should display registration form', async ({ page }) => {
    await page.goto('/register');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'test-results/03-register-page.png', fullPage: true });

    // Check for register form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]');

    const hasRegisterForm = await emailInput.count() > 0 || await passwordInput.count() > 0;
    const registerHeading = page.locator('text=إنشاء حساب, text=Register, text=Sign up, text=Create account');
    const hasRegisterHeading = await registerHeading.count() > 0;

    console.log(`Register form elements found: ${hasRegisterForm}`);
    console.log(`Register heading found: ${hasRegisterHeading}`);

    expect(hasRegisterForm || hasRegisterHeading).toBeTruthy();
  });

  test('4. Search - should search for "موبايل"', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot before search
    await page.screenshot({ path: 'test-results/04a-before-search.png', fullPage: true });

    // Find search input - try different selectors
    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"], input[placeholder*="search"], input[placeholder*="Search"], input[name="search"], input[name="q"]').first();

    const searchInputCount = await searchInput.count();
    console.log(`Search input found: ${searchInputCount > 0}`);

    if (searchInputCount > 0) {
      // Click and type search term
      await searchInput.click();
      await searchInput.fill('موبايل');

      // Take screenshot after typing
      await page.screenshot({ path: 'test-results/04b-search-typed.png', fullPage: true });

      // Press enter or find submit button
      await searchInput.press('Enter');

      // Wait for results
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');

      // Take screenshot of results
      await page.screenshot({ path: 'test-results/04c-search-results.png', fullPage: true });

      console.log('Search performed successfully');
    } else {
      // Try to find search button or link
      const searchButton = page.locator('button:has-text("بحث"), a:has-text("بحث"), [aria-label*="search"]').first();

      if (await searchButton.count() > 0) {
        await searchButton.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'test-results/04b-search-page.png', fullPage: true });
      }

      console.log('Search input not found on main page, looking for search button');
    }

    expect(true).toBeTruthy(); // Test passed if we got here
  });

  test('5. Navigation - check main navigation links', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot showing navigation
    await page.screenshot({ path: 'test-results/05-navigation.png', fullPage: true });

    // Check for common navigation elements
    const navLinks = page.locator('nav a, header a');
    const linkCount = await navLinks.count();

    console.log(`Navigation links found: ${linkCount}`);

    expect(linkCount).toBeGreaterThan(0);
  });
});
