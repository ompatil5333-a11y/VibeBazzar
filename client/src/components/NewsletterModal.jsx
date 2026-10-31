import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Check, Sparkles } from 'lucide-react';

export const NewsletterModal = () => {
  const { isNewsletterOpen, setIsNewsletterOpen, activePage } = useShop();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('vibe_newsletter_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        const path = window.location.pathname;
        if (!path.includes('login') && !path.includes('admin')) {
          setIsNewsletterOpen(true);
          sessionStorage.setItem('vibe_newsletter_seen', 'true');
        }
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [setIsNewsletterOpen]);

  if (!isNewsletterOpen || activePage === 'login' || activePage === 'admin') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus({ state: 'loading', message: '' });

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({ state: 'success', message: data.message });
        setTimeout(() => {
          setIsNewsletterOpen(false);
        }, 2000);
      } else {
        setStatus({ state: 'error', message: data.message || 'Subscription failed.' });
      }
    } catch {
      setStatus({ state: 'error', message: 'Network error connecting to newsletter API.' });
    }
  };

  return (
    <div className="modal" onClick={() => setIsNewsletterOpen(false)}>
      <div className="modal-close-overlay" />

      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={() => setIsNewsletterOpen(false)}
          aria-label="Close newsletter"
        >
          <X size={18} />
        </button>

        <div className="newsletter-img">
          <img
            src="/assets/images/newsletter.png"
            alt="subscribe newsletter"
            width="400"
            height="400"
          />
        </div>

        <div className="newsletter">
          <form onSubmit={handleSubmit}>
            <div className="newsletter-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Sparkles size={18} color="var(--vibe-primary)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--vibe-primary)', textTransform: 'uppercase' }}>
                  Vibe VIP Club
                </span>
              </div>
              <h3 className="newsletter-title">Get ₹250 Off on Your First Order</h3>
              <p className="newsletter-desc">
                Join the <b>Vibe Bazzar</b> community to get secret coupon codes, early festive sale access, and new drops.
              </p>
            </div>

            {status.state === 'success' ? (
              <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', margin: '15px 0' }}>
                <Check size={18} />
                <span>{status.message}</span>
              </div>
            ) : (
              <>
                {status.state === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: '13px', margin: '5px 0' }}>{status.message}</p>
                )}

                <input
                  type="email"
                  name="email"
                  className="email-field"
                  placeholder="Enter your email address..."
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  type="submit"
                  className="btn-newsletter"
                  disabled={status.state === 'loading'}
                >
                  {status.state === 'loading' ? 'Subscribing...' : 'Claim ₹250 Coupon'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
