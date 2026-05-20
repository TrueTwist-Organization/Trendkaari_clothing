/** Base64 storage helps avoid WAF blocking script tags in JSON saves */

export function encodeAdCode(plain = '') {
  const text = String(plain || '').trim();
  if (!text) return '';
  return Buffer.from(text, 'utf8').toString('base64');
}

export function decodeAdCode(stored = '', encoded = true) {
  const raw = String(stored || '').trim();
  if (!raw) return '';
  if (!encoded) return raw;
  try {
    return Buffer.from(raw, 'base64').toString('utf8');
  } catch {
    return raw;
  }
}
