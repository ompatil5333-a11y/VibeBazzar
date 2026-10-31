import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react';

export const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartTotal,
    removeFromCart,
    updateQuantity,
    setIsCheckoutOpen,
    formatPrice
  } = useShop();

  if (!isCartOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-header-title">
            <ShoppingBag size={22} color="var(--vibe-primary)" />
            <h3>Your Shopping Bag ({cart.length})</h3>
          </div>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} color="var(--text-dim)" />
              <p>Your bag is currently empty.</p>
              <button
                className="cart-shop-btn"
                onClick={() => setIsCartOpen(false)}
              >
                Start Exploring Deals
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img
                    src={item.imageDefault}
                    alt={item.title}
                    className="cart-item-img"
                  />
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.title}</h4>
                    <p className="cart-item-price">
                      {formatPrice(item.price)} × {item.quantity} ={' '}
                      <b>{formatPrice(item.price * item.quantity)}</b>
                    </p>

                    <div className="cart-item-controls">
                      <div className="qty-box">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="qty-btn-mini"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="qty-num">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="qty-btn-mini"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Subtotal:</span>
              <span className="cart-total-price" style={{ fontSize: 20, fontWeight: 800 }}>
                {formatPrice(cartTotal)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '8px 0 14px', fontSize: 12, color: '#10b981' }}>
              <ShieldCheck size={16} />
              <span>Eligible for Free Delivery &amp; Razorpay Secured Checkout</span>
            </div>

            <button
              className="btn-checkout"
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            >
              Proceed to Checkout ({formatPrice(cartTotal)})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
