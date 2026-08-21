import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineCog, HiOutlineSearch, HiOutlineCheck, HiOutlineLightningBolt,
  HiOutlineClock, HiOutlineExclamation, HiOutlineRefresh,
  HiOutlineChevronDown, HiOutlineChevronRight, HiOutlineX
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { loadGoogleMaps } from '../services/googleMaps';

const DEMO_ORDERS = Array.from({ length: 30 }, (_, i) => {
  const names = ['Arun Kumar', 'Priya Sharma', 'Rajesh Gupta', 'Meera Patel', 'Vikram Singh', 'Ananya Das'];
  const addresses = ['12 MG Road', '45 Chandni Chowk', '78 Qutub Area', '23 Jama Masjid', '56 Red Fort', '89 Nehru Place'];
  return {
    _id: `order-${i}`,
    orderId: `ORD-${(1000 + i).toString()}`,
    customerName: names[i % names.length],
    address: addresses[i % addresses.length],
    latitude: 28.6139 + (Math.random() - 0.5) * 0.08,
    longitude: 77.2090 + (Math.random() - 0.5) * 0.08,
    packageWeight: 1 + Math.floor(Math.random() * 25),
    priority: ['low', 'normal', 'normal', 'high', 'critical'][i % 5],
    timeWindowStart: '09:00',
    timeWindowEnd: '18:00',
    serviceTime: 5,
    selected: false
  };
});

const DEMO_VEHICLES = [
  { _id: 'v1', vehicleNumber: 'DL-01-AB-1234', capacity: 200, currentLoad: 100, status: 'active' },
  { _id: 'v2', vehicleNumber: 'DL-02-CD-5678', capacity: 500, currentLoad: 200, status: 'active' },
  { _id: 'v3', vehicleNumber: 'DL-03-EF-9012', capacity: 150, currentLoad: 50, status: 'active' },
  { _id: 'v4', vehicleNumber: 'DL-04-GH-3456', capacity: 200, currentLoad: 0, status: 'idle' },
  { _id: 'v5', vehicleNumber: 'DL-05-IJ-7890', capacity: 100, currentLoad: 20, status: 'active' },
];

const OPTIMIZATION_RESULTS = [
  {
    routeId: 'R-001', vehicle: 'DL-01-AB-1234', driver: 'Arun Kumar',
    stops: [
      { customer: 'Customer A', address: '12 MG Road', eta: '09:15', status: 'completed' },
      { customer: 'Customer B', address: '45 Chandni Chowk', eta: '09:45', status: 'completed' },
      { customer: 'Customer C', address: '78 Qutub Area', eta: '10:20', status: 'in_progress' },
      { customer: 'Customer D', address: '23 Jama Masjid', eta: '10:55', status: 'pending' },
      { customer: 'Customer E', address: '56 Red Fort', eta: '11:30', status: 'pending' },
    ],
    totalDistance: 18.4, totalDuration: 142, capacity: '72 / 200 kg', color: '#2F80FF'
  },
  {
    routeId: 'R-002', vehicle: 'DL-02-CD-5678', driver: 'Priya Sharma',
    stops: [
      { customer: 'Customer F', address: '89 Nehru Place', eta: '09:30', status: 'completed' },
      { customer: 'Customer G', address: '34 Daryaganj', eta: '10:05', status: 'completed' },
      { customer: 'Customer H', address: '67 Civil Lines', eta: '10:40', status: 'completed' },
      { customer: 'Customer I', address: '90 Kalkaji', eta: '11:15', status: 'in_progress' },
    ],
    totalDistance: 24.1, totalDuration: 168, capacity: '145 / 500 kg', color: '#22D3EE'
  },
  {
    routeId: 'R-003', vehicle: 'DL-03-EF-9012', driver: 'Rajesh Gupta',
    stops: [
      { customer: 'Customer J', address: '18 Shahdara', eta: '09:20', status: 'completed' },
      { customer: 'Customer K', address: '42 Seelampur', eta: '09:50', status: 'in_progress' },
      { customer: 'Customer L', address: '15 Rajiv Chowk', eta: '10:25', status: 'pending' },
    ],
    totalDistance: 12.8, totalDuration: 95, capacity: '48 / 150 kg', color: '#8B5CF6'
  }
];

export default function Optimization() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [algorithm, setAlgorithm] = useState('astar');
  const [useTwoOpt, setUseTwoOpt] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeProgress, setOptimizeProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    let cancelled = false;

    loadGoogleMaps().then(google => {
      if (cancelled || !mapContainer.current || map.current) return;

      map.current = new google.maps.Map(mapContainer.current, {
        center: { lat: 28.6139, lng: 77.2090 },
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        styles: [{ elementType: 'geometry', stylers: [{ color: '#0D1422' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] }, { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070B14' }] }],
      });
    }).catch(e => console.warn('Google Maps init skipped:', e.message));
    return () => {
      cancelled = true;
      map.current = null;
    };
  }, []);

  const toggleOrder = (id) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    const filtered = orders.filter(o => !search || o.orderId.toLowerCase().includes(search.toLowerCase()));
    setSelectedOrders(filtered.map(o => o._id));
  };

  const runOptimization = () => {
    setOptimizing(true);
    setOptimizeProgress(0);

    const stages = [
      { progress: 15, label: 'Building road graph...' },
      { progress: 35, label: `Running ${algorithm === 'astar' ? 'A*' : 'Dijkstra'}...` },
      { progress: 55, label: 'Sequencing stops (Nearest Neighbor)...' },
      { progress: 75, label: 'Improving routes (2-opt)...' },
      { progress: 90, label: 'Assigning vehicles...' },
      { progress: 100, label: '✓ Optimization complete' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < stages.length) {
        setOptimizeProgress(stages[i].progress);
        i++;
      } else {
        clearInterval(interval);
        setOptimizing(false);
        setResults(OPTIMIZATION_RESULTS);
        toast.success('Route optimization complete!');
      }
    }, 600);
  };

  const filteredOrders = orders.filter(o =>
    !search || o.orderId.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Route Optimization</h1>
          <p className="text-sm text-gray-500 mt-0.5">Select orders, configure algorithm, and optimize routes</p>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Panel - Orders */}
        <div className="w-72 glass-panel-solid flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-3 border-b border-dark-border">
            <div className="relative">
              <HiOutlineSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
              <input id="optimization-order-search" name="optimizationOrderSearch" type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="input-field w-full pl-8 text-xs py-2" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{selectedOrders.length} selected / {filteredOrders.length} total</span>
              <button onClick={selectAll} className="text-xs text-primary hover:text-primary-light">Select All</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredOrders.map(order => (
              <div
                key={order._id}
                onClick={() => toggleOrder(order._id)}
                className={`p-2 rounded-lg cursor-pointer transition-all border ${
                  selectedOrders.includes(order._id)
                    ? 'bg-primary/10 border-primary/30'
                    : 'border-transparent hover:bg-dark-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-primary">{order.orderId}</span>
                  <span className={`badge text-[10px] ${
                    order.priority === 'critical' ? 'badge-danger' :
                    order.priority === 'high' ? 'badge-warning' : 'badge-info'
                  }`}>{order.priority}</span>
                </div>
                <p className="text-xs text-white mt-0.5">{order.customerName}</p>
                <p className="text-[10px] text-gray-500 truncate">{order.address} • {order.packageWeight}kg</p>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Map */}
        <div className="flex-1 glass-panel-solid overflow-hidden relative">
          <div ref={mapContainer} className="w-full h-full" />

          {/* Optimization Progress Overlay */}
          <AnimatePresence>
            {optimizing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center z-[1000]"
              >
                <div className="glass-panel p-8 text-center max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <HiOutlineCog className="text-primary text-3xl animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Optimizing Routes</h3>
                  <p className="text-sm text-gray-400 mb-4">Building road graph, running algorithms...</p>
                  <div className="w-full bg-dark-secondary rounded-full h-2 mb-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${optimizeProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{optimizeProgress}% complete</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Settings & Results */}
        <div className="w-80 glass-panel-solid flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-dark-border">
            <h3 className="text-sm font-semibold text-white mb-3">Optimization Settings</h3>

            <div className="space-y-3">
              <div>
                <label htmlFor="optimization-depot" className="block text-xs text-gray-500 mb-1.5">Depot</label>
                <select id="optimization-depot" name="optimizationDepot" className="input-field w-full text-xs">
                  <option>Central Depot — Moti Nagar</option>
                </select>
              </div>

              <div>
                <p className="block text-xs text-gray-500 mb-1.5">Routing Algorithm</p>
                <div className="flex gap-2">
                  {['astar', 'dijkstra'].map(algo => (
                    <button
                      key={algo}
                      onClick={() => setAlgorithm(algo)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition border ${
                        algorithm === algo
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'border-dark-border text-gray-400 hover:bg-dark-hover'
                      }`}
                    >
                      {algo === 'astar' ? 'A*' : 'Dijkstra'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">2-opt Improvement</span>
                <button
                  onClick={() => setUseTwoOpt(!useTwoOpt)}
                  className={`w-10 h-5 rounded-full transition-all relative ${useTwoOpt ? 'bg-primary' : 'bg-dark-secondary'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${useTwoOpt ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex gap-2 text-xs">
                <span className="text-gray-500">Algorithm:</span>
                <span className="text-primary font-medium">{algorithm === 'astar' ? 'A*' : 'Dijkstra'}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-gray-500">Optimization:</span>
                <span className="text-cyan font-medium">Nearest Neighbor{useTwoOpt ? ' + 2-opt' : ''}</span>
              </div>
            </div>

            <button
              onClick={runOptimization}
              disabled={optimizing || selectedOrders.length === 0}
              className="w-full btn-primary justify-center mt-4 py-2.5 disabled:opacity-40"
            >
              {optimizing ? (
                <span className="flex items-center gap-2">
                  <HiOutlineCog className="w-4 h-4 animate-spin" /> Optimizing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <HiOutlineLightningBolt className="w-4 h-4" /> Optimize Routes
                </span>
              )}
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4">
            {results ? (
              <div className="space-y-3">
                {/* Summary */}
                <div className="glass-panel p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineCheck className="text-success w-4 h-4" />
                    <span className="text-sm font-semibold text-white">Optimization Complete</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-500">Routes</span><p className="text-white font-semibold">{results.length}</p></div>
                    <div><span className="text-gray-500">Total Distance</span><p className="text-white font-semibold">{results.reduce((s, r) => s + r.totalDistance, 0).toFixed(1)} km</p></div>
                    <div><span className="text-gray-500">Total Duration</span><p className="text-white font-semibold">{Math.floor(results.reduce((s, r) => s + r.totalDuration, 0) / 60)}h {results.reduce((s, r) => s + r.totalDuration, 0) % 60}m</p></div>
                    <div><span className="text-gray-500">Distance Saved</span><p className="text-success font-semibold">12.4%</p></div>
                  </div>
                </div>

                {/* Route Cards */}
                {results.map((route, idx) => (
                  <motion.div
                    key={route.routeId}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`glass-panel p-3 cursor-pointer transition-all ${
                      selectedRoute === route.routeId ? 'border-primary/50' : 'hover:border-dark-hover'
                    }`}
                    onClick={() => setSelectedRoute(selectedRoute === route.routeId ? null : route.routeId)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: route.color }}></div>
                        <span className="text-sm font-semibold text-white">{route.routeId}</span>
                      </div>
                      <span className="text-xs text-gray-500">{route.stops.length} stops</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{route.vehicle} • {route.driver}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>{route.totalDistance} km</span>
                      <span>{Math.floor(route.totalDuration / 60)}h {route.totalDuration % 60}m</span>
                      <span>{route.capacity}</span>
                    </div>

                    {/* Expanded stops */}
                    <AnimatePresence>
                      {selectedRoute === route.routeId && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 pt-2 border-t border-dark-border overflow-hidden"
                        >
                          {route.stops.map((stop, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-2 py-1.5">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                stop.status === 'completed' ? 'bg-success/20 text-success' :
                                stop.status === 'in_progress' ? 'bg-primary/20 text-primary' :
                                'bg-dark-secondary text-gray-400'
                              }`}>{sIdx + 1}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-white">{stop.customer}</p>
                                <p className="text-[10px] text-gray-500">{stop.address}</p>
                              </div>
                              <span className="text-[10px] text-gray-400">{stop.eta}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <HiOutlineCog className="w-10 h-10 text-gray-700 mb-3" />
                <p className="text-sm text-gray-500">Select orders and run optimization</p>
                <p className="text-xs text-gray-600 mt-1">Results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
