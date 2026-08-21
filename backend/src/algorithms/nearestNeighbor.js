import { haversine } from './haversine.js';

/**
 * Nearest Neighbor algorithm for multi-stop route sequencing.
 * Starting from the depot, greedily selects the nearest unvisited stop.
 *
 * @param {Object} depot - { latitude, longitude, id }
 * @param {Array} stops - Array of { id, latitude, longitude, ... }
 * @returns {Object} { route, totalDistance, totalDuration }
 */
export function nearestNeighbor(depot, stops) {
  if (!stops || stops.length === 0) {
    return {
      route: [depot.id],
      totalDistance: 0,
      totalDuration: 0,
      orderedStops: []
    };
  }

  const unvisited = new Set(stops.map(s => s.id));
  const route = [depot.id];
  const orderedStops = [];
  let totalDistance = 0;
  let currentLat = depot.latitude;
  let currentLon = depot.longitude;
  let currentId = depot.id;

  while (unvisited.size > 0) {
    let nearestId = null;
    let nearestDist = Infinity;
    let nearestStop = null;

    for (const stopId of unvisited) {
      const stop = stops.find(s => s.id === stopId);
      if (!stop) continue;

      const dist = haversine(currentLat, currentLon, stop.latitude, stop.longitude);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestId = stopId;
        nearestStop = stop;
      }
    }

    if (nearestId) {
      unvisited.delete(nearestId);
      route.push(nearestId);
      totalDistance += nearestDist;
      orderedStops.push({
        id: nearestId,
        distanceFromPrevious: Math.round(nearestDist * 100) / 100,
        ...nearestStop
      });
      currentLat = nearestStop.latitude;
      currentLon = nearestStop.longitude;
      currentId = nearestId;
    }
  }

  // Return to depot
  const returnDist = haversine(currentLat, currentLon, depot.latitude, depot.longitude);
  totalDistance += returnDist;
  route.push(depot.id);

  return {
    route,
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalDuration: Math.round((totalDistance / 30) * 60), // 30 km/h avg
    orderedStops
  };
}
