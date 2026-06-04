import bundled from '../data/ad-slots.json' with { type: 'json' };

/** Repo-shipped defaults — bundled into serverless (fs path alone is unreliable on Vercel). */
export function getDefaultAdSlots() {
  if (!Array.isArray(bundled)) return [];
  return bundled.filter((slot) => slot?.placement && String(slot.code || '').trim());
}
