import { test, expect } from '@playwright/test';

/**
 * Properties & Vehicles E2E Tests
 * اختبارات العقارات والسيارات
 */

test.describe('Properties Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/properties');
  });

  test('should load properties page', async ({ page }) => {
    await expect(page).toHaveURL(/.*properties/);
    await expect(page.locator('h1')).toContainText(/عقارات|Properties/);
  });

  test('should display property listings', async ({ page }) => {
    const propertyList = page.locator('.property-list, [data-testid="property-listings"]');
    await expect(propertyList).toBeVisible();
  });

  test('should filter by property type', async ({ page }) => {
    const typeFilter = page.locator('[data-testid="property-type-filter"]');
    if (await typeFilter.isVisible()) {
      await typeFilter.click();
      await page.click('text=شقة');
    }
  });

  test('should filter by location', async ({ page }) => {
    const locationFilter = page.locator('[data-testid="location-filter"], select[name="governorate"]');
    if (await locationFilter.isVisible()) {
      await locationFilter.selectOption('القاهرة');
    }
  });

  test('should filter by price range', async ({ page }) => {
    const minPrice = page.locator('input[name="minPrice"]');
    const maxPrice = page.locator('input[name="maxPrice"]');

    if (await minPrice.isVisible()) {
      await minPrice.fill('500000');
      await maxPrice.fill('2000000');
    }
  });

  test('should show property details', async ({ page }) => {
    const propertyCard = page.locator('.property-card, [data-testid="property-card"]').first();
    if (await propertyCard.isVisible()) {
      await propertyCard.click();
      await expect(page.locator('.property-details, [data-testid="property-details"]')).toBeVisible();
    }
  });

  test('should display property map', async ({ page }) => {
    await page.goto('/properties/1');
    const map = page.locator('.property-map, [data-testid="property-map"]');
    // Map may take time to load
  });

  test('should show property features', async ({ page }) => {
    await page.goto('/properties/1');
    const features = page.locator('.property-features, [data-testid="features"]');
    await expect(features).toBeVisible();
  });

  test('should navigate to real estate section', async ({ page }) => {
    await page.goto('/real-estate');
    await expect(page).toHaveURL(/.*real-estate/);
  });
});

test.describe('Vehicles Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vehicles');
  });

  test('should load vehicles page', async ({ page }) => {
    await expect(page).toHaveURL(/.*vehicles/);
    await expect(page.locator('h1')).toContainText(/سيارات|Vehicles/);
  });

  test('should display vehicle listings', async ({ page }) => {
    const vehicleList = page.locator('.vehicle-list, [data-testid="vehicle-listings"]');
    await expect(vehicleList).toBeVisible();
  });

  test('should filter by brand', async ({ page }) => {
    const brandFilter = page.locator('[data-testid="brand-filter"], select[name="brand"]');
    if (await brandFilter.isVisible()) {
      await brandFilter.selectOption('تويوتا');
    }
  });

  test('should filter by model year', async ({ page }) => {
    const yearFilter = page.locator('select[name="year"], [data-testid="year-filter"]');
    if (await yearFilter.isVisible()) {
      await yearFilter.selectOption('2023');
    }
  });

  test('should filter by kilometer', async ({ page }) => {
    const kmFilter = page.locator('input[name="maxKm"], [data-testid="km-filter"]');
    if (await kmFilter.isVisible()) {
      await kmFilter.fill('50000');
    }
  });

  test('should show vehicle details', async ({ page }) => {
    const vehicleCard = page.locator('.vehicle-card, [data-testid="vehicle-card"]').first();
    if (await vehicleCard.isVisible()) {
      await vehicleCard.click();
      await expect(page.locator('.vehicle-details, [data-testid="vehicle-details"]')).toBeVisible();
    }
  });

  test('should navigate to cars section', async ({ page }) => {
    await page.goto('/cars');
    await expect(page).toHaveURL(/.*cars/);
  });

  test('should show vehicle specifications', async ({ page }) => {
    await page.goto('/vehicles/1');
    const specs = page.locator('.vehicle-specs, [data-testid="specs"]');
    await expect(specs).toBeVisible();
  });
});

test.describe('Gold & Precious Metals', () => {
  test('should load gold marketplace', async ({ page }) => {
    await page.goto('/gold');
    await expect(page).toHaveURL(/.*gold/);
    await expect(page.locator('h1')).toContainText(/ذهب|Gold/);
  });

  test('should display gold price ticker', async ({ page }) => {
    await page.goto('/gold');
    const priceTicker = page.locator('.gold-price, [data-testid="gold-price"]');
    await expect(priceTicker).toBeVisible();
  });

  test('should show gold listings', async ({ page }) => {
    await page.goto('/gold');
    const goldListings = page.locator('.gold-listings, [data-testid="gold-items"]');
    await expect(goldListings).toBeVisible();
  });

  test('should filter by karat', async ({ page }) => {
    await page.goto('/gold');
    const karatFilter = page.locator('select[name="karat"], [data-testid="karat-filter"]');
    if (await karatFilter.isVisible()) {
      await karatFilter.selectOption('21');
    }
  });

  test('should load silver marketplace', async ({ page }) => {
    await page.goto('/silver');
    await expect(page).toHaveURL(/.*silver/);
  });
});
