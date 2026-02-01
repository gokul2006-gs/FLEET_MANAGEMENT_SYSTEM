const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    distanceKm: { type: Number },
    fuelConsumedLiters: { type: Number },
    efficiency: { type: Number }, // km per liter
    status: { type: String, enum: ['In Progress', 'Completed', 'Cancelled'], default: 'In Progress' }
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
