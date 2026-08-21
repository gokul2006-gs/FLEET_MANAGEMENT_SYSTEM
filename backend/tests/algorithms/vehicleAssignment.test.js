import { describe, test, expect } from '@jest/globals';
import { assignVehicles, validateTimeWindows } from '../../src/algorithms/vehicleAssignment.js';

describe('assignVehicles()', () => {
  const depot = { latitude: 28.6139, longitude: 77.2090 };

  test('assigns orders to available vehicles', () => {
    const orders = [
      { id: 'o1', latitude: 28.65, longitude: 77.23, packageWeight: 10, priority: 'normal', serviceTime: 5 },
      { id: 'o2', latitude: 28.52, longitude: 77.20, packageWeight: 15, priority: 'normal', serviceTime: 5 },
    ];
    const vehicles = [
      { _id: 'v1', capacity: 100, currentLoad: 0, status: 'active' },
    ];

    const result = assignVehicles(orders, vehicles, depot);
    expect(result.assignments.length).toBe(1);
    expect(result.assignments[0].orders.length).toBe(2);
    expect(result.unassigned.length).toBe(0);
  });

  test('respects vehicle capacity', () => {
    const orders = [
      { id: 'o1', latitude: 28.65, longitude: 77.23, packageWeight: 60, priority: 'normal', serviceTime: 5 },
      { id: 'o2', latitude: 28.52, longitude: 77.20, packageWeight: 60, priority: 'normal', serviceTime: 5 },
    ];
    const vehicles = [
      { _id: 'v1', capacity: 100, currentLoad: 0, status: 'active' },
    ];

    const result = assignVehicles(orders, vehicles, depot);
    // First order (60kg) fits, second (60kg) doesn't fit in remaining 40kg
    expect(result.assignments[0].orders.length).toBe(1);
    expect(result.unassigned.length).toBe(1);
  });

  test('skips maintenance and offline vehicles', () => {
    const orders = [
      { id: 'o1', latitude: 28.65, longitude: 77.23, packageWeight: 10, priority: 'normal', serviceTime: 5 },
    ];
    const vehicles = [
      { _id: 'v1', capacity: 100, currentLoad: 0, status: 'maintenance' },
      { _id: 'v2', capacity: 100, currentLoad: 0, status: 'offline' },
    ];

    const result = assignVehicles(orders, vehicles, depot);
    expect(result.assignments.length).toBe(0);
    expect(result.unassigned.length).toBe(1);
    expect(result.unassigned[0].reason).toBe('No available vehicles');
  });

  test('sorts orders by priority before assignment', () => {
    const orders = [
      { id: 'o1', latitude: 28.65, longitude: 77.23, packageWeight: 10, priority: 'low', serviceTime: 5 },
      { id: 'o2', latitude: 28.65, longitude: 77.23, packageWeight: 10, priority: 'critical', serviceTime: 5 },
      { id: 'o3', latitude: 28.65, longitude: 77.23, packageWeight: 10, priority: 'high', serviceTime: 5 },
    ];
    const vehicles = [
      { _id: 'v1', capacity: 50, currentLoad: 0, status: 'active' },
    ];

    const result = assignVehicles(orders, vehicles, depot);
    // All 3 orders should be assigned (30kg < 50kg capacity)
    expect(result.assignments.length).toBe(1);
    expect(result.assignments[0].orders.length).toBe(3);
    expect(result.summary.totalAssigned).toBe(3);
  });

  test('sorts vehicles by available capacity', () => {
    const orders = [
      { id: 'o1', latitude: 28.65, longitude: 77.23, packageWeight: 10, priority: 'normal', serviceTime: 5 },
    ];
    const vehicles = [
      { _id: 'v1', capacity: 50, currentLoad: 40, status: 'active' }, // 10 available
      { _id: 'v2', capacity: 200, currentLoad: 0, status: 'active' }, // 200 available
    ];

    const result = assignVehicles(orders, vehicles, depot);
    // Should prefer v2 (more available capacity)
    expect(result.assignments[0].vehicle._id).toBe('v2');
  });

  test('returns correct summary', () => {
    const orders = [
      { id: 'o1', latitude: 28.65, longitude: 77.23, packageWeight: 10, priority: 'normal', serviceTime: 5 },
      { id: 'o2', latitude: 28.52, longitude: 77.20, packageWeight: 15, priority: 'high', serviceTime: 5 },
    ];
    const vehicles = [
      { _id: 'v1', capacity: 100, currentLoad: 0, status: 'active' },
    ];

    const result = assignVehicles(orders, vehicles, depot);
    expect(result.summary.totalAssigned).toBe(2);
    expect(result.summary.totalUnassigned).toBe(0);
    expect(result.summary.vehicleCount).toBe(1);
    expect(result.summary.totalWeightAssigned).toBe(25);
  });

  test('calculates totalDistance for assignments', () => {
    const orders = [
      { id: 'o1', latitude: 28.65, longitude: 77.23, packageWeight: 10, priority: 'normal', serviceTime: 5 },
    ];
    const vehicles = [
      { _id: 'v1', capacity: 100, currentLoad: 0, status: 'active' },
    ];

    const result = assignVehicles(orders, vehicles, depot);
    expect(result.totalDistance).toBeGreaterThan(0);
  });

  test('handles empty orders', () => {
    const vehicles = [
      { _id: 'v1', capacity: 100, currentLoad: 0, status: 'active' },
    ];

    const result = assignVehicles([], vehicles, depot);
    expect(result.assignments.length).toBe(0);
    expect(result.unassigned.length).toBe(0);
    expect(result.summary.totalAssigned).toBe(0);
  });

  test('handles empty vehicles', () => {
    const orders = [
      { id: 'o1', latitude: 28.65, longitude: 77.23, packageWeight: 10, priority: 'normal', serviceTime: 5 },
    ];

    const result = assignVehicles(orders, [], depot);
    expect(result.assignments.length).toBe(0);
    expect(result.unassigned.length).toBe(1);
  });

  test('calculates estimatedDuration per assignment', () => {
    const orders = [
      { id: 'o1', latitude: 28.65, longitude: 77.23, packageWeight: 10, priority: 'normal', serviceTime: 10 },
    ];
    const vehicles = [
      { _id: 'v1', capacity: 100, currentLoad: 0, status: 'active' },
    ];

    const result = assignVehicles(orders, vehicles, depot);
    expect(result.assignments[0].estimatedDuration).toBeGreaterThan(0);
    // Should include serviceTime (10 min) + travel time
    expect(result.assignments[0].estimatedDuration).toBeGreaterThanOrEqual(10);
  });
});

describe('validateTimeWindows()', () => {
  test('returns no violations for on-time arrivals', () => {
    const stops = [
      { id: 's1', customerName: 'A', estimatedArrival: '10:00', timeWindowStart: '09:00', timeWindowEnd: '12:00' },
      { id: 's2', customerName: 'B', estimatedArrival: '11:00', timeWindowStart: '10:00', timeWindowEnd: '13:00' },
    ];

    const result = validateTimeWindows(stops);
    expect(result.violations.length).toBe(0);
    expect(result.compliantCount).toBe(2);
  });

  test('detects late arrival (after window end)', () => {
    const stops = [
      { id: 's1', customerName: 'A', estimatedArrival: '13:00', timeWindowStart: '09:00', timeWindowEnd: '12:00' },
    ];

    const result = validateTimeWindows(stops);
    expect(result.violations.length).toBe(1);
    // 13:00 is 60 min past 12:00 => severity 'critical' (>30 min)
    expect(result.violations[0].severity).toBe('critical');
    expect(result.violations[0].delay).toContain('late');
  });

  test('detects early arrival (before window start)', () => {
    const stops = [
      { id: 's1', customerName: 'A', estimatedArrival: '08:00', timeWindowStart: '09:00', timeWindowEnd: '12:00' },
    ];

    const result = validateTimeWindows(stops);
    expect(result.violations.length).toBe(1);
    expect(result.violations[0].delay).toContain('early');
  });

  test('marks critical severity for >30 min delay', () => {
    const stops = [
      { id: 's1', customerName: 'A', estimatedArrival: '13:00', timeWindowStart: '09:00', timeWindowEnd: '11:30' },
    ];

    const result = validateTimeWindows(stops);
    expect(result.violations.length).toBe(1);
    expect(result.violations[0].severity).toBe('critical');
  });

  test('marks warning severity for <=30 min delay', () => {
    const stops = [
      { id: 's1', customerName: 'A', estimatedArrival: '12:15', timeWindowStart: '09:00', timeWindowEnd: '12:00' },
    ];

    const result = validateTimeWindows(stops);
    expect(result.violations.length).toBe(1);
    expect(result.violations[0].severity).toBe('warning');
  });

  test('skips stops without time windows', () => {
    const stops = [
      { id: 's1', customerName: 'A', estimatedArrival: '10:00' },
      { id: 's2', customerName: 'B', estimatedArrival: '11:00', timeWindowStart: '10:00', timeWindowEnd: '12:00' },
    ];

    const result = validateTimeWindows(stops);
    expect(result.violations.length).toBe(0);
    expect(result.compliantCount).toBe(2);
  });

  test('skips stops without estimated arrival', () => {
    const stops = [
      { id: 's1', customerName: 'A', timeWindowStart: '09:00', timeWindowEnd: '12:00' },
    ];

    const result = validateTimeWindows(stops);
    expect(result.violations.length).toBe(0);
    expect(result.compliantCount).toBe(1);
  });

  test('returns correct totalStops count', () => {
    const stops = [
      { id: 's1', customerName: 'A', estimatedArrival: '10:00', timeWindowStart: '09:00', timeWindowEnd: '12:00' },
      { id: 's2', customerName: 'B', estimatedArrival: '11:00', timeWindowStart: '10:00', timeWindowEnd: '12:00' },
      { id: 's3', customerName: 'C', estimatedArrival: '13:00', timeWindowStart: '09:00', timeWindowEnd: '12:00' },
    ];

    const result = validateTimeWindows(stops);
    expect(result.totalStops).toBe(3);
    expect(result.violationCount).toBe(1);
    expect(result.compliantCount).toBe(2);
  });

  test('handles empty stops array', () => {
    const result = validateTimeWindows([]);
    expect(result.violations.length).toBe(0);
    expect(result.totalStops).toBe(0);
  });

  test('violation includes all required fields', () => {
    const stops = [
      { id: 's1', customerName: 'Test Customer', estimatedArrival: '13:00', timeWindowStart: '09:00', timeWindowEnd: '12:00' },
    ];

    const result = validateTimeWindows(stops);
    const v = result.violations[0];
    expect(v.stopId).toBe('s1');
    expect(v.customerName).toBe('Test Customer');
    expect(v.expectedArrival).toBe('13:00');
    expect(v.allowedUntil).toBe('12:00');
    expect(v.delay).toBeDefined();
    expect(v.severity).toBeDefined();
  });
});
