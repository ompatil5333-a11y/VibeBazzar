import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Heart, Eye, ShoppingBag, Star, Sparkles, Zap } from 'lucide-react';

export const ProductGrid = ({ products }) => {
  const {
    addToCart,
    buyNow,
    toggleWishlist,
    isInWishlist,
    openQuickView,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    formatPrice
  } = useShop();

  const [hoveredId, setHoveredId] = useState(null);

  const filtered = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="product-main" id="products-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 className="title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Sparkles size={18} color="var(--vibe-primary)" />
            {selectedCategory === 'all' ? 'Trending Products' : `${selectedCategory.toUpperCase()} Collection`}
            {searchQuery && ` (Matching "${searchQuery}")`}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Showing {filtered.length} products curated for Indian festive &amp; daily trends
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'var(--bg-pill)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Show All Products
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No products found matching your search.</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="btn-checkout"
            style={{ maxWidth: 200, margin: '15px auto 0' }}
          >
            View All Collection
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((item) => {
            const inWishlist = isInWishlist(item.id);
            const isHovered = hoveredId === item.id;
            const currentImg =
              isHovered && item.imageHover ? item.imageHover : item.imageDefault;

            return (
              <div
                className="showcase"
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="showcase-banner">
                  <img
                    src={currentImg}
                    alt={item.title}
                    width="300"
                    className="product-img default"
                  />

                  {item.badge && (
                    <p className={`showcase-badge ${item.badge.toLowerCase().includes('new') || item.badge.toLowerCase().includes('hot') ? 'angle pink' : 'angle black'}`}>
                      {item.badge}
                    </p>
                  )}

                  <div className="showcase-actions">
                    <button
                      className="btn-action"
                      onClick={() => toggleWishlist(item)}
                      title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      style={{ color: inWishlist ? '#ff4d4f' : 'inherit' }}
                    >
                      <Heart size={16} fill={inWishlist ? '#ff4d4f' : 'none'} />
                    </button>

                    <button
                      className="btn-action"
                      onClick={() => openQuickView(item)}
                      title="Quick View"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                <div className="showcase-content">
                  <span
                    className="showcase-category"
                    style={{ cursor: 'pointer', textTransform: 'capitalize' }}
                    onClick={() => setSelectedCategory(item.category)}
                  >
                    {item.category}
                  </span>

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
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 4 }}>
                      ({item.ratingCount || 45})
                    </span>
                  </div>

                  <div className="price-box">
                    <p className="price">{formatPrice(item.price)}</p>
                    {item.originalPrice && <del>{formatPrice(item.originalPrice)}</del>}
                  </div>

                  {/* Dual Action Buttons: Add to Cart AND Buy Now */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    <button
                      onClick={() => addToCart(item)}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: 8,
                        border: '1px solid var(--border-glass)',
                        background: 'var(--bg-pill)',
                        color: 'var(--text-main)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        transition: 'all 0.2s ease'
                      }}
                      title="Add to Shopping Cart"
                    >
                      <ShoppingBag size={14} />
                      Add to Cart
                    </button>

                    <button
                      onClick={() => buyNow(item)}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'var(--vibe-gradient)',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        boxShadow: '0 2px 8px var(--vibe-accent-glow)',
                        transition: 'all 0.2s ease'
                      }}
                      title="1-Click Instant Checkout"
                    >
                      <Zap size={14} />
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
