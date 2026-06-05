/** Prevent the same saved ad unit from rendering twice on one page view. */

let pageKey = '';
/** fingerprint -> ownerKey (placement that claimed this ad unit) */
const claimsByFingerprint = new Map();

export function resetAdDedupe(nextPageKey = '') {
  if (nextPageKey !== pageKey) {
    pageKey = nextPageKey;
    claimsByFingerprint.clear();
  }
}

/** Same GAM slot path or HTML body = same ad — block duplicate stacks on one page. */
export function getAdUnitFingerprint(code = '', sourceKey = '') {
  const text = String(code || '').trim();
  const slotPath =
    text.match(/googletag\.defineSlot\s*\(\s*['"]([^'"]+)['"]/)?.[1] ||
    text.match(/\/\d+\/a\d+/)?.[0];
  if (slotPath) return `gam:${slotPath}`;
  if (text) return `html:${text.length}:${text.slice(0, 96)}`;
  return `key:${String(sourceKey || '').trim()}`;
}

/**
 * @returns {boolean} true if this owner may show this ad
 */
export function claimAdSource(sourceKey, ownerKey, code = '') {
  const owner = String(ownerKey || sourceKey || '').trim();
  if (!owner) return true;

  const fingerprint = getAdUnitFingerprint(code, sourceKey);
  const existing = claimsByFingerprint.get(fingerprint);
  if (!existing) {
    claimsByFingerprint.set(fingerprint, owner);
    return true;
  }
  return existing === owner;
}
