import React from 'react';
import { useShop } from '../context/ShopContext';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export const WishlistPage = () => {
  const { wishlist, removeFromCart, addToCart, toggleWishlist, formatPrice, setActivePage } = useShop();

  return (
    <div className="hub-container">
      <div className="container">
        <div className="hub-header">
          <div className="hub-title-box">
            <h1>
              <Heart size={28} color="#ff4757" fill="#ff4757" />
              My Saved Wishlist ({wishlist.length} Items)
            </h1>
            <p>Save items for later, monitor price drops, and move straight to checkout (Amazon style).</p>
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
            ← Continue Shopping
          </button>
        </div>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-glass)' }}>
            <Heart size={56} color="var(--text-dim)" style={{ margin: '0 auto 15px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Your Wishlist is Empty</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              Found something you love? Tap the heart icon on any product to save it here.
            </p>
            <button
              onClick={() => setActivePage('home')}
              className="btn-checkout"
              style={{ maxWidth: 220, margin: '0 auto', display: 'block' }}
            >
              Explore Vibe Bazzar
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {wishlist.map((item) => (
              <div className="showcase" key={item.id}>
                <div className="showcase-banner">
                  <img
                    src={item.imageDefault}
                    alt={item.title}
                    width="300"
                    className="product-img default"
                  />

                  <div className="showcase-actions">
                    <button
                      className="btn-action"
                      onClick={() => toggleWishlist(item)}
                      title="Remove from Wishlist"
                      style={{ color: '#ff4d4f' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="showcase-content">
                  <span className="showcase-category">{item.category}</span>
                  <h3 className="showcase-title">{item.title}</h3>

                  <div className="price-box">
                    <p className="price">{formatPrice(item.price)}</p>
                    {item.originalPrice && <del>{formatPrice(item.originalPrice)}</del>}
                  </div>

                  <p style={{ fontSize: 12, color: '#10b981', fontWeight: 600, margin: '6px 0 12px' }}>
                    ● In Stock - Ready to Dispatch
                  </p>

                  <button
                    className="add-cart-btn"
                    onClick={() => {
                      addToCart(item);
                      toggleWishlist(item);
                    }}
                    style={{ width: '100%', padding: '9px 0', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <ShoppingBag size={16} />
                    Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
