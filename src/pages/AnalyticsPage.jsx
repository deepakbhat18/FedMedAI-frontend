import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, LineChart, Line,
} from 'recharts';
import { FiTrendingUp, FiActivity, FiPieChart, FiBarChart2, FiLayers } from 'react-icons/fi';
import { getDashboardAnalytics, getMLMetrics } from '../api/analyticsApi';
import { toast } from 'react-toastify';

const CHART_COLORS = ['#0d9488', '#0284c7', '#2563eb', '#8b5cf6', '#f59e0b'];

const DISEASE_TYPES_ORDER = [
  'heart_disease', 'diabetes', 'kidney_disease', 'liver_disease', 'stroke',
];

const DISEASE_EMOJI = {
  heart_disease:  '❤️',
  diabetes:       '🩸',
  kidney_disease: '🫘',
  liver_disease:  '🫁',
  stroke:         '🧠',
};

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
    <div className="bg-white rounded-xl px-3.5 py-2.5 shadow-lg border border-slate-200 min-w-[140px]">
      <p className="text-xs font-semibold text-slate-500 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-xs text-slate-600">{entry.name}</span>
          </div>
          <span className="text-xs font-bold font-mono text-slate-900">
            {typeof entry.value === 'number' ? (entry.name.includes('Acc') || entry.name.includes('%') ? `${entry.value.toFixed(1)}%` : entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, color, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex items-center justify-between"
  >
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900">
        {value}
      </p>
    </div>
    {Icon && (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50 border border-teal-200 text-teal-700 flex-shrink-0" style={{ color }}>
        <Icon size={22} />
      </div>
    )}
  </motion.div>
);

const AnalyticsPage = () => {
  const [analytics,  setAnalytics]  = useState(null);
  const [mlMetrics,  setMlMetrics]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('overview');
  const [dataSource, setDataSource] = useState('loading');

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try {
      const [analyticsRes, mlMetricsRes] = await Promise.all([
        getDashboardAnalytics(),
        getMLMetrics().catch(() => null),
      ]);
      setAnalytics(analyticsRes?.data?.data || null);
      if (mlMetricsRes?.data?.success && mlMetricsRes?.data?.data) {
        setMlMetrics(mlMetricsRes.data.data);
        setDataSource('live');
      } else {
        setDataSource('cached');
      }
    } catch {
      toast.error('Failed to load analytics data');
      setDataSource('cached');
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyData = () => {
    if (mlMetrics?.disease_metrics) {
      return Object.entries(mlMetrics.disease_metrics)
        .map(([key, value]) => ({
          name:      value.disease_name.replace(' Disease', '').replace('Chronic ', ''),
          fullName:  value.disease_name,
          accuracy:  parseFloat(value.accuracy.toFixed(2)),
          f1:        parseFloat(value.f1_score.toFixed(2)),
          precision: parseFloat(value.precision.toFixed(2)),
          recall:    parseFloat(value.recall.toFixed(2)),
          samples:   value.total_samples,
          disease_key: key,
          isLive: true,
        }))
        .sort((a, b) => b.accuracy - a.accuracy);
    }
    return DISEASE_TYPES_ORDER.map(key => ({
      name: DISEASE_EMOJI[key] || '🏥',
      fullName: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      accuracy: 0, f1: 0, precision: 0, recall: 0, isLive: false,
    }));
  };

  const getAvgAccuracy = () =>
    mlMetrics?.summary?.avg_accuracy ?? (analytics?.latestModelVersion?.accuracy ? analytics.latestModelVersion.accuracy * 100 : null);

  const getFeatureImportance = (diseaseKey) =>
    mlMetrics?.feature_importance?.[diseaseKey] ?? null;

  const accuracyData = getAccuracyData();

  const predictionPieData = analytics?.predictionDistribution
    ? Object.entries(analytics.predictionDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const hospitalData = analytics?.hospitalStats?.map(h => ({
    name:        h.hospitalName?.split(' ').slice(0, 2).join(' '),
    patients:    h.patientCount,
    predictions: h.predictionCount,
  })) || [];

  const trainingHistoryData = analytics?.trainingHistory?.map(t => ({
    round: `R${t.roundNumber}`,
    accuracy: parseFloat(((t.globalAccuracy || 0) * 100).toFixed(1)),
    hospitals: t.participatingHospitals,
    method: t.aggregationMethod || 'FEDAVG',
  })).reverse() || [];

  const tabs = [
    { id: 'overview',  label: 'Overview & Distribution', icon: FiPieChart },
    { id: 'accuracy',  label: 'Disease Model Accuracy', icon: FiActivity },
    { id: 'training',  label: 'FL Training History', icon: FiLayers },
    { id: 'features',  label: 'Clinical Feature Weights', icon: FiBarChart2 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-3 border-teal-600 border-t-transparent animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading analytics dashboard…</p>
        </div>
      </div>
    );
  }

  const avgAcc = getAvgAccuracy();

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
              <FiTrendingUp size={20} />
            </div>
            Analytics & AI Model Insights
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Aggregated diagnostics, clinical node distributions, and federated convergence metrics
          </p>
        </div>

        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
          dataSource === 'live' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${dataSource === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          {dataSource === 'live' ? 'Live ML Inference Active' : 'Database Historical Cache'}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Hospitals"  value={analytics?.totalHospitals  ?? 0} color="#0d9488" icon={FiLayers} delay={0.05} />
        <StatCard label="Total Patients"   value={analytics?.totalPatients   ?? 0} color="#0284c7" icon={FiActivity} delay={0.1} />
        <StatCard label="AI Predictions"   value={analytics?.totalPredictions ?? 0} color="#2563eb" icon={FiTrendingUp} delay={0.15} />
        <StatCard label="Average Accuracy" value={avgAcc ? `${avgAcc.toFixed(1)}%` : 'N/A'} color="#10b981" icon={FiActivity} delay={0.2} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit flex-wrap">
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-white text-teal-800 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Prediction Distribution */}
          <Card delay={0} className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Diagnostic Outcome Distribution
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Positive vs Negative clinical determinations across all records
            </p>
            {predictionPieData.length > 0 ? (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={predictionPieData} cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={4} dataKey="value"
                      >
                        {predictionPieData.map((_, index) => (
                          <Cell key={index} fill={index === 0 ? '#e11d48' : '#0d9488'} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-slate-100">
                  {predictionPieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? '#e11d48' : '#0d9488' }} />
                      <span className="text-xs text-slate-600">
                        {entry.name}: <strong className="text-slate-900 font-mono">{entry.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-center bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">
                  No prediction data records found. Perform predictions via AI Diagnosis page.
                </p>
              </div>
            )}
          </Card>

          {/* Hospital Comparison */}
          <Card delay={0.08} className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Hospital Node Volume Comparison
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Registered patient cohorts and generated predictions per facility
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hospitalData} barCategoryGap="25%" margin={{ top: 10, right: 16, left: 0, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
                  <Legend wrapperStyle={{ color: '#475569', fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="patients" name="Patients" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="predictions" name="Predictions" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Accuracy */}
      {activeTab === 'accuracy' && (
        <div className="space-y-5">
          <Card delay={0} className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Test Accuracy Across Chronic Condition Classifiers
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Evaluated on independent holdout test splits by the Python ML service
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData} barCategoryGap="30%" margin={{ top: 10, right: 16, left: 0, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} domain={[50, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
                  <Bar dataKey="accuracy" name="Accuracy" radius={[6, 6, 0, 0]}>
                    {accuracyData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card delay={0.08} className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Multi-Metric Evaluation (Accuracy, F1, Precision, Recall)
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Comprehensive statistical performance matrix for medical risk verification
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData} barCategoryGap="20%" margin={{ top: 10, right: 16, left: 0, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} domain={[50, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
                  <Legend wrapperStyle={{ color: '#475569', fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="accuracy"  name="Accuracy"  fill="#0d9488" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="f1"        name="F1 Score"  fill="#0284c7" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="precision" name="Precision" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="recall"    name="Recall"    fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accuracyData.map((d, i) => (
              <Card key={d.name} delay={i * 0.05} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-900">{d.fullName}</p>
                  {d.samples && (
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {d.samples} samples
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold font-mono text-teal-700">
                  {d.accuracy}%
                </p>
                <div className="mt-3 space-y-1.5 pt-3 border-t border-slate-100">
                  {[
                    ['F1 Score', d.f1],
                    ['Precision', d.precision],
                    ['Recall', d.recall],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold font-mono text-slate-800">
                        {val ? `${val}%` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Training History */}
      {activeTab === 'training' && (
        <div className="space-y-5">
          <Card delay={0} className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Federated Convergence Curve
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Observed global accuracy across completed federated aggregation rounds
            </p>
            {trainingHistoryData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trainingHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="round" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} domain={[50, 100]} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="accuracy" name="Global Accuracy" stroke="#0d9488" strokeWidth={3} dot={{ fill: '#0d9488', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-center bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">
                  No historical federated training rounds recorded yet. Trigger an FL round on the Models page.
                </p>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Total FL Rounds" value={analytics?.totalTrainingRounds ?? 0} color="#0d9488" icon={FiLayers} delay={0.05} />
            <StatCard label="Aggregation Engine" value="FedAvg & Flower" color="#0284c7" icon={FiActivity} delay={0.1} />
            <StatCard label="Latest Model Version" value={analytics?.latestModelVersion?.versionName || 'None'} color="#2563eb" icon={FiTrendingUp} delay={0.15} />
          </div>
        </div>
      )}

      {/* Tab: Features */}
      {activeTab === 'features' && (
        <div className="space-y-5">
          {DISEASE_TYPES_ORDER.map((diseaseKey, di) => {
            const featureData = getFeatureImportance(diseaseKey);
            if (!featureData) return null;
            return (
              <Card key={diseaseKey} delay={di * 0.08} className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{DISEASE_EMOJI[diseaseKey] || '🏥'}</span>
                    <span>{featureData.disease_name} — Feature Importance</span>
                  </h2>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Live Learned Weights
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Top clinical parameters weighted by logistic regression coefficients
                </p>

                <div className="space-y-3">
                  {featureData.features.slice(0, 7).map((f) => {
                    const isRisk = f.direction === 'risk';
                    return (
                      <div key={f.feature} className="flex items-center gap-4">
                        <span className="text-xs font-semibold text-slate-700 w-44 flex-shrink-0 truncate">
                          {f.feature}
                        </span>
                        <div className="flex-1 rounded-full overflow-hidden h-2.5 bg-slate-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((f.abs_weight / 2.0) * 100, 100)}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full ${isRisk ? 'bg-rose-500' : 'bg-teal-600'}`}
                          />
                        </div>
                        <div className="flex items-center gap-2 w-28 flex-shrink-0 justify-end">
                          <span className="text-xs font-bold font-mono text-slate-900">
                            {f.abs_weight.toFixed(3)}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isRisk ? 'bg-rose-50 text-rose-700' : 'bg-teal-50 text-teal-700'
                          }`}>
                            {isRisk ? '+Risk' : '-Risk'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}

          {!mlMetrics?.feature_importance && (
            <Card delay={0} className="p-10 text-center bg-slate-50">
              <p className="text-xs font-semibold text-slate-600">Feature Importance Data Offline</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Feature weight extraction requires the Python ML service to be connected
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
