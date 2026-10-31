import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  HelpCircle,
  Truck,
  RotateCcw,
  CreditCard,
  UserCheck,
  PhoneCall,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const faqs = [
  {
    q: 'How do I track my Vibe Bazzar delivery?',
    a: 'You can track your order status in real time by clicking "Track Orders" in the top navigation bar. Every shipment comes with tracking updates from our courier partners.'
  },
  {
    q: 'What is the return & replacement policy?',
    a: 'We offer an easy 7-day doorstep return and replacement policy for all eligible fashion, footwear, and accessory items in original condition.'
  },
  {
    q: 'Are online payments secure on Vibe Bazzar?',
    a: 'Yes, 100%! All online card transactions and UPI payments are processed through Razorpay with 256-bit bank-grade encryption and RBI compliance.'
  },
  {
    q: 'How long does delivery take across India?',
    a: 'Metropolitan cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata) receive delivery within 24-48 hours. Other locations take 3-4 working days.'
  }
];

export const SupportPage = () => {
  const { setActivePage } = useShop();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="hub-container">
      <div className="container">
        <div className="hub-header">
          <div className="hub-title-box">
            <h1>
              <HelpCircle size={28} color="#ff4757" />
              24x7 Customer Care &amp; Support Centre
            </h1>
            <p>Instant answers, package tracking, return requests, and concierge assistance.</p>
          </div>

          <button
            onClick={() => setActivePage('home')}
            style={{
              padding: '8px 18px',
              borderRadius: 20,
              background: 'var(--bg-pill)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-glass)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13
            }}
          >
            ← Back to Store
          </button>
        </div>

        {/* Quick Solution Cards */}
        <div className="support-grid">
          <div className="support-card" onClick={() => setActivePage('orders')} style={{ cursor: 'pointer' }}>
            <div className="support-icon"><Truck size={24} /></div>
            <div className="support-content">
              <h3>Track Your Package</h3>
              <p>Check live shipping status and estimate delivery times.</p>
            </div>
          </div>

          <div className="support-card">
            <div className="support-icon"><RotateCcw size={24} /></div>
            <div className="support-content">
              <h3>Returns &amp; Refunds</h3>
              <p>Hassle-free 7-day pickup and instant bank/UPI refund.</p>
            </div>
          </div>

          <div className="support-card">
            <div className="support-icon"><CreditCard size={24} /></div>
            <div className="support-content">
              <h3>Payments &amp; Razorpay</h3>
              <p>Resolve payment issues, pending transactions &amp; GST invoices.</p>
            </div>
          </div>

          <div className="support-card">
            <div className="support-icon"><UserCheck size={24} /></div>
            <div className="support-content">
              <h3>Account &amp; Security</h3>
              <p>Manage shipping addresses, phone numbers, and login security.</p>
            </div>
          </div>
        </div>

        {/* Contact Concierge */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 30 }}>
          <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneCall size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>Toll-Free Helpline</h4>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>1800-889-VIBE (Mon - Sun, 8 AM to 11 PM)</p>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>Live WhatsApp Chat</h4>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Instant chatbot &amp; human representative support</p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="faq-box">
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: 'var(--text-main)' }}>
            Frequently Asked Questions (FAQ)
          </h2>

          {faqs.map((f, i) => (
            <div className="faq-item" key={i}>
              <div
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
              >
                <span>{f.q}</span>
                {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {openFaq === i && <p className="faq-answer">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
