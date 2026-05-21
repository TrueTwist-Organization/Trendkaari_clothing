import { useEffect, useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Tag, Settings, Image, Gift, LogOut, Store } from 'lucide-react';
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

  useEffect(() => {
    checkApiHealth().then(setApiOnline);
    const id = setInterval(() => checkApiHealth().then(setApiOnline), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="admin-cyber-shell">
      <aside className="admin-cyber-sidebar glass-panel">
        <div className="admin-cyber-sidebar__head">
          <span className="admin-cyber-sidebar__badge">Admin Portal</span>
          <h2>trendkaari</h2>
          <p>{admin?.email}</p>
        </div>

        <nav className="admin-cyber-nav">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`admin-cyber-nav__btn${activePage === id ? ' is-active' : ''}`}
              onClick={() => onNavigate(id)}
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

      <main className="admin-cyber-main">{children}</main>
    </div>
  );
}
