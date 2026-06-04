const GPT_SRC = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';

let loadPromise = null;

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

/** Call googletag.display for GPT divs injected via admin slots */
export async function displayGptAdsIn(root) {
  if (!root) return;
  const ids = [...root.querySelectorAll('[id^="div-gpt-ad-"]')].map((el) => el.id);
  if (!ids.length) return;

  try {
    await loadGptScript();
    window.googletag = window.googletag || { cmd: [] };
    ids.forEach((id) => {
      window.googletag.cmd.push(() => {
        window.googletag.display(id);
      });
    });
  } catch (err) {
    console.warn('[gpt]', err);
  }
}
