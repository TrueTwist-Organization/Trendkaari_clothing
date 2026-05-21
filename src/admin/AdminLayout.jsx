import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Settings,
  Image,
  Gift,
  LogOut,
  Store,
  Menu,
  X,
} from 'lucide-react';
import { checkApiHealth } from '../api/client';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Inventory', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'ad-slots', label: 'Ad Slots', icon: Image },
  { id: 'gift-combos', label: 'Gift Combos', icon: Gift },
];

export default function AdminLayout({ admin, activePage, onNavigate, onLogout, children }) {
  const [apiOnline, setApiOnline] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkApiHealth().then(setApiOnline);
    const id = setInterval(() => checkApiHealth().then(setApiOnline), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [sidebarOpen]);

  const handleNavigate = (id) => {
    onNavigate(id);
    setSidebarOpen(false);
  };

  return (
    <div className={`admin-cyber-shell${sidebarOpen ? ' admin-cyber-shell--nav-open' : ''}`}>
      <button
        type="button"
        className="admin-sidebar-backdrop"
        aria-label="Close menu"
        onClick={() => setSidebarOpen(false)}
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <aside className={`admin-cyber-sidebar glass-panel${sidebarOpen ? ' is-open' : ''}`}>
        <div className="admin-cyber-sidebar__head">
          <span className="admin-cyber-sidebar__badge">Admin Portal</span>
          <h2>trendkaari</h2>
          <p className="admin-cyber-sidebar__role">Signed in</p>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-cyber-nav">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`admin-cyber-nav__btn${activePage === id ? ' is-active' : ''}`}
              onClick={() => handleNavigate(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-cyber-sidebar__foot">
          <div className={`admin-cyber-status${apiOnline === false ? ' admin-cyber-status--offline' : ''}`}>
            <span className="admin-cyber-status__dot" />
            {apiOnline === false ? 'API Offline — run npm run dev' : 'Database Sync: ONLINE'}
          </div>
          <a href="/" className="admin-cyber-nav__btn">
            <Store size={16} />
            <span>View Store</span>
          </a>
          <button type="button" className="admin-cyber-nav__btn admin-cyber-nav__btn--logout" onClick={onLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-cyber-shell__body">
        <header className="admin-mobile-topbar">
          <button
            type="button"
            className="admin-mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
          >
            <Menu size={22} />
          </button>
          <div className="admin-mobile-topbar__brand">
            <span className="admin-mobile-topbar__badge">Admin</span>
            <strong>trendkaari</strong>
          </div>
        </header>

        <main className="admin-cyber-main">{children}</main>
      </div>
    </div>
  );
}
