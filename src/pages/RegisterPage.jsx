import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { FiActivity, FiUser, FiLock, FiMail, FiUserPlus, FiArrowRight, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', fullName: '', role: 'HOSPITAL_ADMIN',
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(formData);
    if (result.success) navigate('/dashboard');
    setLoading(false);
  };

  const fields = [
    { label: 'Full Practitioner Name', name: 'fullName', type: 'text', icon: FiUser, placeholder: 'Dr. Sarah Connor' },
    { label: 'Username', name: 'username', type: 'text', icon: FiUser, placeholder: 'sconnor' },
    { label: 'Institutional Email', name: 'email', type: 'email', icon: FiMail, placeholder: 'sarah@generalhospital.org' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-page)] text-[var(--text-primary)] font-sans relative">
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
        className="w-full max-w-lg mx-auto py-10"
      >
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <FiUserPlus size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Create Clinical Account</h1>
          <p className="text-sm text-slate-500 mt-1">Register as an authorized healthcare node administrator</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 sm:p-9 border border-slate-200/90 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ label, name, type, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">{label}</label>
                <div className="relative">
                  <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={type} name={name} value={formData[name]}
                    onChange={handleChange} placeholder={placeholder} required
                    className="w-full h-12 rounded-xl pl-11 pr-4 text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-normal"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Account Password</label>
              <div className="relative">
                <FiLock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="Minimum 6 characters" required
                  className="w-full h-12 rounded-xl pl-11 pr-11 text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-normal"
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Institutional Role</label>
              <select
                name="role" value={formData.role} onChange={handleChange}
                className="w-full h-12 rounded-xl px-4 text-sm bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
              >
                <option value="HOSPITAL_ADMIN">Hospital Administrator (Node Level)</option>
                <option value="ADMIN">System Administrator (Coordinator Level)</option>
              </select>
            </div>

            <button
              type="submit" disabled={loading}
              className={`w-full h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-sm mt-4 ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-[#0D9488] hover:bg-[#0F766E] active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Clinical Account</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an authorized account?{' '}
              <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
