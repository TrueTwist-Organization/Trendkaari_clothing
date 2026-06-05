export const CATALOG_VERSION_KEY = 'trendkaari_catalog_version';

export function bumpCatalogVersion() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATALOG_VERSION_KEY, String(Date.now()));
  } catch {
    /* ignore quota errors */
  }
}

export function getNewArrivalProducts(products = [], limit = 12) {
  const admin = products
    .filter((p) => p.adminCreated || p.source === 'admin')
    .sort(
      (a, b) =>
        new Date(b.adminCreatedAt || 0).getTime() - new Date(a.adminCreatedAt || 0).getTime()
    );

  if (admin.length >= limit) return admin.slice(0, limit);

  const adminIds = new Set(admin.map((p) => p.id));
  const rest = products
    .filter((p) => !adminIds.has(p.id))
    .sort((a, b) => Number(b.id) - Number(a.id));

  return [...admin, ...rest].slice(0, limit);
}
