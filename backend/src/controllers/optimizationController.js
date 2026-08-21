import Order from '../models/Order.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Route from '../models/Route.js';
import Depot from '../models/Depot.js';
import Notification from '../models/Notification.js';
import { runOptimization, benchmarkAlgorithms } from '../services/optimizationService.js';
import { dijkstra } from '../algorithms/dijkstra.js';
import { aStar } from '../algorithms/aStar.js';
import { buildCompleteGraph } from '../algorithms/graphEngine.js';

export const runRouteOptimization = async (req, res) => {
  try {
    const {
      orderIds,
      depotId,
      algorithm = 'astar',
      useTwoOpt = true,
      constraints = {}
    } = req.body;

    // Fetch orders
    const orders = orderIds && orderIds.length > 0
      ? await Order.find({ _id: { $in: orderIds } })
      : await Order.find({ status: 'pending' });

    if (orders.length === 0) {
      return res.status(400).json({ success: false, message: 'No orders to optimize' });
    }

    // Fetch depot
    const depot = depotId
      ? await Depot.findById(depotId)
      : await Depot.findOne({ isActive: true });

    if (!depot) {
      return res.status(400).json({ success: false, message: 'No depot found' });
    }

    // Fetch available vehicles
    const vehicles = await Vehicle.find({ status: { $in: ['active', 'idle'] } });
    if (vehicles.length === 0) {
      return res.status(400).json({ success: false, message: 'No available vehicles' });
    }

    // Run optimization
    const result = await runOptimization({
      orders,
      vehicles,
      depot: { latitude: depot.latitude, longitude: depot.longitude, name: depot.name, _id: depot._id },
      algorithm,
      useTwoOpt,
      constraints
    });

    // Save routes to database
    const savedRoutes = [];
    for (const routeData of result.routes) {
      const route = await Route.create({
        vehicle: routeData.vehicle._id,
        driver: routeData.vehicle.driver,
        depot: depot._id,
        stops: routeData.stops.map(s => ({
          order: s.order,
          sequence: s.sequence,
          latitude: s.latitude,
          longitude: s.longitude,
          address: s.address,
          customerName: s.customerName,
          estimatedArrival: s.estimatedArrival,
          estimatedDeparture: s.estimatedDeparture,
          status: 'pending',
          serviceTime: s.serviceTime,
          distanceFromPrevious: s.distanceFromPrevious,
          timeWindowStart: s.timeWindowStart,
          timeWindowEnd: s.timeWindowEnd,
          timeWindowViolation: s.timeWindowViolation || false
        })),
        status: 'planned',
        totalDistance: routeData.totalDistance,
        totalDuration: routeData.totalDuration,
        totalStops: routeData.totalStops,
        totalCapacity: routeData.totalCapacity,
        algorithm: routeData.algorithm,
        optimizationMethod: routeData.optimizationMethod
      });

      savedRoutes.push(route);

      // Update orders
      const orderIds = routeData.stops.map(s => s.order);
      await Order.updateMany(
        { _id: { $in: orderIds } },
        { $set: { assignedRoute: route._id, assignedVehicle: routeData.vehicle._id, status: 'assigned' } }
      );
    }

    // Create notification
    await Notification.create({
      title: 'Route Optimization Complete',
      message: `${result.summary.routesGenerated} routes generated covering ${result.summary.totalDistance} km`,
      type: 'success',
      severity: 'INFO',
      category: 'route'
    });

    res.json({
      success: true,
      data: {
        routes: savedRoutes,
        summary: result.summary,
        unassigned: result.unassigned
      },
      message: 'Optimization complete'
    });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const runBenchmark = async (req, res) => {
  try {
    const { nodeCount = 25 } = req.query;
    const result = benchmarkAlgorithms(parseInt(nodeCount));

    // Also run multiple benchmarks
    const benchmarks = [];
    const counts = [10, 25, 50, 100, 250];
    for (const count of counts) {
      benchmarks.push(benchmarkAlgorithms(count));
    }

    res.json({
      success: true,
      data: { current: result, benchmarks }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const compareAlgorithms = async (req, res) => {
  try {
    const { locations } = req.body;

    if (!locations || locations.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 locations required' });
    }

    const graph = buildCompleteGraph(locations);
    const source = locations[0].id;
    const destination = locations[locations.length - 1].id;

    const dijkstraResult = dijkstra(graph, source, destination);
    const aStarResult = aStar(graph, source, destination);

    res.json({
      success: true,
      data: {
        dijkstra: dijkstraResult,
        astar: aStarResult,
        source,
        destination
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
