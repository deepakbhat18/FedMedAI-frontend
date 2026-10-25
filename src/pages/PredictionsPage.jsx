import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity, FiFilter, FiTrendingUp,
  FiTrendingDown, FiChevronDown, FiChevronUp,
  FiUser, FiLayers, FiCalendar, FiPlus
} from 'react-icons/fi';
import {
  getPredictionsByHospital,
  getPredictionAnalytics,
} from '../api/predictionApi';
import { getAllHospitals } from '../api/hospitalApi';
import { toast } from 'react-toastify';
import { TableSkeleton } from '../components/common/SkeletonLoader';

const PredictionDetails = ({ prediction }) => {
  const features = prediction.featuresUsed || {};

  const FEATURE_LABELS = {
    age: 'Age',
    gender: 'Gender',
    blood_pressure: 'Blood Pressure',
    bloodPressure: 'Blood Pressure',
    cholesterol: 'Cholesterol',
    heart_rate: 'Heart Rate',
    heartRate: 'Heart Rate',
    glucose: 'Glucose',
    bmi: 'BMI',
    smoking: 'Smoking',
    diabetes_history: 'Diabetes History',
    diabetesHistory: 'Diabetes History',
    family_history: 'Family History',
    familyHistory: 'Family History',
    creatinine: 'Creatinine',
    hemoglobin: 'Hemoglobin',
    bilirubin: 'Bilirubin',
    alt_enzyme: 'ALT Enzyme',
    altEnzyme: 'ALT Enzyme',
    albumin: 'Albumin',
    potassium: 'Potassium',
    sodium: 'Sodium',
    urea: 'Urea',
  };

  const featureEntries = Object.entries(features)
    .filter(([_, v]) => v !== null && v !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden bg-slate-50 border-t border-slate-100"
    >
      <div className="px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Clinical Feature Input Vector
        </p>
        {featureEntries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {featureEntries.map(([key, value]) => (
              <div
                key={key}
                className="bg-white border border-slate-200/80 rounded-lg p-2 text-center"
              >
                <p className="text-[10px] text-slate-500 font-medium truncate mb-0.5">
                  {FEATURE_LABELS[key] || key}
                </p>
                <p className="text-xs font-bold text-slate-900 font-mono">
                  {typeof value === 'number'
                    ? Number.isInteger(value) ? value : value.toFixed(1)
                    : String(value)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No feature parameter data recorded.</p>
        )}
      </div>
    </motion.div>
  );
};

const PredictionsPage = () => {
  const navigate = useNavigate();

  const [predictions, setPredictions] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hospitalsRes, analyticsRes] = await Promise.all([
        getAllHospitals(),
        getPredictionAnalytics(),
      ]);
      setHospitals(hospitalsRes.data.data || []);
      setAnalytics(analyticsRes.data.data || null);
      if (analyticsRes.data.data?.recentPredictions) {
        setPredictions(analyticsRes.data.data.recentPredictions);
      }
    } catch {
      toast.error('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const loadByHospital = async (hospitalId) => {
    setSelectedHospital(hospitalId);
    setExpandedId(null);
    if (!hospitalId) {
      loadData();
      return;
    }
    try {
      setLoading(true);
      const res = await getPredictionsByHospital(hospitalId);
      setPredictions(res.data.data || []);
    } catch {
      toast.error('Failed to filter predictions by hospital');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const total = analytics?.totalPredictions || 0;
  const dist = analytics?.predictionDistribution || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Prediction Audit Log & History
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Audit trail of AI diagnostic risk predictions and patient inferences across hospital nodes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/predict')}
          className="inline-flex items-center gap-2 h-11 px-5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
        >
          <FiPlus size={16} />
          <span>New AI Prediction</span>
        </button>
      </div>

      {/* Distribution Summary Cards */}
      {!loading && Object.keys(dist).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(dist).map(([label, count]) => {
            const isDisease = label === 'Disease Detected';
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            return (
              <div
                key={label}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900">
                      {count.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">
                      ({pct}%)
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDisease ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  {isDisease ? <FiTrendingUp size={22} /> : <FiTrendingDown size={22} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FiFilter size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Filter by Node:</span>
          <select
            value={selectedHospital}
            onChange={(e) => loadByHospital(e.target.value)}
            className="h-11 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">All Hospital Nodes</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <span className="text-sm font-medium text-slate-500">
          Showing <strong>{predictions.length}</strong> recorded evaluations
        </span>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : predictions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FiActivity size={36} className="mx-auto text-slate-300" />
            <h4 className="text-base font-semibold text-slate-700">No Predictions Logged Yet</h4>
            <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Run your first federated multi-disease evaluation from the <strong>AI Diagnosis</strong> page to record clinical diagnostic scores.
            </p>
            <button
              onClick={() => navigate('/predict')}
              className="inline-flex items-center gap-2 h-11 px-5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors mt-2"
            >
              <span>Go to AI Diagnosis</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  <th className="py-3.5 px-5">Patient Code</th>
                  <th className="py-3.5 px-5">Hospital Node</th>
                  <th className="py-3.5 px-5">Evaluation Label</th>
                  <th className="py-3.5 px-5">Confidence</th>
                  <th className="py-3.5 px-5">Model Version</th>
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {predictions.map((pred) => {
                  const isDisease = pred.prediction === 1 || pred.predictionLabel?.includes('Detected');
                  const isExpanded = expandedId === pred.id;

                  return (
                    <React.Fragment key={pred.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5 font-bold text-slate-900 font-mono text-sm">
                          {pred.patientCode || `PID-${pred.patientId}`}
                        </td>
                        <td className="py-4 px-5 text-slate-700 font-medium text-sm">
                          {pred.hospitalName}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isDisease
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isDisease ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            {pred.predictionLabel || (isDisease ? 'Disease Detected' : 'Healthy')}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-mono font-medium text-slate-700 text-sm">
                          {pred.confidence !== undefined && pred.confidence !== null
                            ? `${(pred.confidence * 100).toFixed(1)}%`
                            : '—'}
                        </td>
                        <td className="py-4 px-5 font-mono text-xs text-slate-500">
                          {pred.modelVersion || 'v1.0'}
                        </td>
                        <td className="py-4 px-5 text-slate-500 text-xs font-mono">
                          {pred.createdAt ? new Date(pred.createdAt).toLocaleString() : '—'}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => toggleExpand(pred.id)}
                            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-teal-700 hover:text-teal-800 rounded-lg hover:bg-teal-50 border border-teal-200/70 transition-colors"
                          >
                            <span>{isExpanded ? 'Hide' : 'Features'}</span>
                            {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan="7" className="p-0">
                            <PredictionDetails prediction={pred} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionsPage;