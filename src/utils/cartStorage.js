const STORAGE_KEY = 'flexfit_cart_v1';

const CART_FIELDS = [
  'id',
  'title',
  'price',
  'originalPrice',
  'image',
  'selectedSize',
  'quantity',
  'gender',
  'subCategory',
  'category',
];

export function slimCartItem(item) {
  if (!item || typeof item !== 'object') return null;

  const slim = {};
  for (const key of CART_FIELDS) {
    if (item[key] !== undefined && item[key] !== null) {
      slim[key] = item[key];
    }
  }

  if (!slim.id || !slim.selectedSize) return null;

  slim.quantity = Math.max(1, Number(slim.quantity) || 1);
  slim.price = Number(slim.price) || 0;

  return slim;
}

export function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(slimCartItem).filter(Boolean);
  } catch {
    return [];
  }
}

export function saveCart(items) {
  try {
    const slim = (Array.isArray(items) ? items : []).map(slimCartItem).filter(Boolean);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* ignore quota errors */
  }
}

export function clearCartStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
