import { useEffect, useState } from 'react';
import { adminMe } from '../api/adminApi';
import { getAdminToken, setAdminToken } from '../api/client';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import CouponsPage from './pages/CouponsPage';
import SettingsPage from './pages/SettingsPage';
import AdSlotsPage from './pages/AdSlotsPage';
import GiftCombosPage from './pages/GiftCombosPage';
import Toast from './components/Toast';
import './admin-theme.css';

export default function AdminApp() {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState('dashboard');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setChecking(false);
      return;
    }
    adminMe()
      .then((d) => setAdmin(d.admin))
      .catch(() => setAdminToken(null))
      .finally(() => setChecking(false));
  }, []);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleLogout = () => {
    setAdminToken(null);
    setAdmin(null);
    window.location.href = '/admin';
  };

  if (checking) {
    return (
      <div className="admin-cyber-boot">
        <span className="admin-chrome-loader admin-chrome-loader--lg" />
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin onSuccess={setAdmin} />;
  }

  return (
    <>
      <AdminLayout admin={admin} activePage={page} onNavigate={setPage} onLogout={handleLogout}>
        {page === 'dashboard' && <DashboardPage />}
        {page === 'products' && <ProductsPage onToast={showToast} />}
        {page === 'orders' && <OrdersPage onToast={showToast} />}
        {page === 'coupons' && <CouponsPage onToast={showToast} />}
        {page === 'settings' && <SettingsPage onToast={showToast} />}
        {page === 'ad-slots' && <AdSlotsPage onToast={showToast} />}
        {page === 'gift-combos' && <GiftCombosPage onToast={showToast} />}
      </AdminLayout>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}
