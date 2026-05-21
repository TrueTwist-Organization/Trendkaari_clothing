import { updateStore, readStore } from './store.js';

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
      byId.set(
        p.id,
        existing
          ? {
              ...existing,
              ...p,
              stock: existing.stock ?? p.stock,
              variants: existing.variants?.length ? existing.variants : p.variants,
            }
          : p
      );
    }
    store.products = [...byId.values()].sort((a, b) => Number(a.id) - Number(b.id));
    return store;
  });

  const store = readStore();
  return { count: store.products.length, products: store.products };
}
