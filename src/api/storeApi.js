import { publicApiFetch, userApiFetch } from './client';

export async function fetchStoreProducts() {
  try {
    const data = await publicApiFetch('/api/store/products');
    return data.products;
  } catch {
    return null;
  }
}

export async function fetchStoreCoupons() {
  try {
    const data = await publicApiFetch('/api/store/coupons');
    return data.coupons;
  } catch {
    return null;
  }
}

export async function submitStoreOrder(orderDetails) {
  return userApiFetch('/api/store/orders', {
    method: 'POST',
    body: JSON.stringify(orderDetails),
  });
}

export async function fetchStoreSettings() {
  try {
    const data = await publicApiFetch('/api/store/settings');
    return data.settings;
  } catch {
    return null;
  }
}

export async function fetchStoreAdSlots(placement = null) {
  try {
    const q = placement ? `?placement=${encodeURIComponent(placement)}` : '';
    const data = await publicApiFetch(`/api/store/ad-slots${q}`);
    return data.adSlots;
  } catch {
    return null;
  }
}
