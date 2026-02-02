import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header/Cover */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            {user.picture ? (
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="pb-2">
                                <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
                                <p className="text-slate-500">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2 mb-2"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <User size={18} className="text-blue-500" /> Account Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-500">Full Name</span>
                                    <span className="text-sm font-bold text-slate-800">{user.name}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-500">Email Address</span>
                                    <span className="text-sm font-bold text-slate-800">{user.email}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-500">Account Type</span>
                                    <span className="text-sm font-bold text-slate-800">Fleet Manager</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <Shield size={18} className="text-emerald-500" /> Security & Privacy
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-500">Login Method</span>
                                    <span className="text-sm font-bold text-slate-800">
                                        {user.picture ? 'Google Auth' : 'Email/Password'}
                                    </span>
                                </div>
                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                                    <span className="text-sm text-slate-500">Last Active</span>
                                    <span className="text-sm font-bold text-slate-800">Today</span>
                                </div>
                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors">
                                    <span className="text-sm font-bold">Update Password</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics or Activity could go here */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Fleet IQ Platinum Member</h3>
                    <p className="opacity-80 text-sm">You are managing 4 vehicles and 3 drivers.</p>
                </div>
                <div className="hidden sm:block">
                    <button className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-opacity-90 transition-all">
                        Upgrade Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
