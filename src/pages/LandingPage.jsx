import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiActivity, FiShield, FiCpu, FiArrowRight, FiCheckCircle, FiUsers, FiTrendingUp, FiDatabase, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useRef } from 'react';

const NODES = [
  { x: '10%', y: '20%', size: 6, delay: 0 },
  { x: '85%', y: '15%', size: 10, delay: 0.4 },
  { x: '20%', y: '70%', size: 8, delay: 0.8 },
  { x: '75%', y: '65%', size: 5, delay: 1.2 },
  { x: '50%', y: '85%', size: 7, delay: 0.6 },
  { x: '92%', y: '45%', size: 9, delay: 1.0 },
  { x: '5%',  y: '50%', size: 5, delay: 1.4 },
  { x: '60%', y: '10%', size: 8, delay: 0.2 },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: FiActivity, title: 'Predict Diseases', desc: 'Real-time diagnostic inferences for 5 major pathological categories with sub-second latency.' },
    { icon: FiUsers, title: 'Manage Hospitals', desc: 'Connect and coordinate across a global network of federated healthcare institutions.' },
    { icon: FiTrendingUp, title: 'Analyze Trends', desc: 'Monitor shifting demographics and disease prevalence through interactive visual telemetry.' }
  ];

  const workflow = [
    { step: '01', title: 'Add Patient', desc: 'Securely register patient demographics and clinical history into the localized node system.' },
    { step: '02', title: 'Run Prediction', desc: 'Trigger the federated AI engine to analyze patient vectors against global intelligence.' },
    { step: '03', title: 'Get Insights', desc: 'Receive high-confidence risk stratification and diagnostic results instantaneously.' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', overflowX: 'hidden' }}>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 64px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(15, 23, 42, 0.05)' }}>
        <Link to={isAuthenticated ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <FiActivity size={20} color="white" />
          </div>
          <span className="font-heading" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>FedMedAI</span>
        </Link>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none' }}>Sign In</Link>
          <Link to="/register" className="btn-accent" style={{ textDecoration: 'none' }}>Request Access</Link>
        </div>
      </nav>

      <section style={{ paddingTop: '160px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.15, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 700, background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }}
        />

        {NODES.map((node, i) => (
          <motion.div key={i}
            animate={{ y: [0, -18, 0], opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: node.delay }}
            style={{ position: 'absolute', left: node.x, top: node.y, width: node.size, height: node.size, borderRadius: '50%', background: 'var(--accent)', opacity: 0.4, zIndex: 0, pointerEvents: 'none', boxShadow: `0 0 ${node.size * 3}px rgba(37,99,235,0.5)` }}
          />
        ))}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ position: 'relative', zIndex: 1, maxWidth: 800, padding: '0 24px' }}>
          <motion.div
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'linear-gradient(90deg, rgba(37,99,235,0.1), rgba(13,148,136,0.1), rgba(37,99,235,0.1))', backgroundSize: '200% 200%', border: '1px solid rgba(37,99,235,0.2)', marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Next-Gen Healthcare</span>
          </motion.div>

          <h1 className="font-heading" style={{ fontSize: '64px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 24 }}>
            {'AI-powered medical'.split(' ').map((word, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.15, duration: 0.5, type: 'spring', bounce: 0.4 }} style={{ display: 'inline-block', marginRight: '0.25em' }}>{word}</motion.span>
            ))}
            <br/>
            {'decision system.'.split(' ').map((word, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.15, duration: 0.5, type: 'spring', bounce: 0.4 }} style={{ display: 'inline-block', marginRight: '0.25em' }}>{word}</motion.span>
            ))}
          </h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }} style={{ fontSize: '20px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 48, maxWidth: 640, marginInline: 'auto' }}>
            Harness the power of federated learning to run highly accurate diagnostic predictions across a secure, collaborative network of global institutions.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.5 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="btn-accent" style={{ padding: '16px 32px', fontSize: 16, borderRadius: '12px', textDecoration: 'none', display: 'inline-block', background: 'linear-gradient(135deg, #2563eb, #0d9488)', boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}>Start Using FedMedAI</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '16px 32px', fontSize: 16, borderRadius: '12px', textDecoration: 'none', display: 'inline-block' }}>Access Workspace</Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section style={{ padding: '40px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32, padding: '0 24px' }}>
          {[
            { label: 'Real-time AI insights', icon: FiCpu },
            { label: 'Secure & scalable', icon: FiLock },
            { label: 'HIPAA Compliant', icon: FiShield },
            { label: 'Federated Architecture', icon: FiDatabase }
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)' }}>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 24px', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 64 }}>
          <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'var(--teal-light)', border: '1px solid rgba(13,148,136,0.15)', marginBottom: 24 }}>
              <FiDatabase size={14} style={{ color: 'var(--teal)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>The Federated Advantage</span>
            </div>
            <h2 className="font-heading" style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 20 }}>
              Global Intelligence. <br/><span style={{ color: 'var(--teal)' }}>Zero Data Compromise.</span>
            </h2>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Traditional healthcare AI requires centralizing sensitive patient data, risking massive privacy breaches and violating compliance. <strong>FedMedAI flips the paradigm using Federated Learning.</strong>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
            {[
              {
                title: 'Data Never Leaves Your Hospital',
                desc: 'Unlike centralized cloud models, our algorithms travel to your local servers. Patient data remains strictly within your secure institutional firewall, ensuring absolute HIPAA and GDPR compliance.',
                icon: FiLock,
                color: 'var(--warning)',
                bg: 'var(--warning-light)'
              },
              {
                title: 'Collaborative Model Training',
                desc: 'Your hospital trains a local model on its own data, then securely encrypts and shares only the mathematical weights (the "learnings") with the global network, never the raw patient records.',
                icon: FiCpu,
                color: 'var(--accent)',
                bg: 'var(--accent-light)'
              },
              {
                title: 'Unprecedented Diagnostic Accuracy',
                desc: 'By aggregating weights from thousands of hospitals globally, the master AI model achieves superhuman accuracy, benefiting from diverse demographics without ever exposing an individual\'s identity.',
                icon: FiActivity,
                color: 'var(--teal)',
                bg: 'var(--teal-light)'
              }
            ].map((adv, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: adv.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <adv.icon size={22} style={{ color: adv.color }} />
                </div>
                <h3 className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{adv.title}</h3>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{adv.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '120px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 className="font-heading" style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 16 }}>Intelligence at scale.</h2>
          <p style={{ fontSize: 18, color: 'var(--text-muted)' }}>Everything you need to orchestrate modern medical diagnostics.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          {features.map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 40px rgba(37,99,235,0.08)' }}
              className="card" style={{ padding: 40, background: 'var(--bg-surface)', cursor: 'pointer' }}>
              <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--accent-light)', border: '1px solid rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
                <feature.icon size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>{feature.title}</h3>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ padding: '120px 24px', background: 'var(--primary)', position: 'relative', overflow: 'hidden' }}>
        <motion.div animate={{ x: [0, 60, -40, 0], y: [0, -40, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 30, -50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.15), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 className="font-heading" style={{ fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16 }}>Seamless Clinical Workflow.</h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }}>Designed for speed, built for precision.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800, margin: '0 auto' }}>
            {workflow.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -60, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                whileHover={{ x: 8, background: 'rgba(255,255,255,0.07)' }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, type: 'spring', bounce: 0.3 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: 32, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', backdropFilter: 'blur(12px)', cursor: 'default' }}>
                <motion.div className="font-mono" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }} style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-light)', flexShrink: 0 }}>{step.step}</motion.div>
                <div>
                  <h3 className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '120px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 className="font-heading" style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 24 }}>Ready to transform diagnostics?</h2>
          <p style={{ fontSize: 20, color: 'var(--text-muted)', marginBottom: 48 }}>Join the global federated network and deploy state-of-the-art predictive models within minutes.</p>
          <Link to="/register" className="btn-accent" style={{ padding: '20px 40px', fontSize: 18, borderRadius: '16px', textDecoration: 'none', boxShadow: '0 8px 32px rgba(37,99,235,0.25)' }}>
            Start using FedMedAI today
          </Link>
        </div>
      </section>

      <footer style={{ padding: '32px 64px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiActivity size={16} style={{ color: 'var(--text-ghost)' }} />
          <span className="font-heading" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-ghost)' }}>FedMedAI</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-ghost)' }}>© 2026 FedMedAI Systems. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default LandingPage;
