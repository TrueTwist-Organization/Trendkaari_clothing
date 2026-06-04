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

function looksLikeAdHtml(text = '') {
  return /<(script|div|ins|iframe)/i.test(String(text || ''));
}

/** Unwrap accidental double-base64 saves back to HTML/plain ad code. */
export function normalizeAdPlaintext(raw = '', { encoded = false } = {}) {
  let text = String(raw || '').trim();
  if (!text) return '';
  if (encoded) {
    text = decodeAdCode(text, true).trim();
    if (!text) return '';
  }
  for (let i = 0; i < 2 && !looksLikeAdHtml(text); i += 1) {
    const next = decodeAdCode(text, true).trim();
    if (!next || next === text) break;
    text = next;
  }
  return text;
}
