import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['available', 'on_trip', 'offline', 'on_break'],
    default: 'available'
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  currentRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null
  },
  currentLatitude: {
    type: Number,
    default: 28.6139
  },
  currentLongitude: {
    type: Number,
    default: 77.2090
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  onTimePercentage: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  totalDistanceDriven: {
    type: Number,
    default: 0,
    description: 'Total km driven'
  },
  performanceScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

driverSchema.index({ status: 1 });
driverSchema.index({ licenseNumber: 1 });

export default mongoose.model('Driver', driverSchema);
