import { jest } from '@jest/globals';
import request from 'supertest';

// Minimal mocks needed for app.js imports
jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: {},
}));

const { createApp } = await import('../../src/app.js');

const app = createApp();

describe('Health Check', () => {
  test('GET /api/health returns success with timestamp', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('SmartRoute API is running');
    expect(res.body.timestamp).toBeDefined();
  });

  test('returns 404 for unknown API routes', async () => {
    const res = await request(app).get('/api/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });

  test('returns 404 for unknown non-API routes', async () => {
    const res = await request(app).get('/some/random/path');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
