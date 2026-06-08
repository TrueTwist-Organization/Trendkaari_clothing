/** Shared catalog price tiers — used by scripts and live DB migration. */

export const PRICE_TIERS = [99, 129, 139, 149];

export const PRICE_MIGRATION_VERSION = 2;

export function categoryKey(product) {
  return (product.subCategory || product.category || 'other').toLowerCase().trim();
}

export function applyCatalogPricing(products = []) {
  const groups = new Map();

  for (const product of products) {
    const key = categoryKey(product);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product);
  }

  const priceById = new Map();

  for (const [key, group] of groups) {
    const sorted = [...group].sort((a, b) => Number(a.id) - Number(b.id));
    const offset = Math.abs(key.split('').reduce((n, c) => n + c.charCodeAt(0), 0)) % PRICE_TIERS.length;

    sorted.forEach((product, index) => {
      const tierIdx = (offset + index) % PRICE_TIERS.length;
      priceById.set(product.id, PRICE_TIERS[tierIdx]);
    });
  }

  return products.map((product) => {
    const price = priceById.get(product.id) ?? PRICE_TIERS[0];
    const originalPrice = Math.round(price * 2);
    const discountPct = Math.max(1, Math.round((1 - price / originalPrice) * 100));

    return {
      ...product,
      price,
      originalPrice,
      discount: `${discountPct}% OFF`,
    };
  });
}

export function productsNeedPriceMigration(products = []) {
  return products.some((product) => !PRICE_TIERS.includes(Number(product.price)));
}

export function countPriceTiers(products = []) {
  return PRICE_TIERS.reduce((acc, tier) => {
    acc[tier] = products.filter((p) => Number(p.price) === tier).length;
    return acc;
  }, {});
}

export function migratePricesInStore(store = {}) {
  const currentVersion = Number(store._priceMigrationVersion) || 0;
  const products = store.products || [];
  const needsUpdate =
    currentVersion < PRICE_MIGRATION_VERSION || productsNeedPriceMigration(products);

  if (!needsUpdate) {
    return { store, migrated: false, changedCount: 0 };
  }

  const updated = applyCatalogPricing(products);
  const changedCount = updated.filter((p, i) => Number(p.price) !== Number(products[i]?.price)).length;

  return {
    migrated: true,
    changedCount,
    counts: countPriceTiers(updated),
    store: {
      ...store,
      products: updated,
      _priceMigrationVersion: PRICE_MIGRATION_VERSION,
    },
  };
}
