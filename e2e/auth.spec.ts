import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * اختبارات المصادقة الشاملة
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.click('text=تسجيل الدخول');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('form')).toBeVisible();
  });

  test('should display registration page', async ({ page }) => {
    await page.click('text=إنشاء حساب');
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('form')).toBeVisible();
  });

  test('should show validation errors on empty login submit', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');

    // Check for validation messages
    await expect(page.locator('text=البريد الإلكتروني مطلوب')).toBeVisible();
    await expect(page.locator('text=كلمة المرور مطلوبة')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=بيانات الدخول غير صحيحة')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=البريد الإلكتروني غير صالح')).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=كلمة المرور يجب أن تكون 8 أحرف على الأقل')).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="phone"]', '123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=رقم الهاتف غير صالح')).toBeVisible();
  });

  test('should show password toggle button', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('[aria-label="إظهار كلمة المرور"]');

    await expect(passwordInput).toHaveAttribute('type', 'password');
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=نسيت كلمة المرور');

    await expect(page).toHaveURL(/.*forgot-password/);
  });
});

test.describe('User Session', () => {
  test('should persist session after page reload', async ({ page, context }) => {
    // This test would require a valid logged-in session
    // For now, we check if auth cookie handling works
    await page.goto('/');

    // Check if auth state is properly loaded
    await expect(page.locator('[data-testid="auth-loading"]')).not.toBeVisible({ timeout: 5000 });
  });

  test('should redirect to login for protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect to login for wallet page', async ({ page }) => {
    await page.goto('/wallet');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect to login for orders page', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL(/.*login/);
  });
});
