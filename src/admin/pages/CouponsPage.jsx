import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createCoupon, deleteCoupon, fetchAdminCoupons } from '../../api/adminApi';
import {
  COUPON_DISCOUNT_FLAT,
  COUPON_DISCOUNT_PERCENT,
  formatCouponDiscountShort,
} from '../../utils/couponDiscount';

export default function CouponsPage({ onToast }) {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState(COUPON_DISCOUNT_FLAT);
  const [minPurchase, setMinPurchase] = useState('');

  const load = () => fetchAdminCoupons().then((d) => setCoupons(d.coupons));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(discount);
    if (discountType === COUPON_DISCOUNT_PERCENT && (amount < 1 || amount > 100)) {
      onToast('Percentage discount must be between 1 and 100', 'error');
      return;
    }
    if (discountType === COUPON_DISCOUNT_FLAT && amount <= 0) {
      onToast('Flat discount must be greater than ₹0', 'error');
      return;
    }
    try {
      await createCoupon({
        code,
        discount: amount,
        discountType,
        minPurchase: Number(minPurchase),
      });
      setCode('');
      setDiscount('');
      setMinPurchase('');
      setDiscountType(COUPON_DISCOUNT_FLAT);
      onToast('Coupon activated');
      load();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleDelete = async (c) => {
    try {
      await deleteCoupon(c);
      onToast('Coupon removed');
      load();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  return (
    <div className="admin-cyber-page">
      <header className="admin-cyber-page__head">
        <h1>Promo Coupons</h1>
        <p>Manage applicable discount codes (₹ flat or % off)</p>
      </header>

      <div className="admin-cyber-grid-2">
        <form className="glass-panel admin-cyber-card" onSubmit={handleSubmit}>
          <h3>Create Dynamic Promo Code</h3>
          <label className="admin-cyber-label">
            Promo Code
            <input
              className="admin-cyber-input uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </label>

          <div className="admin-cyber-label">
            Discount type
            <div className="admin-coupon-type-toggle" role="group" aria-label="Discount type">
              <button
                type="button"
                className={`admin-coupon-type-btn${discountType === COUPON_DISCOUNT_FLAT ? ' is-active' : ''}`}
                onClick={() => setDiscountType(COUPON_DISCOUNT_FLAT)}
              >
                ₹ Rupees
              </button>
              <button
                type="button"
                className={`admin-coupon-type-btn${discountType === COUPON_DISCOUNT_PERCENT ? ' is-active' : ''}`}
                onClick={() => setDiscountType(COUPON_DISCOUNT_PERCENT)}
              >
                % Percent
              </button>
            </div>
          </div>

          <label className="admin-cyber-label">
            {discountType === COUPON_DISCOUNT_PERCENT ? 'Discount (%)' : 'Discount (₹)'}
            <input
              type="number"
              className="admin-cyber-input"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min={discountType === COUPON_DISCOUNT_PERCENT ? 1 : 1}
              max={discountType === COUPON_DISCOUNT_PERCENT ? 100 : undefined}
              step={discountType === COUPON_DISCOUNT_PERCENT ? 1 : 1}
              placeholder={discountType === COUPON_DISCOUNT_PERCENT ? 'e.g. 10' : 'e.g. 50'}
              required
            />
          </label>
          <label className="admin-cyber-label">
            Min Purchase (₹)
            <input
              type="number"
              className="admin-cyber-input"
              value={minPurchase}
              onChange={(e) => setMinPurchase(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="admin-cyber-btn admin-cyber-btn--primary">
            <Plus size={16} /> Activate Coupon
          </button>
        </form>

        <div className="glass-panel admin-cyber-card">
          <h3>Active Promo Codes</h3>
          <div className="admin-cyber-coupon-list">
            {coupons.map((c) => (
              <div key={c.code} className="admin-cyber-coupon">
                <div>
                  <strong>{c.code}</strong>
                  <span>
                    {formatCouponDiscountShort(c)} · min ₹{c.minPurchase}
                  </span>
                </div>
                <button
                  type="button"
                  className="admin-cyber-btn admin-cyber-btn--danger"
                  disabled={c.code === 'SALE100'}
                  onClick={() => handleDelete(c.code)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
