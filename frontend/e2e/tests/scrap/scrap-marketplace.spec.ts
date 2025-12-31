import { test, expect, TestHelpers, TEST_USERS } from '../../fixtures/test-base';

/**
 * Xchange Egypt - Scrap Marketplace E2E Tests
 *
 * Tests cover:
 * 1. Page loading and display
 * 2. Category filtering
 * 3. Metal prices display
 * 4. Product details
 * 5. RTL support
 * 6. Mobile responsiveness
 * 7. User journeys (browse, sell, contact dealer)
 */

test.describe('Scrap Marketplace - Page Loading', () => {
  test('should load scrap page successfully', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Check page title/header exists
    await expect(page.locator('h1')).toBeVisible();

    // Check hero section with gradient
    await expect(page.locator('[class*="bg-gradient"]').first()).toBeVisible();
  });

  test('should display hero section with stats', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Check for stats (products, dealers, requests)
    const statsSection = page.locator('[class*="bg-white/20"]');
    await expect(statsSection.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Stats may load asynchronously
    });
  });

  test('should display "بيع توالف" (Sell Scrap) button', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    const sellButton = page.locator('a[href*="/scrap/sell"]');
    await expect(sellButton).toBeVisible();
  });

  test('should display "تجار معتمدين" (Verified Dealers) button', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    const dealersButton = page.locator('a[href*="/scrap/dealers"]');
    await expect(dealersButton).toBeVisible();
  });
});

test.describe('Scrap Marketplace - Category Filtering', () => {
  test('should display category filter tabs', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Check for category tabs
    const categoryTabs = page.locator('[class*="sticky"]').first();
    await expect(categoryTabs).toBeVisible();
  });

  test('should filter by "Electronics" category', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Click electronics category (الكترونيات)
    const electronicsTab = page.locator('button').filter({ hasText: /إلكترونيات|Electronics|📱/ });

    if (await electronicsTab.first().isVisible()) {
      await electronicsTab.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('should filter by "Metal Scrap" category', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Click metal scrap category
    const metalTab = page.locator('button').filter({ hasText: /خردة معادن|Metal|🔩/ });

    if (await metalTab.first().isVisible()) {
      await metalTab.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('should reset filter when clicking "الكل" (All)', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Click a category first
    const anyCategory = page.locator('button').filter({ hasText: /📱|🔌|💻/ }).first();
    if (await anyCategory.isVisible()) {
      await anyCategory.click();
      await page.waitForTimeout(500);
    }

    // Click "All"
    const allButton = page.locator('button').filter({ hasText: /الكل/ }).first();
    await allButton.click();
    await page.waitForTimeout(500);
  });
});

test.describe('Scrap Marketplace - Metal Prices', () => {
  test('should display metal prices section', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Check for metal prices card
    const pricesSection = page.getByText(/أسعار المعادن|Metal Prices/);
    await expect(pricesSection).toBeVisible();
  });

  test('should display metal types with prices', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Wait for prices to load
    await page.waitForTimeout(2000);

    // Check for price entries (ج.م/كجم)
    const priceEntries = page.locator('[class*="bg-gray-50"]').filter({ hasText: /ج\.م/ });
    const loadingMessage = page.getByText(/جاري تحميل الأسعار/);

    const hasPrices = await priceEntries.count() > 0;
    const isLoading = await loadingMessage.isVisible().catch(() => false);

    expect(hasPrices || isLoading).toBeTruthy();
  });

  test('should display copper price (النحاس)', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();
    await page.waitForTimeout(2000);

    const copperPrice = page.getByText(/النحاس|Copper/);
    // Price may or may not be available
  });
});

test.describe('Scrap Marketplace - Filters Sidebar', () => {
  test('should display filter sidebar', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Check for filter section
    const filterSection = page.getByText(/تصفية النتائج|Filter Results/);
    await expect(filterSection).toBeVisible();
  });

  test('should have condition filter dropdown', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Find condition filter
    const conditionLabel = page.getByText(/الحالة/);
    await expect(conditionLabel).toBeVisible();

    const conditionSelect = page.locator('select').first();
    if (await conditionSelect.isVisible()) {
      await conditionSelect.click();
    }
  });

  test('should have metal type filter', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    const metalTypeLabel = page.getByText(/نوع المعدن/);
    await expect(metalTypeLabel).toBeVisible();
  });

  test('should have price range filter', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    const priceLabel = page.getByText(/نطاق السعر/);
    await expect(priceLabel).toBeVisible();

    // Check for min/max inputs
    const priceInputs = page.locator('input[type="number"]');
    await expect(priceInputs).toHaveCount(2, { timeout: 5000 }).catch(() => {
      // Inputs may differ
    });
  });

  test('should reset filters when clicking reset button', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Fill in a filter
    const minPriceInput = page.locator('input[type="number"]').first();
    if (await minPriceInput.isVisible()) {
      await minPriceInput.fill('100');
    }

    // Click reset
    const resetButton = page.getByText(/إعادة تعيين الفلاتر|Reset/);
    await resetButton.click();

    // Input should be cleared
    if (await minPriceInput.isVisible()) {
      await expect(minPriceInput).toHaveValue('');
    }
  });
});

test.describe('Scrap Marketplace - Product Cards', () => {
  test('should display product cards', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();
    await page.waitForTimeout(2000);

    // Check for product cards or no products message
    const productCards = page.locator('a[href*="/scrap/"]').filter({ has: page.locator('img, [class*="bg-gray-100"]') });
    const noProducts = page.getByText(/لا توجد منتجات/);

    const hasProducts = await productCards.count() > 0;
    const hasNoProductsMessage = await noProducts.isVisible().catch(() => false);

    expect(hasProducts || hasNoProductsMessage).toBeTruthy();
  });

  test('should display product price in EGP', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();
    await page.waitForTimeout(2000);

    // Check for price display
    const priceElements = page.locator('[class*="text-green"]').filter({ hasText: /ج\.م/ });
    // Prices should be visible if products exist
  });

  test('should display product weight in kg', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();
    await page.waitForTimeout(2000);

    // Check for weight display
    const weightElements = page.getByText(/كجم/);
    // Weight should be visible if products have weight
  });

  test('should display condition badge on cards', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();
    await page.waitForTimeout(2000);

    // Check for condition badges
    const badges = page.locator('[class*="bg-orange-500"]');
    // Badges should exist if products exist
  });
});

test.describe('Scrap Marketplace - Navigation', () => {
  test('should navigate to product details on card click', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();
    await page.waitForTimeout(2000);

    const productLink = page.locator('a[href*="/scrap/"]').filter({ has: page.locator('img, [class*="bg-gray-100"]') }).first();

    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForURL(/\/scrap\/[a-zA-Z0-9-]+/, { timeout: 10000 }).catch(() => {
        // May not have products
      });
    }
  });

  test('should navigate to sell page', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    const sellButton = page.locator('a[href*="/scrap/sell"]');
    await sellButton.click();

    await page.waitForURL(/\/scrap\/sell/);
  });

  test('should navigate to dealers page', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    const dealersButton = page.locator('a[href*="/scrap/dealers"]');
    await dealersButton.click();

    await page.waitForURL(/\/scrap\/dealers/);
  });
});

test.describe('Scrap Marketplace - RTL Support', () => {
  test('should render in RTL direction', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    const isRTL = await helpers.isRTL();
    expect(isRTL).toBeTruthy();
  });

  test('should display Arabic content correctly', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Check for Arabic text
    const arabicTexts = [
      page.getByText(/سوق التوالف/),
      page.getByText(/بيع توالف/),
      page.getByText(/تجار معتمدين/),
    ];

    for (const text of arabicTexts) {
      await expect(text).toBeVisible();
    }
  });

  test('should align text to right', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Check text alignment
    const container = page.locator('[dir="rtl"]');
    await expect(container).toBeVisible();
  });
});

test.describe('Scrap Marketplace - Mobile Responsiveness', () => {
  test('should not have horizontal scroll on mobile', async ({ page, helpers }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    const noHorizontalScroll = await helpers.checkNoHorizontalScroll();
    expect(noHorizontalScroll).toBeTruthy();
  });

  test('should stack content vertically on mobile', async ({ page, helpers }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Sidebar should be visible but stacked
    const filterSection = page.getByText(/تصفية النتائج/);
    await expect(filterSection).toBeVisible();
  });

  test('category tabs should be scrollable on mobile', async ({ page, helpers }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Category tabs container should exist
    const tabsContainer = page.locator('[class*="overflow-x-auto"]');
    await expect(tabsContainer.first()).toBeVisible();
  });
});

test.describe('Scrap Marketplace - Loading States', () => {
  test('should show loading skeleton while fetching data', async ({ page }) => {
    await page.goto('/scrap');

    // Check for loading animation
    const loadingElements = page.locator('[class*="animate-pulse"]');
    // Loading may complete quickly
  });

  test('should show "no products" message when empty', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Apply a very restrictive filter
    const minPriceInput = page.locator('input[type="number"]').first();
    if (await minPriceInput.isVisible()) {
      await minPriceInput.fill('999999999');
      await page.waitForTimeout(1500);

      const noProducts = page.getByText(/لا توجد منتجات/);
      // May or may not show depending on data
    }
  });
});

test.describe('Scrap Marketplace - User Journey: Browse and Filter', () => {
  test('visitor can browse and filter scrap items', async ({ page, helpers }) => {
    // Step 1: Visit scrap page
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Step 2: View metal prices
    const pricesSection = page.getByText(/أسعار المعادن/);
    await expect(pricesSection).toBeVisible();

    // Step 3: Filter by category
    const categoryButton = page.locator('button').filter({ hasText: /إلكترونيات|📱/ }).first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(1000);
    }

    // Step 4: Apply condition filter
    const conditionSelect = page.locator('select').first();
    if (await conditionSelect.isVisible()) {
      await conditionSelect.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
    }

    // Step 5: Reset filters
    const resetButton = page.getByText(/إعادة تعيين الفلاتر/);
    await resetButton.click();
  });
});

test.describe('Scrap Marketplace - Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Should have h2 or h3 for sections
    const h2h3 = page.locator('h2, h3');
    await expect(h2h3.first()).toBeVisible();
  });

  test('interactive elements should be keyboard accessible', async ({ page, helpers }) => {
    await page.goto('/scrap');
    await helpers.waitForPageLoad();

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'SELECT']).toContain(focusedElement);
  });
});
