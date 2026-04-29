import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCheck, FiX, FiAlertTriangle, FiRefreshCw, FiZap, FiCalendar, FiCpu, FiTerminal } from 'react-icons/fi';
import { getSchedulerStatus, triggerScheduler, getSchedulerHistory } from '../api/schedulerApi';
import { toast } from 'react-toastify';

const STATUS_CFG = {
  SUCCESS:     { color: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success-mid)',  badge: 'badge-green',  Icon: FiCheck },
  PARTIAL:     { color: 'var(--warning)', bg: 'var(--warning-light)', border: 'var(--warning-mid)',  badge: 'badge-yellow', Icon: FiAlertTriangle },
  FAILED:      { color: 'var(--danger)',  bg: 'var(--danger-light)',  border: 'var(--danger-mid)',   badge: 'badge-red',    Icon: FiX },
  SKIPPED:     { color: 'var(--text-ghost)', bg: 'var(--bg-elevated)', border: 'var(--border-default)', badge: 'badge-gray', Icon: FiAlertTriangle },
  NEVER:       { color: 'var(--text-ghost)', bg: 'var(--bg-elevated)', border: 'var(--border-default)', badge: 'badge-gray', Icon: FiClock },
  IN_PROGRESS: { color: 'var(--primary)', bg: 'var(--primary-light)', border: 'var(--primary-mid)', badge: 'badge-blue',   Icon: FiRefreshCw },
};

const CRON_PRESETS = [
  { id: 'daily',    label: 'Daily Sync',     sub: '2:00 AM',     cron: '0 0 2 * * *',    desc: 'Off-peak global sync' },
  { id: 'weekly',   label: 'Weekly Aggregation',    sub: 'Mon 2:00 AM', cron: '0 0 2 * * MON',  desc: 'Start of week' },
  { id: 'biweekly', label: 'Bi-weekly Run', sub: '1st & 15th',  cron: '0 0 2 1,15 * *', desc: 'Twice a month' },
  { id: 'monthly',  label: 'Monthly Epoch',   sub: '1st of month',cron: '0 0 2 1 * *',    desc: 'First day of month' },
];

const Sk = ({ h = '16px', w = '100%', r = '8px' }) => <div className="shimmer" style={{ height: h, width: w, borderRadius: r }} />;

export default function SchedulerPage() {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('daily');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        getSchedulerStatus(),
        getSchedulerHistory().catch(() => ({ data: { data: [] } })),
      ]);
      setStatus(statusRes.data.data);
      setHistory(Array.isArray(historyRes.data.data) ? historyRes.data.data : historyRes.data.data?.runHistory || []);
    } catch { toast.error('Failed to load scheduler telemetry'); }
    finally { setLoading(false); }
  };

  const handleTriggerNow = async () => {
    setTriggering(true);
    try {
      const res = await triggerScheduler();
      toast.success(res.data.message || 'Federated learning cycle initiated');
      await loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to trigger training cycle'); }
    finally { setTriggering(false); }
  };

  const statusKey = status?.lastRunStatus || 'NEVER';
  const cfg = STATUS_CFG[statusKey] || STATUS_CFG.NEVER;
  const IconComp = cfg.Icon;

  return (
    <div className="page-enter" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div>
          <h1 className="font-heading" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>Network Scheduler</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Automate and orchestrate federated learning training cycles across all active nodes.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 32 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <FiTerminal size={20} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div>
                <div className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Orchestration Engine</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Current execution state</div>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Sk h="64px" r="12px" /><Sk h="16px" w="80%" /><Sk h="16px" w="60%" />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', borderRadius: '16px', background: cfg.bg, border: `1px solid ${cfg.border}`, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'white', border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                    <IconComp size={24} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <div className="font-heading" style={{ fontSize: 18, fontWeight: 800, color: cfg.color }}>{statusKey}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>Last synchronization result</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px', background: 'var(--bg-app)', borderRadius: '12px', border: '1px dashed var(--border-default)' }}>
                  {[
                    { label: 'Previous Execution', value: status?.lastRunTime ? new Date(status.lastRunTime).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Never' },
                    { label: 'Next Scheduled Run', value: status?.nextRunTime ? new Date(status.nextRunTime).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—' },
                    { label: 'CRON Signature', value: status?.cronExpression || '—', mono: true },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{row.label}</span>
                      <span className={row.mono ? 'font-mono' : ''} style={{ fontSize: 13, fontWeight: row.mono ? 700 : 600, color: 'var(--text-primary)', background: row.mono ? 'var(--bg-elevated)' : 'transparent', padding: row.mono ? '4px 10px' : 0, borderRadius: row.mono ? '6px' : 0, border: row.mono ? '1px solid var(--border-default)' : 'none' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }} className="card" style={{ padding: '32px', background: 'linear-gradient(145deg, var(--bg-surface), var(--bg-elevated))' }}>
            <div style={{ marginBottom: 24 }}>
              <div className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Manual Override</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>Immediately trigger a global federated learning cycle across all connected hospital nodes.</div>
            </div>
            <button onClick={handleTriggerNow} disabled={triggering}
              className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, background: triggering ? 'var(--bg-elevated)' : 'var(--accent)', color: triggering ? 'var(--text-ghost)' : 'white', border: triggering ? '1px solid var(--border-default)' : 'none' }}>
              {triggering ? <><div className="spinner" /><span>Orchestrating Cycle…</span></> : <><FiZap size={18} /><span>Force Global Sync</span></>}
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="card" style={{ padding: '32px' }}>
            <div style={{ marginBottom: 24 }}>
              <div className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Frequency Policy</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Configure how often nodes should train.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CRON_PRESETS.map(preset => (
                <button key={preset.id} onClick={() => setSelectedPreset(preset.id)}
                  style={{ textAlign: 'left', padding: '16px 20px', borderRadius: '12px', background: selectedPreset === preset.id ? 'var(--accent-light)' : 'var(--bg-input)', border: `1px solid ${selectedPreset === preset.id ? 'var(--accent)' : 'var(--border-default)'}`, cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: selectedPreset === preset.id ? 'var(--accent-hover)' : 'var(--text-primary)', marginBottom: 4 }}>{preset.label}</div>
                      <div style={{ fontSize: 13, color: selectedPreset === preset.id ? 'var(--accent)' : 'var(--text-muted)' }}>{preset.desc}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: '8px', background: selectedPreset === preset.id ? 'var(--accent)' : 'var(--bg-elevated)', color: selectedPreset === preset.id ? 'white' : 'var(--text-ghost)' }}>{preset.sub}</span>
                      {selectedPreset === preset.id && <FiCheck size={16} style={{ color: 'var(--accent)' }} />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <button className="btn-secondary">Update Policy</button>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 140px)' }}>
          <div style={{ padding: '32px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Execution Logs</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Chronological history of orchestration events.</div>
            </div>
            <button onClick={loadData} className="btn-secondary" style={{ padding: '10px 14px' }} title="Refresh Logs">
              <FiRefreshCw size={16} />
            </button>
          </div>
          
          <div className="custom-scroll" style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1, background: 'var(--bg-app)' }}>
            {loading ? (
              [...Array(6)].map((_, i) => <Sk key={i} h="88px" r="16px" />)
            ) : history.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '48px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <FiCalendar size={28} style={{ color: 'var(--text-ghost)' }} />
                </div>
                <div className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Log is Empty</div>
                <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>Initiate a global sync to generate orchestration records.</div>
              </div>
            ) : (
              history.map((entry, index) => {
                const entryCfg = STATUS_CFG[entry.status] || STATUS_CFG.NEVER;
                const EntryIcon = entryCfg.Icon;
                return (
                  <motion.div key={entry.id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                    style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', gap: 16, boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '10px', background: entryCfg.bg, border: `1px solid ${entryCfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <EntryIcon size={18} style={{ color: entryCfg.color }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span className={`badge ${entryCfg.badge}`} style={{ fontSize: 11, padding: '4px 10px' }}>{entry.status}</span>
                          {entry.duration && <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-ghost)', fontWeight: 600 }}>⏱ {entry.duration}</span>}
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 460 }}>{entry.message || 'Scheduled routine optimization completed across nodes.'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700, marginBottom: 2 }}>
                        {entry.runTime ? new Date(entry.runTime).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '—'}
                      </div>
                      <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-ghost)', fontWeight: 600 }}>
                        {entry.runTime ? new Date(entry.runTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
