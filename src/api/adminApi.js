import { apiFetch } from './client';

export function adminLogin(email, password) {
  return apiFetch('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function adminMe() {
  return apiFetch('/api/admin/auth/me');
}

export function fetchAnalytics() {
  return apiFetch('/api/admin/analytics/overview');
}

export function fetchAdminProducts(params = {}) {
  const q = new URLSearchParams(params).toString();
  return apiFetch(`/api/admin/products${q ? `?${q}` : ''}`);
}

export function syncAdminCatalog() {
  return apiFetch('/api/admin/products/sync-catalog', { method: 'POST' });
}

function isRetryableProductSaveError(err) {
  const status = err?.status;
  if (status === 502 || status === 503 || status === 504 || status === 500) return true;
  const message = String(err?.message || '').toLowerCase();
  return (
    message.includes('timed out') ||
    message.includes('try again') ||
    message.includes('unavailable') ||
    message.includes('error page')
  );
}

async function withProductSaveRetry(fn) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryableProductSaveError(err) || attempt === 2) throw err;
      await new Promise((resolve) => window.setTimeout(resolve, 700 * (attempt + 1)));
    }
  }
  throw lastErr;
}

export function fetchAdminSystemStatus() {
  return apiFetch('/api/admin/system/status');
}

export function createProduct(formData) {
  return withProductSaveRetry(() =>
    apiFetch('/api/admin/products', { method: 'POST', body: formData })
  );
}

export function updateProduct(id, formData) {
  return withProductSaveRetry(() =>
    apiFetch(`/api/admin/products/${id}`, { method: 'PATCH', body: formData })
  );
}

export function deleteProduct(id) {
  return apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
}

export function fetchAdminOrders() {
  return apiFetch('/api/admin/orders');
}

export function updateOrderStatus(orderId, status) {
  return apiFetch(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteOrder(orderId) {
  return apiFetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
}

export function fetchAdminCoupons() {
  return apiFetch('/api/admin/coupons');
}

export function createCoupon(coupon) {
  return apiFetch('/api/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(coupon),
  });
}

export function deleteCoupon(code) {
  return apiFetch(`/api/admin/coupons/${code}`, { method: 'DELETE' });
}

export function fetchAdminSettings() {
  return apiFetch('/api/admin/settings');
}

export function saveAdminSettings(settings) {
  return apiFetch('/api/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
}

export function fetchAdminAdSlots() {
  return apiFetch('/api/admin/ad-slots');
}

/** UTF-8 base64 — matches server decodeAdCode (Buffer base64 → utf8). */
function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(String(text));
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function encodeSlotsForWire(slots = {}) {
  const encoded = {};
  let clientFilledCount = 0;
  for (const [placement, code] of Object.entries(slots)) {
    const text = String(code || '').trim();
    if (!text) continue;
    clientFilledCount += 1;
    encoded[placement] = utf8ToBase64(text);
  }
  return { slots: encoded, slotsEncoded: true, clientFilledCount, replaceAll: true };
}

async function putAdSlots(body) {
  return apiFetch('/api/admin/ad-slots', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

function isRetryableSaveError(err) {
  const status = err?.status;
  if (status === 400 || status === 413 || status === 502 || status === 503 || status === 504) {
    return true;
  }
  const message = String(err?.message || '').toLowerCase();
  return (
    message.includes('html') ||
    message.includes('invalid api') ||
    message.includes('timed out') ||
    message.includes('too large') ||
    message.includes('error page')
  );
}

/** Save ad slots — always replaceAll so cleared boxes are removed from storage. */
export async function saveAdminAdSlots(slots) {
  const inner = encodeSlotsForWire(slots);

  try {
    return await putAdSlots({ payloadB64: utf8ToBase64(JSON.stringify(inner)) });
  } catch (bulkEncodedErr) {
    if (!isRetryableSaveError(bulkEncodedErr)) throw bulkEncodedErr;
  }

  return putAdSlots(inner);
}

export function fetchAdminGiftCombos() {
  return apiFetch('/api/admin/gift-combos');
}

export function createGiftCombo(combo) {
  return apiFetch('/api/admin/gift-combos', {
    method: 'POST',
    body: JSON.stringify(combo),
  });
}

export function updateGiftCombo(id, combo) {
  return apiFetch(`/api/admin/gift-combos/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(combo),
  });
}

export function deleteGiftCombo(id) {
  return apiFetch(`/api/admin/gift-combos/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function uploadGiftComboImages(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append('images', f));
  return apiFetch('/api/admin/gift-combos/upload', { method: 'POST', body: fd });
}

export function seedDefaultGiftCombos() {
  return apiFetch('/api/admin/gift-combos/seed-defaults', { method: 'POST' });
}
