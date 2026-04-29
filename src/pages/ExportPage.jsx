import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiUsers, FiBarChart2, FiFilter, FiShield, FiChevronDown, FiCheck, FiDatabase } from 'react-icons/fi';
import { getExportStats, exportPatientsCsv, exportPredictionsCsv } from '../api/exportApi';
import { getAllHospitals } from '../api/hospitalApi';
import { toast } from 'react-toastify';

const Sk = ({ h = '16px', w = '100%', r = '8px' }) => <div className="shimmer" style={{ height: h, width: w, borderRadius: r }} />;

const PATIENTS_COLS  = ['Profile ID','Secure Trace ID','Origin Node','Demographics','Clinical Vitals','Laboratory Results','Risk Factors','Timestamp'];
const PREDICTIONS_COLS = ['Trace ID','Secure Trace ID','Origin Node','Inference Result','Confidence Score','Risk Stratification','Model Hash','Timestamp'];

export default function ExportPage() {
  const [stats, setStats]       = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [exporting, setExporting] = useState({ patients: false, predictions: false });
  const [filters, setFilters]   = useState({ hospitalId: '', startDate: '', endDate: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, hospitalsRes] = await Promise.all([getExportStats(), getAllHospitals()]);
      setStats(statsRes.data.data);
      setHospitals(hospitalsRes.data.data);
    } catch { toast.error('Failed to load telemetry data'); }
    finally { setLoading(false); }
  };

  const handleExport = async (type) => {
    setExporting(prev => ({ ...prev, [type]: true }));
    const cleanFilters = {};
    if (filters.hospitalId) cleanFilters.hospitalId = filters.hospitalId;
    if (filters.startDate)  cleanFilters.startDate  = filters.startDate;
    if (filters.endDate)    cleanFilters.endDate    = filters.endDate;
    try {
      if (type === 'patients')    await exportPatientsCsv(cleanFilters);
      else                         await exportPredictionsCsv(cleanFilters);
      toast.success(`${type === 'patients' ? 'Patient Telemetry' : 'Inference Logs'} downloaded securely.`);
    } catch { toast.error('Export routine failed. Please contact network admin.'); }
    finally { setExporting(prev => ({ ...prev, [type]: false })); }
  };

  const anyFilter = filters.hospitalId || filters.startDate || filters.endDate;

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div>
          <h1 className="font-heading" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>Data Exchange</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Securely export anonymized telemetry and inference logs from the federated network.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card" style={{ padding: '24px 32px', marginBottom: 32, background: 'var(--purple-light)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', gap: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'white', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
          <FiShield size={24} style={{ color: 'var(--purple)' }} />
        </div>
        <div>
          <div className="font-heading" style={{ fontSize: 18, fontWeight: 800, color: '#5B21B6', marginBottom: 6 }}>HIPAA Compliance Active</div>
          <div style={{ fontSize: 14, color: '#4C1D95', lineHeight: 1.6 }}>All payloads are automatically anonymized before transmission. Personal Identifiable Information (PII) is securely stripped, and identifiers are pseudonymized per strict federated sharing protocols.</div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="card" style={{ padding: '32px', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiFilter size={16} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div>
            <div className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Extraction Parameters</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Filter the export payload by origin node or timeframe.</div>
          </div>
          {anyFilter && <span className="badge badge-blue" style={{ fontSize: 11, marginLeft: 'auto' }}>Filters Applied</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 20, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Target Node</label>
            <div style={{ position: 'relative' }}>
              <select value={filters.hospitalId} onChange={e => setFilters(p => ({ ...p, hospitalId: e.target.value }))} className="input-base" style={{ paddingBlock: 12, paddingRight: 40, appearance: 'none', cursor: 'pointer' }}>
                <option value="">Global Network (All Nodes)</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <FiChevronDown size={16} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Start Epoch</label>
            <input type="date" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} className="input-base" style={{ paddingBlock: 12 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>End Epoch</label>
            <input type="date" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} className="input-base" style={{ paddingBlock: 12 }} />
          </div>
          <button onClick={() => setFilters({ hospitalId: '', startDate: '', endDate: '' })} className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14 }}>
            Clear Config
          </button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {[
          {
            type: 'patients',
            title: 'Patient Telemetry',
            desc: 'Extract longitudinal health records including vitals, lab assays, and risk vectors.',
            icon: FiDatabase,
            accent: '#2563EB',
            count: stats?.totalPatients,
            countLabel: 'profiles in payload',
            columns: PATIENTS_COLS,
          },
          {
            type: 'predictions',
            title: 'Inference Logs',
            desc: 'Extract AI detection results, confidence intervals, and risk stratifications.',
            icon: FiBarChart2,
            accent: '#059669',
            count: stats?.totalPredictions,
            countLabel: 'traces in payload',
            columns: PREDICTIONS_COLS,
          },
        ].map((card, i) => (
          <motion.div key={card.type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
            className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '16px', background: `${card.accent}12`, border: `1px solid ${card.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                <card.icon size={28} style={{ color: card.accent }} />
              </div>
              <div>
                <div className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{card.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{card.desc}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', borderRadius: '16px', background: 'var(--bg-app)', border: '1px solid var(--border-default)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-xs)' }}>
                <FiUsers size={20} style={{ color: 'var(--text-secondary)' }} />
              </div>
              {loading ? (
                <div style={{ flex: 1 }}><Sk h="32px" w="40%" r="8px" /></div>
              ) : (
                <div>
                  <div className="font-mono" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', color: card.accent, lineHeight: 1, marginBottom: 6 }}>
                    {card.count?.toLocaleString() ?? '—'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {anyFilter ? 'Filtered' : 'Total'} {card.countLabel}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payload Schema</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {card.columns.map(col => (
                  <div key={col} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                    <FiCheck size={12} style={{ color: card.accent }} />
                    <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{col}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => handleExport(card.type)} disabled={exporting[card.type]}
              style={{ marginTop: 'auto', width: '100%', padding: '16px', borderRadius: '14px', border: 'none', cursor: exporting[card.type] ? 'not-allowed' : 'pointer', background: exporting[card.type] ? `${card.accent}30` : card.accent, color: 'white', fontSize: 16, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)', boxShadow: exporting[card.type] ? 'none' : `0 8px 24px ${card.accent}40` }}>
              {exporting[card.type]
                ? <><div className="spinner" /><span>Generating Payload…</span></>
                : <><FiDownload size={18} /><span>Extract Secure CSV</span></>}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
