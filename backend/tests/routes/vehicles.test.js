import { jest } from '@jest/globals';
import request from 'supertest';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { verify: jest.fn(), sign: jest.fn(() => 'mock-token') },
}));

jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: { findById: jest.fn().mockResolvedValue({ _id: 'user-1', name: 'Test' }) },
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

const jwt = (await import('jsonwebtoken')).default;
const Vehicle = (await import('../../src/models/Vehicle.js')).default;
const { createApp } = await import('../../src/app.js');

const app = createApp();

function authHeader() {
  jwt.verify.mockReturnValue({ id: 'user-1' });
  return 'Bearer test-token';
}

describe('Vehicle Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /api/vehicles', () => {
    test('creates a vehicle with valid data', async () => {
      const data = { vehicleNumber: 'DL-01-AB-1234', capacity: 500 };
      Vehicle.create.mockResolvedValue({ _id: 'v-1', ...data, status: 'idle' });

      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', authHeader())
        .send(data);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(Vehicle.create).toHaveBeenCalled();
    });

    test('returns 400 when vehicleNumber is missing', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', authHeader())
        .send({ capacity: 500 });

      expect(res.status).toBe(400);
    });

    test('returns 400 when capacity is missing', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', authHeader())
        .send({ vehicleNumber: 'DL-01-AB-1234' });

      expect(res.status).toBe(400);
    });

    test('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .send({ vehicleNumber: 'DL-01-AB-1234', capacity: 500 });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/vehicles', () => {
    test('returns paginated vehicles', async () => {
      const mockVehicles = [
        { _id: 'v-1', vehicleNumber: 'DL-01-AB-1234' },
      ];

      Vehicle.countDocuments.mockResolvedValue(1);
      Vehicle.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockVehicles),
      });

      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    test('filters by status', async () => {
      Vehicle.countDocuments.mockResolvedValue(0);
      Vehicle.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });

      await request(app)
        .get('/api/vehicles?status=active')
        .set('Authorization', authHeader());

      expect(Vehicle.find).toHaveBeenCalledWith(expect.objectContaining({ status: 'active' }));
    });
  });

  describe('GET /api/vehicles/stats', () => {
    test('returns vehicle stats', async () => {
      const mockStats = [
        { _id: 'active', count: 3, totalCapacity: 1500, avgLoad: 200 },
        { _id: 'idle', count: 2, totalCapacity: 1000, avgLoad: 0 },
      ];
      Vehicle.aggregate.mockResolvedValue(mockStats);

      const res = await request(app)
        .get('/api/vehicles/stats')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockStats);
    });
  });

  describe('GET /api/vehicles/:id', () => {
    test('returns vehicle by id', async () => {
      Vehicle.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'v-1', vehicleNumber: 'DL-01' }),
      });

      const res = await request(app)
        .get('/api/vehicles/v-1')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
    });

    test('returns 404 when not found', async () => {
      Vehicle.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .get('/api/vehicles/nonexistent')
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    test('updates a vehicle', async () => {
      Vehicle.findByIdAndUpdate.mockResolvedValue({ _id: 'v-1', capacity: 800 });

      const res = await request(app)
        .put('/api/vehicles/v-1')
        .set('Authorization', authHeader())
        .send({ capacity: 800 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('returns 404 when not found', async () => {
      Vehicle.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/vehicles/nonexistent')
        .set('Authorization', authHeader())
        .send({ capacity: 800 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    test('deletes a vehicle', async () => {
      Vehicle.findByIdAndDelete.mockResolvedValue({ _id: 'v-1' });

      const res = await request(app)
        .delete('/api/vehicles/v-1')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
    });

    test('returns 404 when not found', async () => {
      Vehicle.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/vehicles/nonexistent')
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
    });
  });
});
