import React, { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import { Plus, X } from 'lucide-react';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        make: '', model: '', vin: '', year: new Date().getFullYear(),
        status: 'Active', fuelType: 'Diesel', currentFuelLevel: 100,
        lat: '', lng: ''
    });

    // Helper to determine API URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchVehicles = () => {
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
                console.error("Failed to fetch vehicles:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const payload = {
            ...formData,
            location: (formData.lat && formData.lng) ? { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) } : undefined
        };

        try {
            const res = await fetch(`${API_URL}/vehicles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowModal(false);
                fetchVehicles();
                setFormData({ make: '', model: '', vin: '', year: 2024, status: 'Active', fuelType: 'Diesel', currentFuelLevel: 100, lat: '', lng: '' });
            }
        } catch (err) {
            console.error("Failed to add vehicle", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Vehicle Fleet & Live Tracking</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                    <Plus size={18} /> Add Vehicle
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Vehicle List */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-slate-500">Loading fleet data...</p>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-slate-500">
                            <p>No vehicles found. Add your first vehicle to get started!</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-600">Vehicle</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600">Fuel</th>
                                            <th className="px-6 py-4 font-semibold text-slate-600">Location</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {vehicles.map((vehicle) => (
                                            <tr
                                                key={vehicle._id}
                                                onClick={() => setSelectedVehicle(vehicle)}
                                                className={`transition-colors cursor-pointer ${selectedVehicle?._id === vehicle._id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-slate-50/50'}`}
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold text-slate-800">{vehicle.make} {vehicle.model}</p>
                                                        <p className="text-xs text-slate-400">VIN: {vehicle.vin}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${vehicle.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                                            vehicle.status === 'Maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {vehicle.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[80px]">
                                                        <div className={`h-2.5 rounded-full ${vehicle.currentFuelLevel < 20 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${vehicle.currentFuelLevel}%` }}></div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500">
                                                    {vehicle.location ? `${vehicle.location.lat.toFixed(4)}, ${vehicle.location.lng.toFixed(4)}` : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Live Map */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-full">
                        <h3 className="font-bold text-slate-700 mb-4">Live Locations</h3>
                        <MapComponent vehicles={vehicles} selectedVehicle={selectedVehicle} height="500px" />
                    </div>
                </div>
            </div>

            {/* Add Vehicle Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Vehicle</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input required placeholder="Make (e.g. Toyota)" className="p-2 border rounded-lg w-full"
                                    value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} />
                                <input required placeholder="Model" className="p-2 border rounded-lg w-full"
                                    value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                            </div>
                            <input required placeholder="VIN" className="p-2 border rounded-lg w-full"
                                value={formData.vin} onChange={e => setFormData({ ...formData, vin: e.target.value })} />

                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Fuel Level %" className="p-2 border rounded-lg w-full"
                                    value={formData.currentFuelLevel} onChange={e => setFormData({ ...formData, currentFuelLevel: e.target.value })} />
                                <select className="p-2 border rounded-lg w-full" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Active">Active</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs font-bold text-slate-500 mb-2">Current Location (Optional)</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" step="any" placeholder="Latitude" className="p-2 border rounded-lg w-full text-sm"
                                        value={formData.lat} onChange={e => setFormData({ ...formData, lat: e.target.value })} />
                                    <input type="number" step="any" placeholder="Longitude" className="p-2 border rounded-lg w-full text-sm"
                                        value={formData.lng} onChange={e => setFormData({ ...formData, lng: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                                Save Vehicle
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;
