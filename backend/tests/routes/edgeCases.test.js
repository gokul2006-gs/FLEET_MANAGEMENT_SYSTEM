import { jest } from '@jest/globals';
import request from 'supertest';

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { verify: jest.fn(), sign: jest.fn(() => 'mock-token') },
}));

jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: {
    findById: jest.fn().mockResolvedValue({ _id: 'user-1', name: 'Test' }),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/models/Order.js', () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/models/Vehicle.js', () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/models/Driver.js', () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/models/Route.js', () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/models/Notification.js', () => ({
  default: {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/services/optimizationService.js', () => ({
  runOptimization: jest.fn(),
  benchmarkAlgorithms: jest.fn(),
}));

// ─── Imports ─────────────────────────────────────────────────────────────────

const jwt = (await import('jsonwebtoken')).default;
const User = (await import('../../src/models/User.js')).default;
const Order = (await import('../../src/models/Order.js')).default;
const Vehicle = (await import('../../src/models/Vehicle.js')).default;
const Driver = (await import('../../src/models/Driver.js')).default;
const Route = (await import('../../src/models/Route.js')).default;
const Notification = (await import('../../src/models/Notification.js')).default;
const { createApp } = await import('../../src/app.js');

const app = createApp();

function authHeader() {
  jwt.verify.mockReturnValue({ id: 'user-1' });
  return 'Bearer test-token';
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Edge Cases — Malformed IDs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  const malformedIds = [
    { id: 'not-a-valid-id', label: 'plain string' },
    { id: '12345', label: 'numeric string' },
    { id: '', label: 'empty string' },
    { id: '!@#$%^&*()', label: 'special characters' },
    { id: '../../etc/passwd', label: 'path traversal' },
    { id: 'ObjectId("507f1f77bcf86cd799439011")', label: 'stringified ObjectId call' },
  ];

  for (const { id, label } of malformedIds) {
    test(`GET /api/orders/:id with ${label}`, async () => {
      Order.findById.mockImplementation(() => {
        throw new Error(`Cast to ObjectId failed for value "${id}" at path "_id"`);
      });

      const res = await request(app)
        .get(`/api/orders/${encodeURIComponent(id)}`)
        .set('Authorization', authHeader());

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    test(`PUT /api/orders/:id with ${label}`, async () => {
      Order.findByIdAndUpdate.mockImplementation(() => {
        throw new Error(`Cast to ObjectId failed for value "${id}" at path "_id"`);
      });

      const res = await request(app)
        .put(`/api/orders/${encodeURIComponent(id)}`)
        .set('Authorization', authHeader())
        .send({ customerName: 'Test' });

      // Empty ID may 404 (Express routing), others catch CastError → 400/500
      expect([400, 404, 500]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    test(`DELETE /api/orders/:id with ${label}`, async () => {
      Order.findByIdAndDelete.mockImplementation(() => {
        throw new Error(`Cast to ObjectId failed for value "${id}" at path "_id"`);
      });

      const res = await request(app)
        .delete(`/api/orders/${encodeURIComponent(id)}`)
        .set('Authorization', authHeader());

      expect([400, 404, 500]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  }

  test('GET /api/vehicles/:id with malformed id returns error', async () => {
    Vehicle.findById.mockReturnValue({
      populate: jest.fn().mockImplementation(() => {
        throw new Error('Cast to ObjectId failed');
      }),
    });

    const res = await request(app)
      .get('/api/vehicles/not-valid-id')
      .set('Authorization', authHeader());

    expect([400, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/drivers/:id with malformed id returns error', async () => {
    Driver.findById.mockReturnValue({
      populate: jest.fn().mockImplementation(() => {
        throw new Error('Cast to ObjectId failed');
      }),
    });

    const res = await request(app)
      .get('/api/drivers/not-valid-id')
      .set('Authorization', authHeader());

    expect([400, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

describe('Edge Cases — Database Failures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('GET /api/orders returns 500 when DB query fails', async () => {
    Order.countDocuments.mockRejectedValue(new Error('MongoNetworkError: connection refused'));

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', authHeader());

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/connection refused/i);
  });

  test('POST /api/orders returns 400 when create throws validation error', async () => {
    Order.create.mockRejectedValue(new Error('Order validation failed: latitude is required'));

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', authHeader())
      .send({
        customerName: 'Test',
        address: '123 Main St',
        latitude: 28.6,
        longitude: 77.2,
        packageWeight: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('PUT /api/orders returns 400 when update throws', async () => {
    Order.findByIdAndUpdate.mockRejectedValue(new Error('E11000 duplicate key error'));

    const res = await request(app)
      .put('/api/orders/order-1')
      .set('Authorization', authHeader())
      .send({ customerName: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('DELETE /api/orders returns 500 when delete fails', async () => {
    Order.findByIdAndDelete.mockRejectedValue(new Error('MongoTimeoutError'));

    const res = await request(app)
      .delete('/api/orders/order-1')
      .set('Authorization', authHeader());

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/orders/bulk-assign returns 500 when updateMany fails', async () => {
    Order.updateMany.mockRejectedValue(new Error('Bulk write error'));

    const res = await request(app)
      .post('/api/orders/bulk-assign')
      .set('Authorization', authHeader())
      .send({ orderIds: ['o-1'], vehicleId: 'v-1' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/vehicles returns 500 when countDocuments fails', async () => {
    Vehicle.countDocuments.mockRejectedValue(new Error('ReplicaSetNoPrimary'));

    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', authHeader());

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/drivers returns 400 when create throws duplicate key', async () => {
    Driver.create.mockRejectedValue(new Error('E11000 duplicate key error collection: drivers'));

    const res = await request(app)
      .post('/api/drivers')
      .set('Authorization', authHeader())
      .send({ name: 'Raj', phone: '+91-9876543210', licenseNumber: 'DL-001' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/routes returns 500 when countDocuments fails', async () => {
    Route.countDocuments.mockRejectedValue(new Error('Aggregation pipeline error'));

    const res = await request(app)
      .get('/api/routes')
      .set('Authorization', authHeader());

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/routes/stats returns 500 when aggregate fails', async () => {
    Route.aggregate.mockRejectedValue(new Error('Permission denied'));

    const res = await request(app)
      .get('/api/routes/stats')
      .set('Authorization', authHeader());

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/notifications returns 500 when countDocuments fails', async () => {
    Notification.countDocuments.mockRejectedValue(new Error('Connection pool exhausted'));

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', authHeader());

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/analytics/dashboard returns 500 when Promise.all rejects', async () => {
    Vehicle.countDocuments.mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', authHeader());

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('Edge Cases — Invalid Request Bodies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('POST /api/orders with empty body returns 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', authHeader())
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/orders with wrong types returns 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', authHeader())
      .send({
        customerName: 12345,
        address: true,
        latitude: 'not-a-number',
        longitude: null,
        packageWeight: 'heavy',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/orders with latitude out of range returns 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', authHeader())
      .send({
        customerName: 'Test',
        address: 'Test St',
        latitude: 999,
        longitude: 77.2,
        packageWeight: 1,
      });

    expect(res.status).toBe(400);
  });

  test('POST /api/orders with negative packageWeight returns 400', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', authHeader())
      .send({
        customerName: 'Test',
        address: 'Test St',
        latitude: 28.6,
        longitude: 77.2,
        packageWeight: -5,
      });

    expect(res.status).toBe(400);
  });

  test('POST /api/vehicles with empty body returns 400', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', authHeader())
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/vehicles with negative capacity returns 400', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', authHeader())
      .send({ vehicleNumber: 'DL-01', capacity: -100 });

    expect(res.status).toBe(400);
  });

  test('POST /api/drivers with empty body returns 400', async () => {
    const res = await request(app)
      .post('/api/drivers')
      .set('Authorization', authHeader())
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register with empty body returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/auth/login with empty body returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/optimization/compare with no locations returns 400', async () => {
    const res = await request(app)
      .post('/api/optimization/compare')
      .set('Authorization', authHeader())
      .send({ locations: [] });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 2/i);
  });

  test('POST /api/optimization/compare with single location returns 400', async () => {
    const res = await request(app)
      .post('/api/optimization/compare')
      .set('Authorization', authHeader())
      .send({
        locations: [{ id: 'A', latitude: 28.6, longitude: 77.2 }],
      });

    expect(res.status).toBe(400);
  });

  test('POST /api/orders/bulk-assign with empty orderIds succeeds gracefully', async () => {
    Order.updateMany.mockResolvedValue({ modifiedCount: 0 });

    const res = await request(app)
      .post('/api/orders/bulk-assign')
      .set('Authorization', authHeader())
      .send({ orderIds: [], vehicleId: 'v-1' });

    expect(res.status).toBe(200);
    expect(res.body.data.modifiedCount).toBe(0);
  });
});

describe('Edge Cases — Invalid Query Parameters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('GET /api/orders with negative page number', async () => {
    Order.countDocuments.mockResolvedValue(0);
    Order.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app)
      .get('/api/orders?page=-1')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/orders with very large page number', async () => {
    Order.countDocuments.mockResolvedValue(5);
    Order.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app)
      .get('/api/orders?page=99999')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body.pagination.pages).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/orders with zero limit', async () => {
    Order.countDocuments.mockResolvedValue(0);
    Order.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app)
      .get('/api/orders?limit=0')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
  });

  test('GET /api/orders with non-numeric page', async () => {
    Order.countDocuments.mockResolvedValue(0);
    Order.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app)
      .get('/api/orders?page=abc')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
  });

  test('GET /api/vehicles with unknown status value', async () => {
    Vehicle.countDocuments.mockResolvedValue(0);
    Vehicle.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app)
      .get('/api/vehicles?status=nonexistent')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('GET /api/orders with search param containing regex special chars', async () => {
    Order.countDocuments.mockResolvedValue(0);
    Order.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app)
      .get('/api/orders?search=[test]+%26%26')
      .set('Authorization', authHeader());

    expect(res.status).toBe(200);
  });

  test('GET /api/analytics/dashboard with no auth returns 401', async () => {
    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  test('GET /api/analytics/routes with no auth returns 401', async () => {
    const res = await request(app).get('/api/analytics/routes');

    expect(res.status).toBe(401);
  });
});

describe('Edge Cases — Authentication Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('PUT /api/auth/profile with empty name still calls update', async () => {
    const updated = { _id: 'user-1', name: '', email: 'john@example.com' };
    jwt.verify.mockReturnValue({ id: 'user-1' });
    User.findById.mockResolvedValue({ _id: 'user-1' });
    User.findByIdAndUpdate.mockResolvedValue(updated);

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', 'Bearer valid-token')
      .send({ name: '' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/auth/profile with expired token returns 401', async () => {
    jwt.verify.mockImplementation(() => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';
      throw err;
    });

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer expired-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/token invalid/i);
  });

  test('GET /api/auth/profile with malformed token returns 401', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer not.a.jwt');

    expect(res.status).toBe(401);
  });

  test('GET /api/auth/profile with wrong secret returns 401', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer wrong-secret-token');

    expect(res.status).toBe(401);
  });

  test('POST /api/auth/register with whitespace-only name returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: '   ',
        email: 'john@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register with extremely long email returns 400', async () => {
    const longEmail = 'a'.repeat(300) + '@example.com';

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John',
        email: longEmail,
        password: 'password123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Edge Cases — Global Error Handler and 404', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('GET /api/nonexistent returns 404 with proper message', async () => {
    const res = await request(app).get('/api/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });

  test('POST /api/nonexistent returns 404', async () => {
    const res = await request(app).post('/api/nonexistent').send({});

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('PUT /api/nonexistent returns 404', async () => {
    const res = await request(app).put('/api/nonexistent').send({});

    expect(res.status).toBe(404);
  });

  test('DELETE /api/nonexistent returns 404', async () => {
    const res = await request(app).delete('/api/nonexistent');

    expect(res.status).toBe(404);
  });

  test('GET / completely unknown path returns 404', async () => {
    const res = await request(app).get('/totally/unknown/path');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('Global error handler is wired up (health check works)', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
  });
});

describe('Edge Cases — CORS Headers', () => {
  test('OPTIONS preflight returns CORS headers', async () => {
    const res = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET');

    // CORS preflight returns 204 No Content per spec
    expect([200, 204]).toContain(res.status);
  });

  test('GET request includes CORS header for allowed origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});

describe('Edge Cases — Validation Response Format', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('POST /api/auth/register returns structured validation errors', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);

    for (const err of res.body.errors) {
      expect(err).toHaveProperty('field');
      expect(err).toHaveProperty('message');
    }
  });

  test('POST /api/auth/login returns structured validation errors', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test('POST /api/orders returns multiple validation errors at once', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', authHeader())
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Edge Cases — Response Shape Consistency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('GET /api/health always returns success + message + timestamp', async () => {
    const res = await request(app).get('/api/health');

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('timestamp');
    expect(typeof res.body.timestamp).toBe('string');
  });

  test('Error responses always include success: false', async () => {
    const res = await request(app).get('/api/nonexistent');

    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('message');
  });

  test('404 responses include success: false and message', async () => {
    const res = await request(app).get('/api/nonexistent');

    expect(res.body.success).toBe(false);
    expect(typeof res.body.message).toBe('string');
  });
});
