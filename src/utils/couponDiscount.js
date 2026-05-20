/** Coupon discount: flat ₹ or percentage of cart subtotal */

export const COUPON_DISCOUNT_FLAT = 'flat';
export const COUPON_DISCOUNT_PERCENT = 'percent';

export function normalizeCouponDiscountType(coupon) {
  const raw = String(coupon?.discountType || 'flat').toLowerCase();
  if (raw === 'percent' || raw === '%' || raw === 'percentage') {
    return COUPON_DISCOUNT_PERCENT;
  }
  return COUPON_DISCOUNT_FLAT;
}

/** Rupee amount to subtract from subtotal */
export function computeCouponDiscountAmount(coupon, subtotal) {
  if (!coupon) return 0;
  const st = Math.max(0, Number(subtotal) || 0);
  const value = Number(coupon.discount) || 0;
  if (normalizeCouponDiscountType(coupon) === COUPON_DISCOUNT_PERCENT) {
    const pct = Math.min(100, Math.max(0, value));
    return Math.round((st * pct) / 100);
  }
  return Math.min(st, Math.max(0, value));
}

export function formatCouponDiscountShort(coupon) {
  const value = Number(coupon?.discount) || 0;
  if (normalizeCouponDiscountType(coupon) === COUPON_DISCOUNT_PERCENT) {
    return `${value}% off`;
  }
  return `₹${value} off`;
}

export function formatCouponOfferText(coupon) {
  const min = Number(coupon?.minPurchase) || 0;
  const off = formatCouponDiscountShort(coupon);
  const code = String(coupon?.code || '').toUpperCase();
  return { min, off, code };
}
