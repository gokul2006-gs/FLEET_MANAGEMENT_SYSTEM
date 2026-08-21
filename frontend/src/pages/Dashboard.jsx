import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineTruck, HiOutlineDocumentText, HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineExclamation, HiOutlineUserGroup, HiOutlineLightningBolt,
  HiOutlineArrowRight
} from 'react-icons/hi';
import api from '../services/api';
import { loadGoogleMaps } from '../services/googleMaps';

// Delhi coordinates (Leaflet uses [lat, lng])
const DELHI_CENTER = [28.6139, 77.2090];

const VEHICLE_LOCATIONS = [
  { id: 'TRK-001', lat: 28.6280, lng: 77.2195, status: 'active', color: '#22C55E' },
  { id: 'TRK-002', lat: 28.5535, lng: 77.2590, status: 'active', color: '#22C55E' },
  { id: 'TRK-003', lat: 28.6692, lng: 77.2292, status: 'active', color: '#22C55E' },
  { id: 'TRK-004', lat: 28.6486, lng: 77.2381, status: 'idle', color: '#F59E0B' },
  { id: 'TRK-005', lat: 28.5733, lng: 77.2541, status: 'active', color: '#22C55E' },
  { id: 'TRK-006', lat: 28.6562, lng: 77.2410, status: 'idle', color: '#F59E0B' },
  { id: 'TRK-007', lat: 28.6131, lng: 77.2083, status: 'active', color: '#22C55E' },
  { id: 'TRK-008', lat: 28.6350, lng: 77.2250, status: 'maintenance', color: '#EF4444' },
];

const DELIVERY_POINTS = [
  { id: 'D001', lat: 28.6507, lng: 77.2334, status: 'pending', priority: 'high' },
  { id: 'D002', lat: 28.5244, lng: 77.2066, status: 'assigned', priority: 'normal' },
  { id: 'D003', lat: 28.6127, lng: 77.2296, status: 'delivered', priority: 'critical' },
  { id: 'D004', lat: 28.5500, lng: 77.2700, status: 'pending', priority: 'normal' },
  { id: 'D005', lat: 28.6800, lng: 77.2100, status: 'assigned', priority: 'low' },
  { id: 'D006', lat: 28.6600, lng: 77.2350, status: 'pending', priority: 'high' },
  { id: 'D007', lat: 28.5400, lng: 77.2400, status: 'delivered', priority: 'normal' },
  { id: 'D008', lat: 28.6200, lng: 77.1900, status: 'pending', priority: 'normal' },
  { id: 'D009', lat: 28.6500, lng: 77.2700, status: 'assigned', priority: 'low' },
  { id: 'D010', lat: 28.5900, lng: 77.2600, status: 'pending', priority: 'critical' },
];

const ROUTE_LINES = [
  [[28.6139, 77.2090], [28.6507, 77.2334], [28.6280, 77.2195], [28.5244, 77.2066]],
  [[28.6139, 77.2090], [28.5535, 77.2590], [28.6127, 77.2296]],
  [[28.6139, 77.2090], [28.6692, 77.2292], [28.6486, 77.2381], [28.6562, 77.2410]],
];

const KPI_DATA = [
  { label: 'Total Vehicles', value: 12, icon: HiOutlineTruck, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'On Road', value: 8, icon: HiOutlineLightningBolt, color: 'text-success', bg: 'bg-success/10' },
  { label: 'Active Routes', value: 6, icon: HiOutlineClock, color: 'text-cyan', bg: 'bg-cyan/10' },
  { label: 'Pending', value: 24, icon: HiOutlineDocumentText, color: 'text-warning', bg: 'bg-warning/10' },
  { label: 'Completed', value: 89, icon: HiOutlineCheckCircle, color: 'text-success', bg: 'bg-success/10' },
  { label: 'Delayed', value: 3, icon: HiOutlineExclamation, color: 'text-danger', bg: 'bg-danger/10' },
  { label: 'Drivers', value: 12, icon: HiOutlineUserGroup, color: 'text-purple', bg: 'bg-purple/10' },
  { label: 'Idle', value: 4, icon: HiOutlineTruck, color: 'text-warning', bg: 'bg-warning/10' },
];

const RECENT_ACTIVITY = [
  { text: 'Route R-001 completed — 18/18 stops delivered', time: '2 min ago', type: 'success' },
  { text: 'Vehicle TRK-008 reported maintenance issue', time: '5 min ago', type: 'warning' },
  { text: 'New batch of 14 orders imported', time: '8 min ago', type: 'info' },
  { text: 'Route R-003 delayed by 15 minutes', time: '12 min ago', type: 'warning' },
  { text: 'Driver Arun Kumar started route R-002', time: '15 min ago', type: 'info' },
];

const ALERTS = [
  { text: 'Time window violation: Order at Kalkaji', severity: 'warning' },
  { text: 'Vehicle TRK-008 needs maintenance', severity: 'critical' },
  { text: 'Critical delivery ORD-045 due in 30 min', severity: 'critical' },
];

export default function Dashboard() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [kpis, setKpis] = useState(KPI_DATA);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    let cancelled = false;

    loadGoogleMaps().then(google => {
      if (cancelled || !mapContainer.current || map.current) return;

      map.current = new google.maps.Map(mapContainer.current, {
        center: { lat: DELHI_CENTER[0], lng: DELHI_CENTER[1] },
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        styles: [{ elementType: 'geometry', stylers: [{ color: '#0D1422' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] }, { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070B14' }] }],
      });

      // Add route lines
      const colors = ['#2F80FF', '#22D3EE', '#8B5CF6'];
      ROUTE_LINES.forEach((coords, idx) => {
        new google.maps.Polyline({
          path: coords.map(([lat, lng]) => ({ lat, lng })),
          color: colors[idx % colors.length],
          strokeColor: colors[idx % colors.length],
          strokeWeight: 3,
          strokeOpacity: 0.8,
          icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 }, offset: '0', repeat: '16px' }],
          map: map.current,
        });
      });

      // Add depot marker
      new google.maps.Marker({
        position: { lat: DELHI_CENTER[0], lng: DELHI_CENTER[1] },
        map: map.current,
        title: 'Central Depot',
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 13, fillColor: '#1d2a3d', fillOpacity: 1, strokeColor: '#2F80FF', strokeWeight: 3 },
      });

      // Add delivery markers
      DELIVERY_POINTS.forEach(point => {
        const deliveryColors = { pending: '#F59E0B', assigned: '#2F80FF', delivered: '#22C55E' };
        new google.maps.Marker({
          position: { lat: point.lat, lng: point.lng },
          map: map.current,
          title: `${point.id} - ${point.status}`,
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: deliveryColors[point.status] || '#F59E0B', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
        });
      });

      // Add vehicle markers
      const infoWindow = new google.maps.InfoWindow();
      VEHICLE_LOCATIONS.forEach(vehicle => {
        const marker = new google.maps.Marker({
          position: { lat: vehicle.lat, lng: vehicle.lng },
          map: map.current,
          title: vehicle.id,
          label: { text: 'T', color: '#fff', fontWeight: '700' },
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 14, fillColor: vehicle.color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
        });
        marker.addListener('click', () => {
          setSelectedVehicle(vehicle);
          infoWindow.setContent(`<strong>${vehicle.id}</strong><br><span style="color:${vehicle.color}">${vehicle.status.toUpperCase()}</span>`);
          infoWindow.open({ map: map.current, anchor: marker });
        });
      });
    }).catch(e => console.warn('Google Maps init skipped:', e.message));

    return () => {
      cancelled = true;
      map.current = null;
    };
  }, []);

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="stat-card group hover:border-dark-hover transition-all cursor-default"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-md ${kpi.bg}`}>
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <span className="text-[11px] text-gray-500 font-medium">{kpi.label}</span>
            </div>
            <span className="text-2xl font-bold text-white">{kpi.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Main Content: Map + Panel */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Map */}
        <div className="flex-1 glass-panel-solid overflow-hidden relative">
          <div ref={mapContainer} className="w-full h-full" />

          {/* Map overlay status */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-[1000]">
            <div className="glass-panel px-3 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-xs font-medium text-gray-300">Live Tracking Active</span>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 glass-panel p-3 z-[1000]">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Legend</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success"></div><span className="text-xs text-gray-400">Active Vehicle</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warning"></div><span className="text-xs text-gray-400">Idle Vehicle</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-danger"></div><span className="text-xs text-gray-400">Maintenance</span></div>
              <div className="flex items-center gap-2"><div className="w-8 h-0.5 bg-primary rounded"></div><span className="text-xs text-gray-400">Route</span></div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 flex flex-col gap-4 overflow-hidden">
          {/* Selected Vehicle Detail */}
          {selectedVehicle ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{selectedVehicle.id}</h3>
                <button onClick={() => setSelectedVehicle(null)} className="text-gray-500 hover:text-white text-xs">✕</button>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between"><span className="text-xs text-gray-500">Status</span>
                  <span className={`badge ${selectedVehicle.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{selectedVehicle.status}</span>
                </div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Driver</span><span className="text-sm text-white">Arun Kumar</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Vehicle</span><span className="text-sm text-white">Van / TN-38-AB</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Current Route</span><span className="text-sm text-primary">R-001</span></div>
                <div className="flex justify-between"><span className="text-xs text-gray-500">Stops</span><span className="text-sm text-white">14 / 18</span></div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-xs text-gray-500">Progress</span><span className="text-xs text-white">78%</span></div>
                  <div className="w-full bg-dark-secondary rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: '78%' }}></div></div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-panel p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Select a vehicle on the map</h3>
              <p className="text-xs text-gray-600">Click any vehicle marker to view details</p>
            </div>
          )}

          {/* Alerts */}
          <div className="glass-panel p-4 flex-1 overflow-y-auto">
            <h3 className="text-sm font-semibold text-white mb-3">Active Alerts</h3>
            <div className="space-y-2">
              {ALERTS.map((alert, idx) => (
                <div key={idx} className={`p-2.5 rounded-lg border ${
                  alert.severity === 'critical' ? 'bg-danger/5 border-danger/20' : 'bg-warning/5 border-warning/20'
                }`}>
                  <div className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      alert.severity === 'critical' ? 'bg-danger' : 'bg-warning'
                    }`}></div>
                    <span className="text-xs text-gray-300">{alert.text}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-white mt-4 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {RECENT_ACTIVITY.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2 py-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    act.type === 'success' ? 'bg-success' : act.type === 'warning' ? 'bg-warning' : 'bg-primary'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 leading-relaxed">{act.text}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{act.time}</p>
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
