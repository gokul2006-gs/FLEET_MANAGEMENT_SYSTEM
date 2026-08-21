import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMap, HiOutlineClock, HiOutlineTruck, HiOutlineArrowRight } from 'react-icons/hi';

const DEMO_ROUTES = [
  { _id: 'r1', routeId: 'R-001', vehicle: 'DL-01-AB-1234', driver: 'Arun Kumar', status: 'active', stops: 18, completed: 14, distance: 48.2, duration: 142, capacity: '72 / 200 kg', progress: 78, algorithm: 'astar' },
  { _id: 'r2', routeId: 'R-002', vehicle: 'DL-02-CD-5678', driver: 'Priya Sharma', status: 'active', stops: 12, completed: 8, distance: 35.6, duration: 168, capacity: '145 / 500 kg', progress: 67, algorithm: 'astar' },
  { _id: 'r3', routeId: 'R-003', vehicle: 'DL-03-EF-9012', driver: 'Rajesh Gupta', status: 'active', stops: 15, completed: 11, distance: 28.4, duration: 112, capacity: '48 / 150 kg', progress: 73, algorithm: 'dijkstra' },
  { _id: 'r4', routeId: 'R-004', vehicle: 'DL-05-IJ-7890', driver: 'Meera Patel', status: 'planned', stops: 20, completed: 0, distance: 42.1, duration: 195, capacity: '38 / 200 kg', progress: 0, algorithm: 'astar' },
  { _id: 'r5', routeId: 'R-005', vehicle: 'MH-12-MN-2468', driver: 'Deepak Mishra', status: 'active', stops: 10, completed: 6, distance: 18.9, duration: 85, capacity: '25 / 150 kg', progress: 60, algorithm: 'astar' },
  { _id: 'r6', routeId: 'R-006', vehicle: 'TN-01-QR-4680', driver: 'Neha Kapoor', status: 'completed', stops: 16, completed: 16, distance: 31.2, duration: 156, capacity: '89 / 200 kg', progress: 100, algorithm: 'dijkstra' },
  { _id: 'r7', routeId: 'R-007', vehicle: 'UP-32-UV-6802', driver: 'Kavita Nair', status: 'active', stops: 14, completed: 10, distance: 26.7, duration: 128, capacity: '62 / 150 kg', progress: 71, algorithm: 'astar' },
  { _id: 'r8', routeId: 'R-008', vehicle: 'DL-04-GH-3456', driver: 'Vikram Singh', status: 'planned', stops: 8, completed: 0, distance: 15.3, duration: 72, capacity: '0 / 200 kg', progress: 0, algorithm: 'astar' },
];

const STATUS_CONFIG = {
  planned: { color: 'badge-info', label: 'Planned' },
  active: { color: 'badge-success', label: 'Active' },
  completed: { color: 'bg-gray-500/10 text-gray-400', label: 'Completed' },
  cancelled: { color: 'badge-danger', label: 'Cancelled' },
};

export default function RoutesPage() {
  const [routes] = useState(DEMO_ROUTES);
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = routes.filter(r => !statusFilter || r.status === statusFilter);

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Routes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{routes.length} routes</p>
        </div>
        <select id="route-status-filter" name="routeStatusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field">
          <option value="">All Statuses</option>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto">
        {filtered.map((route, idx) => {
          const statusConf = STATUS_CONFIG[route.status];
          return (
            <motion.div
              key={route._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Link to={`/routes/${route._id}`} className="block glass-panel p-4 hover:border-dark-hover transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${route.status === 'active' ? 'bg-success animate-pulse' : route.status === 'completed' ? 'bg-gray-500' : 'bg-primary'}`}></div>
                    <span className="font-semibold text-white">{route.routeId}</span>
                  </div>
                  <span className={`badge ${statusConf.color}`}>{statusConf.label}</span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-400 mb-3">
                  <div className="flex items-center gap-2"><HiOutlineTruck className="w-3.5 h-3.5" /><span>{route.vehicle}</span></div>
                  <div className="flex items-center gap-2"><HiOutlineMap className="w-3.5 h-3.5" /><span>{route.driver}</span></div>
                  <div className="flex items-center gap-2"><HiOutlineClock className="w-3.5 h-3.5" /><span>{route.stops} stops • {route.distance} km • {Math.floor(route.duration / 60)}h {route.duration % 60}m</span></div>
                </div>

                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-500">{route.completed}/{route.stops} stops</span>
                  <span className="text-[10px] text-gray-500">{route.progress}%</span>
                </div>
                <div className="w-full bg-dark-secondary rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${route.progress}%` }}></div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-gray-600">{route.algorithm === 'astar' ? 'A*' : 'Dijkstra'} • {route.capacity}</span>
                  <HiOutlineArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-primary transition" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
