import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineUserGroup, HiOutlineSearch, HiOutlineStar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DEMO_DRIVERS = [
  { _id: 'd1', name: 'Arun Kumar', phone: '+91-9876543210', status: 'on_trip', vehicle: 'DL-01-AB-1234', route: 'R-001', deliveries: 18, completed: 14, onTime: 94, distance: 2850, score: 92, rating: 4.8 },
  { _id: 'd2', name: 'Priya Sharma', phone: '+91-9876543211', status: 'on_trip', vehicle: 'DL-02-CD-5678', route: 'R-002', deliveries: 12, completed: 8, onTime: 88, distance: 4200, score: 85, rating: 4.5 },
  { _id: 'd3', name: 'Rajesh Gupta', phone: '+91-9876543212', status: 'on_trip', vehicle: 'DL-03-EF-9012', route: 'R-003', deliveries: 15, completed: 11, onTime: 91, distance: 1950, score: 88, rating: 4.6 },
  { _id: 'd4', name: 'Vikram Singh', phone: '+91-9876543213', status: 'available', vehicle: 'DL-04-GH-3456', route: null, deliveries: 0, completed: 0, onTime: 100, distance: 3200, score: 95, rating: 4.9 },
  { _id: 'd5', name: 'Meera Patel', phone: '+91-9876543214', status: 'on_trip', vehicle: 'DL-05-IJ-7890', route: 'R-004', deliveries: 20, completed: 16, onTime: 87, distance: 3800, score: 82, rating: 4.3 },
  { _id: 'd6', name: 'Deepak Mishra', phone: '+91-9876543215', status: 'on_trip', vehicle: 'MH-12-MN-2468', route: 'R-005', deliveries: 10, completed: 6, onTime: 90, distance: 1600, score: 87, rating: 4.4 },
  { _id: 'd7', name: 'Ananya Das', phone: '+91-9876543216', status: 'available', vehicle: 'KA-01-OP-3579', route: null, deliveries: 0, completed: 0, onTime: 96, distance: 900, score: 91, rating: 4.7 },
  { _id: 'd8', name: 'Neha Kapoor', phone: '+91-9876543217', status: 'on_trip', vehicle: 'TN-01-QR-4680', route: 'R-006', deliveries: 16, completed: 12, onTime: 85, distance: 5100, score: 80, rating: 4.2 },
  { _id: 'd9', name: 'Suresh Reddy', phone: '+91-9876543218', status: 'available', vehicle: 'UP-16-ST-5791', route: null, deliveries: 0, completed: 0, onTime: 93, distance: 2400, score: 89, rating: 4.6 },
  { _id: 'd10', name: 'Kavita Nair', phone: '+91-9876543219', status: 'on_trip', vehicle: 'UP-32-UV-6802', route: 'R-007', deliveries: 14, completed: 10, onTime: 89, distance: 3500, score: 84, rating: 4.4 },
  { _id: 'd11', name: 'Amit Verma', phone: '+91-9876543220', status: 'on_break', vehicle: null, route: null, deliveries: 0, completed: 0, onTime: 92, distance: 1800, score: 86, rating: 4.5 },
  { _id: 'd12', name: 'Rahul Yadav', phone: '+91-9876543221', status: 'offline', vehicle: null, route: null, deliveries: 0, completed: 0, onTime: 0, distance: 0, score: 0, rating: 0 },
];

const STATUS_CONFIG = {
  available: { color: 'badge-success', label: 'Available' },
  on_trip: { color: 'badge-info', label: 'On Trip' },
  on_break: { color: 'badge-warning', label: 'On Break' },
  offline: { color: 'bg-gray-500/10 text-gray-400', label: 'Offline' },
};

export default function Drivers() {
  const [drivers] = useState(DEMO_DRIVERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = drivers.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Drivers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{drivers.length} drivers registered</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input id="driver-search" name="driverSearch" type="text" placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)} className="input-field w-full pl-10" />
        </div>
        <select id="driver-status-filter" name="driverStatusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field">
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="on_trip">On Trip</option>
          <option value="on_break">On Break</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <div className="flex-1 glass-panel-solid overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Driver</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Route</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Deliveries</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">On-Time %</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Distance</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Score</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((driver, idx) => {
              const statusConf = STATUS_CONFIG[driver.status] || STATUS_CONFIG.offline;
              return (
                <motion.tr key={driver._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className="border-b border-dark-border/50 hover:bg-dark-hover/30 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">{driver.name[0]}</div>
                      <div>
                        <p className="text-sm font-medium text-white">{driver.name}</p>
                        <p className="text-xs text-gray-500">{driver.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3"><span className={`badge ${statusConf.color}`}>{statusConf.label}</span></td>
                  <td className="p-3 text-sm text-gray-300">{driver.vehicle || '—'}</td>
                  <td className="p-3 text-sm text-primary">{driver.route || '—'}</td>
                  <td className="p-3 text-sm text-gray-300">{driver.completed}/{driver.deliveries}</td>
                  <td className="p-3">
                    <span className={`text-sm ${driver.onTime >= 90 ? 'text-success' : driver.onTime >= 80 ? 'text-warning' : 'text-danger'}`}>{driver.onTime}%</span>
                  </td>
                  <td className="p-3 text-sm text-gray-300">{driver.distance.toLocaleString()} km</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <div className="w-12 bg-dark-secondary rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${driver.score >= 90 ? 'bg-success' : driver.score >= 80 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${driver.score}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-400">{driver.score}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <HiOutlineStar className="w-3.5 h-3.5 text-warning" />
                      <span className="text-sm text-gray-300">{driver.rating}</span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
