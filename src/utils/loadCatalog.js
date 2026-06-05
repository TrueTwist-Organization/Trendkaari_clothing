/** Fetch catalog from API; lazy-load local fallback only if API is down. */

import { fetchStoreProducts } from '../api/storeApi';

let catalogPromise = null;
let catalogCachedAt = 0;
const CATALOG_TTL_MS = 15_000;

export function resetCatalogCache() {
  catalogPromise = null;
  catalogCachedAt = 0;
}

/** Fetch catalog from API; lazy-load local fallback only if API is down. */
export async function loadCatalogProducts({ force = false } = {}) {
  const stale = !catalogCachedAt || Date.now() - catalogCachedAt > CATALOG_TTL_MS;
  if (!force && catalogPromise && !stale) return catalogPromise;

  catalogPromise = (async () => {
    const fromApi = await fetchStoreProducts();
    catalogCachedAt = Date.now();
    if (fromApi?.length) return fromApi;

    const mod = await import('../data/products.js');
    return mod.products || [];
  })();

  return catalogPromise;
}
