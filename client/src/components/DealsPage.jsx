import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Flame, Clock, Zap, Star, ShoppingBag, Eye } from 'lucide-react';

export const DealsPage = ({ products }) => {
  const { formatPrice, addToCart, openQuickView } = useShop();
  const [filterDiscount, setFilterDiscount] = useState('all');

  // Countdown clock for flash sale
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = products.filter((p) => p.originalPrice && p.originalPrice > p.price);

  return (
    <div className="hub-container">
      <div className="container">
        {/* Amazon Great Indian Festival / Flipkart Super Deals Banner */}
        <div className="deals-banner-strip">
          <div className="deals-banner-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Zap size={22} color="#fbbf24" fill="#fbbf24" />
              <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, color: '#fbbf24' }}>
                Vibe Bazzar Lightning Dhamaka
              </span>
            </div>
            <h2>Up to 70% Off On Trending Picks</h2>
            <p>Hurry! Flash discounts refreshed every 12 hours with Bank Offers & Instant Cashback.</p>
          </div>

          <div className="deals-timer-badge">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 4 }}>
              <Clock size={16} color="#fbbf24" />
              <span style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600 }}>Deals Expire In</span>
            </div>
            <div className="time-text">
              {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
            </div>
          </div>
        </div>

        {/* Deals Filter Tabs */}
        <div className="hub-header">
          <div className="hub-title-box">
            <h1>
              <Flame size={26} color="#ff4757" />
              Today's Lightning Deals ({dealProducts.length} Offers)
            </h1>
            <p>Hand-curated top-rated products with genuine Indian Festive discounts.</p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'jackets', 'watches', 'footwear'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterDiscount(type)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: '1px solid var(--border-glass)',
                  background: filterDiscount === type ? 'var(--vibe-primary)' : 'var(--bg-pill)',
                  color: filterDiscount === type ? '#fff' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {type === 'all' ? 'All Lightning Deals' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Deals Product Grid */}
        <div className="product-grid">
          {dealProducts
            .filter((p) => filterDiscount === 'all' || p.category.toLowerCase().includes(filterDiscount))
            .map((item) => {
              const discountPercent = Math.round(
                ((item.originalPrice - item.price) / item.originalPrice) * 100
              );

              return (
                <div className="showcase" key={item.id}>
                  <div className="showcase-banner">
                    <img
                      src={item.imageDefault}
                      alt={item.title}
                      width="300"
                      className="product-img default"
                    />

                    <p className="showcase-badge angle pink" style={{ background: '#ff4757', color: '#fff' }}>
                      {discountPercent}% OFF
                    </p>

                    <div className="showcase-actions">
                      <button
                        className="btn-action"
                        onClick={() => openQuickView(item)}
                        title="Quick View"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="btn-action"
                        onClick={() => addToCart(item)}
                        title="Add to Cart"
                      >
                        <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="showcase-content">
                    <span className="showcase-category">{item.category}</span>
                    <h3
                      className="showcase-title"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openQuickView(item)}
                    >
                      {item.title}
                    </h3>

                    <div className="showcase-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < Math.floor(item.rating || 5) ? '#ffb703' : '#ddd'}
                          color={i < Math.floor(item.rating || 5) ? '#ffb703' : '#ddd'}
                        />
                      ))}
                    </div>

                    <div className="price-box">
                      <p className="price">{formatPrice(item.price)}</p>
                      <del>{formatPrice(item.originalPrice)}</del>
                    </div>

                    <button
                      className="add-cart-btn"
                      onClick={() => addToCart(item)}
                      style={{ width: '100%', marginTop: 12, padding: '8px 0', fontSize: 13 }}
                    >
                      Claim Deal
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
