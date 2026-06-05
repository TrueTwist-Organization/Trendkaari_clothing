import { useEffect, useRef } from 'react';
import { fillAdsbygoogleIn } from '../utils/adsbygoogle';
import { displayGptAdsIn, isGptBootstrapScript } from '../utils/googletag';
import { destroyGptSlotsForKey, prepareAdHtmlForSlot, sanitizeAdHtmlForEmbed, hasVisibleAdMarkup, scrubPlaceholderDom } from '../utils/adHtml';
import { fitAdsInContainer, observeAdFills, ensureGlobalAdFitListeners } from '../utils/fitAdsInContainer';
import { scheduleAdFit } from '../utils/scheduleAdFit';
import './AdSlotEmbed.css';

/** Inject admin HTML/scripts so &lt;script&gt; tags actually execute */
export default function AdSlotEmbed({ html, className = '', slotKey = '', eager = true }) {
  const hostRef = useRef(null);
  const preparedRef = useRef('');

  useEffect(() => {
    if (!eager) return;

    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = '';
    const text = sanitizeAdHtmlForEmbed(String(html || '').trim());
    if (!text) return;

    const prepared = slotKey ? prepareAdHtmlForSlot(text, slotKey) : text;
    preparedRef.current = prepared;
    const wrap = document.createElement('div');
    wrap.className = 'ad-slot-embed__content';
    wrap.innerHTML = prepared;
    scrubPlaceholderDom(wrap);
    host.appendChild(wrap);

    const fit = () => fitAdsInContainer(host);

    ensureGlobalAdFitListeners();
    const cancelScheduledFit = scheduleAdFit(host, fit);
    const stopObserving = observeAdFills(host, fitAdsInContainer);

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

    return () => {
      stopObserving();
      cancelScheduledFit();
      if (slotKey) destroyGptSlotsForKey(slotKey);
    };
  }, [html, slotKey, eager]);

  if (!String(html || '').trim()) return null;

  const sanitized = sanitizeAdHtmlForEmbed(html);
  if (!sanitized) return null;

  const showVisible = hasVisibleAdMarkup(sanitized);

  return (
    <div
      ref={hostRef}
      className={`ad-slot-embed${className ? ` ${className}` : ''}${showVisible ? '' : ' ad-slot-embed--tracking-only'} ad-slot-embed--active`}
      aria-hidden={showVisible ? undefined : true}
      aria-label={showVisible ? 'Advertisement' : undefined}
      hidden={!showVisible}
    />
  );
}
