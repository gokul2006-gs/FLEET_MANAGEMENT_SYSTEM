import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Search, User, ChevronDown, LayoutDashboard, Truck, Users, Fuel, Map as MapIcon, X, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
        { name: 'Vehicles', icon: <Truck size={18} />, path: '/vehicles' },
        { name: 'Drivers', icon: <Users size={18} />, path: '/drivers' },
        { name: 'Fuel', icon: <Fuel size={18} />, path: '/fuel' },
        { name: 'Map', icon: <MapIcon size={18} />, path: '/map' },
    ];

    return (
        <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 shadow-sm relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Left: Brand & Mobile Menu */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-slate-600 hover:text-slate-900 lg:hidden"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                            Fleet IQ
                        </span>
                    </div>

                    {/* Center: Horizontal Nav Links (Desktop) */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`
                                }
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Search Removed */}

                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors"
                            >
                                {user?.picture ? (
                                    <img
                                        src={user.picture}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-blue-200">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                                    </div>
                                )}
                                <div className="hidden sm:flex flex-col items-start -space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account</span>
                                    <span className="text-xs font-bold text-slate-700 max-w-[80px] truncate">{user?.name || 'User'}</span>
                                </div>
                                <ChevronDown size={14} className="text-slate-400 hidden sm:block ml-1" />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 origin-top-right">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <NavLink
                                            to="/profile"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <User size={16} /> User Profile
                                        </NavLink>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                                    >
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-100 bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium
                    ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`
                                }
                            >
                                {item.icon}
                                {item.name}
                            </NavLink>
                        ))}
                        <NavLink
                            to="/profile"
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium
                ${isActive
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`
                            }
                        >
                            <User size={18} />
                            User Profile
                        </NavLink>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
