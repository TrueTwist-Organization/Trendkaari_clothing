import { pincodeServiceable } from './checkoutStorage';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function contactFromShipping(shipping = {}, loginEmail = '') {
  const email = shipping.email?.trim() || loginEmail?.trim() || '';
  const phone = shipping.phone?.trim() || '';
  const phoneDigits = phone.replace(/\D/g, '');
  const hasValidEmail = Boolean(email && EMAIL_RE.test(email));
  const hasValidPhone = phoneDigits.length >= 10;
  return { email, phone, phoneDigits, hasValidEmail, hasValidPhone };
}

/** Field errors for contact step; empty object when valid. */
export function validateContactFields(shipping = {}, loginEmail = '') {
  const errs = {};
  if (!shipping.fullName?.trim()) errs.fullName = 'Required';

  const { email, phone, hasValidEmail, hasValidPhone } = contactFromShipping(shipping, loginEmail);

  if (hasValidEmail || hasValidPhone) {
    if (email && !hasValidEmail) errs.email = 'Enter a valid email';
    if (phone && !hasValidPhone) errs.phone = 'Enter a valid 10-digit phone number';
  } else if (email || phone) {
    if (email) errs.email = 'Enter a valid email';
    if (phone) errs.phone = 'Enter a valid 10-digit phone number';
  } else {
    errs.contact = 'Enter email or phone — at least one is required';
  }

  return errs;
}

export function isContactComplete(shipping = {}, loginEmail = '') {
  return Object.keys(validateContactFields(shipping, loginEmail)).length === 0;
}

/** Field errors for address step; empty object when valid. */
export function validateAddressFields(shipping = {}) {
  const errs = {};
  if (!shipping.address?.trim()) errs.address = 'Street address is required';
  if (!shipping.city?.trim()) errs.city = 'City is required';
  if (!shipping.state?.trim()) errs.state = 'State is required';
  const pin = pincodeServiceable(shipping.pincode);
  if (!pin.ok) errs.pincode = pin.reason;
  return errs;
}

export function isAddressComplete(shipping = {}) {
  return Object.keys(validateAddressFields(shipping)).length === 0;
}

/** First checkout step index (3=contact) that still needs data before payment. */
export function firstIncompleteStepBeforePayment(stored = {}, loginEmail = '') {
  if (!isContactComplete(stored.shipping, loginEmail)) return 3;
  if (!isAddressComplete(stored.shipping)) return 4;
  return null;
}
