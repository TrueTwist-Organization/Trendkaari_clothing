/** Live promo codes from admin — cart, checkout, PDP, quick view */

import { formatCouponDiscountShort } from '../utils/couponDiscount';

export function formatCouponOffer(coupon) {
  const min = Number(coupon.minPurchase) || 0;
  const off = formatCouponDiscountShort(coupon);
  const code = String(coupon.code || '').toUpperCase();
  return (
    <>
      Shop <strong>₹{min}+</strong> & get <strong>{off}</strong> | Code:{' '}
      <span className="pdp-promo-code promo-code">{code}</span>
    </>
  );
}

export default function StoreCouponsPromo({
  coupons = [],
  className = 'pdp-promos-container',
  headerClassName = 'pdp-promos-header',
  listClassName = 'pdp-promos-list',
  dotClassName = 'pdp-promo-dot',
  title = '⚡ EXCLUSIVE ONLINE OFFERS & COUPONS',
  showFreeShipping = true,
  maxItems = 6,
}) {
  const active = (coupons || []).filter((c) => c?.code).slice(0, maxItems);

  if (!active.length && !showFreeShipping) return null;

  return (
    <div className={className}>
      <div className={headerClassName}>{title}</div>
      <ul className={listClassName}>
        {active.map((c) => (
          <li key={c.code}>
            <span className={dotClassName}>•</span>
            <span>{formatCouponOffer(c)}</span>
          </li>
        ))}
        {showFreeShipping && (
          <li>
            <span className={dotClassName}>•</span>
            <span>
              <strong>Free shipping</strong> on all orders across India
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
