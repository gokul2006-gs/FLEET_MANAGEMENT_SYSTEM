import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Fuel, Users, Map as MapIcon, Menu, X } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Vehicles', icon: <Truck size={20} />, path: '/vehicles' },
        { name: 'Drivers', icon: <Users size={20} />, path: '/drivers' },
        { name: 'Fuel & Efficiency', icon: <Fuel size={20} />, path: '/fuel' },
        { name: 'Routes Map', icon: <MapIcon size={20} />, path: '/map' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-slate-900 text-white w-64 z-30 transition-transform duration-300 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        Fleet IQ
                    </h1>
                    <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                            onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-6 left-0 w-full px-6">
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                        <p className="text-xs text-slate-400 mb-1">System Status</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-sm font-medium text-emerald-400">Online</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
