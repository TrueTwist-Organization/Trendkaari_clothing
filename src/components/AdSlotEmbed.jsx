import { useEffect, useRef } from 'react';
import { fillAdsbygoogleIn } from '../utils/adsbygoogle';
import { displayGptAdsIn, isGptBootstrapScript, refreshGptAdsIn } from '../utils/googletag';
import { destroyGptSlotsForKey, prepareAdHtmlForSlot } from '../utils/adHtml';
import { fitAdsInContainer, observeAdFills } from '../utils/fitAdsInContainer';
import './AdSlotEmbed.css';

/** Inject admin HTML/scripts so &lt;script&gt; tags actually execute */
export default function AdSlotEmbed({ html, className = '', slotKey = '' }) {
  const hostRef = useRef(null);
  const wrapRef = useRef(null);
  const preparedRef = useRef('');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = '';
    const text = String(html || '').trim();
    if (!text) return;

    const prepared = slotKey ? prepareAdHtmlForSlot(text, slotKey) : text;
    preparedRef.current = prepared;
    const wrap = document.createElement('div');
    wrap.className = 'ad-slot-embed__content';
    wrap.innerHTML = prepared;
    host.appendChild(wrap);
    wrapRef.current = wrap;

    const fit = () => fitAdsInContainer(host);

    fit();
    const stopObserving = observeAdFills(host, fitAdsInContainer);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    resizeObserver?.observe(host);
    window.addEventListener('resize', fit);
    window.visualViewport?.addEventListener('resize', fit);
    const fitT1 = window.setTimeout(fit, 400);
    const fitT2 = window.setTimeout(fit, 1200);
    const fitT3 = window.setTimeout(fit, 2500);
    const fitT4 = window.setTimeout(fit, 4500);
    const fitT5 = window.setTimeout(fit, 7000);
    const fitT6 = window.setTimeout(fit, 10000);

    if (typeof document !== 'undefined') {
      document.fonts?.ready?.then(fit).catch(() => {});
    }

    wrap.querySelectorAll('script').forEach((oldScript) => {
      const src = oldScript.getAttribute('src') || '';
      if (src.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) {
        oldScript.remove();
        return;
      }
      if (isGptBootstrapScript(oldScript)) {
        oldScript.remove();
        return;
      }
      const script = document.createElement('script');
      [...oldScript.attributes].forEach((attr) => {
        script.setAttribute(attr.name, attr.value);
      });
      script.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(script, oldScript);
    });

    void fillAdsbygoogleIn(wrap).then(fit);
    void displayGptAdsIn(wrap, prepared).then(fit);

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              if (entries.some((e) => e.isIntersecting) && wrapRef.current) {
                refreshGptAdsIn(wrapRef.current, preparedRef.current);
                fit();
              }
            },
            { rootMargin: '80px', threshold: 0.01 }
          )
        : null;

    if (observer) observer.observe(host);

    return () => {
      observer?.disconnect();
      stopObserving();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', fit);
      window.visualViewport?.removeEventListener('resize', fit);
      window.clearTimeout(fitT1);
      window.clearTimeout(fitT2);
      window.clearTimeout(fitT3);
      window.clearTimeout(fitT4);
      window.clearTimeout(fitT5);
      window.clearTimeout(fitT6);
      if (slotKey) destroyGptSlotsForKey(slotKey);
    };
  }, [html, slotKey]);

  if (!String(html || '').trim()) return null;

  return (
    <div
      ref={hostRef}
      className={`ad-slot-embed${className ? ` ${className}` : ''}`}
      aria-label="Advertisement"
    />
  );
}
