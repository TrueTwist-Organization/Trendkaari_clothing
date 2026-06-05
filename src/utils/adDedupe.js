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

/** Unique per placement div id — allows a1/a2 units on many slots without blocking each other. */
export function getAdUnitFingerprint(code = '', sourceKey = '') {
  const text = String(code || '').trim();
  const divId =
    text.match(/id=['"](div-gpt-ad-[^'"]+)['"]/)?.[1] ||
    text.match(/display\s*\(\s*['"](div-gpt-ad-[^'"]+)['"]/)?.[1] ||
    text.match(/(div-gpt-ad-[a-zA-Z0-9_-]+)/)?.[1];
  if (divId) return `gpt:${divId}`;
  if (sourceKey) return `key:${String(sourceKey).trim()}`;
  if (text) return `html:${text.length}:${text.slice(0, 96)}`;
  return 'empty';
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
