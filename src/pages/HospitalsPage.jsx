import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiActivity, FiUsers, FiMapPin, FiX, FiMail, FiPhone, FiHash, FiShield } from 'react-icons/fi';
import { getAllHospitals, createHospital, updateHospital, deleteHospital } from '../api/hospitalApi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Sk = ({ h = '16px', w = '100%', r = '8px' }) => <div className="shimmer" style={{ height: h, width: w, borderRadius: r }} />;

const Field = ({ label, required, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
      {label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}
    </label>
    {children}
  </div>
);

const Modal = ({ open, onClose, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        className="modal-overlay" onClick={onClose}>
        <motion.div initial={{ scale: 0.98, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 20, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function HospitalsPage() {
  const { isAdmin } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', address: '', contactEmail: '', contactPhone: '' });

  useEffect(() => { loadHospitals(); }, []);

  const loadHospitals = async () => {
    try {
      const res = await getAllHospitals();
      setHospitals(res.data.data);
    } catch { toast.error('Failed to load registered nodes'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingHospital) { await updateHospital(editingHospital.id, formData); toast.success('Node configuration updated'); }
      else { await createHospital(formData); toast.success('Hospital node registered successfully'); }
      closeForm(); loadHospitals();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (h) => {
    setEditingHospital(h);
    setFormData({ name: h.name, code: h.code, address: h.address || '', contactEmail: h.contactEmail || '', contactPhone: h.contactPhone || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('WARNING: Deactivating this node will isolate it from the federated network. Proceed?')) return;
    try { await deleteHospital(id); toast.success('Node successfully deactivated'); loadHospitals(); }
    catch { toast.error('Failed to deactivate node'); }
  };

  const closeForm = () => {
    setShowForm(false); setEditingHospital(null);
    setFormData({ name: '', code: '', address: '', contactEmail: '', contactPhone: '' });
  };

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) || h.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div>
          <h1 className="font-heading" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>Hospital Network</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Manage {hospitals.length} federated learning nodes.</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setShowForm(true); setEditingHospital(null); setFormData({ name: '', code: '', address: '', contactEmail: '', contactPhone: '' }); }} className="btn-primary" style={{ padding: '12px 20px', fontSize: 15 }}>
            <FiPlus size={18} /> Register Node
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ position: 'relative', maxWidth: 360, width: '100%' }}>
          <FiSearch size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
          <input type="text" placeholder="Search by facility name or network code..." value={search} onChange={e => setSearch(e.target.value)} className="input-base" style={{ paddingLeft: 44, paddingBlock: 12 }} />
        </div>
        {filtered.length !== hospitals.length && (
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Showing {filtered.length} nodes</span>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Sk h="24px" w="60%" /><Sk h="20px" w="60px" r="99px" />
              </div>
              <Sk h="16px" w="40%" /><Sk h="16px" w="80%" /><Sk h="16px" w="50%" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 32px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <FiActivity size={28} style={{ color: 'var(--text-ghost)' }} />
          </div>
          <div className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>{search ? 'No matches found' : 'Network Empty'}</div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>{search ? 'Adjust search parameters' : 'Register the first hospital to begin training models.'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filtered.map((h, i) => (
            <motion.div key={h.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4 }}
              className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                  <div className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{h.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiHash size={14} style={{ color: 'var(--text-ghost)' }} />
                    <span className="font-mono" style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{h.code}</span>
                  </div>
                </div>
                <span className={`badge ${h.isActive !== false ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 11, flexShrink: 0, padding: '4px 10px' }}>
                  {h.isActive !== false ? 'Online' : 'Offline'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, flex: 1 }}>
                {h.address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <FiMapPin size={14} style={{ color: 'var(--text-ghost)', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>{h.address}</span>
                  </div>
                )}
                {h.contactEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiMail size={14} style={{ color: 'var(--text-ghost)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.contactEmail}</span>
                  </div>
                )}
                {h.contactPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiPhone size={14} style={{ color: 'var(--text-ghost)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{h.contactPhone}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                  <FiUsers size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{h.patientCount || 0}</span>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleEdit(h)} className="btn-secondary" style={{ padding: '8px', width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit Node"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(h.id)} className="btn-danger" style={{ padding: '8px', width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--danger-light)', color: 'var(--danger)', border: 'none' }} title="Deactivate Node"><FiTrash2 size={14} /></button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={closeForm}>
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'var(--primary-light)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiShield size={24} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <div className="font-heading" style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{editingHospital ? 'Configure Node' : 'Register Node'}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>{editingHospital ? 'Modify network parameters' : 'Add facility to federated network'}</div>
              </div>
            </div>
            <button onClick={closeForm} className="icon-btn" style={{ width: 36, height: 36 }}><FiX size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="Facility Name" required><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Mass General" required className="input-base" style={{ paddingBlock: 12 }} /></Field>
              <Field label="Network Code" required><input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. MGH-BOS" required className="input-base" style={{ paddingBlock: 12 }} /></Field>
            </div>
            <Field label="Physical Address"><input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full facility address" className="input-base" style={{ paddingBlock: 12 }} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <Field label="Admin Email"><input type="email" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} placeholder="admin@hospital.org" className="input-base" style={{ paddingBlock: 12 }} /></Field>
              <Field label="Admin Phone"><input type="text" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} placeholder="+1 (555) 000-0000" className="input-base" style={{ paddingBlock: 12 }} /></Field>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <button type="button" onClick={closeForm} className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14 }}>Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
                {submitting ? <div className="spinner" /> : (editingHospital ? 'Update Configuration' : 'Authorize Node')}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
