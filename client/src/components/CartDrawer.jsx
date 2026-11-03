import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, Tag, Truck, Sparkles } from 'lucide-react';

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

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isFreeDelivery = cartTotal >= 499;

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>

        {/* ── macOS-style Title Bar ── */}
        <div className="cart-titlebar">
          <div className="cart-traffic-lights">
            <button
              className="cart-dot cart-dot-red"
              onClick={() => setIsCartOpen(false)}
              title="Close"
              aria-label="Close cart"
            />
            <span className="cart-dot cart-dot-yellow" />
            <span className="cart-dot cart-dot-green" />
          </div>
          <span className="cart-window-title">Shopping Bag</span>
          <span className="cart-item-count-badge">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* ── Delivery Banner ── */}
        <div className={`cart-delivery-banner ${isFreeDelivery ? 'cart-delivery-free' : 'cart-delivery-pending'}`}>
          <Truck size={14} />
          {isFreeDelivery
            ? '🎉 You qualify for Free Delivery!'
            : `Add ${formatPrice(499 - cartTotal)} more for Free Delivery`}
        </div>

        {/* ── Cart Body ── */}
        <div className="cart-body">
          {cart.length === 0 ? (
            /* ── Empty State ── */
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <ShoppingBag size={40} />
              </div>
              <h4 className="cart-empty-title">Your bag is empty</h4>
              <p className="cart-empty-sub">Add items you love to your shopping bag</p>
              <button
                className="cart-shop-btn"
                onClick={() => setIsCartOpen(false)}
              >
                <Sparkles size={14} />
                Start Exploring Deals
              </button>
            </div>
          ) : (
            /* ── Item List ── */
            <div className="cart-items-list">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  {/* Product Image */}
                  <div className="cart-item-img-wrap">
                    <img
                      src={item.imageDefault}
                      alt={item.title}
                      className="cart-item-img"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=IMG'; }}
                    />
                  </div>

                  {/* Details */}
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.title}</h4>

                    {item.category && (
                      <span className="cart-item-category">
                        <Tag size={9} /> {item.category}
                      </span>
                    )}

                    <p className="cart-item-price">
                      {formatPrice(item.price)}{' '}
                      <span className="cart-price-times">× {item.quantity}</span>{' '}
                      <span className="cart-price-eq">=</span>{' '}
                      <b>{formatPrice(item.price * item.quantity)}</b>
                    </p>

                    {/* Controls Row */}
                    <div className="cart-item-controls">
                      <div className="qty-box">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="qty-btn-mini"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="qty-num">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="qty-btn-mini"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sticky Footer ── */}
        {cart.length > 0 && (
          <div className="cart-footer">
            {/* Savings / Trust Row */}
            <div className="cart-trust-row">
              <ShieldCheck size={13} />
              <span>Razorpay Secured &amp; Encrypted Checkout</span>
            </div>

            {/* Subtotal */}
            <div className="cart-subtotal">
              <div className="cart-subtotal-left">
                <span className="cart-subtotal-label">Subtotal</span>
                <span className="cart-subtotal-items">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
              </div>
              <span className="cart-total-price">{formatPrice(cartTotal)}</span>
            </div>

            {/* Checkout Button */}
            <button
              className="cart-checkout-btn"
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            >
              <span className="cart-checkout-btn-label">Proceed to Checkout</span>
              <span className="cart-checkout-btn-price">{formatPrice(cartTotal)}</span>
            </button>

            <p className="cart-footer-note">
              Taxes and shipping calculated at checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
