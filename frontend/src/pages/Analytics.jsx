import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineTruck, HiOutlineLightningBolt
} from 'react-icons/hi';

const KPI_DATA = [
  { label: 'Total Distance', value: '581.4 km', icon: HiOutlineTruck, color: 'text-primary', bg: 'bg-primary/10', change: '+12%' },
  { label: 'Total Duration', value: '11h 48m', icon: HiOutlineClock, color: 'text-cyan', bg: 'bg-cyan/10', change: '+8%' },
  { label: 'On-Time Rate', value: '94.2%', icon: HiOutlineCheckCircle, color: 'text-success', bg: 'bg-success/10', change: '+2.1%' },
  { label: 'Delivery Rate', value: '96.8%', icon: HiOutlineCheckCircle, color: 'text-success', bg: 'bg-success/10', change: '+1.5%' },
  { label: 'Vehicle Utilization', value: '72%', icon: HiOutlineTruck, color: 'text-warning', bg: 'bg-warning/10', change: '-3%' },
  { label: 'Fuel Estimate', value: '46.5L', icon: HiOutlineLightningBolt, color: 'text-purple', bg: 'bg-purple/10', change: '-12%' },
  { label: 'Fuel Saved', value: '10.3L', icon: HiOutlineTrendingUp, color: 'text-success', bg: 'bg-success/10', change: '+18%' },
  { label: 'Avg Stop Time', value: '5.2 min', icon: HiOutlineClock, color: 'text-gray-400', bg: 'bg-gray-500/10', change: '-0.3' },
];

const DAILY_DELIVERIES = [
  { day: 'Mon', delivered: 42, failed: 3, pending: 12 },
  { day: 'Tue', delivered: 38, failed: 2, pending: 8 },
  { day: 'Wed', delivered: 45, failed: 4, pending: 10 },
  { day: 'Thu', delivered: 52, failed: 1, pending: 6 },
  { day: 'Fri', delivered: 48, failed: 3, pending: 14 },
  { day: 'Sat', delivered: 35, failed: 2, pending: 8 },
  { day: 'Sun', delivered: 28, failed: 1, pending: 5 },
];

const PLANNED_VS_ACTUAL = [
  { route: 'R-001', planned: 45.2, actual: 48.2 },
  { route: 'R-002', planned: 33.1, actual: 35.6 },
  { route: 'R-003', planned: 26.8, actual: 28.4 },
  { route: 'R-004', planned: 39.5, actual: 42.1 },
  { route: 'R-005', planned: 17.2, actual: 18.9 },
  { route: 'R-006', planned: 29.0, actual: 31.2 },
  { route: 'R-007', planned: 24.5, actual: 26.7 },
];

const VEHICLE_UTILIZATION = [
  { vehicle: 'DL-01', utilization: 72, capacity: 200 },
  { vehicle: 'DL-02', utilization: 76, capacity: 500 },
  { vehicle: 'DL-03', utilization: 48, capacity: 150 },
  { vehicle: 'DL-04', utilization: 0, capacity: 200 },
  { vehicle: 'DL-05', utilization: 60, capacity: 200 },
  { vehicle: 'MH-12', utilization: 0, capacity: 400 },
  { vehicle: 'MH-12B', utilization: 63, capacity: 150 },
  { vehicle: 'KA-01', utilization: 40, capacity: 20 },
];

const ROUTE_EFFICIENCY = [
  { route: 'R-001', efficiency: 93.8 },
  { route: 'R-002', efficiency: 92.9 },
  { route: 'R-003', efficiency: 94.4 },
  { route: 'R-004', efficiency: 93.8 },
  { route: 'R-005', efficiency: 91.0 },
  { route: 'R-006', efficiency: 92.9 },
  { route: 'R-007', efficiency: 91.8 },
];

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0D1422', border: '1px solid #1D2A3D', borderRadius: '8px', fontSize: '12px', color: '#e2e8f0' },
  itemStyle: { color: '#e2e8f0' }
};

export default function Analytics() {
  const [period, setPeriod] = useState('week');

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Route performance and delivery analytics</p>
        </div>
        <select id="analytics-period" name="analyticsPeriod" value={period} onChange={e => setPeriod(e.target.value)} className="input-field">
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KPI_DATA.map((kpi, idx) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="stat-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${kpi.bg}`}><kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} /></div>
                <span className="text-[11px] text-gray-500 font-medium">{kpi.label}</span>
              </div>
              <span className={`text-[10px] font-medium ${kpi.change.startsWith('+') ? 'text-success' : 'text-danger'}`}>{kpi.change}</span>
            </div>
            <span className="text-xl font-bold text-white mt-1">{kpi.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Deliveries */}
        <div className="glass-panel-solid p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Daily Deliveries</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={DAILY_DELIVERIES}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2A3D" />
              <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend />
              <Bar dataKey="delivered" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Planned vs Actual Distance */}
        <div className="glass-panel-solid p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Planned vs Actual Distance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={PLANNED_VS_ACTUAL}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2A3D" />
              <XAxis dataKey="route" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend />
              <Line type="monotone" dataKey="planned" stroke="#2F80FF" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="actual" stroke="#22D3EE" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vehicle Utilization */}
        <div className="glass-panel-solid p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Vehicle Utilization</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={VEHICLE_UTILIZATION} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2A3D" />
              <XAxis type="number" domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="vehicle" stroke="#6b7280" tick={{ fontSize: 11 }} width={60} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="utilization" radius={[0, 4, 4, 0]}>
                {VEHICLE_UTILIZATION.map((entry, index) => (
                  <Cell key={index} fill={entry.utilization > 70 ? '#22C55E' : entry.utilization > 40 ? '#F59E0B' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Route Efficiency */}
        <div className="glass-panel-solid p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Route Efficiency (%)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={ROUTE_EFFICIENCY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1D2A3D" />
              <XAxis dataKey="route" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis domain={[85, 100]} stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="efficiency" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
