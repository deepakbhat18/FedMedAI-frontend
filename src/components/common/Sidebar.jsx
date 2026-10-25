import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiUsers, FiHeart, FiActivity,
  FiBarChart2, FiCpu, FiDownload, FiClock,
  FiChevronLeft, FiChevronRight, FiLogOut,
  FiShield, FiX, FiLayers
} from 'react-icons/fi';

const NavItem = ({ item, collapsed, onItemClick }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path ||
    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

  return (
    <NavLink
      to={item.path}
      onClick={onItemClick}
      title={collapsed ? item.label : undefined}
      className={`group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors relative min-h-[42px] ${
        isActive
          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300 font-semibold shadow-xs'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
      }`}
    >
      {/* Active Left Indicator Pill */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-teal-600 dark:bg-teal-400 rounded-r-md" />
      )}
      <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
        <item.icon
          size={18}
          className={`transition-colors ${
            isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
          }`}
        />
      </span>
      {!collapsed && (
        <span className="truncate flex-1 min-w-0 text-left">{item.label}</span>
      )}
      {item.badge && !collapsed && (
        <span className="flex-shrink-0 ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded tracking-wide bg-teal-100/90 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
};

const Sidebar = ({ collapsed, onCollapsedChange, mobileOpen, onMobileClose }) => {
  const { user, logout, isAdmin } = useAuth();

  // Primary Clinical Tools
  const mainNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { path: '/patients', label: 'Patients', icon: FiUsers },
    { path: '/predict', label: 'AI Diagnosis', icon: FiHeart },
    { path: '/predictions', label: 'Predictions', icon: FiActivity },
    { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  ];

  // System & Federated Learning (Admin features)
  const federatedNavItems = [
    ...(isAdmin ? [{ path: '/models', label: 'Federated Learning', icon: FiCpu, badge: 'FedAvg' }] : []),
    ...(isAdmin ? [{ path: '/hospitals', label: 'Hospitals Network', icon: FiLayers }] : []),
    { path: '/export', label: 'Reports & Export', icon: FiDownload },
    ...(isAdmin ? [{ path: '/scheduler', label: 'Training Scheduler', icon: FiClock }] : []),
  ];

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() || 'U';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#111B2E] border-r border-slate-200 dark:border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <FiHeart size={18} />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 block truncate">
                FedMed <span className="text-teal-600 dark:text-teal-400">AI</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block tracking-wider uppercase truncate">
                Clinical FL Platform
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FiChevronRight size={17} /> : <FiChevronLeft size={17} />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onMobileClose}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          aria-label="Close sidebar"
        >
          <FiX size={19} />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!collapsed && (
            <p className="px-3.5 mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Core Platform
            </p>
          )}
          <div className="space-y-1.5">
            {mainNavItems.map(item => (
              <NavItem
                key={item.path}
                item={item}
                collapsed={collapsed}
                onItemClick={() => onMobileClose && onMobileClose()}
              />
            ))}
          </div>
        </div>

        <div>
          {!collapsed && (
            <p className="px-3.5 mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isAdmin ? 'Federated & Operations' : 'Compliance & Reports'}
            </p>
          )}
          <div className="space-y-1.5">
            {federatedNavItems.map(item => (
              <NavItem
                key={item.path}
                item={item}
                collapsed={collapsed}
                onItemClick={() => onMobileClose && onMobileClose()}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* User Status Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex-shrink-0">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-[#172338] border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800 font-bold text-sm flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {user?.fullName || user?.username || 'User'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <FiShield size={12} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <span className="truncate">{isAdmin ? 'Admin' : 'Hospital Admin'}</span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex-shrink-0 focus:outline-none"
            title="Sign out"
          >
            <FiLogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (In Document Flow) */}
      <aside
        style={{ width: collapsed ? '72px' : '256px' }}
        className="hidden md:flex flex-col flex-shrink-0 sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sliding Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-64 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
