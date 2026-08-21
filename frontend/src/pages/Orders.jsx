import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineDocumentText, HiOutlinePlus, HiOutlineSearch, HiOutlineFilter,
  HiOutlineTrash, HiOutlinePencilAlt, HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock, HiOutlineExclamationCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../services/api';

const DEMO_ORDERS = Array.from({ length: 50 }, (_, i) => {
  const priorities = ['low', 'normal', 'high', 'critical'];
  const statuses = ['pending', 'pending', 'pending', 'assigned', 'in_transit', 'delivered'];
  const names = ['Arun Kumar', 'Priya Sharma', 'Rajesh Gupta', 'Meera Patel', 'Vikram Singh', 'Ananya Das', 'Deepak Mishra', 'Neha Kapoor'];
  const addresses = ['12 MG Road, CP', '45 Chandni Chowk', '78 Qutub Area', '23 Jama Masjid', '56 Red Fort', '89 Nehru Place', '34 Daryaganj', '67 Civil Lines'];
  return {
    _id: `order-${i}`,
    orderId: `ORD-${(1000 + i).toString()}`,
    customerName: names[i % names.length],
    phone: `+91-9876${(543210 + i).toString()}`,
    address: addresses[i % addresses.length],
    latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
    longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
    packageWeight: 1 + Math.floor(Math.random() * 30),
    priority: priorities[i % priorities.length],
    timeWindowStart: '09:00',
    timeWindowEnd: '18:00',
    serviceTime: 5 + Math.floor(Math.random() * 10),
    status: statuses[i % statuses.length],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  };
});

const STATUS_CONFIG = {
  pending: { color: 'badge-warning', icon: HiOutlineClock, label: 'Pending' },
  assigned: { color: 'badge-info', icon: HiOutlineCheckCircle, label: 'Assigned' },
  in_transit: { color: 'badge-purple', icon: HiOutlineClock, label: 'In Transit' },
  delivered: { color: 'badge-success', icon: HiOutlineCheckCircle, label: 'Delivered' },
  failed: { color: 'badge-danger', icon: HiOutlineXCircle, label: 'Failed' },
  cancelled: { color: 'bg-gray-500/10 text-gray-400', icon: HiOutlineXCircle, label: 'Cancelled' },
};

const PRIORITY_CONFIG = {
  low: { color: 'bg-gray-500/10 text-gray-400' },
  normal: { color: 'badge-info' },
  high: { color: 'badge-warning' },
  critical: { color: 'badge-danger' },
};

export default function Orders() {
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ customerName: '', phone: '', address: '', latitude: '', longitude: '', packageWeight: '', priority: 'normal', timeWindowStart: '09:00', timeWindowEnd: '18:00', serviceTime: 5 });
  const perPage = 12;

  const filtered = orders.filter(o => {
    if (search && !o.orderId.toLowerCase().includes(search.toLowerCase()) && !o.customerName.toLowerCase().includes(search.toLowerCase()) && !o.address.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && o.status !== statusFilter) return false;
    if (priorityFilter && o.priority !== priorityFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const toggleSelect = (id) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedOrders.length === paginated.length) setSelectedOrders([]);
    else setSelectedOrders(paginated.map(o => o._id));
  };

  const deleteSelected = () => {
    setOrders(prev => prev.filter(o => !selectedOrders.includes(o._id)));
    setSelectedOrders([]);
    toast.success(`${selectedOrders.length} orders deleted`);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const order = {
      ...newOrder,
      _id: `order-${Date.now()}`,
      orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      latitude: parseFloat(newOrder.latitude) || 28.6139,
      longitude: parseFloat(newOrder.longitude) || 77.2090,
      packageWeight: parseFloat(newOrder.packageWeight) || 1,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [order, ...prev]);
    setShowCreateModal(false);
    setNewOrder({ customerName: '', phone: '', address: '', latitude: '', longitude: '', packageWeight: '', priority: 'normal', timeWindowStart: '09:00', timeWindowEnd: '18:00', serviceTime: 5 });
    toast.success('Order created');
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} total orders</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedOrders.length > 0 && (
            <button onClick={deleteSelected} className="btn-danger flex items-center gap-2 text-sm">
              <HiOutlineTrash className="w-4 h-4" /> Delete ({selectedOrders.length})
            </button>
          )}
          <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm">
            <HiOutlinePlus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            id="order-search"
            name="orderSearch"
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="input-field w-full pl-10"
          />
        </div>
        <select id="order-status-filter" name="orderStatusFilter" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="input-field">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
        </select>
        <select id="order-priority-filter" name="orderPriorityFilter" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }} className="input-field">
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 glass-panel-solid overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="p-3 text-left"><input id="select-all-orders" name="selectAllOrders" type="checkbox" onChange={toggleAll} checked={selectedOrders.length === paginated.length && paginated.length > 0} className="rounded border-dark-border" /></th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Address</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Weight</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Time Window</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((order, idx) => {
              const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const priorityConf = PRIORITY_CONFIG[order.priority] || PRIORITY_CONFIG.normal;
              return (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-dark-border/50 hover:bg-dark-hover/30 transition"
                >
                  <td className="p-3"><input id={`select-order-${order._id}`} name={`selectOrder-${order._id}`} type="checkbox" checked={selectedOrders.includes(order._id)} onChange={() => toggleSelect(order._id)} className="rounded border-dark-border" /></td>
                  <td className="p-3 text-sm font-mono text-primary">{order.orderId}</td>
                  <td className="p-3 text-sm text-white">{order.customerName}</td>
                  <td className="p-3 text-sm text-gray-400 max-w-[200px] truncate">{order.address}</td>
                  <td className="p-3 text-sm text-gray-300">{order.packageWeight} kg</td>
                  <td className="p-3"><span className={`badge capitalize ${priorityConf.color}`}>{order.priority}</span></td>
                  <td className="p-3 text-xs text-gray-400">{order.timeWindowStart} – {order.timeWindowEnd}</td>
                  <td className="p-3"><span className={`badge ${statusConf.color}`}>{statusConf.label}</span></td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-dark-hover text-gray-500 hover:text-white transition"><HiOutlinePencilAlt className="w-3.5 h-3.5" /></button>
                      <button onClick={() => { setOrders(prev => prev.filter(o => o._id !== order._id)); toast.success('Order deleted'); }} className="p-1 rounded hover:bg-danger/10 text-gray-500 hover:text-danger transition"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <HiOutlineDocumentText className="w-12 h-12 text-gray-700 mb-3" />
            <p className="text-gray-500 text-sm">No orders found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-dark-hover disabled:opacity-30 text-gray-400"><HiOutlineChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-xs font-medium transition ${currentPage === page ? 'bg-primary text-white' : 'text-gray-400 hover:bg-dark-hover'}`}>{page}</button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-dark-hover disabled:opacity-30 text-gray-400"><HiOutlineChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel-solid p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Create New Order</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-order-customer-name" className="block text-xs text-gray-500 mb-1">Customer Name *</label>
                  <input id="new-order-customer-name" name="customerName" required value={newOrder.customerName} onChange={e => setNewOrder({ ...newOrder, customerName: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label htmlFor="new-order-phone" className="block text-xs text-gray-500 mb-1">Phone</label>
                  <input id="new-order-phone" name="phone" type="tel" autoComplete="tel" value={newOrder.phone} onChange={e => setNewOrder({ ...newOrder, phone: e.target.value })} className="input-field w-full" />
                </div>
              </div>
              <div>
                <label htmlFor="new-order-address" className="block text-xs text-gray-500 mb-1">Address *</label>
                <input id="new-order-address" name="address" autoComplete="street-address" required value={newOrder.address} onChange={e => setNewOrder({ ...newOrder, address: e.target.value })} className="input-field w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-order-latitude" className="block text-xs text-gray-500 mb-1">Latitude</label>
                  <input id="new-order-latitude" name="latitude" type="number" step="any" value={newOrder.latitude} onChange={e => setNewOrder({ ...newOrder, latitude: e.target.value })} className="input-field w-full" placeholder="28.6139" />
                </div>
                <div>
                  <label htmlFor="new-order-longitude" className="block text-xs text-gray-500 mb-1">Longitude</label>
                  <input id="new-order-longitude" name="longitude" type="number" step="any" value={newOrder.longitude} onChange={e => setNewOrder({ ...newOrder, longitude: e.target.value })} className="input-field w-full" placeholder="77.2090" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="new-order-weight" className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
                  <input id="new-order-weight" name="packageWeight" type="number" value={newOrder.packageWeight} onChange={e => setNewOrder({ ...newOrder, packageWeight: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label htmlFor="new-order-priority" className="block text-xs text-gray-500 mb-1">Priority</label>
                  <select id="new-order-priority" name="priority" value={newOrder.priority} onChange={e => setNewOrder({ ...newOrder, priority: e.target.value })} className="input-field w-full">
                    <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="new-order-service-time" className="block text-xs text-gray-500 mb-1">Service (min)</label>
                  <input id="new-order-service-time" name="serviceTime" type="number" value={newOrder.serviceTime} onChange={e => setNewOrder({ ...newOrder, serviceTime: parseInt(e.target.value) || 5 })} className="input-field w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-order-window-start" className="block text-xs text-gray-500 mb-1">Window Start</label>
                  <input id="new-order-window-start" name="timeWindowStart" type="time" value={newOrder.timeWindowStart} onChange={e => setNewOrder({ ...newOrder, timeWindowStart: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label htmlFor="new-order-window-end" className="block text-xs text-gray-500 mb-1">Window End</label>
                  <input id="new-order-window-end" name="timeWindowEnd" type="time" value={newOrder.timeWindowEnd} onChange={e => setNewOrder({ ...newOrder, timeWindowEnd: e.target.value })} className="input-field w-full" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" className="btn-primary text-sm">Create Order</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
