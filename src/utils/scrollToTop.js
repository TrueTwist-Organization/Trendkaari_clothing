/** Always jump to the top on route change or full page load. */

export function scrollToPageTop(behavior = 'auto') {
  if (typeof window === 'undefined') return;

  try {
    window.scrollTo({ top: 0, left: 0, behavior });
  } catch {
    window.scrollTo(0, 0);
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function installScrollRestoration() {
  if (typeof window === 'undefined') return;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  scrollToPageTop('auto');
}
