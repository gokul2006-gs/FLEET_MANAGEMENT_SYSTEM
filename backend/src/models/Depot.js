import mongoose from 'mongoose';

const depotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    default: 1000
  },
  operatingHours: {
    start: { type: String, default: '08:00' },
    end: { type: String, default: '20:00' }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Depot', depotSchema);
