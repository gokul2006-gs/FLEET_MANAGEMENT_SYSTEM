import { buildCompleteGraph } from '../algorithms/graphEngine.js';
import { dijkstra } from '../algorithms/dijkstra.js';
import { aStar } from '../algorithms/aStar.js';
import { nearestNeighbor } from '../algorithms/nearestNeighbor.js';
import { twoOpt } from '../algorithms/twoOpt.js';
import { assignVehicles, validateTimeWindows } from '../algorithms/vehicleAssignment.js';
import { haversine, estimateTravelTime } from '../algorithms/haversine.js';

/**
 * Run full route optimization pipeline.
 *
 * Pipeline: Orders → Graph → Dijkstra/A* → Multi-stop → 2-opt → Vehicle Assignment → Constraints → Optimized Routes
 */
export async function runOptimization(params) {
  const {
    orders,
    vehicles,
    depot,
    algorithm = 'astar',
    useTwoOpt = true,
    constraints = {}
  } = params;

  const startTime = performance.now();

  // Step 1: Build graph from all locations
  const allLocations = [
    { id: 'depot', latitude: depot.latitude, longitude: depot.longitude, name: depot.name || 'Depot' },
    ...orders.map(o => ({
      id: o._id?.toString() || o.id,
      latitude: o.latitude,
      longitude: o.longitude,
      address: o.address,
      customerName: o.customerName,
      packageWeight: o.packageWeight,
      priority: o.priority,
      timeWindowStart: o.timeWindowStart,
      timeWindowEnd: o.timeWindowEnd,
      serviceTime: o.serviceTime || 5
    }))
  ];

  const graph = buildCompleteGraph(allLocations);

  // Step 2: Run pairwise pathfinding (Dijkstra or A*)
  const pathResults = {};
  const algorithmFn = algorithm === 'dijkstra' ? dijkstra : aStar;

  // Find shortest paths between depot and each stop, and between stops
  for (let i = 0; i < allLocations.length; i++) {
    for (let j = i + 1; j < allLocations.length; j++) {
      const key = `${allLocations[i].id}-${allLocations[j].id}`;
      const result = algorithmFn(graph, allLocations[i].id, allLocations[j].id);
      pathResults[key] = result;
      pathResults[`${allLocations[j].id}-${allLocations[i].id}`] = {
        ...result,
        path: [...result.path].reverse()
      };
    }
  }

  // Step 3: Assign vehicles to orders
  const vehicleAssignment = assignVehicles(orders, vehicles, depot);

  // Step 4: For each vehicle, create optimized routes
  const optimizedRoutes = [];

  for (const assignment of vehicleAssignment.assignments) {
    if (assignment.orders.length === 0) continue;

    // Step 5: Run nearest neighbor for initial sequencing
    const depotNode = { id: 'depot', latitude: depot.latitude, longitude: depot.longitude };
    const nnResult = nearestNeighbor(depotNode, assignment.orders);

    let finalStops = nnResult.orderedStops;
    let totalDistance = nnResult.totalDistance;
    let improvementPercent = 0;

    // Step 6: Apply 2-opt improvement
    if (useTwoOpt && finalStops.length >= 3) {
      const optResult = twoOpt(finalStops);
      finalStops = optResult.route;
      totalDistance = optResult.optimizedDistance;
      improvementPercent = optResult.improvementPercentage;
    }

    // Step 7: Calculate estimated arrival times
    let cumulativeTime = 0; // minutes from start
    const startTime = '09:00';
    const [startH, startM] = startTime.split(':').map(Number);

    const enrichedStops = finalStops.map((stop, index) => {
      cumulativeTime += stop.distanceFromPrevious ? estimateTravelTime(stop.distanceFromPrevious) : 0;

      const arrivalMinutes = startH * 60 + startM + cumulativeTime;
      const arrH = Math.floor(arrivalMinutes / 60);
      const arrM = Math.round(arrivalMinutes % 60);
      const estimatedArrival = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;

      cumulativeTime += stop.serviceTime || 5;

      const depMinutes = startH * 60 + startM + cumulativeTime;
      const depH = Math.floor(depMinutes / 60);
      const depM = Math.round(depMinutes % 60);
      const estimatedDeparture = `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`;

      return {
        order: stop.id,
        sequence: index + 1,
        latitude: stop.latitude,
        longitude: stop.longitude,
        address: stop.address,
        customerName: stop.customerName,
        estimatedArrival,
        estimatedDeparture,
        status: 'pending',
        serviceTime: stop.serviceTime || 5,
        distanceFromPrevious: stop.distanceFromPrevious || 0,
        timeWindowStart: stop.timeWindowStart,
        timeWindowEnd: stop.timeWindowEnd
      };
    });

    // Step 8: Validate time windows
    const timeWindowResults = validateTimeWindows(enrichedStops);

    // Mark violations on stops
    enrichedStops.forEach(stop => {
      const violation = timeWindowResults.violations.find(v => v.stopId === stop.order);
      if (violation) {
        stop.timeWindowViolation = true;
      }
    });

    const totalCapacity = assignment.orders.reduce((sum, o) => sum + (o.packageWeight || 0), 0);

    optimizedRoutes.push({
      vehicle: assignment.vehicle,
      depot,
      stops: enrichedStops,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalDuration: Math.round(cumulativeTime),
      totalStops: enrichedStops.length,
      totalCapacity,
      algorithm,
      optimizationMethod: useTwoOpt ? 'nearest_neighbor_2opt' : 'nearest_neighbor',
      improvementPercent,
      timeWindowViolations: timeWindowResults.violations,
      complianceRate: Math.round((timeWindowResults.compliantCount / Math.max(timeWindowResults.totalStops, 1)) * 100)
    });
  }

  const totalTime = performance.now() - startTime;

  return {
    routes: optimizedRoutes,
    unassigned: vehicleAssignment.unassigned,
    summary: {
      routesGenerated: optimizedRoutes.length,
      totalDistance: Math.round(optimizedRoutes.reduce((s, r) => s + r.totalDistance, 0) * 100) / 100,
      totalDuration: optimizedRoutes.reduce((s, r) => s + r.totalDuration, 0),
      totalOrdersAssigned: orders.length - vehicleAssignment.unassigned.length,
      totalOrdersUnassigned: vehicleAssignment.unassigned.length,
      algorithm,
      optimizationMethod: useTwoOpt ? 'Nearest Neighbor + 2-opt' : 'Nearest Neighbor',
      optimizationTime: Math.round(totalTime * 100) / 100,
      complianceRate: optimizedRoutes.length > 0
        ? Math.round(optimizedRoutes.reduce((s, r) => s + r.complianceRate, 0) / optimizedRoutes.length)
        : 100
    }
  };
}

/**
 * Run algorithm benchmark: Dijkstra vs A* on same graph.
 */
export function benchmarkAlgorithms(nodeCount = 25) {
  // Generate random nodes
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `node-${i}`,
      latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
      longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
      name: `Node ${i}`
    });
  }

  const graph = buildCompleteGraph(nodes);
  const source = nodes[0].id;
  const destination = nodes[nodes.length - 1].id;

  // Run Dijkstra
  const dijkstraResult = dijkstra(graph, source, destination);

  // Run A*
  const aStarResult = aStar(graph, source, destination);

  // Estimate memory usage (rough)
  const baseMemory = nodeCount * 0.5; // KB
  const dijkstraMemory = baseMemory + (dijkstraResult.nodesExplored * 0.1);
  const aStarMemory = baseMemory + (aStarResult.nodesExplored * 0.1);

  return {
    nodeCount,
    source,
    destination,
    dijkstra: {
      executionTime: dijkstraResult.executionTime,
      nodesExplored: dijkstraResult.nodesExplored,
      distance: dijkstraResult.distance,
      pathLength: dijkstraResult.path.length,
      memoryEstimate: `${(dijkstraMemory / 1024).toFixed(1)} MB`
    },
    astar: {
      executionTime: aStarResult.executionTime,
      nodesExplored: aStarResult.nodesExplored,
      distance: aStarResult.distance,
      pathLength: aStarResult.path.length,
      memoryEstimate: `${(aStarMemory / 1024).toFixed(1)} MB`
    }
  };
}
