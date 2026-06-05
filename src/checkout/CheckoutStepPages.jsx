import {
  Mail,
  Phone,
  MapPin,
  User,
  Home,
  Building2,
  Truck,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Tag,
  ShoppingBag,
} from 'lucide-react';
import OrderSummary from './OrderSummary';
import OrderSuccess from './OrderSuccess';
import CheckoutStepPageShell from './CheckoutStepPageShell';
import { CheckoutFreeShipBar } from './CheckoutStepExtras';
import { SUCCESS_STEP_INDEX } from './checkoutSteps';
import { formatCouponDiscountShort } from '../utils/couponDiscount';

function wrapStep(stepIndex, node, adCodes, shellProps = {}) {
  return (
    <CheckoutStepPageShell step={stepIndex} adCodes={adCodes} {...shellProps}>
      {node}
    </CheckoutStepPageShell>
  );
}

function NavRow({ onBack, onNext, backLabel = 'Back', nextLabel = 'Continue', nextDisabled, nextLoading }) {
  const handleNext = () => {
    if (nextDisabled || nextLoading || !onNext) return;
    try {
      const result = onNext();
      if (result && typeof result.then === 'function') {
        result.catch(() => {});
      }
    } catch {
      /* validation handlers surface their own errors */
    }
  };

  return (
    <div className="co-cta-row">
      {onBack && (
        <button type="button" className="co-btn-back" onClick={onBack}>
          {backLabel}
        </button>
      )}
      <button
        type="button"
        className={`co-btn-primary ${nextLoading ? 'loading' : ''}`}
        disabled={nextDisabled || nextLoading}
        onClick={handleNext}
      >
        {nextLoading ? 'Please wait…' : nextLabel}
      </button>
    </div>
  );
}

export default function CheckoutStepPages({ step, ctx }) {
  const {
    transition,
    cartItems,
    coupons,
    adCodes,
    stored,
    subtotal,
    discount,
    shipping,
    tax,
    grandTotal,
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    handleApplyCoupon,
    handleRemoveCoupon,
    onUpdateQty,
    onRemoveItem,
    error,
    fieldErrors,
    goStep,
    validateShippingContact,
    validateShippingAddress,
    proceedToPayment,
    updateShipping,
    pinInfo,
    shipLoading,
    paymentProcessing,
    paymentFail,
    placeOrder,
    updatePayment,
    completedOrder,
    successPause,
    onContinueShopping,
    onClose,
    reservedMinutes,
    PAY_METHODS,
    MapUnfoldIllustration,
    allProducts = [],
    onAddToCart,
    onSelectProduct,
  } = ctx;

  const shellProps = {
    cartItems,
    subtotal,
    allProducts,
    onAddToCart,
    onSelectProduct,
  };

  const saleCoupon = coupons.find((c) => c.code === 'SALE100') || coupons[0];
  const promoMin = saleCoupon?.minPurchase ?? 199;
  const promoOffLabel = saleCoupon ? formatCouponDiscountShort(saleCoupon) : '₹20 off';
  const promoCode = saleCoupon?.code ?? 'SALE100';

  const cardClass = `co-glass-card co-page-card ${transition || 'co-step-enter'}`;

  if (step === 0) {
    if (!cartItems.length) {
      return wrapStep(
        0,
        (
          <div className={cardClass}>
            <h2 className="co-step-heading">Your bag is empty</h2>
            <p className="co-step-sub">Add items to start checkout.</p>
            <button type="button" className="co-btn-primary" onClick={onClose}>
              Continue shopping
            </button>
          </div>
        ),
        adCodes,
        shellProps
      );
    }
    return wrapStep(
      0,
      (
        <div className={cardClass}>
          <div className="co-page-head">
            <span className="co-page-badge">01</span>
            <div>
              <h2 className="co-step-heading">My shopping bag</h2>
              <p className="co-step-sub">
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} · ₹{subtotal}
              </p>
            </div>
          </div>
          <div className="co-bag-list">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="co-bag-row">
                <img src={item.image} alt="" className="co-bag-thumb" />
                <div className="co-bag-meta">
                  <span className="co-bag-title">{item.title}</span>
                  <span className="co-bag-size">Size {item.selectedSize}</span>
                  <div className="co-bag-qty">
                    <button
                      type="button"
                      className="co-bag-qty-btn"
                      disabled={item.quantity <= 1}
                      onClick={() => onUpdateQty?.(item.id, item.selectedSize, item.quantity - 1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      className="co-bag-qty-btn"
                      onClick={() => onUpdateQty?.(item.id, item.selectedSize, item.quantity + 1)}
                    >
                      <Plus size={12} />
                    </button>
                    <span className="co-bag-price">₹{item.price * item.quantity}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="co-bag-remove"
                  onClick={() => onRemoveItem?.(item.id, item.selectedSize)}
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <CheckoutFreeShipBar subtotal={subtotal} />
          <div className="co-bag-total-strip">
            <div className="co-bag-total-strip__row">
              <span>Bag subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            <p className="co-bag-total-strip__note">
              <ShoppingBag size={14} aria-hidden /> Free shipping on this order
            </p>
          </div>
          <NavRow onNext={() => goStep(1)} nextLabel="Continue to savings" />
        </div>
      ),
      adCodes,
      shellProps
    );
  }

  if (step === 1) {
    return wrapStep(
      1,
      (
        <div className={cardClass}>
          <div className="co-page-head">
            <span className="co-page-badge">02</span>
            <div>
              <h2 className="co-step-heading">Unlock savings</h2>
              <p className="co-step-sub">Apply offers before you pay</p>
            </div>
          </div>
          {subtotal < promoMin ? (
            <div className="co-promo-banner">
              <Sparkles size={16} />
              <span>
                Add <strong>₹{promoMin - subtotal}</strong> more to unlock {promoOffLabel}! Code:{' '}
                <strong>{promoCode}</strong>
              </span>
            </div>
          ) : (
            <div className="co-promo-banner co-promo-banner--ok">
              <Sparkles size={16} />
              <span>
                You unlocked {promoOffLabel}! Use code <strong>{promoCode}</strong> below.
              </span>
            </div>
          )}
          <div className="co-savings-panel">
            <h3 className="co-savings-panel__title">
              <Tag size={16} /> Promo code
            </h3>
            <form
              className="co-coupon-row co-coupon-row--page"
              onSubmit={(e) => {
                e.preventDefault();
                handleApplyCoupon();
              }}
            >
              <input
                type="text"
                placeholder="e.g. SALE100"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              {appliedCoupon ? (
                <button type="button" className="co-coupon-btn" onClick={handleRemoveCoupon}>
                  Remove
                </button>
              ) : (
                <button type="submit" className="co-coupon-btn">
                  Apply
                </button>
              )}
            </form>
            {couponError && <p className="co-field-error">{couponError}</p>}
            {appliedCoupon && (
              <p className="co-coupon-applied">
                {appliedCoupon.code} applied (−₹{discount})
              </p>
            )}
          </div>
          <NavRow onBack={() => goStep(0)} onNext={() => goStep(2)} nextLabel="View order total" />
        </div>
      ),
      adCodes,
      shellProps
    );
  }

  if (step === 2) {
    return wrapStep(
      2,
      (
        <div className={cardClass}>
          <div className="co-page-head">
            <span className="co-page-badge">03</span>
            <div>
              <h2 className="co-step-heading">Order total</h2>
              <p className="co-step-sub">Confirm amounts before delivery details</p>
            </div>
          </div>
          <div className="co-totals co-totals--page">
            <div className="co-total-row">
              <span>Bag subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="co-total-row co-discount">
                <span>Coupon</span>
                <span>−₹{discount}</span>
              </div>
            )}
            <div className="co-total-row">
              <span>Shipping</span>
              <span className="co-free">FREE</span>
            </div>
            <div className="co-total-row co-grand">
              <span>Grand total</span>
              <strong>₹{grandTotal}</strong>
            </div>
          </div>
          <NavRow onBack={() => goStep(1)} onNext={() => goStep(3)} nextLabel="Continue — contact" />
        </div>
      ),
      adCodes,
      shellProps
    );
  }

  if (step === 3) {
    return wrapStep(
      3,
      (
        <form
          className={cardClass}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            validateShippingContact();
          }}
        >
          <div className="co-page-head">
            <span className="co-page-badge">04</span>
            <div>
              <h2 className="co-step-heading">Contact details</h2>
              <p className="co-step-sub">Who should receive this order?</p>
            </div>
          </div>
          <div className="co-field">
            <User size={18} className="co-field-icon" />
            <input
              placeholder=" "
              value={stored.shipping?.fullName || ''}
              onChange={(e) => updateShipping('fullName', e.target.value)}
            />
            <label>Full name</label>
            {fieldErrors.fullName && <p className="co-field-error">{fieldErrors.fullName}</p>}
          </div>
          <div className="co-contact-alt">
            <p className="co-contact-alt__heading">
              <span className="co-contact-alt__icons" aria-hidden>
                <Mail size={16} />
                <Phone size={16} />
              </span>
              Email / phone
              <span className="co-contact-alt__hint">Fill either one</span>
            </p>
            <div className="co-field">
              <Mail size={18} className="co-field-icon" />
              <input
                type="email"
                placeholder=" "
                value={stored.shipping?.email || stored.login?.email || ''}
                onChange={(e) => updateShipping('email', e.target.value)}
                autoComplete="email"
              />
              <label>Email</label>
              {fieldErrors.email && <p className="co-field-error">{fieldErrors.email}</p>}
            </div>
            <div className="co-or-divider co-contact-alt__or" aria-hidden>
              <span className="co-or-line" />
              <span>or</span>
              <span className="co-or-line" />
            </div>
            <div className="co-field">
              <Phone size={18} className="co-field-icon" />
              <input
                type="tel"
                placeholder=" "
                value={stored.shipping?.phone || ''}
                onChange={(e) => updateShipping('phone', e.target.value)}
                autoComplete="tel"
              />
              <label>Phone</label>
              {fieldErrors.phone && <p className="co-field-error">{fieldErrors.phone}</p>}
            </div>
            {fieldErrors.contact && (
              <p className="co-field-error co-contact-alt__error" role="alert">
                {fieldErrors.contact}
              </p>
            )}
          </div>
          <NavRow
            onBack={() => goStep(2)}
            onNext={validateShippingContact}
            nextLabel="Continue — address"
          />
        </form>
      ),
      adCodes,
      shellProps
    );
  }

  if (step === 4) {
    return wrapStep(
      4,
      (
        <form
          className={`${cardClass} co-ship-form`}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            validateShippingAddress();
          }}
        >
          <div className="co-page-head">
            <span className="co-page-badge">05</span>
            <div>
              <h2 className="co-step-heading">Delivery address</h2>
              <p className="co-step-sub">Where should we ship your order?</p>
            </div>
          </div>
          <MapUnfoldIllustration />
          <div className="co-address-type-pills">
            {['home', 'office', 'other'].map((t) => (
              <button
                key={t}
                type="button"
                className={stored.shipping?.addressType === t ? 'active' : ''}
                onClick={() => updateShipping('addressType', t)}
              >
                {t === 'home' ? <Home size={12} /> : null}
                {t === 'office' ? <Building2 size={12} /> : null}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="co-field">
            <MapPin size={18} className="co-field-icon" />
            <textarea
              placeholder=" "
              rows={2}
              value={stored.shipping?.address || ''}
              onChange={(e) => updateShipping('address', e.target.value)}
            />
            <label>Street address</label>
            {fieldErrors.address && <p className="co-field-error">{fieldErrors.address}</p>}
          </div>
          <div className="co-form-row co-form-row--2">
            <div className="co-field">
              <input
                placeholder=" "
                value={stored.shipping?.apartment || ''}
                onChange={(e) => updateShipping('apartment', e.target.value)}
              />
              <label>Apartment / floor</label>
            </div>
            <div className="co-field">
              <input
                placeholder=" "
                value={stored.shipping?.landmark || ''}
                onChange={(e) => updateShipping('landmark', e.target.value)}
              />
              <label>Landmark</label>
            </div>
          </div>
          <div className="co-form-row co-form-row--3">
            <div className="co-field">
              <input
                placeholder=" "
                value={stored.shipping?.city || ''}
                onChange={(e) => updateShipping('city', e.target.value)}
              />
              <label>City</label>
              {fieldErrors.city && <p className="co-field-error">{fieldErrors.city}</p>}
            </div>
            <div className="co-field">
              <input
                placeholder=" "
                value={stored.shipping?.state || ''}
                onChange={(e) => updateShipping('state', e.target.value)}
              />
              <label>State</label>
              {fieldErrors.state && <p className="co-field-error">{fieldErrors.state}</p>}
            </div>
            <div className="co-field">
              <input
                placeholder=" "
                maxLength={6}
                value={stored.shipping?.pincode || ''}
                onChange={(e) => updateShipping('pincode', e.target.value)}
              />
              <label>Pincode</label>
              {fieldErrors.pincode && <p className="co-field-error">{fieldErrors.pincode}</p>}
            </div>
          </div>
          <div className="co-field">
            <textarea
              placeholder=" "
              rows={2}
              value={stored.shipping?.notes || ''}
              onChange={(e) => updateShipping('notes', e.target.value)}
            />
            <label>Delivery notes (optional)</label>
          </div>
          <label className="co-check-row">
            <input
              type="checkbox"
              checked={stored.shipping?.saveAddress}
              onChange={(e) => updateShipping('saveAddress', e.target.checked)}
            />
            Save this address for next time
          </label>
          {pinInfo.ok && (
            <div className="co-eta-card">
              <Truck size={20} color="#27AE60" />
              <span>
                Estimated delivery: <strong>{pinInfo.eta}</strong>
              </span>
            </div>
          )}
          {error && <p className="co-field-error co-step-error-banner">{error}</p>}
          <NavRow
            onBack={() => goStep(3)}
            onNext={validateShippingAddress}
            nextLabel="Review order"
            nextLoading={shipLoading}
          />
        </form>
      ),
      adCodes,
      shellProps
    );
  }

  if (step === 5) {
    return wrapStep(
      5,
      (
        <div className={`${cardClass} co-page-card--review`}>
          <div className="co-page-head">
            <span className="co-page-badge">06</span>
            <div>
              <h2 className="co-step-heading">Review items</h2>
              <p className="co-step-sub">Check everything in your bag</p>
            </div>
          </div>
          <div className="co-summary-items co-summary-items--only">
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
          <NavRow onBack={() => goStep(4)} onNext={() => goStep(6)} nextLabel="Continue — summary" />
        </div>
      ),
      adCodes,
      shellProps
    );
  }

  if (step === 6) {
    return wrapStep(
      6,
      (
        <div className={`${cardClass} co-page-card--review`}>
          <div className="co-page-head">
            <span className="co-page-badge">07</span>
            <div>
              <h2 className="co-step-heading">Order summary</h2>
              <p className="co-step-sub">Delivery details & final totals</p>
            </div>
          </div>
          <div className="co-review-ship-snippet">
            <MapPin size={16} />
            <div>
              <strong>{stored.shipping?.fullName}</strong>
              <p>
                {[stored.shipping?.phone, stored.shipping?.email].filter(Boolean).join(' · ')}
                <br />
                {stored.shipping?.address}, {stored.shipping?.city} — {stored.shipping?.pincode}
              </p>
              <button type="button" className="co-link-btn" onClick={() => goStep(4)}>
                Edit address
              </button>
            </div>
          </div>
          <OrderSummary
            cartItems={cartItems}
            subtotal={subtotal}
            discount={discount}
            shipping={shipping}
            tax={tax}
            grandTotal={grandTotal}
            couponCode={couponCode}
            onCouponCodeChange={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            couponError={couponError}
            appliedCoupon={appliedCoupon}
            compact
          />
          <NavRow onBack={() => goStep(5)} onNext={proceedToPayment} nextLabel="Proceed to payment" />
        </div>
      ),
      adCodes,
      shellProps
    );
  }

  if (step === 7) {
    return wrapStep(
      7,
      (
        <div className={cardClass}>
          <div className="co-page-head">
            <span className="co-page-badge">08</span>
            <div>
              <h2 className="co-step-heading">Payment</h2>
              <p className="co-step-sub">Pay ₹{grandTotal} · secure checkout</p>
            </div>
          </div>
          {reservedMinutes > 0 && (
            <div className="co-fashion-alert">
              Complete within {reservedMinutes} min — items reserved
            </div>
          )}
          <div className="co-pay-methods" role="tablist">
            {PAY_METHODS.map((m) => {
              const isActive = stored.payment?.method === m.id;
              const isAvailable = m.available;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  disabled={!isAvailable}
                  className={`co-pay-method ${isActive ? 'active' : ''} ${!isAvailable ? 'co-pay-method--soon' : ''}`}
                  onClick={() => isAvailable && updatePayment('method', m.id)}
                >
                  {m.label}
                  {!isAvailable && <span className="co-pay-soon">Soon</span>}
                </button>
              );
            })}
          </div>
          {stored.payment?.method === 'cod' && (
            <div className="co-glass-card co-cod-box">
              <p>Cash on Delivery — pay ₹{grandTotal} when your order arrives.</p>
              <label className="co-check-row">
                <input
                  type="checkbox"
                  checked={stored.payment?.codConfirmed}
                  onChange={(e) => updatePayment('codConfirmed', e.target.checked)}
                />
                I confirm COD for ₹{grandTotal}
              </label>
            </div>
          )}
          {paymentFail && <p className="co-field-error">Payment failed — try again.</p>}
          {error && <p className="co-field-error">{error}</p>}
          <NavRow
            onBack={() => goStep(6)}
            onNext={placeOrder}
            nextLabel={paymentProcessing ? 'Processing…' : 'Place order'}
            nextLoading={paymentProcessing}
          />
        </div>
      ),
      adCodes,
      shellProps
    );
  }

  if (step === SUCCESS_STEP_INDEX && completedOrder) {
    return wrapStep(
      SUCCESS_STEP_INDEX,
      (
        <OrderSuccess
          order={completedOrder}
          grandTotal={ctx.grandTotal}
          orderEta={ctx.pinInfo?.eta}
          itemCount={
            completedOrder.items?.reduce((n, i) => n + (i.quantity || 1), 0) ||
            cartItems.reduce((n, i) => n + (i.quantity || 1), 0)
          }
          successPause={successPause}
          transition={transition}
          onContinueShopping={() => {
            ctx.clearCheckoutState?.();
            onContinueShopping?.();
            onClose?.();
          }}
        />
      ),
      adCodes,
      shellProps
    );
  }

  return null;
}
