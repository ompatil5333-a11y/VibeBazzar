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
  AlertCircle
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
      style={{ zIndex: 100000 }}
    >
      <div
        className="mac-window-card"
        style={{ maxWidth: 460, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS Title Bar with Traffic Lights */}
        <div className="mac-window-titlebar">
          <div className="mac-traffic-lights">
            <button
              className="mac-dot mac-dot-red"
              onClick={() => setIsAuthModalOpen(false)}
              title="Close window"
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
          <div className="mac-window-title">
            Vibe Bazzar — Sign In
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

        {/* Modal Body */}
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <img
              src="/assets/images/logo/vibe-3d-logo.jpg"
              alt="Vibe Bazzar"
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                objectFit: 'cover',
                margin: '0 auto 10px',
                boxShadow: '0 8px 20px rgba(0, 113, 227, 0.2)',
                display: 'block'
              }}
            />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px', letterSpacing: -0.4 }}>
              {authMode === 'login' ? 'Welcome to Vibe Bazzar' : 'Create Account'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              {authMode === 'login'
                ? 'Sign in to access your saved cart, orders & festive discounts'
                : 'Sign up in seconds and get instant ₹250 first order cashback'}
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="mac-segmented-control" style={{ marginBottom: 18 }}>
            <button
              type="button"
              className={`mac-segmented-item ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthMode('login'); setError(null); setSuccessMsg(null); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`mac-segmented-item ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => { setAuthMode('register'); setError(null); setSuccessMsg(null); }}
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
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: 12,
                marginBottom: 16
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: 12,
                marginBottom: 16
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                  Email or Username
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
                      padding: '10px 12px 10px 36px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                  <User size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 12 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                  Password
                </label>
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
                      padding: '10px 12px 10px 36px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 12 }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mac-btn-primary"
                style={{ width: '100%', padding: '12px', marginTop: 6 }}
              >
                {loading ? 'Authenticating...' : 'Sign In with JWT'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
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
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-pill)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
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
                      padding: '10px 12px',
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
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
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
                      padding: '10px 12px',
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Password *
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
                    padding: '10px 12px',
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
                style={{ width: '100%', padding: '12px', marginTop: 6 }}
              >
                {loading ? 'Creating...' : 'Register in Supabase'}
              </button>
            </form>
          )}

          <div
            style={{
              marginTop: 18,
              paddingTop: 12,
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
