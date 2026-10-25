import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiClock, FiCheck, FiX,
  FiAlertTriangle, FiRefreshCw, FiCalendar,
  FiActivity, FiCpu, FiZap, FiSettings,
} from 'react-icons/fi';
import {
  getSchedulerStatus,
  triggerScheduler,
  getSchedulerHistory,
} from '../api/schedulerApi';
import { toast } from 'react-toastify';

const statusConfig = {
  SUCCESS:    { color: '#0D9488', bg: '#F0FDFA', border: '#CCFBF1', icon: FiCheck },
  PARTIAL:    { color: '#F59E0B', bg: '#FFFBEB', border: '#FEF3C7', icon: FiAlertTriangle },
  FAILED:     { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: FiX },
  SKIPPED:    { color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', icon: FiAlertTriangle },
  NEVER:      { color: '#94A3B8', bg: '#F8FAFC', border: '#E2E8F0', icon: FiClock },
  IN_PROGRESS:{ color: '#0284C7', bg: '#F0F9FF', border: '#E0F2FE', icon: FiRefreshCw },
};

const CRON_PRESETS = [
  { id: 'daily',     label: 'Daily at 2:00 AM',        cron: '0 0 2 * * *',     description: 'Trains every day automatically across active hospital nodes' },
  { id: 'weekly',    label: 'Weekly (Monday 2:00 AM)',  cron: '0 0 2 * * MON',   description: 'Executes federated round once per week during low traffic' },
  { id: 'biweekly',  label: 'Bi-Weekly (1st & 15th)',   cron: '0 0 2 1,15 * *',  description: 'Trains twice per month on alternating cycles' },
  { id: 'monthly',   label: 'Monthly (1st of month)',   cron: '0 0 2 1 * *',     description: 'Consolidates long-term updates once per month' },
];

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-[#17263D]">{value}</p>
    </div>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50 border border-teal-200 text-teal-700 flex-shrink-0">
      <Icon size={22} />
    </div>
  </div>
);

const HistoryRow = ({ entry, index }) => {
  const cfg  = statusConfig[entry.status] || statusConfig.NEVER;
  const Icon = cfg.icon;
  return (
    <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-[#17263D]">{entry.status}</p>
          <p className="text-sm text-slate-500 mt-0.5 truncate max-w-md">
            {entry.message || 'Automated federated round execution'}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <p className="text-sm font-mono font-semibold text-slate-700">
          {entry.runTime ? new Date(entry.runTime).toLocaleDateString('en-US', {
            month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
          }) : '—'}
        </p>
        {entry.duration && (
          <p className="text-xs text-slate-400 mt-0.5 font-mono">⏱ {entry.duration}</p>
        )}
      </div>
    </div>
  );
};

const SchedulerPage = () => {
  const [status,         setStatus]         = useState(null);
  const [history,        setHistory]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [triggering,     setTriggering]     = useState(false);
  const [refreshing,     setRefreshing]     = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('weekly');
  const [showConfig,     setShowConfig]     = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        getSchedulerStatus(),
        getSchedulerHistory(),
      ]);
      setStatus(statusRes?.data?.data || null);
      setHistory(historyRes?.data?.data?.runHistory || []);
    } catch {
      toast.error('Failed to load scheduler telemetry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    toast.success('Scheduler telemetry updated');
  };

  const handleTrigger = async () => {
    if (status?.isRunning) { toast.warning('A federated training round is already running!'); return; }
    setTriggering(true);
    try {
      toast.info('Coordinating federated training round across nodes…');
      const res    = await triggerScheduler();
      const result = res?.data?.data;
      if (result?.status === 'COMPLETED' || result?.success === true) {
        toast.success(`Training round ${result.trainingRound || ''} finished successfully!`);
      } else if (result?.status === 'FAILED') {
        toast.error(`Training failed: ${result.error || 'Check ML service logs'}`);
      } else {
        toast.info(result?.message || 'Federated round triggered');
      }
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch training round');
    } finally {
      setTriggering(false);
    }
  };

  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId);
    const preset = CRON_PRESETS.find(p => p.id === presetId);
    toast.info(`Preset selected: ${preset?.label}. Update app.scheduler.cron in application.yml to apply permanently.`);
  };

  const isRunning          = status?.isRunning || false;
  const isEnabled          = status?.enabled !== false;
  const lastStatus         = status?.lastRunStatus || 'NEVER';
  const lastStatusCfg      = statusConfig[lastStatus] || statusConfig.NEVER;
  const LastIcon           = lastStatusCfg.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80 w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-3 border-teal-600 border-t-transparent animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading federated scheduler telemetry…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Banner / Welcome Card */}
      <div className="w-full bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/70">
              Operations & Automation
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17263D]">
            Automated Training Scheduler
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Cron-based federated learning execution, synchronization status, and historical logs.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowConfig(v => !v)}
            className={`flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold border transition-all ${
              showConfig
                ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FiSettings size={16} />
            <span>Cron Presets</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-xs"
          >
            <FiRefreshCw size={15} className={refreshing ? 'animate-spin text-teal-600' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Main Status Hero Card */}
      <div className="w-full bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                isRunning
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : isEnabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-rose-50 border-rose-200 text-rose-600'
              }`}>
                {isRunning ? (
                  <FiRefreshCw size={24} className="animate-spin" />
                ) : isEnabled ? (
                  <FiCheck size={24} />
                ) : (
                  <FiX size={24} />
                )}
              </div>
              {(isRunning || isEnabled) && (
                <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isRunning ? 'bg-blue-500 animate-ping' : 'bg-emerald-500'
                }`} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <p className="text-lg sm:text-xl font-extrabold text-[#17263D]">
                  {isRunning ? 'Federated Round In Progress…' : isEnabled ? 'Automated Scheduler Online' : 'Scheduler Disabled'}
                </p>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  isRunning
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : isEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {isRunning ? 'RUNNING' : isEnabled ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <FiCalendar size={15} className="text-teal-600" />
                <span>{status?.cronDescription || 'Every Monday at 2:00 AM'}</span>
                <span className="font-mono text-slate-400">({status?.cronExpression || '0 0 2 * * MON'})</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTrigger}
            disabled={triggering || isRunning}
            className={`flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold text-white transition-all shadow-sm ${
              triggering || isRunning
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-[#0D9488] hover:bg-[#0F766E] active:scale-[0.99]'
            }`}
          >
            {triggering ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Dispatching FL Round…</span>
              </>
            ) : isRunning ? (
              <>
                <FiRefreshCw size={16} className="animate-spin" />
                <span>Training Running</span>
              </>
            ) : (
              <>
                <FiZap size={16} />
                <span>Trigger Round Now</span>
              </>
            )}
          </button>
        </div>

        {status?.lastRunTime && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-6 flex-wrap text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <LastIcon size={13} style={{ color: lastStatusCfg.color }} />
              <span>Last Execution:</span>
              <strong className="font-semibold" style={{ color: lastStatusCfg.color }}>{lastStatus}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <FiClock size={13} className="text-slate-400" />
              <span>Timestamp:</span>
              <strong className="text-slate-700 font-mono">
                {new Date(status.lastRunTime).toLocaleString('en-US', {
                  month: 'short', day: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </strong>
            </div>
            {status?.lastRunMessage && (
              <div className="flex items-center gap-1.5 truncate max-w-md">
                <FiActivity size={13} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{status.lastRunMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
        <StatCard label="Total Executions" value={status?.totalScheduledRuns ?? 0} icon={FiCpu} />
        <StatCard label="Successful Runs" value={status?.successfulRuns ?? 0} icon={FiCheck} />
        <StatCard label="Failed Runs" value={status?.failedRuns ?? 0} icon={FiX} />
        <StatCard
          label="Reliability Rate"
          value={(status?.totalScheduledRuns ?? 0) > 0
            ? `${Math.round(((status.successfulRuns ?? 0) / status.totalScheduledRuns) * 100)}%`
            : '100%'}
          icon={FiActivity}
        />
      </div>

      {/* Preset Config Flyout */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden w-full"
          >
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
              <h2 className="text-sm font-bold text-[#17263D] mb-1 flex items-center gap-2">
                <FiSettings size={16} className="text-teal-600" />
                <span>Cron Schedule Presets</span>
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Select a preset schedule. To persist the schedule, set <code className="font-mono bg-slate-100 text-teal-800 px-1 py-0.5 rounded text-[11px]">app.scheduler.cron</code> in the backend environment.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CRON_PRESETS.map(preset => {
                  const active = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        active
                          ? 'bg-teal-50/70 border-teal-500 shadow-sm'
                          : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs font-bold ${active ? 'text-teal-900' : 'text-slate-800'}`}>
                          {preset.label}
                        </p>
                        {active && <FiCheck size={14} className="text-teal-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500">{preset.description}</p>
                      <p className="text-[10px] font-mono text-teal-700 font-semibold mt-1">{preset.cron}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Training Hyperparameters */}
      <div className="w-full bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-1.5">
          <FiCpu size={14} className="text-teal-600" />
          <span>Active Training Hyperparameters</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {status?.config && Object.entries({
            'Local Epochs':  status.config.epochs,
            'Learning Rate': status.config.learningRate,
            'Batch Size':    status.config.batchSize,
            'Engine':        status.config.engine || 'custom',
            'FL Rounds':     status.config.numRounds,
            'Target Cadence':'Weekly',
          }).map(([key, val]) => (
            <div key={key} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">{key}</p>
              <p className="text-xs font-bold font-mono text-[#17263D]">{String(val)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Run History */}
      <div className="w-full bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#17263D] flex items-center gap-2">
            <FiActivity size={16} className="text-teal-600" />
            <span>Scheduler Run History</span>
          </h2>
          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {history.length} records
          </span>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-xl">
            <FiClock size={28} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No scheduled runs recorded yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click "Trigger Round Now" to launch an initial run</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((entry, i) => <HistoryRow key={i} entry={entry} index={i} />)}
          </div>
        )}
      </div>

      {/* Architecture Explainer */}
      <div className="w-full rounded-2xl p-6 bg-teal-50/60 border border-teal-200/80">
        <p className="text-xs font-bold text-teal-900 mb-2.5 flex items-center gap-1.5">
          <span>ℹ️</span> Federated Scheduler Workflow
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-600">
          <div>
            <strong className="text-slate-800 block mb-0.5">1. Scheduled Dispatch</strong>
            Cron worker triggers background aggregation round across all active clinical nodes.
          </div>
          <div>
            <strong className="text-slate-800 block mb-0.5">2. Edge Privacy</strong>
            Hospitals train locally on patient cohorts; raw records never leave local premises.
          </div>
          <div>
            <strong className="text-slate-800 block mb-0.5">3. Global Convergence</strong>
            Federated server aggregates parameter updates and checkpoints new model weights.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerPage;
