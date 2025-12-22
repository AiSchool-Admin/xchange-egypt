import { test, expect } from '@playwright/test';

/**
 * Barter System E2E Tests
 * اختبارات نظام المقايضة الشاملة
 */

test.describe('Barter Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/barter');
  });

  test('should load barter marketplace', async ({ page }) => {
    await expect(page).toHaveURL(/.*barter/);
    await expect(page.locator('h1')).toContainText(/مقايضة|Barter/);
  });

  test('should display available barter items', async ({ page }) => {
    await expect(page.locator('.barter-card, [data-testid="barter-item"]').first()).toBeVisible();
  });

  test('should filter barter items by category', async ({ page }) => {
    await page.click('text=الإلكترونيات');
    await expect(page).toHaveURL(/.*category/);
  });

  test('should show barter item details', async ({ page }) => {
    await page.locator('.barter-card, [data-testid="barter-item"]').first().click();

    // Should show what they have and what they want
    await expect(page.locator('text=لدي')).toBeVisible();
    await expect(page.locator('text=أبحث عن')).toBeVisible();
  });
});

test.describe('Barter Matching', () => {
  test('should display matching suggestions', async ({ page }) => {
    await page.goto('/barter/matches');

    await expect(page.locator('.match-suggestion, [data-testid="match-card"]').first()).toBeVisible();
  });

  test('should show match percentage', async ({ page }) => {
    await page.goto('/barter/matches');

    await expect(page.locator('text=%')).toBeVisible();
  });
});

test.describe('Barter Chain', () => {
  test('should display barter chain visualization', async ({ page }) => {
    await page.goto('/barter/chains');

    await expect(page.locator('.chain-visualization, [data-testid="barter-chain"]')).toBeVisible();
  });

  test('should show chain participants', async ({ page }) => {
    await page.goto('/barter/chains/1');

    await expect(page.locator('.participant, [data-testid="chain-participant"]').first()).toBeVisible();
  });
});

test.describe('Barter Offers', () => {
  test('should display offer form', async ({ page }) => {
    await page.goto('/barter/1');

    const offerButton = page.locator('button:has-text("تقديم عرض")');
    if (await offerButton.isVisible()) {
      await offerButton.click();
      await expect(page.locator('form.offer-form, [data-testid="offer-form"]')).toBeVisible();
    }
  });

  test('should validate offer XCoin balance field', async ({ page }) => {
    await page.goto('/barter/1');

    const offerButton = page.locator('button:has-text("تقديم عرض")');
    if (await offerButton.isVisible()) {
      await offerButton.click();

      const xcoinField = page.locator('input[name="xcoinBalance"]');
      if (await xcoinField.isVisible()) {
        await xcoinField.fill('-100');
        await page.click('button:has-text("إرسال العرض")');

        await expect(page.locator('text=القيمة يجب أن تكون موجبة')).toBeVisible();
      }
    }
  });
});
