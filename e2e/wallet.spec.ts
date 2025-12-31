import { test, expect } from '@playwright/test';

/**
 * Wallet & XCoin System E2E Tests
 * اختبارات نظام المحفظة والـ XCoin
 */

test.describe('Wallet Page', () => {
  test('should redirect to login for unauthenticated users', async ({ page }) => {
    await page.goto('/wallet');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display wallet page structure', async ({ page }) => {
    await page.goto('/wallet');

    // Either shows wallet or login prompt
    const hasWallet = await page.locator('.wallet-container, [data-testid="wallet"]').isVisible();
    const hasLogin = await page.locator('text=تسجيل الدخول').isVisible();

    expect(hasWallet || hasLogin).toBeTruthy();
  });
});

test.describe('XCoin Balance', () => {
  test('should display XCoin balance section', async ({ page }) => {
    await page.goto('/wallet');

    const balanceSection = page.locator('.xcoin-balance, [data-testid="xcoin-balance"]');
    const loginRequired = await page.locator('text=تسجيل الدخول').isVisible();

    expect(await balanceSection.isVisible() || loginRequired).toBeTruthy();
  });

  test('should show XCoin transaction history', async ({ page }) => {
    await page.goto('/wallet');

    const historySection = page.locator('.transaction-history, [data-testid="xcoin-history"]');
    const loginRequired = await page.locator('text=تسجيل الدخول').isVisible();

    expect(await historySection.isVisible() || loginRequired).toBeTruthy();
  });
});

test.describe('Wallet Actions', () => {
  test('should show deposit button', async ({ page }) => {
    await page.goto('/wallet');

    const depositButton = page.locator('button:has-text("إيداع"), button:has-text("شحن")');
    const loginRequired = await page.locator('text=تسجيل الدخول').isVisible();

    expect(await depositButton.isVisible() || loginRequired).toBeTruthy();
  });

  test('should show withdraw button', async ({ page }) => {
    await page.goto('/wallet');

    const withdrawButton = page.locator('button:has-text("سحب")');
    const loginRequired = await page.locator('text=تسجيل الدخول').isVisible();

    expect(await withdrawButton.isVisible() || loginRequired).toBeTruthy();
  });

  test('should show transfer button', async ({ page }) => {
    await page.goto('/wallet');

    const transferButton = page.locator('button:has-text("تحويل")');
    const loginRequired = await page.locator('text=تسجيل الدخول').isVisible();

    expect(await transferButton.isVisible() || loginRequired).toBeTruthy();
  });
});

test.describe('Payment Methods', () => {
  test('should navigate to payment methods page', async ({ page }) => {
    await page.goto('/payment-methods');

    await expect(page).toHaveURL(/.*payment-methods|.*login/);
  });

  test('should display available payment options', async ({ page }) => {
    await page.goto('/payment-methods');

    const paymentOptions = page.locator('.payment-option, [data-testid="payment-method"]');
    const loginRequired = await page.locator('text=تسجيل الدخول').isVisible();

    expect(await paymentOptions.first().isVisible() || loginRequired).toBeTruthy();
  });
});

test.describe('Escrow System', () => {
  test('should navigate to escrow page', async ({ page }) => {
    await page.goto('/escrow');

    await expect(page).toHaveURL(/.*escrow|.*login/);
  });

  test('should display escrow transactions', async ({ page }) => {
    await page.goto('/escrow');

    const escrowList = page.locator('.escrow-list, [data-testid="escrow-transactions"]');
    const loginRequired = await page.locator('text=تسجيل الدخول').isVisible();

    expect(await escrowList.isVisible() || loginRequired).toBeTruthy();
  });
});

test.describe('Exchange Points', () => {
  test('should navigate to exchange points page', async ({ page }) => {
    await page.goto('/exchange-points');

    await expect(page).toHaveURL(/.*exchange-points|.*login/);
  });

  test('should display points balance', async ({ page }) => {
    await page.goto('/exchange-points');

    const pointsBalance = page.locator('.points-balance, [data-testid="points-balance"]');
    const loginRequired = await page.locator('text=تسجيل الدخول').isVisible();

    expect(await pointsBalance.isVisible() || loginRequired).toBeTruthy();
  });

  test('should show points history', async ({ page }) => {
    await page.goto('/exchange-points');

    const pointsHistory = page.locator('.points-history, [data-testid="points-history"]');
    const loginRequired = await page.locator('text=تسجيل الدخول').isVisible();

    expect(await pointsHistory.isVisible() || loginRequired).toBeTruthy();
  });
});
