import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineTruck, HiOutlinePlus, HiOutlineSearch, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle, HiOutlineXCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DEMO_VEHICLES = [
  { _id: 'v1', vehicleNumber: 'DL-01-AB-1234', vehicleType: 'van', capacity: 200, currentLoad: 145, fuelType: 'diesel', status: 'active', driver: 'Arun Kumar', currentRoute: 'R-001', fuelLevel: 72, mileage: 15420 },
  { _id: 'v2', vehicleNumber: 'DL-02-CD-5678', vehicleType: 'truck', capacity: 500, currentLoad: 380, fuelType: 'diesel', status: 'active', driver: 'Priya Sharma', currentRoute: 'R-002', fuelLevel: 58, mileage: 23100 },
  { _id: 'v3', vehicleNumber: 'DL-03-EF-9012', vehicleType: 'van', capacity: 150, currentLoad: 72, fuelType: 'petrol', status: 'active', driver: 'Rajesh Gupta', currentRoute: 'R-003', fuelLevel: 85, mileage: 8900 },
  { _id: 'v4', vehicleNumber: 'DL-04-GH-3456', vehicleType: 'motorcycle', capacity: 50, currentLoad: 0, fuelType: 'petrol', status: 'idle', driver: 'Vikram Singh', currentRoute: null, fuelLevel: 92, mileage: 5600 },
  { _id: 'v5', vehicleNumber: 'DL-05-IJ-7890', vehicleType: 'van', capacity: 200, currentLoad: 120, fuelType: 'electric', status: 'active', driver: 'Meera Patel', currentRoute: 'R-004', fuelLevel: 45, mileage: 12300 },
  { _id: 'v6', vehicleNumber: 'MH-12-KL-1357', vehicleType: 'truck', capacity: 400, currentLoad: 0, fuelType: 'diesel', status: 'maintenance', driver: null, currentRoute: null, fuelLevel: 30, mileage: 45000 },
  { _id: 'v7', vehicleNumber: 'MH-12-MN-2468', vehicleType: 'van', capacity: 150, currentLoad: 95, fuelType: 'cng', status: 'active', driver: 'Deepak Mishra', currentRoute: 'R-005', fuelLevel: 67, mileage: 19800 },
  { _id: 'v8', vehicleNumber: 'KA-01-OP-3579', vehicleType: 'bicycle', capacity: 20, currentLoad: 8, fuelType: 'electric', status: 'idle', driver: 'Ananya Das', currentRoute: null, fuelLevel: 100, mileage: 2100 },
  { _id: 'v9', vehicleNumber: 'TN-01-QR-4680', vehicleType: 'van', capacity: 200, currentLoad: 178, fuelType: 'diesel', status: 'active', driver: 'Neha Kapoor', currentRoute: 'R-006', fuelLevel: 54, mileage: 31200 },
  { _id: 'v10', vehicleNumber: 'UP-16-ST-5791', vehicleType: 'truck', capacity: 500, currentLoad: 120, fuelType: 'diesel', status: 'idle', driver: 'Suresh Reddy', currentRoute: null, fuelLevel: 88, mileage: 8700 },
  { _id: 'v11', vehicleNumber: 'UP-32-UV-6802', vehicleType: 'van', capacity: 150, currentLoad: 140, fuelType: 'petrol', status: 'active', driver: 'Kavita Nair', currentRoute: 'R-007', fuelLevel: 42, mileage: 27600 },
  { _id: 'v12', vehicleNumber: 'GJ-01-WX-7913', vehicleType: 'motorcycle', capacity: 30, currentLoad: 0, fuelType: 'electric', status: 'offline', driver: null, currentRoute: null, fuelLevel: 15, mileage: 4200 },
];

const STATUS_CONFIG = {
  active: { color: 'badge-success', label: 'Active' },
  idle: { color: 'badge-warning', label: 'Idle' },
  maintenance: { color: 'badge-danger', label: 'Maintenance' },
  offline: { color: 'bg-gray-500/10 text-gray-400', label: 'Offline' },
};

const TYPE_ICONS = {
  van: '🚐', truck: '🚛', motorcycle: '🏍️', bicycle: '🚲'
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState(DEMO_VEHICLES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = vehicles.filter(v => {
    if (search && !v.vehicleNumber.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vehicles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{vehicles.length} vehicles in fleet</p>
        </div>
        <button onClick={() => toast.success('Vehicle created')} className="btn-primary text-sm"><HiOutlinePlus className="w-4 h-4" /> Add Vehicle</button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input id="vehicle-search" name="vehicleSearch" type="text" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} className="input-field w-full pl-10" />
        </div>
        <select id="vehicle-status-filter" name="vehicleStatusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="idle">Idle</option>
          <option value="maintenance">Maintenance</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto">
        {filtered.map((vehicle, idx) => {
          const utilization = vehicle.capacity > 0 ? Math.round((vehicle.currentLoad / vehicle.capacity) * 100) : 0;
          const statusConf = STATUS_CONFIG[vehicle.status];
          return (
            <motion.div
              key={vehicle._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="glass-panel p-4 hover:border-dark-hover transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{TYPE_ICONS[vehicle.vehicleType]}</span>
                  <div>
                    <p className="font-semibold text-white text-sm">{vehicle.vehicleNumber}</p>
                    <p className="text-xs text-gray-500 capitalize">{vehicle.vehicleType}</p>
                  </div>
                </div>
                <span className={`badge ${statusConf.color}`}>{statusConf.label}</span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Driver</span>
                  <span className="text-gray-300">{vehicle.driver || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Route</span>
                  <span className="text-primary">{vehicle.currentRoute || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fuel</span>
                  <span className="text-gray-300">{vehicle.fuelLevel}%</span>
                </div>

                {/* Capacity */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Capacity</span>
                    <span className="text-gray-300 text-xs">{vehicle.currentLoad} / {vehicle.capacity} kg</span>
                  </div>
                  <div className="w-full bg-dark-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        utilization > 90 ? 'bg-danger' : utilization > 70 ? 'bg-warning' : 'bg-primary'
                      }`}
                      style={{ width: `${utilization}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-0.5">{utilization}% utilized</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
