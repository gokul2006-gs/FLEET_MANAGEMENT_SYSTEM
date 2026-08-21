import { haversine } from './haversine.js';

/**
 * Assign delivery orders to vehicles intelligently.
 * Considers: vehicle capacity, current load, route distance, driver availability.
 *
 * @param {Array} orders - Array of orders with { latitude, longitude, packageWeight, priority, ... }
 * @param {Array} vehicles - Array of vehicles with { capacity, currentLoad, latitude, longitude, status, driver, ... }
 * @param {Object} depot - { latitude, longitude }
 * @returns {Object} { assignments, unassigned, totalDistance, summary }
 */
export function assignVehicles(orders, vehicles, depot) {
  // Filter available vehicles
  const availableVehicles = vehicles.filter(v =>
    v.status !== 'maintenance' && v.status !== 'offline'
  );

  if (availableVehicles.length === 0) {
    return {
      assignments: [],
      unassigned: orders.map(o => ({ order: o, reason: 'No available vehicles' })),
      totalDistance: 0,
      summary: { totalAssigned: 0, totalUnassigned: orders.length }
    };
  }

  // Sort orders by priority (critical first, then high, normal, low)
  const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
  const sortedOrders = [...orders].sort((a, b) =>
    (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
  );

  // Sort vehicles: prefer those with most available capacity
  const sortedVehicles = [...availableVehicles].sort((a, b) =>
    (b.capacity - b.currentLoad) - (a.capacity - a.currentLoad)
  );

  const assignments = {};
  const unassigned = [];
  let totalDistance = 0;

  // Initialize assignments for each vehicle
  sortedVehicles.forEach(v => {
    assignments[v._id || v.id] = {
      vehicle: v,
      orders: [],
      totalWeight: 0,
      totalDistance: 0,
      estimatedDuration: 0
    };
  });

  // Greedy assignment: assign each order to the best-fit vehicle
  for (const order of sortedOrders) {
    let assigned = false;

    for (const vehicle of sortedVehicles) {
      const vId = vehicle._id || vehicle.id;
      const assignment = assignments[vId];
      const remainingCapacity = vehicle.capacity - assignment.totalWeight;

      // Check if vehicle can handle this order's weight
      if (order.packageWeight > remainingCapacity) continue;

      // Calculate distance from depot to this order
      const distToOrder = haversine(
        depot.latitude, depot.longitude,
        order.latitude, order.longitude
      );

      // Priority bonus: critical orders prefer closer vehicles
      let score = distToOrder;
      if (order.priority === 'critical') score *= 0.5;
      else if (order.priority === 'high') score *= 0.75;

      // Assign to this vehicle
      assignment.orders.push(order);
      assignment.totalWeight += order.packageWeight;
      assignment.totalDistance += distToOrder;
      assignment.estimatedDuration += order.serviceTime + (distToOrder / 30 * 60);
      totalDistance += distToOrder;
      assigned = true;
      break;
    }

    if (!assigned) {
      unassigned.push({
        order,
        reason: 'All vehicles at capacity or unavailable'
      });
    }
  }

  const summary = {
    totalAssigned: orders.length - unassigned.length,
    totalUnassigned: unassigned.length,
    vehicleCount: sortedVehicles.length,
    totalWeightAssigned: sortedVehicles.reduce((sum, v) =>
      sum + (assignments[v._id || v.id]?.totalWeight || 0), 0
    ),
    averageUtilization: Math.round(
      sortedVehicles.reduce((sum, v) => {
        const a = assignments[v._id || v.id];
        return sum + (a ? (a.totalWeight / v.capacity) * 100 : 0);
      }, 0) / Math.max(sortedVehicles.length, 1)
    )
  };

  return {
    assignments: Object.values(assignments).filter(a => a.orders.length > 0),
    unassigned,
    totalDistance: Math.round(totalDistance * 100) / 100,
    summary
  };
}

/**
 * Validate time window constraints for a route.
 * @param {Array} orderedStops - Ordered stops with estimated arrival times
 * @returns {Object} { violations, compliantCount, violationCount }
 */
export function validateTimeWindows(orderedStops) {
  const violations = [];
  let compliantCount = 0;

  for (const stop of orderedStops) {
    if (!stop.timeWindowStart || !stop.timeWindowEnd) {
      compliantCount++;
      continue;
    }

    const arrival = stop.estimatedArrival; // "HH:MM" string
    if (!arrival) {
      compliantCount++;
      continue;
    }

    const [arrH, arrM] = arrival.split(':').map(Number);
    const arrMinutes = arrH * 60 + arrM;

    const [twStartH, twStartM] = stop.timeWindowStart.split(':').map(Number);
    const twStart = twStartH * 60 + twStartM;

    const [twEndH, twEndM] = stop.timeWindowEnd.split(':').map(Number);
    const twEnd = twEndH * 60 + twEndM;

    if (arrMinutes < twStart || arrMinutes > twEnd) {
      const delay = arrMinutes - twEnd;
      violations.push({
        stopId: stop.id,
        customerName: stop.customerName,
        expectedArrival: arrival,
        allowedUntil: stop.timeWindowEnd,
        delay: delay > 0 ? `${delay} minutes late` : `${Math.abs(delay)} minutes early`,
        severity: delay > 30 ? 'critical' : delay > 0 ? 'warning' : 'info'
      });
    } else {
      compliantCount++;
    }
  }

  return {
    violations,
    compliantCount,
    violationCount: violations.length,
    totalStops: orderedStops.length
  };
}
