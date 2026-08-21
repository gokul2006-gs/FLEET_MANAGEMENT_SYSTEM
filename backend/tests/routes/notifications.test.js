import { jest } from '@jest/globals';
import request from 'supertest';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { verify: jest.fn(), sign: jest.fn(() => 'mock-token') },
}));

jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: { findById: jest.fn().mockResolvedValue({ _id: 'user-1', name: 'Test' }) },
}));

jest.unstable_mockModule('../../src/models/Notification.js', () => ({
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

const jwt = (await import('jsonwebtoken')).default;
const Notification = (await import('../../src/models/Notification.js')).default;
const { createApp } = await import('../../src/app.js');

const app = createApp();

function authHeader() {
  jwt.verify.mockReturnValue({ id: 'user-1' });
  return 'Bearer test-token';
}

describe('Notification Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('GET /api/notifications', () => {
    test('returns paginated notifications with unread count', async () => {
      const mockNotifications = [
        { _id: 'n-1', title: 'Route Complete', isRead: false },
      ];

      Notification.countDocuments
        .mockResolvedValueOnce(1)  // total
        .mockResolvedValueOnce(1); // unreadCount

      Notification.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockNotifications),
      });

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.unreadCount).toBe(1);
      expect(res.body.data).toEqual(mockNotifications);
    });

    test('filters by unreadOnly', async () => {
      Notification.countDocuments
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      Notification.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });

      await request(app)
        .get('/api/notifications?unreadOnly=true')
        .set('Authorization', authHeader());

      expect(Notification.find).toHaveBeenCalledWith({ isRead: false });
    });

    test('returns 401 without auth', async () => {
      const res = await request(app).get('/api/notifications');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    test('marks a notification as read', async () => {
      Notification.findByIdAndUpdate.mockResolvedValue({ _id: 'n-1', isRead: true });

      const res = await request(app)
        .put('/api/notifications/n-1/read')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/read/i);
      expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith('n-1', { isRead: true });
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    test('marks all notifications as read', async () => {
      Notification.updateMany.mockResolvedValue({ modifiedCount: 5 });

      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/all marked as read/i);
      expect(Notification.updateMany).toHaveBeenCalledWith({ isRead: false }, { isRead: true });
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    test('deletes a notification', async () => {
      Notification.findByIdAndDelete.mockResolvedValue({ _id: 'n-1' });

      const res = await request(app)
        .delete('/api/notifications/n-1')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
    });
  });
});
