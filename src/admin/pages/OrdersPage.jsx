import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteOrder, fetchAdminOrders, updateOrderStatus } from '../../api/adminApi';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function formatItemsSummary(items = []) {
  if (!items.length) return '—';
  if (items.length === 1) {
    const item = items[0];
    return `${item.title} · ${item.selectedSize} · Qty ${item.quantity}`;
  }
  return `${items.length} items`;
}

export default function OrdersPage({ onToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchAdminOrders()
      .then((d) => setOrders(d.orders))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatus = async (orderId, status) => {
    try {
      const data = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      onToast(`Order ${orderId} → ${status}`);
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this order log?')) return;
    await deleteOrder(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    onToast('Order deleted');
  };

  if (loading) {
    return (
      <div className="admin-cyber-page">
        <span className="admin-chrome-loader admin-chrome-loader--lg" />
      </div>
    );
  }

  return (
    <div className="admin-cyber-page">
      <header className="admin-cyber-page__head">
        <h1>Order Control & Logistics</h1>
        <p>{orders.length} customer shipments</p>
      </header>

      {orders.length === 0 ? (
        <p className="admin-cyber-muted glass-panel">No orders recorded yet.</p>
      ) : (
        <div className="admin-cyber-table-wrap glass-panel admin-cyber-orders-table-wrap">
          <table className="admin-cyber-table admin-cyber-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Products</th>
                <th>Total</th>
                <th>Status</th>
                <th className="admin-cyber-table__actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const firstItem = order.items?.[0];
                return (
                  <tr key={order.id}>
                    <td>
                      <strong className="admin-cyber-orders-table__id">{order.id}</strong>
                    </td>
                    <td className="admin-cyber-orders-table__date">{order.date}</td>
                    <td className="admin-cyber-orders-table__customer">
                      <b>{order.customerName}</b>
                      <span>{order.email}</span>
                      <span>{order.phone}</span>
                    </td>
                    <td className="admin-cyber-orders-table__address">{order.address}</td>
                    <td className="admin-cyber-orders-table__products">
                      {order.items?.length === 1 && firstItem ? (
                        <div className="admin-cyber-table-product">
                          <img src={firstItem.image} alt="" />
                          <div>
                            <div>{firstItem.title}</div>
                            <span>
                              {firstItem.selectedSize} · Qty {firstItem.quantity} · ₹
                              {firstItem.price * firstItem.quantity}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <ul className="admin-cyber-orders-table__product-list">
                          {order.items?.map((item, idx) => (
                            <li key={idx}>
                              <img src={item.image} alt="" />
                              <div>
                                <div>{item.title}</div>
                                <span>
                                  {item.selectedSize} · Qty {item.quantity} · ₹
                                  {item.price * item.quantity}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      {order.items?.length > 1 && (
                        <span className="admin-cyber-orders-table__items-meta">
                          {formatItemsSummary(order.items)}
                        </span>
                      )}
                    </td>
                    <td className="admin-cyber-orders-table__total">
                      <div>₹{order.grandTotal}</div>
                      <span>
                        {order.paymentStatus || 'Paid'}
                      </span>
                    </td>
                    <td>
                      <select
                        className="admin-cyber-input admin-cyber-status-select admin-cyber-orders-table__status"
                        value={order.status}
                        onChange={(e) => handleStatus(order.id, e.target.value)}
                        aria-label={`Status for ${order.id}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="admin-cyber-table-actions">
                        <button
                          type="button"
                          className="admin-cyber-btn admin-cyber-btn--danger admin-cyber-btn--sm"
                          onClick={() => handleDelete(order.id)}
                          title="Delete order log"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
