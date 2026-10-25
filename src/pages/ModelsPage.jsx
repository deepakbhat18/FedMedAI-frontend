import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCpu, FiZap, FiCheck, FiArrowUp,
  FiArrowDown, FiShield, FiSettings,
  FiMinus, FiWifiOff, FiLayers, FiActivity,
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { getAllModels, triggerTraining } from '../api/modelApi';
import { getMLMetrics } from '../api/analyticsApi';
import { toast } from 'react-toastify';

const COLORS = ['#0d9488', '#0284c7', '#2563eb', '#8b5cf6', '#f59e0b'];

const Card = ({ children, className = '', style = {}, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm ${className}`}
    style={style}
  >
    {children}
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-3.5 py-2.5 shadow-lg border border-slate-200">
      <p className="text-xs font-semibold text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold font-mono text-slate-900">
        {payload[0]?.value?.toFixed(2)}%
      </p>
    </div>
  );
};

const ModelsPage = () => {
  const [models,         setModels]         = useState([]);
  const [trainingResult, setTrainingResult] = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [training,       setTraining]       = useState(false);
  const [mlMetrics,      setMlMetrics]      = useState(null);

  const [engine,    setEngine]    = useState('custom');
  const [numRounds, setNumRounds] = useState(3);
  const [dpEnabled, setDpEnabled] = useState(false);
  const [dpEpsilon, setDpEpsilon] = useState(1.0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [modelsRes, metricsRes] = await Promise.all([
        getAllModels(),
        getMLMetrics().catch(() => null),
      ]);
      setModels(modelsRes?.data?.data || []);
      if (metricsRes?.data?.success && metricsRes?.data?.data?.disease_metrics) {
        setMlMetrics(metricsRes.data.data);
      }
    } catch {
      console.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const getDiseaseAccuracies = () => {
    if (mlMetrics?.disease_metrics) {
      return Object.entries(mlMetrics.disease_metrics)
        .map(([key, value]) => ({
          name: value.disease_name.replace('Disease', '').replace('Chronic ', '').trim(),
          fullName:  value.disease_name,
          emoji: { heart_disease: '❤️', diabetes: '🩸', kidney_disease: '🫘', liver_disease: '🫁', stroke: '🧠' }[key] || '🏥',
          accuracy:  parseFloat(value.accuracy.toFixed(2)),
          f1:        parseFloat(value.f1_score.toFixed(2)),
          precision: parseFloat(value.precision.toFixed(2)),
          recall:    parseFloat(value.recall.toFixed(2)),
          isLive: true,
        }))
        .sort((a, b) => b.accuracy - a.accuracy);
    }
    return [
      { name: 'Heart',    fullName: 'Heart Disease',  emoji: '❤️', accuracy: 0, isLive: false },
      { name: 'Kidney',   fullName: 'Kidney Disease', emoji: '🫘', accuracy: 0, isLive: false },
      { name: 'Stroke',   fullName: 'Stroke',         emoji: '🧠', accuracy: 0, isLive: false },
      { name: 'Diabetes', fullName: 'Diabetes',       emoji: '🩸', accuracy: 0, isLive: false },
      { name: 'Liver',    fullName: 'Liver Disease',  emoji: '🫁', accuracy: 0, isLive: false },
    ];
  };

  const handleTriggerTraining = async () => {
    setTraining(true);
    setTrainingResult(null);
    try {
      const requestData = {
        hospitalIds: [1, 2, 3],
        epochs: 5, learningRate: 0.01, batchSize: 32,
        engine, numRounds,
      };
      if (dpEnabled) requestData.dpEpsilon = dpEpsilon;
      const res = await triggerTraining(requestData);
      setTrainingResult(res.data.data);
      toast.success(`FL Round completed using ${engine === 'flower' ? 'Flower' : 'Custom FedAvg'}!`);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Federated training failed');
    } finally {
      setTraining(false);
    }
  };

  const getPrivacyLabel = (eps) => {
    if (eps <= 0.5) return { label: 'VERY HIGH PRIVACY', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (eps <= 1.0) return { label: 'HIGH PRIVACY',      color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (eps <= 5.0) return { label: 'BALANCED',          color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return               { label: 'ACCURACY EMPHASIS', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  };

  const diseaseAccuracies = getDiseaseAccuracies();
  const isMLOnline = !!mlMetrics;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-3 border-teal-600 border-t-transparent animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading federated models…</p>
        </div>
      </div>
    );
  }

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
              <FiCpu size={20} />
            </div>
            FL Models & Training
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Coordinate federated model rounds across distributed clinical nodes without sharing raw patient data
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
            isMLOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isMLOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            {isMLOnline ? 'ML Engine Connected' : 'ML Engine Disconnected'}
          </div>
        </div>
      </motion.div>

      {/* Offline Alert */}
      {!isMLOnline && (
        <div className="rounded-2xl px-5 py-4 bg-rose-50 border border-rose-200 flex items-center gap-3">
          <FiWifiOff size={18} className="text-rose-600 flex-shrink-0" />
          <p className="text-sm text-rose-800">
            Python ML Service is currently unreachable. Live disease accuracy metrics cannot be queried until connected.
          </p>
        </div>
      )}

      {/* Training Configuration */}
      <Card delay={0.05} className="p-6 sm:p-7">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FiSettings size={18} className="text-teal-600" />
            Federated Aggregation Configuration
          </h2>
          <span className="text-sm text-slate-500">Node Targets: Hospital 1, 2, 3</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FL Engine */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Aggregation Engine
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'custom', label: 'Custom FedAvg', desc: 'Weighted average' },
                { id: 'flower', label: 'Flower Framework', desc: 'Production FL' },
              ].map(opt => {
                const active = engine === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEngine(opt.id)}
                    className={`py-2.5 px-3 rounded-xl text-left border transition-all ${
                      active
                        ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Training Rounds */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Federation Rounds
              </label>
              <span className="text-xs font-bold font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {numRounds} {numRounds === 1 ? 'Round' : 'Rounds'}
              </span>
            </div>
            <input
              type="range" min="1" max="10" value={numRounds}
              onChange={e => setNumRounds(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-slate-200 appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>1 (Fast)</span>
              <span>5 (Recommended)</span>
              <span>10 (Thorough)</span>
            </div>
          </div>

          {/* Differential Privacy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FiShield size={13} className="text-teal-600" />
                Differential Privacy (DP)
              </label>
              {dpEnabled && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPrivacyLabel(dpEpsilon).color}`}>
                  {getPrivacyLabel(dpEpsilon).label}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                onClick={() => setDpEnabled(!dpEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${
                  dpEnabled ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    dpEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="text-xs text-slate-600 font-medium">
                {dpEnabled ? 'Laplacian Noise Injected' : 'Standard Aggregation'}
              </span>
            </div>

            {dpEnabled && (
              <div className="mt-2.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Privacy Budget (ε):</span>
                  <span className="font-mono font-bold text-slate-800">{dpEpsilon.toFixed(1)}</span>
                </div>
                <input
                  type="range" min="0.1" max="10" step="0.1" value={dpEpsilon}
                  onChange={e => setDpEpsilon(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-200 appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>ε=0.1 (High Noise)</span>
                  <span>ε=10 (Low Noise)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleTriggerTraining}
          disabled={training}
          className={`w-full mt-6 py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm text-white transition-all shadow-sm ${
            training
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.99]'
          }`}
        >
          {training ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Coordinating Multi-Hospital FL Training…</span>
            </>
          ) : (
            <>
              <FiZap size={16} />
              <span>Trigger FL Round ({engine === 'flower' ? 'Flower Engine' : 'Custom FedAvg'})</span>
              {dpEnabled && <span className="opacity-90 font-normal">· DP Protected (ε={dpEpsilon})</span>}
            </>
          )}
        </button>
      </Card>

      {/* Training Results Banner */}
      {trainingResult?.comparison && (
        <Card delay={0} className="p-6 border-teal-200 bg-teal-50/30">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FiActivity size={16} className="text-teal-700" />
            Training Round {trainingResult.round} Results Summary
          </h2>

          {trainingResult.overall && (
            <div className="bg-white rounded-xl p-4 mb-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Global Ensemble Accuracy
                  </p>
                  <p className="text-2xl font-bold font-mono text-slate-900 flex items-center gap-2">
                    <span>{(trainingResult.overall.avg_before * 100).toFixed(1)}%</span>
                    <span className="text-slate-400 font-normal text-lg">→</span>
                    <span className="text-teal-700">{(trainingResult.overall.avg_after * 100).toFixed(1)}%</span>
                  </p>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold font-mono ${
                  trainingResult.overall.avg_improvement > 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {trainingResult.overall.avg_improvement > 0 ? (
                    <FiArrowUp size={14} />
                  ) : trainingResult.overall.avg_improvement < 0 ? (
                    <FiArrowDown size={14} />
                  ) : (
                    <FiMinus size={14} />
                  )}
                  <span>{(trainingResult.overall.avg_improvement * 100).toFixed(2)}%</span>
                </div>
              </div>

              <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>Engine: <strong className="text-slate-700">{trainingResult.engine || engine}</strong></span>
                <span>Active Hospitals: <strong className="text-slate-700">{trainingResult.participating_hospitals}</strong></span>
                {trainingResult.dp_applied && (
                  <span className="text-emerald-700 font-medium">Privacy Noise Applied (ε={trainingResult.dp_epsilon})</span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(trainingResult.comparison).map(([disease, comp]) => {
              const imp = comp.improvement;
              const isPositive = imp > 0;
              return (
                <div
                  key={disease}
                  className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">
                      {disease === 'heart_disease' ? '❤️' : disease === 'diabetes' ? '🩸' :
                       disease === 'kidney_disease' ? '🫘' : disease === 'liver_disease' ? '🫁' : '🧠'}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{comp.disease_name}</p>
                      <p className="text-[11px] font-mono text-slate-500">
                        {(comp.before * 100).toFixed(1)}% → {(comp.after * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isPositive ? '+' : ''}{(imp * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Disease Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {diseaseAccuracies.map((d, i) => {
          return (
            <Card key={d.name} delay={i * 0.05} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{d.emoji}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{d.fullName}</h3>
                    <p className="text-[11px] text-slate-400">Logistic Regression Classifier</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <FiCheck size={10} /> Active
                  </span>
                  {d.isLive && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Weights
                    </span>
                  )}
                </div>
              </div>

              {d.accuracy === 0 && !d.isLive ? (
                <div className="text-center py-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400">Train model to calculate accuracy</p>
                </div>
              ) : (
                <>
                  <div className="rounded-full overflow-hidden h-2 mb-2 bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.accuracy}%` }}
                      transition={{ delay: i * 0.05 + 0.3, duration: 0.8 }}
                      className="h-full rounded-full bg-teal-600"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Test Accuracy</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {d.accuracy.toFixed(2)}%
                    </span>
                  </div>
                  {d.f1 !== undefined && d.isLive && (
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
                      {[
                        ['F1-Score', d.f1],
                        ['Precision', d.precision],
                        ['Recall', d.recall],
                      ].map(([label, val]) => (
                        <div key={label} className="text-center">
                          <p className="text-[10px] font-medium text-slate-400">{label}</p>
                          <p className="text-xs font-bold font-mono text-slate-800">
                            {val?.toFixed(1)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Accuracy Comparison Chart */}
      <Card delay={0.15} className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Disease Classification Accuracy Across Nodes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isMLOnline ? 'Real-time test split metrics from Python ML service' : 'Waiting for ML service connection'}
            </p>
          </div>
        </div>

        {!isMLOnline ? (
          <div className="flex items-center justify-center h-48 text-center bg-slate-50 rounded-xl">
            <div>
              <FiWifiOff size={24} className="mx-auto mb-2 text-slate-400" />
              <p className="text-xs font-semibold text-slate-600">ML Service Offline</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Start ML service container to query live test accuracy</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseAccuracies} barCategoryGap="30%" margin={{ top: 10, right: 16, left: 0, bottom: 12 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                  {diseaseAccuracies.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Model Version History */}
      <Card delay={0.2} className="p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FiLayers size={16} className="text-teal-600" />
          Model Version History
        </h2>

        {models.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {models.map((model) => (
              <div
                key={model.id}
                className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-50 text-teal-700 border border-teal-200">
                    <FiCpu size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {model.versionName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Round: {model.trainingRound} · {model.aggregationMethod?.toUpperCase() || 'FEDAVG'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono text-slate-900">
                      {model.accuracy ? `${(model.accuracy * 100).toFixed(2)}%` : 'N/A'}
                    </p>
                    <p className="text-[10px] text-slate-400">reported accuracy</p>
                  </div>
                  {model.isActive && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-xl">
            <FiCpu size={24} className="mx-auto mb-2 text-slate-400" />
            <p className="text-xs font-semibold text-slate-600">No model versions registered yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Trigger an FL training round to produce a global checkpoint</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ModelsPage;
