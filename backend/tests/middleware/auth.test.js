import { jest } from '@jest/globals';

// Mock jwt and User before importing middleware
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn(),
    sign: jest.fn(() => 'mock-token'),
  },
}));

jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: {
    findById: jest.fn(),
  },
}));

const jwt = (await import('jsonwebtoken')).default;
const User = (await import('../../src/models/User.js')).default;
const { protect, authorize } = await import('../../src/middleware/auth.js');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('protect()', () => {
    test('returns 401 when no token is provided', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: expect.stringContaining('Not authorized') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('returns 401 when authorization header does not start with Bearer', async () => {
      req.headers.authorization = 'Basic some-token';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('returns 401 when token verification fails', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('token invalid') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('returns 401 when user not found', async () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ id: 'user-id-123' });
      User.findById.mockResolvedValue(null);

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User not found' })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('calls next and sets req.user when token is valid', async () => {
      const mockUser = { _id: 'user-id-123', name: 'Test User', role: 'admin' };
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ id: 'user-id-123' });
      User.findById.mockResolvedValue(mockUser);

      await protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(mockUser);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('authorize()', () => {
    test('calls next when user role is authorized', async () => {
      req.user = { role: 'admin' };
      const middleware = authorize('admin', 'manager');

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('returns 403 when user role is not authorized', async () => {
      req.user = { role: 'driver' };
      const middleware = authorize('admin', 'manager');

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('not authorized'),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('works with single allowed role', async () => {
      req.user = { role: 'admin' };
      const middleware = authorize('admin');

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
