import { userApiFetch } from './client';

export function userRegister(payload) {
  return userApiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function userLogin(email, password) {
  return userApiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function userMe() {
  return userApiFetch('/api/auth/me');
}

export function fetchUserOrders() {
  return userApiFetch('/api/auth/orders');
}

export function cancelUserOrder(orderId) {
  return userApiFetch(`/api/auth/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'PATCH',
  });
}

export function updateUserProfile(payload) {
  return userApiFetch('/api/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
