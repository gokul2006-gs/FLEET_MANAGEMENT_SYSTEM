const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    licenseNumber: { type: String, unique: true, required: true },
    contactNumber: { type: String, required: true },
    status: { type: String, enum: ['Available', 'On Trip', 'Off Duty'], default: 'Available' },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    rating: { type: Number, default: 5.0 },
    totalTrips: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
