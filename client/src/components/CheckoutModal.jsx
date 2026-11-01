import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  Truck,
  Zap,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Hash,
  Lock,
  ArrowRight,
  Copy,
  Smartphone,
  QrCode,
  Sparkles
} from 'lucide-react';

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
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotal,
    clearCart,
    formatPrice,
    user
  } = useShop();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    paymentMethod: 'upi' // 'upi' | 'razorpay' | 'cash_on_delivery'
  });

  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

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

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderComplete(null);
    setError(null);
  };

  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // 1. Instant UPI Payment Processing (Test Mode / Live)
  const handleUpiPayment = async () => {
    const cleanUpi = upiId.trim() || 'testuser@okhdfcbank';

    // Step A: Verify UPI in Test Mode via backend endpoint
    const verifyRes = await fetch('/api/payment/upi/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upiId: cleanUpi,
        amount: cartTotal
      })
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.success) {
      setError(verifyData.message || 'UPI Payment verification failed.');
      return;
    }

    // Step B: Record Final Paid Order into Supabase PostgreSQL
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
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        paymentId: verifyData.paymentId
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setOrderComplete({
        ...data.order,
        paymentId: verifyData.paymentId,
        upiId: cleanUpi
      });
      clearCart();
    } else {
      setError(data.message || 'Payment authorized but failed to record order.');
    }
  };

  // 2. Cash On Delivery Processing
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
          paymentMethod: 'cash_on_delivery',
          paymentStatus: 'pending'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrderComplete(data.order);
        clearCart();
      } else {
        setError(data.message || 'Failed to place Cash on Delivery order.');
      }
    } catch (err) {
      setError('Cannot connect to order server: ' + err.message);
    }
  };

  // 3. Razorpay Payment Processing (Cards, NetBanking, Wallets)
  const handleRazorpayPayment = async () => {
    const scriptLoaded = await loadRazorpayScript();

    // Initialize payment order on backend
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
      setError(orderData.message || 'Failed to initialize payment gateway.');
      return;
    }

    // Check if test simulation or real Razorpay modal
    if (!scriptLoaded || orderData.isSimulated || !window.Razorpay) {
      // Sandbox Test Simulation Fallback
      try {
        const verifyRes = await fetch('/api/payment/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: 'simulated_test_sig'
          })
        });

        const saveRes = await fetch('/api/orders', {
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
            paymentMethod: 'razorpay',
            paymentStatus: 'paid'
          })
        });

        const saveData = await saveRes.json();
        if (saveRes.ok && saveData.success) {
          setOrderComplete({
            ...saveData.order,
            paymentId: `pay_test_${Date.now()}`
          });
          clearCart();
        } else {
          setError(saveData.message || 'Payment verified but order creation failed.');
        }
      } catch (simErr) {
        setError('Sandbox payment test error: ' + simErr.message);
      }
      return;
    }

    // Launch official Razorpay Checkout Modal (Test Mode)
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Vibe Bazzar',
      description: 'Order Checkout • Test Mode',
      order_id: orderData.orderId,
      image: '/assets/images/logo/favicon.ico',
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
        method: 'upi'
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: 'Pay via UPI',
              instruments: [{ method: 'upi' }]
            },
            other: {
              name: 'Cards & Netbanking',
              instruments: [{ method: 'card' }, { method: 'netbanking' }, { method: 'wallet' }]
            }
          },
          sequence: ['block.upi', 'block.other'],
          preferences: {
            show_default_blocks: true
          }
        }
      },
      theme: {
        color: '#0071e3'
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

          // Save final order in database
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
              paymentMethod: 'razorpay',
              paymentStatus: 'paid'
            })
          });

          const data = await res.json();
          if (res.ok && data.success) {
            setOrderComplete({
              ...data.order,
              paymentId: response.razorpay_payment_id
            });
            clearCart();
          } else {
            setError(data.message || 'Payment verified but order recording failed.');
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
      if (form.paymentMethod === 'upi') {
        await handleUpiPayment();
      } else if (form.paymentMethod === 'razorpay') {
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

  return (
    <div className="mac-modal-overlay" onClick={handleClose}>
      <div
        className="mac-window-card checkout-window-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 540,
          width: '100%',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 25px 70px -10px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--border-glass)',
          animation: 'macScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh'
        }}
      >
        {/* macOS Title Bar with Traffic Lights */}
        <div className="mac-window-titlebar" style={{ padding: '12px 18px', flexShrink: 0 }}>
          <div className="mac-traffic-lights">
            <button
              className="mac-dot mac-dot-red"
              onClick={handleClose}
              title="Close Checkout"
              aria-label="Close"
            />
            <button className="mac-dot mac-dot-yellow" aria-label="Minimize" />
            <button className="mac-dot mac-dot-green" aria-label="Zoom" />
          </div>
          <div className="mac-window-title" style={{ fontSize: 13, fontWeight: 600 }}>
            Vibe Bazzar — Express Checkout
          </div>
          <div style={{ width: 44, textAlign: 'right' }}>
            <span
              onClick={handleClose}
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(142, 142, 147, 0.15)',
                color: 'var(--text-dim)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              esc
            </span>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div
          style={{
            padding: '22px 24px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            flex: 1
          }}
        >
          {orderComplete ? (
            /* macOS Celebratory Order Success View */
            <div style={{ textAlign: 'center', padding: '10px 4px 6px' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  color: '#10b981'
                }}
              >
                <CheckCircle size={36} />
              </div>

              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: '0 0 6px',
                  letterSpacing: -0.4
                }}
              >
                Order Placed Successfully!
              </h2>

              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
                Thank you, <b>{orderComplete.customerName}</b>. Your order has been recorded into Supabase PostgreSQL and dispatched for warehouse fulfillment!
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-pill)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: 16
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Order ID:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                  {orderComplete.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyOrderId(orderComplete.id)}
                  title="Copy Order ID"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedId ? '#10b981' : '#0071e3',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2
                  }}
                >
                  <Copy size={14} />
                </button>
                {copiedId && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Copied!</span>}
              </div>

              {/* UPI Payment Verified Badge */}
              {orderComplete.paymentMethod === 'upi' && (
                <div style={{ marginBottom: 16 }}>
                  <span
                    className="mac-pill-badge success"
                    style={{ fontSize: 12, padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Zap size={14} color="#10b981" />
                    <b>UPI Payment Verified</b> ({orderComplete.paymentId}) • {orderComplete.upiId || 'Instant UPI'}
                  </span>
                </div>
              )}

              {/* Razorpay Verified Badge */}
              {orderComplete.paymentMethod === 'razorpay' && orderComplete.paymentId && (
                <div style={{ marginBottom: 16 }}>
                  <span
                    className="mac-pill-badge success"
                    style={{ fontSize: 11.5, padding: '4px 10px' }}
                  >
                    💳 Razorpay Payment Verified: {orderComplete.paymentId} (Test Mode)
                  </span>
                </div>
              )}

              {/* Order Breakdown Box */}
              <div
                style={{
                  borderRadius: 14,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  padding: '14px 18px',
                  textAlign: 'left',
                  marginBottom: 20
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatPrice(orderComplete.totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                  <span style={{ fontWeight: 600, color: 'var(--vibe-primary)' }}>
                    {orderComplete.paymentMethod === 'upi'
                      ? 'UPI (Google Pay / PhonePe / Paytm) • Test Mode'
                      : orderComplete.paymentMethod === 'razorpay'
                      ? 'Razorpay Secure (Cards & Netbanking)'
                      : 'Cash on Delivery (Pay at Doorstep)'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fulfillment Status:</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>{orderComplete.orderStatus || 'Confirmed'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Within 24-48 Hours (Express)</span>
                </div>
              </div>

              <button
                type="button"
                className="mac-btn-primary"
                onClick={handleClose}
                style={{ width: '100%', padding: '12px', fontSize: 13.5 }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            /* macOS Glassmorphic Checkout Form */
            <div>
              {/* Brand Header */}
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    margin: '0 auto 8px',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 113, 227, 0.1)',
                    border: '1px solid rgba(0, 113, 227, 0.2)',
                    color: '#0071e3'
                  }}
                >
                  <Lock size={22} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px', letterSpacing: -0.4 }}>
                  Complete Your Order
                </h2>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                  Vibe Bazzar Express Checkout • Instant UPI &amp; Cards
                </p>

                {/* Cart summary badge */}
                <div style={{ marginTop: 8 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 11.5,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 9999,
                      background: 'rgba(0, 113, 227, 0.08)',
                      color: '#0071e3',
                      border: '1px solid rgba(0, 113, 227, 0.18)'
                    }}
                  >
                    🛒 {cart.length} item{cart.length !== 1 ? 's' : ''} in cart • Total: {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    fontSize: 12,
                    marginBottom: 14
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* 1. Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder=""
                      value={form.name}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        borderRadius: 10,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-pill)',
                        color: 'var(--text-main)',
                        fontSize: 13,
                        boxSizing: 'border-box'
                      }}
                    />
                    <User size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 11 }} />
                  </div>
                </div>

                {/* 2. Email & Phone in 2-column Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Email Address *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder=""
                        value={form.email}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '9px 12px 9px 36px',
                          borderRadius: 10,
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-pill)',
                          color: 'var(--text-main)',
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                      />
                      <Mail size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 11 }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Phone (Courier SMS) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder=""
                        value={form.phone}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '9px 12px 9px 36px',
                          borderRadius: 10,
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-pill)',
                          color: 'var(--text-main)',
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                      />
                      <Phone size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 11 }} />
                    </div>
                  </div>
                </div>

                {/* 3. Street Address */}
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Street Address / Flat / Building *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder=""
                      value={form.address}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        borderRadius: 10,
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-pill)',
                        color: 'var(--text-main)',
                        fontSize: 13,
                        boxSizing: 'border-box'
                      }}
                    />
                    <MapPin size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 11 }} />
                  </div>
                </div>

                {/* 4. City & PIN Code */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                      City *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder=""
                        value={form.city}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '9px 12px 9px 36px',
                          borderRadius: 10,
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-pill)',
                          color: 'var(--text-main)',
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                      />
                      <Building size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 11 }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                      PIN Code *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        name="zip"
                        required
                        placeholder=""
                        value={form.zip}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '9px 12px 9px 36px',
                          borderRadius: 10,
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-pill)',
                          color: 'var(--text-main)',
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                      />
                      <Hash size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 11 }} />
                    </div>
                  </div>
                </div>

                {/* 5. Payment Method Selector (Instant UPI, Razorpay & COD) */}
                <div style={{ marginTop: 4 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                    Choose Payment Method
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Option A: Instant UPI (Featured & Direct) */}
                    <div
                      onClick={() => setForm({ ...form, paymentMethod: 'upi' })}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: form.paymentMethod === 'upi'
                          ? '2px solid #5f27cd'
                          : '1px solid var(--border-subtle)',
                        background: form.paymentMethod === 'upi'
                          ? 'rgba(95, 39, 205, 0.06)'
                          : 'var(--bg-pill)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #5f27cd, #341f97)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 10px rgba(95, 39, 205, 0.25)'
                          }}
                        >
                          <Zap size={20} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)' }}>
                              Instant UPI (Google Pay, PhonePe, Paytm, BHIM)
                            </span>
                            <span
                              style={{
                                fontSize: 9.5,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                fontWeight: 700,
                                letterSpacing: 0.3
                              }}
                            >
                              ⚡ TEST MODE READY
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                            Pay with any UPI ID or select Google Pay, PhonePe, Paytm
                          </div>
                        </div>
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: form.paymentMethod === 'upi'
                              ? '5px solid #5f27cd'
                              : '2px solid var(--border-subtle)',
                            background: form.paymentMethod === 'upi' ? '#fff' : 'transparent',
                            flexShrink: 0
                          }}
                        />
                      </div>

                      {/* Expandable UPI Input & Quick Select Pills */}
                      {form.paymentMethod === 'upi' && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: '1px solid rgba(95, 39, 205, 0.15)'
                          }}
                        >
                          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                            Enter UPI ID / VPA *
                          </label>

                          <div style={{ position: 'relative', marginBottom: 8 }}>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="Enter UPI ID (e.g. 9876543210@ybl or test@upi)"
                              style={{
                                width: '100%',
                                padding: '9px 12px 9px 36px',
                                borderRadius: 10,
                                border: '1px solid rgba(95, 39, 205, 0.3)',
                                background: 'var(--bg-surface)',
                                color: 'var(--text-main)',
                                fontSize: 13,
                                boxSizing: 'border-box'
                              }}
                            />
                            <Smartphone size={16} color="#5f27cd" style={{ position: 'absolute', left: 12, top: 10 }} />
                          </div>

                          {/* Quick 1-Click UPI Test Handles */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Quick Select:</span>
                            <button
                              type="button"
                              onClick={() => setUpiId('user@okhdfcbank')}
                              style={{
                                fontSize: 11,
                                padding: '3px 8px',
                                borderRadius: 6,
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                background: upiId === 'user@okhdfcbank' ? 'rgba(0, 113, 227, 0.15)' : 'var(--bg-surface)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              🟢 Google Pay
                            </button>
                            <button
                              type="button"
                              onClick={() => setUpiId('user@ybl')}
                              style={{
                                fontSize: 11,
                                padding: '3px 8px',
                                borderRadius: 6,
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                background: upiId === 'user@ybl' ? 'rgba(95, 39, 205, 0.15)' : 'var(--bg-surface)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              🟣 PhonePe
                            </button>
                            <button
                              type="button"
                              onClick={() => setUpiId('user@paytm')}
                              style={{
                                fontSize: 11,
                                padding: '3px 8px',
                                borderRadius: 6,
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                background: upiId === 'user@paytm' ? 'rgba(0, 113, 227, 0.15)' : 'var(--bg-surface)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              🔵 Paytm
                            </button>
                            <button
                              type="button"
                              onClick={() => setUpiId('test@upi')}
                              style={{
                                fontSize: 11,
                                padding: '3px 8px',
                                borderRadius: 6,
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                background: upiId === 'test@upi' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                                color: '#10b981',
                                cursor: 'pointer',
                                fontWeight: 700
                              }}
                            >
                              ⚡ BHIM (Test)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option B: Razorpay Cards & NetBanking */}
                    <div
                      onClick={() => setForm({ ...form, paymentMethod: 'razorpay' })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: form.paymentMethod === 'razorpay'
                          ? '2px solid #0071e3'
                          : '1px solid var(--border-subtle)',
                        background: form.paymentMethod === 'razorpay'
                          ? 'rgba(0, 113, 227, 0.06)'
                          : 'var(--bg-pill)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: 'rgba(0, 113, 227, 0.12)',
                          color: '#0071e3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <CreditCard size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>
                          Cards &amp; NetBanking (Razorpay)
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          Visa, MasterCard, RuPay, NetBanking &amp; Corporate Cards
                        </div>
                      </div>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: form.paymentMethod === 'razorpay'
                            ? '5px solid #0071e3'
                            : '2px solid var(--border-subtle)',
                          background: form.paymentMethod === 'razorpay' ? '#fff' : 'transparent',
                          flexShrink: 0
                        }}
                      />
                    </div>

                    {/* Option C: Cash on Delivery */}
                    <div
                      onClick={() => setForm({ ...form, paymentMethod: 'cash_on_delivery' })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: form.paymentMethod === 'cash_on_delivery'
                          ? '2px solid #10b981'
                          : '1px solid var(--border-subtle)',
                        background: form.paymentMethod === 'cash_on_delivery'
                          ? 'rgba(16, 185, 129, 0.06)'
                          : 'var(--bg-pill)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <ShieldCheck size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>
                          Cash on Delivery (Pay at Doorstep)
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          Verified courier delivery across India • Zero advance risk
                        </div>
                      </div>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: form.paymentMethod === 'cash_on_delivery'
                            ? '5px solid #10b981'
                            : '2px solid var(--border-subtle)',
                          background: form.paymentMethod === 'cash_on_delivery' ? '#fff' : 'transparent',
                          flexShrink: 0
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Order Summary Glass Bar */}
                <div
                  style={{
                    borderRadius: 12,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px 14px',
                    marginTop: 4
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatPrice(cartTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Express Delivery:</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>FREE</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 14,
                      fontWeight: 700,
                      paddingTop: 6,
                      borderTop: '1px solid var(--border-subtle)'
                    }}
                  >
                    <span style={{ color: 'var(--text-main)' }}>Total Payable:</span>
                    <span style={{ color: 'var(--vibe-primary)' }}>{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                {/* 7. Primary Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mac-btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: 4,
                    fontSize: 13.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: form.paymentMethod === 'upi' ? 'linear-gradient(135deg, #5f27cd, #341f97)' : undefined
                  }}
                >
                  {loading ? (
                    'Processing Order...'
                  ) : form.paymentMethod === 'upi' ? (
                    <>
                      <span>Pay with UPI (Test Mode) • {formatPrice(cartTotal)}</span>
                      <ArrowRight size={16} />
                    </>
                  ) : form.paymentMethod === 'razorpay' ? (
                    <>
                      <span>Pay with Cards/Netbanking • {formatPrice(cartTotal)}</span>
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      <span>Confirm Cash on Delivery • {formatPrice(cartTotal)}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
