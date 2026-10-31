import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, loginUser } = useShop();

  const [form, setForm] = useState({
    loginId: '',
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isAuthModalOpen) return null;

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
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => {
          loginUser(data.user, data.token);
          setIsAuthModalOpen(false);
        }, 500);
      } else {
        setError(data.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
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
        setSuccessMsg('Account registered!');
        setTimeout(() => {
          loginUser(data.user, data.token);
          setIsAuthModalOpen(false);
        }, 600);
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
      className="mac-modal-overlay"
      onClick={() => setIsAuthModalOpen(false)}
      style={{
        zIndex: 100000,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(16px) saturate(180%)'
      }}
    >
      <div
        className="mac-window-card"
        style={{
          maxWidth: 460,
          width: '100%',
          overflow: 'hidden',
          borderRadius: 22,
          boxShadow: '0 25px 70px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--border-glass)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS Title Bar with Traffic Lights */}
        <div className="mac-window-titlebar" style={{ padding: '12px 16px' }}>
          <div className="mac-traffic-lights">
            <button
              className="mac-dot mac-dot-red"
              onClick={() => setIsAuthModalOpen(false)}
              title="Close popup"
              aria-label="Close"
            />
            <button
              className="mac-dot mac-dot-yellow"
              onClick={() => setIsAuthModalOpen(false)}
              title="Minimize"
              aria-label="Minimize"
            />
            <button
              className="mac-dot mac-dot-green"
              title="Zoom"
              aria-label="Zoom"
            />
          </div>
          <div className="mac-window-title" style={{ fontSize: 13, fontWeight: 600 }}>
            Vibe Bazzar — System Authentication
          </div>
          <div style={{ width: 44, textAlign: 'right' }}>
            <span
              onClick={() => setIsAuthModalOpen(false)}
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(142, 142, 147, 0.15)',
                color: 'var(--text-dim)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              esc
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px 22px' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <img
              src="/assets/images/logo/vibe-3d-logo.jpg"
              alt="Vibe Bazzar"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                objectFit: 'cover',
                margin: '0 auto 8px',
                boxShadow: '0 6px 18px rgba(0, 113, 227, 0.2)',
                display: 'block'
              }}
            />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px', letterSpacing: -0.4 }}>
              {authMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              {authMode === 'login'
                ? 'Sign in or register to access Vibe Bazzar, unlock member prices & place orders'
                : 'Register in seconds to unlock member prices, discounts & fast checkout'}
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="mac-segmented-control" style={{ marginBottom: 14 }}>
            <button
              type="button"
              className={`mac-segmented-item ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthMode('login'); setError(null); setSuccessMsg(null); }}
              style={{ padding: '6px 14px', fontSize: 13 }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`mac-segmented-item ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => { setAuthMode('register'); setError(null); setSuccessMsg(null); }}
              style={{ padding: '6px 14px', fontSize: 13 }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: 12,
                marginBottom: 12
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: 12,
                marginBottom: 12
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Email Address or Username
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="loginId"
                    required
                    placeholder="Enter email or username"
                    value={form.loginId}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                  <User size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 11 }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)' }}>
                    Password
                  </label>
                  <span
                    onClick={() => alert('Demo tip: Enter your username and any test password!')}
                    style={{ fontSize: 11.5, color: '#0071e3', cursor: 'pointer', fontWeight: 500 }}
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
                      padding: '9px 12px 9px 36px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 11 }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mac-btn-primary"
                style={{ width: '100%', padding: '11px', marginTop: 4, fontSize: 13 }}
              >
                {loading ? 'Authenticating with JWT...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder=""
                  value={form.fullName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-pill)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder=""
                    value={form.username}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder=""
                    value={form.email}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Create strong password"
                  value={form.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-pill)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mac-btn-primary"
                style={{ width: '100%', padding: '11px', marginTop: 4, fontSize: 13 }}
              >
                {loading ? 'Creating Account in Supabase...' : 'Register Account'}
              </button>
            </form>
          )}

          {/* Continue as Guest Button */}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <ArrowLeft size={14} />
              Continue Browsing as Guest
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 10,
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 11,
              color: 'var(--text-muted)'
            }}
          >
            <ShieldCheck size={14} color="#10b981" />
            <span>Encrypted with bcrypt &amp; Secure JWT Token</span>
          </div>
        </div>
      </div>
    </div>
  );
};
