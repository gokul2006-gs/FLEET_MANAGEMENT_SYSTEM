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
    find: jest.fn(),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
  },
}));

jest.unstable_mockModule('../../src/models/Vehicle.js', () => ({
  default: {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn().mockResolvedValue({}),
  },
}));

jest.unstable_mockModule('../../src/models/Driver.js', () => ({
  default: { find: jest.fn() },
}));

jest.unstable_mockModule('../../src/models/Route.js', () => ({
  default: {
    create: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/models/Depot.js', () => ({
  default: {
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/models/Notification.js', () => ({
  default: {
    create: jest.fn(),
  },
}));

jest.unstable_mockModule('../../src/services/optimizationService.js', () => ({
  runOptimization: jest.fn(),
  benchmarkAlgorithms: jest.fn(),
}));

const jwt = (await import('jsonwebtoken')).default;
const Order = (await import('../../src/models/Order.js')).default;
const Vehicle = (await import('../../src/models/Vehicle.js')).default;
const Route = (await import('../../src/models/Route.js')).default;
const Depot = (await import('../../src/models/Depot.js')).default;
const Notification = (await import('../../src/models/Notification.js')).default;
const { runOptimization, benchmarkAlgorithms } = await import('../../src/services/optimizationService.js');
const { createApp } = await import('../../src/app.js');

const app = createApp();

function authHeader() {
  jwt.verify.mockReturnValue({ id: 'user-1' });
  return 'Bearer test-token';
}

describe('Optimization Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /api/optimization/optimize', () => {
    test('runs route optimization successfully', async () => {
      const mockOrders = [
        { _id: 'o-1', latitude: 28.6, longitude: 77.2, packageWeight: 2 },
      ];
      const mockVehicles = [
        { _id: 'v-1', capacity: 500, status: 'active', driver: 'd-1' },
      ];
      const mockDepot = {
        _id: 'depot-1',
        name: 'Main Depot',
        latitude: 28.6139,
        longitude: 77.2090,
      };

      Order.find.mockResolvedValue(mockOrders);
      Depot.findOne.mockResolvedValue(mockDepot);
      Vehicle.find.mockResolvedValue(mockVehicles);

      runOptimization.mockResolvedValue({
        routes: [
          {
            vehicle: mockVehicles[0],
            stops: [{ order: 'o-1', sequence: 1, latitude: 28.6, longitude: 77.2, address: 'Test' }],
            totalDistance: 5.2,
            totalDuration: 30,
            totalStops: 1,
            totalCapacity: 2,
            algorithm: 'astar',
            optimizationMethod: 'nearest_neighbor_2opt',
          },
        ],
        unassigned: [],
        summary: {
          routesGenerated: 1,
          totalDistance: 5.2,
          totalDuration: 30,
          totalOrdersAssigned: 1,
          totalOrdersUnassigned: 0,
        },
      });

      Route.create.mockResolvedValue({ _id: 'r-1' });
      Notification.create.mockResolvedValue({});

      const res = await request(app)
        .post('/api/optimization/optimize')
        .set('Authorization', authHeader())
        .send({ orderIds: ['o-1'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.routes).toBeDefined();
      expect(res.body.data.summary.routesGenerated).toBe(1);
      expect(runOptimization).toHaveBeenCalled();
    });

    test('returns 400 when no orders to optimize', async () => {
      Order.find.mockResolvedValue([]);
      Depot.findOne.mockResolvedValue({ _id: 'depot-1' });
      Vehicle.find.mockResolvedValue([{ _id: 'v-1', status: 'active' }]);

      const res = await request(app)
        .post('/api/optimization/optimize')
        .set('Authorization', authHeader())
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/no orders/i);
    });

    test('returns 400 when no depot found', async () => {
      Order.find.mockResolvedValue([{ _id: 'o-1' }]);
      Depot.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/optimization/optimize')
        .set('Authorization', authHeader())
        .send({ orderIds: ['o-1'] });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/no depot/i);
    });

    test('returns 400 when no vehicles available', async () => {
      Order.find.mockResolvedValue([{ _id: 'o-1' }]);
      Depot.findOne.mockResolvedValue({ _id: 'depot-1' });
      Vehicle.find.mockResolvedValue([]);

      const res = await request(app)
        .post('/api/optimization/optimize')
        .set('Authorization', authHeader())
        .send({ orderIds: ['o-1'] });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/no available vehicles/i);
    });

    test('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/optimization/optimize')
        .send({ orderIds: ['o-1'] });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/optimization/benchmark', () => {
    test('returns benchmark results', async () => {
      benchmarkAlgorithms.mockReturnValue({
        nodeCount: 10,
        dijkstra: { executionTime: 1.5, nodesExplored: 8, distance: 25.3 },
        astar: { executionTime: 1.2, nodesExplored: 5, distance: 25.3 },
      });

      const res = await request(app)
        .get('/api/optimization/benchmark')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current).toBeDefined();
      expect(res.body.data.benchmarks).toBeDefined();
      expect(benchmarkAlgorithms).toHaveBeenCalled();
    });
  });

  describe('POST /api/optimization/compare', () => {
    test('compares Dijkstra vs A* algorithms', async () => {
      const locations = [
        { id: 'A', latitude: 28.6139, longitude: 77.2090 },
        { id: 'B', latitude: 28.6507, longitude: 77.2334 },
        { id: 'C', latitude: 28.5244, longitude: 77.2066 },
      ];

      const res = await request(app)
        .post('/api/optimization/compare')
        .set('Authorization', authHeader())
        .send({ locations });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dijkstra).toBeDefined();
      expect(res.body.data.astar).toBeDefined();
      expect(res.body.data.source).toBe('A');
      expect(res.body.data.destination).toBe('C');
    });

    test('returns 400 with fewer than 2 locations', async () => {
      const res = await request(app)
        .post('/api/optimization/compare')
        .set('Authorization', authHeader())
        .send({ locations: [{ id: 'A', latitude: 28.6, longitude: 77.2 }] });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/at least 2/i);
    });

    test('returns 400 with no locations', async () => {
      const res = await request(app)
        .post('/api/optimization/compare')
        .set('Authorization', authHeader())
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
