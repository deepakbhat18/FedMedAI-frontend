import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiUser, FiX, FiFilter, FiActivity, FiClock, FiChevronDown } from 'react-icons/fi';
import { getAllPatients, createPatient } from '../api/patientApi';
import { getAllHospitals } from '../api/hospitalApi';
import { toast } from 'react-toastify';

const Sk = ({ h = '16px', w = '100%', r = '8px' }) => <div className="shimmer" style={{ height: h, width: w, borderRadius: r }} />;

const Field = ({ label, required, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
      {label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}
    </label>
    {children}
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-default)' }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
    <label className="toggle">
      <input type="checkbox" checked={checked === 1} onChange={e => onChange(e.target.checked ? 1 : 0)} />
      <span className="toggle-slider" />
    </label>
  </div>
);

const Modal = ({ open, onClose, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        className="modal-overlay" onClick={onClose}>
        <motion.div initial={{ scale: 0.98, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 20, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          style={{ background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 800, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const numFields = [
  { key: 'bloodPressure', label: 'Blood Pressure', ph: '120', unit: 'mmHg' },
  { key: 'cholesterol',   label: 'Cholesterol',    ph: '200', unit: 'mg/dL' },
  { key: 'heartRate',     label: 'Heart Rate',      ph: '75',  unit: 'bpm'  },
  { key: 'bmi',           label: 'BMI',             ph: '25.0',unit: 'kg/m²'},
  { key: 'glucose',       label: 'Glucose',         ph: '100', unit: 'mg/dL'},
  { key: 'creatinine',    label: 'Creatinine',      ph: '1.0', unit: 'mg/dL'},
  { key: 'hemoglobin',    label: 'Hemoglobin',      ph: '14.0',unit: 'g/dL' },
  { key: 'bilirubin',     label: 'Bilirubin',       ph: '1.0', unit: 'mg/dL'},
  { key: 'alt_enzyme',    label: 'ALT Enzyme',      ph: '25',  unit: 'U/L'  },
  { key: 'albumin',       label: 'Albumin',         ph: '4.0', unit: 'g/dL' },
  { key: 'sodium',        label: 'Sodium',          ph: '140', unit: 'mEq/L'},
  { key: 'urea',          label: 'Urea',            ph: '30',  unit: 'mg/dL'},
];

const INIT_FORM = {
  hospitalId: '', patientCode: '', age: '', gender: 'MALE', diagnosis: '', actualLabel: 0,
  features: { bloodPressure: '', cholesterol: '', heartRate: '', bmi: '', glucose: '', smoking: 0, diabetes: 0, familyHistory: 0, creatinine: '', hemoglobin: '', bilirubin: '', alt_enzyme: '', albumin: '', potassium: '', sodium: '', urea: '' },
};

export default function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INIT_FORM);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [pRes, hRes] = await Promise.all([getAllPatients(), getAllHospitals()]);
      setPatients(pRes.data.data);
      setHospitals(hRes.data.data);
    } catch { toast.error('Failed to load telemetry'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        hospitalId: parseInt(formData.hospitalId),
        age: parseInt(formData.age),
        features: Object.fromEntries(Object.entries(formData.features).map(([k, v]) => [k, parseFloat(v) || 0])),
      };
      await createPatient(submitData);
      toast.success('Patient profile registered securely.');
      setShowForm(false);
      setFormData(INIT_FORM);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to register patient'); }
    finally { setSubmitting(false); }
  };

  const setFeature = (key, value) => setFormData(prev => ({ ...prev, features: { ...prev.features, [key]: value } }));

  const filtered = patients.filter(p => {
    const matchSearch = p.patientCode?.toLowerCase().includes(search.toLowerCase()) || p.diagnosis?.toLowerCase().includes(search.toLowerCase());
    const matchHospital = !filterHospital || p.hospitalId === parseInt(filterHospital);
    return matchSearch && matchHospital;
  });

  return (
    <div className="page-enter" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div>
          <h1 className="font-heading" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>Patient Directory</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Manage {patients.length} securely registered patient profiles across the federated network.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ background: 'var(--accent)', padding: '12px 20px', fontSize: 15 }}>
          <FiPlus size={18} /> Register Patient
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 320 }}>
          <FiSearch size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
          <input type="text" placeholder="Search by ID or diagnosis…" value={search} onChange={e => setSearch(e.target.value)} className="input-base" style={{ paddingLeft: 44, paddingBlock: 12 }} />
        </div>
        <div style={{ position: 'relative' }}>
          <FiFilter size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
          <select value={filterHospital} onChange={e => setFilterHospital(e.target.value)} className="input-base" style={{ paddingLeft: 44, paddingRight: 40, paddingBlock: 12, minWidth: 240, appearance: 'none', cursor: 'pointer', fontWeight: 500 }}>
            <option value="">Global Network (All Nodes)</option>
            {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          <FiChevronDown size={16} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', pointerEvents: 'none' }} />
        </div>
        {filtered.length !== patients.length && (
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Showing {filtered.length} of {patients.length}</span>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="data-table-wrapper custom-scroll">
        {loading ? (
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <Sk h="44px" w="44px" r="12px" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}><Sk h="16px" w="20%" /><Sk h="12px" w="30%" /></div>
                <Sk h="28px" w="80px" r="99px" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 32px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <FiUser size={28} style={{ color: 'var(--text-ghost)' }} />
            </div>
            <div className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>{search || filterHospital ? 'No profiles found' : 'Network Empty'}</div>
            <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>{search ? 'Adjust your filters to see more results.' : 'Register the first patient node to begin.'}</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Profile</th>
                <th>Origin Facility</th>
                <th>Demographics</th>
                <th>Clinical Diagnosis</th>
                <th>Ground Truth</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const hospital = hospitals.find(h => h.id === p.hospitalId);
                return (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FiUser size={18} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{p.patientCode}</div>
                          <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-ghost)', marginTop: 2 }}>Trace ID: #{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 14, fontWeight: 500 }}>{hospital?.name || '—'}</td>
                    <td>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{p.age} yrs</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.gender}</div>
                    </td>
                    <td style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{p.diagnosis || '—'}</td>
                    <td>
                      <span className={`badge ${p.actualLabel === 1 ? 'badge-red' : 'badge-green'}`} style={{ fontSize: 12 }}>
                        {p.actualLabel === 1 ? 'Positive' : 'Negative'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => navigate(`/timeline/${p.id}`)} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>
                        <FiClock size={14} /> Medical History
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Register Patient Profile</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Input baseline demographics and clinical vitals safely.</div>
          </div>
          <button onClick={() => setShowForm(false)} className="icon-btn" style={{ width: 36, height: 36 }}><FiX size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="custom-scroll" style={{ overflowY: 'auto', flex: 1, background: 'var(--bg-app)' }}>
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 32 }}>

            <div className="card" style={{ padding: '24px', border: '1px solid var(--border-default)', boxShadow: 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-ghost)', marginBottom: 20 }}>Primary Demographics</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Field label="Origin Facility" required>
                  <select value={formData.hospitalId} onChange={e => setFormData({ ...formData, hospitalId: e.target.value })} required className="input-base" style={{ paddingBlock: 12, cursor: 'pointer' }}>
                    <option value="">Select hospital node</option>
                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </Field>
                <Field label="Secure Profile ID" required>
                  <input type="text" value={formData.patientCode} onChange={e => setFormData({ ...formData, patientCode: e.target.value })} placeholder="e.g. PT-2026-001" required className="input-base" style={{ paddingBlock: 12 }} />
                </Field>
                <Field label="Age" required>
                  <input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} placeholder="45" min="0" max="120" required className="input-base" style={{ paddingBlock: 12 }} />
                </Field>
                <Field label="Gender" required>
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="input-base" style={{ paddingBlock: 12, cursor: 'pointer' }}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </Field>
                <Field label="Clinical Diagnosis (Optional)">
                  <input type="text" value={formData.diagnosis} onChange={e => setFormData({ ...formData, diagnosis: e.target.value })} placeholder="e.g. Hypertension" className="input-base" style={{ paddingBlock: 12 }} />
                </Field>
                <Field label="Ground Truth Baseline">
                  <select value={formData.actualLabel} onChange={e => setFormData({ ...formData, actualLabel: parseInt(e.target.value) })} className="input-base" style={{ paddingBlock: 12, cursor: 'pointer' }}>
                    <option value={0}>Negative Baseline (Healthy)</option>
                    <option value={1}>Positive Baseline (Disease)</option>
                  </select>
                </Field>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', border: '1px solid var(--border-default)', boxShadow: 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-ghost)', marginBottom: 20 }}>Clinical Vitals & Labs</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {numFields.map(f => (
                  <Field key={f.key} label={f.label}>
                    <div style={{ position: 'relative' }}>
                      <input type="number" step="any" value={formData.features[f.key]} onChange={e => setFeature(f.key, e.target.value)} placeholder={f.ph} className="input-base" style={{ paddingBlock: 12, paddingRight: 56 }} />
                      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-ghost)', pointerEvents: 'none', fontWeight: 600 }}>{f.unit}</span>
                    </div>
                  </Field>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '24px', border: '1px solid var(--border-default)', boxShadow: 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-ghost)', marginBottom: 20 }}>Risk Vectors</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <Toggle checked={formData.features.smoking} onChange={v => setFeature('smoking', v)} label="Active Smoker" />
                <Toggle checked={formData.features.diabetes} onChange={v => setFeature('diabetes', v)} label="Diabetes Hx" />
                <Toggle checked={formData.features.familyHistory} onChange={v => setFeature('familyHistory', v)} label="Family Disease Hx" />
              </div>
            </div>
          </div>

          <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'flex-end', gap: 16, position: 'sticky', bottom: 0, zIndex: 10 }}>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ background: 'var(--accent)', padding: '12px 24px', fontSize: 14 }}>
              {submitting ? <div className="spinner" /> : 'Register Profile to Network'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
