import React from 'react';
import { Droplets, Ticket } from 'lucide-react';

const Fuel = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Fuel Efficiency & Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[250px] text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-3">
                        <Droplets size={24} />
                    </div>
                    <h3 className="font-bold text-slate-700 mb-1">Consumption History</h3>
                    <p className="text-sm text-slate-500">Not enough data to display chart.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[250px] text-center">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-3">
                        <Ticket size={24} />
                    </div>
                    <h3 className="font-bold text-slate-700 mb-1">Cost Analysis</h3>
                    <p className="text-sm text-slate-500">No cost records found.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-slate-700 mb-4">Recent Refueling Logs</h3>
                <div className="flex flex-col items-center justify-center py-10">
                    <p className="text-slate-500 text-sm">No recent logs found.</p>
                    <button className="mt-4 text-blue-600 text-sm font-medium hover:underline">
                        + Add Refueling Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Fuel;
