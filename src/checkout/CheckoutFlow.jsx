import { useState, useEffect, useCallback, useRef } from 'react';
import { X, WifiOff, RefreshCw } from 'lucide-react';
import { userLogin, userRegister } from '../api/userApi';
import { setUserToken } from '../api/client';
import OrderTechnicalError from './OrderTechnicalError';
import CheckoutStepPages from './CheckoutStepPages';
import { SUCCESS_STEP_INDEX, CHECKOUT_STEPS } from './checkoutSteps';
import { getCheckoutStepExtras } from './checkoutStepExtrasConfig';
import { checkoutPathForStep, stepIndexFromSlug, isCheckoutErrorSlug, isSuccessSlug, CHECKOUT_ERROR_SLUG } from './checkoutRoutes';
import {
  loadCheckoutState,
  saveCheckoutState,
  clearCheckoutState,
  saveOrderFailure,
  loadOrderFailure,
  clearOrderFailure,
  hasOrderFailure,
  pincodeServiceable,
} from './checkoutStorage';
import { computeCouponDiscountAmount } from '../utils/couponDiscount';
import {
  contactFromShipping,
  validateContactFields,
  validateAddressFields,
  firstIncompleteStepBeforePayment,
} from './checkoutValidation';
import PlacedAdSlot from '../components/PlacedAdSlot';
import { refreshAllGptSlots } from '../utils/googletag';
import { scrollToPageTop } from '../utils/scrollToTop';
import './CheckoutFlow.css';

const PAY_METHODS = [
  { id: 'cod', label: 'COD', available: true },
  { id: 'upi', label: 'UPI', available: false },
  { id: 'card', label: 'Card', available: false },
  { id: 'netbanking', label: 'Net Banking', available: false },
  { id: 'wallet', label: 'Wallet', available: false },
  { id: 'emi', label: 'EMI', available: false },
  { id: 'bnpl', label: 'Pay Later', available: false },
  { id: 'gift', label: 'Gift Card', available: false },
];

function MapUnfoldIllustration() {
  return (
    <svg className="co-map-illus" viewBox="0 0 120 64" aria-hidden>
      <rect x="8" y="12" width="104" height="44" rx="6" fill="rgba(212,180,131,0.12)" stroke="rgba(212,180,131,0.45)" />
      <path d="M20 40 L45 28 L70 36 L95 24" fill="none" stroke="#D4B483" strokeWidth="2" strokeDasharray="4 4" />
      <circle className="co-map-pin" cx="70" cy="30" r="8" fill="#7A1E48" stroke="#F8F2EB" strokeWidth="2" />
    </svg>
  );
}

function CourierHero() {
  return (
    <svg className="co-courier-hero" viewBox="0 0 200 100" aria-hidden>
      <ellipse cx="100" cy="88" rx="70" ry="8" fill="rgba(0,0,0,0.25)" />
      <rect x="55" y="45" width="90" height="35" rx="8" fill="#7A1E48" stroke="#D4B483" />
      <circle cx="70" cy="82" r="10" fill="#2A0019" stroke="#D4B483" />
      <circle cx="130" cy="82" r="10" fill="#2A0019" stroke="#D4B483" />
      <path d="M95 45 L105 25 L115 45 Z" fill="#D4B483" />
      <rect x="75" y="50" width="20" height="18" rx="2" fill="#F8F2EB" opacity="0.9" />
      <rect x="105" y="48" width="28" height="22" rx="3" fill="#D4B483" />
    </svg>
  );
}

function FashionFloaters() {
  const icons = ['👗', '👜', '👠', '💍', '🧥'];
  return (
    <div className="co-float-icons" aria-hidden>
      {icons.map((icon, i) => (
        <span key={icon} style={{ left: `${12 + i * 18}%`, animationDelay: `${i * 0.7}s` }}>
          {icon}
        </span>
      ))}
    </div>
  );
}

function AssistantIllustration({ wave }) {
  return (
    <svg className="co-assistant-illus" viewBox="0 0 80 80" aria-hidden>
      <circle cx="40" cy="40" r="38" fill="rgba(212,180,131,0.15)" stroke="rgba(212,180,131,0.45)" />
      <circle cx="40" cy="32" r="14" fill="#D4B483" />
      <path d="M22 58 Q40 48 58 58" fill="none" stroke="#7A1E48" strokeWidth="3" />
      <rect x="52" y="42" width="18" height="22" rx="3" fill="#7A1E48" />
      <path
        className={wave ? 'co-assistant-wave' : ''}
        d="M58 28 L62 24 M58 28 L54 24"
        stroke="#F8F2EB"
        strokeWidth="2"
      />
    </svg>
  );
}

function detectCardIssuer(num) {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^6/.test(n)) return 'RuPay';
  return '';
}

function passwordStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s += 25;
  if (pw.length >= 10) s += 25;
  if (/[A-Z]/.test(pw)) s += 25;
  if (/[0-9]/.test(pw)) s += 25;
  return s;
}

export default function CheckoutFlow({
  isOpen,
  stepSlug = 'bag',
  onNavigateCheckout,
  onClose,
  cartItems = [],
  coupons = [],
  user,
  adCodes = {},
  onUserLogin,
  onPlaceOrder,
  onContinueShopping,
  onReviewCart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  allProducts = [],
  onAddToCart,
  onSelectProduct,
}) {
  const rawStep = stepIndexFromSlug(stepSlug);
  const step = rawStep >= 0 ? rawStep : 0;
  const initialFailure = loadOrderFailure();
  const [stored, setStored] = useState(loadCheckoutState);
  const [authMode, setAuthMode] = useState('login');
  const [loginTab, setLoginTab] = useState('email');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [transition, setTransition] = useState('');
  const [offline, setOffline] = useState(!navigator.onLine);
  const [couponCode, setCouponCode] = useState(stored.coupon?.code || '');
  const [appliedCoupon, setAppliedCoupon] = useState(stored.coupon?.applied || null);
  const [couponError, setCouponError] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentFail, setPaymentFail] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [orderFailed, setOrderFailed] = useState(
    () => isCheckoutErrorSlug(stepSlug) || Boolean(initialFailure)
  );
  const [orderFailMessage, setOrderFailMessage] = useState(() => initialFailure?.message || '');
  const [confetti, setConfetti] = useState([]);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [successPause, setSuccessPause] = useState(false);
  const [shipLoading, setShipLoading] = useState(false);
  const [reservedMinutes, setReservedMinutes] = useState(12);
  const panelRef = useRef(null);
  const checkoutWasOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const t1 = window.setTimeout(refreshAllGptSlots, 450);
    const t2 = window.setTimeout(refreshAllGptSlots, 1800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [isOpen, stepSlug, adCodes]);

  const persist = useCallback((partial) => {
    const next = saveCheckoutState(partial);
    setStored(next);
    return next;
  }, []);

  const handleClose = useCallback(() => {
    if (step >= SUCCESS_STEP_INDEX) {
      saveCheckoutState({ step: 0 });
    }
    setCompletedOrder(null);
    setOrderFailed(false);
    setOrderFailMessage('');
    onClose?.();
  }, [step, onClose]);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      checkoutWasOpenRef.current = false;
      document.body.style.overflow = '';
      return;
    }

    const opening = !checkoutWasOpenRef.current;
    checkoutWasOpenRef.current = true;

    const saved = loadCheckoutState();
    const payment =
      saved.payment?.method === 'cod'
        ? saved.payment
        : { ...saved.payment, method: 'cod', codConfirmed: false };
    const normalized = payment !== saved.payment ? { ...saved, payment } : saved;
    setCouponCode(normalized.coupon?.code || '');
    setAppliedCoupon(normalized.coupon?.applied || null);

    if (opening) {
      setCompletedOrder(null);
      setOrderFailed(false);
      setOrderFailMessage('');
    }

    setStored(normalized);
    if (payment !== saved.payment) saveCheckoutState({ payment: normalized.payment });

    if (user) {
      persist({
        shipping: {
          ...normalized.shipping,
          fullName: normalized.shipping.fullName || user.name || '',
          phone: normalized.shipping.phone || user.phone || '',
        },
        login: { ...normalized.login, email: user.email || normalized.login.email },
      });
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, user, persist]);

  useEffect(() => {
    if (!isOpen || step >= SUCCESS_STEP_INDEX) return;
    const t = setInterval(() => setReservedMinutes((m) => (m > 0 ? m - 1 : 0)), 60000);
    return () => clearInterval(t);
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen || step !== 7) return;
    if (stored.payment?.method === 'cod') return;
    persist({ payment: { ...stored.payment, method: 'cod' } });
  }, [isOpen, step, stored.payment?.method, persist]);

  useEffect(() => {
    if (!isOpen || !onNavigateCheckout || orderFailed || isCheckoutErrorSlug(stepSlug)) return;
    if (step === SUCCESS_STEP_INDEX && !completedOrder) {
      onNavigateCheckout(checkoutPathForStep(0));
      return;
    }
    if (cartItems.length === 0 && step !== 0 && step !== SUCCESS_STEP_INDEX) {
      onNavigateCheckout(checkoutPathForStep(0));
    }
  }, [isOpen, step, stepSlug, cartItems.length, completedOrder, orderFailed, onNavigateCheckout]);

  useEffect(() => {
    if (!isOpen || !onNavigateCheckout) return;
    if (isCheckoutErrorSlug(stepSlug)) return;
    if (!isSuccessSlug(stepSlug)) return;
    setOrderFailed(true);
    const saved = loadOrderFailure();
    const msg = saved?.message || 'We could not complete your order due to a technical issue.';
    setOrderFailMessage(msg);
    if (!saved) saveOrderFailure(msg);
    onNavigateCheckout(`/checkout/${CHECKOUT_ERROR_SLUG}`);
  }, [isOpen, stepSlug, onNavigateCheckout]);

  useEffect(() => {
    if (!isOpen || !isCheckoutErrorSlug(stepSlug)) return;
    setOrderFailed(true);
    const saved = loadOrderFailure();
    if (saved?.message) setOrderFailMessage(saved.message);
  }, [isOpen, stepSlug]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  const subtotal = cartItems.reduce((a, i) => a + i.price * i.quantity, 0);
  const discount = computeCouponDiscountAmount(appliedCoupon, subtotal);
  const shipping = 0;
  const tax = 0;
  const grandTotal = Math.max(0, subtotal - discount + shipping + tax);

  const goStep = (n, anim) => {
    const target = Math.max(0, Math.min(n, SUCCESS_STEP_INDEX));
    setTransition(anim || 'co-step-enter');
    persist({ step: target });
    setError('');
    setFieldErrors({});
    onNavigateCheckout?.(checkoutPathForStep(target));
    scrollToPageTop();
    panelRef.current?.scrollIntoView?.({ behavior: 'auto', block: 'start' });
    if (target === SUCCESS_STEP_INDEX) {
      setSuccessPause(true);
      setTimeout(() => setSuccessPause(false), 320);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    const found = coupons.find((c) => c.code === code);
    if (!found) {
      setCouponError('Invalid coupon code');
      return;
    }
    if (subtotal < found.minPurchase) {
      setCouponError(`Minimum ₹${found.minPurchase} required`);
      return;
    }
    setAppliedCoupon(found);
    persist({ coupon: { code, applied: found } });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    persist({ coupon: { code: '', applied: null } });
  };

  const validateLogin = async () => {
    if (offline) {
      setError('No internet connection. Check your network and retry.');
      return false;
    }
    const email = stored.login?.email?.trim();
    const password = stored.login?.password;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErrors({ email: 'Enter a valid email' });
      triggerShake();
      return false;
    }
    if (authMode !== 'guest' && (!password || password.length < 6)) {
      setFieldErrors({ password: 'Password must be at least 6 characters' });
      triggerShake();
      return false;
    }
    const finishLogin = () => {
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
        goStep(3);
      }, 900);
    };

    if (authMode === 'guest') {
      const guestEmail = stored.login?.email?.trim();
      if (guestEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        persist({ guest: true, shipping: { ...stored.shipping, email: guestEmail } });
      } else {
        persist({ guest: true });
      }
      finishLogin();
      return true;
    }
    if (loginTab === 'otp' && stored.login?.phone?.replace(/\D/g, '').length >= 10) {
      persist({ guest: true });
      finishLogin();
      return true;
    }
    setLoading(true);
    setError('');
    try {
      let data;
      if (authMode === 'register') {
        data = await userRegister({
          name: stored.shipping?.fullName || 'Guest',
          email,
          password,
          phone: stored.login?.phone,
        });
      } else {
        data = await userLogin(email, password);
      }
      setUserToken(data.token);
      onUserLogin?.(data.user);
      finishLogin();
      return true;
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      triggerShake();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const validateShippingContact = () => {
    const s = stored.shipping || {};
    const loginEmail = stored.login?.email?.trim() || user?.email?.trim() || '';
    const errs = validateContactFields(s, loginEmail);

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setError('');
      triggerShake();
      return false;
    }

    const { email, phone, hasValidEmail, hasValidPhone } = contactFromShipping(s, loginEmail);
    persist({
      shipping: {
        ...s,
        email: hasValidEmail ? email : '',
        fullName: s.fullName?.trim(),
        phone: hasValidPhone ? phone : '',
      },
    });
    setFieldErrors({});
    setError('');
    goStep(4);
    return true;
  };

  const validateShippingAddress = () => {
    const s = stored.shipping || {};
    const errs = validateAddressFields(s);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      if (errs.address) {
        setError('Please fill in your street address above.');
      } else {
        setError('Please complete all delivery fields below.');
      }
      triggerShake();
      return false;
    }
    setError('');
    if (s.saveAddress) {
      const addr = {
        id: `addr-${Date.now()}`,
        ...s,
        default: true,
      };
      const list = [...(stored.savedAddresses || []).filter((a) => !a.default), addr];
      persist({ savedAddresses: list });
    }
    setShipLoading(true);
    setTimeout(() => {
      setShipLoading(false);
      goStep(5);
    }, 700);
    return true;
  };

  const ensureReadyForPayment = () => {
    const loginEmail = stored.login?.email?.trim() || user?.email?.trim() || '';
    const blocked = firstIncompleteStepBeforePayment(stored, loginEmail);
    if (blocked === 3) {
      setFieldErrors(validateContactFields(stored.shipping, loginEmail));
      setError('Please complete contact details before payment.');
      triggerShake();
      goStep(3);
      return false;
    }
    if (blocked === 4) {
      setFieldErrors(validateAddressFields(stored.shipping));
      setError('Please complete your delivery address before payment.');
      triggerShake();
      goStep(4);
      return false;
    }
    setFieldErrors({});
    setError('');
    return true;
  };

  const proceedToPayment = () => {
    if (!ensureReadyForPayment()) return false;
    goStep(7);
    return true;
  };

  const placeOrder = async () => {
    if (!ensureReadyForPayment()) return;

    if (cartItems.length === 0) {
      setError('Your bag is empty');
      return;
    }
    if (offline) {
      setError('You are offline. Reconnect to place order.');
      return;
    }
    if (!stored.payment?.codConfirmed) {
      setError('Please confirm COD terms');
      return;
    }
    const orderEmail =
      stored.shipping?.email?.trim() || stored.login?.email?.trim() || user?.email?.trim() || '';
    const orderPhone = stored.shipping?.phone?.trim() || user?.phone?.trim() || '';
    const hasOrderEmail = Boolean(orderEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderEmail));
    const hasOrderPhone = orderPhone.replace(/\D/g, '').length >= 10;
    if (!hasOrderEmail && !hasOrderPhone) {
      setError('Add your email or phone on the contact step, then try again.');
      goStep(3);
      return;
    }
    setPaymentProcessing(true);
    setPaymentFail(false);
    setOrderFailed(false);
    setOrderFailMessage('');
    await new Promise((r) => setTimeout(r, 1800));
    const orderPayload = {
      name: stored.shipping.fullName,
      email: stored.shipping.email?.trim() || stored.login?.email?.trim() || '',
      phone: stored.shipping.phone,
      address: [
        stored.shipping.address,
        stored.shipping.apartment,
        stored.shipping.city,
        stored.shipping.state,
        stored.shipping.pincode,
        stored.shipping.landmark,
      ]
        .filter(Boolean)
        .join(', '),
      items: cartItems,
      subtotal,
      discount,
      grandTotal,
      paymentMethod: 'cod',
      notes: stored.shipping.notes,
    };
    try {
      const result = await onPlaceOrder?.(orderPayload);
      if (!result?.order) {
        throw new Error('We could not complete your order due to a technical issue.');
      }
      if (hasOrderEmail && result.emailSent !== true) {
        throw new Error(
          result.emailError ||
            'Confirmation email could not be sent. Please start checkout again from your bag.'
        );
      }
      const failMsg = 'We could not complete your order due to a technical issue.';
      setPaymentFail(false);
      setError('');
      setOrderFailMessage(failMsg);
      saveOrderFailure(failMsg);
      clearCheckoutState();
      setCompletedOrder(null);
      setOrderFailed(true);
      onNavigateCheckout?.(`/checkout/${CHECKOUT_ERROR_SLUG}`);
      scrollToPageTop();
    } catch (err) {
      const msg = err?.message || '';
      if (/sign in/i.test(msg)) {
        setError(msg);
        return;
      }
      setPaymentFail(false);
      setError('');
      setOrderFailMessage(msg || 'We could not complete your order due to a technical issue.');
      saveOrderFailure(msg || 'We could not complete your order due to a technical issue.');
      onClearCart?.();
      clearCheckoutState();
      setCompletedOrder(null);
      setOrderFailed(true);
      onNavigateCheckout?.(`/checkout/${CHECKOUT_ERROR_SLUG}`);
      scrollToPageTop();
    } finally {
      setPaymentProcessing(false);
    }
  };

  const spawnConfetti = () => {
    const pieces = Array.from({ length: 72 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: i % 2 ? '#D4B483' : '#27AE60',
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 3500);
  };

  const updateShipping = (key, val) => {
    const shipping = { ...stored.shipping, [key]: val };
    persist({ shipping });
  };

  const updateLogin = (key, val) => {
    const login = { ...stored.login, [key]: val };
    persist({ login });
  };

  const updatePayment = (key, val) => {
    const payment = { ...stored.payment, [key]: val };
    persist({ payment });
  };

  const pinInfo = pincodeServiceable(stored.shipping?.pincode);
  const strength = passwordStrength(stored.login?.password);

  const stepCtx = {
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
    validateShippingAddress,
    proceedToPayment,
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
    completedOrder,
    successPause,
    onContinueShopping,
    onClose,
    reservedMinutes,
    PAY_METHODS,
    detectCardIssuer,
    AssistantIllustration,
    MapUnfoldIllustration,
    triggerShake,
    setFieldErrors,
    clearCheckoutState,
    allProducts,
    onAddToCart,
    onSelectProduct,
  };

  if (!isOpen) return null;

  const showTechnicalError =
    orderFailed || isCheckoutErrorSlug(stepSlug) || hasOrderFailure();
  const stepExtras = getCheckoutStepExtras(step, CHECKOUT_STEPS);
  const wideCheckout = Boolean(stepExtras?.showSuggestions);

  if (showTechnicalError) {
    return (
      <div className="checkout-flow-root" role="dialog" aria-modal="true" aria-label="Checkout">
        <button type="button" className="co-close-btn" onClick={handleClose} aria-label="Close checkout">
          <X size={22} />
        </button>
        <div className="co-body co-body--fail">
          <PlacedAdSlot
            adCodes={adCodes}
            placement="checkout_step_error_top"
            variant="checkout"
          />
          <OrderTechnicalError
            detailMessage={orderFailMessage}
            onSelectProductsAgain={() => {
              clearOrderFailure();
              setOrderFailed(false);
              setOrderFailMessage('');
              onContinueShopping?.();
            }}
            onReviewCart={() => {
              clearOrderFailure();
              setOrderFailed(false);
              setOrderFailMessage('');
              handleClose();
              onReviewCart?.();
            }}
          />
          <PlacedAdSlot
            adCodes={adCodes}
            placement="checkout_step_error_bottom"
            allowDuplicateSource
            variant="checkout"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-flow-root" role="dialog" aria-modal="true" aria-label="Checkout" ref={panelRef}>
      <div className="co-particles" aria-hidden>
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            className="co-particle"
            style={{ left: `${8 + i * 8}%`, top: `${10 + (i % 5) * 18}%`, animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </div>

      {confetti.length > 0 && (
        <div className="co-confetti" aria-hidden>
          {confetti.map((p) => (
            <span
              key={p.id}
              className="co-confetti-piece"
              style={{
                left: `${p.left}%`,
                background: p.color,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      <button type="button" className="co-close-btn" onClick={handleClose} aria-label="Close checkout">
        <X size={22} />
      </button>

      {offline && (
        <div className="co-alert-banner offline" style={{ margin: '0 24px 8px', maxWidth: 1052, marginLeft: 'auto', marginRight: 'auto' }}>
          <WifiOff size={18} />
          <span>Offline — changes saved locally. Reconnect to complete payment.</span>
          <button type="button" className="co-social-btn" style={{ marginLeft: 'auto', padding: '6px 12px' }} onClick={() => setOffline(!navigator.onLine)}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {reservedMinutes > 0 && step === 7 && (
        <div className="co-alert-banner warn" style={{ margin: '0 24px 8px', maxWidth: 1052, marginLeft: 'auto', marginRight: 'auto' }}>
          Items reserved for {reservedMinutes} min — complete checkout soon.
        </div>
      )}

      <div className={`co-layout co-layout--cards ${step === SUCCESS_STEP_INDEX ? 'co-layout--success' : ''} ${wideCheckout ? 'co-layout--wide' : ''}`}>
        <div className={`co-body co-body--pages ${step === SUCCESS_STEP_INDEX ? 'co-body--success' : ''} ${wideCheckout ? 'co-body--wide' : ''}`}>
          <div className={`co-main-panel co-main-panel--page ${step === SUCCESS_STEP_INDEX ? 'co-main-panel--success' : ''} ${transition}`}>
            <CheckoutStepPages step={step} ctx={stepCtx} />
          </div>
        </div>
      </div>
    </div>
  );
}
