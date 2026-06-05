import { normalizeAdPlaintext } from './adSlotCode.js';

function looksLikeAdHtml(text = '') {
  return /<(script|div|ins|iframe)/i.test(String(text || '')) || /div-gpt-ad|adsbygoogle/i.test(text);
}

/** True when saved slot decodes to real ad markup (not corrupt/garbage saves). */
export function isValidAdSlot(slot) {
  if (!slot?.placement) return false;
  const plain = normalizeAdPlaintext(slot.code, { encoded: slot.encoded !== false });
  return looksLikeAdHtml(plain);
}

export function sanitizeAdSlotList(list = []) {
  return (list || []).filter(isValidAdSlot);
}
