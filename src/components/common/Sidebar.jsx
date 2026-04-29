import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiActivity, FiUsers, FiHeart,
  FiCpu, FiBarChart2, FiLogOut, FiMenu,
  FiClock, FiDownload, FiChevronLeft,
  FiShield, FiGrid, FiMoreVertical
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const adminNav = [
  { path: '/dashboard',   icon: FiHome,      label: 'Intelligence Center' },
  { path: '/hospitals',   icon: FiActivity,  label: 'Network Health' },
  { path: '/patients',    icon: FiUsers,     label: 'Patient Data' },
  { path: '/predict',     icon: FiHeart,     label: 'AI Diagnostics' },
  { path: '/predictions', icon: FiBarChart2, label: 'Prediction Logs' },
  { path: '/models',      icon: FiCpu,       label: 'FL Models' },
  { path: '/analytics',   icon: FiGrid,      label: 'System Analytics' },
];
const adminTools = [
  { path: '/scheduler', icon: FiClock,    label: 'Job Scheduler' },
  { path: '/export',    icon: FiDownload, label: 'Data Export' },
];
const hospitalNav = [
  { path: '/dashboard',   icon: FiHome,      label: 'Dashboard' },
  { path: '/patients',    icon: FiUsers,     label: 'My Patients' },
  { path: '/predict',     icon: FiHeart,     label: 'AI Diagnostics' },
  { path: '/predictions', icon: FiBarChart2, label: 'Prediction Logs' },
  { path: '/analytics',   icon: FiGrid,      label: 'Analytics' },
];
const hospitalTools = [
  { path: '/export', icon: FiDownload, label: 'Data Export' },
];

const NavItem = ({ item, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  return (
    <NavLink to={item.path} title={collapsed ? item.label : undefined} style={{ textDecoration: 'none', position: 'relative', display: 'block' }}>
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          style={{ position: 'absolute', inset: 0, background: 'var(--accent-light)', borderRadius: '10px', zIndex: 0 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <div className={`nav-item ${isActive ? 'active' : ''}`} style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        <item.icon size={18} style={{ flexShrink: 0, color: isActive ? 'var(--accent)' : 'inherit' }} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </NavLink>
  );
};

const Sidebar = ({ collapsed, onCollapsedChange }) => {
  const { user, logout, isAdmin } = useAuth();
  
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
    
  const mainItems = isAdmin ? adminNav : hospitalNav;
  const toolItems = isAdmin ? adminTools : hospitalTools;

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="sidebar"
    >
      
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                  <FiHeart size={18} color="white" />
                </div>
                <div>
                  <div className="font-heading" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>FedMedAI</div>
                  <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>Federated Network</div>
                </div>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ margin: '0 auto' }}>
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  <FiHeart size={20} color="white" />
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button onClick={() => onCollapsedChange(!collapsed)}
          className="icon-btn"
          style={{ position: collapsed ? 'absolute' : 'static', right: collapsed ? '20px' : 'auto', top: collapsed ? '28px' : 'auto', zIndex: 10 }}>
          {collapsed ? <FiMenu size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      <nav className="custom-scroll" style={{ flex: 1, padding: '24px 16px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {!collapsed && <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-ghost)', padding: '0 12px 8px' }}>Workspace</div>}
        {mainItems.map(item => <NavItem key={item.path} item={item} collapsed={collapsed} />)}

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '16px 12px' }} />
        
        {!collapsed && <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-ghost)', padding: '0 12px 8px' }}>Tools & Config</div>}
        {toolItems.map(item => <NavItem key={item.path} item={item} collapsed={collapsed} />)}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-app)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '8px' : '12px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)', position: 'relative' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: isAdmin ? 'var(--accent-light)' : 'var(--teal-light)', border: `1px solid ${isAdmin ? 'rgba(37,99,235,0.1)' : 'rgba(13,148,136,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: isAdmin ? 'var(--accent)' : 'var(--teal)', flexShrink: 0 }}>
            {initials}
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName || 'User'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <FiShield size={10} style={{ color: isAdmin ? 'var(--warning)' : 'var(--teal)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>{isAdmin ? 'System Admin' : 'Hospital Admin'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && (
            <div className="dropdown-trigger" style={{ position: 'relative', cursor: 'pointer' }} onClick={logout} title="Logout">
              <FiLogOut size={16} style={{ color: 'var(--text-ghost)', transition: 'color var(--t-fast)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-ghost)'} />
            </div>
          )}
        </div>
        
        {collapsed && (
          <button onClick={logout} className="icon-btn" style={{ width: '100%', marginTop: '8px', color: 'var(--danger)' }} title="Logout">
            <FiLogOut size={16} />
          </button>
        )}
      </div>
    </motion.aside>
  );
};
export default Sidebar;
