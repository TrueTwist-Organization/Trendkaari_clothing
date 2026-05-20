import { useState } from 'react';
import { ChevronDown, Tag, X } from 'lucide-react';

export default function OrderSummary({
  cartItems,
  subtotal,
  discount,
  shipping = 0,
  tax = 0,
  grandTotal,
  coupons = [],
  couponCode,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
  couponError,
  appliedCoupon,
  compact = false,
}) {
  const [open, setOpen] = useState(!compact);

  const inner = (
    <>
      <div className="co-summary-items">
        {cartItems.map((item) => (
          <div key={`${item.id}-${item.selectedSize}`} className="co-summary-item">
            <img src={item.image} alt="" className="co-summary-thumb" />
            <div className="co-summary-meta">
              <span className="co-summary-title">{item.title}</span>
              <span className="co-summary-variant">
                Size {item.selectedSize} · Qty {item.quantity}
              </span>
              <span className="co-summary-price">₹{item.price * item.quantity}</span>
            </div>
          </div>
        ))}
      </div>

      {!compact && (
        <form
          className="co-coupon-row"
          onSubmit={(e) => {
            e.preventDefault();
            onApplyCoupon?.();
          }}
        >
          <Tag size={14} aria-hidden />
          <input
            type="text"
            placeholder="Promo code"
            value={couponCode}
            onChange={(e) => onCouponCodeChange?.(e.target.value)}
            className="co-coupon-input"
          />
          {appliedCoupon ? (
            <button type="button" className="co-coupon-btn co-coupon-remove" onClick={onRemoveCoupon}>
              <X size={14} />
            </button>
          ) : (
            <button type="submit" className="co-coupon-btn">
              Apply
            </button>
          )}
        </form>
      )}
      {couponError && <p className="co-field-error co-coupon-err">{couponError}</p>}
      {appliedCoupon && (
        <p className="co-coupon-applied">
          {appliedCoupon.code} applied (−₹{discount})
        </p>
      )}

      <div className="co-totals">
        <div className="co-total-row">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        {discount > 0 && (
          <div className="co-total-row co-discount">
            <span>Discount</span>
            <span>−₹{discount}</span>
          </div>
        )}
        <div className="co-total-row">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
        </div>
        {tax > 0 && (
          <div className="co-total-row">
            <span>Tax</span>
            <span>₹{tax}</span>
          </div>
        )}
        <div className="co-total-row co-grand">
          <span>Total</span>
          <strong>₹{grandTotal}</strong>
        </div>
      </div>
    </>
  );

  if (compact) {
    return (
      <div className="co-order-summary co-order-summary--accordion">
        <button
          type="button"
          className="co-summary-accordion-head"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span>Order summary ({cartItems.length})</span>
          <span className="co-summary-accordion-total">₹{grandTotal}</span>
          <ChevronDown size={18} className={open ? 'rotated' : ''} />
        </button>
        {open && <div className="co-summary-accordion-body">{inner}</div>}
      </div>
    );
  }

  return (
    <div className="co-order-summary">
      <h3 className="co-summary-heading">Order Summary</h3>
      {inner}
    </div>
  );
}
