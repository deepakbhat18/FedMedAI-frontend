import { useMLService } from '../../context/MLServiceContext';
import { FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MLServiceBanner = () => {
  const { isOnline, isLoading } = useMLService();
  if (isLoading || isOnline) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, 
          padding: '12px 24px', 
          background: 'var(--warning)', 
          color: 'white',
          boxShadow: '0 4px 12px rgba(217,119,6,0.3)'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}>
          <FiAlertCircle size={14} />
        </div>
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>
          <strong style={{ fontWeight: 700 }}>ML Service Offline:</strong> Core prediction and federated training nodes are currently unreachable. Please start the Python backend.
        </span>
      </motion.div>
    </AnimatePresence>
  );
};
export default MLServiceBanner;
