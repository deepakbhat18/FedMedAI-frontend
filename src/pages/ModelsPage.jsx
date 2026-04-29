import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiZap, FiCheck, FiArrowUp, FiArrowDown, FiShield, FiMinus, FiWifiOff, FiWifi, FiLayers, FiActivity } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { getAllModels, triggerTraining } from '../api/modelApi';
import { getMLMetrics } from '../api/analyticsApi';
import { toast } from 'react-toastify';

import LiverIcon from '../components/common/LiverIcon';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#DC2626', '#7C3AED'];
const EMOJI  = { heart_disease: '❤️', diabetes: '🩸', kidney_disease: '🫘', liver_disease: null, stroke: '🧠' };
const getDiseaseIcon = (key, size = 20) => key === 'liver_disease'
  ? <LiverIcon size={size} style={{ verticalAlign: 'middle' }} />
  : <span style={{ fontSize: size }}>{EMOJI[key]}</span>;

const Sk = ({ h = '16px', w = '100%', r = '8px' }) => <div className="shimmer" style={{ height: h, width: w, borderRadius: r }} />;

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '12px 16px', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: payload[0]?.fill }} />
        <div className="font-mono" style={{ fontSize: 16, fontWeight: 800, color: payload[0]?.fill }}>{payload[0]?.value?.toFixed(2)}%</div>
      </div>
    </div>
  );
};

const DiseaseCard = ({ d, index }) => {
  const color = d.accuracy >= 82 ? 'var(--success)' : d.accuracy >= 75 ? 'var(--primary)' : d.accuracy >= 70 ? 'var(--warning)' : 'var(--danger)';
  const bg    = d.accuracy >= 82 ? 'var(--success-light)' : d.accuracy >= 75 ? 'var(--primary-light)' : d.accuracy >= 70 ? 'var(--warning-light)' : 'var(--danger-light)';
  const bdr   = d.accuracy >= 82 ? 'var(--success-mid)'   : d.accuracy >= 75 ? 'var(--primary-mid)'   : d.accuracy >= 70 ? 'var(--warning-mid)'   : 'var(--danger-mid)';
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
      style={{ padding: '20px', borderRadius: '16px', background: bg, border: `1px solid ${bdr}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: 'var(--shadow-sm)' }}>
            {d.isLiver ? <LiverIcon size={26} /> : d.emoji}
          </div>
          <div>
            <div className="font-heading" style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{d.fullName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.name}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="font-mono" style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {d.accuracy > 0 ? `${d.accuracy}%` : '—'}
          </div>
          {d.isLive && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 6 }}>
              <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
              <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live</span>
            </div>
          )}
        </div>
      </div>
      {d.accuracy > 0 && (
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(0,0,0,0.06)', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${d.accuracy}%` }} transition={{ delay: 0.3 + index * 0.05, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: '100%', borderRadius: 99, background: color }} />
        </div>
      )}
    </motion.div>
  );
};

export default function ModelsPage() {
  const [models, setModels] = useState([]);
  const [trainingResult, setTrainingResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [engine, setEngine] = useState('custom');
  const [numRounds, setNumRounds] = useState(3);
  const [dpEnabled, setDpEnabled] = useState(false);
  const [dpEpsilon, setDpEpsilon] = useState(1.0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [modelsRes, metricsRes] = await Promise.all([getAllModels(), getMLMetrics().catch(() => null)]);
      setModels(modelsRes.data.data);
      if (metricsRes?.data?.success && metricsRes?.data?.data?.disease_metrics) setMlMetrics(metricsRes.data.data);
    } catch { console.error('Failed to load models'); }
    finally { setLoading(false); }
  };

  const getDiseaseAccuracies = () => {
    if (mlMetrics?.disease_metrics) {
      return Object.entries(mlMetrics.disease_metrics).map(([key, value]) => ({
        name: value.disease_name.replace('Disease','').replace('Chronic ','').trim(),
        fullName: value.disease_name, emoji: EMOJI[key] || '🏥',
        accuracy: parseFloat(value.accuracy.toFixed(2)), f1: parseFloat(value.f1_score.toFixed(2)), isLive: true,
      })).sort((a, b) => b.accuracy - a.accuracy);
    }
    return [
      { name: 'Heart',    fullName: 'Heart Disease',   emoji: '❤️', accuracy: 0, isLive: false },
      { name: 'Kidney',   fullName: 'Kidney Disease',  emoji: '🫘', accuracy: 0, isLive: false },
      { name: 'Stroke',   fullName: 'Stroke',          emoji: '🧠', accuracy: 0, isLive: false },
      { name: 'Diabetes', fullName: 'Diabetes',        emoji: '🩸', accuracy: 0, isLive: false },
      { name: 'Liver',    fullName: 'Liver Disease',   emoji: null,  isLiver: true, accuracy: 0, isLive: false },
    ];
  };

  const handleTriggerTraining = async () => {
    setTraining(true); setTrainingResult(null);
    try {
      const requestData = { hospitalIds: [1,2,3], epochs: 5, learningRate: 0.01, batchSize: 32, engine, numRounds };
      if (dpEnabled) requestData.dpEpsilon = dpEpsilon;
      const res = await triggerTraining(requestData);
      setTrainingResult(res.data.data);
      toast.success(`FL Round completed using ${engine}!`);
      await loadData();
    } catch (error) { toast.error(error.response?.data?.message || 'Training failed'); }
    finally { setTraining(false); }
  };

  const getPrivacyLabel = eps => {
    if (eps <= 0.5) return 'MAXIMUM';
    if (eps <= 1.0) return 'HIGH';
    if (eps <= 5.0) return 'MODERATE';
    return 'LOW';
  };

  const diseaseAccuracies = getDiseaseAccuracies();
  const isMLOnline = !!mlMetrics;

  return (
    <div className="page-enter" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div>
          <h1 className="font-heading" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>Model Registry</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Configure federated training parameters and monitor model lineage.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: '12px', background: isMLOnline ? 'var(--success-light)' : 'var(--danger-light)', border: `1px solid ${isMLOnline ? 'var(--success-mid)' : 'var(--danger-mid)'}` }}>
          {isMLOnline ? <FiWifi size={16} style={{ color: 'var(--success)' }} /> : <FiWifiOff size={16} style={{ color: 'var(--danger)' }} />}
          <span style={{ fontSize: 13, fontWeight: 700, color: isMLOnline ? '#065F46' : '#991B1B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Engine {isMLOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {!isMLOnline && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="alert alert-warning" style={{ marginBottom: 32 }}>
          <FiWifiOff size={20} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div className="font-heading" style={{ fontSize: 16, fontWeight: 800, color: '#92400E', marginBottom: 4 }}>ML Service Offline</div>
            <div style={{ fontSize: 14, color: '#78350F', lineHeight: 1.5 }}>Training requires the Python Machine Learning backend. Telemetry and orchestration capabilities are suspended until the service connects.</div>
          </div>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '4fr 7fr', gap: 32, marginBottom: 32 }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--primary-light)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiLayers size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <div className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Training Config</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Set parameters for the next FL cycle</div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 12 }}>Compute Framework</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[{ id: 'custom', label: 'Custom', desc: 'Internal Engine' }, { id: 'flower', label: 'Flower', desc: 'flwr Framework' }].map(opt => (
                  <button key={opt.id} onClick={() => setEngine(opt.id)}
                    style={{ padding: '16px', borderRadius: '12px', textAlign: 'left', background: engine === opt.id ? 'var(--primary-light)' : 'var(--bg-input)', border: `1px solid ${engine === opt.id ? 'var(--primary)' : 'var(--border-default)'}`, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: engine === opt.id ? 'var(--shadow-sm)' : 'none' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: engine === opt.id ? 'var(--primary)' : 'var(--text-primary)', marginBottom: 4 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: engine === opt.id ? '#2563EB' : 'var(--text-muted)' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Aggregation Rounds</div>
                <span className="font-mono" style={{ fontSize: 16, fontWeight: 800, padding: '4px 12px', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>{numRounds}</span>
              </div>
              <input type="range" min={1} max={10} value={numRounds} onChange={e => setNumRounds(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-ghost)', marginTop: 8, fontWeight: 600 }}>
                <span>1</span><span>5</span><span>10</span>
              </div>
            </div>

            <div style={{ borderRadius: '14px', padding: '20px', background: 'var(--purple-light)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)' }}>
                    <FiShield size={16} style={{ color: 'var(--purple)' }} />
                  </div>
                  <div>
                    <div className="font-heading" style={{ fontSize: 15, fontWeight: 800, color: '#5B21B6' }}>Differential Privacy</div>
                    <div style={{ fontSize: 12, color: '#4C1D95' }}>Inject cryptographic noise</div>
                  </div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={dpEnabled} onChange={e => setDpEnabled(e.target.checked)} />
                  <span className="toggle-slider" style={{ background: dpEnabled ? 'var(--purple)' : 'var(--text-ghost)' }} />
                </label>
              </div>
              <AnimatePresence>
                {dpEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ paddingTop: 16, borderTop: '1px dashed rgba(124,58,237,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#5B21B6' }}>Epsilon (ε) Value</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="font-mono" style={{ fontSize: 15, fontWeight: 800, color: 'var(--purple)' }}>{dpEpsilon.toFixed(1)}</span>
                          <span className="badge badge-purple" style={{ fontSize: 10, padding: '4px 8px' }}>{getPrivacyLabel(dpEpsilon)} PRIVACY</span>
                        </div>
                      </div>
                      <input type="range" min={0.1} max={10} step={0.1} value={dpEpsilon} onChange={e => setDpEpsilon(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--purple)', cursor: 'pointer' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(91,33,182,0.6)', marginTop: 8, fontWeight: 600 }}>
                        <span>0.1 (Strict)</span><span>10 (Lenient)</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button onClick={handleTriggerTraining} disabled={training || !isMLOnline}
            className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, background: training || !isMLOnline ? 'var(--bg-elevated)' : 'var(--accent)', color: training || !isMLOnline ? 'var(--text-ghost)' : 'white', border: training || !isMLOnline ? '1px solid var(--border-default)' : 'none', marginTop: 'auto' }}>
            {training ? <><div className="spinner" /><span>Orchestrating Cycle…</span></> : <><FiZap size={18} /><span>Trigger FL Round</span></>}
          </button>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <AnimatePresence>
            {trainingResult && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="card" style={{ padding: '24px', background: 'var(--success-light)', border: '1px solid var(--success-mid)', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <FiCheck size={20} color="white" />
                  </div>
                  <div>
                    <div className="font-heading" style={{ fontSize: 18, fontWeight: 800, color: '#065F46' }}>Training Cycle Completed</div>
                    <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 500, marginTop: 2 }}>Round #{trainingResult.roundNumber} · Engine: {trainingResult.engine} · {trainingResult.numRounds} Iterations</div>
                  </div>
                </div>
                {trainingResult.improvements && Object.keys(trainingResult.improvements).length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                    {Object.entries(trainingResult.improvements).map(([disease, imp]) => {
                      const val = parseFloat(imp);
                      return (
                        <div key={disease} style={{ padding: '12px', borderRadius: '10px', background: 'white', border: '1px solid var(--success-mid)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'capitalize', marginBottom: 6 }}>{disease.replace(/_/g, ' ')}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {val > 0 ? <FiArrowUp size={16} style={{ color: 'var(--success)' }} /> : val < 0 ? <FiArrowDown size={16} style={{ color: 'var(--danger)' }} /> : <FiMinus size={16} style={{ color: 'var(--text-ghost)' }} />}
                            <span className="font-mono" style={{ fontSize: 18, fontWeight: 800, color: val > 0 ? 'var(--success)' : val < 0 ? 'var(--danger)' : 'var(--text-ghost)' }}>
                              {val > 0 ? '+' : ''}{val.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }} className="card" style={{ padding: '32px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <div className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Diagnostic Performance</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Latest global model accuracy per pathology</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiActivity size={18} style={{ color: 'var(--text-secondary)' }} />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={diseaseAccuracies} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-ghost)', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-ghost)', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip cursor={{ fill: 'var(--bg-input)' }} content={<ChartTooltip />} />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {diseaseAccuracies.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {loading ? [...Array(4)].map((_, i) => (
              <div key={i} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><Sk h="40px" w="40px" r="10px" /><Sk h="24px" w="60px" r="6px" /></div>
                <Sk h="6px" r="99px" />
              </div>
            )) : diseaseAccuracies.map((d, i) => <DiseaseCard key={d.name} d={d} index={i} />)}
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Lineage Registry</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Historical log of all aggregated model versions.</div>
        </div>
        {loading ? (
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...Array(5)].map((_, i) => <Sk key={i} h="56px" r="12px" />)}
          </div>
        ) : models.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <FiCpu size={28} style={{ color: 'var(--text-ghost)' }} />
            </div>
            <div className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Registry Empty</div>
            <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>Trigger an initial training round to generate a model artifact.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 32px', fontSize: 12, letterSpacing: '0.05em' }}>Version Hash</th>
                  <th style={{ padding: '16px', fontSize: 12, letterSpacing: '0.05em' }}>Framework</th>
                  <th style={{ padding: '16px', fontSize: 12, letterSpacing: '0.05em' }}>Aggregations</th>
                  <th style={{ padding: '16px', fontSize: 12, letterSpacing: '0.05em' }}>Node Count</th>
                  <th style={{ padding: '16px', fontSize: 12, letterSpacing: '0.05em' }}>Deployment Status</th>
                  <th style={{ padding: '16px 32px', fontSize: 12, letterSpacing: '0.05em', textAlign: 'right' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <td style={{ padding: '16px 32px' }}>
                      <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-mid)' }}>
                        {m.version}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>{m.engine || 'custom'}</td>
                    <td style={{ padding: '16px' }} className="font-mono"><span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>{m.numRounds || '—'}</span></td>
                    <td style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>{m.participantCount || '—'} active</td>
                    <td style={{ padding: '16px' }}><span className={`badge ${m.isActive ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 11, padding: '4px 10px' }}>{m.isActive ? 'Primary' : 'Archived'}</span></td>
                    <td style={{ padding: '16px 32px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'right', fontWeight: 500 }}>{m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
