/**
 * k6 Stress Test for Xchange Egypt API
 * اختبار الإجهاد للـ API - لاكتشاف نقطة الانهيار
 *
 * Run: k6 run load-tests/stress-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const requestCount = new Counter('requests');

const BASE_URL = __ENV.API_URL || 'http://localhost:4000/api/v1';

// Stress test - keeps increasing load until breaking point
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Warm up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 for 5 minutes
    { duration: '2m', target: 200 },   // Push to 200 users
    { duration: '5m', target: 200 },   // Stay at 200
    { duration: '2m', target: 300 },   // Push to 300 users
    { duration: '5m', target: 300 },   // Stay at 300
    { duration: '2m', target: 400 },   // Push to 400 users (potential breaking point)
    { duration: '5m', target: 400 },   // Stay at 400
    { duration: '5m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.5'],      // Allow up to 50% failure to find breaking point
    http_req_duration: ['p(99)<5000'],  // 99% of requests should be under 5s
  },
};

const ENDPOINTS = [
  { path: '/health', weight: 1 },
  { path: '/categories', weight: 2 },
  { path: '/listings?limit=20', weight: 3 },
  { path: '/search?q=سيارة&limit=10', weight: 4 },
  { path: '/search?q=شقة&limit=10', weight: 4 },
];

function getWeightedEndpoint() {
  const totalWeight = ENDPOINTS.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;

  for (const endpoint of ENDPOINTS) {
    random -= endpoint.weight;
    if (random <= 0) return endpoint.path;
  }

  return ENDPOINTS[0].path;
}

export default function() {
  const endpoint = getWeightedEndpoint();

  group('API Request', () => {
    const res = http.get(`${BASE_URL}${endpoint}`);

    requestCount.add(1);

    const success = check(res, {
      'status is 2xx': (r) => r.status >= 200 && r.status < 300,
      'response time < 2s': (r) => r.timings.duration < 2000,
    });

    errorRate.add(!success);
  });

  sleep(Math.random() * 2); // Random sleep between 0-2 seconds
}

export function handleSummary(data) {
  const httpDuration = data.metrics.http_req_duration?.values || {};
  const httpFailed = data.metrics.http_req_failed?.values || {};

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              Xchange Egypt Stress Test Results                 ║
╠════════════════════════════════════════════════════════════════╣
║  Total Requests:     ${data.metrics.http_reqs?.values?.count || 'N/A'}
║  Failure Rate:       ${((httpFailed.rate || 0) * 100).toFixed(2)}%
║  Avg Response Time:  ${(httpDuration.avg || 0).toFixed(2)}ms
║  P95 Response Time:  ${(httpDuration['p(95)'] || 0).toFixed(2)}ms
║  Max Response Time:  ${(httpDuration.max || 0).toFixed(2)}ms
╚════════════════════════════════════════════════════════════════╝

Breaking Point Analysis:
- If failure rate > 10%, the system is stressed
- If failure rate > 30%, the system is at breaking point
- Current failure rate: ${((httpFailed.rate || 0) * 100).toFixed(2)}%
`);

  return {
    'load-tests/results/stress-test-summary.json': JSON.stringify(data, null, 2),
  };
}
