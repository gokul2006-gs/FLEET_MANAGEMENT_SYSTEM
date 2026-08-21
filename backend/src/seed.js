import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import Order from './models/Order.js';
import Vehicle from './models/Vehicle.js';
import Driver from './models/Driver.js';
import Depot from './models/Depot.js';
import Notification from './models/Notification.js';

// Real coordinates for New Delhi area
const DELHI_LOCATIONS = [
  { lat: 28.6139, lng: 77.2090, name: 'Connaught Place' },
  { lat: 28.6507, lng: 77.2334, name: 'Chandni Chowk' },
  { lat: 28.5244, lng: 77.2066, name: 'Qutub Minar' },
  { lat: 28.6127, lng: 77.2296, name: 'Jama Masjid' },
  { lat: 28.6280, lng: 77.2195, name: 'Red Fort' },
  { lat: 28.5535, lng: 77.2590, name: 'Nehru Place' },
  { lat: 28.6315, lng: 77.2167, name: 'Daryaganj' },
  { lat: 28.6692, lng: 77.2292, name: 'Civil Lines' },
  { lat: 28.5733, lng: 77.2541, name: 'Kalkaji' },
  { lat: 28.6486, lng: 77.2381, name: 'Shahdara' },
  { lat: 28.6562, lng: 77.2410, name: 'Seelampur' },
  { lat: 28.6131, lng: 77.2083, name: 'Rajiv Chowk' },
  { lat: 28.6350, lng: 77.2250, name: 'ITO' },
  { lat: 28.5449, lng: 77.1930, name: 'Hauz Khas' },
  { lat: 28.6500, lng: 77.1960, name: 'Model Town' },
  { lat: 28.5813, lng: 77.3180, name: 'Mayur Vihar' },
  { lat: 28.6700, lng: 77.2100, name: 'Vijay Nagar' },
  { lat: 28.6390, lng: 77.2250, name: 'Rajendra Nagar' },
  { lat: 28.5950, lng: 77.2400, name: 'Lajpat Nagar' },
  { lat: 28.6270, lng: 77.2170, name: 'Karol Bagh' },
  { lat: 28.6120, lng: 77.2300, name: 'Paharganj' },
  { lat: 28.5700, lng: 77.2250, name: 'Mehrauli' },
  { lat: 28.6600, lng: 77.2350, name: 'Bulandshahr Road' },
  { lat: 28.5500, lng: 77.2700, name: 'Saket' },
  { lat: 28.6800, lng: 77.2100, name: 'Rohini' },
  { lat: 28.5400, lng: 77.2400, name: 'Malviya Nagar' },
  { lat: 28.6200, lng: 77.1900, name: 'Patel Nagar' },
  { lat: 28.6500, lng: 77.2700, name: 'Geeta Colony' },
  { lat: 28.5900, lng: 77.2600, name: 'Govindpuri' },
  { lat: 28.6400, lng: 77.2000, name: 'Moti Nagar' },
  { lat: 28.5600, lng: 77.2100, name: 'Vasant Kunj' },
  { lat: 28.6700, lng: 77.2500, name: 'Welcome Colony' },
  { lat: 28.6300, lng: 77.2600, name: 'Trilokpuri' },
  { lat: 28.5800, lng: 77.2000, name: 'Safdarjung' },
  { lat: 28.6100, lng: 77.2500, name: 'Preet Vihar' },
  { lat: 28.7000, lng: 77.1800, name: 'Pitampura' },
  { lat: 28.5300, lng: 77.2300, name: 'Greater Kailash' },
  { lat: 28.6400, lng: 77.2800, name: 'Laxmi Nagar' },
  { lat: 28.5750, lng: 77.1900, name: 'Defence Colony' },
  { lat: 28.6250, lng: 77.2450, name: 'Yamuna Bazar' },
  { lat: 28.6650, lng: 77.2000, name: 'Kamla Nagar' },
  { lat: 28.5550, lng: 77.2650, name: 'Badarpur' },
  { lat: 28.6950, lng: 77.2150, name: 'Prashant Vihar' },
  { lat: 28.6150, lng: 77.1750, name: 'Naraina' },
  { lat: 28.5250, lng: 77.2550, name: 'Chhattarpur' },
  { lat: 28.6850, lng: 77.2400, name: 'Shalimar Bagh' },
  { lat: 28.5450, lng: 77.2000, name: 'Pushp Vihar' },
  { lat: 28.6050, lng: 77.2200, name: 'Rajouri Garden' },
  { lat: 28.6350, lng: 77.2750, name: 'Anand Vihar' },
  { lat: 28.5650, lng: 77.1850, name: 'Sainik Farm' },
];

const CUSTOMER_NAMES = [
  'Arun Kumar', 'Priya Sharma', 'Rajesh Gupta', 'Meera Patel', 'Vikram Singh',
  'Ananya Das', 'Suresh Reddy', 'Kavita Nair', 'Deepak Mishra', 'Neha Kapoor',
  'Amit Verma', 'Shruti Jain', 'Manish Tiwari', 'Pooja Agarwal', 'Rohit Sinha',
  'Divya Saxena', 'Sanjay Bose', 'Ritu Malhotra', 'Ajay Chauhan', 'Pallavi Kulkarni',
  'Rahul Yadav', 'Simran Kaur', 'Tarun Mehta', 'Shweta Bhat', 'Gaurav Pandey',
  'Komal Rathi', 'Aditya Rao', 'Tanvi Pillai', 'Nikhil Chopra', 'Bhavna Shah',
  'Vivek Pandey', 'Monika Jha', 'Karan Malhotra', 'Sneha Rajan', 'Varun Bhatnagar',
  'Preeti Sood', 'Manoj Kumar', 'Deepika Rai', 'Ashish Garg', 'Rashmi Desai',
  'Prateek Sharma', 'Anjali Menon', 'Saurabh Tyagi', 'Nidhi Aggarwal', 'Mohit Bansal',
  'Harpreet Singh', 'Latika Bhatt', 'Sachin Jaiswal', 'Trishla Goud', 'Utkarsh Chandra'
];

const ADDRESSES = [
  '12 MG Road, Connaught Place', '45 Chandni Chowk Lane', '78 Qutub Institutional Area',
  '23 Jama Masjid Road', '56 Red Fort Marg', '89 Nehru Place Tower',
  '34 Daryaganj Market', '67 Civil Lines Block A', '90 Kalkaji Extension',
  '18 Shahdara Main Road', '42 Seelampur Colony', '15 Rajiv Chowk Circle',
  '28 ITO Crossing', '51 Hauz Khas Village', '63 Model Town Phase 2',
  '37 Mayur Vihar Phase 1', '82 Vijay Nagar', '49 Rajendra Nagar',
  '71 Lajpat Nagar Central', '25 Karol Bagh Main', '58 Paharganj Station Road',
  '93 Mehrauli Village', '14 Bulandshahr Road', '69 Saket Block B',
  '36 Rohini Sector 5', '87 Malviya Nagar', '41 Patel Nagar East',
  '22 Geeta Colony', '54 Govindpuri Extension', '76 Moti Nagar Block C',
  '88 Vasant Kunj D4', '33 Welcome Colony', '61 Trilokpuri Phase 2',
  '47 Safdarjung Enclave', '19 Preet Vihar', '95 Pitampura Sector 7',
  '29 Greater Kailash II', '52 Laxmi Nagar Main', '38 Defence Colony A Block',
  '66 Yamuna Bazar Lane', '81 Kamla Nagar', '44 Badarpur Village',
  '92 Prashant Vihar Block B', '27 Naraina Vihar', '55 Chhattarpur Farms',
  '16 Shalimar Bagh', '39 Pushp Vihar', '50 Rajouri Garden Market',
  '73 Anand Vihar Terminal', '84 Sainik Farm Colony'
];

const PHONE_NUMBERS = [
  '+91-9876543210', '+91-9876543211', '+91-9876543212', '+91-9876543213',
  '+91-9876543214', '+91-9876543215', '+91-9876543216', '+91-9876543217',
  '+91-9876543218', '+91-9876543219', '+91-9876543220', '+91-9876543221',
  '+91-9876543222', '+91-9876543223', '+91-9876543224'
];

const VEHICLE_NUMBERS = [
  'DL-01-AB-1234', 'DL-02-CD-5678', 'DL-03-EF-9012', 'DL-04-GH-3456',
  'DL-05-IJ-7890', 'MH-12-KL-1357', 'MH-12-MN-2468', 'KA-01-OP-3579',
  'TN-01-QR-4680', 'UP-16-ST-5791', 'UP-32-UV-6802', 'GJ-01-WX-7913'
];

const VEHICLE_TYPES = ['van', 'truck', 'motorcycle', 'bicycle'];
const CAPACITIES = [50, 100, 150, 200, 250, 300, 400, 500];
const FUEL_TYPES = ['diesel', 'petrol', 'electric', 'cng'];
const STATUSES = ['pending', 'pending', 'pending', 'pending', 'assigned', 'delivered'];
const PRIORITIES = ['low', 'normal', 'normal', 'normal', 'high', 'high', 'critical'];

const TIME_WINDOWS = [
  { start: '09:00', end: '12:00' },
  { start: '10:00', end: '14:00' },
  { start: '11:00', end: '15:00' },
  { start: '12:00', end: '16:00' },
  { start: '09:00', end: '18:00' },
  { start: '14:00', end: '18:00' },
  { start: '09:00', end: '13:00' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartroute');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Order.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      Depot.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@smartroute.com',
      password: 'admin123',
      role: 'admin'
    });

    const dispatcher = await User.create({
      name: 'Priya Dispatcher',
      email: 'dispatcher@smartroute.com',
      password: 'dispatch123',
      role: 'dispatcher'
    });

    // Create depot
    const depot = await Depot.create({
      name: 'SmartRoute Central Depot',
      address: 'Central Warehouse, Moti Nagar, New Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      capacity: 10000,
      operatingHours: { start: '06:00', end: '22:00' }
    });

    console.log('Created users and depot');

    // Create drivers
    const driverData = [];
    for (let i = 0; i < 12; i++) {
      const locIdx = i % DELHI_LOCATIONS.length;
      driverData.push({
        name: CUSTOMER_NAMES[i],
        phone: PHONE_NUMBERS[i % PHONE_NUMBERS.length],
        email: `driver${i + 1}@smartroute.com`,
        licenseNumber: `DL-DRV-${(1000 + i).toString()}`,
        status: i < 9 ? 'available' : 'offline',
        currentLatitude: DELHI_LOCATIONS[locIdx].lat + (Math.random() - 0.5) * 0.01,
        currentLongitude: DELHI_LOCATIONS[locIdx].lng + (Math.random() - 0.5) * 0.01,
        totalDeliveries: Math.floor(Math.random() * 500) + 50,
        completedDeliveries: Math.floor(Math.random() * 450) + 40,
        onTimePercentage: 85 + Math.random() * 15,
        totalDistanceDriven: Math.floor(Math.random() * 5000) + 500,
        performanceScore: 75 + Math.random() * 25,
        rating: 3.5 + Math.random() * 1.5
      });
    }

    const drivers = await Driver.insertMany(driverData);
    console.log(`Created ${drivers.length} drivers`);

    // Create vehicles
    const vehicleData = [];
    for (let i = 0; i < 12; i++) {
      const capacity = CAPACITIES[i % CAPACITIES.length];
      const locIdx = i % DELHI_LOCATIONS.length;
      vehicleData.push({
        vehicleNumber: VEHICLE_NUMBERS[i],
        vehicleType: VEHICLE_TYPES[i % VEHICLE_TYPES.length],
        capacity,
        currentLoad: Math.floor(Math.random() * capacity * 0.7),
        fuelType: FUEL_TYPES[i % FUEL_TYPES.length],
        driver: drivers[i]._id,
        latitude: DELHI_LOCATIONS[locIdx].lat + (Math.random() - 0.5) * 0.01,
        longitude: DELHI_LOCATIONS[locIdx].lng + (Math.random() - 0.5) * 0.01,
        status: i < 9 ? (i < 6 ? 'active' : 'idle') : 'maintenance',
        maxSpeed: VEHICLE_TYPES[i % VEHICLE_TYPES.length] === 'motorcycle' ? 60 :
                  VEHICLE_TYPES[i % VEHICLE_TYPES.length] === 'bicycle' ? 20 : 80,
        fuelLevel: 40 + Math.floor(Math.random() * 60),
        mileage: Math.floor(Math.random() * 30000) + 5000
      });
    }

    const vehicles = await Vehicle.insertMany(vehicleData);
    console.log(`Created ${vehicles.length} vehicles`);

    // Update drivers with assigned vehicles
    for (let i = 0; i < Math.min(drivers.length, vehicles.length); i++) {
      if (drivers[i].status === 'available') {
        await Driver.findByIdAndUpdate(drivers[i]._id, { assignedVehicle: vehicles[i]._id });
      }
    }

    // Create orders (100+)
    const orderData = [];
    for (let i = 0; i < 120; i++) {
      const locIdx = i % DELHI_LOCATIONS.length;
      const twIdx = i % TIME_WINDOWS.length;
      const jitter = 0.002;

      orderData.push({
        customerName: CUSTOMER_NAMES[i % CUSTOMER_NAMES.length],
        phone: PHONE_NUMBERS[i % PHONE_NUMBERS.length],
        address: ADDRESSES[i % ADDRESSES.length],
        latitude: DELHI_LOCATIONS[locIdx].lat + (Math.random() - 0.5) * jitter,
        longitude: DELHI_LOCATIONS[locIdx].lng + (Math.random() - 0.5) * jitter,
        packageWeight: 1 + Math.floor(Math.random() * 30),
        packageVolume: 0.1 + Math.random() * 2,
        priority: PRIORITIES[i % PRIORITIES.length],
        timeWindowStart: TIME_WINDOWS[twIdx].start,
        timeWindowEnd: TIME_WINDOWS[twIdx].end,
        serviceTime: 3 + Math.floor(Math.random() * 15),
        status: STATUSES[i % STATUSES.length]
      });
    }

    const orders = await Order.insertMany(orderData);
    console.log(`Created ${orders.length} orders`);

    // Create notifications
    const notificationData = [
      { title: 'Route Optimized', message: 'Route R-001 optimized successfully with 12% distance savings', type: 'success', severity: 'INFO', category: 'route' },
      { title: 'Vehicle Maintenance Due', message: 'Vehicle DL-04-GH-3456 maintenance scheduled', type: 'warning', severity: 'WARNING', category: 'vehicle' },
      { title: 'Delivery Delayed', message: 'Route R-003 delayed by 15 minutes due to traffic', type: 'warning', severity: 'WARNING', category: 'route' },
      { title: 'Critical Delivery', message: 'Order ORD-0045 has CRITICAL priority - ensure on-time delivery', type: 'critical', severity: 'CRITICAL', category: 'delivery' },
      { title: 'Driver Offline', message: 'Driver Rajesh Gupta went offline unexpectedly', type: 'info', severity: 'INFO', category: 'driver' },
      { title: 'New Orders Imported', message: '14 new delivery orders imported successfully', type: 'success', severity: 'INFO', category: 'system' },
      { title: 'Time Window Violation', message: 'Order at Kalkaji may violate delivery time window', type: 'warning', severity: 'WARNING', category: 'delivery' },
      { title: 'Route Completed', message: 'Route R-002 completed - 18/18 stops delivered', type: 'success', severity: 'INFO', category: 'route' }
    ];

    await Notification.insertMany(notificationData);
    console.log('Created notifications');

    console.log('\n✓ Seed complete!');
    console.log('Admin login: admin@smartroute.com / admin123');
    console.log('Dispatcher login: dispatcher@smartroute.com / dispatch123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
