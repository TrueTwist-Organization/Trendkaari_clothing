import { updateStore, readStore } from './store.js';
import { ADMIN_PRODUCT_ID_BASE } from './productIds.js';

/** Admin-added or admin-edited products must never be wiped by catalog sync. */
export function isAdminManagedProduct(p) {
  if (!p) return false;
  if (p.source === 'admin' || p.adminCreated === true) return true;
  const urls = [p.image, ...(p.images || [])].filter(Boolean);
  return urls.some(
    (u) =>
      typeof u === 'string' &&
      (u.includes('blob.vercel-storage.com') ||
        u.includes('/product-media/'))
  );
}

function mergeCatalogIntoExisting(existing, catalog) {
  if (isAdminManagedProduct(existing)) return existing;
  return {
    ...catalog,
    ...existing,
    stock: existing.stock ?? catalog.stock,
    variants: existing.variants?.length ? existing.variants : catalog.variants,
  };
}

export function normalizeProduct(p) {
  const gender =
    p.category === 'men' || p.category === 'gents' || p.wearType === 'gents' ? 'gents' : 'ladies';
  const stock = p.stock ?? 24;
  const sizes = p.sizes ?? ['S', 'M', 'L', 'XL'];
  const stockBySize = {};
  sizes.forEach((sz) => {
    stockBySize[sz] = Math.max(1, Math.floor(stock / sizes.length));
  });

  return {
    ...p,
    stock,
    gender,
    fabricTags: p.fabricTags ?? ['Cotton'],
    variants: p.variants ?? [
      {
        id: 'default',
        color: 'Default',
        colorHex: '#f5f5f5',
        stockBySize,
      },
    ],
    images: p.images ?? [p.image],
  };
}

export async function syncCatalogFromSource() {
  const { products } = await import('../../src/data/products.js');
  const normalized = products.map(normalizeProduct);

  await updateStore((store) => {
    const byId = new Map((store.products || []).map((p) => [p.id, p]));
    for (const p of normalized) {
      const existing = byId.get(p.id);
      if (existing && (isAdminManagedProduct(existing) || Number(existing.id) >= ADMIN_PRODUCT_ID_BASE)) {
        continue;
      }
      byId.set(p.id, existing ? mergeCatalogIntoExisting(existing, p) : p);
    }
    store.products = [...byId.values()].sort((a, b) => Number(a.id) - Number(b.id));
    return store;
  });

  const store = readStore();
  const adminAdded = (store.products || []).filter(isAdminManagedProduct).length;
  return {
    count: store.products.length,
    adminAdded,
    products: store.products,
    message: `Catalog updated. ${store.products.length} total products (${adminAdded} admin-added). Admin products are never removed.`,
  };
}
