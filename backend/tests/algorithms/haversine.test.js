import { describe, test, expect } from '@jest/globals';
import { haversine, estimateTravelTime } from '../../src/algorithms/haversine.js';

describe('Haversine', () => {
  describe('haversine()', () => {
    test('returns 0 for identical points', () => {
      expect(haversine(28.6139, 77.2090, 28.6139, 77.2090)).toBe(0);
    });

    test('calculates distance between two known Delhi locations', () => {
      // Connaught Place to Qutub Minar ~15 km
      const dist = haversine(28.6139, 77.2090, 28.5244, 77.2066);
      expect(dist).toBeGreaterThan(9);
      expect(dist).toBeLessThan(11);
    });

    test('calculates distance between New York and London (~5570 km)', () => {
      const dist = haversine(40.7128, -74.0060, 51.5074, -0.1278);
      expect(dist).toBeGreaterThan(5500);
      expect(dist).toBeLessThan(5700);
    });

    test('is symmetric: dist(A,B) === dist(B,A)', () => {
      const d1 = haversine(28.6139, 77.2090, 28.5244, 77.2066);
      const d2 = haversine(28.5244, 77.2066, 28.6139, 77.2090);
      expect(d1).toBeCloseTo(d2, 6);
    });

    test('handles equator crossing', () => {
      // Points on opposite sides of the equator
      const dist = haversine(-1.0, 0.0, 1.0, 0.0);
      expect(dist).toBeGreaterThan(220);
      expect(dist).toBeLessThan(230);
    });

    test('handles antipodal points (~20000 km)', () => {
      const dist = haversine(0, 0, 0, 180);
      expect(dist).toBeGreaterThan(20000);
      expect(dist).toBeLessThan(20100);
    });

    test('handles same latitude, different longitude', () => {
      const dist = haversine(28.0, 77.0, 28.0, 78.0);
      expect(dist).toBeGreaterThan(95);
      expect(dist).toBeLessThan(100);
    });

    test('handles same longitude, different latitude', () => {
      const dist = haversine(28.0, 77.0, 29.0, 77.0);
      expect(dist).toBeGreaterThan(110);
      expect(dist).toBeLessThan(112);
    });

    test('returns a positive number for different points', () => {
      expect(haversine(10, 20, 30, 40)).toBeGreaterThan(0);
    });
  });

  describe('estimateTravelTime()', () => {
    test('returns 0 for 0 km distance', () => {
      expect(estimateTravelTime(0)).toBe(0);
    });

    test('returns 60 minutes for 30 km (at 30 km/h)', () => {
      expect(estimateTravelTime(30)).toBe(60);
    });

    test('returns 120 minutes for 60 km', () => {
      expect(estimateTravelTime(60)).toBe(120);
    });

    test('returns 20 minutes for 10 km', () => {
      expect(estimateTravelTime(10)).toBe(20);
    });

    test('is linear: double distance = double time', () => {
      const t1 = estimateTravelTime(10);
      const t2 = estimateTravelTime(20);
      expect(t2).toBeCloseTo(t1 * 2, 6);
    });
  });
});
