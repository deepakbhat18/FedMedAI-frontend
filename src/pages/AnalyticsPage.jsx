import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import { FiRefreshCw, FiWifi, FiWifiOff, FiActivity, FiCpu, FiHeart, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { getDashboardAnalytics, getMLMetrics } from '../api/analyticsApi';
import { toast } from 'react-toastify';

import LiverIcon from '../components/common/LiverIcon';

const D_EMOJI = { heart_disease: '❤️', diabetes: '🩸', kidney_disease: '🫘', liver_disease: null, stroke: '🧠' };
const getDiseaseIcon = (key, size = 20) => key === 'liver_disease'
  ? <LiverIcon size={size} style={{ verticalAlign: 'middle' }} />
  : <span style={{ fontSize: size }}>{D_EMOJI[key]}</span>;

const Sk = ({ h = '16px', w = '100%', r = '8px' }) => <div className="shimmer" style={{ height: h, width: w, borderRadius: r }} />;

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-lg)', minWidth: 180 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {payload.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '3px', background: entry.color }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{entry.name}</span>
            </div>
            <span className="font-mono" style={{ fontSize: 14, fontWeight: 700, color: entry.color }}>
              {typeof entry.value === 'number' ? `${entry.value.toFixed(1)}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, accent, icon: Icon, delay }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
    className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: '14px', background: `${accent}1A`, border: `1px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={24} style={{ color: accent }} />
    </div>
    <div>
      <div className="font-mono" style={{ fontSize: 36, fontWeight: 800, color: accent, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>{value}</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
    </div>
  </motion.div>
);

const AccuracyCard = ({ d, index }) => {
  const color = d.accuracy >= 82 ? 'var(--success)' : d.accuracy >= 75 ? 'var(--primary)' : d.accuracy >= 70 ? 'var(--warning)' : 'var(--danger)';
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.05 }}
      className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: 'var(--shadow-sm)' }}>
            {d.disease_key === 'liver_disease' ? <LiverIcon size={28} /> : (D_EMOJI[d.disease_key] || '🏥')}
          </div>
          <div>
            <div className="font-heading" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{d.fullName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{d.samples?.toLocaleString()} inference samples</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="font-mono" style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{d.accuracy.toFixed(1)}%</div>
          {d.isLive && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
              <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
              <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Telemetry</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden', marginBottom: 20, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(d.accuracy, 100)}%` }} transition={{ delay: 0.4 + index * 0.1, duration: 1.2, ease: [0.16,1,0.3,1] }}
          style={{ height: '100%', borderRadius: 99, background: color }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, padding: '16px', background: 'var(--bg-input)', borderRadius: '12px' }}>
        {[['F1 Score', d.f1], ['Precision', d.precision], ['Recall', d.recall]].map(([k, v]) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{v?.toFixed(2) || '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-ghost)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMLOnline, setIsMLOnline] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, metricsRes] = await Promise.all([
        getDashboardAnalytics(),
        getMLMetrics().catch(() => null),
      ]);
      setAnalytics(analyticsRes.data.data);
      if (metricsRes?.data?.success && metricsRes?.data?.data?.disease_metrics) {
        setMlMetrics(metricsRes.data.data);
        setIsMLOnline(true);
      } else {
        setIsMLOnline(false);
      }
    } catch { toast.error('Failed to load telemetry'); }
    finally { setLoading(false); }
  };

  const getDiseaseData = () => {
    if (!mlMetrics?.disease_metrics) return [];
    return Object.entries(mlMetrics.disease_metrics).map(([key, value]) => ({
      disease_key: key, fullName: value.disease_name,
      shortName: value.disease_name.replace('Disease', '').replace('Chronic ', '').trim(),
      accuracy: parseFloat(value.accuracy.toFixed(2)),
      f1: parseFloat(value.f1_score.toFixed(2)),
      precision: parseFloat(value.precision.toFixed(2)),
      recall: parseFloat(value.recall.toFixed(2)),
      samples: value.num_samples,
      isLive: true,
    })).sort((a, b) => b.accuracy - a.accuracy);
  };

  const getHospitalChartData = () => {
    if (!analytics?.hospitalStats) return [];
    return analytics.hospitalStats.map(h => ({
      name: h.hospitalName.length > 15 ? h.hospitalName.slice(0, 15) + '…' : h.hospitalName,
      patients: h.patientCount, predictions: h.predictionCount,
    }));
  };

  const getPieData = () => {
    const dist = analytics?.predictionDistribution || {};
    return Object.entries(dist).map(([label, count]) => ({ name: label, value: count }));
  };

  const diseaseData = getDiseaseData();
  const hospitalChartData = getHospitalChartData();
  const pieData = getPieData();
  const avgAcc = mlMetrics?.summary?.avg_accuracy;

  return (
    <div className="page-enter" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div>
          <h1 className="font-heading" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>Global Analytics</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Real-time telemetry and federated learning performance metrics.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: '12px', background: isMLOnline ? 'var(--success-light)' : 'var(--danger-light)', border: `1px solid ${isMLOnline ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}` }}>
            {isMLOnline ? <FiWifi size={16} style={{ color: 'var(--success)' }} /> : <FiWifiOff size={16} style={{ color: 'var(--danger)' }} />}
            <span style={{ fontSize: 13, fontWeight: 700, color: isMLOnline ? '#065F46' : '#991B1B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Engine {isMLOnline ? 'Online' : 'Offline'}</span>
          </div>
          <button onClick={loadData} className="btn-secondary" style={{ padding: '10px 14px' }} title="Force Sync">
            <FiRefreshCw size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}><Sk h="48px" w="48px" r="14px" /><Sk h="36px" w="60%" /><Sk h="16px" w="80%" /></div>)
        ) : <>
          <StatCard icon={FiActivity}  label="Active Nodes"       value={analytics?.totalHospitals || '—'}           accent="var(--accent)"   delay={0.1} />
          <StatCard icon={FiUsers}     label="Global Patient DB"  value={analytics?.totalPatients?.toLocaleString() || '—'} accent="var(--success)"  delay={0.15} />
          <StatCard icon={FiHeart}     label="Total Inferences"   value={analytics?.totalPredictions?.toLocaleString() || '—'} accent="var(--purple)"   delay={0.2} />
          <StatCard icon={FiCpu}       label="Global Accuracy"    value={avgAcc ? `${avgAcc.toFixed(1)}%` : '—'}     accent="var(--warning)"   delay={0.25} />
        </>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '5fr 3fr', gap: 20, marginBottom: 32 }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Network Utilization</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Data volume distribution per hospital node.</div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[{ color: '#2563EB', label: 'Patient Data' }, { color: '#059669', label: 'Inferences' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '3px', background: l.color }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {loading ? <Sk h="280px" /> : hospitalChartData.length === 0 ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-ghost)', fontSize: 15 }}>No utilization data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hospitalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={16} barGap={6}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-ghost)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--text-ghost)', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip cursor={{ fill: 'var(--bg-input)' }} content={<ChartTooltip />} />
                <Bar dataKey="patients" name="Patient Data" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predictions" name="Inferences" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: 32 }}>
            <div className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Inference Topology</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Positive vs Negative detection ratio.</div>
          </div>
          
          {loading ? <Sk h="280px" r="50%" /> : pieData.length === 0 ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-ghost)', fontSize: 15 }}>Awaiting inference data</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} dataKey="value" paddingAngle={5}>
                  {pieData.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.name === 'Disease Detected' ? '#DC2626' : '#059669'} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [v.toLocaleString(), name]} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-default)', fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-md)' }} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ paddingTop: 20 }} formatter={(v) => <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--primary-light)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiTrendingUp size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <div className="font-heading" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Federated Model Telemetry</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Live accuracy and confidence scores from distributed training.</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
            {[...Array(5)].map((_, i) => <div key={i} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}><Sk h="40px" /><Sk h="16px" w="100%" /><Sk h="80px" /></div>)}
          </div>
        ) : !isMLOnline ? (
          <div className="card" style={{ padding: '64px 32px', textAlign: 'center', background: 'transparent', border: '2px dashed var(--border-strong)', boxShadow: 'none' }}>
            <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FiWifiOff size={32} style={{ color: 'var(--text-ghost)' }} />
            </div>
            <div className="font-heading" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 8 }}>Telemetry Offline</div>
            <div style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>The Python Machine Learning backend is currently unreachable. Start the backend service to view live model metrics.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
            {diseaseData.map((d, i) => <AccuracyCard key={d.disease_key} d={d} index={i} />)}
          </div>
        )}
      </motion.div>
    </div>
  );
}
