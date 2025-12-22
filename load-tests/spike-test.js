/**
 * k6 Spike Test for Xchange Egypt API
 * اختبار الذروة - محاكاة حركة مرور مفاجئة
 *
 * Run: k6 run load-tests/spike-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const BASE_URL = __ENV.API_URL || 'http://localhost:4000/api/v1';

// Spike test - simulates sudden traffic surge
export const options = {
  stages: [
    { duration: '10s', target: 10 },     // Normal load
    { duration: '1m', target: 10 },      // Stay at normal
    { duration: '10s', target: 1000 },   // SPIKE to 1000 users!
    { duration: '3m', target: 1000 },    // Stay at spike
    { duration: '10s', target: 10 },     // Back to normal
    { duration: '1m', target: 10 },      // Stay at normal
    { duration: '10s', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<3000'], // 99% should be under 3s even in spike
    errors: ['rate<0.3'],               // Less than 30% errors
  },
};

export default function() {
  group('Spike Test Requests', () => {
    // Critical paths that users would access during spike
    const requests = [
      http.get(`${BASE_URL}/health`),
      http.get(`${BASE_URL}/categories`),
      http.get(`${BASE_URL}/listings?limit=10`),
    ];

    for (const res of requests) {
      const success = check(res, {
        'status is OK': (r) => r.status >= 200 && r.status < 500,
      });
      errorRate.add(!success);
    }
  });

  sleep(0.1); // Aggressive pacing during spike
}

export function handleSummary(data) {
  const httpDuration = data.metrics.http_req_duration?.values || {};
  const httpFailed = data.metrics.http_req_failed?.values || {};

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║               Xchange Egypt Spike Test Results                 ║
╠════════════════════════════════════════════════════════════════╣
║  Total Requests:     ${data.metrics.http_reqs?.values?.count || 'N/A'}
║  Failure Rate:       ${((httpFailed.rate || 0) * 100).toFixed(2)}%
║  Avg Response Time:  ${(httpDuration.avg || 0).toFixed(2)}ms
║  P95 Response Time:  ${(httpDuration['p(95)'] || 0).toFixed(2)}ms
║  P99 Response Time:  ${(httpDuration['p(99)'] || 0).toFixed(2)}ms
║  Max Response Time:  ${(httpDuration.max || 0).toFixed(2)}ms
╚════════════════════════════════════════════════════════════════╝

Spike Recovery Analysis:
- System handled ${data.metrics.http_reqs?.values?.count || 0} requests
- Error rate during spike: ${((httpFailed.rate || 0) * 100).toFixed(2)}%
- Max response time: ${(httpDuration.max || 0).toFixed(0)}ms
`);

  return {
    'load-tests/results/spike-test-summary.json': JSON.stringify(data, null, 2),
  };
}
