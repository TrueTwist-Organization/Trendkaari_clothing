/** Full checkout journey: 15 pages (indices 0–14). */
export const CHECKOUT_STEP_COUNT = 15;

export const CHECKOUT_STEPS = [
  { id: 'bag', icon: '🛍️', label: 'My Bag' },
  { id: 'promo', icon: '✨', label: 'Offers' },
  { id: 'coupon', icon: '🏷️', label: 'Promo Code' },
  { id: 'totals', icon: '🧾', label: 'Bill' },
  { id: 'welcome', icon: '👋', label: 'Welcome' },
  { id: 'auth', icon: '🔐', label: 'Account' },
  { id: 'signin', icon: '📧', label: 'Sign In' },
  { id: 'contact', icon: '👤', label: 'Name' },
  { id: 'phone', icon: '📱', label: 'Phone' },
  { id: 'address', icon: '📍', label: 'Address' },
  { id: 'delivery', icon: '🏙️', label: 'Delivery' },
  { id: 'review', icon: '🛍️', label: 'Items' },
  { id: 'summary', icon: '📋', label: 'Summary' },
  { id: 'payment', icon: '💳', label: 'Payment' },
  { id: 'success', icon: '✅', label: 'Done' },
];

export const SUCCESS_STEP_INDEX = 14;
