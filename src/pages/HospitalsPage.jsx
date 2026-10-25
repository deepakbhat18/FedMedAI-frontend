import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch,
  FiActivity, FiUsers, FiMapPin, FiX, FiMail, FiPhone
} from 'react-icons/fi';
import { getAllHospitals, createHospital, updateHospital, deleteHospital } from '../api/hospitalApi';
import { toast } from 'react-toastify';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all";

const Modal = ({ open, onClose, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200"
          onClick={e => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', address: '', contactEmail: '', contactPhone: '' });

  useEffect(() => { loadHospitals(); }, []);

  const loadHospitals = async () => {
    try {
      const res = await getAllHospitals();
      setHospitals(res?.data?.data || []);
    } catch {
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHospital) {
        await updateHospital(editingHospital.id, formData);
        toast.success('Hospital updated successfully');
      } else {
        await createHospital(formData);
        toast.success('Hospital node registered successfully');
      }
      closeForm();
      loadHospitals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (h) => {
    setEditingHospital(h);
    setFormData({ name: h.name, code: h.code, address: h.address || '', contactEmail: h.contactEmail || '', contactPhone: h.contactPhone || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this hospital node from federated learning?')) return;
    try {
      await deleteHospital(id);
      toast.success('Hospital node deactivated');
      loadHospitals();
    } catch {
      toast.error('Failed to deactivate hospital');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingHospital(null);
    setFormData({ name: '', code: '', address: '', contactEmail: '', contactPhone: '' });
  };

  const filtered = hospitals.filter(h =>
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 border border-teal-200 text-teal-700">
              <FiActivity size={20} />
            </div>
            Hospital Clinical Nodes
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            {hospitals.length} decentralized nodes participating in federated medical intelligence
          </p>
        </div>

        <button
          onClick={() => {
            setEditingHospital(null);
            setFormData({ name: '', code: '', address: '', contactEmail: '', contactPhone: '' });
            setShowForm(true);
          }}
          className="flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
        >
          <FiPlus size={16} /> Add Hospital Node
        </button>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by facility name or node code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 p-5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((hospital, i) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm group hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 border border-teal-200 text-teal-700 flex-shrink-0">
                      <FiActivity size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{hospital.name}</p>
                      <p className="text-xs font-mono text-teal-700 font-semibold">{hospital.code}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    hospital.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {hospital.status}
                  </span>
                </div>

                <div className="space-y-1.5 py-2 border-t border-slate-100 text-xs text-slate-500">
                  {hospital.address && (
                    <div className="flex items-center gap-2">
                      <FiMapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{hospital.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FiUsers size={12} className="text-slate-400 flex-shrink-0" />
                    <span><strong className="text-slate-800">{hospital.patientCount || 0}</strong> registered patients</span>
                  </div>
                  {hospital.contactEmail && (
                    <div className="flex items-center gap-2">
                      <FiMail size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{hospital.contactEmail}</span>
                    </div>
                  )}
                  {hospital.contactPhone && (
                    <div className="flex items-center gap-2">
                      <FiPhone size={12} className="text-slate-400 flex-shrink-0" />
                      <span>{hospital.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => handleEdit(hospital)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                >
                  <FiEdit2 size={12} /> Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(hospital.id)}
                  className="flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
              <FiActivity size={28} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No hospital nodes found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different name or add a new node</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      <Modal open={showForm} onClose={closeForm}>
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingHospital ? 'Edit Hospital Facility' : 'Register Hospital Facility'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure participating institution metadata and credentials
            </p>
          </div>
          <button
            onClick={closeForm}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Hospital Name *">
            <input
              type="text" required value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={inputCls} placeholder="e.g. Metro Medical Center"
            />
          </Field>
          <Field label="Hospital Identifier Code *">
            <input
              type="text" required value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              className={inputCls} placeholder="e.g. MMC-001"
              disabled={!!editingHospital}
            />
          </Field>
          <Field label="Physical Address">
            <input
              type="text" value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className={inputCls} placeholder="e.g. 500 Healthcare Blvd"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact Email">
              <input
                type="email" value={formData.contactEmail}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                className={inputCls} placeholder="admin@hospital.org"
              />
            </Field>
            <Field label="Contact Phone">
              <input
                type="text" value={formData.contactPhone}
                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                className={inputCls} placeholder="+1-555-0199"
              />
            </Field>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button" onClick={closeForm}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
            >
              {editingHospital ? 'Update Hospital' : 'Save Hospital'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HospitalsPage;
