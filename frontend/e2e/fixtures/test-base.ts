import { test as base, expect, Page } from '@playwright/test';

/**
 * Custom test fixtures for Xchange Egypt E2E tests
 */

// Test user credentials
export const TEST_USERS = {
  buyer: {
    email: 'test5@xchange.eg',
    password: 'Test123456!',
    name: 'كريم الفاخر',
  },
  seller: {
    email: 'test1@xchange.eg',
    password: 'Test123456!',
    name: 'أحمد التاجر',
  },
  scrapDealer: {
    email: 'test4@xchange.eg',
    password: 'Test123456!',
    name: 'فاطمة الخردة',
  },
};

// Custom page helpers
export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to be fully loaded (no network activity)
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if the page has RTL direction
   */
  async isRTL(): Promise<boolean> {
    const dir = await this.page.getAttribute('html', 'dir');
    return dir === 'rtl';
  }

  /**
   * Get text content in Arabic or English based on locale
   */
  async getText(arabicText: string, englishText: string): Promise<string> {
    const isRTL = await this.isRTL();
    return isRTL ? arabicText : englishText;
  }

  /**
   * Check for console errors
   */
  async checkNoConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  /**
   * Check for no horizontal scroll (mobile responsiveness)
   */
  async checkNoHorizontalScroll(): Promise<boolean> {
    const scrollWidth = await this.page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await this.page.evaluate(() => document.documentElement.clientWidth);
    return scrollWidth <= clientWidth;
  }

  /**
   * Login with test user
   */
  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');

    // Fill login form
    await this.page.fill('input[type="email"], input[name="email"]', email);
    await this.page.fill('input[type="password"], input[name="password"]', password);

    // Submit
    await this.page.click('button[type="submit"]');

    // Wait for redirect
    await this.page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
  }

  /**
   * Scroll to element and click
   */
  async scrollAndClick(selector: string) {
    const element = this.page.locator(selector).first();
    await element.scrollIntoViewIfNeeded();
    await element.click();
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `e2e/screenshots/${name}-${timestamp}.png`,
      fullPage: true,
    });
  }
}

// Extended test fixture
export const test = base.extend<{ helpers: TestHelpers }>({
  helpers: async ({ page }, use) => {
    const helpers = new TestHelpers(page);
    await use(helpers);
  },
});

export { expect };
