import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineViewGrid, HiOutlineDocumentText, HiOutlineTruck, HiOutlineUserGroup,
  HiOutlineCog, HiOutlineBell, HiOutlineSearch, HiOutlineMenu,
  HiOutlineChevronLeft, HiOutlineMap, HiOutlineChartBar,
  HiOutlineLightningBolt, HiOutlineGlobe, HiOutlineClock, HiOutlineAdjustments,
  HiOutlinePlay, HiOutlineShieldCheck, HiOutlineCheckCircle
} from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const navSections = [
  {
    title: 'Operations',
    items: [
      { path: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
      { path: '/orders', icon: HiOutlineDocumentText, label: 'Orders' },
      { path: '/drivers', icon: HiOutlineUserGroup, label: 'Drivers' },
      { path: '/vehicles', icon: HiOutlineTruck, label: 'Vehicles' },
    ]
  },
  {
    title: 'Planning',
    items: [
      { path: '/optimization', icon: HiOutlineCog, label: 'Optimization' },
      { path: '/routes', icon: HiOutlineMap, label: 'Routes' },
      { path: '/command-center', icon: HiOutlineGlobe, label: 'Command Center' },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { path: '/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
      { path: '/algorithms', icon: HiOutlineLightningBolt, label: 'Algorithms' },
    ]
  },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    api.get('/notifications?limit=10')
      .then(({ data }) => {
        if (!active) return;
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {
        if (active) setNotifications([]);
      });

    return () => { active = false; };
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col bg-dark-surface border-r border-dark-border h-screen overflow-hidden flex-shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-dark-border">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <HiOutlineLightningBolt className="text-white text-lg" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-cyan bg-clip-text text-transparent">
                  SmartRoute
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto"
              >
                <HiOutlineLightningBolt className="text-white text-lg" />
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-white transition p-1 rounded hover:bg-dark-hover">
            {sidebarOpen ? <HiOutlineChevronLeft className="w-4 h-4" /> : <HiOutlineMenu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              {sidebarOpen && (
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? 'active' : 'text-gray-400 hover:text-white'} ${!sidebarOpen ? 'justify-center px-0' : ''}`
                    }
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0`} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-dark-border p-3">
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
              {user?.name?.[0] || 'A'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'admin'}</p>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} className="text-gray-500 hover:text-danger transition text-xs">
                Logout
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-dark-surface border-b border-dark-border flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                id="global-search"
                name="globalSearch"
                type="text"
                placeholder="Search orders, vehicles, drivers, routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-secondary border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                aria-label="Notifications"
                aria-expanded={showNotifPanel}
                className="relative p-2 rounded-lg hover:bg-dark-hover transition text-gray-400 hover:text-white"
              >
                <HiOutlineBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-danger rounded-full text-[10px] leading-4 text-white text-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <div className="absolute right-0 top-12 z-50 w-80 glass-panel-solid shadow-xl">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
                    <h2 className="text-sm font-semibold text-white">Notifications</h2>
                    <button
                      type="button"
                      disabled={unreadCount === 0}
                      onClick={() => api.put('/notifications/read-all').then(() => {
                        setNotifications(current => current.map(notification => ({ ...notification, isRead: true })));
                        setUnreadCount(0);
                      })}
                      className="text-xs text-primary hover:text-primary-light disabled:text-gray-600"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <HiOutlineCheckCircle className="w-7 h-7 text-success mx-auto mb-2" />
                        <p className="text-sm text-gray-400">You are all caught up</p>
                      </div>
                    ) : notifications.map(notification => (
                      <button
                        type="button"
                        key={notification._id}
                        onClick={() => {
                          if (!notification.isRead) {
                            api.put(`/notifications/${notification._id}/read`).catch(() => {});
                            setNotifications(current => current.map(item => item._id === notification._id ? { ...item, isRead: true } : item));
                            setUnreadCount(current => Math.max(0, current - 1));
                          }
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-dark-border/60 hover:bg-dark-hover transition ${notification.isRead ? 'opacity-60' : ''}`}
                      >
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                        <p className="text-[10px] text-gray-600 mt-1">{notification.type || 'info'}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User badge */}
            <div className="flex items-center gap-2 pl-3 border-l border-dark-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'admin'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-dark-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
