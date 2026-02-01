const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/authMiddleware');

// Get all vehicles (Filtered by User)
router.get('/', protect, async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ user: req.userId }).populate('driverId', 'name');
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a vehicle
router.post('/', protect, async (req, res) => {
    const vehicle = new Vehicle({
        ...req.body,
        user: req.userId // Attach logged in user ID
    });
    try {
        const newVehicle = await vehicle.save();
        res.status(201).json(newVehicle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update vehicle (e.g., status, fuel)
router.patch('/:id', protect, async (req, res) => {
    try {
        // Find by ID and ensure it belongs to the user
        const vehicle = await Vehicle.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { new: true }
        );
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(vehicle);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete vehicle
router.delete('/:id', protect, async (req, res) => {
    try {
        const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json({ message: 'Vehicle deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
