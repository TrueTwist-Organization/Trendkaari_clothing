const STORAGE_KEY = 'flexfit_checkout_v1';

const defaultState = () => ({
  step: 0,
  guest: false,
  login: { email: '', password: '', phone: '', otp: '', mode: 'email' },
  shipping: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    notes: '',
    addressType: 'home',
    saveAddress: true,
    gstInvoice: false,
  },
  savedAddresses: [],
  payment: {
    method: 'cod',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    upiId: '',
    saveCard: false,
    codConfirmed: false,
    giftCode: '',
  },
  coupon: { code: '', applied: null },
  loyaltyPoints: 0,
  scrollY: 0,
  lastOrderId: null,
  updatedAt: Date.now(),
});

export function loadCheckoutState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export function saveCheckoutState(partial) {
  try {
    const current = loadCheckoutState();
    const next = { ...current, ...partial, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return partial;
  }
}

export function clearCheckoutState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function pincodeServiceable(pincode) {
  const p = String(pincode || '').replace(/\D/g, '');
  if (p.length !== 6) return { ok: false, reason: 'Enter a valid 6-digit pincode' };
  if (p.startsWith('0')) return { ok: false, reason: 'Service not available in this pincode' };
  const express = !['110', '400', '560'].some((x) => p.startsWith(x));
  return { ok: true, express, cod: true, eta: express ? '5–7 days' : '2–4 days' };
}
