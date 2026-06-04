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
  CreditCard,
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
    strength,
    goStep,
    validateShippingContact,
    validateShippingStreet,
    validateShippingAddress,
    updateShipping,
    selectedAddressId,
    setSelectedAddressId,
    persist,
    pinInfo,
    shipLoading,
    paymentProcessing,
    paymentFail,
    placeOrder,
    updatePayment,
    stored: _s,
    completedOrder,
    successPause,
    grandTotal: gt,
    pinInfo: pi,
    onContinueShopping,
    onClose,
    reservedMinutes,
    PAY_METHODS,
    detectCardIssuer,
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
      return wrapStep(0, (
        <div className={cardClass}>
          <h2 className="co-step-heading">Your bag is empty</h2>
          <p className="co-step-sub">Add items to start the 15-step checkout.</p>
          <button type="button" className="co-btn-primary" onClick={onClose}>
            Continue shopping
          </button>
        </div>
      ), ad);
    }
    return wrapStep(0, (
      <div className={cardClass}>
        <h2 className="co-step-heading">My Shopping Bag 🛍️</h2>
        <p className="co-step-sub">Review items before checkout ({cartItems.length})</p>
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
        <NavRow onNext={() => goStep(1)} nextLabel="Next — Offers" />
      </div>
    ), ad);
  }

  if (step === 1) {
    return wrapStep(1, (
      <div className={cardClass}>
        <h2 className="co-step-heading">Unlock savings ✨</h2>
        <p className="co-step-sub">See what you can save on this order</p>
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
              You unlocked {promoOffLabel}! Use code <strong>{promoCode}</strong> on the next step.
            </span>
          </div>
        )}
        <p className="co-step-sub">Bag subtotal: ₹{subtotal}</p>
        <NavRow onBack={() => goStep(0)} onNext={() => goStep(2)} nextLabel="Next — Promo code" />
      </div>
    ), ad);
  }

  if (step === 2) {
    return wrapStep(2, (
      <div className={cardClass}>
        <h2 className="co-step-heading">Apply promo code 🏷️</h2>
        <p className="co-step-sub">Enter a valid code for your bag</p>
        <form
          className="co-coupon-row co-coupon-row--page"
          onSubmit={(e) => {
            e.preventDefault();
            handleApplyCoupon();
          }}
        >
          <Tag size={16} />
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
        <NavRow onBack={() => goStep(1)} onNext={() => goStep(3)} nextLabel="Next — Bill" />
      </div>
    ), ad);
  }

  if (step === 3) {
    return wrapStep(3, (
      <div className={cardClass}>
        <h2 className="co-step-heading">Order total 🧾</h2>
        <p className="co-step-sub">Confirm amounts before account & delivery</p>
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
        <NavRow onBack={() => goStep(2)} onNext={() => goStep(4)} nextLabel="Continue checkout" />
      </div>
    ), ad);
  }

  if (step === 4) {
    return wrapStep(4, (
      <div className={cardClass}>
        <div className="co-assistant-row">
          <AssistantIllustration wave />
          <div>
            <h2 className="co-step-heading">Welcome to checkout ✨</h2>
            <p className="co-step-sub">15-step secure boutique checkout</p>
          </div>
        </div>
        <NavRow onBack={() => goStep(3)} onNext={() => goStep(5)} nextLabel="Next — Account" />
      </div>
    ), ad);
  }

  if (step === 5) {
    return wrapStep(5, (
      <div className={cardClass}>
        <h2 className="co-step-heading">Your account 🔐</h2>
        <p className="co-step-sub">Sign in or continue as guest</p>
        <div className="co-pill-group">
          <button
            type="button"
            className={`co-pill ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => setAuthMode('login')}
          >
            Login / Signup
          </button>
          <button
            type="button"
            className={`co-pill ${authMode === 'guest' ? 'active' : ''}`}
            onClick={() => setAuthMode('guest')}
          >
            Guest
          </button>
        </div>
        {user && (
          <div className="co-alert-banner co-alert-banner--ok">
            Signed in as <strong>{user.name || user.email}</strong>
          </div>
        )}
        <NavRow
          onBack={() => goStep(4)}
          onNext={() => (user ? goStep(7) : authMode === 'guest' ? validateLogin() : goStep(6))}
          nextLabel={user ? 'Next — Your name' : authMode === 'guest' ? 'Continue as guest' : 'Next — Sign in'}
        />
      </div>
    ), ad);
  }

  if (step === 6) {
    return wrapStep(6, (
      <div className={cardClass}>
        {loginSuccess && (
          <div className="co-login-success" role="status">
            Welcome back — your bag is ready ✨
          </div>
        )}
        <h2 className="co-step-heading">Sign in 📧</h2>
        <p className="co-step-sub">Faster delivery & order tracking</p>
        <div className="co-pill-group">
          <button type="button" className={`co-pill ${loginTab === 'email' ? 'active' : ''}`} onClick={() => setLoginTab('email')}>
            Email
          </button>
          <button type="button" className={`co-pill ${loginTab === 'otp' ? 'active' : ''}`} onClick={() => setLoginTab('otp')}>
            Phone OTP
          </button>
          <button
            type="button"
            className={`co-pill ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => setAuthMode('register')}
          >
            Create account
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            validateLogin();
          }}
        >
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
          <button type="submit" className={`co-btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </form>
        <NavRow onBack={() => goStep(5)} onNext={() => validateLogin()} nextLabel="Continue" />
      </div>
    ), ad);
  }

  if (step === 7) {
    return wrapStep(7, (
      <div className={cardClass}>
        <h2 className="co-step-heading">Who is receiving? 👤</h2>
        <p className="co-step-sub">Full name for delivery</p>
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
        <NavRow
          onBack={() => goStep(user ? 5 : 6)}
          onNext={() => {
            if (!stored.shipping?.fullName?.trim()) {
              ctx.triggerShake?.();
              ctx.setFieldErrors?.({ fullName: 'Required' });
              return;
            }
            ctx.setFieldErrors?.({});
            goStep(8);
          }}
          nextLabel="Next — Phone"
        />
      </div>
    ), ad);
  }

  if (step === 8) {
    return wrapStep(8, (
      <div className={cardClass}>
        <h2 className="co-step-heading">Contact details 📱</h2>
        <p className="co-step-sub">For delivery & order confirmation · {stored.shipping?.fullName}</p>
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
        <NavRow onBack={() => goStep(7)} onNext={validateShippingContact} nextLabel="Next — Address" />
      </div>
    ), ad);
  }

  if (step === 9) {
    return wrapStep(9, (
      <div className={`${cardClass} co-ship-form`}>
        <MapUnfoldIllustration />
        <h2 className="co-step-heading">Delivery address 📍</h2>
        <p className="co-step-sub">Street & building details</p>
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
          <label>Address</label>
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
        <NavRow
          onBack={() => goStep(8)}
          onNext={validateShippingStreet}
          nextLabel="Next — City & PIN"
        />
      </div>
    ), ad);
  }

  if (step === 10) {
    return wrapStep(10, (
      <div className={`${cardClass} co-ship-form`}>
        <h2 className="co-step-heading">City & delivery 🏙️</h2>
        <p className="co-step-sub">Pincode for ETA & COD eligibility</p>
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
          Save this address
        </label>
        {pinInfo.ok && (
          <div className="co-eta-card">
            <Truck size={20} color="#27AE60" />
            <span>
              ETA: <strong>{pinInfo.eta}</strong>
            </span>
          </div>
        )}
        {fieldErrors.address && (
          <div className="co-alert-banner error">
            {fieldErrors.address}.{' '}
            <button type="button" className="co-link-btn" onClick={() => goStep(9)}>
              Go to Address step
            </button>
          </div>
        )}
        {error && <p className="co-field-error co-step-error-banner">{error}</p>}
        <NavRow
          onBack={() => goStep(9)}
          onNext={validateShippingAddress}
          nextLabel="Continue to review"
          nextLoading={shipLoading}
        />
      </div>
    ), ad);
  }

  if (step === 11) {
    return wrapStep(11, (
      <div className={`${cardClass} co-page-card--review`}>
        <h2 className="co-step-heading">Review items 🛍️</h2>
        <p className="co-step-sub">Your bag before payment</p>
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
        <NavRow onBack={() => goStep(10)} onNext={() => goStep(12)} nextLabel="Next — Summary" />
      </div>
    ), ad);
  }

  if (step === 12) {
    return wrapStep(12, (
      <div className={`${cardClass} co-page-card--review`}>
        <h2 className="co-step-heading">Order summary 📋</h2>
        <p className="co-step-sub">Address, promo & totals</p>
        <div className="co-review-ship-snippet">
          <MapPin size={16} />
          <div>
            <strong>{stored.shipping?.fullName}</strong>
            <p>
              {stored.shipping?.phone}
              <br />
              {stored.shipping?.address}, {stored.shipping?.city} — {stored.shipping?.pincode}
            </p>
            <button type="button" className="co-link-btn" onClick={() => goStep(9)}>
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
        <NavRow onBack={() => goStep(11)} onNext={() => goStep(13)} nextLabel="Continue to payment" />
      </div>
    ), ad);
  }

  if (step === 13) {
    return wrapStep(13, (
      <div className={cardClass}>
        <h2 className="co-step-heading">Payment 💳</h2>
        <p className="co-step-sub">Secure boutique checkout</p>
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
          onBack={() => goStep(12)}
          onNext={placeOrder}
          nextLabel={paymentProcessing ? 'Processing…' : 'Place order'}
          nextLoading={paymentProcessing}
        />
      </div>
    ), ad);
  }

  if (step === SUCCESS_STEP_INDEX && completedOrder) {
    return wrapStep(SUCCESS_STEP_INDEX, (
      <>
        <OrderSuccess
          order={completedOrder}
          grandTotal={gt}
          orderEta={pi?.eta}
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
      </>
    ), ad);
  }

  return null;
}
