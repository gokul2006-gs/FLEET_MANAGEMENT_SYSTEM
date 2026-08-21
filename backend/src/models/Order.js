import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: () => `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: -180,
    max: 180
  },
  packageWeight: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  packageVolume: {
    type: Number,
    default: 0.1,
    min: 0
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  timeWindowStart: {
    type: String,
    default: '09:00'
  },
  timeWindowEnd: {
    type: String,
    default: '18:00'
  },
  serviceTime: {
    type: Number,
    default: 5,
    min: 0,
    description: 'Minutes spent at this stop'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled'],
    default: 'pending'
  },
  assignedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  actualArrivalTime: Date,
  actualDepartureTime: Date,
  deliveryNotes: String,
  depotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Depot',
    default: null
  }
}, { timestamps: true });

orderSchema.index({ status: 1 });
orderSchema.index({ latitude: 1, longitude: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ assignedRoute: 1 });

export default mongoose.model('Order', orderSchema);
