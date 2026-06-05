function collectAdElements(host) {
  const elements = [];
  const seen = new Set();

  host.querySelectorAll('[id^="div-gpt-ad-"]').forEach((el) => {
    if (!seen.has(el)) {
      seen.add(el);
      elements.push(el);
    }
  });

  host.querySelectorAll('ins.adsbygoogle').forEach((el) => {
    if (el.closest('[id^="div-gpt-ad-"]') || seen.has(el)) return;
    seen.add(el);
    elements.push(el);
  });

  host.querySelectorAll('iframe').forEach((el) => {
    if (el.closest('[id^="div-gpt-ad-"]') || el.closest('ins.adsbygoogle') || seen.has(el)) return;
    seen.add(el);
    elements.push(el);
  });

  return elements;
}

function measureWidth(el) {
  const rect = el.getBoundingClientRect().width;
  const offset = el.offsetWidth;
  return Math.max(rect, offset, 0);
}

function measureHeight(el) {
  const rect = el.getBoundingClientRect().height;
  const offset = el.offsetHeight;
  return Math.max(rect, offset, 90);
}

function unwrapShell(el) {
  const shell = el.closest('.ad-fit-shell');
  if (!shell?.contains(el)) return;
  shell.parentNode?.insertBefore(el, shell);
  shell.remove();
}

function resetInline(el) {
  el.style.transform = '';
  el.style.transformOrigin = '';
  el.style.width = '';
  el.style.maxWidth = '';
  el.style.margin = '';
  el.style.marginBottom = '';
}

/** Scale wide GPT / AdSense units down so nothing is clipped on mobile or laptop. */
export function fitAdsInContainer(host) {
  if (!host || typeof window === 'undefined') return;

  const box = host.clientWidth || host.getBoundingClientRect().width;
  if (!box) return;

  collectAdElements(host).forEach((el) => {
    resetInline(el);
    unwrapShell(el);

    const w = measureWidth(el);
    if (!w) return;

    const h = measureHeight(el);

    if (w <= box + 1) {
      el.style.display = 'block';
      el.style.maxWidth = `${box}px`;
      el.style.width = `${Math.min(w, box)}px`;
      el.style.marginLeft = 'auto';
      el.style.marginRight = 'auto';
      el.style.boxSizing = 'border-box';
      return;
    }

    const scale = box / w;
    const shell = document.createElement('div');
    shell.className = 'ad-fit-shell';
    shell.style.width = '100%';
    shell.style.maxWidth = `${box}px`;
    shell.style.margin = '0 auto';
    shell.style.height = `${h * scale}px`;
    shell.style.overflow = 'hidden';

    el.parentNode?.insertBefore(shell, el);
    shell.appendChild(el);

    el.style.transform = `scale(${scale})`;
    el.style.transformOrigin = 'top left';
    el.style.width = `${w}px`;
    el.style.maxWidth = 'none';
    el.style.display = 'block';
  });
}

export function observeAdFills(host, onFit) {
  if (!host || typeof MutationObserver === 'undefined') return () => {};

  let timer = null;
  const schedule = () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => onFit(host), 80);
  };

  const observer = new MutationObserver(schedule);
  observer.observe(host, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'width', 'height'],
  });

  return () => {
    clearTimeout(timer);
    observer.disconnect();
  };
}
