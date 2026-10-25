import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMLService } from '../../context/MLServiceContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiMenu, FiSearch, FiLogOut, FiUser,
  FiShield, FiActivity, FiCheckCircle, FiAlertCircle,
  FiChevronDown, FiRefreshCw, FiSun, FiMoon
} from 'react-icons/fi';

const routeTitleMap = {
  '/dashboard': { title: 'Clinical Dashboard', category: 'Overview' },
  '/patients': { title: 'Patient Registry', category: 'Management' },
  '/predict': { title: 'AI Diagnosis & Risk Scoring', category: 'Clinical Tools' },
  '/predictions': { title: 'Diagnostic Predictions', category: 'History & Auditing' },
  '/models': { title: 'Federated Learning Network', category: 'Machine Learning' },
  '/analytics': { title: 'Network Analytics & Metrics', category: 'Intelligence' },
  '/hospitals': { title: 'Participating Hospitals', category: 'Administration' },
  '/scheduler': { title: 'Automated Training Scheduler', category: 'Operations' },
  '/export': { title: 'Reports & Data Export', category: 'Compliance' },
  '/timeline': { title: 'Patient Risk Trajectory', category: 'Clinical Tools' },
};

const Header = ({ onToggleSidebar, sidebarCollapsed, onSearchChange, searchTerm = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { isOnline, checking, retry } = useMLService();
  const { isDark, toggleTheme } = useTheme();

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const routeKey = Object.keys(routeTitleMap).find(path =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  );

  const pageInfo = routeTitleMap[routeKey] || {
    title: 'FedMed AI',
    category: 'Healthcare System'
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() || 'U';

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Page Title & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <FiMenu size={20} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
              <span>FedMed AI</span>
              <span>/</span>
              <span className="text-teal-700 font-semibold">{pageInfo.category}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 truncate">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Right: Search, ML Health status, User Profile */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {/* Quick Search */}
          <div className="relative flex items-center w-40 sm:w-60 md:w-72 lg:w-80 xl:w-96 transition-all">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500">
              <FiSearch size={17} />
            </div>
            <input
              type="text"
              placeholder="Search registry & data..."
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full h-11 pl-11 pr-4 text-sm font-normal leading-normal bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* ML Service Live Status Pill */}
          <div
            className={`hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
            title={isOnline ? 'FastAPI ML Engine is active and communicating' : 'ML Engine is unreachable'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500 pulse-dot' : 'bg-rose-500'
              }`}
            />
            <span>
              ML Engine {isOnline ? 'Active' : 'Offline'}
            </span>
            {!isOnline && (
              <button
                onClick={retry}
                disabled={checking}
                className="ml-1 p-0.5 text-rose-700 hover:text-rose-900 rounded focus:outline-none"
                title="Retry connection"
              >
                <FiRefreshCw size={12} className={checking ? 'animate-spin' : ''} />
              </button>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          >
            {isDark ? <FiSun size={19} className="text-amber-400" /> : <FiMoon size={19} className="text-slate-600" />}
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {initials}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {user?.fullName || user?.username || 'Authenticated User'}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight font-medium">
                  {isAdmin ? 'System Admin' : 'Hospital Admin'}
                </p>
              </div>
              <FiChevronDown size={14} className="text-slate-400 hidden lg:block" />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-fade-up">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {user?.fullName || user?.username}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {user?.email || 'Authenticated User'}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                    <FiShield size={10} />
                    <span>{isAdmin ? 'System Administrator' : 'Hospital Node Admin'}</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FiActivity size={14} className="text-slate-400" />
                    <span>Dashboard Overview</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
                  >
                    <FiLogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
