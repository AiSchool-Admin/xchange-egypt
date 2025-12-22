/**
 * k6 Load Testing Script for Xchange Egypt API
 * اختبارات الحمل للـ API
 *
 * Run: k6 run load-tests/api-load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const searchLatency = new Trend('search_latency');
const listingLatency = new Trend('listing_latency');
const authLatency = new Trend('auth_latency');

// Configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:4000/api/v1';

// Load test options
export const options = {
  stages: [
    // Ramp up
    { duration: '1m', target: 10 },   // 10 users for 1 minute
    { duration: '2m', target: 50 },   // 50 users for 2 minutes
    { duration: '3m', target: 100 },  // 100 users for 3 minutes (peak)
    { duration: '2m', target: 50 },   // Scale down
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% requests under 500ms
    errors: ['rate<0.1'],                            // Error rate under 10%
    search_latency: ['p(95)<300'],                   // Search under 300ms
    listing_latency: ['p(95)<200'],                  // Listing under 200ms
  },
};

// Test data
const SEARCH_TERMS = ['آيفون', 'سامسونج', 'لابتوب', 'سيارة', 'شقة', 'ذهب', 'موبايل'];
const CATEGORIES = ['electronics', 'cars', 'property', 'gold', 'mobiles'];
const GOVERNORATES = ['Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Sharqia'];

// Helper to get random item from array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function() {
  // Health Check
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/health`);
    check(res, {
      'health check status 200': (r) => r.status === 200,
    });
    errorRate.add(res.status !== 200);
  });

  // Search API
  group('Search API', () => {
    const searchTerm = randomItem(SEARCH_TERMS);
    const startTime = Date.now();

    const res = http.get(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}&limit=20`);

    searchLatency.add(Date.now() - startTime);

    check(res, {
      'search status 200': (r) => r.status === 200,
      'search returns array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.data) || Array.isArray(body.listings);
        } catch {
          return false;
        }
      },
    });
    errorRate.add(res.status !== 200);
  });

  sleep(1);

  // Category Listings
  group('Category Listings', () => {
    const category = randomItem(CATEGORIES);
    const startTime = Date.now();

    const res = http.get(`${BASE_URL}/categories/${category}/listings?limit=20`);

    listingLatency.add(Date.now() - startTime);

    check(res, {
      'category listings status 200': (r) => r.status === 200,
      'has pagination info': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.total !== undefined || body.pagination !== undefined;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(res.status !== 200);
  });

  sleep(0.5);

  // Filtered Search
  group('Filtered Search', () => {
    const governorate = randomItem(GOVERNORATES);
    const minPrice = Math.floor(Math.random() * 10000);
    const maxPrice = minPrice + Math.floor(Math.random() * 50000);

    const res = http.get(
      `${BASE_URL}/search?governorate=${governorate}&minPrice=${minPrice}&maxPrice=${maxPrice}&limit=20`
    );

    check(res, {
      'filtered search status 200': (r) => r.status === 200,
    });
    errorRate.add(res.status !== 200);
  });

  sleep(0.5);

  // Single Listing Details
  group('Listing Details', () => {
    // First get a list of listings
    const listRes = http.get(`${BASE_URL}/listings?limit=5`);

    if (listRes.status === 200) {
      try {
        const body = JSON.parse(listRes.body);
        const listings = body.data || body.listings || [];

        if (listings.length > 0) {
          const listing = randomItem(listings);
          const startTime = Date.now();

          const detailRes = http.get(`${BASE_URL}/listings/${listing.id}`);

          listingLatency.add(Date.now() - startTime);

          check(detailRes, {
            'listing detail status 200': (r) => r.status === 200,
            'has listing title': (r) => {
              try {
                const detail = JSON.parse(r.body);
                return detail.title !== undefined;
              } catch {
                return false;
              }
            },
          });
          errorRate.add(detailRes.status !== 200);
        }
      } catch (e) {
        console.log('Error parsing listings:', e);
      }
    }
  });

  sleep(1);

  // Categories API
  group('Categories API', () => {
    const res = http.get(`${BASE_URL}/categories`);

    check(res, {
      'categories status 200': (r) => r.status === 200,
      'has categories': (r) => {
        try {
          const body = JSON.parse(r.body);
          return (body.data && body.data.length > 0) || (body.categories && body.categories.length > 0);
        } catch {
          return false;
        }
      },
    });
    errorRate.add(res.status !== 200);
  });

  sleep(0.5);

  // Gold/Silver Prices (if available)
  group('Gold Prices API', () => {
    const res = http.get(`${BASE_URL}/gold/prices`);

    // This might 404 if not implemented, which is okay
    if (res.status === 200) {
      check(res, {
        'gold prices has data': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.price !== undefined || body.prices !== undefined;
          } catch {
            return false;
          }
        },
      });
    }
  });

  sleep(1);
}

// Summary handler
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-tests/results/summary.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, opts) {
  const checks = data.metrics.checks;
  const httpReqs = data.metrics.http_reqs;
  const httpDuration = data.metrics.http_req_duration;

  return `
╔══════════════════════════════════════════════════════════════╗
║             Xchange Egypt Load Test Results                  ║
╠══════════════════════════════════════════════════════════════╣
║  Total Requests:     ${httpReqs?.values?.count || 'N/A'}
║  Request Rate:       ${(httpReqs?.values?.rate || 0).toFixed(2)}/s
║  Avg Duration:       ${(httpDuration?.values?.avg || 0).toFixed(2)}ms
║  P95 Duration:       ${(httpDuration?.values['p(95)'] || 0).toFixed(2)}ms
║  P99 Duration:       ${(httpDuration?.values['p(99)'] || 0).toFixed(2)}ms
║  Success Rate:       ${((checks?.values?.passes / (checks?.values?.passes + checks?.values?.fails)) * 100 || 0).toFixed(2)}%
╚══════════════════════════════════════════════════════════════╝
`;
}
