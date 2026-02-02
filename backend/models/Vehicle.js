const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    vin: { type: String, unique: true, required: true },
    year: { type: Number, required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    status: { type: String, enum: ['Active', 'Maintenance', 'Inactive'], default: 'Active' },
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
    currentFuelLevel: { type: Number, default: 100 }, // Percentage
    mileage: { type: Number, default: 0 },
    condition: { type: String, default: 'Good' }, // 'Good', 'Needs Service', 'Critical'
    lastServiceDate: { type: Date },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
