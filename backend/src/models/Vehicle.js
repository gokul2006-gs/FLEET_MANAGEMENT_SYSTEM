import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['van', 'truck', 'motorcycle', 'bicycle'],
    default: 'van'
  },
  capacity: {
    type: Number,
    required: true,
    min: 0,
    description: 'Maximum capacity in kg'
  },
  currentLoad: {
    type: Number,
    default: 0,
    min: 0
  },
  fuelType: {
    type: String,
    enum: ['diesel', 'petrol', 'electric', 'cng'],
    default: 'diesel'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  latitude: {
    type: Number,
    default: 28.6139
  },
  longitude: {
    type: Number,
    default: 77.2090
  },
  status: {
    type: String,
    enum: ['active', 'idle', 'maintenance', 'offline'],
    default: 'idle'
  },
  maxSpeed: {
    type: Number,
    default: 80,
    description: 'Max speed in km/h'
  },
  currentRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null
  },
  fuelLevel: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  mileage: {
    type: Number,
    default: 0,
    description: 'Total km driven'
  },
  lastMaintenance: Date,
  nextMaintenance: Date
}, { timestamps: true });

vehicleSchema.index({ status: 1 });
vehicleSchema.index({ vehicleNumber: 1 });

vehicleSchema.virtual('utilization').get(function() {
  return this.capacity > 0 ? Math.round((this.currentLoad / this.capacity) * 100) : 0;
});

vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

export default mongoose.model('Vehicle', vehicleSchema);
