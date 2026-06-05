const fittingHosts = new WeakSet();
const lastFitByHost = new WeakMap();

function viewportWidth() {
  return (
    window.visualViewport?.width ||
    document.documentElement?.clientWidth ||
    window.innerWidth ||
    0
  );
}

function isMobileView() {
  return viewportWidth() <= 767;
}

/** Usable width inside the ad slot — prefer parent layout over raw viewport. */
function getAvailableWidth(host) {
  if (!host) return 0;

  const viewport = viewportWidth();
  const wrap =
    host.closest('.page-ad-slot-wrap, .site-top-ad-strip, .container, .main-content') ||
    host.parentElement ||
    host;

  const wrapRect = wrap.getBoundingClientRect?.();
  if (wrapRect?.width > 0) {
    let pad = 0;
    let node = host;
    while (node && node !== wrap && node !== document.body) {
      const style = window.getComputedStyle(node);
      pad +=
        (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      node = node.parentElement;
    }
    const wrapStyle = window.getComputedStyle(wrap);
    pad +=
      (parseFloat(wrapStyle.paddingLeft) || 0) +
      (parseFloat(wrapStyle.paddingRight) || 0);
    const inner = Math.floor(wrapRect.width - pad);
    if (inner > 0) return inner;
  }

  let pad = 0;
  let node = host;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    pad +=
      (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    if (node === wrap) break;
    node = node.parentElement;
  }

  const safe = isMobileView() ? 8 : 16;
  return Math.max(0, viewport - pad - safe);
}

function measureBlock(el) {
  if (!el) return { w: 0, h: 0 };
  const rect = el.getBoundingClientRect();
  const w = Math.max(el.scrollWidth || 0, el.offsetWidth || 0, rect.width || 0);
  const h = Math.max(el.scrollHeight || 0, el.offsetHeight || 0, rect.height || 0, 50);
  return { w, h };
}

function widestInContent(content, box) {
  let maxW = 0;
  let maxH = 50;

  const measure = (el) => {
    const { w, h } = measureBlock(el);
    if (w > maxW) maxW = w;
    if (h > maxH) maxH = h;
  };

  measure(content);
  content
    .querySelectorAll('iframe, img, ins.adsbygoogle, [id^="div-gpt-ad-"]')
    .forEach((el) => {
      if (el.closest('.ad-fit-viewport, .ad-fit-shell')) return;
      measure(el);
    });

  maxW = Math.max(maxW, content.scrollWidth || 0, content.offsetWidth || 0);
  if (maxW > box + 1) return { w: maxW, h: maxH };

  return { w: maxW, h: maxH };
}

function clearViewport(host) {
  const content = host.querySelector('.ad-slot-embed__content');
  const viewport = host.querySelector(':scope > .ad-fit-viewport');
  if (viewport && content && viewport.contains(content)) {
    host.insertBefore(content, viewport);
    viewport.remove();
  }
  if (content) {
    content.style.transform = '';
    content.style.transformOrigin = '';
    content.style.width = '';
    content.style.maxWidth = '';
    content.style.margin = '';
    content.style.minHeight = '';
  }
  host.style.minHeight = '';
  host.style.maxWidth = '';
  host.style.height = '';
}

function applyViewportScale(host, content, box, contentW, contentH) {
  const scale = Math.min(1, box / contentW);
  const scaledH = Math.ceil(contentH * scale) + 4;

  const viewport = document.createElement('div');
  viewport.className = 'ad-fit-viewport';
  viewport.style.width = '100%';
  viewport.style.maxWidth = `${box}px`;
  viewport.style.height = `${scaledH}px`;
  viewport.style.minHeight = `${scaledH}px`;
  viewport.style.overflow = 'visible';
  viewport.style.margin = '0 auto';

  content.parentNode.insertBefore(viewport, content);
  viewport.appendChild(content);

  content.style.transform = `scale(${scale})`;
  content.style.transformOrigin = 'top center';
  content.style.width = `${contentW}px`;
  content.style.maxWidth = 'none';
  host.style.minHeight = `${scaledH}px`;
  host.style.height = `${scaledH}px`;
  host.style.maxWidth = `${box}px`;
}

function fitIframe(iframe, box) {
  const attrW = parseInt(iframe.getAttribute('width') || '', 10);
  const attrH = parseInt(iframe.getAttribute('height') || '', 10);
  const { w, h } = measureBlock(iframe);
  const naturalW = Math.max(attrW || 0, w, iframe.offsetWidth || 0) || box;
  const naturalH = Math.max(attrH || 0, h, iframe.offsetHeight || 0, 250);

  iframe.style.display = 'block';
  iframe.style.margin = '0 auto';
  iframe.style.minWidth = '0';
  iframe.style.border = '0';

  if (naturalW <= box + 1 || isMobileView()) {
    iframe.style.maxWidth = `${box}px`;
    iframe.style.width = isMobileView() ? '100%' : `${naturalW}px`;
    iframe.style.height = `${naturalH}px`;
    iframe.style.transform = '';
    return;
  }

  const scale = box / naturalW;
  const scaledH = Math.ceil(naturalH * scale) + 2;

  let shell = iframe.closest('.ad-fit-shell');
  if (!shell) {
    shell = document.createElement('div');
    shell.className = 'ad-fit-shell';
    iframe.parentNode.insertBefore(shell, iframe);
    shell.appendChild(iframe);
  }

  shell.style.width = '100%';
  shell.style.maxWidth = `${box}px`;
  shell.style.height = `${scaledH}px`;
  shell.style.minHeight = `${scaledH}px`;
  shell.style.overflow = 'visible';
  shell.style.margin = '0 auto';

  iframe.style.transform = `scale(${scale})`;
  iframe.style.transformOrigin = 'top center';
  iframe.style.width = `${naturalW}px`;
  iframe.style.height = `${naturalH}px`;
  iframe.style.maxWidth = 'none';
}

function tightenIframes(content, box) {
  content.querySelectorAll('iframe').forEach((iframe) => fitIframe(iframe, box));

  content.querySelectorAll('[id^="div-gpt-ad-"]').forEach((slot) => {
    slot.style.maxWidth = `${box}px`;
    slot.style.width = '100%';
    slot.style.minWidth = '0';
    slot.style.margin = '0 auto';
    slot.style.overflow = 'visible';
    slot.style.minHeight = isMobileView() ? '250px' : '90px';
    slot.style.display = 'block';
  });

  content.querySelectorAll('img').forEach((img) => {
    img.style.maxWidth = `${box}px`;
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    img.style.objectFit = 'contain';
  });

  content.querySelectorAll('ins.adsbygoogle').forEach((ins) => {
    ins.style.display = 'block';
    ins.style.maxWidth = `${box}px`;
    ins.style.width = `${box}px`;
    ins.style.minWidth = '0';
    ins.style.margin = '0 auto';
    ins.style.overflow = 'visible';
    ins.style.minHeight = isMobileView() ? '250px' : '90px';
  });
}

function stillOverflows(host, box) {
  const viewport = viewportWidth();
  const rect = host.getBoundingClientRect();
  if (rect.right > viewport + 4) return true;
  if (host.scrollWidth > box + 4) return true;
  const content = host.querySelector('.ad-slot-embed__content');
  if (content && content.scrollWidth > box + 4) return true;
  return false;
}

function syncHostHeight(host) {
  const content = host.querySelector('.ad-slot-embed__content');
  if (!content) return;

  const viewport = host.querySelector(':scope > .ad-fit-viewport');
  const shellHeights = [...content.querySelectorAll('.ad-fit-shell')].map(
    (shell) => shell.offsetHeight || shell.getBoundingClientRect().height || 0
  );
  const slotHeights = [...content.querySelectorAll('[id^="div-gpt-ad-"]')].map(
    (slot) => slot.offsetHeight || slot.getBoundingClientRect().height || 0
  );
  const iframeHeights = [...content.querySelectorAll('iframe')].map((iframe) => {
    const shell = iframe.closest('.ad-fit-shell');
    if (shell) return shell.offsetHeight || 0;
    return iframe.offsetHeight || iframe.getBoundingClientRect().height || 0;
  });

  const measured = Math.max(
    viewport?.offsetHeight || 0,
    content.scrollHeight || 0,
    content.offsetHeight || 0,
    ...shellHeights,
    ...slotHeights,
    ...iframeHeights,
    isMobileView() ? 250 : 90
  );

  const nextHeight = Math.ceil(measured);
  host.style.minHeight = `${nextHeight}px`;
  if (isMobileView()) {
    host.style.height = '';
  } else if (viewport) {
    viewport.style.minHeight = `${nextHeight}px`;
    viewport.style.height = `${nextHeight}px`;
  }
}

function fitCacheKey(host, box) {
  const content = host.querySelector('.ad-slot-embed__content');
  const contentW = content?.scrollWidth || 0;
  const iframeCount = content?.querySelectorAll('iframe').length || 0;
  const gptCount = content?.querySelectorAll('[id^="div-gpt-ad-"]').length || 0;
  return `${box}|${contentW}|${iframeCount}|${gptCount}`;
}

/** Scale ad blocks to fit width — full ad stays visible (no clipping). */
export function fitAdsInContainer(host) {
  if (!host || typeof window === 'undefined') return;
  if (host.classList.contains('ad-slot-embed--tracking-only')) return;
  if (fittingHosts.has(host)) return;

  const box = getAvailableWidth(host);
  if (!box) return;

  const content = host.querySelector('.ad-slot-embed__content');
  if (!content) return;

  const cacheKey = fitCacheKey(host, box);
  if (lastFitByHost.get(host) === cacheKey) return;

  fittingHosts.add(host);
  try {
    fitAdsInContainerInner(host, box, content, cacheKey);
  } finally {
    fittingHosts.delete(host);
  }
}

function fitAdsInContainerInner(host, box, content, cacheKey) {
  clearViewport(host);

  content.querySelectorAll('.ad-fit-shell').forEach((shell) => {
    const inner = shell.firstElementChild;
    if (inner) {
      inner.style.transform = '';
      inner.style.width = '';
      inner.style.height = '';
      shell.replaceWith(inner);
    }
  });

  host.style.width = '100%';
  host.style.maxWidth = `${box}px`;
  host.style.overflow = 'visible';
  host.style.boxSizing = 'border-box';

  content.style.maxWidth = `${box}px`;
  content.style.width = '100%';
  content.style.boxSizing = 'border-box';
  content.style.overflow = 'visible';

  tightenIframes(content, box);

  let { w: contentW, h: contentH } = widestInContent(content, box);

  const needsScale = contentW > box + 1 || stillOverflows(host, box);
  if (needsScale && !isMobileView()) {
    contentW = Math.max(contentW, content.scrollWidth, host.scrollWidth, box + 1);
    contentH = Math.max(contentH, content.scrollHeight, 250);
    applyViewportScale(host, content, box, contentW, contentH);
  }

  content.style.margin = '0 auto';
  syncHostHeight(host);
  lastFitByHost.set(host, cacheKey);
}

/** Re-fit every ad slot on the page (orientation / late GPT fill). */
export function fitAllAdsInDocument() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.ad-slot-embed:not(.ad-slot-embed--tracking-only)').forEach((host) => {
    fitAdsInContainer(host);
  });
}

let globalFitRaf = 0;

export function fitAllAdsInDocumentDebounced() {
  if (typeof window === 'undefined') return;
  cancelAnimationFrame(globalFitRaf);
  globalFitRaf = requestAnimationFrame(() => {
    globalFitRaf = 0;
    fitAllAdsInDocument();
  });
}

export function observeAdFills(host, onFit) {
  if (!host || typeof MutationObserver === 'undefined') return () => {};

  let timer = null;
  const schedule = () => {
    if (fittingHosts.has(host)) return;
    clearTimeout(timer);
    timer = window.setTimeout(() => onFit(host), isMobileView() ? 500 : 250);
  };

  const observer = new MutationObserver(schedule);
  observer.observe(host, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['width', 'height', 'class'],
  });

  return () => {
    clearTimeout(timer);
    observer.disconnect();
  };
}

let globalFitListener = false;

export function ensureGlobalAdFitListeners() {
  if (globalFitListener || typeof window === 'undefined') return;
  globalFitListener = true;

  const run = () => fitAllAdsInDocumentDebounced();
  window.addEventListener('resize', run, { passive: true });
  window.addEventListener('orientationchange', run, { passive: true });
  window.visualViewport?.addEventListener('resize', run, { passive: true });
}
