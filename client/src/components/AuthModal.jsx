import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Sparkles, User, Mail, Lock, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

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

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        loginUser(data.user, data.token);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection error connecting to auth server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        loginUser(data.user, data.token);
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
    <div className="checkout-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <div
        className="checkout-modal"
        style={{ maxWidth: 480, padding: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={() => setIsAuthModalOpen(false)}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img
            src="/assets/images/logo/vibe-3d-logo.jpg"
            alt="Vibe Bazzar 3D Logo"
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              objectFit: 'cover',
              margin: '0 auto 12px',
              boxShadow: '0 8px 24px var(--vibe-accent-glow)',
              display: 'block'
            }}
          />

          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', letterSpacing: -0.5 }}>
            {authMode === 'login' ? 'Welcome to Vibe Bazzar' : 'Create Your Account'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {authMode === 'login'
              ? 'Sign in to access your saved cart, orders & festive discounts'
              : 'Sign up in seconds and get ₹250 instant cashback on your first order'}
          </p>
        </div>

        {/* Auth Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-pill)',
            padding: 4,
            borderRadius: 'var(--radius-full)',
            marginBottom: 20,
            border: '1px solid var(--border-glass)'
          }}
        >
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: authMode === 'login' ? 'var(--vibe-primary)' : 'transparent',
              color: authMode === 'login' ? '#fff' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: authMode === 'register' ? 'var(--vibe-primary)' : 'transparent',
              color: authMode === 'register' ? '#fff' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="checkout-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        {authMode === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="checkout-form">
            <div className="form-group">
              <label>Email Address or Username *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="loginId"
                  required
                  placeholder="Enter email or username"
                  value={form.loginId}
                  onChange={handleChange}
                  style={{ width: '100%', paddingLeft: 38 }}
                />
                <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  style={{ width: '100%', paddingLeft: 38 }}
                />
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn-place-order"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? 'Authenticating...' : 'Sign In with JWT'}
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="checkout-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="e.g. Om Patil"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="e.g. ompatil"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="ompatil@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Create Password (min 6 chars) *</label>
              <input
                type="password"
                name="password"
                required
                placeholder="Choose a strong password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>City (optional)</label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. Pune, MH"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-place-order"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? 'Registering...' : 'Register in Supabase'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>Encrypted with bcrypt &amp; Secure JWT Token</span>
          </div>
        </div>
      </div>
    </div>
  );
};
