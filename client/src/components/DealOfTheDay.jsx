import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Star, Zap, ShoppingBag, ArrowRight } from 'lucide-react';

export const DealOfTheDay = ({ product }) => {
  const { addToCart, buyNow, openQuickView, formatPrice } = useShop();

  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 14,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dealProduct = product || {
    id: 11,
    title: 'Ayurvedic Argan Oil & Keratin Hair Spa Combo (3-Pack)',
    price: 899.00,
    originalPrice: 1999.00,
    rating: 5,
    stock: 80,
    sold: 64,
    imageDefault: '/assets/images/products/shampoo.jpg',
    description: 'Complete organic hair transformation kit infused with Moroccan Argan, Bhringraj, and Biotin to fight frizz and restore radiant shine.'
  };

  const soldCount = dealProduct.sold || 64;
  const availableCount = dealProduct.stock || 80;
  const total = soldCount + availableCount;
  const percentage = Math.round((soldCount / total) * 100);

  return (
    <div className="product-featured" id="deal-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}>
        <Zap size={20} color="#ff4757" fill="#ff4757" />
        <h2 className="title" style={{ margin: 0 }}>Deal of the Day</h2>
      </div>

      <div className="showcase-wrapper has-scrollbar">
        <div className="showcase-container">
          <div className="showcase">
            <div
              className="showcase-banner"
              style={{ cursor: 'pointer' }}
              onClick={() => openQuickView(dealProduct)}
            >
              <img
                src={dealProduct.imageDefault}
                alt={dealProduct.title}
                className="showcase-img"
              />
            </div>

            <div className="showcase-content">
              <div className="showcase-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#ffb703" color="#ffb703" />
                ))}
              </div>

              <h3
                className="showcase-title"
                style={{ cursor: 'pointer' }}
                onClick={() => openQuickView(dealProduct)}
              >
                {dealProduct.title}
              </h3>

              <p className="showcase-desc">{dealProduct.description}</p>

              <div className="price-box">
                <p className="price">{formatPrice(dealProduct.price)}</p>
                {dealProduct.originalPrice && <del>{formatPrice(dealProduct.originalPrice)}</del>}
              </div>

              {/* Action Buttons: Add to Cart and Buy Now */}
              <div style={{ display: 'flex', gap: 10, margin: '14px 0' }}>
                <button
                  className="add-cart-btn"
                  onClick={() => addToCart(dealProduct)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: 'var(--bg-pill)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-glass)',
                    boxShadow: 'none',
                    fontWeight: 600
                  }}
                >
                  <ShoppingBag size={16} />
                  Add to Cart
                </button>

                <button
                  className="add-cart-btn"
                  onClick={() => buyNow(dealProduct)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    background: 'var(--vibe-gradient)',
                    color: '#fff',
                    fontWeight: 700
                  }}
                >
                  <Zap size={16} />
                  Buy Now
                </button>
              </div>

              <div className="showcase-status">
                <div className="wrapper">
                  <p>
                    Already claimed: <b>{soldCount}</b>
                  </p>
                  <p>
                    Available stock: <b>{availableCount}</b>
                  </p>
                </div>

                <div className="showcase-status-bar" style={{ background: 'var(--border-subtle)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: 'var(--vibe-gradient)',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              <div className="countdown-box">
                <p className="countdown-desc" style={{ color: 'var(--text-muted)' }}>Offer Ends In:</p>

                <div className="countdown">
                  <div className="countdown-content">
                    <p className="display-number">{timeLeft.days}</p>
                    <p className="display-text">Days</p>
                  </div>

                  <div className="countdown-content">
                    <p className="display-number">{String(timeLeft.hours).padStart(2, '0')}</p>
                    <p className="display-text">Hours</p>
                  </div>

                  <div className="countdown-content">
                    <p className="display-number">{String(timeLeft.minutes).padStart(2, '0')}</p>
                    <p className="display-text">Min</p>
                  </div>

                  <div className="countdown-content">
                    <p className="display-number">{String(timeLeft.seconds).padStart(2, '0')}</p>
                    <p className="display-text">Sec</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
