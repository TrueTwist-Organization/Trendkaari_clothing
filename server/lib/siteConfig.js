import { decodeAdCode, encodeAdCode, normalizeAdPlaintext } from './adSlotCode.js';

export const DEFAULT_SITE_SETTINGS = {
  siteName: 'trendkaari',
  tagline: 'Shop For Everyone',
  seoKeywords:
    'shopping, ethnic wear, kurtas, sarees, lehengas, trendkaari, indian fashion',
  metaDescription:
    'Shop the latest Indian ethnic wear and modern luxury fashion at trendkaari. Explore designer suits, kurtas, sarees, co-ord sets, and fusion wear.',
  footerText:
    'trendkaari — curated Indian ethnic & contemporary wear for festivals, weddings, and everyday style.',
};

export function mergeSiteSettings(raw) {
  return { ...DEFAULT_SITE_SETTINGS, ...(raw || {}) };
}

export function getStoreSettings(store) {
  return mergeSiteSettings(store?.settings);
}

function normalizeSlotRecord(placement, raw) {
  if (!raw) return null;
  const plain = typeof raw === 'string' ? raw : raw.code;
  const encoded = typeof raw === 'string' ? true : raw.encoded !== false;
  const code = String(plain || '').trim();
  if (!code) return null;
  return {
    placement,
    code,
    encoded,
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export function readAdSlotsArray(store) {
  const raw = store?.adSlots;
  if (Array.isArray(raw)) {
    return raw.filter((s) => s?.placement && String(s.code || '').trim());
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw)
      .map(([placement, val]) => normalizeSlotRecord(placement, val))
      .filter(Boolean);
  }
  return [];
}

export function getActiveAdSlots(store, placement = null) {
  const list = readAdSlotsArray(store);
  const filtered = placement ? list.filter((s) => s.placement === placement) : list;
  return filtered.map((s) => ({
    placement: s.placement,
    code: decodeAdCode(s.code, s.encoded !== false),
    encoded: false,
  }));
}

export function getAdSlotsForAdmin(store) {
  return readAdSlotsArray(store).map((s) => ({
    placement: s.placement,
    code: decodeAdCode(s.code, s.encoded !== false),
    encoded: s.encoded !== false,
    updatedAt: s.updatedAt,
  }));
}

export function buildAdSlotsFromPayload(slotsPayload = {}, { wireEncoded = false } = {}) {
  const entries = Object.entries(slotsPayload);
  const next = [];
  const now = new Date().toISOString();

  entries.forEach(([placement, rawValue]) => {
    const text = normalizeAdPlaintext(rawValue, { encoded: wireEncoded });
    if (!text) return;
    next.push({
      placement,
      code: encodeAdCode(text),
      encoded: true,
      updatedAt: now,
    });
  });

  return next;
}
