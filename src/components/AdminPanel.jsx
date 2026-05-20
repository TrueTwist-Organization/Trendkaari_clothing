import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, ShoppingBag, DollarSign, Package, Tag, AlertTriangle, Eye, Check } from 'lucide-react';
import './AdminPanel.css';

export default function AdminPanel({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  coupons,
  onAddCoupon,
  onDeleteCoupon
}) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Product Form states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('kurtas');
  const [prodSizes, setProdSizes] = useState(['S', 'M', 'L', 'XL']);
  const [prodImage, setProdImage] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodStock, setProdStock] = useState(15);

  // Coupon Form states
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponMinPurchase, setCouponMinPurchase] = useState('');

  if (!isOpen) return null;

  // Overview Math
  const totalSales = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.grandTotal, 0);
  
  const categoriesCount = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!prodTitle || !prodPrice || !prodOriginalPrice || !prodImage) {
      alert("Please fill in all required fields!");
      return;
    }

    const itemData = {
      title: prodTitle,
      price: Number(prodPrice),
      originalPrice: Number(prodOriginalPrice),
      discount: `${Math.round(((prodOriginalPrice - prodPrice) / prodOriginalPrice) * 100)}% OFF`,
      category: prodCategory,
      sizes: prodSizes,
      image: prodImage,
      description: prodDescription || `${prodTitle} - Exquisite Libas designer garment styled for modern elegance.`,
      rating: 4.8,
      reviewsCount: Math.floor(Math.random() * 40) + 10,
      stock: Number(prodStock)
    };

    if (editingProduct) {
      onEditProduct(editingProduct.id, itemData);
      setEditingProduct(null);
    } else {
      onAddProduct(itemData);
      setIsAddingProduct(false);
    }

    // Reset Form
    resetProductForm();
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);
    setProdTitle(product.title);
    setProdPrice(product.price);
    setProdOriginalPrice(product.originalPrice);
    setProdCategory(product.category);
    setProdSizes(product.sizes);
    setProdImage(product.image);
    setProdDescription(product.description);
    setProdStock(product.stock || 15);
    setIsAddingProduct(true);
  };

  const resetProductForm = () => {
    setProdTitle('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdCategory('kurtas');
    setProdSizes(['S', 'M', 'L', 'XL']);
    setProdImage('');
    setProdDescription('');
    setProdStock(15);
  };

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponCode || !couponDiscount || !couponMinPurchase) {
      alert("Please fill all coupon details!");
      return;
    }

    onAddCoupon({
      code: couponCode.toUpperCase(),
      discount: Number(couponDiscount),
      minPurchase: Number(couponMinPurchase)
    });

    setCouponCode('');
    setCouponDiscount('');
    setCouponMinPurchase('');
  };

  const toggleSize = (sz) => {
    if (prodSizes.includes(sz)) {
      setProdSizes(prev => prev.filter(s => s !== sz));
    } else {
      setProdSizes(prev => [...prev, sz]);
    }
  };

  return (
    <div className="admin-portal-overlay">
      <div className="admin-portal-container">
        
        {/* Header */}
        <header className="admin-header">
          <div className="admin-logo-row">
            <div className="admin-logo-badge">ADMIN</div>
            <span className="admin-title">Libas Management Studio</span>
          </div>
          <button className="admin-close-btn" onClick={onClose} aria-label="Close Admin Portal">
            <X size={20} />
          </button>
        </header>

        {/* Workspace */}
        <div className="admin-workspace">
          
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <nav className="admin-nav-links">
              <button 
                className={`admin-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <DollarSign size={16} />
                <span>Overview</span>
              </button>
              <button 
                className={`admin-nav-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <Package size={16} />
                <span>Manage Products</span>
              </button>
              <button 
                className={`admin-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingBag size={16} />
                <span>Orders Tracker ({orders.length})</span>
              </button>
              <button 
                className={`admin-nav-btn ${activeTab === 'coupons' ? 'active' : ''}`}
                onClick={() => setActiveTab('coupons')}
              >
                <Tag size={16} />
                <span>Promo Coupons</span>
              </button>
            </nav>
            <div className="admin-system-status">
              <div className="status-indicator-dot"></div>
              <span>Database Sync: ONLINE</span>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="admin-main-stage">
            
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <div className="admin-panel-stage animate-fade">
                <h3 className="stage-title">REAL-TIME BUSINESS PERFORMANCE</h3>
                
                {/* Stats Cards */}
                <div className="stats-cards-grid">
                  <div className="stat-card plum-gradient">
                    <div className="stat-icon-wrapper">
                      <DollarSign size={24} />
                    </div>
                    <div className="stat-text-box">
                      <span className="stat-label">TOTAL SALES REVENUE</span>
                      <h4 className="stat-value">₹{totalSales.toLocaleString('en-IN')}</h4>
                      <p className="stat-sub">From {orders.filter(o => o.status !== 'Cancelled').length} active shipments</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-wrapper text-plum">
                      <ShoppingBag size={24} />
                    </div>
                    <div className="stat-text-box">
                      <span className="stat-label">TOTAL ORDERS PLACED</span>
                      <h4 className="stat-value">{orders.length}</h4>
                      <p className="stat-sub">Including pending & cancelled</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-wrapper text-plum">
                      <Package size={24} />
                    </div>
                    <div className="stat-text-box">
                      <span className="stat-label">CATALOG CLOTHING PRODUCTS</span>
                      <h4 className="stat-value">{products.length}</h4>
                      <p className="stat-sub">Spanning across {Object.keys(categoriesCount).length} active sections</p>
                    </div>
                  </div>
                </div>

                <div className="overview-two-cols">
                  {/* Category Mix Progress Bars */}
                  <div className="overview-card flex-1">
                    <h4 className="card-heading">CATALOG PRODUCT MIX</h4>
                    <div className="progress-bars-list">
                      {Object.entries(categoriesCount).map(([cat, count]) => {
                        const pct = Math.round((count / products.length) * 100);
                        return (
                          <div key={cat} className="category-progress-row">
                            <div className="progress-labels">
                              <span className="progress-name text-capitalize">{cat}</span>
                              <span className="progress-val">{count} items ({pct}%)</span>
                            </div>
                            <div className="progress-track-bg">
                              <div className="progress-track-fill" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Low Stock Alerts */}
                  <div className="overview-card flex-1">
                    <h4 className="card-heading flex-center gap-8 text-warn">
                      <AlertTriangle size={16} />
                      LOW STOCK NOTIFICATIONS
                    </h4>
                    
                    <div className="stock-alerts-list">
                      {products.filter(p => (p.stock || 15) < 8).length === 0 ? (
                        <div className="no-alerts-placeholder">
                          <Check size={28} className="success-icon" />
                          <span>All products carry excellent stock inventory!</span>
                        </div>
                      ) : (
                        products.filter(p => (p.stock || 15) < 8).map(p => (
                          <div key={p.id} className="stock-alert-row">
                            <img src={p.image} alt="" className="alert-thumb" />
                            <div className="alert-details">
                              <span className="alert-title">{p.title}</span>
                              <span className="alert-meta text-capitalize">Section: {p.category} | SKU: LIB-{p.id}</span>
                            </div>
                            <div className="alert-badge bg-light-red">
                              {p.stock || 4} Left
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCT MANAGEMENT PANEL */}
            {activeTab === 'products' && (
              <div className="admin-panel-stage animate-fade">
                <div className="stage-header-row">
                  <h3 className="stage-title">CLOTHING PRODUCTS INVENTORY ({products.length})</h3>
                  {!isAddingProduct && (
                    <button className="btn btn-primary btn-iconic" onClick={() => { resetProductForm(); setIsAddingProduct(true); }}>
                      <Plus size={16} />
                      ADD NEW GARMENT
                    </button>
                  )}
                </div>

                {isAddingProduct ? (
                  /* Create / Edit Form */
                  <div className="form-card-container">
                    <div className="form-card-header">
                      <h4 className="form-title">{editingProduct ? 'EDIT DESIGNER GARMENT' : 'ADD NEW CLOTHING ITEM'}</h4>
                      <button className="form-close-btn" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); resetProductForm(); }}>
                        Cancel
                      </button>
                    </div>
                    
                    <form className="admin-input-form" onSubmit={handleProductSubmit}>
                      <div className="form-grid-2x2">
                        <div className="form-input-box">
                          <label className="input-label">Product Title *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="e.g. Mustard Floral Printed Straight Suit" 
                            value={prodTitle}
                            onChange={(e) => setProdTitle(e.target.value)}
                            className="admin-field"
                          />
                        </div>

                        <div className="form-grid-split">
                          <div className="form-input-box">
                            <label className="input-label">Discount Price (₹) *</label>
                            <input 
                              type="number" 
                              required 
                              min="1"
                              placeholder="e.g. 1899" 
                              value={prodPrice}
                              onChange={(e) => setProdPrice(e.target.value)}
                              className="admin-field"
                            />
                          </div>
                          <div className="form-input-box">
                            <label className="input-label">Original Price (₹) *</label>
                            <input 
                              type="number" 
                              required 
                              min="1"
                              placeholder="e.g. 3799" 
                              value={prodOriginalPrice}
                              onChange={(e) => setProdOriginalPrice(e.target.value)}
                              className="admin-field"
                            />
                          </div>
                        </div>

                        <div className="form-grid-split">
                          <div className="form-input-box">
                            <label className="input-label">Category *</label>
                            <select 
                              value={prodCategory} 
                              onChange={(e) => setProdCategory(e.target.value)}
                              className="admin-field select-field"
                            >
                              <option value="kurtas">Kurtis & Kurtas</option>
                              <option value="suits">Suits / Suit Sets</option>
                              <option value="sarees">Sarees</option>
                              <option value="loungewear">Loungewear</option>
                              <option value="co-ords">Co-ords</option>
                              <option value="dresses">Dresses</option>
                              <option value="plus sizes">Curve Wear (Plus Size)</option>
                              <option value="new arrivals">New Arrivals</option>
                            </select>
                          </div>
                          
                          <div className="form-input-box">
                            <label className="input-label">Stock Quantity</label>
                            <input 
                              type="number" 
                              min="0"
                              placeholder="e.g. 15" 
                              value={prodStock}
                              onChange={(e) => setProdStock(e.target.value)}
                              className="admin-field"
                            />
                          </div>
                        </div>

                        <div className="form-input-box">
                          <label className="input-label">Image CDN URL *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Paste image link" 
                            value={prodImage}
                            onChange={(e) => setProdImage(e.target.value)}
                            className="admin-field"
                          />
                        </div>
                      </div>

                      <div className="form-input-box text-area-box">
                        <label className="input-label">Description</label>
                        <textarea 
                          placeholder="Provide elegant descriptions..." 
                          value={prodDescription}
                          onChange={(e) => setProdDescription(e.target.value)}
                          className="admin-field text-area-field"
                          rows={3}
                        />
                      </div>

                      <div className="form-input-box">
                        <label className="input-label">Sizing Options Available</label>
                        <div className="sizes-checkbox-row">
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'FS'].map(sz => {
                            const active = prodSizes.includes(sz);
                            return (
                              <button
                                type="button"
                                key={sz}
                                className={`size-check-btn ${active ? 'checked' : ''}`}
                                onClick={() => toggleSize(sz)}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary form-submit-btn">
                        {editingProduct ? 'UPDATE PRODUCT' : 'CREATE CLOTHING ITEM'}
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Products Inventory Table */
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ITEM</th>
                          <th>SECTION</th>
                          <th>PRICE</th>
                          <th>STOCK</th>
                          <th>RATING</th>
                          <th className="text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id}>
                            <td>
                              <div className="table-item-cell">
                                <img src={p.image} alt="" className="table-thumb" />
                                <div className="table-item-meta">
                                  <span className="table-item-title">{p.title}</span>
                                  <span className="table-item-sku">SKU: LIB-{p.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="text-capitalize">{p.category}</td>
                            <td>
                              <div className="table-price-col">
                                <span className="current">₹{p.price}</span>
                                <span className="orig">₹{p.originalPrice}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`inventory-pill ${(p.stock || 15) < 8 ? 'low' : 'ok'}`}>
                                {p.stock || 15} items
                              </span>
                            </td>
                            <td>⭐ {p.rating} ({p.reviewsCount})</td>
                            <td className="text-right">
                              <div className="table-action-strip">
                                <button className="table-btn edit" onClick={() => handleStartEdit(p)} title="Edit Garment">
                                  <Edit size={14} />
                                </button>
                                <button className="table-btn delete" onClick={() => onDeleteProduct(p.id)} title="Delete Garment">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ORDERS TRACKING PANEL */}
            {activeTab === 'orders' && (
              <div className="admin-panel-stage animate-fade">
                <h3 className="stage-title">CUSTOMER SHIPMENT TRACKER ({orders.length})</h3>
                
                {orders.length === 0 ? (
                  <div className="empty-table-placeholder">
                    <ShoppingBag size={48} className="empty-icon" />
                    <h4>NO CUSTOMER ORDERS RECORDED YET</h4>
                    <p>Go to the store front, add items to your shopping bag, and proceed to complete checkout!</p>
                  </div>
                ) : (
                  <div className="orders-cards-scroller">
                    {orders.map(order => (
                      <div key={order.id} className="order-details-card">
                        
                        {/* Card Top */}
                        <div className="order-card-header">
                          <div className="order-meta-info">
                            <span className="order-id">{order.id}</span>
                            <span className="order-date">{order.date}</span>
                          </div>
                          
                          {/* Order Status Select */}
                          <div className="status-selector-row">
                            <span className="status-label">Status:</span>
                            <select 
                              value={order.status} 
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                              className={`order-status-select ${order.status.toLowerCase()}`}
                            >
                              <option value="Pending">🕒 Pending</option>
                              <option value="Processing">⚙️ Processing</option>
                              <option value="Shipped">🚚 Shipped</option>
                              <option value="Delivered">✅ Delivered</option>
                              <option value="Cancelled">❌ Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {/* Customer Row */}
                        <div className="order-customer-box">
                          <div className="cust-col">
                            <span className="label">CUSTOMER:</span>
                            <span className="val">{order.customerName}</span>
                          </div>
                          <div className="cust-col">
                            <span className="label">EMAIL & PHONE:</span>
                            <span className="val">{order.email} | {order.phone}</span>
                          </div>
                          <div className="cust-col">
                            <span className="label">SHIPPING ADDRESS:</span>
                            <span className="val">{order.address}</span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="order-items-grid">
                          <span className="items-header">ORDERED ITEMS:</span>
                          <div className="items-list-rows">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="ordered-item-row">
                                <img src={item.image} alt="" className="ordered-thumb" />
                                <div className="ordered-details">
                                  <span className="item-title">{item.title}</span>
                                  <span className="item-meta">Size: <strong>{item.selectedSize}</strong> | Quantity: <strong>{item.quantity}</strong> | Rate: ₹{item.price}</span>
                                </div>
                                <span className="ordered-subtotal">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Summary Math footer */}
                        <div className="order-footer-math-strip">
                          <div className="coupon-note">
                            {order.discount > 0 ? (
                              <span className="coupon-tag bg-light-green flex-center gap-4">
                                <Tag size={10} />
                                SALE100 Applied (-₹{order.discount})
                              </span>
                            ) : (
                              <span className="text-muted">No coupon codes used</span>
                            )}
                          </div>
                          
                          <div className="totals-math-box">
                            <div className="math-row">
                              <span>Items Subtotal:</span>
                              <strong>₹{order.subtotal}</strong>
                            </div>
                            <div className="math-row total-highlight">
                              <span>Grand Total Paid:</span>
                              <strong>₹{order.grandTotal}</strong>
                            </div>
                          </div>
                          
                          <button className="btn-order-delete" onClick={() => onDeleteOrder(order.id)} title="Delete Log">
                            <Trash2 size={14} />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COUPOUN MANAGEMENT PANEL */}
            {activeTab === 'coupons' && (
              <div className="admin-panel-stage animate-fade">
                <h3 className="stage-title">MANAGE APPLICABLE PROMO COUPONS</h3>

                <div className="coupon-panel-layout">
                  {/* Coupon Form */}
                  <div className="coupon-form-card flex-1">
                    <h4 className="coupon-card-heading">CREATE DYNAMIC PROMO CODE</h4>
                    <form className="coupon-inputs-form" onSubmit={handleCouponSubmit}>
                      <div className="form-input-box">
                        <label className="input-label">Promo Code *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. DIWALI500" 
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="admin-field uppercase-field"
                        />
                      </div>
                      <div className="form-input-box">
                        <label className="input-label">Discount Value (₹) *</label>
                        <input 
                          type="number" 
                          required 
                          min="1"
                          placeholder="e.g. 500" 
                          value={couponDiscount}
                          onChange={(e) => setCouponDiscount(e.target.value)}
                          className="admin-field"
                        />
                      </div>
                      <div className="form-input-box">
                        <label className="input-label">Min Purchase Required (₹) *</label>
                        <input 
                          type="number" 
                          required 
                          min="1"
                          placeholder="e.g. 4999" 
                          value={couponMinPurchase}
                          onChange={(e) => setCouponMinPurchase(e.target.value)}
                          className="admin-field"
                        />
                      </div>

                      <button type="submit" className="btn btn-primary coupon-submit-btn flex-center gap-8">
                        <Plus size={16} />
                        ACTIVATE COUPON
                      </button>
                    </form>
                  </div>

                  {/* Active Coupons List */}
                  <div className="coupon-list-card flex-2">
                    <h4 className="coupon-card-heading">ACTIVE APPLICABLE PROMO CODES</h4>
                    <div className="coupons-grid-list">
                      {coupons.map((coupon) => (
                        <div key={coupon.code} className="active-coupon-badge">
                          <div className="badge-scissors-line"></div>
                          
                          <div className="coupon-main-body">
                            <div className="coupon-code-heading">{coupon.code}</div>
                            <div className="coupon-math-details">
                              <span>Flat <strong>₹{coupon.discount} Off</strong></span>
                              <span>Orders above ₹{coupon.minPurchase}</span>
                            </div>
                          </div>

                          <button 
                            className="coupon-delete-trigger" 
                            onClick={() => onDeleteCoupon(coupon.code)}
                            disabled={coupon.code === 'SALE100'} // Keep base coupon protected
                            title={coupon.code === 'SALE100' ? "Protected Base Code" : "Delete Coupon"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}
