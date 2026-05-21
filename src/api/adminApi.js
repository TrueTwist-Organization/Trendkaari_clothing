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

export function createProduct(formData) {
  return apiFetch('/api/admin/products', { method: 'POST', body: formData });
}

export function updateProduct(id, formData) {
  return apiFetch(`/api/admin/products/${id}`, { method: 'PATCH', body: formData });
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

export function saveAdminAdSlots(slots) {
  return apiFetch('/api/admin/ad-slots', {
    method: 'PUT',
    body: JSON.stringify({ slots }),
  });
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
