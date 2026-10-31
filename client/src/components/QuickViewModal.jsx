import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Star, ShoppingBag, Plus, Minus, Zap } from 'lucide-react';

export const QuickViewModal = () => {
  const { quickViewProduct, closeQuickView, addToCart, buyNow, formatPrice } = useShop();
  const [qty, setQty] = useState(1);

  if (!quickViewProduct) return null;

  const handleAdd = () => {
    addToCart(quickViewProduct, qty);
    closeQuickView();
  };

  const handleBuy = () => {
    closeQuickView();
    buyNow(quickViewProduct, qty);
  };

  return (
    <div className="quickview-overlay" onClick={closeQuickView}>
      <div className="quickview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeQuickView} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="quickview-grid">
          <div className="quickview-image-container">
            <img
              src={quickViewProduct.imageDefault}
              alt={quickViewProduct.title}
              className="quickview-img"
            />
          </div>

          <div className="quickview-details">
            <span className="quickview-category">{quickViewProduct.category}</span>
            <h2 className="quickview-title">{quickViewProduct.title}</h2>

            <div className="quickview-rating">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.floor(quickViewProduct.rating || 5) ? '#ffb703' : '#ddd'}
                  color={i < Math.floor(quickViewProduct.rating || 5) ? '#ffb703' : '#ddd'}
                />
              ))}
              <span className="rating-count">({quickViewProduct.ratingCount || 120} verified reviews)</span>
            </div>

            <div className="price-box">
              <span className="price" style={{ fontSize: 24, fontWeight: 800 }}>
                {formatPrice(quickViewProduct.price)}
              </span>
              {quickViewProduct.originalPrice && (
                <del className="original-price" style={{ fontSize: 16, marginLeft: 8 }}>
                  {formatPrice(quickViewProduct.originalPrice)}
                </del>
              )}
            </div>

            <p className="quickview-desc">
              {quickViewProduct.description ||
                'Crafted with premium materials engineered to deliver exceptional durability and modern Indian aesthetic.'}
            </p>

            <div className="quickview-actions">
              <div className="qty-selector">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="qty-btn"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="qty-value">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="qty-btn"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                className="btn-add-cart-modal"
                onClick={handleAdd}
                style={{
                  background: 'var(--bg-pill)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>

              <button
                className="btn-add-cart-modal"
                onClick={handleBuy}
                style={{
                  background: 'var(--vibe-gradient)',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 4px 14px var(--vibe-accent-glow)'
                }}
              >
                <Zap size={18} />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
