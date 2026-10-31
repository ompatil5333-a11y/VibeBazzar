import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // 1. Auth & JWT State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vibe_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('vibe_token') || null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Helper to determine initial view from browser URL path
  const getInitialPage = () => {
    try {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      if (path === 'login') return 'login';
      if (path === 'admin') return 'admin';
      if (path === 'deals') return 'deals';
      if (path === 'orders') return 'orders';
      if (path === 'wishlist') return 'wishlist';
      if (path === 'support') return 'support';
      return 'home';
    } catch {
      return 'home';
    }
  };

  // 4. Navigation View / Pages with URL Synchronization
  const [activePage, setActivePageState] = useState(getInitialPage);

  const setActivePage = (page, updateUrl = true) => {
    setActivePageState(page);
    if (updateUrl && typeof window !== 'undefined') {
      const newPath = page === 'home' ? '/' : `/${page}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({ page }, '', newPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      if (['login', 'admin', 'deals', 'orders', 'wishlist', 'support'].includes(path)) {
        setActivePageState(path);
      } else {
        setActivePageState('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // When user visits the website (hero section), popup this macOS card after 3 seconds
  useEffect(() => {
    const hasPrompted = sessionStorage.getItem('vibe_auth_prompt_shown');
    if (!user && !hasPrompted && activePage === 'home') {
      const timer = setTimeout(() => {
        sessionStorage.setItem('vibe_auth_prompt_shown', 'true');
        setIsAuthModalOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, activePage]);

  // Check token validity on load
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('vibe_user', JSON.stringify(data.user));
          } else {
            // Token expired
            logout();
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('vibe_user', JSON.stringify(userData));
    localStorage.setItem('vibe_token', userToken);
    setIsAuthModalOpen(false);

    // Sync user cart with Supabase
    if (cart.length > 0) {
      fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({ items: cart })
      }).catch(() => {});
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vibe_user');
    localStorage.removeItem('vibe_token');
  };

  // 2. Theme State (Light / Dark)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('vibe_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vibe_theme', theme);
    } catch {}
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 3. Currency State (Default INR ₹)
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem('vibe_currency') || 'INR';
    } catch {
      return 'INR';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vibe_currency', currency);
    } catch {}
  }, [currency]);

  const formatPrice = (amount) => {
    const val = Number(amount) || 0;
    if (currency === 'INR') {
      return `₹${val.toLocaleString('en-IN')}`;
    } else if (currency === 'USD') {
      return `$${(val / 86).toFixed(2)}`;
    } else if (currency === 'EUR') {
      return `€${(val / 92).toFixed(2)}`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';


  // 5. Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('vibe_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6. Wishlist State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('vibe_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 7. Global Modals & Controls
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toast, setToast] = useState({
    visible: true,
    title: 'Vibe Pulse AMOLED Fitness Smartwatch',
    message: 'Someone in Bengaluru just bought',
    time: 'Just now',
    image: '/assets/images/products/watch-3.jpg'
  });

  useEffect(() => {
    localStorage.setItem('vibe_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vibe_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });

    // If authenticated, sync with Supabase PostgreSQL
    if (token) {
      fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product.id, quantity })
      }).catch(() => {});
    }

    setToast({
      visible: true,
      title: product.title,
      message: 'Item added to Cart',
      time: 'Just now',
      image: product.imageDefault || '/assets/images/products/1.jpg'
    });
  };

  // Immediate "Buy Now" flow (Amazon / Flipkart 1-Click checkout)
  const buyNow = (product, quantity = 1) => {
    addToCart(product, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    if (token) {
      fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
    if (token) {
      fetch('/api/cart', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Wishlist operations
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => wishlist.some((item) => item.id === productId);

  // Quick view
  const openQuickView = (product) => setQuickViewProduct(product);
  const closeQuickView = () => setQuickViewProduct(null);

  return (
    <ShopContext.Provider
      value={{
        user,
        token,
        loginUser,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        theme,
        toggleTheme,
        currency,
        setCurrency,
        currencySymbol,
        formatPrice,
        activePage,
        setActivePage,
        cart,
        cartCount,
        cartTotal,
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isInWishlist,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        isNewsletterOpen,
        setIsNewsletterOpen,
        toast,
        setToast,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
