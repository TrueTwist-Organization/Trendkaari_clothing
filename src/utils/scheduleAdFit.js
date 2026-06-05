/** Debounced ad fit — avoids layout thrash from many slots/timers. */

export function scheduleAdFit(host, fitFn) {
  if (!host || typeof fitFn !== 'function') return () => {};

  let raf = 0;
  const timers = [];

  const run = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => fitFn(host));
  };

  run();
  timers.push(window.setTimeout(run, 150));
  timers.push(window.setTimeout(run, 600));
  timers.push(window.setTimeout(run, 1500));

  return () => {
    cancelAnimationFrame(raf);
    timers.forEach((id) => window.clearTimeout(id));
  };
}

export function runWhenIdle(callback, timeout = 2000) {
  if (typeof window === 'undefined') return;
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(callback, { timeout });
    return;
  }
  window.setTimeout(callback, 1);
}
