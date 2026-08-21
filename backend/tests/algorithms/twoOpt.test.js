import { describe, test, expect } from '@jest/globals';
import { twoOpt } from '../../src/algorithms/twoOpt.js';
import { haversine } from '../../src/algorithms/haversine.js';

describe('2-opt', () => {
  test('returns empty route for null stops', () => {
    const result = twoOpt(null);
    expect(result.originalDistance).toBe(0);
    expect(result.optimizedDistance).toBe(0);
    expect(result.improvementPercentage).toBe(0);
    expect(result.route).toEqual([]);
  });

  test('returns same route for single stop', () => {
    const stops = [{ id: 'A', latitude: 28.6, longitude: 77.2 }];
    const result = twoOpt(stops);
    expect(result.route.length).toBe(1);
    expect(result.improvementPercentage).toBe(0);
  });

  test('returns same route for two stops', () => {
    const stops = [
      { id: 'A', latitude: 28.6, longitude: 77.2 },
      { id: 'B', latitude: 28.5, longitude: 77.3 },
    ];
    const result = twoOpt(stops);
    expect(result.route.length).toBe(2);
    expect(result.improvementPercentage).toBe(0);
  });

  test('optimizes a clearly suboptimal 5-stop route', () => {
    // Create a route that zigzags unnecessarily
    const stops = [
      { id: 'A', latitude: 28.61, longitude: 77.20 },
      { id: 'B', latitude: 28.55, longitude: 77.26 }, // Far south-east
      { id: 'C', latitude: 28.62, longitude: 77.21 }, // Back near A
      { id: 'D', latitude: 28.54, longitude: 77.25 }, // Far south
      { id: 'E', latitude: 28.63, longitude: 77.22 }, // Near A again
    ];

    const result = twoOpt(stops);

    // 2-opt should improve or maintain the route
    expect(result.optimizedDistance).toBeLessThanOrEqual(result.originalDistance + 0.01);
    expect(result.route.length).toBe(stops.length);
    // All original stops should be present
    const routeIds = result.route.map(s => s.id);
    stops.forEach(s => expect(routeIds).toContain(s.id));
  });

  test('originalDistance equals sum of haversine between consecutive stops', () => {
    const stops = [
      { id: 'A', latitude: 28.61, longitude: 77.20 },
      { id: 'B', latitude: 28.62, longitude: 77.21 },
      { id: 'C', latitude: 28.63, longitude: 77.22 },
    ];
    const result = twoOpt(stops);

    let expectedDist = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      expectedDist += haversine(
        stops[i].latitude, stops[i].longitude,
        stops[i + 1].latitude, stops[i + 1].longitude
      );
    }
    expect(result.originalDistance).toBeCloseTo(Math.round(expectedDist * 100) / 100, 1);
  });

  test('improvementPercentage is near 0 for already-optimal route', () => {
    // Already optimal: straight line along same longitude
    const stops = [
      { id: 'A', latitude: 28.60, longitude: 77.20 },
      { id: 'B', latitude: 28.61, longitude: 77.20 },
      { id: 'C', latitude: 28.62, longitude: 77.20 },
      { id: 'D', latitude: 28.63, longitude: 77.20 },
    ];
    const result = twoOpt(stops);
    // No significant improvement expected (may differ slightly due to rounding)
    expect(result.improvementPercentage).toBeGreaterThanOrEqual(-1);
    expect(result.improvementPercentage).toBeLessThanOrEqual(0.5);
    expect(result.optimizedDistance).toBeLessThanOrEqual(result.originalDistance + 0.01);
  });

  test('does not modify original array', () => {
    const stops = [
      { id: 'A', latitude: 28.61, longitude: 77.20 },
      { id: 'B', latitude: 28.55, longitude: 77.26 },
      { id: 'C', latitude: 28.62, longitude: 77.21 },
    ];
    const originalIds = stops.map(s => s.id);
    twoOpt(stops);
    expect(stops.map(s => s.id)).toEqual(originalIds);
  });

  test('route contains all original stops', () => {
    const stops = [
      { id: 'A', latitude: 28.61, longitude: 77.20 },
      { id: 'B', latitude: 28.55, longitude: 77.26 },
      { id: 'C', latitude: 28.62, longitude: 77.21 },
      { id: 'D', latitude: 28.54, longitude: 77.25 },
      { id: 'E', latitude: 28.63, longitude: 77.22 },
    ];
    const result = twoOpt(stops);
    const resultIds = result.route.map(s => s.id).sort();
    const originalIds = stops.map(s => s.id).sort();
    expect(resultIds).toEqual(originalIds);
  });

  test('iterations is tracked', () => {
    const stops = [
      { id: 'A', latitude: 28.61, longitude: 77.20 },
      { id: 'B', latitude: 28.55, longitude: 77.26 },
      { id: 'C', latitude: 28.62, longitude: 77.21 },
      { id: 'D', latitude: 28.54, longitude: 77.25 },
      { id: 'E', latitude: 28.63, longitude: 77.22 },
    ];
    const result = twoOpt(stops);
    expect(result.iterations).toBeGreaterThanOrEqual(1);
  });

  test('handles a larger route with many stops', () => {
    const stops = [];
    for (let i = 0; i < 20; i++) {
      stops.push({
        id: `stop-${i}`,
        latitude: 28.6 + (Math.random() - 0.5) * 0.05,
        longitude: 77.2 + (Math.random() - 0.5) * 0.05,
      });
    }
    const result = twoOpt(stops);
    expect(result.optimizedDistance).toBeLessThanOrEqual(result.originalDistance + 0.01);
    expect(result.route.length).toBe(20);
  });

  test('optimized distance is always <= original distance', () => {
    // Random routes to test property
    for (let trial = 0; trial < 5; trial++) {
      const stops = [];
      for (let i = 0; i < 8; i++) {
        stops.push({
          id: `s${i}`,
          latitude: 28.6 + (Math.random() - 0.5) * 0.1,
          longitude: 77.2 + (Math.random() - 0.5) * 0.1,
        });
      }
      const result = twoOpt(stops);
      expect(result.optimizedDistance).toBeLessThanOrEqual(result.originalDistance + 0.01);
    }
  });

  test('preserves stop metadata through optimization', () => {
    const stops = [
      { id: 'A', latitude: 28.61, longitude: 77.20, customerName: 'Alice', packageWeight: 5 },
      { id: 'B', latitude: 28.55, longitude: 77.26, customerName: 'Bob', packageWeight: 3 },
      { id: 'C', latitude: 28.62, longitude: 77.21, customerName: 'Charlie', packageWeight: 7 },
    ];
    const result = twoOpt(stops);

    result.route.forEach(stop => {
      expect(stop.customerName).toBeDefined();
      expect(stop.packageWeight).toBeDefined();
    });
  });
});
