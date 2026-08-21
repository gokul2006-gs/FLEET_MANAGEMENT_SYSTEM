import { jest } from '@jest/globals';
import request from 'supertest';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { verify: jest.fn(), sign: jest.fn(() => 'mock-token') },
}));

jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: { findById: jest.fn().mockResolvedValue({ _id: 'user-1', name: 'Test' }) },
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

const jwt = (await import('jsonwebtoken')).default;
const Driver = (await import('../../src/models/Driver.js')).default;
const { createApp } = await import('../../src/app.js');

const app = createApp();

function authHeader() {
  jwt.verify.mockReturnValue({ id: 'user-1' });
  return 'Bearer test-token';
}

describe('Driver Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /api/drivers', () => {
    test('creates a driver with valid data', async () => {
      const data = {
        name: 'Raj Kumar',
        phone: '+91-9876543210',
        licenseNumber: 'DL-2023-001',
      };
      Driver.create.mockResolvedValue({ _id: 'd-1', ...data, status: 'available' });

      const res = await request(app)
        .post('/api/drivers')
        .set('Authorization', authHeader())
        .send(data);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(Driver.create).toHaveBeenCalled();
    });

    test('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/drivers')
        .set('Authorization', authHeader())
        .send({ phone: '+91-9876543210', licenseNumber: 'DL-2023-001' });

      expect(res.status).toBe(400);
    });

    test('returns 400 when phone is missing', async () => {
      const res = await request(app)
        .post('/api/drivers')
        .set('Authorization', authHeader())
        .send({ name: 'Raj', licenseNumber: 'DL-2023-001' });

      expect(res.status).toBe(400);
    });

    test('returns 400 when licenseNumber is missing', async () => {
      const res = await request(app)
        .post('/api/drivers')
        .set('Authorization', authHeader())
        .send({ name: 'Raj', phone: '+91-9876543210' });

      expect(res.status).toBe(400);
    });

    test('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/drivers')
        .send({ name: 'Raj', phone: '+91-9876543210', licenseNumber: 'DL-2023-001' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/drivers', () => {
    test('returns paginated drivers', async () => {
      const mockDrivers = [{ _id: 'd-1', name: 'Raj Kumar' }];

      Driver.countDocuments.mockResolvedValue(1);
      Driver.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockDrivers),
      });

      const res = await request(app)
        .get('/api/drivers')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pagination.total).toBe(1);
    });

    test('filters by status', async () => {
      Driver.countDocuments.mockResolvedValue(0);
      Driver.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });

      await request(app)
        .get('/api/drivers?status=available')
        .set('Authorization', authHeader());

      expect(Driver.find).toHaveBeenCalledWith(expect.objectContaining({ status: 'available' }));
    });
  });

  describe('GET /api/drivers/:id', () => {
    test('returns driver by id', async () => {
      Driver.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'd-1', name: 'Raj Kumar' }),
      });

      const res = await request(app)
        .get('/api/drivers/d-1')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
    });

    test('returns 404 when not found', async () => {
      Driver.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .get('/api/drivers/nonexistent')
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/drivers/:id', () => {
    test('updates a driver', async () => {
      Driver.findByIdAndUpdate.mockResolvedValue({ _id: 'd-1', name: 'Updated' });

      const res = await request(app)
        .put('/api/drivers/d-1')
        .set('Authorization', authHeader())
        .send({ name: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('returns 404 when not found', async () => {
      Driver.findByIdAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/drivers/nonexistent')
        .set('Authorization', authHeader())
        .send({ name: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/drivers/:id', () => {
    test('deletes a driver', async () => {
      Driver.findByIdAndDelete.mockResolvedValue({ _id: 'd-1' });

      const res = await request(app)
        .delete('/api/drivers/d-1')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
    });

    test('returns 404 when not found', async () => {
      Driver.findByIdAndDelete.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/drivers/nonexistent')
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
    });
  });
});
