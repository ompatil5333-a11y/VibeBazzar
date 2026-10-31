import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Zap } from 'lucide-react';

export const ProductMinimal = ({ products }) => {
  const { addToCart, buyNow, openQuickView, formatPrice } = useShop();

  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
  const trending = products.filter((p) => p.isTrending).slice(0, 4);
  const topRated = products.filter((p) => p.isTopRated).slice(0, 4);

  const renderSection = (title, items) => (
    <div className="product-showcase">
      <h2 className="title">{title}</h2>

      <div className="showcase-wrapper has-scrollbar">
        <div className="showcase-container">
          {items.map((item) => (
            <div className="showcase" key={item.id}>
              <div
                className="showcase-img-box"
                style={{ cursor: 'pointer' }}
                onClick={() => openQuickView(item)}
              >
                <img
                  src={item.imageDefault}
                  alt={item.title}
                  width="70"
                  className="showcase-img"
                />
              </div>

              <div className="showcase-content">
                <span
                  className="showcase-category"
                  style={{ textTransform: 'capitalize' }}
                >
                  {item.category}
                </span>

                <h4
                  className="showcase-title"
                  style={{ cursor: 'pointer' }}
                  onClick={() => openQuickView(item)}
                >
                  {item.title}
                </h4>

                <div className="price-box">
                  <p className="price">{formatPrice(item.price)}</p>
                  {item.originalPrice && <del>{formatPrice(item.originalPrice)}</del>}
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button
                    className="add-cart-mini-btn"
                    onClick={() => addToCart(item)}
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-main)',
                      background: 'var(--bg-pill)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    + Cart
                  </button>

                  <button
                    className="add-cart-mini-btn"
                    onClick={() => buyNow(item)}
                    style={{
                      fontSize: '11px',
                      color: '#fff',
                      background: 'var(--vibe-gradient)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="product-minimal">
      {renderSection('New Arrivals', newArrivals.length > 0 ? newArrivals : products.slice(0, 4))}
      {renderSection('Trending Now', trending.length > 0 ? trending : products.slice(4, 8))}
      {renderSection('Top Rated Picks', topRated.length > 0 ? topRated : products.slice(2, 6))}
    </div>
  );
};
