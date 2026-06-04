/** Prevent the same saved ad unit from rendering twice on one page view. */

let pageKey = '';
const shownSources = new Set();

export function resetAdDedupe(nextPageKey = '') {
  if (nextPageKey !== pageKey) {
    pageKey = nextPageKey;
    shownSources.clear();
  }
}

/** @returns {boolean} true if this source may be shown (first use on page) */
export function claimAdSource(sourceKey) {
  const key = String(sourceKey || '').trim();
  if (!key) return true;
  if (shownSources.has(key)) return false;
  shownSources.add(key);
  return true;
}
