import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  Flame,
  Truck,
  HelpCircle,
  LogOut,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';

export const Header = () => {
  const {
    user,
    logout,
    setIsAuthModalOpen,
    setAuthMode,
    cartCount,
    wishlistCount,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    theme,
    toggleTheme,
    currency,
    setCurrency,
    activePage,
    setActivePage
  } = useShop();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en-IN');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="header-wrapper">
      {/* 1. Header Top */}
      <div className="header-top">
        <div className="container">
          <ul className="header-social-container">
            <li>
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={15} />
              </a>
            </li>
            <li>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={15} />
              </a>
            </li>
            <li>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram size={15} />
              </a>
            </li>
            <li>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <Linkedin size={15} />
              </a>
            </li>
          </ul>

          <div className="header-alert-news">
            <p>
              <b>⚡ Great Indian Vibe Sale</b> • Free Express Delivery on Orders Over ₹499
            </p>
          </div>

          <div className="header-top-actions">
            {/* Currency Selector (INR Default) */}
            <select
              name="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="header-select"
              title="Select Currency"
            >
              <option value="INR">INR ₹ (Default)</option>
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
            </select>

            {/* Language Selector */}
            <select
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="header-select"
              title="Select Language"
            >
              <option value="en-IN">English (IN)</option>
              <option value="hi-IN">हिंदी (Hindi)</option>
              <option value="bn-IN">বাংলা (Bengali)</option>
              <option value="ta-IN">தமிழ் (Tamil)</option>
            </select>

            {/* macOS / iOS Glass Theme Switcher next to Language Switcher */}
            <button
              className="theme-switcher-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              <span className="theme-icon">
                {theme === 'dark' ? (
                  <Sun size={15} color="#ffa502" />
                ) : (
                  <Moon size={15} color="#475569" />
                )}
              </span>
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Header Main */}
      <div className="header-main">
        <div className="container">
          {/* Vibe Bazzar Logo with 3D Cart Icon */}
          <div
            className="vibe-brand-logo"
            onClick={() => {
              setActivePage('home');
              setSelectedCategory('all');
            }}
          >
            <img
              src="/assets/images/logo/vibe-3d-logo.jpg"
              alt="Vibe Bazzar"
              className="vibe-brand-img"
            />
            <div className="vibe-brand-text">
              <span className="vibe-brand-title">Vibe Bazzar</span>
              <span className="vibe-brand-subtitle">India's Trend Hub</span>
            </div>
          </div>

          {/* Search Capsule */}
          <div className="header-search-container">
            <input
              type="search"
              name="search"
              className="search-field"
              placeholder="Search for fashion, smartwatches, footwear, cosmetics..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activePage !== 'home') setActivePage('home');
              }}
            />
            <button
              className="search-btn"
              aria-label="Search"
              onClick={() => {
                if (activePage !== 'home') setActivePage('home');
              }}
            >
              <Search size={16} />
            </button>
          </div>

          {/* Actions: Account, Orders, Wishlist, Cart */}
          <div className="header-user-actions" style={{ position: 'relative' }}>
            {/* User Profile / Auth Toggle Button */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  className="action-btn"
                  title={`Logged in as ${user.fullName || user.username}`}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    background: 'var(--vibe-gradient)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 13
                  }}
                >
                  {(user.fullName || user.username || 'U')[0].toUpperCase()}
                </button>

                {profileDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 48,
                      width: 220,
                      background: 'var(--bg-surface-elevated)',
                      backdropFilter: 'var(--glass-blur)',
                      borderRadius: 14,
                      padding: 14,
                      boxShadow: 'var(--glass-shadow)',
                      border: '1px solid var(--border-glass)',
                      zIndex: 200
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>
                      {user.fullName || user.username}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, wordBreak: 'break-all' }}>
                      {user.email}
                    </p>
                    <button
                      onClick={() => {
                        setActivePage('orders');
                        setProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: 'var(--bg-pill)',
                        border: 'none',
                        color: 'var(--text-main)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginBottom: 6
                      }}
                    >
                      📦 My Orders
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="action-btn"
                title="Sign In / Register"
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
              >
                <User size={20} />
              </button>
            )}

            <button
              className="action-btn"
              title="Track Orders (Amazon/Flipkart style)"
              onClick={() => setActivePage('orders')}
            >
              <Truck size={20} />
            </button>

            <button
              className="action-btn"
              title="Wishlist"
              onClick={() => setActivePage('wishlist')}
            >
              <Heart size={20} />
              <span className="count">{wishlistCount}</span>
            </button>

            <button
              className="action-btn"
              title="Shopping Cart"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={20} />
              <span className="count">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Desktop Navigation Menu */}
      <nav className="desktop-navigation-menu">
        <div className="container">
          <ul className="desktop-menu-category-list">
            <li className="menu-category">
              <span
                className={`menu-title ${activePage === 'home' && selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setActivePage('home');
                  setSelectedCategory('all');
                }}
              >
                Home
              </span>
            </li>

            <li className="menu-category">
              <span
                className={`menu-title ${activePage === 'deals' ? 'active' : ''}`}
                onClick={() => setActivePage('deals')}
              >
                <Flame size={15} color="#ff4757" style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Today's Deals
                <span className="badge-tag">HOT</span>
              </span>
            </li>

            <li className="menu-category">
              <span
                className={`menu-title ${activePage === 'home' && selectedCategory !== 'all' ? 'active' : ''}`}
              >
                Categories
              </span>
              <div className="dropdown-panel">
                <ul className="dropdown-panel-list">
                  <li className="menu-title">Electronics & Wearables</li>
                  <li className="panel-list-item">
                    <a onClick={() => { setActivePage('home'); setSelectedCategory('watches'); }}>
                      Smartwatches (AMOLED)
                    </a>
                  </li>
                  <li className="panel-list-item">
                    <a onClick={() => { setActivePage('home'); setSelectedCategory('watches'); }}>
                      Bluetooth Calling Watches
                    </a>
                  </li>
                  <li className="panel-list-item">
                    <img src="/assets/images/electronics-banner-1.jpg" alt="headphone" width="250" height="119" style={{ borderRadius: 8 }} />
                  </li>
                </ul>

                <ul className="dropdown-panel-list">
                  <li className="menu-title">Men's Fashion</li>
                  <li className="panel-list-item">
                    <a onClick={() => { setActivePage('home'); setSelectedCategory('shirt'); }}>
                      Pure Cotton Shirts
                    </a>
                  </li>
                  <li className="panel-list-item">
                    <a onClick={() => { setActivePage('home'); setSelectedCategory('jacket'); }}>
                      Winter Bomber Jackets
                    </a>
                  </li>
                  <li className="panel-list-item">
                    <img src="/assets/images/mens-banner.jpg" alt="mens fashion" width="250" height="119" style={{ borderRadius: 8 }} />
                  </li>
                </ul>

                <ul className="dropdown-panel-list">
                  <li className="menu-title">Women's Fashion</li>
                  <li className="panel-list-item">
                    <a onClick={() => { setActivePage('home'); setSelectedCategory('clothes'); }}>
                      Festive Kurta & Anarkali
                    </a>
                  </li>
                  <li className="panel-list-item">
                    <a onClick={() => { setActivePage('home'); setSelectedCategory('jewellery'); }}>
                      Rose Gold Earrings
                    </a>
                  </li>
                  <li className="panel-list-item">
                    <img src="/assets/images/womens-banner.jpg" alt="womens fashion" width="250" height="119" style={{ borderRadius: 8 }} />
                  </li>
                </ul>
              </div>
            </li>

            <li className="menu-category">
              <span
                className={`menu-title ${activePage === 'orders' ? 'active' : ''}`}
                onClick={() => setActivePage('orders')}
              >
                Track Orders
              </span>
            </li>

            <li className="menu-category">
              <span
                className={`menu-title ${activePage === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActivePage('wishlist')}
              >
                Saved Wishlist
              </span>
            </li>

            <li className="menu-category">
              <span
                className={`menu-title ${activePage === 'support' ? 'active' : ''}`}
                onClick={() => setActivePage('support')}
              >
                <HelpCircle size={15} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                24x7 Customer Care
              </span>
            </li>
          </ul>
        </div>
      </nav>

      {/* 4. Mobile Bottom Navigation Dock */}
      <div className="mobile-bottom-navigation">
        <button
          className="action-btn"
          onClick={() => {
            setActivePage('home');
            setSelectedCategory('all');
          }}
          aria-label="Home"
        >
          <Sparkles size={20} />
        </button>

        <button
          className="action-btn"
          onClick={() => setActivePage('deals')}
          aria-label="Deals"
        >
          <Flame size={20} color="#ff4757" />
        </button>

        <button
          className="action-btn"
          onClick={() => setActivePage('orders')}
          aria-label="Orders"
        >
          <Truck size={20} />
        </button>

        <button
          className="action-btn"
          onClick={() => setActivePage('wishlist')}
          aria-label="Wishlist"
        >
          <Heart size={20} />
          <span className="count">{wishlistCount}</span>
        </button>

        <button
          className="action-btn"
          onClick={() => setIsCartOpen(true)}
          aria-label="Cart"
        >
          <ShoppingBag size={20} />
          <span className="count">{cartCount}</span>
        </button>
      </div>
    </header>
  );
};
