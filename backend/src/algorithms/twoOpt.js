import { haversine } from './haversine.js';

/**
 * Calculate total distance of a route given ordered stop coordinates.
 * @param {Array} orderedStops - Array of { latitude, longitude }
 * @returns {number} Total distance in km
 */
function calculateRouteDistance(orderedStops) {
  let total = 0;
  for (let i = 0; i < orderedStops.length - 1; i++) {
    total += haversine(
      orderedStops[i].latitude, orderedStops[i].longitude,
      orderedStops[i + 1].latitude, orderedStops[i + 1].longitude
    );
  }
  return total;
}

/**
 * 2-opt local search improvement algorithm.
 * Iteratively swaps pairs of edges to reduce total route distance.
 *
 * @param {Array} stops - Array of ordered stops with { id, latitude, longitude, ... }
 * @returns {Object} { originalDistance, optimizedDistance, improvementPercentage, route, iterations }
 */
export function twoOpt(stops) {
  if (!stops || stops.length <= 2) {
    return {
      originalDistance: stops ? calculateRouteDistance(stops) : 0,
      optimizedDistance: stops ? calculateRouteDistance(stops) : 0,
      improvementPercentage: 0,
      route: stops || [],
      iterations: 0
    };
  }

  // Make a deep copy of stops
  let route = stops.map(s => ({ ...s }));
  let originalDistance = calculateRouteDistance(route);
  let bestDistance = originalDistance;
  let improved = true;
  let iterations = 0;

  while (improved) {
    improved = false;

    for (let i = 1; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        // Try reversing the segment between i and j
        const newRoute = [
          ...route.slice(0, i),
          ...route.slice(i, j + 1).reverse(),
          ...route.slice(j + 1)
        ];

        const newDistance = calculateRouteDistance(newRoute);

        if (newDistance < bestDistance - 0.001) {
          route = newRoute;
          bestDistance = newDistance;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
    iterations++;
  }

  const optimizedDistance = Math.round(bestDistance * 100) / 100;
  const improvementPercentage = originalDistance > 0
    ? Math.round(((originalDistance - optimizedDistance) / originalDistance) * 10000) / 100
    : 0;

  return {
    originalDistance: Math.round(originalDistance * 100) / 100,
    optimizedDistance,
    improvementPercentage,
    route,
    iterations
  };
}
