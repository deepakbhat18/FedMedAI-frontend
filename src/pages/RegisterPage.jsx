import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiHeart, FiUser, FiLock, FiMail, FiUserPlus, FiArrowRight, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', fullName: '', role: 'HOSPITAL_ADMIN' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(formData);
    if (result.success) navigate('/dashboard');
    setLoading(false);
  };

  const fields = [
    { label: 'Full Name', name: 'fullName', type: 'text', icon: FiUser, placeholder: 'Dr. John Smith' },
    { label: 'Username', name: 'username', type: 'text', icon: FiUser, placeholder: 'johndoc' },
    { label: 'Email Address', name: 'email', type: 'email', icon: FiMail, placeholder: 'john.smith@hospital.org' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-app)' }}>
      
      <div style={{
        display: 'none', flex: '0 0 45%',
        background: 'var(--primary)',
        padding: '48px 64px', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }} className="lg:flex lg:flex-col">
        
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'absolute', top: '15%', right: '-15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.15), transparent 70%)', filter: 'blur(50px)' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(13,148,136,0.4)' }}>
              <FiHeart size={22} color="white" />
            </div>
            <div>
              <div className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>FedMedAI</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Federated Network</div>
            </div>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} style={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
          <h1 className="font-heading" style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
            Join the Collaborative<br />Medical Network.
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 40 }}>
            Connect your facility to the global AI network. Train models securely, run rapid predictions, and improve patient outcomes.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[['🔐', 'Enterprise Security', 'HIPAA compliant infrastructure with zero data leakage.'], ['🤝', 'Collaborative Intelligence', 'Benefit from global insights trained on diverse demographics.'], ['⚡', 'Real-Time Predictions', 'Access sub-second inference for 5 critical disease categories.']].map(([ico, t, d], i) => (
              <motion.div key={t} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {ico}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{t}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{d}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>© 2026 FedMedAI Systems</p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: 460 }}>
          
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h2 className="font-heading" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>Request Access</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Register your hospital node with the network.</p>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {fields.slice(0, 2).map(({ label, name, type, icon: Icon, placeholder }) => (
                  <div key={name}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <Icon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
                      <input type={type} name={name} value={formData[name]} onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })} placeholder={placeholder} required className="input-base" style={{ paddingLeft: 42, paddingBlock: 12 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <FiMail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
                  <input type="email" name="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="doctor@hospital.org" required className="input-base" style={{ paddingLeft: 42, paddingBlock: 12 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <FiLock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
                  <input type={showPass ? 'text' : 'password'} name="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Secure passphrase" required className="input-base" style={{ paddingLeft: 42, paddingRight: 44, paddingBlock: 12 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="icon-btn" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}>
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Account Type</label>
                <div style={{ position: 'relative' }}>
                  <FiShield size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)' }} />
                  <select name="role" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="input-base" style={{ paddingLeft: 42, paddingBlock: 12, cursor: 'pointer', appearance: 'none' }}>
                    <option value="HOSPITAL_ADMIN">Hospital Administrator</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-accent" style={{ width: '100%', paddingBlock: 12, fontSize: 15, marginTop: 8 }}>
                {loading ? <div className="spinner" /> : <><FiUserPlus size={18} /><span>Request Account</span></>}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Already registered?{' '}
                <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
