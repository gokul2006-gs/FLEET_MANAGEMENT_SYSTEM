const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const { protect } = require('../middleware/authMiddleware');

// Get all drivers (Filtered by User)
router.get('/', protect, async (req, res) => {
    try {
        const drivers = await Driver.find({ user: req.userId }).populate('assignedVehicle', 'make model vin');
        res.json(drivers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a driver
router.post('/', protect, async (req, res) => {
    const driver = new Driver({
        ...req.body,
        user: req.userId
    });
    try {
        const newDriver = await driver.save();
        res.status(201).json(newDriver);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
