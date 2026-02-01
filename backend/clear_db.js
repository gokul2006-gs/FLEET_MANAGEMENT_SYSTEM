const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Route = require('./models/Route');

dotenv.config();

const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.log("Could not set custom DNS servers");
}

const clearData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        console.log('MongoDB Connected for Clearing');

        // Clear existing data
        await Vehicle.deleteMany({});
        await Driver.deleteMany({});
        await Route.deleteMany({});

        console.log('Database Cleared Successfully! 🗑️');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

clearData();
