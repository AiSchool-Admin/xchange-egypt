import { test, expect } from '@playwright/test';

test.describe('XChange Egypt UI Tests', () => {
  
  test('1. الصفحة الرئيسية - Homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: './screenshots/01-homepage.png',
      fullPage: true 
    });
    console.log('Homepage loaded successfully');
  });

  test('2. صفحة تسجيل الدخول - Login Page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: './screenshots/02-login-page.png',
      fullPage: true 
    });
    
    const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="بريد" i]');
    const passwordField = page.locator('input[type="password"]');
    
    const hasEmail = await emailField.count() > 0;
    const hasPassword = await passwordField.count() > 0;
    
    console.log('Login page - Email field: ' + (hasEmail ? 'Found' : 'Not found'));
    console.log('Login page - Password field: ' + (hasPassword ? 'Found' : 'Not found'));
  });

  test('3. صفحة التسجيل - Register Page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: './screenshots/03-register-page.png',
      fullPage: true 
    });
    
    const nameField = page.locator('input[name="name"], input[placeholder*="اسم" i], input[placeholder*="name" i]');
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"]');
    
    const hasName = await nameField.count() > 0;
    const hasEmail = await emailField.count() > 0;
    const hasPassword = await passwordField.count() > 0;
    
    console.log('Register page - Name field: ' + (hasName ? 'Found' : 'Not found'));
    console.log('Register page - Email field: ' + (hasEmail ? 'Found' : 'Not found'));
    console.log('Register page - Password field: ' + (hasPassword ? 'Found' : 'Not found'));
  });

  test('4. البحث عن موبايل - Search for Mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث" i], input[placeholder*="search" i], input[name="search"], input[name="q"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('موبايل');
      await page.screenshot({ 
        path: './screenshots/04-search-input.png',
        fullPage: true 
      });
      
      await searchInput.first().press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: './screenshots/05-search-results.png',
        fullPage: true 
      });
      
      console.log('Search for mobile completed');
    } else {
      await page.goto('/search?q=موبايل');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: './screenshots/04-search-direct.png',
        fullPage: true 
      });
      
      console.log('Direct search page navigation');
    }
  });

  test('5. التنقل في الموقع - Navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const navLinks = page.locator('nav a, header a');
    const linkCount = await navLinks.count();
    
    console.log('Navigation links count: ' + linkCount);
    
    await page.screenshot({ 
      path: './screenshots/06-navigation.png',
      fullPage: false 
    });
  });

});
