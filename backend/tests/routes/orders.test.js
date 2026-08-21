import { jest } from '@jest/globals';
import request from 'supertest';

// Mock dependencies
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn(),
    sign: jest.fn(() => 'mock-token'),
  },
}));

jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: {
    findById: jest.fn().mockResolvedValue({ _id: 'user-1', name: 'Test User' }),
  },
}));

jest.unstable_mockModule('../../src/models/Order.js', () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

const jwt = (await import('jsonwebtoken')).default;
const Order = (await import('../../src/models/Order.js')).default;
const { createApp } = await import('../../src/app.js');

const app = createApp();

function authHeader() {
  jwt.verify.mockReturnValue({ id: 'user-1' });
  return 'Bearer test-token';
}

describe('Order Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /api/orders', () => {
    test('creates an order with valid data', async () => {
      const orderData = {
        customerName: 'Jane Smith',
        address: '123 Main St, Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        packageWeight: 2.5,
      };

      Order.create.mockResolvedValue({ _id: 'order-1', ...orderData, status: 'pending' });

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', authHeader())
        .send(orderData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(Order.create).toHaveBeenCalled();
    });

    test('returns 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customerName: 'Test',
          address: 'Test',
          latitude: 28.6,
          longitude: 77.2,
          packageWeight: 1,
        });

      expect(res.status).toBe(401);
    });

    test('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', authHeader())
        .send({ customerName: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('returns 400 when latitude is out of range', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', authHeader())
        .send({
          customerName: 'Test',
          address: 'Test',
          latitude: 999,
          longitude: 77.2,
          packageWeight: 1,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/orders', () => {
    test('returns paginated orders', async () => {
      const mockOrders = [
        { _id: 'order-1', customerName: 'Alice' },
        { _id: 'order-2', customerName: 'Bob' },
      ];

      Order.countDocuments.mockResolvedValue(2);
      Order.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockOrders),
      });

      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(2);
    });

    test('filters by status query param', async () => {
      Order.countDocuments.mockResolvedValue(0);
      Order.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });

      const res = await request(app)
        .get('/api/orders?status=pending')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      // Verify that find was called with a status filter
      expect(Order.find).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending' }));
    });
  });

  describe('GET /api/orders/:id', () => {
    test('returns order by id', async () => {
      const mockOrder = { _id: 'order-1', customerName: 'Alice', status: 'pending' };
      Order.findById.mockResolvedValue(mockOrder);

      const res = await request(app)
        .get('/api/orders/order-1')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('returns 404 when order not found', async () => {
      Order.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/orders/nonexistent')
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });

  describe('PUT /api/orders/:id', () => {
    test('updates an order', async () => {
      const updated = { _id: 'order-1', customerName: 'Updated', status: 'pending' };
      Order.findByIdAndUpdate.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/orders/order-1')
        .set('Authorization', authHeader())
        .send({ customerName: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('returns 404 when order not found', async () => {
      Order.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/orders/nonexistent')
        .set('Authorization', authHeader())
        .send({ customerName: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    test('deletes an order', async () => {
      Order.findByIdAndDelete.mockResolvedValue({ _id: 'order-1' });

      const res = await request(app)
        .delete('/api/orders/order-1')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
    });

    test('returns 404 when order not found', async () => {
      Order.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/orders/nonexistent')
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/orders/bulk-assign', () => {
    test('bulk assigns orders to a vehicle', async () => {
      Order.updateMany.mockResolvedValue({ modifiedCount: 3 });

      const res = await request(app)
        .post('/api/orders/bulk-assign')
        .set('Authorization', authHeader())
        .send({
          orderIds: ['order-1', 'order-2', 'order-3'],
          vehicleId: 'vehicle-1',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.modifiedCount).toBe(3);
    });

    test('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/orders/bulk-assign')
        .send({ orderIds: ['order-1'], vehicleId: 'vehicle-1' });

      expect(res.status).toBe(401);
    });
  });
});
