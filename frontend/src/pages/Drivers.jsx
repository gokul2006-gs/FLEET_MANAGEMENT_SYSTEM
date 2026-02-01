import React, { useState, useEffect } from 'react';
import { Plus, X, Phone, User, Award, AlertTriangle } from 'lucide-react';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', licenseNumber: '', contactNumber: '', status: 'Active', experienceYears: 0, rating: 5
    });

    // Helper to determine API URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchDrivers = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/drivers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setDrivers(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch drivers:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/drivers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                fetchDrivers();
                setFormData({ name: '', licenseNumber: '', contactNumber: '', status: 'Active', experienceYears: 0, rating: 5 });
            }
        } catch (err) {
            console.error("Failed to add driver", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Driver Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                    <Plus size={18} /> Add Driver
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading drivers...</p>
                </div>
            ) : drivers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-slate-500">
                    <p>No drivers found. Add your first driver!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drivers.map((driver) => (
                        <div key={driver._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                        {driver.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{driver.name}</h3>
                                        <p className="text-xs text-slate-500">LIC: {driver.licenseNumber}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${driver.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {driver.status}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Phone size={16} className="text-slate-400" />
                                    {driver.contactNumber}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Award size={16} className="text-slate-400" />
                                    {driver.experienceYears} Years Exp.
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <User size={16} className="text-slate-400" />
                                    Rating: {driver.rating} / 5
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Driver Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Driver</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input required placeholder="Full Name" className="p-2 border rounded-lg w-full"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

                            <div className="grid grid-cols-2 gap-4">
                                <input required placeholder="License Number" className="p-2 border rounded-lg w-full"
                                    value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} />
                                <input required placeholder="Contact Number" className="p-2 border rounded-lg w-full"
                                    value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Experience (Years)" className="p-2 border rounded-lg w-full"
                                    value={formData.experienceYears} onChange={e => setFormData({ ...formData, experienceYears: e.target.value })} />
                                <input type="number" max="5" min="1" step="0.1" placeholder="Rating" className="p-2 border rounded-lg w-full"
                                    value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} />
                            </div>
                            <select className="p-2 border rounded-lg w-full" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="Active">Active</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Inactive">Inactive</option>
                            </select>

                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                                Add Driver
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Drivers;
