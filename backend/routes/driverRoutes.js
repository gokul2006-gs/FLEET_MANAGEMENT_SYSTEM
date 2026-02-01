const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');

// Get all drivers
router.get('/', async (req, res) => {
    try {
        const drivers = await Driver.find().populate('assignedVehicle', 'make model vin');
        res.json(drivers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a driver
router.post('/', async (req, res) => {
    const driver = new Driver(req.body);
    try {
        const newDriver = await driver.save();
        res.status(201).json(newDriver);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
