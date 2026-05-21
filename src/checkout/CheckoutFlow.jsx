import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
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
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { userLogin, userRegister } from '../api/userApi';
import { setUserToken } from '../api/client';
import OrderSummary from './OrderSummary';
import OrderSuccess from './OrderSuccess';
import OrderTechnicalError from './OrderTechnicalError';
import {
  loadCheckoutState,
  saveCheckoutState,
  clearCheckoutState,
  pincodeServiceable,
} from './checkoutStorage';
import { computeCouponDiscountAmount } from '../utils/couponDiscount';
import PageAdSlot from '../components/PageAdSlot';
import './CheckoutFlow.css';

const STEPS = [
  { id: 'login', icon: '🔐', label: 'Login' },
  { id: 'shipping', icon: '📍', label: 'Shipping' },
  { id: 'review', icon: '🛍️', label: 'Review' },
  { id: 'payment', icon: '💳', label: 'Payment' },
  { id: 'success', icon: '✅', label: 'Success' },
];

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

function ProgressBar({ currentStep }) {
  return (
    <div className="co-progress-wrap" role="navigation" aria-label="Checkout progress">
      <div className="co-progress-steps">
        {STEPS.map((s, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div
              key={s.id}
              className={`co-progress-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}
            >
              <div className="co-progress-circle" aria-current={active ? 'step' : undefined}>
                {active && <span className="co-progress-glow" aria-hidden />}
                {done ? (
                  <svg className="co-check-svg" viewBox="0 0 24 24" aria-hidden>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="co-progress-emoji" aria-hidden>
                    {s.icon}
                  </span>
                )}
              </div>
              <span className="co-progress-label">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  onClose,
  cartItems = [],
  coupons = [],
  user,
  adCodes = {},
  onUserLogin,
  onPlaceOrder,
  onContinueShopping,
  onReviewCart,
}) {
  const ad = (key) => adCodes[key] || '';
  const [step, setStep] = useState(0);
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
  const [orderFailed, setOrderFailed] = useState(false);
  const [orderFailMessage, setOrderFailMessage] = useState('');
  const [confetti, setConfetti] = useState([]);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [successPause, setSuccessPause] = useState(false);
  const [shipLoading, setShipLoading] = useState(false);
  const [shippingSubStep, setShippingSubStep] = useState(0);
  const [reservedMinutes, setReservedMinutes] = useState(12);
  const panelRef = useRef(null);

  useEffect(() => {
    if (step !== 1) setShippingSubStep(0);
  }, [step]);

  const persist = useCallback((partial) => {
    const next = saveCheckoutState(partial);
    setStored(next);
    return next;
  }, []);

  const handleClose = useCallback(() => {
    if (step >= 4) {
      const saved = loadCheckoutState();
      const resetStep = user ? 1 : 0;
      saveCheckoutState({ step: resetStep });
      setStep(resetStep);
      setStored({ ...saved, step: resetStep });
    }
    setCompletedOrder(null);
    setOrderFailed(false);
    setOrderFailMessage('');
    onClose?.();
  }, [step, user, onClose]);

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
    if (!isOpen) return;
    const saved = loadCheckoutState();
    const payment =
      saved.payment?.method === 'cod'
        ? saved.payment
        : { ...saved.payment, method: 'cod', codConfirmed: false };
    let normalized = payment !== saved.payment ? { ...saved, payment } : saved;
    setCouponCode(normalized.coupon?.code || '');
    setAppliedCoupon(normalized.coupon?.applied || null);
    setCompletedOrder(null);
    setOrderFailed(false);
    setOrderFailMessage('');

    // Stale success step from a previous order leaves a blank screen (success UI needs completedOrder).
    let initialStep = Number(normalized.step) || 0;
    if (initialStep >= 4) {
      initialStep = user ? 1 : 0;
      normalized = { ...normalized, step: initialStep };
      saveCheckoutState({ step: initialStep, payment: normalized.payment });
    }

    setStored(normalized);
    if (payment !== saved.payment) saveCheckoutState({ payment: normalized.payment });

    if (user) {
      const stepForUser = Math.max(initialStep, 1);
      setStep(stepForUser);
      persist({
        step: stepForUser,
        shipping: {
          ...normalized.shipping,
          fullName: normalized.shipping.fullName || user.name || '',
          phone: normalized.shipping.phone || user.phone || '',
        },
        login: { ...normalized.login, email: user.email || normalized.login.email },
      });
    } else {
      setStep(initialStep);
      if (initialStep !== normalized.step) persist({ step: initialStep });
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, user, persist]);

  useEffect(() => {
    if (!isOpen || step >= 4) return;
    const t = setInterval(() => setReservedMinutes((m) => (m > 0 ? m - 1 : 0)), 60000);
    return () => clearInterval(t);
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen || step !== 3) return;
    if (stored.payment?.method === 'cod') return;
    persist({ payment: { ...stored.payment, method: 'cod' } });
  }, [isOpen, step, stored.payment?.method, persist]);

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
    const transitions = {
      1: 'co-silk-enter',
      2: 'co-curtain-enter',
      3: 'co-page-enter',
      4: 'co-burst-enter',
    };
    setTransition(anim || transitions[n] || 'co-step-enter');
    setStep(n);
    persist({ step: n });
    setError('');
    setFieldErrors({});
    if (n === 4) {
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
        goStep(1);
      }, 900);
    };

    if (authMode === 'guest') {
      persist({ guest: true });
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
    const errs = {};
    if (!s.fullName?.trim()) errs.fullName = 'Required';
    if (!s.phone?.trim() || s.phone.replace(/\D/g, '').length < 10) errs.phone = 'Valid phone required';
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      triggerShake();
      return false;
    }
    setFieldErrors({});
    setError('');
    setShippingSubStep(1);
    return true;
  };

  const validateShippingAddress = () => {
    const s = stored.shipping || {};
    const errs = {};
    if (!s.address?.trim()) errs.address = 'Required';
    if (!s.city?.trim()) errs.city = 'Required';
    if (!s.state?.trim()) errs.state = 'Required';
    const pin = pincodeServiceable(s.pincode);
    if (!pin.ok) errs.pincode = pin.reason;
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      triggerShake();
      return false;
    }
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
      goStep(2);
    }, 700);
    return true;
  };

  const placeOrder = async () => {
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
      if (result.emailSent !== true) {
        throw new Error(
          result.emailError ||
            'Confirmation email could not be sent. Please start checkout again from your bag.'
        );
      }
      const order = {
        ...result.order,
        trackingId:
          result.order.trackingId ||
          'TRK' + Math.floor(100000000 + Math.random() * 900000000),
        eta: result.order.eta || pincodeServiceable(stored.shipping.pincode).eta,
      };
      setCompletedOrder(order);
      persist({ lastOrderId: order.id });
      spawnConfetti();
      goStep(4);
    } catch (err) {
      const msg = err?.message || '';
      if (/sign in/i.test(msg)) {
        setError(msg);
        return;
      }
      setPaymentFail(false);
      setError('');
      setOrderFailMessage(msg || 'We could not complete your order due to a technical issue.');
      setOrderFailed(true);
      window.scrollTo?.(0, 0);
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

  if (!isOpen) return null;

  const showTechnicalError = orderFailed || (cartItems.length === 0 && !completedOrder);

  if (showTechnicalError) {
    return (
      <div className="checkout-flow-root" role="dialog" aria-modal="true" aria-label="Checkout">
        <button type="button" className="co-close-btn" onClick={handleClose} aria-label="Close checkout">
          <X size={22} />
        </button>
        <div className="co-body co-body--fail">
          <PageAdSlot code={ad('checkout_empty_cart')} label="checkout_empty_cart" variant="checkout" />
          <OrderTechnicalError
            detailMessage={orderFailMessage}
            onSelectProductsAgain={() => {
              setOrderFailed(false);
              setOrderFailMessage('');
              onContinueShopping?.();
            }}
            onReviewCart={() => {
              setOrderFailed(false);
              setOrderFailMessage('');
              handleClose();
              onReviewCart?.();
            }}
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

      {!orderFailed && step < 4 && <ProgressBar currentStep={step} />}

      {!orderFailed && step < 4 && (
        <PageAdSlot code={ad('checkout_top')} label="checkout_top" variant="checkout" />
      )}

      {offline && (
        <div className="co-alert-banner offline" style={{ margin: '0 24px 8px', maxWidth: 1052, marginLeft: 'auto', marginRight: 'auto' }}>
          <WifiOff size={18} />
          <span>Offline — changes saved locally. Reconnect to complete payment.</span>
          <button type="button" className="co-social-btn" style={{ marginLeft: 'auto', padding: '6px 12px' }} onClick={() => setOffline(!navigator.onLine)}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {reservedMinutes > 0 && step === 3 && (
        <div className="co-alert-banner warn" style={{ margin: '0 24px 8px', maxWidth: 1052, marginLeft: 'auto', marginRight: 'auto' }}>
          Items reserved for {reservedMinutes} min — complete checkout soon.
        </div>
      )}

      {!orderFailed && step < 4 && (
        <PageAdSlot code={ad('checkout_after_banners')} label="checkout_after_banners" variant="checkout" />
      )}

      <div className={`co-body co-body--pages ${step === 4 ? 'co-body--success' : ''}`}>
        <div className={`co-main-panel co-main-panel--page ${step === 4 ? 'co-main-panel--success' : ''} ${transition}`}>
          {step === 0 && (
            <div className={`co-glass-card ${transition || 'co-step-enter'}`}>
              {loginSuccess && (
                <div className="co-login-success" role="status">
                  <svg className="co-check-svg" viewBox="0 0 24 24" aria-hidden>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <p>Welcome back — your bag is ready ✨</p>
                  <span className="co-bag-confetti" aria-hidden>
                    🛍️✨
                  </span>
                </div>
              )}
              <div className="co-assistant-row">
                <AssistantIllustration wave />
                <div>
                  <h2 className="co-step-heading co-typewriter">Welcome to Checkout ✨</h2>
                  <p className="co-step-sub">Sign in for faster delivery & order tracking</p>
                </div>
              </div>

              <PageAdSlot code={ad('checkout_login_top')} label="checkout_login_top" variant="checkout" />

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
                  Continue as Guest
                </button>
              </div>

              {user && (
                <div className="co-alert-banner" style={{ background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.4)' }}>
                  Signed in as <strong>{user.name || user.email}</strong>
                  <button type="button" className="co-btn-primary" style={{ marginLeft: 'auto', flex: 'none', padding: '8px 16px' }} onClick={() => goStep(1)}>
                    Continue
                  </button>
                </div>
              )}

              {authMode !== 'guest' && !user && (
                <>
                  <div className="co-pill-group">
                    <button type="button" className={`co-pill ${loginTab === 'email' ? 'active' : ''}`} onClick={() => setLoginTab('email')}>
                      Email
                    </button>
                    <button type="button" className={`co-pill ${loginTab === 'otp' ? 'active' : ''}`} onClick={() => setLoginTab('otp')}>
                      Phone OTP
                    </button>
                    <button type="button" className={`co-pill ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>
                      Create Account
                    </button>
                  </div>

                  <div className="co-or-divider">
                    <span className="co-or-line" />
                    <span>OR</span>
                    <span className="co-or-line" />
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      validateLogin();
                    }}
                  >
                    <div className={`co-field ${shake ? 'shake' : ''}`}>
                      <Mail size={18} className="co-field-icon" aria-hidden />
                      <input
                        type="email"
                        placeholder=" "
                        value={stored.login?.email || ''}
                        onChange={(e) => updateLogin('email', e.target.value)}
                        autoComplete="email"
                      />
                      <label>Email address</label>
                      {fieldErrors.email && <p className="co-field-error">{fieldErrors.email}</p>}
                    </div>

                    {loginTab === 'otp' ? (
                      <div className="co-field">
                        <Phone size={18} className="co-field-icon" aria-hidden />
                        <input
                          type="tel"
                          placeholder=" "
                          value={stored.login?.phone || ''}
                          onChange={(e) => updateLogin('phone', e.target.value)}
                        />
                        <label>Phone (+91)</label>
                        <p className="co-step-sub" style={{ marginTop: 8 }}>
                          OTP demo: use any 6 digits to continue as guest flow on next step.
                        </p>
                      </div>
                    ) : (
                      <div className={`co-field ${fieldErrors.password ? 'shake' : ''}`}>
                        <Lock size={18} className="co-field-icon" aria-hidden />
                        <input
                          type={showPwd ? 'text' : 'password'}
                          placeholder=" "
                          value={stored.login?.password || ''}
                          onChange={(e) => updateLogin('password', e.target.value)}
                          autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                        />
                        <label>Password</label>
                        <button type="button" className="co-pwd-toggle" onClick={() => setShowPwd((v) => !v)} aria-label="Toggle password">
                          {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {authMode === 'register' && (
                          <div className="co-strength-bar">
                            <div
                              className="co-strength-fill"
                              style={{
                                width: `${strength}%`,
                                background: strength < 50 ? '#e74c3c' : strength < 75 ? '#f39c12' : '#27ae60',
                              }}
                            />
                          </div>
                        )}
                        {fieldErrors.password && <p className="co-field-error">{fieldErrors.password}</p>}
                      </div>
                    )}

                    {error && <p className="co-field-error">{error}</p>}

                    <button type="submit" className={`co-btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
                      {loading && <span className="co-hanger-loader" />}
                      {loading ? 'Signing in…' : authMode === 'register' ? 'Create Account' : 'Continue'}
                      {loading && <span className="co-btn-progress" />}
                    </button>
                  </form>

                  <div className="co-social-row">
                    <button type="button" className="co-social-btn" onClick={() => setError('Google sign-in coming soon')}>
                      Google
                    </button>
                    <button type="button" className="co-social-btn" onClick={() => setError('Apple sign-in coming soon')}>
                      Apple
                    </button>
                  </div>
                  <p className="co-step-sub" style={{ marginTop: 12 }}>
                    <button type="button" style={{ background: 'none', border: 'none', color: 'var(--co-accent)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setError('Reset link sent to your email (demo)')}>
                      Forgot password?
                    </button>
                  </p>
                </>
              )}

              {authMode === 'guest' && (
                <button type="button" className="co-btn-primary" onClick={() => validateLogin()}>
                  Continue as Guest
                </button>
              )}

              <PageAdSlot code={ad('checkout_login_bottom')} label="checkout_login_bottom" variant="checkout" />
            </div>
          )}

          {step === 1 && (
            <div className={`co-glass-card co-ship-form ${transition || 'co-step-enter'}`}>
              <div className="co-ship-mini-steps" aria-label="Shipping form progress">
                <span className={shippingSubStep === 0 ? 'active' : 'done'}>1. Contact</span>
                <span className="co-ship-mini-sep" aria-hidden />
                <span className={shippingSubStep === 1 ? 'active' : ''}>2. Address</span>
              </div>

              {shippingSubStep === 0 ? (
                <>
                  <h2 className="co-step-heading co-step-heading--wrap">Who is receiving? 👤</h2>
                  <p className="co-step-sub">Name and phone for delivery updates</p>

                  <PageAdSlot
                    code={ad('checkout_shipping_contact_top')}
                    label="checkout_shipping_contact_top"
                    variant="checkout"
                  />

                  <div className="co-field">
                    <User size={18} className="co-field-icon" />
                    <input
                      placeholder=" "
                      value={stored.shipping?.fullName || ''}
                      onChange={(e) => updateShipping('fullName', e.target.value)}
                      autoComplete="name"
                    />
                    <label>Full name</label>
                    {fieldErrors.fullName && <p className="co-field-error">{fieldErrors.fullName}</p>}
                  </div>
                  <div className="co-field">
                    <Phone size={18} className="co-field-icon" />
                    <input
                      placeholder=" "
                      type="tel"
                      value={stored.shipping?.phone || ''}
                      onChange={(e) => updateShipping('phone', e.target.value)}
                      autoComplete="tel"
                    />
                    <label>Phone</label>
                    {fieldErrors.phone && <p className="co-field-error">{fieldErrors.phone}</p>}
                  </div>

                  <PageAdSlot
                    code={ad('checkout_shipping_contact_bottom')}
                    label="checkout_shipping_contact_bottom"
                    variant="checkout"
                  />

                  <div className="co-cta-row">
                    <button type="button" className="co-btn-back" onClick={() => goStep(0)}>
                      Back
                    </button>
                    <button type="button" className="co-btn-primary" onClick={validateShippingContact}>
                      Next — Delivery address
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <MapUnfoldIllustration />
                  <h2 className="co-step-heading co-step-heading--wrap">Where should we send your order? 📦</h2>
                  <p className="co-step-sub">
                    Delivering to <strong>{stored.shipping?.fullName}</strong> · {stored.shipping?.phone}
                  </p>

                  <PageAdSlot
                    code={ad('checkout_shipping_address_top')}
                    label="checkout_shipping_address_top"
                    variant="checkout"
                  />

                  {(stored.savedAddresses || []).length > 0 && (
                    <div className="co-address-grid">
                      {stored.savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          className={`co-address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            persist({ shipping: { ...stored.shipping, ...addr } });
                          }}
                        >
                          <strong>{addr.fullName}</strong>
                          <br />
                          <span style={{ fontSize: 12, opacity: 0.85 }}>
                            {addr.address}, {addr.city} — {addr.pincode}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="co-address-type-pills">
                    {['home', 'office', 'other'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={stored.shipping?.addressType === t ? 'active' : ''}
                        onClick={() => updateShipping('addressType', t)}
                      >
                        {t === 'home' ? <Home size={12} style={{ verticalAlign: -2, marginRight: 4 }} /> : null}
                        {t === 'office' ? <Building2 size={12} style={{ verticalAlign: -2, marginRight: 4 }} /> : null}
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="co-field">
                    <MapPin size={18} className="co-field-icon" />
                    <textarea
                      placeholder=" "
                      value={stored.shipping?.address || ''}
                      onChange={(e) => updateShipping('address', e.target.value)}
                      rows={2}
                      autoComplete="street-address"
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
                  <div className="co-form-row co-form-row--3">
                    <div className="co-field">
                      <input
                        placeholder=" "
                        value={stored.shipping?.city || ''}
                        onChange={(e) => updateShipping('city', e.target.value)}
                        autoComplete="address-level2"
                      />
                      <label>City</label>
                      {fieldErrors.city && <p className="co-field-error">{fieldErrors.city}</p>}
                    </div>
                    <div className="co-field">
                      <input
                        placeholder=" "
                        value={stored.shipping?.state || ''}
                        onChange={(e) => updateShipping('state', e.target.value)}
                        autoComplete="address-level1"
                      />
                      <label>State</label>
                      {fieldErrors.state && <p className="co-field-error">{fieldErrors.state}</p>}
                    </div>
                    <div className="co-field">
                      <input
                        placeholder=" "
                        value={stored.shipping?.pincode || ''}
                        onChange={(e) => updateShipping('pincode', e.target.value)}
                        maxLength={6}
                        autoComplete="postal-code"
                      />
                      <label>Pincode</label>
                      {fieldErrors.pincode && <p className="co-field-error">{fieldErrors.pincode}</p>}
                    </div>
                  </div>
                  <div className="co-field">
                    <textarea
                      placeholder=" "
                      value={stored.shipping?.notes || ''}
                      onChange={(e) => updateShipping('notes', e.target.value)}
                      rows={2}
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
                  <label className="co-check-row co-check-row--last">
                    <input
                      type="checkbox"
                      checked={stored.shipping?.gstInvoice}
                      onChange={(e) => updateShipping('gstInvoice', e.target.checked)}
                    />
                    GST invoice required
                  </label>

                  {pinInfo.ok && (
                    <div className="co-eta-card">
                      <Truck size={20} color="#27AE60" />
                      <span>
                        Estimated delivery: <strong>{pinInfo.eta}</strong>
                        {pinInfo.express ? ' · Express available' : ''}
                      </span>
                    </div>
                  )}

                  <PageAdSlot
                    code={ad('checkout_shipping_address_bottom')}
                    label="checkout_shipping_address_bottom"
                    variant="checkout"
                  />

                  <div className="co-cta-row">
                    <button type="button" className="co-btn-back" onClick={() => setShippingSubStep(0)}>
                      Back
                    </button>
                    <button
                      type="button"
                      className={`co-btn-primary co-ship-btn ${shipLoading ? 'loading' : ''}`}
                      disabled={shipLoading}
                      onClick={validateShippingAddress}
                    >
                      {shipLoading ? (
                        <>
                          <span className="co-hanger-loader" /> Saving…
                        </>
                      ) : (
                        <>
                          <span className="co-parcel-icon" aria-hidden>
                            📦
                          </span>
                          Continue to Review
                        </>
                      )}
                      {shipLoading && <span className="co-btn-progress" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className={`co-glass-card co-page-card co-page-card--review ${transition || 'co-step-enter'}`}>
              <h2 className="co-step-heading">Review your order 🛍️</h2>
              <p className="co-step-sub">Confirm items, promo code, and total before payment</p>

              <PageAdSlot code={ad('checkout_review_top')} label="checkout_review_top" variant="checkout" />

              <div className="co-review-ship-snippet">
                <MapPin size={16} aria-hidden />
                <div>
                  <strong>{stored.shipping?.fullName}</strong>
                  <p>
                    {stored.shipping?.phone}
                    <br />
                    {stored.shipping?.address}, {stored.shipping?.city}, {stored.shipping?.state} —{' '}
                    {stored.shipping?.pincode}
                  </p>
                  <button
                    type="button"
                    className="co-link-btn"
                    onClick={() => {
                      setShippingSubStep(1);
                      goStep(1);
                    }}
                  >
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
              />

              <PageAdSlot
                code={ad('checkout_review_after_summary')}
                label="checkout_review_after_summary"
                variant="checkout"
              />

              <div className="co-cta-row">
                <button type="button" className="co-btn-back" onClick={() => goStep(1)}>
                  Back
                </button>
                <button type="button" className="co-btn-primary" onClick={() => goStep(3)}>
                  Continue to Payment
                </button>
              </div>

              <PageAdSlot code={ad('checkout_review_bottom')} label="checkout_review_bottom" variant="checkout" />
            </div>
          )}

          {step === 3 && (
            <div className={`co-glass-card co-page-card ${transition || 'co-step-enter'}`}>
              <h2 className="co-step-heading">Choose payment method 💳</h2>
              <p className="co-step-sub">Secure boutique checkout</p>

              <PageAdSlot code={ad('checkout_payment_top')} label="checkout_payment_top" variant="checkout" />

              {cartItems.some((i) => i.quantity > 1) && (
                <div className="co-fashion-alert">
                  ⚡ High demand — complete checkout within {reservedMinutes} min
                </div>
              )}
              {cartItems.length > 0 && (
                <div className="co-fashion-alert subtle">
                  👗 {cartItems[0].title?.slice(0, 32)}
                  … — only a few left in your size
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
                      aria-selected={isActive}
                      aria-disabled={!isAvailable}
                      disabled={!isAvailable}
                      className={`co-pay-method ${isActive ? 'active' : ''} ${!isAvailable ? 'co-pay-method--soon' : ''} ${stored.payment?.method && stored.payment.method !== m.id && isAvailable ? 'dimmed' : ''}`}
                      onClick={() => isAvailable && updatePayment('method', m.id)}
                    >
                      {isActive && isAvailable && <span className="co-pay-check">✓</span>}
                      <span className="co-pay-method__label">{m.label}</span>
                      {!isAvailable && <span className="co-pay-soon">Coming soon</span>}
                    </button>
                  );
                })}
              </div>

              <PageAdSlot
                code={ad('checkout_payment_after_methods')}
                label="checkout_payment_after_methods"
                variant="checkout"
              />

              {stored.payment?.method === 'card' && (
                <div className="co-card-preview">
                  <div className={`co-credit-card ${stored.payment?.cvv?.length >= 3 ? 'flipped' : ''}`}>
                    <div>
                      <div className="co-card-chip" />
                      <p style={{ fontSize: 11, marginTop: 8, opacity: 0.8 }}>
                        {detectCardIssuer(stored.payment?.cardNumber || '') || 'Card'}
                      </p>
                    </div>
                    <p className="co-card-number">
                      {(stored.payment?.cardNumber || '•••• •••• •••• ••••').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19) || '•••• •••• •••• ••••'}
                    </p>
                    <p style={{ fontSize: 12 }}>{stored.payment?.cardName || 'YOUR NAME'}</p>
                  </div>
                  <div className="co-field">
                    <CreditCard size={18} className="co-field-icon" />
                    <input placeholder=" " value={stored.payment?.cardNumber || ''} onChange={(e) => updatePayment('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))} />
                    <label>Card number</label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="co-field">
                      <input placeholder=" " value={stored.payment?.expiry || ''} onChange={(e) => updatePayment('expiry', e.target.value)} maxLength={5} />
                      <label>MM/YY</label>
                    </div>
                    <div className="co-field">
                      <input placeholder=" " value={stored.payment?.cvv || ''} onChange={(e) => updatePayment('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))} type="password" />
                      <label>CVV</label>
                    </div>
                  </div>
                  <label style={{ fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="checkbox" checked={stored.payment?.saveCard} onChange={(e) => updatePayment('saveCard', e.target.checked)} />
                    Save card securely
                  </label>
                </div>
              )}

              {stored.payment?.method === 'upi' && (
                <>
                  <div className="co-upi-qr" aria-hidden>
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <rect fill="#eee" width="100" height="100" />
                      {[...Array(8)].map((_, i) => (
                        <rect key={i} x={(i % 4) * 25} y={Math.floor(i / 4) * 25} width="20" height="20" fill={i % 2 ? '#2A0019' : '#7A1E48'} />
                      ))}
                    </svg>
                    <span className="co-scan-line" />
                  </div>
                  <div className="co-field">
                    <input placeholder=" " value={stored.payment?.upiId || ''} onChange={(e) => updatePayment('upiId', e.target.value)} />
                    <label>UPI ID</label>
                  </div>
                  <p className="co-timer">Complete payment within 5:00</p>
                </>
              )}

              {stored.payment?.method === 'cod' && (
                <div className="co-glass-card" style={{ marginTop: 12, padding: 16 }}>
                  <p style={{ fontSize: 14, marginBottom: 12 }}>Cash on Delivery — ₹0 extra fee in serviceable areas.</p>
                  <label style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                    <input type="checkbox" checked={stored.payment?.codConfirmed} onChange={(e) => updatePayment('codConfirmed', e.target.checked)} />
                    I confirm I will pay ₹{grandTotal} on delivery
                  </label>
                </div>
              )}

              {stored.payment?.method === 'wallet' && (
                <div className="co-wallet-panel co-glass-card">
                  <p>
                    Wallet balance: <strong>₹{Math.max(0, 500 - grandTotal)}</strong>
                  </p>
                  {grandTotal > 500 && (
                    <p className="co-step-sub">Low balance — top up or choose another method.</p>
                  )}
                </div>
              )}

              {stored.payment?.method === 'gift' && (
                <div className="co-glass-card" style={{ marginTop: 12, padding: 16 }}>
                  <div className="co-field">
                    <input
                      placeholder=" "
                      value={stored.payment?.giftCode || ''}
                      onChange={(e) => updatePayment('giftCode', e.target.value)}
                    />
                    <label>Gift card code</label>
                  </div>
                  <button type="button" className="co-social-btn" style={{ width: '100%', marginTop: 8 }} onClick={() => setError('Gift card applied (demo)')}>
                    Apply gift card
                  </button>
                </div>
              )}

              {paymentFail && (
                <div className="co-alert-banner error">
                  Payment failed. <button type="button" onClick={placeOrder} style={{ color: 'var(--co-accent)', marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
                </div>
              )}

              {error && <p className="co-field-error">{error}</p>}

              <div className="co-cta-row">
                <button type="button" className="co-btn-back" onClick={() => goStep(2)}>
                  Back
                </button>
                <button
                  type="button"
                  className={`co-btn-primary ${paymentProcessing ? 'loading' : ''}`}
                  disabled={paymentProcessing}
                  onClick={placeOrder}
                >
                  {paymentProcessing ? (
                    <>
                      <span className="co-hanger-loader" /> Processing…
                    </>
                  ) : (
                    'Place Order'
                  )}
                  {paymentProcessing && <span className="co-btn-progress" />}
                </button>
              </div>

              <PageAdSlot code={ad('checkout_payment_bottom')} label="checkout_payment_bottom" variant="checkout" />
            </div>
          )}

          {step === 4 && completedOrder && (
            <>
              <PageAdSlot code={ad('checkout_success_top')} label="checkout_success_top" variant="checkout" />
              <OrderSuccess
              order={completedOrder}
              grandTotal={grandTotal}
              orderEta={pinInfo.eta}
              itemCount={
                completedOrder.items?.reduce((n, i) => n + (i.quantity || 1), 0) ||
                cartItems.reduce((n, i) => n + (i.quantity || 1), 0)
              }
              successPause={successPause}
              transition={transition}
              onContinueShopping={() => {
                clearCheckoutState();
                onContinueShopping?.();
                onClose?.();
              }}
            />
              <PageAdSlot code={ad('checkout_success_bottom')} label="checkout_success_bottom" variant="checkout" />
            </>
          )}
        </div>

        <PageAdSlot code={ad('checkout_page_bottom')} label="checkout_page_bottom" variant="checkout" />
      </div>
    </div>
  );
}
