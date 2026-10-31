import React from 'react';
import { useShop } from '../context/ShopContext';
import { MapPin, Phone, Mail, Sparkles, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const { setActivePage, setSelectedCategory } = useShop();

  return (
    <footer>
      {/* 1. Brand Directory */}
      <div className="footer-category">
        <div className="container">
          <h2 className="footer-category-title">Brand Directory &amp; Categories</h2>

          <div className="footer-category-box">
            <h3 className="category-box-title">Fashion :</h3>
            <span onClick={() => { setActivePage('home'); setSelectedCategory('shirt'); }} className="footer-category-link" style={{ cursor: 'pointer' }}>Pure Cotton Shirts</span>
            <span onClick={() => { setActivePage('home'); setSelectedCategory('jacket'); }} className="footer-category-link" style={{ cursor: 'pointer' }}>Winter Jackets</span>
            <span onClick={() => { setActivePage('home'); setSelectedCategory('shorts'); }} className="footer-category-link" style={{ cursor: 'pointer' }}>Lounge Shorts</span>
            <span onClick={() => { setActivePage('home'); setSelectedCategory('clothes'); }} className="footer-category-link" style={{ cursor: 'pointer' }}>Anarkali &amp; Kurtas</span>
          </div>

          <div className="footer-category-box">
            <h3 className="category-box-title">Footwear :</h3>
            <span onClick={() => { setActivePage('home'); setSelectedCategory('sports'); }} className="footer-category-link" style={{ cursor: 'pointer' }}>Trekking Shoes</span>
            <span onClick={() => { setActivePage('home'); setSelectedCategory('footwear'); }} className="footer-category-link" style={{ cursor: 'pointer' }}>Formal Oxfords</span>
            <span onClick={() => { setActivePage('home'); setSelectedCategory('party-wear'); }} className="footer-category-link" style={{ cursor: 'pointer' }}>Party Wear Heels</span>
          </div>

          <div className="footer-category-box">
            <h3 className="category-box-title">Jewellery :</h3>
            <span onClick={() => { setActivePage('home'); setSelectedCategory('jewellery'); }} className="footer-category-link" style={{ cursor: 'pointer' }}>Rose Gold Earrings</span>
            <span onClick={() => { setActivePage('home'); setSelectedCategory('jewellery'); }} className="footer-category-link" style={{ cursor: 'pointer' }}>CZ Pendants</span>
          </div>

          <div className="footer-category-box">
            <h3 className="category-box-title">Beauty &amp; Care :</h3>
            <span onClick={() => { setActivePage('home'); setSelectedCategory('cosmetics'); }} className="footer-category-link" style={{ cursor: 'pointer' }}>Argan Hair Spa Combos</span>
            <span onClick={() => { setActivePage('home'); setSelectedCategory('perfume'); }} className="footer-category-link" style={{ cursor: 'pointer' }}>Royal Oudh Cologne</span>
          </div>
        </div>
      </div>

      {/* 2. Footer Navigation Links */}
      <div className="footer-nav">
        <div className="container">
          <ul className="footer-nav-list">
            <li className="footer-nav-item">
              <h2 className="nav-title">Vibe Bazzar Store</h2>
            </li>
            <li className="footer-nav-item"><span onClick={() => setActivePage('deals')} className="footer-nav-link" style={{ cursor: 'pointer' }}>Today's Lightning Deals</span></li>
            <li className="footer-nav-item"><span onClick={() => setActivePage('orders')} className="footer-nav-link" style={{ cursor: 'pointer' }}>Track Your Order</span></li>
            <li className="footer-nav-item"><span onClick={() => setActivePage('wishlist')} className="footer-nav-link" style={{ cursor: 'pointer' }}>Saved Wishlist</span></li>
            <li className="footer-nav-item"><span onClick={() => setActivePage('support')} className="footer-nav-link" style={{ cursor: 'pointer' }}>Help &amp; Customer Care</span></li>
          </ul>

          <ul className="footer-nav-list">
            <li className="footer-nav-item">
              <h2 className="nav-title">Customer Care</h2>
            </li>
            <li className="footer-nav-item"><span onClick={() => setActivePage('support')} className="footer-nav-link" style={{ cursor: 'pointer' }}>Return Policy (7 Days)</span></li>
            <li className="footer-nav-item"><span onClick={() => setActivePage('support')} className="footer-nav-link" style={{ cursor: 'pointer' }}>Razorpay Payment Security</span></li>
            <li className="footer-nav-item"><span onClick={() => setActivePage('support')} className="footer-nav-link" style={{ cursor: 'pointer' }}>Shipping &amp; Delivery Speeds</span></li>
            <li className="footer-nav-item"><span onClick={() => setActivePage('support')} className="footer-nav-link" style={{ cursor: 'pointer' }}>FAQ &amp; Concierge</span></li>
          </ul>

          <ul className="footer-nav-list">
            <li className="footer-nav-item">
              <h2 className="nav-title">Merchant &amp; Company</h2>
            </li>
            <li className="footer-nav-item">
              <span
                onClick={() => setActivePage('admin')}
                className="footer-nav-link"
                style={{ cursor: 'pointer', color: '#0071e3', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ShieldCheck size={16} /> Admin Studio &amp; Inventory
              </span>
            </li>
            <li className="footer-nav-item"><span onClick={() => setActivePage('deals')} className="footer-nav-link" style={{ cursor: 'pointer' }}>Flash Sale Manager</span></li>
            <li className="footer-nav-item"><span onClick={() => setActivePage('login')} className="footer-nav-link" style={{ cursor: 'pointer' }}>Merchant Sign In</span></li>
            <li className="footer-nav-item"><a href="#" className="footer-nav-link">Terms &amp; Conditions</a></li>
            <li className="footer-nav-item"><a href="#" className="footer-nav-link">Privacy Policy</a></li>
          </ul>

          <ul className="footer-nav-list">
            <li className="footer-nav-item">
              <h2 className="nav-title">Headquarters</h2>
            </li>
            <li className="footer-nav-item flex">
              <div className="icon-box"><MapPin size={18} /></div>
              <address className="content">Vibe Bazzar Tech Park, Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103, India</address>
            </li>
            <li className="footer-nav-item flex">
              <div className="icon-box"><Phone size={18} /></div>
              <a href="tel:18008898423" className="footer-nav-link">1800-889-VIBE (Toll-Free)</a>
            </li>
            <li className="footer-nav-item flex">
              <div className="icon-box"><Mail size={18} /></div>
              <a href="mailto:support@vibebazzar.com" className="footer-nav-link">support@vibebazzar.com</a>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src="/assets/images/payment.png"
                alt="payment method"
                className="payment-img"
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Powered by Razorpay (UPI, RuPay, Cards &amp; NetBanking)
              </span>
            </div>

            <button
              onClick={() => setActivePage('admin')}
              className="mac-btn-secondary"
              style={{ fontSize: 11, padding: '5px 12px', borderRadius: 9999, gap: 5 }}
              title="Open Admin Studio"
            >
              <ShieldCheck size={13} color="#0071e3" /> Admin Studio
            </button>
          </div>

          <p className="copyright">
            Copyright &copy; {new Date().getFullYear()} <b style={{ color: 'var(--vibe-primary)' }}>Vibe Bazzar</b> • India's Trend Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
