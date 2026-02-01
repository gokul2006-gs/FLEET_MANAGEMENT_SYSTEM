const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');

dotenv.config();

const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.log("Could not set custom DNS servers");
}

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        console.log('MongoDB Connected for Seeding');

        // Clear existing data
        await Vehicle.deleteMany({});
        await Driver.deleteMany({});

        // Create Drivers
        const driver1 = await Driver.create({
            name: 'John Doe',
            licenseNumber: 'DL-12345',
            contactNumber: '555-0101',
            status: 'On Trip'
        });

        const driver2 = await Driver.create({
            name: 'Jane Smith',
            licenseNumber: 'DL-67890',
            contactNumber: '555-0102',
            status: 'Available'
        });

        // Create Vehicles with Locations (Lat/Lng near New York for demo)
        await Vehicle.create([
            {
                make: 'Toyota',
                model: 'Hilux',
                vin: 'VN7382',
                year: 2023,
                driverId: driver1._id,
                status: 'Active',
                fuelType: 'Diesel',
                currentFuelLevel: 75,
                condition: 'Good',
                location: { lat: 40.7128, lng: -74.0060 } // NYC
            },
            {
                make: 'Ford',
                model: 'Transit',
                vin: 'VN9921',
                year: 2022,
                driverId: driver2._id,
                status: 'Active',
                fuelType: 'Diesel',
                currentFuelLevel: 45,
                condition: 'Good',
                location: { lat: 40.730610, lng: -73.935242 } // Long Island City
            },
            {
                make: 'Tesla',
                model: 'Model 3',
                vin: 'VN1122',
                year: 2024,
                status: 'Active', // No driver
                fuelType: 'Electric',
                currentFuelLevel: 90,
                condition: 'Good',
                location: { lat: 40.7580, lng: -73.9855 } // Times Square
            },
            {
                make: 'Volvo',
                model: 'VNL',
                vin: 'VN0001',
                year: 2020,
                status: 'Maintenance',
                fuelType: 'Diesel',
                currentFuelLevel: 10,
                condition: 'Needs Service',
                location: { lat: 40.6782, lng: -73.9442 } // Brooklyn
            }
        ]);

        console.log('Database Seeded Successfully!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
