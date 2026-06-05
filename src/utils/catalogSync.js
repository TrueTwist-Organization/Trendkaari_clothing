export const CATALOG_VERSION_KEY = 'trendkaari_catalog_version';

export function bumpCatalogVersion() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATALOG_VERSION_KEY, String(Date.now()));
  } catch {
    /* ignore quota errors */
  }
}

