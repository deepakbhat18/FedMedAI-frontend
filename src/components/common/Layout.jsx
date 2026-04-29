import { useState } from 'react';
import { useOutlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import MLServiceBanner from './MLServiceBanner';
import { useMLService } from '../../context/MLServiceContext';
import CommandPalette from './CommandPalette';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { isOnline } = useMLService();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)', position: 'relative' }}>
      <CommandPalette />
      <MLServiceBanner />
      
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      
      <main
        className="main-content"
        style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? '80px' : '280px',
          paddingTop: !isOnline ? '80px' : '32px',
          paddingBottom: '40px',
          paddingLeft: '40px',
          paddingRight: '40px',
          transition: 'margin-left 0.3s cubic-bezier(0.16,1,0.3,1), padding-top 0.4s cubic-bezier(0.16,1,0.3,1)',
          maxWidth: '100%',
        }}
      >
        <div style={{ position: 'absolute', top: !isOnline ? 80 : 32, right: 40, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '99px', boxShadow: 'var(--shadow-sm)', transition: 'top 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
          <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
            Logged in as <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user?.username}</span>
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
export default Layout;
