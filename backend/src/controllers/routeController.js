import Route from '../models/Route.js';
import Order from '../models/Order.js';
import Vehicle from '../models/Vehicle.js';

export const createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, data: route, message: 'Route created' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRoutes = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { routeId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Route.countDocuments(query);
    const routes = await Route.find(query)
      .populate('vehicle', 'vehicleNumber vehicleType capacity status')
      .populate('driver', 'name phone status')
      .populate('stops.order', 'orderId customerName address status')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: routes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('vehicle', 'vehicleNumber vehicleType capacity status')
      .populate('driver', 'name phone status')
      .populate('stops.order', 'orderId customerName address phone status latitude longitude');
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    res.json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    res.json({ success: true, data: route, message: 'Route updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    // Unassign orders
    await Order.updateMany(
      { assignedRoute: req.params.id },
      { $set: { assignedRoute: null, assignedVehicle: null, status: 'pending' } }
    );
    res.json({ success: true, message: 'Route deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const publishRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    route.status = 'active';
    route.startTime = new Date();
    await route.save();

    // Update vehicle status
    await Vehicle.findByIdAndUpdate(route.vehicle, { status: 'active', currentRoute: route._id });

    // Update order statuses
    const orderIds = route.stops.map(s => s.order);
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status: 'assigned', assignedRoute: route._id, assignedVehicle: route.vehicle } }
    );

    res.json({ success: true, data: route, message: 'Route published and activated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderStops = async (req, res) => {
  try {
    const { stops } = req.body; // Array of { order, sequence }
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    // Rebuild stops with new order
    const newStops = stops.map((s, i) => {
      const existingStop = route.stops.find(st => st.order.toString() === s.order);
      return {
        ...existingStop.toObject(),
        sequence: i + 1
      };
    });

    route.stops = newStops;
    await route.save();

    res.json({ success: true, data: route, message: 'Route reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRouteStats = async (req, res) => {
  try {
    const stats = await Route.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDistance: { $sum: '$totalDistance' },
          totalDuration: { $sum: '$totalDuration' },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
