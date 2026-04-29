import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBarChart2, FiFilter, FiTrendingUp, FiTrendingDown, FiChevronDown, FiChevronUp, FiActivity, FiSearch } from 'react-icons/fi';
import { getPredictionsByHospital, getPredictionAnalytics } from '../api/predictionApi';
import { getAllHospitals } from '../api/hospitalApi';
import { toast } from 'react-toastify';

const FEATURE_LABELS = {
  age:'Age', gender:'Gender', blood_pressure:'Blood Pressure', bloodPressure:'Blood Pressure',
  cholesterol:'Cholesterol', heart_rate:'Heart Rate', heartRate:'Heart Rate',
  glucose:'Glucose', bmi:'BMI', smoking:'Smoker',
  diabetes_history:'Diabetes Hx', diabetesHistory:'Diabetes Hx',
  family_history:'Family Hx', familyHistory:'Family Hx',
  creatinine:'Creatinine', hemoglobin:'Hemoglobin', bilirubin:'Bilirubin',
  alt_enzyme:'ALT Enzyme', altEnzyme:'ALT Enzyme', albumin:'Albumin',
  potassium:'Potassium', sodium:'Sodium', urea:'Urea',
};

const RISK_STYLE = {
  HIGH:     { color: '#DC2626', bg: 'var(--danger-light)',  badge: 'badge-red'    },
  MODERATE: { color: '#D97706', bg: 'var(--warning-light)', badge: 'badge-yellow' },
  LOW:      { color: '#2563EB', bg: 'var(--accent-light)',  badge: 'badge-blue'   },
  MINIMAL:  { color: '#059669', bg: 'var(--success-light)', badge: 'badge-green'  },
};

const Sk = ({ h = '16px', w = '100%' }) => <div className="shimmer" style={{ height: h, width: w }} />;

const PredictionDetails = ({ prediction }) => {
  const features = prediction.featuresUsed || {};
  const entries = Object.entries(features).filter(([, v]) => v !== null && v !== undefined);
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
      <div style={{ padding: '24px', background: 'var(--bg-app)', borderTop: '1px solid var(--border-subtle)', boxShadow: 'inset 0 4px 6px -4px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-ghost)', marginBottom: 16 }}>Inference Vector Data</div>
        {entries.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {entries.map(([key, value]) => (
              <div key={key} style={{ borderRadius: '10px', padding: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{FEATURE_LABELS[key] || key}</div>
                <div className="font-mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : String(value)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '16px', borderRadius: '12px', border: '1px dashed var(--border-strong)', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>No localized feature vector available.</div>
        )}
      </div>
    </motion.div>
  );
};

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [hospitalsRes, analyticsRes] = await Promise.all([getAllHospitals(), getPredictionAnalytics()]);
      setHospitals(hospitalsRes.data.data);
      setAnalytics(analyticsRes.data.data);
      if (analyticsRes.data.data?.recentPredictions) setPredictions(analyticsRes.data.data.recentPredictions);
    } catch { toast.error('Failed to load telemetry'); }
    finally { setLoading(false); }
  };

  const loadByHospital = async (hospitalId) => {
    setSelectedHospital(hospitalId); setExpandedId(null);
    if (!hospitalId) { loadData(); return; }
    try {
      const res = await getPredictionsByHospital(hospitalId);
      setPredictions(res.data.data);
    } catch { toast.error('Failed to filter nodes'); }
  };

  const total = analytics?.totalPredictions || 0;
  const dist = analytics?.predictionDistribution || {};

  const filtered = predictions.filter(p => 
    p.patientCode?.toLowerCase().includes(search.toLowerCase()) || 
    p.diseaseType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div>
          <h1 className="font-heading" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>Inference Logs</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Historical registry of all {total.toLocaleString()} model predictions across the network.</p>
        </div>
      </div>

      {!loading && Object.keys(dist).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
          {Object.entries(dist).map(([label, count], i) => {
            const isDisease = label === 'Disease Detected';
            const accent = isDisease ? 'var(--danger)' : 'var(--success)';
            const bg = isDisease ? 'var(--danger-light)' : 'var(--success-light)';
            const border = isDisease ? 'rgba(220,38,38,0.2)' : 'rgba(5,150,105,0.2)';
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            return (
              <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}
                className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px', background: bg, border: `1px solid ${border}`, boxShadow: 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'white', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                  {isDisease ? <FiTrendingUp size={20} style={{ color: accent }} /> : <FiTrendingDown size={20} style={{ color: accent }} />}
                </div>
                <div>
                  <div className="font-mono" style={{ fontSize: 32, fontWeight: 800, color: accent, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4 }}>{count.toLocaleString()}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isDisease ? '#991B1B' : '#064E3B' }}>{label} · {pct}%</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ position: 'relative', width: 300 }}>
          <FiSearch size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
          <input type="text" placeholder="Search by patient ID or disease..." value={search} onChange={e => setSearch(e.target.value)} className="input-base" style={{ paddingLeft: 44, paddingBlock: 12 }} />
        </div>
        <div style={{ position: 'relative' }}>
          <FiFilter size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
          <select value={selectedHospital} onChange={e => loadByHospital(e.target.value)} className="input-base" style={{ paddingLeft: 44, paddingRight: 40, paddingBlock: 12, minWidth: 240, appearance: 'none', cursor: 'pointer', fontWeight: 500 }}>
            <option value="">Global Network (All Nodes)</option>
            {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          <FiChevronDown size={16} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-ghost)', marginLeft: 'auto', fontWeight: 500 }}>Click any record to inspect feature vectors</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="data-table-wrapper custom-scroll" style={{ maxHeight: '800px' }}>
        {loading ? (
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <Sk h="16px" w="60px" /><Sk h="16px" w="120px" /><Sk h="16px" w="150px" /><Sk h="28px" w="100px" r="99px" /><Sk h="16px" w="100px" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 32px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <FiActivity size={28} style={{ color: 'var(--text-ghost)' }} />
            </div>
            <div className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>No Logs Found</div>
            <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>There are no telemetry records matching your filters.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Trace ID</th>
                <th>Patient Profile</th>
                <th>Model Target</th>
                <th>Inference Result</th>
                <th>Confidence Score</th>
                <th>Risk Stratification</th>
                <th>Model Version</th>
                <th>Timestamp</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pred, i) => {
                const rStyle = RISK_STYLE[pred.riskLevel] || RISK_STYLE.MINIMAL;
                const isExpanded = expandedId === pred.id;
                const confidence = pred.confidence ? `${(pred.confidence * 100).toFixed(1)}%` : '—';
                return (
                  <React.Fragment key={pred.id}>
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      onClick={() => setExpandedId(isExpanded ? null : pred.id)}
                      style={{ cursor: 'pointer', background: isExpanded ? 'var(--bg-app)' : 'transparent' }}>
                      <td className="font-mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>#{pred.id}</td>
                      <td>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{pred.patientCode || '—'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{pred.hospitalName || '—'}</div>
                      </td>
                      <td style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>{pred.diseaseType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '—'}</td>
                      <td>
                        <span className={`badge ${pred.prediction === 1 ? 'badge-red' : 'badge-green'}`} style={{ fontSize: 12 }}>
                          {pred.predictionLabel || (pred.prediction === 1 ? 'Disease Detected' : 'Healthy')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--border-default)', overflow: 'hidden', minWidth: 80, maxWidth: 120 }}>
                            <div style={{ height: '100%', borderRadius: 99, background: rStyle.color, width: `${(pred.confidence || 0) * 100}%` }} />
                          </div>
                          <span className="font-mono" style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}>{confidence}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${rStyle.badge}`} style={{ fontSize: 11 }}>{pred.riskLevel || '—'}</span>
                      </td>
                      <td className="font-mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{pred.modelVersion || '—'}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{pred.createdAt ? new Date(pred.createdAt).toLocaleString() : '—'}</td>
                      <td>
                        <div style={{ width: 28, height: 28, borderRadius: '8px', background: isExpanded ? 'var(--bg-surface)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isExpanded ? '1px solid var(--border-default)' : 'none', boxShadow: isExpanded ? 'var(--shadow-xs)' : 'none' }}>
                          <FiChevronDown size={16} style={{ color: 'var(--text-secondary)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)' }} />
                        </div>
                      </td>
                    </motion.tr>
                    {isExpanded && (
                      <tr key={`${pred.id}-details`}>
                        <td colSpan={9} style={{ padding: 0 }}>
                          <AnimatePresence>
                            <PredictionDetails prediction={pred} />
                          </AnimatePresence>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
