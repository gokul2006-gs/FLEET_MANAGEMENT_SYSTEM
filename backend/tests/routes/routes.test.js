import { jest } from '@jest/globals';
import request from 'supertest';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { verify: jest.fn(), sign: jest.fn(() => 'mock-token') },
}));

jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: { findById: jest.fn().mockResolvedValue({ _id: 'user-1', name: 'Test' }) },
}));

jest.unstable_mockModule('../../src/models/Route.js', () => ({
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

jest.unstable_mockModule('../../src/models/Order.js', () => ({
  default: {
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
  },
}));

jest.unstable_mockModule('../../src/models/Vehicle.js', () => ({
  default: {
    findByIdAndUpdate: jest.fn().mockResolvedValue({}),
  },
}));

const jwt = (await import('jsonwebtoken')).default;
const Route = (await import('../../src/models/Route.js')).default;
const Order = (await import('../../src/models/Order.js')).default;
const Vehicle = (await import('../../src/models/Vehicle.js')).default;
const { createApp } = await import('../../src/app.js');

const app = createApp();

function authHeader() {
  jwt.verify.mockReturnValue({ id: 'user-1' });
  return 'Bearer test-token';
}

describe('Route Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /api/routes', () => {
    test('creates a route', async () => {
      const data = { vehicle: 'v-1', stops: [], totalDistance: 25.5 };
      Route.create.mockResolvedValue({ _id: 'r-1', ...data, status: 'planned' });

      const res = await request(app)
        .post('/api/routes')
        .set('Authorization', authHeader())
        .send(data);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/routes', () => {
    test('returns paginated routes', async () => {
      Route.countDocuments.mockResolvedValue(1);
      Route.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ _id: 'r-1', routeId: 'R-001' }]),
      });

      const res = await request(app)
        .get('/api/routes')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/routes/stats', () => {
    test('returns route stats', async () => {
      const mockStats = [
        { _id: 'planned', count: 5, totalDistance: 100, totalDuration: 200, avgProgress: 0 },
        { _id: 'active', count: 2, totalDistance: 50, totalDuration: 100, avgProgress: 50 },
      ];
      Route.aggregate.mockResolvedValue(mockStats);

      const res = await request(app)
        .get('/api/routes/stats')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockStats);
    });
  });

  describe('GET /api/routes/:id', () => {
    test('returns route by id', async () => {
      Route.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then: (resolve) => resolve({ _id: 'r-1', routeId: 'R-001', stops: [] }),
      });

      const res = await request(app)
        .get('/api/routes/r-1')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
    });

    test('returns 404 when not found', async () => {
      Route.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        then: (resolve) => resolve(null),
      });

      const res = await request(app)
        .get('/api/routes/nonexistent')
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/routes/:id', () => {
    test('updates a route', async () => {
      Route.findByIdAndUpdate.mockResolvedValue({ _id: 'r-1', status: 'active' });

      const res = await request(app)
        .put('/api/routes/r-1')
        .set('Authorization', authHeader())
        .send({ status: 'active' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('returns 404 when not found', async () => {
      Route.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/routes/nonexistent')
        .set('Authorization', authHeader())
        .send({ status: 'active' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/routes/:id', () => {
    test('deletes a route and unassigns orders', async () => {
      Route.findByIdAndDelete.mockResolvedValue({ _id: 'r-1' });

      const res = await request(app)
        .delete('/api/routes/r-1')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
      expect(Order.updateMany).toHaveBeenCalled();
    });

    test('returns 404 when not found', async () => {
      Route.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/routes/nonexistent')
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/routes/:id/publish', () => {
    test('publishes a route and activates vehicle + orders', async () => {
      const mockRoute = {
        _id: 'r-1',
        status: 'planned',
        vehicle: 'v-1',
        stops: [
          { order: 'order-1' },
          { order: 'order-2' },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      Route.findById.mockResolvedValue(mockRoute);

      const res = await request(app)
        .post('/api/routes/r-1/publish')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/published/i);
      expect(mockRoute.status).toBe('active');
      expect(mockRoute.startTime).toBeDefined();
      expect(mockRoute.save).toHaveBeenCalled();
      expect(Vehicle.findByIdAndUpdate).toHaveBeenCalledWith('v-1', expect.objectContaining({ status: 'active' }));
      expect(Order.updateMany).toHaveBeenCalled();
    });

    test('returns 404 when route not found', async () => {
      Route.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/routes/nonexistent/publish')
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/routes/:id/reorder', () => {
    test('reorders stops in a route', async () => {
      const mockRoute = {
        _id: 'r-1',
        stops: [
          { order: 'order-1', sequence: 1, toObject: () => ({ order: 'order-1', sequence: 1 }) },
          { order: 'order-2', sequence: 2, toObject: () => ({ order: 'order-2', sequence: 2 }) },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      Route.findById.mockResolvedValue(mockRoute);

      const res = await request(app)
        .put('/api/routes/r-1/reorder')
        .set('Authorization', authHeader())
        .send({ stops: [{ order: 'order-2' }, { order: 'order-1' }] });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/reordered/i);
      expect(mockRoute.save).toHaveBeenCalled();
    });

    test('returns 404 when route not found', async () => {
      Route.findById.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/routes/nonexistent/reorder')
        .set('Authorization', authHeader())
        .send({ stops: [] });

      expect(res.status).toBe(404);
    });
  });
});
