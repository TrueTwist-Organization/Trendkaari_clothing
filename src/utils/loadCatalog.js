/** Fetch catalog from live API — never serve stale bundled catalog on production. */

import { fetchStoreProducts } from '../api/storeApi';

let catalogPromise = null;
let catalogCachedAt = 0;
const CATALOG_TTL_MS = 8_000;

function isLocalDevHost() {
  if (typeof window === 'undefined') return false;
  return /localhost|127\.0\.0\.1/.test(window.location.hostname);
}

export function resetCatalogCache() {
  catalogPromise = null;
  catalogCachedAt = 0;
}

async function fetchCatalogWithRetry() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const products = await fetchStoreProducts({ cacheBust: true });
    if (products?.length) return products;
    await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
  }
  return null;
}

async function loadBundledFallback() {
  if (!isLocalDevHost()) return [];
  const mod = await import('../data/products.js');
  return mod.products || [];
}

/** Fetch catalog from API; lazy-load local fallback only if API is down on localhost. */
export async function loadCatalogProducts({ force = false } = {}) {
  const stale = !catalogCachedAt || Date.now() - catalogCachedAt > CATALOG_TTL_MS;
  if (!force && catalogPromise && !stale) return catalogPromise;

  catalogPromise = (async () => {
    const fromApi = await fetchCatalogWithRetry();
    catalogCachedAt = Date.now();
    if (fromApi?.length) return fromApi;
    return loadBundledFallback();
  })();

  return catalogPromise;
}
