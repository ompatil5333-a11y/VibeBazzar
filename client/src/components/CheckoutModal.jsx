import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { X, CheckCircle, CreditCard, ShieldCheck, Truck, Zap } from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const CheckoutModal = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, cartTotal, clearCart, formatPrice, user } = useShop();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    paymentMethod: 'cash_on_delivery'
  });

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [error, setError] = useState(null);

  // Auto-fill logged in user information
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.fullName || user.username || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address
      }));
    }
  }, [user, isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCashOnDelivery = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user ? user.id : null,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          shippingAddress: `${form.address}, ${form.city} ${form.zip}`,
          items: cart,
          totalAmount: cartTotal,
          paymentMethod: 'cash_on_delivery'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderComplete(data.order);
        clearCart();
      } else {
        setError(data.message || 'Failed to place order.');
      }
    } catch (err) {
      setError('Cannot connect to order server: ' + err.message);
    }
  };

  const handleRazorpayPayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      // Fallback to cash on delivery simulation if script blocked
      setError('Razorpay script could not be loaded. Please choose Cash on Delivery.');
      return;
    }

    // 1. Create Razorpay order on backend in INR
    const orderRes = await fetch('/api/payment/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: cartTotal,
        currency: 'INR'
      })
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.success) {
      setError(orderData.message || 'Failed to initialize Razorpay payment gateway.');
      return;
    }

    // 2. Launch Razorpay Checkout Modal
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Vibe Bazzar',
      description: 'Order Checkout (India)',
      order_id: orderData.orderId,
      image: '/assets/images/logo/favicon.ico',
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone
      },
      theme: {
        color: '#ff4757'
      },
      handler: async (response) => {
        try {
          await fetch('/api/payment/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          // Save final order in Supabase PostgreSQL
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user ? user.id : null,
              customerName: form.name,
              customerEmail: form.email,
              customerPhone: form.phone,
              shippingAddress: `${form.address}, ${form.city} ${form.zip}`,
              items: cart,
              totalAmount: cartTotal,
              paymentMethod: 'razorpay'
            })
          });

          const data = await res.json();
          if (res.ok && data.success) {
            setOrderComplete({
              ...data.order,
              paymentId: response.razorpay_payment_id
            });
            clearCart();
          }
        } catch (postErr) {
          setError('Payment succeeded but order recording failed: ' + postErr.message);
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (form.paymentMethod === 'razorpay') {
        await handleRazorpayPayment();
      } else {
        await handleCashOnDelivery();
      }
    } catch (err) {
      setError(err.message || 'Payment processing error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderComplete(null);
  };

  return (
    <div className="checkout-overlay" onClick={handleClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>
          <X size={20} />
        </button>

        {orderComplete ? (
          <div className="order-success-view">
            <CheckCircle size={64} color="#10b981" />
            <h2>Order Placed Successfully!</h2>
            <p className="order-id-tag">
              Order ID: <b>{orderComplete.id}</b>
            </p>
            {orderComplete.paymentId && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Razorpay Payment Ref: <b>{orderComplete.paymentId}</b>
              </p>
            )}
            <p className="order-success-desc">
              Thank you, <b>{orderComplete.customerName}</b>. Your order has been recorded into Supabase PostgreSQL and dispatched to our warehouse!
            </p>

            <div className="order-summary-box">
              <p><b>Total Amount:</b> {formatPrice(orderComplete.totalAmount)}</p>
              <p><b>Payment Method:</b> {orderComplete.paymentMethod.toUpperCase()}</p>
              <p><b>Status:</b> {orderComplete.orderStatus}</p>
              <p><b>Estimated Delivery:</b> Within 24-48 Hours</p>
            </div>

            <button className="btn-continue-shopping" onClick={handleClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="checkout-content">
            <h2>Complete Your Order</h2>
            <p className="checkout-subtitle">Vibe Bazzar Express Checkout • Fast Dispatch</p>

            {error && <div className="checkout-error">{error}</div>}

            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number (for Courier SMS) *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="9689102662"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Street Address / Flat / Building *</label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="4GV3+M4R, Near Market"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Pungaon"
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input
                    type="text"
                    name="zip"
                    required
                    placeholder="425002"
                    value={form.zip}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="payment-method-section">
                <label className="section-label">Choose Payment Method</label>

                <div className="payment-options">
                  <label className={`payment-option ${form.paymentMethod === 'cash_on_delivery' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={form.paymentMethod === 'cash_on_delivery'}
                      onChange={handleChange}
                    />
                    <ShieldCheck size={20} color="#10b981" />
                    <div>
                      <div style={{ fontWeight: 700 }}>Cash on Delivery (Pay at Doorstep)</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Verified courier delivery across India</div>
                    </div>
                  </label>

                  <label className={`payment-option ${form.paymentMethod === 'razorpay' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={form.paymentMethod === 'razorpay'}
                      onChange={handleChange}
                    />
                    <CreditCard size={20} color="var(--vibe-primary)" />
                    <div>
                      <div style={{ fontWeight: 700 }}>Razorpay Secure (UPI, Cards, NetBanking)</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Test Key: rzp_test_TtQD9j8rwIQeBw</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="checkout-order-summary">
                <div className="summary-row">
                  <span>Items in Cart ({cart.length}):</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Charges:</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>FREE</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total Payable Amount:</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <button type="submit" className="btn-place-order" disabled={loading}>
                {loading
                  ? 'Placing Order...'
                  : form.paymentMethod === 'razorpay'
                  ? `Pay with Razorpay (${formatPrice(cartTotal)})`
                  : `Confirm Cash on Delivery Order (${formatPrice(cartTotal)})`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
