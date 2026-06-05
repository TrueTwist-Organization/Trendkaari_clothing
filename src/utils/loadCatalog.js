import { fetchStoreProducts } from '../api/storeApi';

let catalogPromise = null;

/** Fetch catalog from API; lazy-load local fallback only if API is down. */
export async function loadCatalogProducts() {
  if (catalogPromise) return catalogPromise;

  catalogPromise = (async () => {
    const fromApi = await fetchStoreProducts();
    if (fromApi?.length) return fromApi;

    const mod = await import('../data/products.js');
    return mod.products || [];
  })();

  return catalogPromise;
}
