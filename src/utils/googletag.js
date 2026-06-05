const GPT_SRC = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';

let loadPromise = null;
let servicesEnabled = false;
let flushTimer = null;

/** elementId → slot config */
const slotRegistry = new Map();
const displayedIds = new Set();

export function preloadGptScript() {
  return loadGptScript();
}

function loadGptScript() {
  if (document.querySelector(`script[src="${GPT_SRC}"]`)) {
    return Promise.resolve();
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = GPT_SRC;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('GPT script failed to load'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Parse GPT defineSlot(adUnit, sizes, divId) from injected admin HTML. */
export function parseGptSlotConfig(html = '', divId = '') {
  const text = String(html || '');
  const id =
    divId ||
    text.match(/id=['"](div-gpt-ad-[^'"]+)['"]/)?.[1] ||
    text.match(/display\s*\(\s*['"](div-gpt-ad-[^'"]+)['"]\s*\)/)?.[1] ||
    '';
  if (!id) return null;

  const defineMatch = text.match(
    /defineSlot\s*\(\s*['"]([^'"]+)['"]\s*,\s*(\[[\s\S]*?\])\s*,\s*['"][^'"]+['"]\s*\)/
  );
  if (!defineMatch) return { id, adUnitPath: null, sizes: null };

  let sizes = null;
  try {
    sizes = new Function(`return ${defineMatch[2]}`)();
  } catch {
    sizes = null;
  }

  return {
    id,
    adUnitPath: defineMatch[1],
    sizes,
  };
}

function findSlotByElementId(id) {
  const slots = window.googletag?.pubads?.()?.getSlots?.() || [];
  return slots.find((slot) => slot.getSlotElementId?.() === id);
}

function scheduleGptFlush() {
  clearTimeout(flushTimer);
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flushGptSlots();
  }, 40);
}

function flushGptSlotsInCmd() {
  const configs = [...slotRegistry.values()].filter((c) => document.getElementById(c.id));
  if (!configs.length) return;

  configs.forEach((config) => {
    if (!config?.id || findSlotByElementId(config.id)) return;
    if (config.adUnitPath && config.sizes) {
      window.googletag
        .defineSlot(config.adUnitPath, config.sizes, config.id)
        ?.addService(window.googletag.pubads());
    }
  });

  if (!servicesEnabled) {
    window.googletag.pubads().enableSingleRequest();
    window.googletag.enableServices();
    servicesEnabled = true;
  }

  configs.forEach((config) => {
    const el = document.getElementById(config.id);
    if (!el) return;

    try {
      const existing = findSlotByElementId(config.id);
      if (existing) {
        if (!displayedIds.has(config.id)) {
          window.googletag.display(config.id);
          displayedIds.add(config.id);
        }
        return;
      }
      window.googletag.display(config.id);
      displayedIds.add(config.id);
    } catch (err) {
      console.warn('[gpt] display failed', config.id, err);
    }
  });

  const needsRetry = [...slotRegistry.values()].some(
    (c) => document.getElementById(c.id) && !displayedIds.has(c.id)
  );
  if (needsRetry) scheduleGptFlush();
}

async function flushGptSlots() {
  if (slotRegistry.size === 0) return;

  try {
    await loadGptScript();
    window.googletag = window.googletag || { cmd: [] };
    window.googletag.cmd.push(() => {
      flushGptSlotsInCmd();
    });
  } catch (err) {
    console.warn('[gpt]', err);
  }
}

/** Register + display GPT slots injected via admin HTML. */
export async function displayGptAdsIn(root, preparedHtml = '') {
  if (!root) return;

  const divs = [...root.querySelectorAll('[id^="div-gpt-ad-"]')];
  if (!divs.length) return;

  const html = preparedHtml || root.innerHTML;

  divs.forEach((el) => {
    const config = parseGptSlotConfig(html, el.id);
    if (config?.id) slotRegistry.set(config.id, config);
  });

  scheduleGptFlush();
}

/** Re-display / refresh every GPT slot currently in the DOM (checkout drawer, late mounts). */
export function refreshAllGptSlots() {
  if (typeof window === 'undefined' || slotRegistry.size === 0) return;
  scheduleGptFlush();
}

/** Re-request display when slot scrolls into view (sidebar, checkout, below fold). */
export function refreshGptAdsIn(root, preparedHtml = '') {
  if (!root) return;
  displayGptAdsIn(root, preparedHtml);
}

/** Remove slots tied to a placement key (SPA unmount). */
export function destroyGptSlotsBySuffix(suffix) {
  if (!suffix || typeof window === 'undefined') return;

  const toRemove = [];
  for (const [id] of slotRegistry) {
    if (id.includes(`__${suffix}`)) {
      slotRegistry.delete(id);
      displayedIds.delete(id);
      toRemove.push(id);
    }
  }

  if (!toRemove.length || !window.googletag?.pubads) return;

  window.googletag.cmd.push(() => {
    const slots = window.googletag.pubads().getSlots?.() || [];
    const destroy = slots.filter((slot) => toRemove.includes(slot.getSlotElementId?.() || ''));
    if (destroy.length) window.googletag.destroySlots(destroy);
  });
}

export function isGptBootstrapScript(scriptEl) {
  const src = scriptEl.getAttribute('src') || '';
  const body = scriptEl.textContent || '';
  if (src.includes('securepubads.g.doubleclick.net/tag/js/gpt.js')) return true;
  if (body.includes('googletag') && (body.includes('defineSlot') || body.includes('enableServices'))) {
    return true;
  }
  if (body.includes('googletag.display')) return true;
  return false;
}
