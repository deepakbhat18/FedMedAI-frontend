import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiDownload, FiUsers, FiBarChart2,
  FiFilter, FiCheck, FiAlertCircle, FiFileText,
} from 'react-icons/fi';
import {
  getExportStats,
  exportPatientsCsv,
  exportPredictionsCsv,
} from '../api/exportApi';
import { getAllHospitals } from '../api/hospitalApi';
import { toast } from 'react-toastify';

const ExportCard = ({
  title, description, icon: Icon, count,
  countLabel, color, onExport, loading,
  delay,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between"
  >
    <div>
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-teal-50 border border-teal-200 text-teal-700"
        >
          <Icon size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-teal-700">
          <Icon size={16} />
        </div>
        <div>
          <p className="text-2xl font-bold font-mono text-slate-900">
            {count !== null ? count.toLocaleString() : '—'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">{countLabel}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Included CSV Fields:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(title === 'Patients' ? [
            'ID', 'Patient Code', 'Hospital Node', 'Age', 'Gender',
            'Primary Diagnosis', 'Blood Pressure', 'Cholesterol',
            'Glucose', 'BMI', 'Smoking Status', 'Timestamp',
          ] : [
            'Prediction ID', 'Patient Code', 'Hospital Node', 'Condition Target',
            'Positive/Negative', 'Confidence %', 'Assigned Risk',
            'Active Model Checkpoint', 'Inference Date',
          ]).map(col => (
            <span
              key={col}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium"
            >
              {col}
            </span>
          ))}
        </div>
      </div>
    </div>

    <button
      type="button"
      onClick={onExport}
      disabled={loading}
      className={`w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-sm ${
        loading
          ? 'bg-slate-400 cursor-not-allowed'
          : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.99]'
      }`}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Generating CSV Payload…</span>
        </>
      ) : (
        <>
          <FiDownload size={16} />
          <span>Download {title} Dataset (CSV)</span>
        </>
      )}
    </button>
  </motion.div>
);

const ExportPage = () => {
  const [hospitals, setHospitals]                     = useState([]);
  const [selectedHospital, setSelectedHospital]       = useState('');
  const [stats, setStats]                             = useState(null);
  const [loading, setLoading]                         = useState(true);
  const [exportingPatients, setExportingPatients]     = useState(false);
  const [exportingPredictions, setExportingPredictions]= useState(false);
  const [lastExport, setLastExport]                   = useState(null);

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    loadStats();
  }, [selectedHospital]);

  const loadInitial = async () => {
    try {
      const res = await getAllHospitals();
      setHospitals(res?.data?.data || []);
    } catch {
      toast.error('Failed to load hospitals list');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await getExportStats(
        selectedHospital ? parseInt(selectedHospital) : null
      );
      setStats(res?.data?.data || null);
    } catch {
      // stats optional
    }
  };

  const handleExportPatients = async () => {
    setExportingPatients(true);
    try {
      await exportPatientsCsv(
        selectedHospital ? parseInt(selectedHospital) : null
      );
      setLastExport({
        type: 'Patients',
        time: new Date().toLocaleTimeString(),
        count: stats?.patientCount || 0,
      });
      toast.success(`Patients CSV downloaded (${stats?.patientCount || 0} records)`);
    } catch (err) {
      toast.error('Failed to export patients: ' + err.message);
    } finally {
      setExportingPatients(false);
    }
  };

  const handleExportPredictions = async () => {
    setExportingPredictions(true);
    try {
      await exportPredictionsCsv(
        selectedHospital ? parseInt(selectedHospital) : null
      );
      setLastExport({
        type: 'Predictions',
        time: new Date().toLocaleTimeString(),
        count: stats?.predictionCount || 0,
      });
      toast.success(`Predictions CSV downloaded (${stats?.predictionCount || 0} records)`);
    } catch (err) {
      toast.error('Failed to export predictions: ' + err.message);
    } finally {
      setExportingPredictions(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 border border-teal-200 text-teal-700">
            <FiDownload size={20} />
          </div>
          Clinical Data Export
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Export masked patient cohorts and AI diagnostic predictions in standardized CSV format
        </p>
      </motion.div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex items-center gap-4 flex-wrap justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FiFilter size={16} className="text-teal-600" />
            <span>Target Node:</span>
          </div>

          <select
            value={selectedHospital}
            onChange={e => setSelectedHospital(e.target.value)}
            className="h-11 rounded-xl px-4 text-sm bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition-all min-w-[220px]"
          >
            <option value="">All Hospital Nodes</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        {stats && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
              <FiUsers size={13} />
              <span>{stats.patientCount?.toLocaleString()} Patients</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              <FiBarChart2 size={13} />
              <span>{stats.predictionCount?.toLocaleString()} Predictions</span>
            </span>
          </div>
        )}
      </div>

      {/* Download Confirmation Toast Pill */}
      {lastExport && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl px-4 py-3 bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800"
        >
          <FiCheck size={16} className="text-emerald-600 flex-shrink-0" />
          <p>
            <strong>{lastExport.type}</strong> dataset successfully generated and downloaded ({lastExport.count} rows) at {lastExport.time}
          </p>
        </motion.div>
      )}

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ExportCard
          title="Patients"
          description="Export anonymized patient clinical profiles including vitals, lab markers, and diagnoses."
          icon={FiUsers}
          count={stats?.patientCount ?? null}
          countLabel="patients available for export"
          color="#0d9488"
          onExport={handleExportPatients}
          loading={exportingPatients}
          delay={0.05}
        />
        <ExportCard
          title="Predictions"
          description="Export all AI model inference outcomes including probabilities, risk tiers, and model versions."
          icon={FiBarChart2}
          count={stats?.predictionCount ?? null}
          countLabel="diagnostic predictions available"
          color="#0284c7"
          onExport={handleExportPredictions}
          loading={exportingPredictions}
          delay={0.1}
        />
      </div>

      {/* Compliance / Privacy Card */}
      <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200/80 flex items-start gap-3">
        <FiAlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-900 mb-1">
            HIPAA & Data Privacy Notice
          </p>
          <p className="text-xs text-amber-800/90 leading-relaxed">
            Direct CSV exports are strictly intended for authenticated institutional compliance officers. In production federated learning architecture, raw patient records remain protected inside edge hospital firewalls; central nodes only receive anonymized model weights.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;