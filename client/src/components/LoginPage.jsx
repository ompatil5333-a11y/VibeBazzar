import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LoginPage = () => {
  const { loginUser, setActivePage } = useShop();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [form, setForm] = useState({
    loginId: '',
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: form.loginId,
          password: form.password
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Authentication successful! Welcome to Vibe Bazzar.');
        setTimeout(() => {
          loginUser(data.user, data.token);
          setActivePage('home');
        }, 600);
      } else {
        setError(data.message || 'Invalid credentials. Please verify username/password.');
      }
    } catch (err) {
      setError('Server connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone,
          address: form.address
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Account registered successfully! Logging you in...');
        setTimeout(() => {
          loginUser(data.user, data.token);
          setActivePage('home');
        }, 700);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        background: 'radial-gradient(ellipse at top, rgba(0, 113, 227, 0.08), transparent 70%)'
      }}
    >
      <div
        className="mac-window-card"
        style={{
          maxWidth: 480,
          width: '100%',
          borderRadius: 24,
          boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.18), 0 0 0 1px var(--border-glass)'
        }}
      >
        {/* macOS Title Bar with Traffic Lights */}
        <div className="mac-window-titlebar">
          <div className="mac-traffic-lights">
            <button
              className="mac-dot mac-dot-red"
              onClick={() => setActivePage('home')}
              title="Close window (Return to Storefront)"
              aria-label="Close"
            />
            <button
              className="mac-dot mac-dot-yellow"
              title="Minimize"
              aria-label="Minimize"
            />
            <button
              className="mac-dot mac-dot-green"
              title="Zoom"
              aria-label="Zoom"
            />
          </div>
          <div className="mac-window-title">
            Vibe Bazzar — System Authentication
          </div>
          <div style={{ width: 44, textAlign: 'right' }}>
            <span
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(142, 142, 147, 0.15)',
                color: 'var(--text-dim)',
                fontWeight: 600
              }}
            >
              esc
            </span>
          </div>
        </div>

        {/* Window Content */}
        <div style={{ padding: '28px 32px 32px' }}>
          {/* Brand Icon & Welcome */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 68,
                height: 68,
                margin: '0 auto 14px',
                borderRadius: 20,
                padding: 3,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2))',
                boxShadow: '0 10px 25px rgba(0, 113, 227, 0.18)',
                border: '1px solid var(--border-glass)'
              }}
            >
              <img
                src="/assets/images/logo/vibe-3d-logo.jpg"
                alt="Vibe Bazzar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 17
                }}
              />
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text-main)',
                letterSpacing: -0.5,
                margin: '0 0 6px'
              }}
            >
              {authMode === 'login' ? 'Welcome Back' : 'Create Vibe Account'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              {authMode === 'login'
                ? 'Sign in to access synchronized wishlist, saved cart & orders'
                : 'Join Vibe Bazzar for exclusive member deals & instant ₹250 cashback'}
            </p>
          </div>

          {/* Cupertino Segmented Picker */}
          <div className="mac-segmented-control" style={{ marginBottom: 22 }}>
            <button
              type="button"
              className={`mac-segmented-item ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`mac-segmented-item ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: 13,
                marginBottom: 18
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: 13,
                marginBottom: 18
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: 6
                  }}
                >
                  Email Address or Username
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="loginId"
                    required
                    placeholder="e.g. ompatil or ompatil@example.com"
                    value={form.loginId}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                  <User
                    size={17}
                    color="var(--text-dim)"
                    style={{ position: 'absolute', left: 14, top: 14 }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                    Password
                  </label>
                  <span
                    onClick={() => alert('For password reset or demo login: enter your username and any test password!')}
                    style={{ fontSize: 12, color: '#0071e3', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Forgot Password?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock
                    size={17}
                    color="var(--text-dim)"
                    style={{ position: 'absolute', left: 14, top: 14 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mac-btn-primary"
                style={{ width: '100%', padding: '13px', marginTop: 8, fontSize: 14 }}
              >
                {loading ? 'Authenticating with JWT...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Om Patil"
                  value={form.fullName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-pill)',
                    color: 'var(--text-main)',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="ompatil"
                    value={form.username}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="om@example.com"
                    value={form.email}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Password (min 6 characters) *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Create password"
                  value={form.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-pill)',
                    color: 'var(--text-main)',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    City (Optional)
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Pune, MH"
                    value={form.address}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mac-btn-primary"
                style={{ width: '100%', padding: '13px', marginTop: 8, fontSize: 14 }}
              >
                {loading ? 'Creating Account in Supabase...' : 'Register in Supabase'}
              </button>
            </form>
          )}

          {/* Quick Continue as Guest */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setActivePage('home')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <ArrowLeft size={15} />
              Continue Browsing as Guest
            </button>
          </div>

          {/* Security Badge */}
          <div
            style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--text-muted)'
            }}
          >
            <ShieldCheck size={16} color="#10b981" />
            <span>Encrypted with bcrypt &amp; Secure JWT Token</span>
          </div>
        </div>
      </div>
    </div>
  );
};
