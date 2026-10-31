import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Truck, CheckCircle2, PackageCheck, Clock, MapPin, ExternalLink } from 'lucide-react';

export const OrdersPage = () => {
  const { formatPrice, setActivePage } = useShop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setOrders(data.data);
        }
      })
      .catch((err) => console.error('Error fetching orders:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="hub-container">
      <div className="container">
        <div className="hub-header">
          <div className="hub-title-box">
            <h1>
              <Truck size={28} color="#ff4757" />
              My Orders & Live Shipment Tracker
            </h1>
            <p>Track order lifecycle, delivery stages, and payment receipts (Amazon & Flipkart style).</p>
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
            ← Back to Store
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-glass)' }}>
            <PackageCheck size={56} color="var(--vibe-primary)" style={{ margin: '0 auto 15px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No Recent Orders Found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              You haven't placed an order yet. Explore our festive Indian deals today!
            </p>
            <button
              onClick={() => setActivePage('home')}
              className="btn-checkout"
              style={{ maxWidth: 220, margin: '0 auto', display: 'block' }}
            >
              Start Shopping Now
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((ord, idx) => {
              const orderDate = new Date(ord.createdAt || ord.created_at || Date.now()).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div className="order-tracking-card" key={ord.id || idx}>
                  <div className="order-tracking-header">
                    <div>
                      <span className="order-id-pill">Order #{ord.id}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 12 }}>
                        Placed on {orderDate}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 12,
                          background: ord.payment_status === 'paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                          color: ord.payment_status === 'paid' ? '#10b981' : '#f59e0b'
                        }}
                      >
                        {ord.payment_status === 'paid' ? 'Paid via Razorpay' : 'Cash on Delivery'}
                      </span>

                      <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
                        {formatPrice(ord.total_amount || ord.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Flipkart / Amazon Tracking Stepper */}
                  <div className="tracking-stepper">
                    <div className="step-item completed">
                      <div className="step-circle"><CheckCircle2 size={16} /></div>
                      <span className="step-label">Order Confirmed</span>
                    </div>

                    <div className="step-item completed">
                      <div className="step-circle"><CheckCircle2 size={16} /></div>
                      <span className="step-label">Packed &amp; Verified</span>
                    </div>

                    <div className="step-item active">
                      <div className="step-circle"><Truck size={16} /></div>
                      <span className="step-label">Out for Delivery</span>
                    </div>

                    <div className="step-item">
                      <div className="step-circle"><PackageCheck size={16} /></div>
                      <span className="step-label">Delivery Tomorrow</span>
                    </div>
                  </div>

                  {/* Shipping Address & Details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 15 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, maxWidth: 500 }}>
                      <MapPin size={18} color="var(--vibe-primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                          Shipping to: {ord.customer_name || ord.customerName}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {ord.shipping_address || ord.shippingAddress}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Standard Express Courier</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>Est. Delivery: Within 24-48 Hours</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
