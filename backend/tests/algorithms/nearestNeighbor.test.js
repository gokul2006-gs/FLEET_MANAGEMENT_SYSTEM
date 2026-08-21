import { describe, test, expect } from '@jest/globals';
import { nearestNeighbor } from '../../src/algorithms/nearestNeighbor.js';

describe('Nearest Neighbor', () => {
  const depot = { id: 'depot', latitude: 28.6139, longitude: 77.2090 };

  test('returns empty route for no stops', () => {
    const result = nearestNeighbor(depot, []);
    expect(result.route).toEqual(['depot']);
    expect(result.totalDistance).toBe(0);
    expect(result.orderedStops).toEqual([]);
  });

  test('returns empty route for null stops', () => {
    const result = nearestNeighbor(depot, null);
    expect(result.route).toEqual(['depot']);
    expect(result.totalDistance).toBe(0);
  });

  test('handles single stop correctly', () => {
    const stops = [
      { id: 'A', latitude: 28.6507, longitude: 77.2334 }
    ];
    const result = nearestNeighbor(depot, stops);

    expect(result.route).toEqual(['depot', 'A', 'depot']);
    expect(result.orderedStops.length).toBe(1);
    expect(result.orderedStops[0].id).toBe('A');
    expect(result.totalDistance).toBeGreaterThan(0);
  });

  test('visits all stops exactly once', () => {
    const stops = [
      { id: 'A', latitude: 28.6507, longitude: 77.2334 },
      { id: 'B', latitude: 28.5244, longitude: 77.2066 },
      { id: 'C', latitude: 28.6280, longitude: 77.2195 },
      { id: 'D', latitude: 28.5535, longitude: 77.2590 },
    ];
    const result = nearestNeighbor(depot, stops);

    // Route: depot -> ... -> depot (N stops in between)
    expect(result.route.length).toBe(stops.length + 2);
    expect(result.route[0]).toBe('depot');
    expect(result.route[result.route.length - 1]).toBe('depot');

    // All stops visited
    const stopIds = result.route.slice(1, -1);
    expect(new Set(stopIds).size).toBe(stops.length);
    stops.forEach(s => expect(stopIds).toContain(s.id));
  });

  test('greedily picks nearest unvisited stop', () => {
    // A is close to depot, B is far
    const stops = [
      { id: 'A', latitude: 28.6200, longitude: 77.2100 }, // Very close to depot
      { id: 'B', latitude: 28.5244, longitude: 77.2066 }, // Far from depot
      { id: 'C', latitude: 28.6150, longitude: 77.2095 }, // Close to depot
    ];
    const result = nearestNeighbor(depot, stops);

    // First stop should be the nearest to depot
    expect(result.orderedStops[0].id).toBe('C'); // Closest to depot
  });

  test('calculates totalDistance as sum of all legs + return to depot', () => {
    const stops = [
      { id: 'A', latitude: 28.6507, longitude: 77.2334 },
      { id: 'B', latitude: 28.5244, longitude: 77.2066 },
    ];
    const result = nearestNeighbor(depot, stops);

    expect(result.totalDistance).toBeGreaterThan(0);
    // totalDistance = sum of distances between consecutive stops + return to depot
    // It should be greater than just the sum of forward legs
    const forwardDistance = result.orderedStops.reduce((sum, s) => sum + s.distanceFromPrevious, 0);
    expect(result.totalDistance).toBeGreaterThan(forwardDistance);
  });

  test('calculates totalDuration from totalDistance', () => {
    const stops = [
      { id: 'A', latitude: 28.6507, longitude: 77.2334 },
    ];
    const result = nearestNeighbor(depot, stops);

    // duration = (distance / 30) * 60 minutes
    expect(result.totalDuration).toBe(Math.round((result.totalDistance / 30) * 60));
  });

  test('distanceFromPrevious is set on each ordered stop', () => {
    const stops = [
      { id: 'A', latitude: 28.6507, longitude: 77.2334 },
      { id: 'B', latitude: 28.5244, longitude: 77.2066 },
      { id: 'C', latitude: 28.6280, longitude: 77.2195 },
    ];
    const result = nearestNeighbor(depot, stops);

    result.orderedStops.forEach(stop => {
      expect(stop.distanceFromPrevious).toBeGreaterThanOrEqual(0);
      expect(typeof stop.distanceFromPrevious).toBe('number');
    });
  });

  test('handles stops at the same location as depot', () => {
    const stops = [
      { id: 'A', latitude: 28.6139, longitude: 77.2090 },
    ];
    const result = nearestNeighbor(depot, stops);
    expect(result.totalDistance).toBeCloseTo(0, 1);
  });

  test('handles many stops efficiently', () => {
    const stops = [];
    for (let i = 0; i < 50; i++) {
      stops.push({
        id: `stop-${i}`,
        latitude: 28.6 + (Math.random() - 0.5) * 0.05,
        longitude: 77.2 + (Math.random() - 0.5) * 0.05,
      });
    }

    const result = nearestNeighbor(depot, stops);
    expect(result.orderedStops.length).toBe(50);
    expect(result.route.length).toBe(52); // depot + 50 stops + depot
    expect(result.totalDistance).toBeGreaterThan(0);
  });

  test('orderedStops preserve original stop data', () => {
    const stops = [
      { id: 'A', latitude: 28.6507, longitude: 77.2334, customerName: 'Test Customer', packageWeight: 5 },
    ];
    const result = nearestNeighbor(depot, stops);

    expect(result.orderedStops[0].customerName).toBe('Test Customer');
    expect(result.orderedStops[0].packageWeight).toBe(5);
    expect(result.orderedStops[0].latitude).toBe(28.6507);
  });

  test('returns stops in order of proximity from depot', () => {
    // Place stops at known distances
    const stops = [
      { id: 'far', latitude: 28.50, longitude: 77.20 }, // ~12.7 km south
      { id: 'near', latitude: 28.62, longitude: 77.21 }, // ~0.7 km north
      { id: 'mid', latitude: 28.58, longitude: 77.22 }, // ~3.8 km south
    ];
    const result = nearestNeighbor(depot, stops);

    // First stop should be the nearest
    expect(result.orderedStops[0].id).toBe('near');
  });
});
