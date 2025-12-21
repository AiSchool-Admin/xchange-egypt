import { test, expect } from '@playwright/test';

/**
 * Marketplace E2E Tests
 * اختبارات السوق الشاملة
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Xchange|إكسشينج/);
  });

  test('should display main navigation', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should display search bar', async ({ page }) => {
    await expect(page.locator('input[type="search"], input[placeholder*="بحث"]')).toBeVisible();
  });

  test('should display category sections', async ({ page }) => {
    await expect(page.locator('text=الفئات')).toBeVisible();
  });

  test('should display featured listings', async ({ page }) => {
    await expect(page.locator('[data-testid="featured-listings"], .featured-listings')).toBeVisible();
  });
});

test.describe('Search Functionality', () => {
  test('should search for products', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[type="search"], input[placeholder*="بحث"]', 'آيفون');
    await page.press('input[type="search"], input[placeholder*="بحث"]', 'Enter');

    await expect(page).toHaveURL(/.*search.*آيفون|.*q=آيفون/);
  });

  test('should show search suggestions', async ({ page }) => {
    await page.goto('/');

    await page.fill('input[type="search"], input[placeholder*="بحث"]', 'سامسونج');

    // Wait for suggestions to appear
    await expect(page.locator('[data-testid="search-suggestions"], .search-suggestions')).toBeVisible({ timeout: 3000 });
  });

  test('should filter search results by category', async ({ page }) => {
    await page.goto('/search?q=هاتف');

    // Click on category filter
    await page.click('text=الموبايلات');

    await expect(page).toHaveURL(/.*category.*mobiles|.*category=موبايلات/);
  });

  test('should filter search results by price range', async ({ page }) => {
    await page.goto('/search?q=سيارة');

    // Set price range
    const minPrice = page.locator('input[name="minPrice"]');
    const maxPrice = page.locator('input[name="maxPrice"]');

    if (await minPrice.isVisible()) {
      await minPrice.fill('50000');
      await maxPrice.fill('100000');
      await page.click('button:has-text("تطبيق")');

      await expect(page).toHaveURL(/.*minPrice=50000.*maxPrice=100000/);
    }
  });

  test('should sort search results', async ({ page }) => {
    await page.goto('/search?q=لابتوب');

    await page.selectOption('select[name="sort"]', 'price_asc');

    await expect(page).toHaveURL(/.*sort=price_asc/);
  });
});

test.describe('Categories', () => {
  test('should navigate to electronics category', async ({ page }) => {
    await page.goto('/');
    await page.click('text=الإلكترونيات');

    await expect(page).toHaveURL(/.*category.*electronics|.*الإلكترونيات/);
  });

  test('should display subcategories', async ({ page }) => {
    await page.goto('/categories/electronics');

    await expect(page.locator('.subcategories, [data-testid="subcategories"]')).toBeVisible();
  });

  test('should display category breadcrumbs', async ({ page }) => {
    await page.goto('/categories/electronics/mobiles');

    await expect(page.locator('nav[aria-label="breadcrumb"], .breadcrumb')).toBeVisible();
    await expect(page.locator('text=الإلكترونيات')).toBeVisible();
    await expect(page.locator('text=الموبايلات')).toBeVisible();
  });
});

test.describe('Product Listing Page', () => {
  test('should display product cards', async ({ page }) => {
    await page.goto('/marketplace');

    await expect(page.locator('.product-card, [data-testid="listing-card"]').first()).toBeVisible();
  });

  test('should display pagination', async ({ page }) => {
    await page.goto('/marketplace');

    await expect(page.locator('.pagination, [aria-label="pagination"]')).toBeVisible();
  });

  test('should navigate to next page', async ({ page }) => {
    await page.goto('/marketplace');

    const nextButton = page.locator('button:has-text("التالي"), a:has-text("التالي")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page).toHaveURL(/.*page=2/);
    }
  });
});

test.describe('Product Detail Page', () => {
  test('should display product details', async ({ page }) => {
    await page.goto('/marketplace');

    // Click on first product
    await page.locator('.product-card, [data-testid="listing-card"]').first().click();

    // Should show product details
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.price, [data-testid="product-price"]')).toBeVisible();
  });

  test('should display product images', async ({ page }) => {
    await page.goto('/listings/1');

    await expect(page.locator('.product-images, [data-testid="product-gallery"]')).toBeVisible();
  });

  test('should display seller information', async ({ page }) => {
    await page.goto('/listings/1');

    await expect(page.locator('.seller-info, [data-testid="seller-info"]')).toBeVisible();
  });

  test('should show add to cart button', async ({ page }) => {
    await page.goto('/listings/1');

    await expect(page.locator('button:has-text("أضف إلى السلة")')).toBeVisible();
  });

  test('should show contact seller button', async ({ page }) => {
    await page.goto('/listings/1');

    await expect(page.locator('button:has-text("تواصل مع البائع")')).toBeVisible();
  });
});
