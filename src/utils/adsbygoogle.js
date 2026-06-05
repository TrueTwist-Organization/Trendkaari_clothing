const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4833415403667658';

let loadPromise = null;

export function preloadAdsenseScript() {
  return loadAdsenseScript();
}

function loadAdsenseScript() {
  if (window.adsbygoogle) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const existing = document.querySelector(`script[src^="${ADSENSE_SRC.split('?')[0]}"]`);
  if (existing) {
    loadPromise = new Promise((resolve) => {
      if (window.adsbygoogle) resolve();
      else existing.addEventListener('load', resolve, { once: true });
    });
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = ADSENSE_SRC;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('AdSense script failed to load'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Run adsbygoogle.push for each <ins> in a slot after the library is ready */
export async function fillAdsbygoogleIn(root) {
  if (!root) return;
  const units = root.querySelectorAll('ins.adsbygoogle');
  if (!units.length) return;

  try {
    await loadAdsenseScript();
    window.adsbygoogle = window.adsbygoogle || [];
    units.forEach(() => {
      try {
        window.adsbygoogle.push({});
      } catch (err) {
        console.warn('[ads]', err);
      }
    });
  } catch (err) {
    console.warn('[ads] AdSense load failed:', err);
  }
}
