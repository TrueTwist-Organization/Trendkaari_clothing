/** Resolve ad HTML for a placement — exact slot only (no fallbacks). */

export function resolveAdCode(adCodes, primaryKey) {
  const code = String(adCodes?.[primaryKey] || '').trim();
  if (code) {
    return { code, label: primaryKey, resolvedFrom: primaryKey };
  }
  return { code: '', label: primaryKey, resolvedFrom: null };
}

export function getAdCode(adCodes, primaryKey) {
  return resolveAdCode(adCodes, primaryKey).code;
}

export function makeAdResolver(adCodes) {
  return (primaryKey) => getAdCode(adCodes, primaryKey);
}
