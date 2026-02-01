const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

// Get all routes
router.get('/', async (req, res) => {
    try {
        const routes = await Route.find()
            .populate('vehicleId', 'make model')
            .populate('driverId', 'name');
        res.json(routes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Log a completed route (Calculates efficiency)
router.post('/', async (req, res) => {
    const { distanceKm, fuelConsumedLiters } = req.body;

    // Auto-calculate efficiency if data provided
    let efficiency = 0;
    if (distanceKm && fuelConsumedLiters) {
        efficiency = distanceKm / fuelConsumedLiters;
    }

    const route = new Route({
        ...req.body,
        efficiency
    });

    try {
        const newRoute = await route.save();
        res.status(201).json(newRoute);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
