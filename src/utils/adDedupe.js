/** Prevent the same saved ad unit from rendering twice on one page view. */

let pageKey = '';
/** sourceKey -> ownerKey (placement that claimed this ad unit) */
const claimsBySource = new Map();

export function resetAdDedupe(nextPageKey = '') {
  if (nextPageKey !== pageKey) {
    pageKey = nextPageKey;
    claimsBySource.clear();
  }
}

/**
 * @returns {boolean} true if this owner may show this source
 * Same placement re-rendering (React updates) is allowed; a different placement is blocked.
 */
export function claimAdSource(sourceKey, ownerKey) {
  const source = String(sourceKey || '').trim();
  const owner = String(ownerKey || source || '').trim();
  if (!source) return true;

  const existing = claimsBySource.get(source);
  if (!existing) {
    claimsBySource.set(source, owner);
    return true;
  }
  return existing === owner;
}
