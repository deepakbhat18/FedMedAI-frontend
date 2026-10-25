import { useState } from 'react';
import { FiWifiOff, FiRefreshCw, FiX, FiAlertCircle } from 'react-icons/fi';
import { useMLService } from '../../context/MLServiceContext';

const MLServiceBanner = () => {
  const { isOnline, checking, retry, lastChecked } = useMLService();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline || dismissed) return null;

  return (
    <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 text-xs text-rose-800 z-50 sticky top-0 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <FiWifiOff size={16} className="text-rose-600 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-rose-900">Python ML Engine Offline:</span>
            <span className="text-rose-700">
              Live multi-disease risk evaluation and model training require the FastAPI service.
            </span>
            {lastChecked && (
              <span className="text-rose-500 text-[11px]">
                (Checked {lastChecked.toLocaleTimeString()})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={retry}
            disabled={checking}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-2xs"
          >
            <FiRefreshCw size={11} className={checking ? 'animate-spin' : ''} />
            <span>{checking ? 'Checking...' : 'Reconnect'}</span>
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 text-rose-500 hover:text-rose-800 rounded-md transition-colors"
            title="Dismiss notice"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MLServiceBanner;