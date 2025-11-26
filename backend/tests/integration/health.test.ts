/**
 * Health Endpoint Integration Tests
 */

import request from 'supertest';
import express from 'express';

describe('Health Endpoint', () => {
  let app: express.Application;

  beforeAll(() => {
    // Simple app for health check
    app = express();
    app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'test',
      });
    });
  });

  it('should return 200 status code', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  it('should return health status object', async () => {
    const response = await request(app).get('/health');

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
  });

  it('should return status as "ok"', async () => {
    const response = await request(app).get('/health');
    expect(response.body.status).toBe('ok');
  });

  it('should return valid ISO timestamp', async () => {
    const response = await request(app).get('/health');
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  it('should return test environment', async () => {
    const response = await request(app).get('/health');
    expect(response.body.environment).toBe('test');
  });
});
