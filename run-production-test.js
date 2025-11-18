#!/usr/bin/env node

/**
 * Production Environment Test
 * Tests the actual Xchange platform like a real user would
 */

const https = require('https');
const http = require('http');

const API_URL = 'https://xchange-egypt-production.up.railway.app/api/v1';
const FRONTEND_URL = 'http://localhost:3000';

// Generate unique test data
const timestamp = Date.now();
const testData = {
  individual: {
    fullName: 'John Test Individual',
    email: `john.test.${timestamp}@example.com`,
    password: 'TestPassword123!',
    phone: '+201234567890',
    city: 'Cairo',
    governorate: 'Cairo'
  },
  business: {
    fullName: 'Sarah Test Business',
    email: `sarah.test.${timestamp}@example.com`,
    password: 'TestPassword123!',
    phone: '+201987654321',
    businessName: 'Test Corp LLC',
    taxId: 'TAX123456',
    commercialRegNo: 'CR987654',
    city: 'Alexandria',
    governorate: 'Alexandria'
  }
};

let individualTokens = {};
let businessTokens = {};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: response
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function test1_IndividualRegistration() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 1: Individual User Registration', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  try {
    const response = await makeRequest(
      `${API_URL}/auth/register/individual`,
      'POST',
      testData.individual
    );

    if (response.status === 201 && response.data.success) {
      individualTokens = {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken
      };

      log('✅ SUCCESS: Individual registered!', 'green');
      log(`   Email: ${testData.individual.email}`, 'cyan');
      log(`   Name: ${response.data.data.user.fullName}`, 'cyan');
      log(`   User Type: ${response.data.data.user.userType}`, 'cyan');
      log(`   User ID: ${response.data.data.user.id}`, 'cyan');
      log(`   Access Token: ${individualTokens.accessToken.substring(0, 30)}...`, 'cyan');
      return true;
    } else {
      log(`❌ FAILED: ${response.data.error?.message || 'Unknown error'}`, 'red');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    log(`❌ ERROR: ${error.message}`, 'red');
    return false;
  }
}

async function test2_BusinessRegistration() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 2: Business User Registration', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  try {
    const response = await makeRequest(
      `${API_URL}/auth/register/business`,
      'POST',
      testData.business
    );

    if (response.status === 201 && response.data.success) {
      businessTokens = {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken
      };

      log('✅ SUCCESS: Business registered!', 'green');
      log(`   Email: ${testData.business.email}`, 'cyan');
      log(`   Name: ${response.data.data.user.fullName}`, 'cyan');
      log(`   User Type: ${response.data.data.user.userType}`, 'cyan');
      log(`   Business Name: ${response.data.data.user.businessName}`, 'cyan');
      log(`   Tax ID: ${response.data.data.user.taxId}`, 'cyan');
      log(`   User ID: ${response.data.data.user.id}`, 'cyan');
      return true;
    } else {
      log(`❌ FAILED: ${response.data.error?.message || 'Unknown error'}`, 'red');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    log(`❌ ERROR: ${error.message}`, 'red');
    return false;
  }
}

async function test3_Login() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 3: Login with Individual Account', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  try {
    const response = await makeRequest(
      `${API_URL}/auth/login`,
      'POST',
      {
        email: testData.individual.email,
        password: testData.individual.password
      }
    );

    if (response.status === 200 && response.data.success) {
      log('✅ SUCCESS: Login successful!', 'green');
      log(`   Email: ${response.data.data.user.email}`, 'cyan');
      log(`   Full Name: ${response.data.data.user.fullName}`, 'cyan');
      log(`   User Type: ${response.data.data.user.userType}`, 'cyan');
      log(`   New Access Token: ${response.data.data.accessToken.substring(0, 30)}...`, 'cyan');
      return true;
    } else {
      log(`❌ FAILED: ${response.data.error?.message || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ERROR: ${error.message}`, 'red');
    return false;
  }
}

async function test4_GetProfile() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 4: Get User Profile (Protected Route)', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  try {
    const response = await makeRequest(
      `${API_URL}/auth/me`,
      'GET',
      null,
      individualTokens.accessToken
    );

    if (response.status === 200 && response.data.success) {
      log('✅ SUCCESS: Profile retrieved!', 'green');
      log(`   User ID: ${response.data.data.id}`, 'cyan');
      log(`   Email: ${response.data.data.email}`, 'cyan');
      log(`   Full Name: ${response.data.data.fullName}`, 'cyan');
      log(`   User Type: ${response.data.data.userType}`, 'cyan');
      log(`   City: ${response.data.data.city}`, 'cyan');
      log(`   Governorate: ${response.data.data.governorate}`, 'cyan');
      log(`   Status: ${response.data.data.status}`, 'cyan');
      return true;
    } else {
      log(`❌ FAILED: ${response.data.error?.message || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ERROR: ${error.message}`, 'red');
    return false;
  }
}

async function test5_Logout() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 5: Logout', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  try {
    const response = await makeRequest(
      `${API_URL}/auth/logout`,
      'POST',
      { refreshToken: individualTokens.refreshToken }
    );

    if (response.status === 200 && response.data.success) {
      log('✅ SUCCESS: Logout successful!', 'green');
      log(`   Message: ${response.data.message}`, 'cyan');
      return true;
    } else {
      log(`❌ FAILED: ${response.data.error?.message || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ERROR: ${error.message}`, 'red');
    return false;
  }
}

async function test6_FrontendHealthCheck() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 6: Frontend Server Health Check', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  try {
    const response = await makeRequest(FRONTEND_URL, 'GET');

    if (response.status === 200) {
      log('✅ SUCCESS: Frontend is running!', 'green');
      log(`   URL: ${FRONTEND_URL}`, 'cyan');
      log(`   Status: ${response.status}`, 'cyan');
      return true;
    } else {
      log(`⚠️  WARNING: Frontend returned status ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ ERROR: Frontend not accessible - ${error.message}`, 'red');
    log(`   Make sure frontend dev server is running!`, 'yellow');
    return false;
  }
}

async function runAllTests() {
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║        XCHANGE PRODUCTION ENVIRONMENT TEST               ║', 'cyan');
  log('║        Testing Like a Real User Would                     ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');

  log(`\n📋 Test Configuration:`, 'blue');
  log(`   Backend API: ${API_URL}`, 'cyan');
  log(`   Frontend: ${FRONTEND_URL}`, 'cyan');
  log(`   Test Email (Individual): ${testData.individual.email}`, 'cyan');
  log(`   Test Email (Business): ${testData.business.email}`, 'cyan');

  const results = {
    total: 6,
    passed: 0,
    failed: 0
  };

  // Run tests sequentially
  if (await test1_IndividualRegistration()) results.passed++; else results.failed++;
  if (await test2_BusinessRegistration()) results.passed++; else results.failed++;
  if (await test3_Login()) results.passed++; else results.failed++;
  if (await test4_GetProfile()) results.passed++; else results.failed++;
  if (await test5_Logout()) results.passed++; else results.failed++;
  if (await test6_FrontendHealthCheck()) results.passed++; else results.failed++;

  // Summary
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    TEST SUMMARY                           ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');

  log(`\n📊 Results:`, 'blue');
  log(`   Total Tests: ${results.total}`, 'cyan');
  log(`   Passed: ${results.passed}`, results.passed === results.total ? 'green' : 'yellow');
  log(`   Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');

  if (results.passed === results.total) {
    log('\n🎉 ALL TESTS PASSED! Production environment is FULLY OPERATIONAL!', 'green');
    log('\n✅ What works:', 'green');
    log('   ✓ Individual user registration', 'cyan');
    log('   ✓ Business user registration', 'cyan');
    log('   ✓ Login authentication', 'cyan');
    log('   ✓ Protected API routes (JWT)', 'cyan');
    log('   ✓ Logout functionality', 'cyan');
    log('   ✓ Frontend server', 'cyan');
    log('\n👉 Next Step: Open your browser to http://localhost:3000', 'blue');
    log('   Try registering and logging in through the UI!', 'blue');
  } else {
    log('\n⚠️  Some tests failed. Check the output above for details.', 'yellow');
  }

  log('\n');
}

// Run the tests
runAllTests().catch(error => {
  log(`\n💥 Fatal Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
