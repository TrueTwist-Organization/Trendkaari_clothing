import { preloadAdsenseScript } from './adsbygoogle.js';
import { preloadGptScript } from './googletag.js';

const GPT_MARKERS = /googletag|div-gpt-ad|securepubads\.g\.doubleclick\.net/i;
const ADSENSE_MARKERS = /adsbygoogle|pagead2\.googlesyndication\.com/i;

export function adCodesNeedGpt(codes = {}) {
  return Object.values(codes).some((code) => GPT_MARKERS.test(String(code || '')));
}

export function adCodesNeedAdsense(codes = {}) {
  return Object.values(codes).some((code) => ADSENSE_MARKERS.test(String(code || '')));
}

/** Start downloading ad libraries as early as possible. */
export function preloadAdLibraries(codes = {}) {
  const tasks = [];
  if (adCodesNeedGpt(codes)) tasks.push(preloadGptScript());
  if (adCodesNeedAdsense(codes)) tasks.push(preloadAdsenseScript());
  if (!tasks.length) {
    tasks.push(preloadGptScript(), preloadAdsenseScript());
  }
  return Promise.allSettled(tasks);
}
