import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  sequence: {
    type: Number,
    required: true
  },
  latitude: Number,
  longitude: Number,
  address: String,
  customerName: String,
  estimatedArrival: String,
  estimatedDeparture: String,
  actualArrival: Date,
  actualDeparture: Date,
  status: {
    type: String,
    enum: ['pending', 'completed', 'skipped', 'failed'],
    default: 'pending'
  },
  serviceTime: {
    type: Number,
    default: 5
  },
  distanceFromPrevious: {
    type: Number,
    default: 0
  },
  timeWindowStart: String,
  timeWindowEnd: String,
  timeWindowViolation: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const routeSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: true,
    unique: true,
    default: () => `R-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  depot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Depot',
    default: null
  },
  stops: [stopSchema],
  status: {
    type: String,
    enum: ['planned', 'active', 'completed', 'cancelled', 'paused'],
    default: 'planned'
  },
  totalDistance: {
    type: Number,
    default: 0,
    description: 'Total distance in km'
  },
  totalDuration: {
    type: Number,
    default: 0,
    description: 'Total duration in minutes'
  },
  totalStops: {
    type: Number,
    default: 0
  },
  completedStops: {
    type: Number,
    default: 0
  },
  totalCapacity: {
    type: Number,
    default: 0
  },
  algorithm: {
    type: String,
    enum: ['dijkstra', 'astar'],
    default: 'astar'
  },
  optimizationMethod: {
    type: String,
    enum: ['nearest_neighbor', 'nearest_neighbor_2opt', 'manual'],
    default: 'nearest_neighbor_2opt'
  },
  plannedVsActual: {
    plannedDistance: Number,
    actualDistance: Number,
    plannedDuration: Number,
    actualDuration: Number
  },
  startTime: Date,
  endTime: Date,
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isSimulated: {
    type: Boolean,
    default: false
  },
  simulationProgress: {
    currentStopIndex: { type: Number, default: 0 },
    percentComplete: { type: Number, default: 0 },
    currentPosition: {
      latitude: Number,
      longitude: Number
    }
  }
}, { timestamps: true });

routeSchema.index({ status: 1 });
routeSchema.index({ routeId: 1 });
routeSchema.index({ vehicle: 1 });

export default mongoose.model('Route', routeSchema);
