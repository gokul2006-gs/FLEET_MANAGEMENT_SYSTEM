import { jest } from '@jest/globals';
import request from 'supertest';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { verify: jest.fn(), sign: jest.fn(() => 'mock-token') },
}));

jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: { findById: jest.fn().mockResolvedValue({ _id: 'user-1', name: 'Test' }) },
}));

jest.unstable_mockModule('../../src/models/Order.js', () => ({
  default: {
    countDocuments: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue([]),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      then: (resolve) => resolve([]),
    }),
  },
}));

jest.unstable_mockModule('../../src/models/Vehicle.js', () => ({
  default: {
    countDocuments: jest.fn().mockResolvedValue(0),
    find: jest.fn().mockResolvedValue([]),
  },
}));

jest.unstable_mockModule('../../src/models/Driver.js', () => ({
  default: {
    countDocuments: jest.fn().mockResolvedValue(0),
  },
}));

jest.unstable_mockModule('../../src/models/Route.js', () => ({
  default: {
    countDocuments: jest.fn().mockResolvedValue(0),
    find: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      then: (resolve) => resolve([]),
    }),
    aggregate: jest.fn().mockResolvedValue([]),
  },
}));

const jwt = (await import('jsonwebtoken')).default;
const { createApp } = await import('../../src/app.js');

const app = createApp();

function authHeader() {
  jwt.verify.mockReturnValue({ id: 'user-1' });
  return 'Bearer test-token';
}

describe('Analytics Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('GET /api/analytics/dashboard', () => {
    test('returns dashboard KPIs', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpis).toBeDefined();
      expect(res.body.data.kpis.totalVehicles).toBe(0);
      expect(res.body.data.kpis.activeRoutes).toBe(0);
    });

    test('returns 401 without auth', async () => {
      const res = await request(app).get('/api/analytics/dashboard');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/analytics/routes', () => {
    test('returns route analytics', async () => {
      const res = await request(app)
        .get('/api/analytics/routes')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.totalRoutes).toBe(0);
    });
  });

  describe('GET /api/analytics/performance', () => {
    test('returns performance data', async () => {
      const res = await request(app)
        .get('/api/analytics/performance')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.plannedVsActual).toBeDefined();
      expect(res.body.data.performanceByAlgorithm).toBeDefined();
    });
  });
});
