import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiUser, FiLock, FiArrowRight, FiEye, FiEyeOff, FiAlertCircle, FiCpu, FiShield, FiActivity } from 'react-icons/fi';

const FEATURES = [
  { icon: FiCpu,      label: 'Federated Learning',  desc: 'Collaborative AI without data sharing' },
  { icon: FiHeart,    label: 'Precision Models',    desc: '5 specialized disease predictions' },
  { icon: FiActivity, label: 'Real-Time Insights',  desc: 'Live analytical performance tracking' },
  { icon: FiShield,   label: 'Strict Compliance',   desc: 'Enterprise-grade patient privacy' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login({ username, password });
    if (result.success) navigate('/dashboard');
    else setError(result.message || 'Invalid credentials');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-app)' }}>
      
      <div style={{
        display: 'none', flex: 1,
        background: 'var(--primary)',
        padding: '48px 64px', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }} className="lg:flex lg:flex-col">

        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <motion.div 
          animate={{ x: [0, 30, -30, 0], y: [0, -40, 40, 0], scale: [1, 1.1, 0.9, 1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15), transparent 70%)', filter: 'blur(40px)' }} 
        />
        <motion.div 
          animate={{ x: [0, -40, 30, 0], y: [0, 30, -30, 0], scale: [1, 0.9, 1.1, 1] }} 
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.1), transparent 70%)', filter: 'blur(40px)' }} 
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
              <FiHeart size={22} color="white" />
            </div>
            <div>
              <div className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>FedMedAI</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Medical Intelligence</div>
            </div>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} style={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 24, backdropFilter: 'blur(10px)' }}>
            <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success-mid)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success-light)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Secure Network Active</span>
          </div>
          
          <h1 className="font-heading" style={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 20 }}>
            Next-Generation<br />Diagnostic Engine.
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 48 }}>
            Harness the power of federated learning. Train highly accurate models collaboratively across institutions without ever exposing raw patient data.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={f.label}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <f.icon size={18} style={{ color: 'var(--accent-light)' }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>© 2026 FedMedAI Systems</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Privacy</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Terms</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: 420 }}>
          
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <h2 className="font-heading" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>Welcome back</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Enter your credentials to access the workspace.</p>
          </div>

          <div className="card" style={{ padding: '40px 32px' }}>
            <form onSubmit={handleSubmit}>
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: '10px', background: 'var(--danger-light)', border: '1px solid var(--danger-mid)', marginBottom: 24 }}>
                      <FiAlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--danger)' }}>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <FiUser size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. dr_smith" required className="input-base" style={{ paddingLeft: 42, paddingBlock: 12 }} />
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', cursor: 'pointer' }}>Forgot password?</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <FiLock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="input-base" style={{ paddingLeft: 42, paddingRight: 44, paddingBlock: 12 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="icon-btn" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}>
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-accent" style={{ width: '100%', paddingBlock: 12, fontSize: 15 }}>
                {loading ? <div className="spinner" /> : <><span>Sign Into Workspace</span><FiArrowRight size={16} /></>}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                New to the network?{' '}
                <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Request Access</Link>
              </p>
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Environments</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button type="button" onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <FiShield size={14} style={{ color: 'var(--warning)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Admin</span>
                </div>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>admin / admin123</span>
              </button>
              
              <button type="button" onClick={() => { setUsername('hospital1_admin'); setPassword('hospital123'); }}
                className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <FiActivity size={14} style={{ color: 'var(--teal)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Hospital 1</span>
                </div>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>hospital1_admin</span>
              </button>

              <button type="button" onClick={() => { setUsername('hospital2_admin'); setPassword('hospital123'); }}
                className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <FiActivity size={14} style={{ color: 'var(--teal)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Hospital 2</span>
                </div>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>hospital2_admin</span>
              </button>

              <button type="button" onClick={() => { setUsername('hospital3_admin'); setPassword('hospital123'); }}
                className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <FiActivity size={14} style={{ color: 'var(--teal)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Hospital 3</span>
                </div>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>hospital3_admin</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
