export const AD_SLOTS_VERSION_KEY = 'trendkaari_ad_slots_version';

export function bumpAdSlotsVersion() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AD_SLOTS_VERSION_KEY, String(Date.now()));
  } catch {
    /* ignore quota errors */
  }
}
