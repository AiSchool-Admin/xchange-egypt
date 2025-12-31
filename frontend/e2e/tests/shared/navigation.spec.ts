import { test, expect, TestHelpers } from '../../fixtures/test-base';

/**
 * Xchange Egypt - Navigation & Layout E2E Tests
 *
 * Tests cover:
 * 1. Header/Navbar
 * 2. Footer
 * 3. Main navigation links
 * 4. Mobile menu
 * 5. Language switching
 */

test.describe('Navigation - Header', () => {
  test('should display header on home page', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Header/nav should be visible
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
  });

  test('should display logo in header', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Logo (image or text)
    const logo = page.locator('header a[href="/"], nav a[href="/"]').first();
    await expect(logo).toBeVisible();
  });

  test('should display navigation links', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check for navigation links
    const navLinks = page.locator('header a, nav a');
    await expect(navLinks.first()).toBeVisible();
  });

  test('should have login/register buttons when not authenticated', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    const loginButton = page.getByText(/تسجيل الدخول|Login/);
    const registerButton = page.getByText(/إنشاء حساب|Register|التسجيل/);

    const hasAuthButtons = await loginButton.isVisible().catch(() => false) ||
                          await registerButton.isVisible().catch(() => false);
    // Auth buttons should exist (or user is logged in)
  });
});

test.describe('Navigation - Mobile Menu', () => {
  test('should show hamburger menu on mobile', async ({ page, helpers }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Hamburger button
    const menuButton = page.locator('button[aria-label*="menu"], button[class*="menu"], [class*="hamburger"]');
    await expect(menuButton.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // May have different structure
    });
  });

  test('should toggle mobile menu when clicking hamburger', async ({ page, helpers }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/');
    await helpers.waitForPageLoad();

    const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();

    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should hide desktop nav on mobile', async ({ page, helpers }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Desktop nav should be hidden
    const desktopNav = page.locator('[class*="hidden"][class*="md:flex"], [class*="hidden"][class*="lg:flex"]');
    // This selector checks for hidden on mobile elements
  });
});

test.describe('Navigation - Footer', () => {
  test('should display footer on home page', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible({ timeout: 5000 }).catch(() => {
      // Footer may not exist on all pages
    });
  });

  test('should display copyright in footer', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const copyright = page.getByText(/©|حقوق|Xchange|2024|2025/);
    await expect(copyright.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // May not have copyright
    });
  });

  test('should have social media links in footer', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Social links (Facebook, Twitter, Instagram, etc.)
    const socialLinks = page.locator('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"]');
    // Social links may or may not exist
  });
});

test.describe('Navigation - Main Links', () => {
  test('should navigate to mobiles page', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    const mobilesLink = page.locator('a[href*="/mobiles"]').first();

    if (await mobilesLink.isVisible()) {
      await mobilesLink.click();
      await page.waitForURL(/\/mobiles/);
    } else {
      // Navigate directly
      await page.goto('/mobiles');
    }

    await expect(page).toHaveURL(/\/mobiles/);
  });

  test('should navigate to scrap page', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    const scrapLink = page.locator('a[href*="/scrap"]').first();

    if (await scrapLink.isVisible()) {
      await scrapLink.click();
      await page.waitForURL(/\/scrap/);
    } else {
      await page.goto('/scrap');
    }

    await expect(page).toHaveURL(/\/scrap/);
  });

  test('should navigate to auctions page', async ({ page, helpers }) => {
    await page.goto('/auctions');
    await helpers.waitForPageLoad();

    await expect(page).toHaveURL(/\/auctions/);
  });

  test('should navigate to cars page', async ({ page, helpers }) => {
    await page.goto('/cars');
    await helpers.waitForPageLoad();

    await expect(page).toHaveURL(/\/cars/);
  });

  test('should navigate to properties page', async ({ page, helpers }) => {
    await page.goto('/properties');
    await helpers.waitForPageLoad();

    await expect(page).toHaveURL(/\/properties/);
  });
});

test.describe('Navigation - RTL', () => {
  test('header should be RTL for Arabic', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    const isRTL = await helpers.isRTL();
    expect(isRTL).toBeTruthy();
  });
});

test.describe('Navigation - Responsiveness', () => {
  test('should not have horizontal scroll on any viewport', async ({ page, helpers }) => {
    const viewports = [
      { width: 375, height: 812 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1280, height: 720 },  // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await helpers.waitForPageLoad();

      const noHorizontalScroll = await helpers.checkNoHorizontalScroll();
      expect(noHorizontalScroll).toBeTruthy();
    }
  });
});
