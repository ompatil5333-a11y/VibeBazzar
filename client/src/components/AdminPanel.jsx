import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Truck,
  Database,
  Terminal,
  RefreshCw,
  Search,
  DollarSign,
  Tag,
  Copy,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  Sliders,
  ExternalLink
} from 'lucide-react';

export const AdminPanel = () => {
  const { formatPrice, currencySymbol, setActivePage } = useShop();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'costing' | 'orders' | 'offers' | 'sql'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    acceptedOrders: 0,
    rejectedOrders: 0,
    dbConnected: false
  });

  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State for Add / Edit Product
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'jacket',
    badge: '15% OFF',
    price: '',
    costPrice: '',
    originalPrice: '',
    stock: 50,
    imageDefault: '/assets/images/products/jacket-1.jpg',
    imageHover: '/assets/images/products/jacket-2.jpg',
    isDealOfDay: false,
    isTrending: true,
    isNew: false,
    isTopRated: false,
    description: ''
  });

  // SQL Runner State
  const [sqlQuery, setSqlQuery] = useState(
    'SELECT id, title, category, price, cost_price, stock FROM products ORDER BY id ASC LIMIT 10;'
  );
  const [sqlResults, setSqlResults] = useState(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [sqlError, setSqlError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch all products, orders, and stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, statsRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/admin/stats').then((r) => r.json())
      ]);

      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
      }
      if (orderRes.success && orderRes.data) {
        setOrders(orderRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save (Create or Update) Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        costPrice: productForm.costPrice ? parseFloat(productForm.costPrice) : parseFloat(productForm.price) * 0.6,
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : parseFloat(productForm.price) * 1.25,
        stock: parseInt(productForm.stock, 10) || 0
      };

      if (editingProduct) {
        // Update
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert('Product updated successfully!');
          setEditingProduct(null);
          setIsAddProductOpen(false);
          fetchData();
        } else {
          alert('Update failed: ' + data.message);
        }
      } else {
        // Create
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert('Product created successfully!');
          setIsAddProductOpen(false);
          resetForm();
          fetchData();
        } else {
          alert('Creation failed: ' + data.message);
        }
      }
    } catch (err) {
      alert('Error saving product: ' + err.message);
    }
  };

  const resetForm = () => {
    setProductForm({
      title: '',
      category: 'jacket',
      badge: '15% OFF',
      price: '',
      costPrice: '',
      originalPrice: '',
      stock: 50,
      imageDefault: '/assets/images/products/jacket-1.jpg',
      imageHover: '/assets/images/products/jacket-2.jpg',
      isDealOfDay: false,
      isTrending: true,
      isNew: false,
      isTopRated: false,
      description: ''
    });
  };

  const handleEditClick = (p) => {
    setEditingProduct(p);
    setProductForm({
      title: p.title,
      category: p.category,
      badge: p.badge || '',
      price: p.price,
      costPrice: p.costPrice || (p.price * 0.6).toFixed(2),
      originalPrice: p.originalPrice || '',
      stock: p.stock !== undefined ? p.stock : 50,
      imageDefault: p.imageDefault || '/assets/images/products/1.jpg',
      imageHover: p.imageHover || '/assets/images/products/2.jpg',
      isDealOfDay: Boolean(p.isDealOfDay),
      isTrending: Boolean(p.isTrending),
      isNew: Boolean(p.isNew),
      isTopRated: Boolean(p.isTopRated),
      description: p.description || ''
    });
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" (#${id})?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Product deleted successfully!');
        fetchData();
      } else {
        alert('Failed to delete product: ' + data.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Quick Stock Adjustment (+ / -)
  const handleQuickStock = async (product, delta) => {
    const newStock = Math.max(0, (product.stock || 0) + delta);
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
      );
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  // Order Fulfillment (Accept / Reject / Shipped / Delivered)
  const handleUpdateOrderStatus = async (orderId, newStatus, defaultReason = '') => {
    let adminNotes = defaultReason;
    if (newStatus === 'rejected') {
      const reason = window.prompt(
        'Please enter a rejection reason (e.g., Out of warehouse stock / Customer requested cancellation):',
        'Out of stock at nearest fulfillment hub'
      );
      if (reason === null) return; // User cancelled prompt
      adminNotes = reason;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNotes })
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, orderStatus: newStatus, adminNotes } : o
          )
        );
        fetchData();
      } else {
        alert('Status update failed: ' + data.message);
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Execute SQL Query via Backend
  const handleRunSql = async () => {
    setSqlLoading(true);
    setSqlError(null);
    setSqlResults(null);
    try {
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery })
      });
      const data = await res.json();
      if (data.success) {
        setSqlResults(data);
      } else {
        setSqlError(data.error || data.message || 'SQL execution failed');
      }
    } catch (err) {
      setSqlError(err.message);
    } finally {
      setSqlLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const fullMigrationSql = `-- =========================================================
-- Vibe Bazzar PostgreSQL Migration Script for Supabase
-- Paste into Supabase Dashboard -> SQL Editor and click RUN
-- =========================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('products', 'orders');`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="admin-studio-container">
      {/* macOS Main Window Frame */}
      <div className="admin-window-frame">
        {/* Title Bar */}
        <div className="mac-window-titlebar">
          <div className="mac-traffic-lights">
            <button
              className="mac-dot mac-dot-red"
              onClick={() => setActivePage('home')}
              title="Return to Storefront"
              aria-label="Close"
            />
            <button className="mac-dot mac-dot-yellow" title="Minimize" aria-label="Minimize" />
            <button className="mac-dot mac-dot-green" title="Zoom" aria-label="Zoom" />
          </div>
          <div className="mac-window-title">
            Vibe Bazzar — Admin Studio &amp; Merchant Control Center
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              className={`mac-pill-badge ${stats.dbConnected ? 'success' : 'warning'}`}
              style={{ fontSize: 11 }}
            >
              <Database size={12} />
              {stats.dbConnected ? 'Supabase Live' : 'In-Memory Cache'}
            </span>
            <button
              onClick={fetchData}
              title="Refresh Catalog & Orders"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            padding: '20px 24px',
            background: 'rgba(142, 142, 147, 0.04)',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '16px 20px',
              borderRadius: 16,
              border: '1px solid var(--border-glass)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
              <span>TOTAL PRODUCTS</span>
              <Package size={16} color="#0071e3" />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', marginTop: 8 }}>
              {products.length}
            </div>
            <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>
              Active in Storefront
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '16px 20px',
              borderRadius: 16,
              border: '1px solid var(--border-glass)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
              <span>CUSTOMER ORDERS</span>
              <ShoppingCart size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', marginTop: 8 }}>
              {orders.length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              {orders.filter((o) => o.orderStatus === 'pending').length} Pending Review
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '16px 20px',
              borderRadius: 16,
              border: '1px solid var(--border-glass)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
              <span>STORE VOLUME</span>
              <TrendingUp size={16} color="#f59e0b" />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', marginTop: 8 }}>
              {formatPrice(orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0))}
            </div>
            <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>
              Razorpay Secured
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '16px 20px',
              borderRadius: 16,
              border: '1px solid var(--border-glass)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
              <span>LOW STOCK ALERTS</span>
              <AlertTriangle size={16} color="#ef4444" />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#ef4444', marginTop: 8 }}>
              {products.filter((p) => (p.stock || 0) < 15).length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Needs Warehouse Restock
            </div>
          </div>
        </div>

        {/* macOS Tabs Navigation */}
        <div className="admin-nav-tabs">
          <button
            className={`admin-nav-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={16} />
            Product Cards &amp; Listings ({products.length})
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'costing' ? 'active' : ''}`}
            onClick={() => setActiveTab('costing')}
          >
            <DollarSign size={16} />
            Costing &amp; Stock Inventory
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Truck size={16} />
            Order Tracking ({orders.length})
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <Tag size={16} />
            Promotions &amp; Flash Deals
          </button>
          <button
            className={`admin-nav-tab ${activeTab === 'sql' ? 'active' : ''}`}
            onClick={() => setActiveTab('sql')}
          >
            <Terminal size={16} />
            Supabase SQL Studio
          </button>
        </div>

        {/* TAB 1: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                marginBottom: 20
              }}
            >
              {/* Search & Filter */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', minWidth: 260 }}>
                  <input
                    type="text"
                    placeholder="Search products by title or category..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                  <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 11 }} />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-pill)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="jacket">Jackets</option>
                  <option value="shirt">Shirts</option>
                  <option value="shorts">Shorts</option>
                  <option value="clothes">Ethnic &amp; Dresses</option>
                  <option value="footwear">Footwear</option>
                  <option value="watches">Smartwatches</option>
                  <option value="jewellery">Jewellery</option>
                  <option value="cosmetics">Beauty &amp; Care</option>
                </select>
              </div>

              {/* Add Product Button */}
              <button
                className="mac-btn-primary"
                onClick={() => {
                  setEditingProduct(null);
                  resetForm();
                  setIsAddProductOpen(true);
                }}
              >
                <Plus size={16} />
                Add New Product
              </button>
            </div>

            {/* Products Table */}
            <div className="admin-table-wrapper">
              <table className="mac-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Selling Price</th>
                    <th>Cost Price</th>
                    <th>Gross Margin</th>
                    <th>Stock Count</th>
                    <th>Badge / Offer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const cost = p.costPrice || (p.price * 0.6);
                    const margin = p.price > 0 ? (((p.price - cost) / p.price) * 100).toFixed(1) : '0';
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                              src={p.imageDefault || '/assets/images/products/1.jpg'}
                              alt={p.title}
                              style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)', maxWidth: 280 }}>
                                {p.title}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                ID: #{p.id} {p.isDealOfDay && '• ⭐ Deal of the Day'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="mac-pill-badge info" style={{ textTransform: 'capitalize' }}>
                            {p.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {formatPrice(p.price)}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {formatPrice(cost)}
                        </td>
                        <td>
                          <span
                            className={`mac-pill-badge ${parseFloat(margin) >= 30 ? 'success' : 'warning'}`}
                          >
                            <Percent size={11} /> {margin}%
                          </span>
                        </td>
                        <td>
                          <span
                            className={`mac-pill-badge ${(p.stock || 0) < 15 ? 'danger' : 'success'}`}
                          >
                            {p.stock !== undefined ? p.stock : 50} units
                          </span>
                        </td>
                        <td>
                          {p.badge ? (
                            <span className="mac-pill-badge warning">{p.badge}</span>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="mac-btn-secondary"
                              style={{ padding: '6px 10px' }}
                              onClick={() => handleEditClick(p)}
                              title="Edit product"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="mac-btn-danger"
                              style={{ padding: '6px 10px' }}
                              onClick={() => handleDeleteProduct(p.id, p.title)}
                              title="Delete product"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: COSTING & STOCK INVENTORY */}
        {activeTab === 'costing' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-main)' }}>
                Real-Time Costing, Margins &amp; Stock Adjuster
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Adjust warehouse stock on the fly and monitor product profit margins calculated live against selling price.
              </p>
            </div>

            <div className="admin-table-wrapper">
              <table className="mac-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Selling Price</th>
                    <th>Cost Price (Costing)</th>
                    <th>Profit Per Unit</th>
                    <th>Margin %</th>
                    <th>Warehouse Stock</th>
                    <th>Quick Stock Adjuster</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const cost = p.costPrice || (p.price * 0.6);
                    const profit = p.price - cost;
                    const margin = p.price > 0 ? ((profit / p.price) * 100).toFixed(1) : '0';
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID #{p.id}</div>
                        </td>
                        <td style={{ fontWeight: 700 }}>{formatPrice(p.price)}</td>
                        <td>{formatPrice(cost)}</td>
                        <td style={{ color: '#10b981', fontWeight: 600 }}>+{formatPrice(profit)}</td>
                        <td>
                          <span className={`mac-pill-badge ${parseFloat(margin) >= 30 ? 'success' : 'warning'}`}>
                            {margin}%
                          </span>
                        </td>
                        <td>
                          <b style={{ color: (p.stock || 0) < 15 ? '#ef4444' : 'var(--text-main)' }}>
                            {p.stock !== undefined ? p.stock : 50} units
                          </b>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              className="mac-btn-secondary"
                              style={{ padding: '4px 10px', fontSize: 14 }}
                              onClick={() => handleQuickStock(p, -5)}
                              title="Decrease 5"
                            >
                              -5
                            </button>
                            <button
                              className="mac-btn-secondary"
                              style={{ padding: '4px 10px', fontSize: 14 }}
                              onClick={() => handleQuickStock(p, -1)}
                              title="Decrease 1"
                            >
                              -1
                            </button>
                            <button
                              className="mac-btn-secondary"
                              style={{ padding: '4px 10px', fontSize: 14 }}
                              onClick={() => handleQuickStock(p, +1)}
                              title="Increase 1"
                            >
                              +1
                            </button>
                            <button
                              className="mac-btn-secondary"
                              style={{ padding: '4px 10px', fontSize: 14 }}
                              onClick={() => handleQuickStock(p, +10)}
                              title="Increase 10"
                            >
                              +10
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDER TRACKING (ACCEPT / REJECT) */}
        {activeTab === 'orders' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-main)' }}>
                Order Fulfillment Pipeline &amp; Customer Verification
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Accept verified orders for packing, reject invalid or out-of-stock orders, and update dispatch milestones.
              </p>
            </div>

            <div className="admin-table-wrapper">
              <table className="mac-table">
                <thead>
                  <tr>
                    <th>Order ID &amp; Date</th>
                    <th>Customer Details</th>
                    <th>Shipping Address</th>
                    <th>Items Purchased</th>
                    <th>Total Amount</th>
                    <th>Payment Status</th>
                    <th>Fulfillment Status</th>
                    <th>Actions (Accept / Reject)</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No customer orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{o.id}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                          {o.customerPhone && (
                            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{o.customerPhone}</div>
                          )}
                        </td>
                        <td style={{ maxWidth: 200, fontSize: 12 }}>
                          {o.shippingAddress}
                        </td>
                        <td>
                          {o.items && o.items.length > 0 ? (
                            o.items.map((it, idx) => (
                              <div key={idx} style={{ fontSize: 12, marginBottom: 2 }}>
                                {it.quantity}x {it.title}
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>1 item</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {formatPrice(o.totalAmount)}
                        </td>
                        <td>
                          <span
                            className={`mac-pill-badge ${o.paymentStatus === 'paid' ? 'success' : 'warning'}`}
                          >
                            {o.paymentStatus} ({o.paymentMethod || 'Razorpay'})
                          </span>
                        </td>
                        <td>
                          <span
                            className={`mac-pill-badge ${
                              o.orderStatus === 'accepted' || o.orderStatus === 'shipped' || o.orderStatus === 'delivered'
                                ? 'success'
                                : o.orderStatus === 'rejected'
                                ? 'danger'
                                : 'warning'
                            }`}
                            style={{ textTransform: 'capitalize' }}
                          >
                            {o.orderStatus}
                          </span>
                          {o.adminNotes && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>
                              Note: {o.adminNotes}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {o.orderStatus !== 'accepted' && (
                              <button
                                className="mac-btn-success"
                                onClick={() => handleUpdateOrderStatus(o.id, 'accepted', 'Accepted and dispatched to packing')}
                                title="Accept Order"
                              >
                                <CheckCircle size={13} /> Accept
                              </button>
                            )}

                            {o.orderStatus !== 'rejected' && (
                              <button
                                className="mac-btn-danger"
                                onClick={() => handleUpdateOrderStatus(o.id, 'rejected')}
                                title="Reject Order"
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            )}

                            {o.orderStatus === 'accepted' && (
                              <button
                                className="mac-btn-secondary"
                                style={{ padding: '6px 10px', fontSize: 12 }}
                                onClick={() => handleUpdateOrderStatus(o.id, 'shipped', 'Handed over to courier')}
                                title="Mark Shipped"
                              >
                                <Truck size={13} /> Ship
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: OFFERS & FLASH DEALS */}
        {activeTab === 'offers' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-main)' }}>
                Promotions, Festive Badges &amp; Deal of the Day
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Feature high-converting flash sales and assign festive banners directly onto product cards.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {products.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 18,
                    padding: 16,
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center'
                  }}
                >
                  <img
                    src={p.imageDefault || '/assets/images/products/1.jpg'}
                    alt={p.title}
                    style={{ width: 68, height: 68, borderRadius: 12, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)', marginBottom: 4 }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--vibe-primary)', marginBottom: 8 }}>
                      {formatPrice(p.price)}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className={`mac-btn-secondary ${p.isDealOfDay ? 'active' : ''}`}
                        style={{
                          fontSize: 11,
                          padding: '5px 10px',
                          background: p.isDealOfDay ? '#ff5f56' : undefined,
                          color: p.isDealOfDay ? '#fff' : undefined
                        }}
                        onClick={async () => {
                          await fetch(`/api/products/${p.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isDealOfDay: !p.isDealOfDay })
                          });
                          fetchData();
                        }}
                      >
                        ⭐ {p.isDealOfDay ? 'Deal of Day Active' : 'Make Deal of Day'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SUPABASE SQL STUDIO */}
        {activeTab === 'sql' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-main)' }}>
                    Supabase PostgreSQL Query Runner &amp; Migration Studio
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                    Execute SQL queries directly against your connected Supabase PostgreSQL database or copy migration scripts.
                  </p>
                </div>
                <button
                  className="mac-btn-secondary"
                  onClick={() => copyToClipboard(fullMigrationSql)}
                  style={{ gap: 6 }}
                >
                  <Copy size={14} />
                  {copySuccess ? 'Copied to Clipboard!' : 'Copy Supabase Migration SQL'}
                </button>
              </div>
            </div>

            {/* SQL Input Area */}
            <div
              style={{
                background: '#090d16',
                borderRadius: 16,
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: 16
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600, fontFamily: 'monospace' }}>
                  $ SQL Editor (Supabase PostgreSQL)
                </span>
                <button
                  className="mac-btn-primary"
                  onClick={handleRunSql}
                  disabled={sqlLoading}
                  style={{ padding: '7px 14px', fontSize: 12 }}
                >
                  {sqlLoading ? 'Executing Query...' : 'Run Query (▶)'}
                </button>
              </div>
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Error Display */}
            {sqlError && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: 13,
                  marginBottom: 16,
                  fontFamily: 'monospace'
                }}
              >
                Error: {sqlError}
              </div>
            )}

            {/* SQL Results Table */}
            {sqlResults && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Query executed in {sqlResults.executionTimeMs || 0}ms • Returned {sqlResults.rowCount || 0} row(s)
                </div>
                <div className="admin-table-wrapper" style={{ maxHeight: 350, overflowY: 'auto' }}>
                  <table className="mac-table">
                    <thead>
                      <tr>
                        {sqlResults.fields &&
                          sqlResults.fields.map((f, i) => <th key={i}>{f}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResults.rows &&
                        sqlResults.rows.map((row, ri) => (
                          <tr key={ri}>
                            {sqlResults.fields.map((col, ci) => (
                              <td key={ci}>{String(row[col] !== null ? row[col] : 'NULL')}</td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="mac-modal-overlay" onClick={() => setIsAddProductOpen(false)}>
          <div
            className="mac-window-card"
            style={{ maxWidth: 580, width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mac-window-titlebar">
              <div className="mac-traffic-lights">
                <button
                  className="mac-dot mac-dot-red"
                  onClick={() => setIsAddProductOpen(false)}
                  title="Close"
                  aria-label="Close"
                />
                <button className="mac-dot mac-dot-yellow" aria-label="Minimize" />
                <button className="mac-dot mac-dot-green" aria-label="Zoom" />
              </div>
              <div className="mac-window-title">
                {editingProduct ? `Edit Product #${editingProduct.id}` : 'Create New Product Listing'}
              </div>
              <div style={{ width: 40 }} />
            </div>

            <form onSubmit={handleSaveProduct} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vibe Pulse AMOLED Smartwatch"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-pill)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="jacket">Jacket</option>
                    <option value="shirt">Shirt</option>
                    <option value="shorts">Shorts</option>
                    <option value="clothes">Ethnic &amp; Clothes</option>
                    <option value="footwear">Footwear</option>
                    <option value="watches">Watches</option>
                    <option value="jewellery">Jewellery</option>
                    <option value="cosmetics">Cosmetics</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20% OFF or BESTSELLER"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Pricing, Costing & Stock Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2499.00"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1499.00"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                    Warehouse Stock *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Images */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                    Default Image URL
                  </label>
                  <input
                    type="text"
                    value={productForm.imageDefault}
                    onChange={(e) => setProductForm({ ...productForm, imageDefault: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                    Hover Image URL
                  </label>
                  <input
                    type="text"
                    value={productForm.imageHover}
                    onChange={(e) => setProductForm({ ...productForm, imageHover: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-pill)',
                      color: 'var(--text-main)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                  Product Details / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed product information for customers..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-pill)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Deal of Day Checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={productForm.isDealOfDay}
                  onChange={(e) => setProductForm({ ...productForm, isDealOfDay: e.target.checked })}
                />
                <span>Set as <b>Deal of the Day</b> Showcase Product</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="mac-btn-secondary"
                  onClick={() => setIsAddProductOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="mac-btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
