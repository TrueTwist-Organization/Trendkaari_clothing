import { useEffect, useState } from 'react';
import { fetchAnalytics } from '../../api/adminApi';
import { 
  Package, 
  ShoppingCart, 
  IndianRupee, 
  TrendingUp, 
  Calendar, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight, 
  Award, 
  CheckCircle, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadData = () => {
    setRefreshing(true);
    setLoadError('');
    fetchAnalytics()
      .then((payload) => {
        setData(payload);
        setLoadError('');
      })
      .catch((err) => {
        setData(null);
        setLoadError(err.message || 'Could not load dashboard data.');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="admin-cyber-page" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <span className="admin-chrome-loader admin-chrome-loader--lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-cyber-page" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', textAlign: 'center', gap: 16 }}>
        <p className="admin-cyber-error" role="alert">
          {loadError || 'Dashboard data unavailable.'}
        </p>
        <button type="button" className="admin-cyber-btn admin-cyber-btn--primary" onClick={handleRefresh}>
          Retry
        </button>
      </div>
    );
  }

  // Math check for average order value
  const avgOrderValue = Math.round(data.totalSales / (data.totalOrders || 1));

  // Date formatted beautifully
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="admin-cyber-page">
      {/* Executive Header */}
      <header className="admin-cyber-page__head admin-cyber-page__head--row" style={{ marginBottom: 24 }}>
        <div>
          <h1>Dashboard</h1>
          <p>Overview & analytics</p>
        </div>
        <div className="admin-cyber-page__actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="admin-cyber-date-badge" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'var(--admin-surface)', 
            border: '1px solid var(--admin-gold-soft)', 
            padding: '8px 16px', 
            borderRadius: 'var(--admin-radius-sm)',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--admin-text-muted)'
          }}>
            <Calendar size={14} className="text-plum" />
            <span>{formattedDate}</span>
          </div>
          <button 
            type="button" 
            className="admin-cyber-btn" 
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ padding: '8px 12px', minWidth: '40px' }}
          >
            <RefreshCw size={14} className={refreshing ? 'admin-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <div className="admin-cyber-welcome-banner admin-cyber-welcome-banner--hero" style={{
        background: 'linear-gradient(135deg, var(--admin-plum) 0%, var(--admin-plum-dark) 100%)',
        color: '#fff',
        padding: '28px 32px',
        borderRadius: 'var(--admin-radius)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--admin-shadow)',
        marginBottom: 28
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '700', 
            letterSpacing: '2px', 
            background: 'rgba(255, 255, 255, 0.15)', 
            padding: '5px 12px', 
            borderRadius: '999px',
            display: 'inline-block',
            marginBottom: '12px'
          }}>GOOD MORNING 👑</span>
          <h2 style={{ 
            fontFamily: 'var(--font-serif), serif', 
            fontSize: '1.8rem', 
            margin: '0 0 8px', 
            color: '#fff',
            fontWeight: '600'
          }}>Welcome back, Admin!</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
            Here's what's happening with your store today.
          </p>
        </div>
        {/* Abstract shapes for luxury feel */}
        <div style={{
          position: 'absolute',
          right: '-10%',
          bottom: '-50%',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'rgba(212, 180, 131, 0.12)',
          filter: 'blur(20px)',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          right: '15%',
          top: '-30%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          filter: 'blur(30px)',
          zIndex: 1
        }} />
      </div>

      {/* 4 Stats Cards Grid */}
      <div
        className="admin-cyber-stats admin-dashboard-stats-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '20px', marginBottom: 28 }}
      >
        
        {/* Card 1: PRODUCTS */}
        <div className="glass-panel" style={{ 
          padding: '24px 20px', 
          position: 'relative', 
          borderBottom: '3.5px solid #2563eb',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: 'var(--admin-text-soft)' }}>PRODUCTS</span>
              <div style={{ background: '#eff6ff', color: '#2563eb', padding: '6px', borderRadius: '8px' }}>
                <Package size={16} />
              </div>
            </div>
            <strong style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--admin-text)', display: 'block', margin: '4px 0' }}>
              {data.totalProducts}
            </strong>
          </div>
          <small style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: 12 }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }} />
            {data.totalCategories} Categories
          </small>
        </div>

        {/* Card 2: ORDERS */}
        <div className="glass-panel" style={{ 
          padding: '24px 20px', 
          position: 'relative', 
          borderBottom: '3.5px solid #ea580c',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: 'var(--admin-text-soft)' }}>ORDERS</span>
              <div style={{ background: '#fff7ed', color: '#ea580c', padding: '6px', borderRadius: '8px' }}>
                <ShoppingCart size={16} />
              </div>
            </div>
            <strong style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--admin-text)', display: 'block', margin: '4px 0' }}>
              {data.totalOrders}
            </strong>
          </div>
          <small style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: 12 }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ea580c' }} />
            {data.pendingOrders} pending confirmation
          </small>
        </div>

        {/* Card 3: REVENUE */}
        <div className="glass-panel" style={{ 
          padding: '24px 20px', 
          position: 'relative', 
          borderBottom: '3.5px solid #16a34a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: 'var(--admin-text-soft)' }}>REVENUE</span>
              <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '6px', borderRadius: '8px' }}>
                <IndianRupee size={16} />
              </div>
            </div>
            <strong style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--admin-text)', display: 'block', margin: '4px 0' }}>
              ₹{data.totalSales.toLocaleString('en-IN')}
            </strong>
          </div>
          <small style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: 12 }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
            Total Earnings
          </small>
        </div>

        {/* Card 4: AVG ORDER */}
        <div className="glass-panel" style={{ 
          padding: '24px 20px', 
          position: 'relative', 
          borderBottom: '3.5px solid #9333ea',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: 'var(--admin-text-soft)' }}>AVG ORDER</span>
              <div style={{ background: '#faf5ff', color: '#9333ea', padding: '6px', borderRadius: '8px' }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <strong style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--admin-text)', display: 'block', margin: '4px 0' }}>
              ₹{avgOrderValue.toLocaleString('en-IN')}
            </strong>
          </div>
          <small style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: 12 }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#9333ea' }} />
            Per Order Average
          </small>
        </div>

      </div>

      {/* Main Dual-Column Grid */}
      <div className="admin-cyber-grid-2" style={{ marginBottom: 28 }}>
        
        {/* Left Column: Recent Orders */}
        <div className="glass-panel admin-cyber-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0 }}>Recent Orders</h3>
            <a 
              href="/admin?tab=orders" 
              onClick={(e) => {
                e.preventDefault();
                // Set the activePage in the parent context
                const btn = document.querySelector('button[class*="admin-cyber-nav__btn"] span:contains("Orders")') || 
                            document.querySelectorAll('button[class*="admin-cyber-nav__btn"]')[2];
                if (btn) btn.click();
              }}
              style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: 'var(--admin-plum)', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              View All <ArrowRight size={12} />
            </a>
          </div>

          <div className="admin-cyber-table-wrap">
            <table className="admin-cyber-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 10px', fontSize: '10px' }}>ORDER ID</th>
                  <th style={{ padding: '12px 10px', fontSize: '10px' }}>CUSTOMER</th>
                  <th style={{ padding: '12px 10px', fontSize: '10px' }}>AMOUNT</th>
                  <th style={{ padding: '12px 10px', fontSize: '10px' }}>STATUS</th>
                  <th style={{ padding: '12px 10px', fontSize: '10px' }}>DATE</th>
                </tr>
              </thead>
              <tbody>
                {(!data.recentOrders || data.recentOrders.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="admin-cyber-table-empty">No recent orders recorded.</td>
                  </tr>
                ) : (
                  data.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ padding: '12px 10px', fontWeight: '600', color: 'var(--admin-plum)' }}>
                        {o.id}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {o.customerName || o.email?.split('@')[0]}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: '600', color: 'var(--admin-text)' }}>
                        ₹{(o.grandTotal || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          background: o.status === 'Delivered' ? '#dcfce7' : 
                                      o.status === 'Cancelled' ? '#fee2e2' : 
                                      o.status === 'Shipped' ? '#e0f2fe' : '#fef3c7',
                          color: o.status === 'Delivered' ? '#166534' : 
                                 o.status === 'Cancelled' ? '#991b1b' : 
                                 o.status === 'Shipped' ? '#075985' : '#854d0e'
                        }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', fontSize: '12px' }}>
                        {new Date(o.createdAt || o.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Dynamic Weekly Sales Trend Chart (REAL-TIME DATA) */}
        <div className="glass-panel admin-cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: 4 }}>Weekly Sales Trend</h3>
            <span style={{ fontSize: '12px', color: 'var(--admin-text-soft)' }}>Revenue generated over the last 7 days</span>
          </div>

          <div
            className="admin-weekly-chart"
            style={{
            height: '180px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '20px 10px 10px',
            borderBottom: '1px solid var(--admin-border)',
            gap: '8px',
          }}
          >
            {(() => {
              const trendData = data.salesTrend || [];
              const maxRevenue = Math.max(...trendData.map((t) => t.revenue), 1);
              return trendData.map((d) => {
                const pct = Math.max((d.revenue / maxRevenue) * 100, 3); // Minimum 3% height for flat days to show a tiny baseline bar
                return (
                  <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                    <div className="admin-weekly-chart__label" style={{ fontSize: '9px', fontWeight: '600', color: 'var(--admin-text-soft)', marginBottom: 4 }}>
                      ₹{d.revenue.toLocaleString('en-IN')}
                    </div>
                    <div 
                      className="admin-cyber-chart-bar"
                      title={`₹${d.revenue.toLocaleString('en-IN')}`}
                      style={{
                        width: '100%',
                        maxWidth: '32px',
                        height: `${pct}%`,
                        background: d.revenue > 0 
                          ? 'linear-gradient(180deg, var(--admin-plum) 0%, var(--admin-gold) 100%)'
                          : 'rgba(96, 11, 69, 0.08)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.4s ease',
                        boxShadow: d.revenue > 0 ? '0 4px 12px rgba(96, 11, 69, 0.1)' : 'none',
                        position: 'relative'
                      }} 
                    />
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--admin-text-muted)', marginTop: 8 }}>
                      {d.day}
                    </span>
                  </div>
                );
              });
            })()}
          </div>

          <div className="admin-weekly-chart-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: '0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} style={{ color: 'var(--admin-plum)' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--admin-plum)' }}>
                ₹{((data.salesTrend || []).reduce((sum, t) => sum + t.revenue, 0)).toLocaleString('en-IN')} total this week
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--admin-text-soft)' }}>Updated live</span>
          </div>
        </div>

      </div>

      {/* Extra Details Row 2: Top Selling & Stock Alerts */}
      <div className="admin-cyber-grid-2">
        
        {/* Top Selling Products */}
        <div className="glass-panel admin-cyber-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={16} className="text-plum" />
            Top Selling Products
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--admin-text-soft)', marginTop: -8, marginBottom: 20 }}>
            Most demanded designer garments in customer orders
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(!data.topSelling || data.topSelling.length === 0) ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-text-soft)', fontSize: '13px' }}>
                Order data is required to calculate top-selling items.
              </div>
            ) : (
              data.topSelling.map((p, idx) => (
                <div key={p.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: idx < data.topSelling.length - 1 ? '1px solid var(--admin-border)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={p.image} 
                      alt="" 
                      style={{ width: '40px', height: '52px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--admin-border)' }} 
                    />
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--admin-text)', display: 'block' }}>{p.title}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--admin-text-soft)', textTransform: 'capitalize' }}>
                        {p.category} · ₹{p.price}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      background: 'var(--admin-plum-soft)', 
                      color: 'var(--admin-plum)', 
                      padding: '4px 10px', 
                      borderRadius: '12px' 
                    }}>
                      {p.sales} Sold
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock & Out of Stock Alerts */}
        <div className="glass-panel admin-cyber-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--admin-error)' }}>
            <AlertTriangle size={16} />
            Inventory Stock Alerts
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--admin-text-soft)', marginTop: -8, marginBottom: 20 }}>
            Immediate action needed on items with critically low stock
          </p>

          <div className="admin-cyber-alert-list" style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {data.outOfStock.length === 0 && data.lowStock.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '36px 12px', 
                color: 'var(--admin-success)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={32} />
                <span style={{ fontSize: '13px', fontWeight: '600' }}>All catalog items carry a healthy stock level!</span>
              </div>
            ) : (
              [...data.outOfStock, ...data.lowStock].slice(0, 4).map((p) => {
                const isOut = (p.stock ?? 0) <= 0;
                return (
                  <div key={p.id} className="admin-cyber-alert-item" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '10px 0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={p.image} alt="" style={{ width: '40px', height: '52px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <strong style={{ fontSize: '13px', color: 'var(--admin-text)', display: 'block' }}>{p.title}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--admin-text-soft)' }}>
                          SKU: LIB-{p.id} · {p.subCategory || p.category}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: isOut ? '#fef2f2' : '#fffbeb',
                        color: isOut ? 'var(--admin-error)' : '#d97706',
                        border: `1px solid ${isOut ? 'rgba(198,40,40,0.1)' : 'rgba(217,119,6,0.1)'}`
                      }}>
                        {isOut ? 'OUT OF STOCK' : `${p.stock} left`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Product Mix and Category Distribution Row */}
      <div className="glass-panel admin-cyber-card" style={{ marginTop: 28 }}>
        <h3>Catalog Product Mix</h3>
        <p style={{ fontSize: '12px', color: 'var(--admin-text-soft)', marginTop: -8, marginBottom: 20 }}>
          Breakdown of subcategories and active design stock items in your store database
        </p>

        <div className="admin-catalog-mix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '20px 30px' }}>
          {Object.entries(data.categoryMix)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([cat, count]) => {
              const pct = Math.round((count / data.totalProducts) * 100) || 0;
              return (
                <div key={cat} className="admin-cyber-bar-row" style={{ marginBottom: 0 }}>
                  <div className="admin-cyber-bar-row__meta" style={{ marginBottom: 4 }}>
                    <span className="capitalize" style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                      {cat}
                    </span>
                    <span style={{ fontWeight: '600' }}>
                      {count} items ({pct}%)
                    </span>
                  </div>
                  <div className="admin-cyber-bar-track" style={{ height: '8px', background: 'rgba(96,11,69,0.06)' }}>
                    <div 
                      className="admin-cyber-bar-fill" 
                      style={{ 
                        width: `${pct}%`, 
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--admin-plum) 0%, var(--admin-gold) 100%)',
                        borderRadius: '999px'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
