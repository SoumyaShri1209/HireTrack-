import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (tab === 'register' && !name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email.trim(), password);
        toast.success('Welcome back! 🎉');
      } else {
        await register(name.trim(), email.trim(), password);
        toast.success('Account created! Welcome to HireTrack 🚀');
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundImage:
          'radial-gradient(ellipse 60% 50% at 20% 20%, rgba(0,208,132,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(167,139,250,0.06) 0%, transparent 70%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* ── Logo ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 900,
              fontSize: 26,
              color: '#000',
              margin: '0 auto 16px',
              boxShadow: '0 0 40px rgba(0,208,132,0.35)',
            }}
          >
            H
          </div>
          <h1
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: '-0.5px',
            }}
          >
            HireTrack
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
            AI-Powered Job Application Tracker
          </p>
        </div>

        {/* ── Card ── */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            padding: 36,
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--surface-2)',
              borderRadius: 14,
              padding: 4,
              marginBottom: 32,
            }}
          >
            {['login', 'register'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setShowPw(false); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: 14,
                  transition: 'all 0.2s',
                  background: tab === t ? 'var(--accent)' : 'transparent',
                  color: tab === t ? '#000' : 'var(--text-muted)',
                  boxShadow: tab === t ? '0 2px 12px rgba(0,208,132,0.3)' : 'none',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Name field — register only */}
            {tab === 'register' && (
              <div>
                <label
                  htmlFor="reg-name"
                  style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.05em' }}
                >
                  FULL NAME
                </label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  style={{ fontSize: 15 }}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="auth-email"
                style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.05em' }}
              >
                EMAIL ADDRESS
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                style={{ fontSize: 15 }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="auth-password"
                style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.05em' }}
              >
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  placeholder={tab === 'register' ? 'Min. 6 characters' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{ fontSize: 15, paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: 16,
                    lineHeight: 1,
                    padding: 4,
                  }}
                  title={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-accent"
              style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: 15,
                padding: '13px 0',
                marginTop: 4,
                borderRadius: 12,
              }}
            >
              {loading ? (
                <>
                  <span
                    className="spinner"
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid rgba(0,0,0,0.3)',
                      borderTop: '2px solid #000',
                      borderRadius: '50%',
                      display: 'inline-block',
                    }}
                  />
                  {tab === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : tab === 'login' ? (
                '→ Sign In'
              ) : (
                '→ Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '24px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
              or continue with
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={() => { window.location.href = import.meta.env.VITE_GOOGLE_AUTH_URL || 'http://localhost:5000/api/auth/google'; }}
            className="btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'center',
              gap: 12,
              fontSize: 14,
              padding: '12px 0',
              borderRadius: 12,
            }}
          >
            {/* Google icon SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center',
            marginTop: 24,
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          © 2026 HireTrack · AI-Powered Career Intelligence
        </p>
      </div>
    </div>
  );
};

export default Login;
