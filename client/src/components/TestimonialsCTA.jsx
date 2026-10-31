import React from 'react';
import { Truck, Rocket, PhoneCall, ArrowLeftRight, CreditCard, Sparkles } from 'lucide-react';

export const TestimonialsCTA = () => {
  return (
    <div className="testimonials-cta-service">
      <div className="container">
        <div className="testimonials-box">
          {/* Testimonials */}
          <div className="testimonial">
            <h2 className="title">Customer Review</h2>

            <div className="testimonial-card">
              <img
                src="/assets/images/testimonial-1.jpg"
                alt="Pooja Sharma"
                className="testimonial-banner"
                width="80"
                height="80"
              />

              <p className="testimonial-name">Pooja Sharma</p>
              <p className="testimonial-title">Verified Buyer, Bengaluru</p>

              <img
                src="/assets/images/icons/quotes.svg"
                alt="quotation"
                className="quotation-img"
                width="26"
              />

              <p className="testimonial-desc">
                Vibe Bazzar is my go-to for daily fashion and electronics. Express 24-hr delivery in Bengaluru, genuine products, and smooth UPI payments via Razorpay!
              </p>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="cta-container">
            <img
              src="/assets/images/cta-banner.jpg"
              alt="festive collection"
              className="cta-banner"
            />

            <div className="cta-content">
              <p className="discount">Festive 40% OFF</p>
              <h2 className="cta-title">Royal Indian Collection</h2>
              <p className="cta-text">Starting from ₹399</p>
              <button
                className="cta-btn"
                onClick={() => {
                  const el = document.getElementById('products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Deals
              </button>
            </div>
          </div>

          {/* Service features */}
          <div className="service">
            <h2 className="title">Why Vibe Bazzar</h2>

            <div className="service-container">
              <div className="service-item">
                <div className="service-icon">
                  <Truck size={28} color="var(--vibe-primary)" />
                </div>
                <div className="service-content">
                  <h3 className="service-title">Pan-India Delivery</h3>
                  <p className="service-desc">Free Delivery on Orders &gt; ₹499</p>
                </div>
              </div>

              <div className="service-item">
                <div className="service-icon">
                  <Rocket size={28} color="var(--vibe-primary)" />
                </div>
                <div className="service-content">
                  <h3 className="service-title">Next Day Delivery</h3>
                  <p className="service-desc">Across Major Metro Cities</p>
                </div>
              </div>

              <div className="service-item">
                <div className="service-icon">
                  <PhoneCall size={28} color="var(--vibe-primary)" />
                </div>
                <div className="service-content">
                  <h3 className="service-title">24x7 Support</h3>
                  <p className="service-desc">Call &amp; WhatsApp Concierge</p>
                </div>
              </div>

              <div className="service-item">
                <div className="service-icon">
                  <ArrowLeftRight size={28} color="var(--vibe-primary)" />
                </div>
                <div className="service-content">
                  <h3 className="service-title">Easy 7-Day Returns</h3>
                  <p className="service-desc">Doorstep Pickup &amp; Refund</p>
                </div>
              </div>

              <div className="service-item">
                <div className="service-icon">
                  <CreditCard size={28} color="var(--vibe-primary)" />
                </div>
                <div className="service-content">
                  <h3 className="service-title">Razorpay Secure</h3>
                  <p className="service-desc">UPI, RuPay, EMI &amp; Cards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
