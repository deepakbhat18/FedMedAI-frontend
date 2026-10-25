import {
  createContext, useContext,
  useState, useEffect, useCallback,
} from 'react';
import { getMLServiceHealth } from '../api/analyticsApi';

const MLServiceContext = createContext(null);

export const useMLService = () => {
  const context = useContext(MLServiceContext);
  if (!context) {
    throw new Error(
      'useMLService must be used within MLServiceProvider'
    );
  }
  return context;
};

export const MLServiceProvider = ({ children }) => {
  const [isOnline,      setIsOnline]      = useState(true);
  const [checking,      setChecking]      = useState(true);
  const [lastChecked,   setLastChecked]   = useState(null);
  const [retryCount,    setRetryCount]    = useState(0);

  const checkHealth = useCallback(async () => {
    try {
      const res = await getMLServiceHealth();
      const up = res.data.data?.mlServiceStatus === 'UP';
      setIsOnline(up);
      setLastChecked(new Date());
      if (up) setRetryCount(0);
    } catch {
      setIsOnline(false);
      setLastChecked(new Date());
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    setChecking(false);
    return;
  }

  checkHealth();

  const interval = setInterval(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      checkHealth();
    }
  }, 30000);

  return () => clearInterval(interval);
}, [checkHealth]);

  return (
    <MLServiceContext.Provider value={{
      isOnline,
      checking,
      lastChecked,
      retryCount,
      retry: checkHealth,
      checkHealth
    }}>
      {children}
    </MLServiceContext.Provider>
  );
};