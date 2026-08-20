import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn as LogInIcon,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Truck,
  CheckCircle2,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Email atau password salah. Silakan periksa kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div style={s.page}>
      {/* Top Bar Return Link */}
      <div style={s.topNav}>
        <Link to="/" style={s.backLink}>
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda Publik</span>
        </Link>
        <Link to="/tracking" style={s.trackLink}>
          <span>Lacak Pesanan Publik ↗</span>
        </Link>
      </div>

      <div style={s.centerContainer}>
        <div style={s.card}>
          {/* Top Gold Hazard Accent Line */}
          <div style={s.cardTopAccent} />

          {/* Logo & Portal Header */}
          <div style={s.header}>
            <div style={s.logoBadge}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19L8 5H14L11 19H4Z" fill="#F59E0B" />
                <path d="M13 5L17 19H20L16 5H13Z" fill="#0F172A" />
                <circle cx="6" cy="19" r="2" fill="#0F172A" />
                <circle cx="11" cy="19" r="2" fill="#F59E0B" />
                <circle cx="18" cy="19" r="2" fill="#0F172A" />
              </svg>
            </div>
            <h1 style={s.brandTitle}>
              HEAVY<span style={s.brandAccent}>CARE</span><span style={s.brandSub}>.ID</span>
            </h1>
            <p style={s.brandTagline}>PORTAL SISTEM MANAJEMEN INTERNAL</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={s.errorBox}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={s.form}>
            {/* Email Field */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Alamat Email Akun</label>
              <div style={s.inputWrap}>
                <Mail size={17} style={s.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={s.input}
                  placeholder="nama@heavycare.id"
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={s.fieldGroup}>
              <div style={s.labelRow}>
                <label style={s.label}>Kata Sandi</label>
              </div>
              <div style={s.inputWrap}>
                <Lock size={17} style={s.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={s.input}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={s.eyeBtn}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isLoading} style={s.submitBtn}>
              {isLoading ? (
                <span>Memverifikasi Akun...</span>
              ) : (
                <>
                  <LogInIcon size={17} strokeWidth={2.2} />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div style={s.demoSection}>
            <div style={s.demoDivider}>
              <span>AKSES CEPAT DEMO ROLE</span>
            </div>
            <div style={s.demoGrid}>
              <button
                type="button"
                onClick={() => handleQuickFill('sales@gmail.com', 'Sales')}
                style={s.demoBtn}
              >
                <div style={{ ...s.demoRoleBadge, backgroundColor: '#fef3c7', color: '#b45309' }}>Sales</div>
                <div style={s.demoEmail}>sales@gmail.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('manager@gmail.com', 'Manager')}
                style={s.demoBtn}
              >
                <div style={{ ...s.demoRoleBadge, backgroundColor: '#ede9fe', color: '#6d28d9' }}>Manager</div>
                <div style={s.demoEmail}>manager@gmail.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('operasional@transcon.co.id', 'Operasional')}
                style={s.demoBtn}
              >
                <div style={{ ...s.demoRoleBadge, backgroundColor: '#cffafe', color: '#0891b2' }}>Operasional</div>
                <div style={s.demoEmail}>operasional@...</div>
              </button>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div style={s.footerSecurity}>
            <ShieldCheck size={13} style={{ color: '#10b981' }} />
            <span>256-Bit SSL Encrypted · Akses Berbasis Peran Terotentikasi</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, rgba(248,250,252,1) 60%)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  topNav: {
    maxWidth: '1280px',
    width: '100%',
    margin: '0 auto',
    padding: '1.25rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    color: '#475569',
    textDecoration: 'none',
    fontSize: '0.86rem',
    fontWeight: '700',
    transition: 'color 0.15s',
  },
  trackLink: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#92400e',
    textDecoration: 'none',
    backgroundColor: '#fef3c7',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #fde68a',
  },
  centerContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem 1.5rem 3rem',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.04)',
    border: '1px solid #e2e8f0',
    padding: '2.5rem 2.25rem',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  cardTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    backgroundColor: '#f59e0b',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.75rem',
  },
  logoBadge: {
    width: '46px',
    height: '46px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
  },
  brandTitle: {
    fontSize: '1.35rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 0.2rem',
    letterSpacing: '-0.3px',
    fontFamily: "'Outfit', sans-serif",
  },
  brandAccent: {
    color: '#d97706',
  },
  brandSub: {
    color: '#f59e0b',
    fontSize: '0.95rem',
  },
  brandTagline: {
    fontSize: '0.66rem',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '1.5px',
    margin: 0,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 0.9rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    fontSize: '0.84rem',
    marginBottom: '1.25rem',
    border: '1px solid #fca5a5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.15rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '0.4rem',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '0.75rem 2.4rem 0.75rem 2.4rem',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    marginTop: '0.5rem',
    padding: '0.85rem',
    backgroundColor: '#0f172a',
    color: '#fbbf24',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '0.92rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
    transition: 'all 0.15s',
  },
  demoSection: {
    marginTop: '1.75rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid #f1f5f9',
  },
  demoDivider: {
    textAlign: 'center',
    marginBottom: '0.75rem',
    fontSize: '0.65rem',
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: '1px',
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
  },
  demoBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.45rem 0.25rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '7px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  demoRoleBadge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    marginBottom: '0.15rem',
  },
  demoEmail: {
    fontSize: '0.62rem',
    color: '#64748b',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  footerSecurity: {
    marginTop: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    fontSize: '0.68rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
};

export default Login;