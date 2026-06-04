const GPT_SRC = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';

let loadPromise = null;
let servicesEnabled = false;

function loadGptScript() {
  if (document.querySelector(`script[src="${GPT_SRC}"]`)) {
    return Promise.resolve();
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = GPT_SRC;
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

function registerAndDisplaySlot(config) {
  if (!config?.id) return;

  let slot = findSlotByElementId(config.id);

  if (!slot && config.adUnitPath && config.sizes) {
    slot = window.googletag
      .defineSlot(config.adUnitPath, config.sizes, config.id)
      ?.addService(window.googletag.pubads());
  }

  if (!servicesEnabled) {
    window.googletag.pubads().enableSingleRequest();
    window.googletag.enableServices();
    servicesEnabled = true;
  }

  window.googletag.display(config.id);

  if (servicesEnabled && slot) {
    try {
      window.googletag.pubads().refresh([slot]);
    } catch {
      /* refresh optional */
    }
  }
}

/** Register + display GPT slots injected via admin HTML (supports multiple slots per page). */
export async function displayGptAdsIn(root, preparedHtml = '') {
  if (!root) return;

  const divs = [...root.querySelectorAll('[id^="div-gpt-ad-"]')];
  if (!divs.length) return;

  const html = preparedHtml || root.innerHTML;

  try {
    await loadGptScript();
    window.googletag = window.googletag || { cmd: [] };

    divs.forEach((el) => {
      const config = parseGptSlotConfig(html, el.id);
      window.googletag.cmd.push(() => {
        registerAndDisplaySlot(config);
      });
    });
  } catch (err) {
    console.warn('[gpt]', err);
  }
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
