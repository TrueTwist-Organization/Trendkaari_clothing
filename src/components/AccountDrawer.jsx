import { useEffect, useState } from 'react';
import { X, LogOut, Package, User } from 'lucide-react';
import { fetchUserOrders, cancelUserOrder } from '../api/userApi';
import { setUserToken } from '../api/client';
import { canCancelOrder, formatCancelTimeLeft, getCancelWindowRemainingMs } from '../utils/orderCancel';
import './AccountDrawer.css';

export default function AccountDrawer({ isOpen, onClose, user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    if (!isOpen || !user) return;
    setLoading(true);
    fetchUserOrders()
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    setUserToken(null);
    onLogout();
    onClose();
  };

  const handleCancelOrder = async (order) => {
    const timeLeft = formatCancelTimeLeft(getCancelWindowRemainingMs(order));
    const confirmed = window.confirm(
      `Cancel order ${order.id}?\n\nThis can only be done within 24 hours of placing the order.${timeLeft ? `\n(${timeLeft})` : ''}`
    );
    if (!confirmed) return;

    setCancelError('');
    setCancellingId(order.id);
    try {
      const result = await cancelUserOrder(order.id);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, ...result.order, status: 'Cancelled' } : o))
      );
    } catch (err) {
      setCancelError(err?.message || 'Could not cancel order. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="account-drawer-overlay active">
      <div className="account-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="drawer drawer-right account-drawer active">
        <div className="drawer-header account-drawer-header">
          <div className="account-title-row">
            <User size={18} />
            <span>My Account</span>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content account-drawer-content">
          <div className="account-user-card">
            <div className="account-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
              {user?.phone && <span>{user.phone}</span>}
            </div>
          </div>

          <h4 className="account-section-title">
            <Package size={16} /> My Orders
          </h4>

          {loading ? (
            <p className="account-muted">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="account-muted">No orders yet. Start shopping!</p>
          ) : (
            <>
              {cancelError && <p className="account-cancel-error">{cancelError}</p>}
              <ul className="account-orders-list">
                {orders.map((order) => {
                  const cancellable = canCancelOrder(order);
                  const timeLeft = formatCancelTimeLeft(getCancelWindowRemainingMs(order));
                  const isCancelling = cancellingId === order.id;

                  return (
                    <li key={order.id} className="account-order-card">
                      <div className="account-order-top">
                        <strong>{order.id}</strong>
                        <span
                          className={`account-status account-status--${String(order.status || '')
                            .toLowerCase()
                            .replace(/\s+/g, '-')}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <span className="account-order-meta">{order.date}</span>
                      <span className="account-order-total">₹{order.grandTotal}</span>
                      <span className="account-order-items">
                        {order.items?.length} item(s)
                      </span>
                      {String(order.status || '').toLowerCase() === 'processing' && (
                        <p className="account-cancel-hint account-cancel-hint--confirmed">
                          Order confirmed — preparing for dispatch
                        </p>
                      )}
                      {cancellable && (
                        <div className="account-order-cancel-wrap">
                          <span className="account-cancel-hint">
                            {timeLeft} · auto-confirms after 24 hours
                          </span>
                          <button
                            type="button"
                            className="account-cancel-order-btn"
                            disabled={isCancelling}
                            onClick={() => handleCancelOrder(order)}
                          >
                            {isCancelling ? 'Cancelling…' : 'Cancel order'}
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <button type="button" className="btn btn-outline account-logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
