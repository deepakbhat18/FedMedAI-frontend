import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  FiPlus, FiSearch, FiUser, FiX,
  FiFilter, FiActivity, FiTrendingUp,
  FiLayers, FiChevronRight, FiCheck
} from 'react-icons/fi';
import { getAllPatients, createPatient } from '../api/patientApi';
import { getAllHospitals } from '../api/hospitalApi';
import { toast } from 'react-toastify';
import { TableSkeleton } from '../components/common/SkeletonLoader';

const Field = ({ label, children, required }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm font-normal bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all";

const PatientsPage = () => {
  const navigate = useNavigate();
  const { globalSearch } = useOutletContext() || {};

  const [patients, setPatients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    hospitalId: '',
    patientCode: '',
    age: '',
    gender: 'MALE',
    diagnosis: 'Heart Disease Risk',
    actualLabel: 1,
    features: {
      bloodPressure: '135',
      cholesterol: '215',
      heartRate: '78',
      bmi: '26.8',
      glucose: '115',
      smoking: 0,
      diabetes: 0,
      familyHistory: 1,
      creatinine: '1.1',
      hemoglobin: '14.5',
      bilirubin: '0.9',
      alt_enzyme: '26',
      albumin: '4.2',
      potassium: '4.1',
      sodium: '140',
      urea: '30',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, hRes] = await Promise.all([
        getAllPatients(),
        getAllHospitals(),
      ]);
      setPatients(pRes?.data?.data || []);
      setHospitals(hRes?.data?.data || []);
    } catch {
      toast.error('Failed to load patient registry');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hospitalId || !formData.patientCode || !formData.age) {
      toast.warning('Please fill in all required fields');
      return;
    }

    try {
      const submitData = {
        hospitalId: parseInt(formData.hospitalId),
        patientCode: formData.patientCode,
        age: parseInt(formData.age),
        gender: formData.gender,
        diagnosis: formData.diagnosis,
        actualLabel: parseInt(formData.actualLabel),
        features: Object.fromEntries(
          Object.entries(formData.features).map(
            ([k, v]) => [k, parseFloat(v) || 0]
          )
        ),
      };

      await createPatient(submitData);
      toast.success('Patient registered successfully');
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create patient');
    }
  };

  const handleFeatureChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [key]: value },
    }));
  };

  const activeSearch = globalSearch || search;

  const filtered = patients.filter(p => {
    const matchesSearch =
      !activeSearch ||
      p.patientCode?.toLowerCase().includes(activeSearch.toLowerCase()) ||
      p.hospitalName?.toLowerCase().includes(activeSearch.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(activeSearch.toLowerCase());

    const matchesHospital =
      !filterHospital ||
      p.hospitalId?.toString() === filterHospital;

    return matchesSearch && matchesHospital;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Patient Registry
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Decentralized clinical patient records partitioned across participating hospital nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 h-11 px-5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors"
          >
            <FiPlus size={16} />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search by patient code, hospital, condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-sm font-normal bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FiFilter size={15} />
            <span>Hospital:</span>
          </div>
          <select
            value={filterHospital}
            onChange={(e) => setFilterHospital(e.target.value)}
            className="h-11 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">All Hospital Nodes</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
            {filtered.length} Patients
          </span>
        </div>
      </div>

      {/* Patients Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <th className="py-3.5 px-5">Patient Code</th>
                  <th className="py-3.5 px-5">Hospital Node</th>
                  <th className="py-3.5 px-5">Age / Gender</th>
                  <th className="py-3.5 px-5">Diagnosis / Condition</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Registered Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      <FiUser size={36} className="mx-auto mb-2 opacity-30 text-slate-400" />
                      <p className="text-base font-semibold text-slate-700">No matching patients found</p>
                      <p className="text-sm text-slate-400 mt-1">Try adjusting your search criteria or hospital filter.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(patient => {
                    const isHighRisk = patient.actualLabel === 1 || patient.diagnosis?.includes('Risk') || patient.diagnosis?.includes('Disease');
                    return (
                      <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5 font-bold text-slate-900 font-mono text-sm">
                          {patient.patientCode}
                        </td>
                        <td className="py-4 px-5 text-slate-700 font-medium text-sm">
                          {patient.hospitalName}
                        </td>
                        <td className="py-4 px-5 text-slate-600 text-sm">
                          {patient.age} yrs • <span className="capitalize">{patient.gender?.toLowerCase()}</span>
                        </td>
                        <td className="py-4 px-5 font-semibold text-slate-800 text-sm">
                          {patient.diagnosis || 'Healthy Baseline'}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isHighRisk
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isHighRisk ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            {isHighRisk ? 'Disease Risk' : 'Healthy'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-500 font-mono text-xs">
                          {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-4 px-5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/timeline/${patient.id}`)}
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50 border border-teal-200/80 transition-colors"
                          >
                            <FiTrendingUp size={14} />
                            <span>Timeline</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Patient Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <FiUser size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Register New Patient</h3>
                    <p className="text-xs text-slate-500">Record clinical vitals and features for decentralized FL training.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Hospital Node" required>
                    <select
                      value={formData.hospitalId}
                      onChange={e => setFormData({ ...formData, hospitalId: e.target.value })}
                      className={inputCls}
                      required
                    >
                      <option value="">Select Hospital Node</option>
                      {hospitals.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Patient Code / ID" required>
                    <input
                      type="text"
                      placeholder="e.g. PAT-CGH-001-099"
                      value={formData.patientCode}
                      onChange={e => setFormData({ ...formData, patientCode: e.target.value })}
                      className={inputCls}
                      required
                    />
                  </Field>

                  <Field label="Patient Age" required>
                    <input
                      type="number"
                      placeholder="e.g. 52"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                      className={inputCls}
                      required
                      min="1"
                      max="120"
                    />
                  </Field>

                  <Field label="Gender" required>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className={inputCls}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </Field>

                  <Field label="Clinical Condition / Diagnosis">
                    <input
                      type="text"
                      placeholder="e.g. Heart Disease Risk"
                      value={formData.diagnosis}
                      onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Ground Truth Evaluation">
                    <select
                      value={formData.actualLabel}
                      onChange={e => setFormData({ ...formData, actualLabel: parseInt(e.target.value) })}
                      className={inputCls}
                    >
                      <option value={1}>Disease Positive (1)</option>
                      <option value={0}>Healthy / Negative (0)</option>
                    </select>
                  </Field>
                </div>

                {/* Vitals Sub-grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pt-3 border-t border-slate-100">
                    Clinical Vitals & Laboratory Features
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Blood Pressure (mmHg)</label>
                      <input
                        type="number"
                        value={formData.features.bloodPressure}
                        onChange={e => handleFeatureChange('bloodPressure', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Cholesterol (mg/dL)</label>
                      <input
                        type="number"
                        value={formData.features.cholesterol}
                        onChange={e => handleFeatureChange('cholesterol', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Heart Rate (bpm)</label>
                      <input
                        type="number"
                        value={formData.features.heartRate}
                        onChange={e => handleFeatureChange('heartRate', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Glucose (mg/dL)</label>
                      <input
                        type="number"
                        value={formData.features.glucose}
                        onChange={e => handleFeatureChange('glucose', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">BMI</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.features.bmi}
                        onChange={e => handleFeatureChange('bmi', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Creatinine (mg/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.features.creatinine}
                        onChange={e => handleFeatureChange('creatinine', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Hemoglobin (g/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.features.hemoglobin}
                        onChange={e => handleFeatureChange('hemoglobin', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Bilirubin (mg/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.features.bilirubin}
                        onChange={e => handleFeatureChange('bilirubin', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
                  >
                    Save & Register Patient
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientsPage;