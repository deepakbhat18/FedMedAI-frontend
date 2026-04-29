import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiUsers, FiHeart, FiCpu, FiTrendingUp, FiWifi, FiWifiOff, FiRefreshCw } from 'react-icons/fi';
import { getDashboardAnalytics, getMLServiceHealth, getMLMetrics } from '../api/analyticsApi';
import { useAuth } from '../context/AuthContext';

const Sk = ({ h = '16px', w = '100%', r = '8px' }) => (
  <div className="shimmer" style={{ height: h, width: w, borderRadius: r }} />
);

const StatCard = ({ icon: Icon, label, value, accent, sub, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 60, rotateX: 45, scale: 0.85 }} 
    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} 
    whileHover={{ y: -8, scale: 1.03, rotateX: -4, rotateY: 4, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}
    transition={{ delay, duration: 0.8, type: 'spring', bounce: 0.5 }}
    className="card" style={{ padding: '24px', perspective: 1000, cursor: 'pointer' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
      <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${accent}1A`, border: `1px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} style={{ color: accent }} />
      </div>
      {sub && <span className="badge badge-green" style={{ fontSize: 11 }}>{sub}</span>}
    </div>
    <div className="font-heading" style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 8 }}>
      {value !== undefined && value !== null ? value.toLocaleString() : '—'}
    </div>
    <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
  </motion.div>
);

const AccuracyRow = ({ disease, accuracy, delay, isLive }) => {
  const color = accuracy >= 82 ? 'var(--success)' : accuracy >= 75 ? 'var(--accent)' : accuracy >= 70 ? 'var(--warning)' : 'var(--danger)';
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.3 }}
      style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBlock: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', width: 120, flexShrink: 0 }}>{disease}</span>
      <div style={{ flex: 1, height: 8, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(accuracy, 100)}%` }}
          transition={{ delay: delay + 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '100%', borderRadius: 99, background: color }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="font-mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', width: 50, textAlign: 'right' }}>
          {accuracy.toFixed(1)}%
        </span>
        {isLive && <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />}
      </div>
    </motion.div>
  );
};

const HospitalRow = ({ hospital, index }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.05 }}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', transition: 'all var(--t-fast)' }}
    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-xs)' }}>
        <FiActivity size={16} style={{ color: 'var(--accent)' }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{hospital.hospitalName}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{hospital.patientCount} total patients</div>
      </div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div className="font-mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{hospital.predictionCount}</div>
      <div style={{ fontSize: 12, color: 'var(--text-ghost)', fontWeight: 500 }}>predictions</div>
    </div>
  </motion.div>
);

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [mlHealth, setMlHealth] = useState(null);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    loadDashboard();
    const interval = setInterval(loadDashboard, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const loadDashboard = async () => {
    try {
      const [analyticsRes, healthRes, metricsRes] = await Promise.all([
        getDashboardAnalytics(),
        getMLServiceHealth().catch(() => ({ data: { data: { mlServiceStatus: 'DOWN' } } })),
        getMLMetrics().catch(() => null),
      ]);
      setAnalytics(analyticsRes.data.data);
      setMlHealth(healthRes.data.data);
      if (metricsRes?.data?.success && metricsRes?.data?.data?.disease_metrics) {
        setMlMetrics(metricsRes.data.data);
        setDataSource('live');
      } else {
        setDataSource('fallback');
      }
    } catch (e) {
      console.error('Dashboard load error:', e);
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyData = () => {
    if (mlMetrics?.disease_metrics) {
      return Object.entries(mlMetrics.disease_metrics).map(([key, value]) => ({
        name: value.disease_name, accuracy: value.accuracy, isLive: true,
      })).sort((a, b) => b.accuracy - a.accuracy);
    }
    return [
      { name: 'Heart Disease', accuracy: 0, isLive: false },
      { name: 'Kidney Disease', accuracy: 0, isLive: false },
      { name: 'Stroke', accuracy: 0, isLive: false },
      { name: 'Diabetes', accuracy: 0, isLive: false },
      { name: 'Liver Disease', accuracy: 0, isLive: false },
    ];
  };

  const isMLUp = mlHealth?.mlServiceStatus === 'UP';
  const accuracyData = getAccuracyData();
  const avgAccuracy = mlMetrics?.summary?.avg_accuracy;
  const greeting = () => { const h = new Date().getHours(); if (h < 12) return 'Good morning'; if (h < 17) return 'Good afternoon'; return 'Good evening'; };

  return (
    <div className="page-enter" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div>
          <h1 className="font-heading" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Doctor'}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Here's what's happening across your federated network today.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, background: dataSource === 'live' ? 'var(--success-light)' : 'var(--warning-light)', border: `1px solid ${dataSource === 'live' ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)'}` }}>
              <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: dataSource === 'live' ? 'var(--success)' : 'var(--warning)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: dataSource === 'live' ? '#047857' : '#B45309' }}>{dataSource === 'live' ? 'Live Telemetry' : 'ML Offline'}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: '12px', background: isMLUp ? 'var(--success-light)' : 'var(--danger-light)', border: `1px solid ${isMLUp ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}` }}>
            {isMLUp ? <FiWifi size={14} style={{ color: 'var(--success)' }} /> : <FiWifiOff size={14} style={{ color: 'var(--danger)' }} />}
            <span style={{ fontSize: 13, fontWeight: 600, color: isMLUp ? '#047857' : '#B91C1C' }}>Engine {isMLUp ? 'Online' : 'Offline'}</span>
          </div>
          <button onClick={loadDashboard} className="btn-secondary" style={{ padding: '8px 12px' }} title="Refresh Dashboard">
            <FiRefreshCw size={16} />
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 32 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}><Sk h="44px" w="44px" r="12px" /><Sk h="36px" w="60%" /><Sk h="16px" w="80%" /></div>)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 32 }}>
          <StatCard icon={FiActivity} label="Active Hospitals"  value={analytics?.totalHospitals}   accent="var(--accent)"  delay={0.1} />
          <StatCard icon={FiUsers}    label="Total Patients"    value={analytics?.totalPatients}    accent="var(--success)" delay={0.15}  />
          <StatCard icon={FiHeart}    label="AI Predictions"    value={analytics?.totalPredictions} accent="var(--purple)"  delay={0.2} />
          <StatCard icon={FiCpu}      label="FL Training Rounds"value={analytics?.totalTrainingRounds} accent="var(--warning)"delay={0.25}  />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 24 }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Model Intelligence</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                {dataSource === 'live' ? 'Live accuracy metrics from federated training runs.' : 'Waiting for ML engine to spin up.'}
              </div>
            </div>
            {!loading && analytics?.latestModelVersion && (
              <span className="font-mono" style={{ fontSize: 12, padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', fontWeight: 600 }}>
                {analytics.latestModelVersion}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[...Array(5)].map((_, i) => <Sk key={i} h="20px" />)}
            </div>
          ) : dataSource !== 'live' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', background: 'var(--bg-input)', borderRadius: '16px', border: '1px dashed var(--border-strong)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
                <FiWifiOff size={24} style={{ color: 'var(--text-ghost)' }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Telemetry Unavailable</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, maxWidth: 300 }}>The Python ML backend is offline. Metrics cannot be fetched.</div>
              <button onClick={loadDashboard} className="btn-secondary">
                <FiRefreshCw size={16} /> Force Sync
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {accuracyData.map((d, i) => (
                <AccuracyRow key={d.name} disease={d.name} accuracy={d.accuracy} isLive={d.isLive} delay={0.35 + i * 0.05} />
              ))}
            </div>
          )}

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Global Network Accuracy</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--success-light)', borderRadius: '12px' }}>
              <FiTrendingUp size={18} style={{ color: 'var(--success)' }} />
              <span className="font-mono" style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.02em' }}>
                {avgAccuracy ? `${avgAccuracy.toFixed(1)}%` : '—'}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 24 }}>
            <div className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Network Topography</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Hospital contribution and diagnostic spread.</div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[...Array(3)].map((_, i) => <Sk key={i} h="74px" r="12px" />)}
            </div>
          ) : !analytics?.hospitalStats?.length ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <FiActivity size={24} style={{ color: 'var(--text-ghost)' }} />
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Awaiting hospital node registration.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {analytics.hospitalStats.map((h, i) => <HospitalRow key={h.hospitalId} hospital={h} index={i} />)}
            </div>
          )}

          {!loading && analytics?.predictionDistribution && (
            <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-ghost)', marginBottom: 16 }}>Outcome Distribution</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {Object.entries(analytics.predictionDistribution).map(([label, count]) => (
                  <div key={label} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: label === 'Disease Detected' ? 'var(--danger-light)' : 'var(--success-light)', border: `1px solid ${label === 'Disease Detected' ? 'rgba(220,38,38,0.15)' : 'rgba(5,150,105,0.15)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: label === 'Disease Detected' ? 'var(--danger)' : 'var(--success)', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: label === 'Disease Detected' ? '#991B1B' : '#065F46' }}>{label}</span>
                    </div>
                    <strong className="font-mono" style={{ fontSize: 16, color: label === 'Disease Detected' ? '#7F1D1D' : '#064E3B' }}>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
