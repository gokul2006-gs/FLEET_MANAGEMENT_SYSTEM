import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineGlobe, HiOutlineTruck, HiOutlineClock, HiOutlineExclamation,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlinePlay, HiOutlinePause, HiOutlineRefresh,
  HiOutlineStop
} from 'react-icons/hi';
import { loadGoogleMaps } from '../services/googleMaps';

const ACTIVE_VEHICLES = [
  { id: 'TRK-001', driver: 'Arun Kumar', route: 'R-001', status: 'on_time', lat: 28.6280, lng: 77.2195, progress: 78, stops: '14/18', eta: '12:48 PM' },
  { id: 'TRK-002', driver: 'Priya Sharma', route: 'R-002', status: 'delayed', lat: 28.5535, lng: 77.2590, progress: 67, stops: '8/12', eta: '01:15 PM' },
  { id: 'TRK-003', driver: 'Rajesh Gupta', route: 'R-003', status: 'on_time', lat: 28.6692, lng: 77.2292, progress: 73, stops: '11/15', eta: '11:55 AM' },
  { id: 'TRK-005', driver: 'Meera Patel', route: 'R-004', status: 'on_time', lat: 28.5733, lng: 77.2541, progress: 45, stops: '9/20', eta: '02:30 PM' },
  { id: 'TRK-007', driver: 'Deepak Mishra', route: 'R-005', status: 'critical', lat: 28.6131, lng: 77.2083, progress: 60, stops: '6/10', eta: '12:25 PM' },
  { id: 'TRK-009', driver: 'Neha Kapoor', route: 'R-006', status: 'on_time', lat: 28.6562, lng: 77.2410, progress: 75, stops: '12/16', eta: '01:45 PM' },
  { id: 'TRK-010', driver: 'Kavita Nair', route: 'R-007', status: 'on_time', lat: 28.6350, lng: 77.2250, progress: 71, stops: '10/14', eta: '01:20 PM' },
];

const ALERTS = [
  { text: 'Route R-005 may violate time window at Stop 8', severity: 'critical', time: '2 min ago' },
  { text: 'Vehicle TRK-002 delayed by 15 minutes', severity: 'warning', time: '5 min ago' },
  { text: 'Route R-006 completed successfully', severity: 'success', time: '8 min ago' },
  { text: 'Vehicle TRK-008 needs maintenance', severity: 'warning', time: '12 min ago' },
  { text: 'Critical delivery ORD-045 approaching deadline', severity: 'critical', time: '15 min ago' },
];

const STATUS_STYLE = {
  on_time: { color: 'text-success', bg: 'bg-success/10', label: '● On Time', dot: 'bg-success' },
  delayed: { color: 'text-warning', bg: 'bg-warning/10', label: '● Delayed', dot: 'bg-warning' },
  critical: { color: 'text-danger', bg: 'bg-danger/10', label: '● Critical', dot: 'bg-danger' },
  offline: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: '○ Offline', dot: 'bg-gray-500' },
};

export default function CommandCenter() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [simulating, setSimulating] = useState(false);
  const [simVehicle, setSimVehicle] = useState(null);
  const [simProgress, setSimProgress] = useState(0);
  const [simData, setSimData] = useState({ currentStop: 'Customer A', nextStop: 'Customer C', eta: '08 min', distance: '4.2 km', percent: 0 });

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

      // Route lines
      const routes = [
        { coords: [[28.6139, 77.2090], [28.6507, 77.2334], [28.6280, 77.2195], [28.5244, 77.2066]], color: '#22C55E' },
        { coords: [[28.6139, 77.2090], [28.5535, 77.2590], [28.6127, 77.2296]], color: '#F59E0B' },
        { coords: [[28.6139, 77.2090], [28.6692, 77.2292], [28.6486, 77.2381]], color: '#22C55E' },
        { coords: [[28.6139, 77.2090], [28.5733, 77.2541], [28.6127, 77.2296], [28.6486, 77.2381]], color: '#EF4444' },
      ];

      routes.forEach(r => {
        new google.maps.Polyline({
          path: r.coords.map(([lat, lng]) => ({ lat, lng })),
          strokeColor: r.color,
          strokeWeight: 3,
          strokeOpacity: 0.7,
          icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 }, offset: '0', repeat: '16px' }],
          map: map.current,
        });
      });

      // Vehicle markers
      ACTIVE_VEHICLES.forEach(v => {
        const colors = { on_time: '#22C55E', delayed: '#F59E0B', critical: '#EF4444' };
        const marker = new google.maps.Marker({
          position: { lat: v.lat, lng: v.lng },
          map: map.current,
          title: v.id,
          label: { text: 'T', color: '#fff', fontWeight: '700' },
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 14, fillColor: colors[v.status], fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
        });
        const infoWindow = new google.maps.InfoWindow({ content: `<strong>${v.id}</strong><br><span style="color:${colors[v.status]}">${v.status.toUpperCase()}</span><br>Driver: ${v.driver}<br>Route: ${v.route}` });
        marker.addListener('click', () => infoWindow.open({ map: map.current, anchor: marker }));
      });

      // Depot
      new google.maps.Marker({
        position: { lat: 28.6139, lng: 77.2090 },
        map: map.current,
        title: 'Central Depot',
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 13, fillColor: '#1d2a3d', fillOpacity: 1, strokeColor: '#2F80FF', strokeWeight: 3 },
      });
    }).catch(e => console.warn('Google Maps init skipped:', e.message));
    return () => {
      cancelled = true;
      map.current = null;
    };
  }, []);

  const startSimulation = (vehicle) => {
    setSimulating(true);
    setSimVehicle(vehicle);
    setSimProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setSimProgress(progress);
      setSimData({
        currentStop: progress < 33 ? 'Customer A' : progress < 66 ? 'Customer C' : 'Customer E',
        nextStop: progress < 33 ? 'Customer C' : progress < 66 ? 'Customer E' : 'Customer G',
        eta: `${Math.max(1, Math.round((100 - progress) / 10))} min`,
        distance: `${(4.2 * (1 - progress / 100)).toFixed(1)} km`,
        percent: progress
      });
      if (progress >= 100) {
        clearInterval(interval);
        setSimulating(false);
      }
    }, 200);
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time fleet monitoring and vehicle tracking</p>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Map */}
        <div className="flex-1 glass-panel-solid overflow-hidden relative">
          <div ref={mapContainer} className="w-full h-full" />
          <div className="absolute top-4 left-4 glass-panel px-3 py-1.5 flex items-center gap-2 z-[1000]">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-xs font-medium text-gray-300">Live Command View</span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-96 flex flex-col gap-3 overflow-hidden">
          {/* Simulation Panel */}
          {simulating && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Live Simulation</h3>
                <button onClick={() => { setSimulating(false); setSimVehicle(null); }} className="text-gray-500 hover:text-danger"><HiOutlineStop className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-500">Current Stop</span><p className="text-white">{simData.currentStop}</p></div>
                <div><span className="text-gray-500">Next Stop</span><p className="text-white">{simData.nextStop}</p></div>
                <div><span className="text-gray-500">ETA</span><p className="text-primary font-semibold">{simData.eta}</p></div>
                <div><span className="text-gray-500">Remaining</span><p className="text-white">{simData.distance}</p></div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between mb-1"><span className="text-[10px] text-gray-500">Progress</span><span className="text-[10px] text-white">{simData.percent}%</span></div>
                <div className="w-full bg-dark-secondary rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${simData.percent}%` }}></div></div>
              </div>
            </motion.div>
          )}

          {/* Active Vehicles */}
          <div className="glass-panel p-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Active Vehicles ({ACTIVE_VEHICLES.length})</h3>
            </div>
            <div className="space-y-2">
              {ACTIVE_VEHICLES.map((v, idx) => {
                const statusStyle = STATUS_STYLE[v.status];
                return (
                  <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-lg bg-dark-secondary/50 border border-dark-border/50 hover:border-dark-hover transition"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{v.id}</span>
                        <span className={`text-[10px] ${statusStyle.color}`}>{statusStyle.label}</span>
                      </div>
                      <button onClick={() => startSimulation(v)} className="p-1 rounded hover:bg-primary/10 text-gray-500 hover:text-primary transition" title="Simulate">
                        <HiOutlinePlay className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-400">
                      <span>Driver: {v.driver}</span>
                      <span>Route: {v.route}</span>
                      <span>Stops: {v.stops}</span>
                      <span>ETA: {v.eta}</span>
                    </div>
                    <div className="mt-1.5">
                      <div className="w-full bg-dark-secondary rounded-full h-1"><div className={`h-1 rounded-full ${v.status === 'critical' ? 'bg-danger' : v.status === 'delayed' ? 'bg-warning' : 'bg-success'}`} style={{ width: `${v.progress}%` }}></div></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Alerts */}
          <div className="glass-panel p-4 max-h-48 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-2">Alerts</h3>
            <div className="space-y-1.5">
              {ALERTS.map((alert, idx) => (
                <div key={idx} className="flex items-start gap-2 py-1">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    alert.severity === 'critical' ? 'bg-danger' : alert.severity === 'warning' ? 'bg-warning' : 'bg-success'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-300">{alert.text}</p>
                    <p className="text-[10px] text-gray-600">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
