import React, { useState, useEffect } from 'react';
import { useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Banner } from './components/Banner';
import { Category } from './components/Category';
import { Sidebar } from './components/Sidebar';
import { ProductMinimal } from './components/ProductMinimal';
import { DealOfTheDay } from './components/DealOfTheDay';
import { ProductGrid } from './components/ProductGrid';
import { TestimonialsCTA } from './components/TestimonialsCTA';
import { Blog } from './components/Blog';
import { Footer } from './components/Footer';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { NewsletterModal } from './components/NewsletterModal';
import { NotificationToast } from './components/NotificationToast';

// Additional Amazon & Flipkart Style Hubs
import { DealsPage } from './components/DealsPage';
import { OrdersPage } from './components/OrdersPage';
import { WishlistPage } from './components/WishlistPage';
import { SupportPage } from './components/SupportPage';

export function App() {
  const { activePage } = useShop();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setProducts(json.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch products from backend API:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const dealProduct = products.find((p) => p.isDealOfDay);

  return (
    <div className="anon-app-root">
      {/* 1. Glass Header with Theme Switcher & Vibe Bazzar Logo */}
      <Header />

      {/* 2. Main Content Views */}
      <main>
        {activePage === 'deals' ? (
          <DealsPage products={products} />
        ) : activePage === 'orders' ? (
          <OrdersPage />
        ) : activePage === 'wishlist' ? (
          <WishlistPage />
        ) : activePage === 'support' ? (
          <SupportPage />
        ) : (
          /* Default Home Storefront */
          <>
            <Banner />
            <Category />

            <div className="product-container">
              <div className="container">
                <Sidebar />

                <div className="product-box">
                  <ProductMinimal products={products} />
                  <DealOfTheDay product={dealProduct} />

                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                      Loading Vibe Bazzar catalog...
                    </div>
                  ) : (
                    <ProductGrid products={products} />
                  )}
                </div>
              </div>
            </div>

            <TestimonialsCTA />
            <Blog />
          </>
        )}
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Glass Modals & Notifications */}
      <AuthModal />
      <QuickViewModal />
      <CartDrawer />
      <CheckoutModal />
      <NewsletterModal />
      <NotificationToast />
    </div>
  );
}

export default App;
