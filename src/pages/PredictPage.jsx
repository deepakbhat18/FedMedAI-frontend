import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart, FiSearch, FiZap, FiActivity, FiCheck,
  FiDownload, FiMail, FiX, FiUser, FiSend, FiChevronDown,
  FiShield,
} from 'react-icons/fi';
import { makePrediction, downloadPDFReport } from '../api/predictionApi';
import { getAllPatients } from '../api/patientApi';
import { emailPatientReport } from '../api/hospitalApi';
import { toast } from 'react-toastify';

const D_ICONS = { heart_disease: '❤️', diabetes: '🩸', kidney_disease: '🫘', liver_disease: '🫁', stroke: '🧠' };

const RISK = {
  HIGH: { color: '#DC2626', bg: 'var(--danger-light)', border: 'rgba(220,38,38,0.2)', badge: 'badge-red', label: 'High Risk' },
  MODERATE: { color: '#D97706', bg: 'var(--warning-light)', border: 'rgba(217,119,6,0.2)', badge: 'badge-yellow', label: 'Moderate' },
  LOW: { color: '#2563EB', bg: 'var(--accent-light)', border: 'rgba(37,99,235,0.2)', badge: 'badge-blue', label: 'Low Risk' },
  MINIMAL: { color: '#059669', bg: 'var(--success-light)', border: 'rgba(5,150,105,0.2)', badge: 'badge-green', label: 'Minimal' },
};

const URGENCY = {
  IMMEDIATE: { color: '#DC2626', bg: '#FFF5F5', label: '🚨 Immediate' },
  WITHIN_48_HOURS: { color: '#EA580C', bg: '#FFF7ED', label: '⚡ Within 48 Hours' },
  WITHIN_1_WEEK: { color: '#D97706', bg: '#FFFBEB', label: '⏰ Within 1 Week' },
  WITHIN_1_MONTH: { color: '#2563EB', bg: '#EFF6FF', label: '📅 Within 1 Month' },
  ROUTINE: { color: '#059669', bg: '#ECFDF5', label: '✅ Routine' },
};

const VITALS = [
  { key: 'bloodPressure', label: 'Blood Pressure', ph: '120', unit: 'mmHg' },
  { key: 'heartRate', label: 'Heart Rate', ph: '75', unit: 'bpm' },
  { key: 'glucose', label: 'Glucose', ph: '100', unit: 'mg/dL' },
  { key: 'cholesterol', label: 'Cholesterol', ph: '200', unit: 'mg/dL' },
  { key: 'creatinine', label: 'Creatinine', ph: '1.0', unit: 'mg/dL' },
  { key: 'hemoglobin', label: 'Hemoglobin', ph: '14.0', unit: 'g/dL' },
  { key: 'bilirubin', label: 'Bilirubin', ph: '1.0', unit: 'mg/dL' },
  { key: 'altEnzyme', label: 'ALT Enzyme', ph: '25', unit: 'U/L' },
  { key: 'albumin', label: 'Albumin', ph: '4.0', unit: 'g/dL' },
  { key: 'potassium', label: 'Potassium', ph: '4.5', unit: 'mEq/L' },
  { key: 'sodium', label: 'Sodium', ph: '140', unit: 'mEq/L' },
  { key: 'urea', label: 'Urea', ph: '30', unit: 'mg/dL' },
];

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-ghost)', marginBottom: 12 }}>{children}</div>
);

const DiseaseCard = ({ pred, index }) => {
  const cfg = RISK[pred.risk_level] || RISK.MINIMAL;
  const pct = (pred.confidence * 100).toFixed(1);
  const healthyPct = ((1 - pred.confidence) * 100).toFixed(1);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{ borderRadius: 16, padding: '20px', background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: 'var(--shadow-sm)' }}>
            {getDiseaseIcon(pred.disease_type, 24)}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{pred.disease_name}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>{pred.prediction_label}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="font-mono" style={{ fontSize: 28, fontWeight: 800, color: cfg.color, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6 }}>{pct}%</div>
          <span className={`badge ${cfg.badge}`} style={{ fontSize: 11 }}>{cfg.label}</span>
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: 'rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 8, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: index * 0.08 + 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '100%', borderRadius: 99, background: cfg.color }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
        <span>Healthy {healthyPct}%</span><span>Risk {pct}%</span>
      </div>
    </motion.div>
  );
};

const RecommendationCard = ({ rec, index }) => {
  const [expanded, setExpanded] = useState(false);
  const urg = URGENCY[rec.urgency] || URGENCY.ROUTINE;
  const rCfg = RISK[rec.risk_level] || RISK.MINIMAL;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
      style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${rCfg.border}`, background: rCfg.bg, transition: 'all var(--t-base)' }}>
      <button onClick={() => setExpanded(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, display: 'flex', alignItems: 'center' }}>{getDiseaseIcon(rec.disease_type, 22)}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{rec.disease_name}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: rCfg.color }}>{rec.risk_level} RISK · {(rec.confidence || 0).toFixed(1)}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 99, background: urg.bg, color: urg.color }}>{urg.label}</span>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiChevronDown size={16} style={{ color: 'var(--text-secondary)', transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} />
          </div>
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {rec.explanation && (
                <div style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 14, fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6, boxShadow: 'var(--shadow-sm)' }}>
                  💡 {rec.explanation}
                </div>
              )}
              {rec.key_risk_factors?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚠️ Key Risk Factors</div>
                  {rec.key_risk_factors.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--danger)', marginTop: 2, flexShrink: 0 }}>•</span>{f}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {rec.tests_recommended?.length > 0 && (
                  <div style={{ borderRadius: 12, padding: '14px', background: 'var(--accent-light)', border: '1px solid rgba(37,99,235,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>🔬 Tests</div>
                    {rec.tests_recommended.slice(0, 5).map((t, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>→ {t}</div>)}
                  </div>
                )}
                {rec.specialists_to_consult?.length > 0 && (
                  <div style={{ borderRadius: 12, padding: '14px', background: 'var(--purple-light)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>👨‍⚕️ Specialists</div>
                    {rec.specialists_to_consult.map((s, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>→ {s}</div>)}
                  </div>
                )}
                {rec.lifestyle_changes?.length > 0 && (
                  <div style={{ borderRadius: 12, padding: '14px', background: 'var(--success-light)', border: '1px solid rgba(5,150,105,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>🥗 Lifestyle</div>
                    {rec.lifestyle_changes.slice(0, 5).map((l, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>→ {l}</div>)}
                  </div>
                )}
              </div>
              {rec.medications_note && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', borderRadius: 12, background: 'var(--warning-light)', border: '1px solid rgba(217,119,6,0.2)' }}>
                  <span style={{ fontSize: 20 }}>💊</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)', marginBottom: 4 }}>Medication Note</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.medications_note}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const EmailModal = ({ open, onClose, onSend, sending, hospitalName }) => {
  const [patientEmail, setPatientEmail] = useState('');
  const [patientName, setPatientName] = useState('');
  const [subject, setSubject] = useState('');
  const [emailError, setEmailError] = useState('');
  useEffect(() => { if (open) { setPatientEmail(''); setPatientName(''); setSubject(''); setEmailError(''); } }, [open]);
  const handleSend = () => {
    if (!patientEmail.trim()) { setEmailError('Patient email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) { setEmailError('Please enter a valid email'); return; }
    setEmailError('');
    onSend({ patientEmail, patientName, subject });
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="modal-overlay" onClick={onClose}>
          <motion.div initial={{ scale: 0.96, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, y: 16, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--accent-light)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiMail size={20} className="text-accent" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <div className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Send Medical Report</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Email is not stored securely.</div>
                  </div>
                </div>
                <button onClick={onClose} className="icon-btn"><FiX size={18} /></button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', marginBottom: 24 }}>
                <FiActivity size={16} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sending from facility:</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>🏥 {hospitalName || 'Your Hospital'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Patient Email <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <FiMail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
                    <input type="email" value={patientEmail} onChange={e => { setPatientEmail(e.target.value); setEmailError(''); }} placeholder="patient@example.com" className="input-base" style={{ paddingLeft: 42, paddingBlock: 12 }} />
                  </div>
                  {emailError && <div style={{ fontSize: 13, color: 'var(--danger)', marginTop: 6, fontWeight: 500 }}>{emailError}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Patient Name <span style={{ fontSize: 12, color: 'var(--text-ghost)', fontWeight: 400 }}>(optional)</span></label>
                  <div style={{ position: 'relative' }}>
                    <FiUser size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
                    <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Full name" className="input-base" style={{ paddingLeft: 42, paddingBlock: 12 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                  <button onClick={onClose} className="btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
                  <button onClick={handleSend} disabled={sending} className="btn-accent" style={{ padding: '10px 24px' }}>
                    {sending ? <div className="spinner" /> : <><FiSend size={16} /> Send Report</>}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const INIT_FEATURES = {
  age: '', gender: '1', bloodPressure: '', cholesterol: '',
  heartRate: '', glucose: '', bmi: '', smoking: '0',
  diabetesHistory: '0', familyHistory: '0', creatinine: '',
  hemoglobin: '', bilirubin: '', altEnzyme: '', albumin: '',
  potassium: '', sodium: '', urea: '',
};

export default function PredictPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [activeTab, setActiveTab] = useState('predictions');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [features, setFeatures] = useState(INIT_FEATURES);

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    try { const res = await getAllPatients(); setPatients(res.data.data); } catch { }
  };

  const handlePatientSelect = id => {
    setSelectedPatient(id);
    const p = patients.find(pt => pt.id === parseInt(id));
    if (p?.features) {
      const f = p.features;
      setFeatures({
        age: p.age || '', gender: p.gender === 'MALE' ? '1' : '0',
        bloodPressure: f.bloodPressure || f.blood_pressure || '',
        cholesterol: f.cholesterol || '', heartRate: f.heartRate || f.heart_rate || '',
        glucose: f.glucose || '', bmi: f.bmi || '',
        smoking: f.smoking !== undefined ? String(f.smoking) : '0',
        diabetesHistory: f.diabetes !== undefined ? String(f.diabetes) : '0',
        familyHistory: f.familyHistory !== undefined ? String(f.familyHistory) : '0',
        creatinine: f.creatinine || '', hemoglobin: f.hemoglobin || '',
        bilirubin: f.bilirubin || '', altEnzyme: f.alt_enzyme || f.altEnzyme || '',
        albumin: f.albumin || '', potassium: f.potassium || '',
        sodium: f.sodium || '', urea: f.urea || '',
      });
    }
    setPredictions(null);
    setActiveTab('predictions');
  };

  const buildFeatureArray = () => [
    parseFloat(features.age) || 50, parseFloat(features.gender) || 0,
    parseFloat(features.bloodPressure) || 120, parseFloat(features.cholesterol) || 200,
    parseFloat(features.heartRate) || 75, parseFloat(features.glucose) || 100,
    parseFloat(features.bmi) || 25, parseFloat(features.smoking) || 0,
    parseFloat(features.diabetesHistory) || 0, parseFloat(features.familyHistory) || 0,
    parseFloat(features.creatinine) || 1.0, parseFloat(features.hemoglobin) || 14.0,
    parseFloat(features.bilirubin) || 1.0, parseFloat(features.altEnzyme) || 25,
    parseFloat(features.albumin) || 4.0, parseFloat(features.potassium) || 4.5,
    parseFloat(features.sodium) || 140, parseFloat(features.urea) || 30,
  ];

  const buildFeaturesDict = () => ({
    age: parseFloat(features.age) || 50, gender: parseFloat(features.gender) || 0,
    bloodPressure: parseFloat(features.bloodPressure) || 120,
    cholesterol: parseFloat(features.cholesterol) || 200,
    heartRate: parseFloat(features.heartRate) || 75, glucose: parseFloat(features.glucose) || 100,
    bmi: parseFloat(features.bmi) || 25, smoking: parseFloat(features.smoking) || 0,
    diabetesHistory: parseFloat(features.diabetesHistory) || 0,
    familyHistory: parseFloat(features.familyHistory) || 0,
    creatinine: parseFloat(features.creatinine) || 1.0,
    hemoglobin: parseFloat(features.hemoglobin) || 14.0,
    bilirubin: parseFloat(features.bilirubin) || 1.0, altEnzyme: parseFloat(features.altEnzyme) || 25,
    albumin: parseFloat(features.albumin) || 4.0, potassium: parseFloat(features.potassium) || 4.5,
    sodium: parseFloat(features.sodium) || 140, urea: parseFloat(features.urea) || 30,
  });

  const handlePredict = async () => {
    if (!selectedPatient) { toast.error('Please select a patient first'); return; }
    setLoading(true); setPredictions(null);
    try {
      const res = await makePrediction({ patientId: parseInt(selectedPatient), features: buildFeatureArray() });
      setPredictions(res.data.data);
      toast.success('Prediction completed successfully.');
    } catch (err) { toast.error(err.response?.data?.message || 'Prediction failed'); }
    finally { setLoading(false); }
  };

  const handleDownloadPDF = async () => {
    if (!predictions || !selectedPatient) return;
    setDownloading(true);
    try {
      await downloadPDFReport(parseInt(selectedPatient), {
        predictions: predictions.predictions,
        recommendations: predictions.recommendations || null,
        features: buildFeaturesDict(),
      });
      toast.success('Medical report downloaded.');
    } catch { toast.error('PDF download failed. Ensure ML service is running.'); }
    finally { setDownloading(false); }
  };

  const handleSendEmail = async ({ patientEmail, patientName, subject }) => {
    if (!predictions || !selectedPatient) return;
    const patient = patients.find(p => p.id === parseInt(selectedPatient));
    if (!patient) return;
    setSending(true);
    try {
      await emailPatientReport(patient.hospitalId, {
        patientId: parseInt(selectedPatient), patientEmail,
        patientName: patientName || undefined, subject: subject || undefined,
        predictions: predictions.predictions,
        recommendations: predictions.recommendations || null,
        features: buildFeaturesDict(),
      });
      setShowEmailModal(false);
      toast.success(`Report dispatched to ${patientEmail}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send report'); }
    finally { setSending(false); }
  };

  const setFeat = (key, val) => setFeatures(prev => ({ ...prev, [key]: val }));
  const filteredPatients = patients.filter(p =>
    p.patientCode?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.hospitalName?.toLowerCase().includes(patientSearch.toLowerCase())
  );
  const hasRecs = predictions?.recommendations?.disease_recommendations?.length > 0;
  const selectedPatientInfo = patients.find(p => p.id === parseInt(selectedPatient));

  return (
    <div className="page-enter" style={{ maxWidth: 1400, margin: '0 auto' }}>
      <EmailModal open={showEmailModal} onClose={() => setShowEmailModal(false)}
        onSend={handleSendEmail} sending={sending} hospitalName={selectedPatientInfo?.hospitalName} />

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-accent)' }}>
            <FiZap size={24} color="white" />
          </div>
          <h1 className="font-heading" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Diagnostic Engine</h1>
        </div>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginLeft: 64 }}>Run real-time inference across 5 federated models and generate personalized insights.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 32 }}>

          <div>
            <SectionLabel>Patient Selection</SectionLabel>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <FiSearch size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
              <input type="text" placeholder="Search by ID or name..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} className="input-base" style={{ paddingLeft: 42, paddingBlock: 12 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <select value={selectedPatient} onChange={e => handlePatientSelect(e.target.value)} className="input-base" style={{ paddingLeft: 16, paddingRight: 40, paddingBlock: 12, appearance: 'none', cursor: 'pointer', fontWeight: 600 }}>
                <option value="">— Select Patient Profile —</option>
                {filteredPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.patientCode} · {p.hospitalName} · Age {p.age}</option>
                ))}
              </select>
              <FiChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div>
            <SectionLabel>Demographics & Baseline</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                { key: 'age', label: 'Age', ph: '58', type: 'number' },
                { key: 'bmi', label: 'BMI', ph: '25.0', type: 'number', step: '0.1', unit: 'kg/m²' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" step={f.step || '1'} value={features[f.key]} placeholder={f.ph} onChange={e => setFeat(f.key, e.target.value)} className="input-base" style={{ padding: '10px 14px', paddingRight: f.unit ? 52 : 14 }} />
                    {f.unit && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-ghost)', pointerEvents: 'none', fontWeight: 500 }}>{f.unit}</span>}
                  </div>
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Gender</label>
                <select value={features.gender} onChange={e => setFeat('gender', e.target.value)} className="input-base" style={{ padding: '10px 14px', cursor: 'pointer' }}>
                  <option value="1">Male</option>
                  <option value="0">Female</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Clinical Vitals</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {VITALS.map(v => (
                <div key={v.key}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>{v.label}</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" step="0.1" value={features[v.key]} placeholder={v.ph} onChange={e => setFeat(v.key, e.target.value)} className="input-base" style={{ padding: '10px 14px', paddingRight: 48 }} />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-ghost)', pointerEvents: 'none', fontWeight: 600 }}>{v.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Identified Risks</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { key: 'smoking', label: 'Smoker' },
                { key: 'diabetesHistory', label: 'Diabetes Hx' },
                { key: 'familyHistory', label: 'Family Hx' },
              ].map(f => {
                const on = features[f.key] === '1';
                return (
                  <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', background: on ? 'var(--accent-light)' : 'var(--bg-input)', border: `1px solid ${on ? 'rgba(37,99,235,0.3)' : 'var(--border-default)'}`, transition: 'all var(--t-fast)' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '6px', background: on ? 'var(--accent)' : 'var(--bg-surface)', border: `1px solid ${on ? 'var(--accent)' : 'var(--border-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all var(--t-fast)' }}>
                      {on && <FiCheck size={12} color="white" />}
                    </div>
                    <input type="checkbox" checked={on} onChange={e => setFeat(f.key, e.target.checked ? '1' : '0')} style={{ display: 'none' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: on ? 'var(--accent-hover)' : 'var(--text-secondary)' }}>{f.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button onClick={handlePredict} disabled={loading || !selectedPatient}
            className="btn-accent"
            style={{ width: '100%', padding: '16px', fontSize: 16, fontWeight: 700, borderRadius: '14px', marginTop: 8 }}>
            {loading ? <><div className="spinner" /><span>Computing Inference…</span></> : <><FiZap size={18} /><span>Execute Diagnostic Analysis</span></>}
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          
          {loading && (
            <div className="card" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 600, border: '1px solid var(--accent-light)', background: 'var(--bg-surface)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: 'var(--shadow-accent)' }}>
                <FiZap size={32} color="white" />
              </div>
              <div className="font-heading" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Processing Patient Telemetry</div>
              <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>Executing multi-node federated inference…</div>
              <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                {['❤️', '🩸', '🫘', '🫁', '🧠'].map((e, i) => (
                  <motion.span key={i} animate={{ opacity: [0.2, 1, 0.2], y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }} style={{ fontSize: 28 }}>{e}</motion.span>
                ))}
              </div>
            </div>
          )}

          {!loading && !predictions && (
            <div className="card" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 600, border: '2px dashed var(--border-default)', background: 'transparent', boxShadow: 'none' }}>
              <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <FiActivity size={32} style={{ color: 'var(--text-ghost)' }} />
              </div>
              <div className="font-heading" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Awaiting Input</div>
              <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 360 }}>
                Select a patient profile and confirm clinical vitals to begin the AI diagnostic analysis.
              </div>
            </div>
          )}

          {!loading && predictions && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, border: '1px solid var(--success-mid)', background: 'var(--success-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'white', border: '1px solid var(--success-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <FiShield size={24} style={{ color: 'var(--success)' }} />
                  </div>
                  <div>
                    <div className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: '#064E3B' }}>Analysis Complete</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#065F46', marginTop: 2 }}>
                      Profile: {selectedPatientInfo?.patientCode} · Evaluated {predictions.predictions?.length} risk vectors
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handleDownloadPDF} disabled={downloading} className="btn-secondary" style={{ fontSize: 14, padding: '10px 16px', background: 'white' }}>
                    {downloading ? <div className="spinner-dark" style={{ width: 16, height: 16 }} /> : <FiDownload size={16} />}
                    Export PDF
                  </button>
                  <button onClick={() => setShowEmailModal(true)} className="btn-primary" style={{ fontSize: 14, padding: '10px 16px', background: 'var(--teal)', boxShadow: '0 4px 12px rgba(13,148,136,0.3)' }}>
                    <FiMail size={16} /> Secure Dispatch
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 4, padding: 6, background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border-default)', width: 'fit-content' }}>
                <button className={`tab-item ${activeTab === 'predictions' ? 'active' : ''}`} style={{ padding: '10px 24px', fontSize: 14 }} onClick={() => setActiveTab('predictions')}>🎯 Risk Stratification</button>
                {hasRecs && <button className={`tab-item ${activeTab === 'recommendations' ? 'active' : ''}`} style={{ padding: '10px 24px', fontSize: 14 }} onClick={() => setActiveTab('recommendations')}>💊 Clinical Directives</button>}
              </div>

              {activeTab === 'predictions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {predictions.predictions?.map((pred, i) => <DiseaseCard key={pred.disease_type} pred={pred} index={i} />)}
                </div>
              )}

              {activeTab === 'recommendations' && hasRecs && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {predictions.recommendations.disease_recommendations.map((rec, i) => (
                    <RecommendationCard key={rec.disease_type} rec={rec} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}