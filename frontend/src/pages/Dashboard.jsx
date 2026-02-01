import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Droplets, AlertTriangle, Truck, Map as MapIcon } from 'lucide-react';
import MapComponent from '../components/MapComponent';

const MetricCard = ({ title, value, subtext, icon, trend, trendValue, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                {icon}
            </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
            {trend === 'up' ? (
                <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <TrendingUp size={14} className="mr-1" /> {trendValue}
                </span>
            ) : trend === 'down' ? (
                <span className="flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                    <TrendingDown size={14} className="mr-1" /> {trendValue}
                </span>
            ) : (
                <span className="flex items-center text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    {trendValue}
                </span>
            )}
            <span className="text-xs text-gray-400">{subtext}</span>
        </div>
    </div>
);

const Dashboard = () => {
    // Determine vehicle count from API or partial seed
    const [vehicles, setVehicles] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/vehicles`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setVehicles(data);
                }
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Fleet Overview</h2>
                <p className="text-slate-500">Real-time insights on your fleet performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Vehicles"
                    value={vehicles.length || "0"}
                    subtext="Active Fleet"
                    trend="neutral"
                    trendValue="-"
                    color="bg-blue-50 text-blue-600"
                    icon={<Truck size={24} />}
                />
                <MetricCard
                    title="Fuel Consumption"
                    value="0 L"
                    subtext="No data yet"
                    trend="neutral"
                    trendValue="-"
                    color="bg-emerald-50 text-emerald-600"
                    icon={<Droplets size={24} />}
                />
                <MetricCard
                    title="Route Efficiency"
                    value="N/A"
                    subtext="Optimization Score"
                    trend="neutral"
                    trendValue="-"
                    color="bg-violet-50 text-violet-600"
                    icon={<TrendingUp size={24} />}
                />
                <MetricCard
                    title="Maintenance Alert"
                    value={vehicles.filter(v => v.status === 'Maintenance').length}
                    subtext="Vehicles require attention"
                    trend="neutral"
                    trendValue="-"
                    color="bg-rose-50 text-rose-600"
                    icon={<AlertTriangle size={24} />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Map */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Live Fleet Map</h3>
                    {vehicles.length > 0 ? (
                        <MapComponent vehicles={vehicles} height="350px" />
                    ) : (
                        <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                            Loading Map...
                        </div>
                    )}
                </div>

                {/* Vehicle Condition List */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Vehicle Conditions</h3>
                    <div className="space-y-4">
                        {vehicles.slice(0, 4).map((v, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${v.status === 'Maintenance' || v.condition === 'Needs Service' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{v.make} {v.model}</p>
                                        <p className="text-xs text-slate-500">{v.condition}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full 
                            ${v.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {v.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
