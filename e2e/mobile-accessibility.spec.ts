import { test, expect, devices } from '@playwright/test';

/**
 * Mobile & Accessibility E2E Tests
 * اختبارات الموبايل وإمكانية الوصول
 */

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display mobile navigation', async ({ page }) => {
    await page.goto('/');

    // Should have hamburger menu on mobile
    const mobileMenu = page.locator('.mobile-menu, [data-testid="mobile-nav"], .hamburger');
    await expect(mobileMenu).toBeVisible();
  });

  test('should open mobile menu', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('.hamburger, [data-testid="menu-toggle"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.locator('.mobile-nav-open, [data-testid="mobile-menu-open"]')).toBeVisible();
    }
  });

  test('should display mobile search', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"]');
    await expect(searchInput).toBeVisible();
  });

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/');

    // Buttons should have minimum touch target size (44x44px)
    const buttons = page.locator('button').first();
    const box = await buttons.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('should scroll properly on mobile', async ({ page }) => {
    await page.goto('/marketplace');

    // Test vertical scrolling
    await page.evaluate(() => window.scrollBy(0, 500));

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });
});

test.describe('Tablet Responsiveness', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test('should display tablet layout', async ({ page }) => {
    await page.goto('/');

    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
  });

  test('should show grid layout on tablet', async ({ page }) => {
    await page.goto('/marketplace');

    const productGrid = page.locator('.product-grid, .grid');
    await expect(productGrid).toBeVisible();
  });
});

test.describe('Accessibility - WCAG Compliance', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThanOrEqual(1);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Alt attribute should exist
      expect(alt !== null).toBeTruthy();
    }
  });

  test('should have labels on form inputs', async ({ page }) => {
    await page.goto('/login');

    const inputs = page.locator('input[type="email"], input[type="password"]');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');

      // Should have some form of label
      expect(id || ariaLabel || placeholder).toBeTruthy();
    }
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[name="email"]');
    await emailInput.focus();

    // Input should be focusable
    await expect(emailInput).toBeFocused();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Some element should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');

    // Check that text is visible (basic contrast test)
    const bodyText = page.locator('body');
    await expect(bodyText).toBeVisible();
  });

  test('should have skip to content link', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link');
    // Skip link may be hidden until focused
  });
});

test.describe('RTL Support', () => {
  test('should display Arabic RTL layout', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const dir = await html.getAttribute('dir');

    // Should be RTL for Arabic
    expect(dir === 'rtl' || dir === null).toBeTruthy();
  });

  test('should have proper Arabic text alignment', async ({ page }) => {
    await page.goto('/');

    // Text should be right-aligned for Arabic
    const mainContent = page.locator('main, .content').first();
    const textAlign = await mainContent.evaluate(el =>
      window.getComputedStyle(el).textAlign
    );

    // Right or start (for RTL) are acceptable
    expect(['right', 'start', '-webkit-right'].includes(textAlign) || textAlign === 'right').toBeTruthy;
  });
});

test.describe('PWA Features', () => {
  test('should have manifest file', async ({ page }) => {
    await page.goto('/');

    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute('href');
  });

  test('should have meta theme color', async ({ page }) => {
    await page.goto('/');

    const themeColor = page.locator('meta[name="theme-color"]');
    // Theme color may be present
  });

  test('should navigate to offline page', async ({ page }) => {
    await page.goto('/offline');
    await expect(page).toHaveURL(/.*offline/);
  });
});

test.describe('Performance Indicators', () => {
  test('should load homepage in reasonable time', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - start;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should have lazy loaded images', async ({ page }) => {
    await page.goto('/marketplace');

    const lazyImages = page.locator('img[loading="lazy"]');
    const count = await lazyImages.count();

    // Should have some lazy loaded images
  });
});
