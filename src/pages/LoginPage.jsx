import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  FiActivity, FiUser, FiLock, FiArrowRight,
  FiEye, FiEyeOff, FiShield, FiCheckCircle,
  FiSun, FiMoon
} from 'react-icons/fi';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login({ username, password });
    if (result.success) navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 bg-[var(--bg-page)] text-[var(--text-primary)] font-sans relative">
      {/* Left Branding Panel (5 Cols on Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#17263D] text-white flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shadow-sm">
            <FiActivity size={22} />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-lg text-white">FedMed AI</span>
            <span className="text-[11px] block text-slate-400 font-medium">Healthcare Federated Intelligence</span>
          </div>
        </div>

        {/* Center Pitch & Highlights */}
        <div className="relative z-10 my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-400/25 text-teal-300 text-xs font-semibold mb-5">
              <FiShield size={13} />
              <span>Decentralized Healthcare AI</span>
            </div>

            <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white mb-3.5 leading-snug">
              Privacy-First Multi-Disease Diagnostic Network
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
              Train and validate high-accuracy predictive diagnostic classifiers across hospital nodes while preserving complete patient data confidentiality.
            </p>

            <div className="space-y-3">
              {[
                'Multi-Disease Screening (Heart, Diabetes, Kidney, Liver, Stroke)',
                'Differential Privacy Mechanism with Configurable Epsilon (ε)',
                'Federated Averaging (FedAvg) and Flower Framework Orchestration',
                'Patient Longitudinal Risk Trajectory & Decision Support',
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <FiCheckCircle size={15} className="text-teal-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Panel Footer */}
        <div className="relative z-10 text-xs text-slate-400 pt-6 border-t border-slate-800/80 flex items-center justify-between">
          <span>Enterprise Clinical Edition</span>
          <span>HIPAA & GDPR Architecture</span>
        </div>
      </div>

      {/* Right Login Form Panel (7 Cols on Desktop) */}
      <div className="flex-1 lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 relative">
        {/* Top-Right Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            {isDark ? <FiSun size={18} className="text-amber-400" /> : <FiMoon size={18} className="text-slate-600" />}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-lg mx-auto"
        >
          {/* Mobile Brand Top Banner */}
          <div className="lg:hidden text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto mb-2.5 shadow-sm">
              <FiActivity size={24} />
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">FedMed AI</h1>
            <p className="text-sm text-slate-500">Clinical Federated Intelligence</p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Sign In to Your Node
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your authorized clinical practitioner credentials to access the network.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-8 sm:p-9 border border-slate-200/90 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Username
                </label>
                <div className="relative">
                  <FiUser size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or hospital1_admin"
                    required
                    className="w-full h-12 rounded-xl pl-11 pr-4 text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-normal"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <FiLock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    required
                    className="w-full h-12 rounded-xl pl-11 pr-11 text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-sm mt-3 ${
                  loading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-[#0D9488] hover:bg-[#0F766E] active:scale-[0.99]'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <FiArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Need to register a new clinical node?{' '}
                <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
                  Register Account
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Demo Credentials Card */}
          <div className="mt-5 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Verified Testing Credentials
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <button
                type="button"
                onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 text-left transition-all"
              >
                <p className="font-bold text-[#17263D]">System Admin</p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">admin / admin123</p>
              </button>
              <button
                type="button"
                onClick={() => { setUsername('hospital1_admin'); setPassword('hospital123'); }}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 text-left transition-all"
              >
                <p className="font-bold text-[#17263D]">Hospital Admin</p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">hospital1_admin</p>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
