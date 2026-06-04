import { useEffect, useRef } from 'react';
import { fillAdsbygoogleIn } from '../utils/adsbygoogle';
import { displayGptAdsIn, isGptBootstrapScript, refreshGptAdsIn } from '../utils/googletag';
import { destroyGptSlotsForKey, prepareAdHtmlForSlot } from '../utils/adHtml';
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
    wrap.innerHTML = prepared;
    host.appendChild(wrap);
    wrapRef.current = wrap;

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

    void fillAdsbygoogleIn(wrap);
    void displayGptAdsIn(wrap, prepared);

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              if (entries.some((e) => e.isIntersecting) && wrapRef.current) {
                refreshGptAdsIn(wrapRef.current, preparedRef.current);
              }
            },
            { rootMargin: '80px', threshold: 0.01 }
          )
        : null;

    if (observer) observer.observe(host);

    return () => {
      observer?.disconnect();
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
