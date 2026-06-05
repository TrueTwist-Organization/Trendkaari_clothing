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

/** Host expands to ad width — cap to viewport minus slot padding. */
function getAvailableWidth(host) {
  if (!host) return 0;

  const viewport = viewportWidth();
  const wrap =
    host.closest('.page-ad-slot-wrap, .site-top-ad-strip, .drawer-content') ||
    host.parentElement ||
    host;

  let pad = 0;
  let node = host;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    pad +=
      (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    if (node === wrap) break;
    node = node.parentElement;
  }

  const safe = isMobileView() ? 4 : 0;
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
  const viewport = viewportWidth();

  const measure = (el) => {
    const { w, h } = measureBlock(el);
    if (w > maxW) maxW = w;
    if (h > maxH) maxH = h;
    if (isMobileView()) {
      const rect = el.getBoundingClientRect();
      if (rect.right > viewport + 1) {
        maxW = Math.max(maxW, w, rect.width, el.offsetWidth);
      }
    }
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
  }
  host.style.minHeight = '';
  host.style.maxWidth = '';
}

function applyViewportScale(host, content, box, contentW, contentH) {
  const scale = box / contentW;
  const viewport = document.createElement('div');
  viewport.className = 'ad-fit-viewport';
  viewport.style.width = '100%';
  viewport.style.maxWidth = `${box}px`;
  viewport.style.height = `${Math.ceil(contentH * scale)}px`;
  viewport.style.overflow = 'hidden';
  viewport.style.margin = '0 auto';

  content.parentNode.insertBefore(viewport, content);
  viewport.appendChild(content);

  content.style.transform = `scale(${scale})`;
  content.style.transformOrigin = 'top left';
  content.style.width = `${contentW}px`;
  content.style.maxWidth = 'none';
  host.style.minHeight = `${Math.ceil(contentH * scale)}px`;
  host.style.maxWidth = `${box}px`;
}

function tightenIframes(content, box) {
  content.querySelectorAll('iframe').forEach((iframe) => {
    const attrW = parseInt(iframe.getAttribute('width') || '', 10);
    const { w, h } = measureBlock(iframe);
    const natural = Math.max(attrW || 0, w, isMobileView() ? box : 0);
    const target = Math.min(natural || box, box);

    if (!natural || natural <= box + 1) {
      iframe.style.maxWidth = `${box}px`;
      iframe.style.width = `${target}px`;
      iframe.style.minWidth = '0';
      iframe.style.height = 'auto';
      iframe.style.margin = '0 auto';
      iframe.style.display = 'block';
      return;
    }

    const scale = box / natural;
    let shell = iframe.closest('.ad-fit-shell');
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'ad-fit-shell';
      iframe.parentNode.insertBefore(shell, iframe);
      shell.appendChild(iframe);
    }
    shell.style.width = '100%';
    shell.style.maxWidth = `${box}px`;
    shell.style.height = `${Math.ceil((h || iframe.offsetHeight || 250) * scale)}px`;
    shell.style.overflow = 'hidden';
    shell.style.margin = '0 auto';
    iframe.style.transform = `scale(${scale})`;
    iframe.style.transformOrigin = 'top left';
    iframe.style.width = `${natural}px`;
    iframe.style.maxWidth = 'none';
    iframe.style.minWidth = '0';
    iframe.style.display = 'block';
  });

  content.querySelectorAll('[id^="div-gpt-ad-"]').forEach((slot) => {
    slot.style.maxWidth = `${box}px`;
    slot.style.width = '100%';
    slot.style.minWidth = '0';
    slot.style.margin = '0 auto';
    slot.style.overflow = 'hidden';
  });

  content.querySelectorAll('img').forEach((img) => {
    img.style.maxWidth = `${box}px`;
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.margin = '0 auto';
  });

  content.querySelectorAll('ins.adsbygoogle').forEach((ins) => {
    ins.style.display = 'block';
    ins.style.maxWidth = `${box}px`;
    ins.style.width = `${box}px`;
    ins.style.minWidth = '0';
    ins.style.margin = '0 auto';
    ins.style.overflow = 'hidden';
  });
}

function stillOverflows(host, box) {
  const viewport = viewportWidth();
  const rect = host.getBoundingClientRect();
  if (rect.right > viewport + 2) return true;
  if (host.scrollWidth > box + 2) return true;
  const content = host.querySelector('.ad-slot-embed__content');
  if (content && content.scrollWidth > box + 2) return true;
  return false;
}

/** Scale ad blocks to fit mobile/laptop width — nothing clipped. */
export function fitAdsInContainer(host) {
  if (!host || typeof window === 'undefined') return;
  if (host.classList.contains('ad-slot-embed--tracking-only')) return;

  const box = getAvailableWidth(host);
  if (!box) return;

  const content = host.querySelector('.ad-slot-embed__content');
  if (!content) return;

  clearViewport(host);

  content.querySelectorAll('.ad-fit-shell').forEach((shell) => {
    const inner = shell.firstElementChild;
    if (inner) {
      inner.style.transform = '';
      inner.style.width = '';
      shell.replaceWith(inner);
    }
  });

  host.style.width = '100%';
  host.style.maxWidth = `${box}px`;
  host.style.overflow = 'hidden';
  host.style.boxSizing = 'border-box';

  content.style.maxWidth = `${box}px`;
  content.style.width = '100%';
  content.style.boxSizing = 'border-box';
  content.style.overflow = 'hidden';

  tightenIframes(content, box);

  let { w: contentW, h: contentH } = widestInContent(content, box);

  if (contentW > box + 1 || (isMobileView() && stillOverflows(host, box))) {
    contentW = Math.max(contentW, content.scrollWidth, host.scrollWidth, box + 1);
    applyViewportScale(host, content, box, contentW, contentH);
  }

  content.style.margin = '0 auto';
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
    clearTimeout(timer);
    timer = window.setTimeout(() => onFit(host), 60);
  };

  const observer = new MutationObserver(schedule);
  observer.observe(host, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'width', 'height', 'class'],
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
