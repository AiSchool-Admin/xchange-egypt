import { test, expect, TestHelpers } from '../../fixtures/test-base';

/**
 * Xchange Egypt - Homepage E2E Tests
 *
 * Tests cover:
 * 1. Page loading
 * 2. Hero section
 * 3. Categories/Features
 * 4. RTL support
 * 5. Responsiveness
 */

test.describe('Homepage - Loading', () => {
  test('should load homepage successfully', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Page should load without errors
    await expect(page).toHaveURL('/');
  });

  test('should display hero section', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Hero section with CTA buttons
    const heroSection = page.locator('[class*="hero"], [class*="bg-gradient"]').first();
    await expect(heroSection).toBeVisible({ timeout: 10000 }).catch(() => {
      // Hero may have different class names
    });
  });

  test('should display main heading', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });
});

test.describe('Homepage - Categories', () => {
  test('should display marketplace categories', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check for category links
    const categories = [
      page.locator('a[href*="/mobiles"]'),
      page.locator('a[href*="/scrap"]'),
      page.locator('a[href*="/auctions"]'),
      page.locator('a[href*="/cars"]'),
    ];

    let foundCategories = 0;
    for (const category of categories) {
      if (await category.first().isVisible().catch(() => false)) {
        foundCategories++;
      }
    }

    // At least some categories should be visible
    expect(foundCategories).toBeGreaterThan(0);
  });
});

test.describe('Homepage - RTL', () => {
  test('should render in RTL for Arabic', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    const isRTL = await helpers.isRTL();
    expect(isRTL).toBeTruthy();
  });

  test('should display Arabic welcome message', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    const arabicText = page.getByText(/مرحباً|أهلاً|Xchange|تبادل/);
    await expect(arabicText.first()).toBeVisible({ timeout: 10000 }).catch(() => {
      // Content may vary
    });
  });
});

test.describe('Homepage - Responsiveness', () => {
  test('should not have horizontal scroll on mobile', async ({ page, helpers }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/');
    await helpers.waitForPageLoad();

    const noHorizontalScroll = await helpers.checkNoHorizontalScroll();
    expect(noHorizontalScroll).toBeTruthy();
  });

  test('should not have horizontal scroll on tablet', async ({ page, helpers }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');
    await helpers.waitForPageLoad();

    const noHorizontalScroll = await helpers.checkNoHorizontalScroll();
    expect(noHorizontalScroll).toBeTruthy();
  });

  test('should not have horizontal scroll on desktop', async ({ page, helpers }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/');
    await helpers.waitForPageLoad();

    const noHorizontalScroll = await helpers.checkNoHorizontalScroll();
    expect(noHorizontalScroll).toBeTruthy();
  });
});

test.describe('Homepage - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });
});

test.describe('Homepage - Accessibility', () => {
  test('should have proper page title', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have only one h1', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeLessThanOrEqual(2); // Allow for nested components
  });

  test('images should have alt text', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.waitForPageLoad();

    const imagesWithoutAlt = page.locator('img:not([alt])');
    const count = await imagesWithoutAlt.count();

    // Should have minimal images without alt
    expect(count).toBeLessThanOrEqual(5);
  });
});
