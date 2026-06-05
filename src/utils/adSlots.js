import { AD_PLACEMENT_DEFINITIONS } from '../constants/adPlacements';
import { sanitizeAdHtmlForEmbed } from './adHtml.js';

export { AD_PLACEMENT_DEFINITIONS };

export function decodeAdCodeClient(stored = '', encoded = true) {
  const raw = String(stored || '').trim();
  if (!raw) return '';
  if (!encoded) return raw;
  try {
    let text = decodeURIComponent(
      Array.prototype.map
        .call(atob(raw), (c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    for (let i = 0; i < 2 && !/<(script|div|ins|iframe)/i.test(text); i += 1) {
      try {
        const next = decodeURIComponent(
          Array.prototype.map
            .call(atob(text), (c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
            .join('')
        );
        if (!next || next === text) break;
        text = next;
      } catch {
        break;
      }
    }
    return text;
  } catch {
    return raw;
  }
}

/** Map placement key → decoded HTML for storefront */
export function adSlotsToCodeMap(slots = []) {
  const map = {};
  (slots || []).forEach((slot) => {
    if (!slot?.placement) return;
    const code = sanitizeAdHtmlForEmbed(decodeAdCodeClient(slot.code, slot.encoded !== false));
    if (code.trim()) map[slot.placement] = code;
  });
  return map;
}

/** Merge saved slots with all placement definitions for admin form */
export function mergeAdSlotsForAdmin(saved = []) {
  const byKey = {};
  (saved || []).forEach((s) => {
    if (s?.placement) byKey[s.placement] = s;
  });

  return AD_PLACEMENT_DEFINITIONS.map((def) => {
    const row = byKey[def.key];
    const code = row ? decodeAdCodeClient(row.code, row.encoded !== false) : '';
    return {
      placement: def.key,
      title: def.title,
      description: def.description,
      placeholder: def.placeholder,
      code,
      updatedAt: row?.updatedAt || null,
    };
  });
}
