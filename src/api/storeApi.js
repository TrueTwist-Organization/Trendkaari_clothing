import { publicApiFetch, getUserToken } from './client';

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
  const headers = {};
  const token = getUserToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return publicApiFetch('/api/store/orders', {
    method: 'POST',
    headers,
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

export async function fetchStoreGiftCombos() {
  try {
    const data = await publicApiFetch('/api/store/gift-combos');
    return data.giftCombos;
  } catch {
    return null;
  }
}
