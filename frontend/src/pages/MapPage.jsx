import React, { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import { Truck, AlertTriangle, Battery, Navigation } from 'lucide-react';

const MapPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper to determine API URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        setLoading(true);
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
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4">
            {/* Main Map Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="font-bold text-slate-800">Fleet Live Map</h2>
                    <p className="text-xs text-slate-500">{vehicles.length} Active Vehicles</p>
                </div>

                <MapComponent vehicles={vehicles} selectedVehicle={selectedVehicle} height="100%" />
            </div>

            {/* Right Sidebar Overlay for Vehicles */}
            <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800">Vehicle List</h3>
                    <p className="text-xs text-slate-500">Click to track</p>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <p className="text-center text-sm text-slate-500 py-4">No vehicles found</p>
                    ) : (
                        vehicles.map(vehicle => (
                            <button
                                key={vehicle._id}
                                onClick={() => setSelectedVehicle(vehicle)}
                                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center gap-3
                                    ${selectedVehicle?._id === vehicle._id
                                        ? 'bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500'
                                        : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                                    ${vehicle.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Truck size={18} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-slate-800 truncate">{vehicle.make} {vehicle.model}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className={`flex items-center gap-1 ${vehicle.currentFuelLevel < 20 ? 'text-red-500' : 'text-slate-500'}`}>
                                            <Battery size={12} /> {vehicle.currentFuelLevel}%
                                        </span>
                                        <span>•</span>
                                        <span className="truncate">{vehicle.status}</span>
                                    </div>
                                </div>

                                {selectedVehicle?._id === vehicle._id && (
                                    <Navigation size={16} className="text-blue-600 animate-pulse" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapPage;
