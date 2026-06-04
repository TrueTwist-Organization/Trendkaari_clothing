import {
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
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
} from 'lucide-react';
import OrderSummary from './OrderSummary';
import OrderSuccess from './OrderSuccess';
import CheckoutStepPageShell from './CheckoutStepPageShell';
import { SUCCESS_STEP_INDEX } from './checkoutSteps';
import { formatCouponDiscountShort } from '../utils/couponDiscount';

function wrapStep(stepIndex, node, ad) {
  return (
    <CheckoutStepPageShell step={stepIndex} ad={ad}>
      {node}
    </CheckoutStepPageShell>
  );
}

function NavRow({ onBack, onNext, backLabel = 'Back', nextLabel = 'Continue', nextDisabled, nextLoading }) {
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
        onClick={onNext}
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
    ad,
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
    authMode,
    setAuthMode,
    loginTab,
    setLoginTab,
    user,
    loginSuccess,
    showPwd,
    setShowPwd,
    loading,
    error,
    fieldErrors,
    shake,
    validateLogin,
    updateLogin,
    goStep,
    validateShippingContact,
    validateShippingAddress,
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
    AssistantIllustration,
    MapUnfoldIllustration,
  } = ctx;

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
        ad
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
          <NavRow onNext={() => goStep(1)} nextLabel="Continue to savings" />
        </div>
      ),
      ad
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
      ad
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
          <NavRow onBack={() => goStep(1)} onNext={() => goStep(3)} nextLabel="Continue — account" />
        </div>
      ),
      ad
    );
  }

  if (step === 3) {
    const showLoginForm = !user && authMode !== 'guest';

    return wrapStep(
      3,
      (
        <div className={cardClass}>
          <div className="co-page-head">
            <span className="co-page-badge">04</span>
            <div>
              <h2 className="co-step-heading">Your account</h2>
              <p className="co-step-sub">Sign in, create an account, or checkout as guest</p>
            </div>
          </div>
          {loginSuccess && (
            <div className="co-login-success" role="status">
              Welcome back — your bag is ready ✨
            </div>
          )}
          {user ? (
            <div className="co-account-card co-account-card--signed">
              <AssistantIllustration wave />
              <div>
                <strong>{user.name || 'Member'}</strong>
                <p>{user.email}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="co-pill-group co-pill-group--account">
                <button
                  type="button"
                  className={`co-pill ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthMode('login')}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={`co-pill ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => setAuthMode('register')}
                >
                  Create account
                </button>
                <button
                  type="button"
                  className={`co-pill ${authMode === 'guest' ? 'active' : ''}`}
                  onClick={() => setAuthMode('guest')}
                >
                  Guest
                </button>
              </div>
              {showLoginForm && (
                <form
                  className="co-account-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    validateLogin();
                  }}
                >
                  <div className="co-pill-group co-pill-group--compact">
                    <button
                      type="button"
                      className={`co-pill ${loginTab === 'email' ? 'active' : ''}`}
                      onClick={() => setLoginTab('email')}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      className={`co-pill ${loginTab === 'otp' ? 'active' : ''}`}
                      onClick={() => setLoginTab('otp')}
                    >
                      Phone OTP
                    </button>
                  </div>
                  <div className={`co-field ${shake ? 'shake' : ''}`}>
                    <Mail size={18} className="co-field-icon" />
                    <input
                      type="email"
                      placeholder=" "
                      value={stored.login?.email || ''}
                      onChange={(e) => updateLogin('email', e.target.value)}
                    />
                    <label>Email</label>
                    {fieldErrors.email && <p className="co-field-error">{fieldErrors.email}</p>}
                  </div>
                  {loginTab === 'otp' ? (
                    <div className="co-field">
                      <Phone size={18} className="co-field-icon" />
                      <input
                        type="tel"
                        placeholder=" "
                        value={stored.login?.phone || ''}
                        onChange={(e) => updateLogin('phone', e.target.value)}
                      />
                      <label>Phone (+91)</label>
                    </div>
                  ) : (
                    <div className={`co-field ${fieldErrors.password ? 'shake' : ''}`}>
                      <Lock size={18} className="co-field-icon" />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        placeholder=" "
                        value={stored.login?.password || ''}
                        onChange={(e) => updateLogin('password', e.target.value)}
                      />
                      <label>Password</label>
                      <button type="button" className="co-pwd-toggle" onClick={() => setShowPwd((v) => !v)}>
                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {fieldErrors.password && <p className="co-field-error">{fieldErrors.password}</p>}
                    </div>
                  )}
                  {error && <p className="co-field-error">{error}</p>}
                </form>
              )}
              {authMode === 'guest' && (
                <div className="co-guest-note">
                  <p>Checkout without an account. We&apos;ll email your order confirmation.</p>
                  <div className="co-field">
                    <Mail size={18} className="co-field-icon" />
                    <input
                      type="email"
                      placeholder=" "
                      value={stored.login?.email || ''}
                      onChange={(e) => updateLogin('email', e.target.value)}
                    />
                    <label>Email (optional)</label>
                  </div>
                </div>
              )}
            </>
          )}
          <NavRow
            onBack={() => goStep(2)}
            onNext={() => {
              if (user) {
                goStep(4);
                return;
              }
              validateLogin();
            }}
            nextLabel={user ? 'Continue — delivery' : authMode === 'guest' ? 'Continue as guest' : 'Sign in & continue'}
            nextLoading={loading}
          />
        </div>
      ),
      ad
    );
  }

  if (step === 4) {
    return wrapStep(
      4,
      (
        <div className={cardClass}>
          <div className="co-page-head">
            <span className="co-page-badge">05</span>
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
          <div className="co-field">
            <Mail size={18} className="co-field-icon" />
            <input
              type="email"
              placeholder=" "
              value={stored.shipping?.email || stored.login?.email || ''}
              onChange={(e) => updateShipping('email', e.target.value)}
            />
            <label>Email</label>
            {fieldErrors.email && <p className="co-field-error">{fieldErrors.email}</p>}
          </div>
          <div className="co-field">
            <Phone size={18} className="co-field-icon" />
            <input
              type="tel"
              placeholder=" "
              value={stored.shipping?.phone || ''}
              onChange={(e) => updateShipping('phone', e.target.value)}
            />
            <label>Phone</label>
            {fieldErrors.phone && <p className="co-field-error">{fieldErrors.phone}</p>}
          </div>
          <NavRow onBack={() => goStep(3)} onNext={validateShippingContact} nextLabel="Continue — address" />
        </div>
      ),
      ad
    );
  }

  if (step === 5) {
    return wrapStep(
      5,
      (
        <div className={`${cardClass} co-ship-form`}>
          <div className="co-page-head">
            <span className="co-page-badge">06</span>
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
            onBack={() => goStep(4)}
            onNext={validateShippingAddress}
            nextLabel="Review order"
            nextLoading={shipLoading}
          />
        </div>
      ),
      ad
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
          <NavRow onBack={() => goStep(5)} onNext={() => goStep(7)} nextLabel="Continue — summary" />
        </div>
      ),
      ad
    );
  }

  if (step === 7) {
    return wrapStep(
      7,
      (
        <div className={`${cardClass} co-page-card--review`}>
          <div className="co-page-head">
            <span className="co-page-badge">08</span>
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
                {stored.shipping?.phone} · {stored.shipping?.email}
                <br />
                {stored.shipping?.address}, {stored.shipping?.city} — {stored.shipping?.pincode}
              </p>
              <button type="button" className="co-link-btn" onClick={() => goStep(5)}>
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
          <NavRow onBack={() => goStep(6)} onNext={() => goStep(8)} nextLabel="Proceed to payment" />
        </div>
      ),
      ad
    );
  }

  if (step === 8) {
    return wrapStep(
      8,
      (
        <div className={cardClass}>
          <div className="co-page-head">
            <span className="co-page-badge">09</span>
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
            onBack={() => goStep(7)}
            onNext={placeOrder}
            nextLabel={paymentProcessing ? 'Processing…' : 'Place order'}
            nextLoading={paymentProcessing}
          />
        </div>
      ),
      ad
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
      ad
    );
  }

  return null;
}
