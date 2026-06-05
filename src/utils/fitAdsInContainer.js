function getAvailableWidth(el) {
  if (!el) return 0;
  const style = window.getComputedStyle(el);
  const pad =
    (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
  const width = el.clientWidth || el.getBoundingClientRect().width || 0;
  const viewport = document.documentElement?.clientWidth || window.innerWidth || width;
  return Math.max(0, Math.min(width - pad, viewport));
}

function measureBlock(el) {
  if (!el) return { w: 0, h: 0 };
  const rect = el.getBoundingClientRect();
  const w = Math.max(el.scrollWidth || 0, el.offsetWidth || 0, rect.width || 0);
  const h = Math.max(el.scrollHeight || 0, el.offsetHeight || 0, rect.height || 0, 50);
  return { w, h };
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
}

function tightenIframes(content, box) {
  content.querySelectorAll('iframe').forEach((iframe) => {
    const attrW = parseInt(iframe.getAttribute('width') || '', 10);
    const { w } = measureBlock(iframe);
    const natural = Math.max(attrW || 0, w);
    if (!natural || natural <= box + 1) {
      iframe.style.maxWidth = `${box}px`;
      iframe.style.width = `${Math.min(natural || box, box)}px`;
      iframe.style.margin = '0 auto';
      iframe.style.display = 'block';
      return;
    }

    const scale = box / natural;
    const shell = iframe.closest('.ad-fit-shell') || document.createElement('div');
    if (!iframe.closest('.ad-fit-shell')) {
      shell.className = 'ad-fit-shell';
      iframe.parentNode.insertBefore(shell, iframe);
      shell.appendChild(iframe);
    }
    shell.style.width = '100%';
    shell.style.maxWidth = `${box}px`;
    shell.style.height = `${Math.ceil((iframe.offsetHeight || 250) * scale)}px`;
    shell.style.overflow = 'hidden';
    shell.style.margin = '0 auto';
    iframe.style.transform = `scale(${scale})`;
    iframe.style.transformOrigin = 'top left';
    iframe.style.width = `${natural}px`;
    iframe.style.maxWidth = 'none';
    iframe.style.display = 'block';
  });
}

/** Scale ad blocks to fit mobile/laptop width — nothing clipped by overflow-x. */
export function fitAdsInContainer(host) {
  if (!host || typeof window === 'undefined') return;

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

  content.style.maxWidth = '100%';
  content.style.width = '100%';

  const { w: contentW, h: contentH } = measureBlock(content);

  if (contentW > box + 1) {
    applyViewportScale(host, content, box, contentW, contentH);
    return;
  }

  tightenIframes(content, box);
  content.style.maxWidth = '100%';
  content.style.width = '100%';
  content.style.margin = '0 auto';
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
