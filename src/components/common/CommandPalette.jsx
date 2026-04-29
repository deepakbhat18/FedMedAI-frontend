import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiHome, FiUsers, FiHeart, FiCpu, FiGrid, FiLogOut, FiBarChart2, FiClock, FiDownload } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ACTIONS = [
  { id: 'dashboard',   label: 'Go to Intelligence Center', icon: FiHome,      path: '/dashboard',   keywords: ['home', 'dashboard', 'start'] },
  { id: 'hospitals',   label: 'Go to Network Health',      icon: FiActivity,  path: '/hospitals',   keywords: ['hospitals', 'nodes', 'network', 'health'], adminOnly: true },
  { id: 'patients',    label: 'Go to Patient Data',        icon: FiUsers,     path: '/patients',    keywords: ['patients', 'people', 'data'] },
  { id: 'predict',     label: 'Run AI Diagnostics',        icon: FiHeart,     path: '/predict',     keywords: ['predict', 'ai', 'diagnose', 'inference', 'new'] },
  { id: 'predictions', label: 'View Prediction Logs',      icon: FiBarChart2, path: '/predictions', keywords: ['predictions', 'history', 'logs'] },
  { id: 'models',      label: 'Manage FL Models',          icon: FiCpu,       path: '/models',      keywords: ['models', 'fl', 'federated', 'training'], adminOnly: true },
  { id: 'analytics',   label: 'View System Analytics',     icon: FiGrid,      path: '/analytics',   keywords: ['analytics', 'stats', 'metrics'] },
  { id: 'scheduler',   label: 'Open Job Scheduler',        icon: FiClock,     path: '/scheduler',   keywords: ['schedule', 'jobs', 'cron'], adminOnly: true },
  { id: 'export',      label: 'Export Data',               icon: FiDownload,  path: '/export',      keywords: ['export', 'download', 'csv'] },
  { id: 'logout',      label: 'Log out',                   icon: FiLogOut,    action: 'LOGOUT',     keywords: ['logout', 'sign out', 'exit'] },
];

import { FiActivity } from 'react-icons/fi';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isAuthenticated) return null;

  const filteredActions = ACTIONS.filter(action => {
    if (action.adminOnly && !isAdmin) return false;
    const searchString = `${action.label} ${action.keywords.join(' ')}`.toLowerCase();
    return searchString.includes(query.toLowerCase());
  });

  const handleSelect = (action) => {
    setIsOpen(false);
    if (action.action === 'LOGOUT') {
      logout();
    } else if (action.path) {
      navigate(action.path);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        handleSelect(filteredActions[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }}>
          
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ position: 'relative', width: '100%', maxWidth: 540, background: 'var(--bg-surface)', borderRadius: '16px', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', border: '1px solid var(--border-default)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <FiSearch size={20} style={{ color: 'var(--text-ghost)', marginRight: 12 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, navigate, or act..."
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 16, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <kbd style={{ fontSize: 11, padding: '4px 6px', background: 'var(--bg-elevated)', borderRadius: 6, color: 'var(--text-muted)', border: '1px solid var(--border-default)', fontFamily: 'inherit', fontWeight: 600 }}>esc</kbd>
              </div>
            </div>

            <div style={{ maxHeight: 340, overflowY: 'auto' }} className="custom-scroll">
              {filteredActions.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  No commands found for "{query}"
                </div>
              ) : (
                <div style={{ padding: '8px' }}>
                  {filteredActions.map((action, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={action.id}
                        onClick={() => handleSelect(action)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        style={{
                          display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                          background: isSelected ? 'var(--accent-light)' : 'transparent',
                          transition: 'background 0.1s',
                        }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: isSelected ? 'var(--bg-surface)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, border: isSelected ? '1px solid rgba(37,99,235,0.2)' : '1px solid transparent' }}>
                          <action.icon size={14} style={{ color: isSelected ? 'var(--accent)' : 'var(--text-secondary)' }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--accent-hover)' : 'var(--text-secondary)' }}>
                          {action.label}
                        </span>
                        {isSelected && (
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                            <kbd style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>↵</kbd>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px', background: 'var(--bg-app)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-ghost)', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><kbd style={{ background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--border-default)' }}>↑</kbd><kbd style={{ background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--border-default)' }}>↓</kbd> Navigate</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><kbd style={{ background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: 4, border: '1px solid var(--border-default)' }}>↵</kbd> Select</span>
              </div>
              <div>FedMedAI Command Palette</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
