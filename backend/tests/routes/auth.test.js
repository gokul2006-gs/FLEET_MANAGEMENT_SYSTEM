import { jest } from '@jest/globals';
import request from 'supertest';

// Mock all dependencies
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn(),
    sign: jest.fn(() => 'mock-jwt-token'),
  },
}));

jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
  },
}));

const jwt = (await import('jsonwebtoken')).default;
const User = (await import('../../src/models/User.js')).default;
const { createApp } = await import('../../src/app.js');

const app = createApp();

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /api/auth/register', () => {
    test('returns 201 and user + token on successful registration', async () => {
      const mockUser = {
        _id: 'user-id-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'dispatcher',
        toJSON: jest.fn().mockReturnValue({ _id: 'user-id-1', name: 'John Doe', email: 'john@example.com' }),
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    test('normalizes FLEET_MANAGER to manager', async () => {
      const mockUser = {
        _id: 'user-id-2',
        name: 'Fleet Manager',
        email: 'manager@example.com',
        role: 'manager',
        toJSON: jest.fn().mockReturnValue({ _id: 'user-id-2', role: 'manager' }),
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Fleet Manager',
          email: 'manager@example.com',
          password: 'password123',
          role: 'FLEET_MANAGER',
        });

      expect(res.status).toBe(201);
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'manager' }));
    });

    test('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('returns 400 when email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'not-an-email',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('returns 400 when password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('returns 400 when email is already registered', async () => {
      User.findOne.mockResolvedValue({ _id: 'existing', email: 'john@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already registered/i);
    });
  });

  describe('POST /api/auth/login', () => {
    test('returns 200 and token on successful login', async () => {
      const mockUser = {
        _id: 'user-id-1',
        email: 'john@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ _id: 'user-id-1', email: 'john@example.com' }),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    test('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('returns 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'john@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('returns 401 when user does not exist', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    test('returns 401 when password does not match', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });
  });

  describe('GET /api/auth/profile', () => {
    test('returns 401 without token', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.status).toBe(401);
    });

    test('returns user profile when authenticated', async () => {
      const mockUser = { _id: 'user-1', name: 'John Doe', email: 'john@example.com' };
      jwt.verify.mockReturnValue({ id: 'user-1' });
      User.findById.mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/auth/profile', () => {
    test('returns 401 without token', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(401);
    });

    test('updates profile when authenticated', async () => {
      const updated = { _id: 'user-1', name: 'Updated Name', email: 'john@example.com' };
      jwt.verify.mockReturnValue({ id: 'user-1' });
      User.findById.mockResolvedValue({ _id: 'user-1' });
      User.findByIdAndUpdate.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
