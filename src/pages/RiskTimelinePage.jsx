import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart,
} from 'recharts';
import {
  FiTrendingUp, FiTrendingDown, FiMinus,
  FiArrowLeft, FiActivity, FiCalendar,
  FiAlertTriangle, FiCheck, FiHeart,
} from 'react-icons/fi';
import { getPatientTimeline } from '../api/predictionApi';
import { getAllPatients } from '../api/patientApi';
import { toast } from 'react-toastify';

const DISEASE_CONFIG = {
  heart_disease:  { label: 'Heart',    color: '#e11d48', emoji: '❤️' },
  diabetes:       { label: 'Diabetes', color: '#f59e0b', emoji: '🩸' },
  kidney_disease: { label: 'Kidney',   color: '#0d9488', emoji: '🫘' },
  liver_disease:  { label: 'Liver',    color: '#0284c7', emoji: '🫁' },
  stroke:         { label: 'Stroke',   color: '#8b5cf6', emoji: '🧠' },
};

const RISK_CONFIG = {
  HIGH:     { color: '#e11d48', bg: '#fff1f2', border: '#ffe4e6' },
  MODERATE: { color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' },
  LOW:      { color: '#0284c7', bg: '#f0f9ff', border: '#e0f2fe' },
  MINIMAL:  { color: '#0d9488', bg: '#f0fdfa', border: '#ccfbf1' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl p-3 shadow-lg border border-slate-200 min-w-[160px]">
      <p className="text-xs font-semibold text-slate-500 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-xs text-slate-600">{entry.name}</span>
          </div>
          <span className="text-xs font-bold font-mono text-slate-900">
            {(entry.value * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, sub, color, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex items-start justify-between"
  >
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900">{value}</p>
      {sub && <p className="text-xs sm:text-sm text-slate-400 mt-1">{sub}</p>}
    </div>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50 border border-teal-200 text-teal-700 flex-shrink-0" style={{ color }}>
      <Icon size={22} />
    </div>
  </motion.div>
);

const RiskTimelinePage = () => {
  const { patientId: paramId } = useParams();
  const navigate = useNavigate();

  const [patients, setPatients]               = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(paramId || '');
  const [timeline, setTimeline]               = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [activeTab, setActiveTab]             = useState('summary');
  const [patientsLoading, setPatientsLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) loadTimeline(selectedPatient);
  }, [selectedPatient]);

  const loadPatients = async () => {
    try {
      const res = await getAllPatients();
      setPatients(res?.data?.data || []);
    } catch {
      toast.error('Failed to load patient directory');
    } finally {
      setPatientsLoading(false);
    }
  };

  const loadTimeline = async (patientId) => {
    setLoading(true);
    setTimeline(null);
    try {
      const res = await getPatientTimeline(patientId);
      setTimeline(res?.data?.data || null);
    } catch {
      toast.error('Failed to load patient risk trajectory');
    } finally {
      setLoading(false);
    }
  };

  const trendConfig = {
    IMPROVING: { color: '#0d9488', icon: FiTrendingDown, label: 'Improving Trend' },
    WORSENING: { color: '#e11d48', icon: FiTrendingUp,   label: 'Worsening Trend' },
    STABLE:    { color: '#f59e0b', icon: FiMinus,        label: 'Stable Trajectory' },
  };

  const trend = trendConfig[timeline?.riskTrend || 'STABLE'];
  const TrendIcon = trend.icon;

  const currentRiskLevel = (() => {
    const r = timeline?.currentRiskScore || 0;
    if (r >= 0.75) return 'HIGH';
    if (r >= 0.50) return 'MODERATE';
    if (r >= 0.25) return 'LOW';
    return 'MINIMAL';
  })();

  const riskCfg = RISK_CONFIG[currentRiskLevel];

  const summaryData = (timeline?.summary || []).map(p => ({
    date: p.date,
    avgRisk: p.avgRisk,
    riskLevel: p.riskLevel,
    diseasesDetected: p.diseasesDetected,
  }));

  const detailedData = (timeline?.detailed || []).map(p => ({
    date: p.date,
    ...p.diseaseConfidences,
  }));

  const selectedPatientInfo = patients.find(
    p => p.id === parseInt(selectedPatient)
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 flex-wrap"
      >
        <button
          onClick={() => navigate('/patients')}
          className="w-11 h-11 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-all"
        >
          <FiArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 border border-teal-200 text-teal-700">
              <FiActivity size={20} />
            </div>
            Patient Longitudinal Risk Trajectory
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Historical diagnostic monitoring and disease risk progression across clinical checks
          </p>
        </div>
      </motion.div>

      {/* Patient Selector */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex items-center gap-4 flex-wrap">
        <label className="text-sm font-semibold text-slate-700">
          Target Patient:
        </label>
        <select
          value={selectedPatient}
          onChange={e => setSelectedPatient(e.target.value)}
          className="h-11 rounded-xl px-4 text-sm bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:bg-white transition-all flex-1 max-w-sm"
        >
          <option value="">— Choose Patient from Registry —</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>
              {p.patientCode} · {p.hospitalName} · Age {p.age} ({p.gender})
            </option>
          ))}
        </select>

        {selectedPatientInfo && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs ml-auto">
            <FiHeart size={13} className="text-teal-600" />
            <span className="font-semibold">{selectedPatientInfo.hospitalName}</span>
            <span className="text-slate-400">·</span>
            <span>Age: {selectedPatientInfo.age}</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-slate-500">Calculating historical risk timeline…</p>
          </div>
        </div>
      )}

      {!loading && !selectedPatient && (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-teal-50 border border-teal-200 text-teal-700">
            <FiActivity size={24} />
          </div>
          <p className="text-sm font-bold text-slate-900 mb-1">Select a Patient</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose a patient record above to view longitudinal progression trends and per-condition risk curves.
          </p>
        </div>
      )}

      {!loading && selectedPatient && timeline && timeline.totalPredictions === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <FiAlertTriangle size={24} className="mx-auto mb-2 text-amber-500" />
          <p className="text-sm font-bold text-slate-900 mb-1">No Historical Predictions Found</p>
          <p className="text-xs text-slate-500">
            This patient has no AI prediction runs yet. Perform an initial evaluation via the AI Diagnosis page.
          </p>
        </div>
      )}

      {!loading && timeline && timeline.totalPredictions > 0 && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Current Risk"
              value={`${((timeline.currentRiskScore || 0) * 100).toFixed(1)}%`}
              sub={`${currentRiskLevel} severity`}
              color={riskCfg.color}
              icon={FiActivity}
              delay={0.05}
            />
            <StatCard
              label="Trajectory Trend"
              value={trend.label}
              sub="Longitudinal pattern"
              color={trend.color}
              icon={TrendIcon}
              delay={0.1}
            />
            <StatCard
              label="Total Screenings"
              value={timeline.totalPredictions}
              sub="Evaluations stored"
              color="#0d9488"
              icon={FiCalendar}
              delay={0.15}
            />
            <StatCard
              label="First Screening"
              value={timeline.firstPrediction
                ? new Date(timeline.firstPrediction).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
                : '—'}
              sub={timeline.firstPrediction ? new Date(timeline.firstPrediction).getFullYear().toString() : ''}
              color="#0284c7"
              icon={FiCalendar}
              delay={0.2}
            />
          </div>

          {/* Risk Level Banner */}
          <div
            className="rounded-2xl px-5 py-4 border shadow-sm flex items-center justify-between flex-wrap gap-4"
            style={{ background: riskCfg.bg, borderColor: riskCfg.border }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200/80">
                {currentRiskLevel === 'HIGH' ? (
                  <FiAlertTriangle size={18} style={{ color: riskCfg.color }} />
                ) : currentRiskLevel === 'MINIMAL' ? (
                  <FiCheck size={18} style={{ color: riskCfg.color }} />
                ) : (
                  <FiActivity size={18} style={{ color: riskCfg.color }} />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {timeline.patientCode} — Status: <span style={{ color: riskCfg.color }}>{currentRiskLevel} RISK</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {timeline.hospitalName} · Latest screening: {timeline.lastPrediction ? new Date(timeline.lastPrediction).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-white"
              style={{ color: trend.color, borderColor: `${trend.color}40` }}
            >
              <TrendIcon size={14} />
              <span>{timeline.riskTrend}</span>
            </div>
          </div>

          {/* Tabbed View Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* Tab Buttons */}
            <div className="flex border-b border-slate-200 bg-slate-50/50">
              {[
                { id: 'summary',  label: 'Overall Aggregate Risk Curve' },
                { id: 'detailed', label: 'Multi-Condition Breakdown' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3.5 text-xs font-bold transition-all relative ${
                    activeTab === tab.id
                      ? 'text-teal-700 bg-white border-b-2 border-teal-600'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'summary' && (
                <div>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Aggregate Risk Over Time</h3>
                      <p className="text-xs text-slate-500">Average diagnostic confidence across tracked chronic parameters</p>
                    </div>
                  </div>

                  {summaryData.length < 2 ? (
                    <div className="flex items-center justify-center h-48 text-center bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500">At least 2 prediction checks needed to calculate curve</p>
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={summaryData}>
                          <defs>
                            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine y={0.75} stroke="#e11d48" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'HIGH', fill: '#e11d48', fontSize: 10 }} />
                          <ReferenceLine y={0.50} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'MODERATE', fill: '#f59e0b', fontSize: 10 }} />
                          <Area type="monotone" dataKey="avgRisk" name="Average Risk" stroke="#0d9488" strokeWidth={2.5} fill="url(#riskGradient)" dot={{ fill: '#0d9488', r: 4 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Summary Table */}
                  {summaryData.length > 0 && (
                    <div className="mt-6 rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                          <tr>
                            <th className="px-4 py-3">Screening Date</th>
                            <th className="px-4 py-3">Composite Risk</th>
                            <th className="px-4 py-3">Tier</th>
                            <th className="px-4 py-3">Positive Conditions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[...summaryData].reverse().map((row, i) => {
                            const rl = RISK_CONFIG[row.riskLevel] || RISK_CONFIG.MINIMAL;
                            return (
                              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3 font-mono text-slate-600">{row.date}</td>
                                <td className="px-4 py-3 font-bold font-mono text-slate-900">{((row.avgRisk || 0) * 100).toFixed(1)}%</td>
                                <td className="px-4 py-3">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border" style={{ background: rl.bg, color: rl.color, borderColor: rl.border }}>
                                    {row.riskLevel}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-teal-700">{row.diseasesDetected} conditions flagged</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'detailed' && (
                <div>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Individual Condition Trajectories</h3>
                      <p className="text-xs text-slate-500">Historical model confidence probability across all 5 clinical parameters</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-5">
                    {Object.entries(DISEASE_CONFIG).map(([key, cfg]) => (
                      <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                        <span className="text-slate-700 font-medium">{cfg.emoji} {cfg.label}</span>
                      </div>
                    ))}
                  </div>

                  {detailedData.length < 2 ? (
                    <div className="flex items-center justify-center h-48 text-center bg-slate-50 rounded-xl">
                      <p className="text-xs text-slate-500">Need at least 2 longitudinal checks to plot trajectories</p>
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={detailedData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine y={0.75} stroke="#e11d48" strokeDasharray="4 4" strokeOpacity={0.4} />
                          <ReferenceLine y={0.50} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.4} />
                          {Object.entries(DISEASE_CONFIG).map(([key, cfg]) => (
                            <Line
                              key={key}
                              type="monotone"
                              dataKey={key}
                              name={cfg.label}
                              stroke={cfg.color}
                              strokeWidth={2}
                              dot={{ fill: cfg.color, r: 4 }}
                              connectNulls
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Disease Grid Cards */}
                  {timeline.detailed?.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
                      {Object.entries(DISEASE_CONFIG).map(([key, cfg]) => {
                        const lastDetailed = timeline.detailed[timeline.detailed.length - 1];
                        const conf = lastDetailed?.diseaseConfidences?.[key];
                        const pred = lastDetailed?.diseasePredictions?.[key];
                        const pct = conf != null ? (conf * 100).toFixed(1) : null;
                        return (
                          <div key={key} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                            <p className="text-xl mb-1">{cfg.emoji}</p>
                            <p className="text-xs text-slate-500 font-semibold mb-0.5">{cfg.label}</p>
                            <p className="text-sm font-bold font-mono text-slate-900">{pct != null ? `${pct}%` : '—'}</p>
                            {pred != null && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1.5 inline-block font-bold ${
                                pred === 1 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {pred === 1 ? 'Flagged' : 'Clear'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RiskTimelinePage;