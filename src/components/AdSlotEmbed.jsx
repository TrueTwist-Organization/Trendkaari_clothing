import { useEffect, useRef, useState } from 'react';
import { fillAdsbygoogleIn } from '../utils/adsbygoogle';
import { displayGptAdsIn, isGptBootstrapScript, refreshGptAdsIn } from '../utils/googletag';
import { destroyGptSlotsForKey, prepareAdHtmlForSlot, sanitizeAdHtmlForEmbed, hasVisibleAdMarkup, scrubPlaceholderDom } from '../utils/adHtml';
import { fitAdsInContainer, observeAdFills, ensureGlobalAdFitListeners } from '../utils/fitAdsInContainer';
import { scheduleAdFit } from '../utils/scheduleAdFit';
import './AdSlotEmbed.css';

function shouldEagerLoad(eager) {
  if (eager) return true;
  if (typeof window === 'undefined') return false;
  const width =
    window.visualViewport?.width ||
    document.documentElement?.clientWidth ||
    window.innerWidth ||
    0;
  return width > 0 && width <= 767;
}

/** Inject admin HTML/scripts so &lt;script&gt; tags actually execute */
export default function AdSlotEmbed({ html, className = '', slotKey = '', eager = false }) {
  const hostRef = useRef(null);
  const wrapRef = useRef(null);
  const preparedRef = useRef('');
  const gptRefreshedRef = useRef(false);
  const loadEager = shouldEagerLoad(eager);
  const [active, setActive] = useState(loadEager);

  useEffect(() => {
    if (active || loadEager) return;
    const host = hostRef.current;
    if (!host) return;

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) {
                setActive(true);
                observer.disconnect();
              }
            },
            { rootMargin: '320px 0px', threshold: 0 }
          )
        : null;

    if (observer) {
      observer.observe(host);
      return () => observer.disconnect();
    }

    setActive(true);
    return undefined;
  }, [active, loadEager]);

  useEffect(() => {
    if (!active) return;

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
    wrapRef.current = wrap;

    const fit = () => fitAdsInContainer(host);

    ensureGlobalAdFitListeners();
    const cancelScheduledFit = scheduleAdFit(host, fit);
    const stopObserving = observeAdFills(host, fitAdsInContainer);

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

    const refreshObserver =
      !gptRefreshedRef.current && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              if (!entries.some((e) => e.isIntersecting) || !wrapRef.current || gptRefreshedRef.current) {
                return;
              }
              gptRefreshedRef.current = true;
              refreshGptAdsIn(wrapRef.current, preparedRef.current);
              fit();
              refreshObserver.disconnect();
            },
            { rootMargin: '120px', threshold: 0 }
          )
        : null;

    if (refreshObserver) refreshObserver.observe(host);

    return () => {
      refreshObserver?.disconnect();
      stopObserving();
      cancelScheduledFit();
      gptRefreshedRef.current = false;
      if (slotKey) destroyGptSlotsForKey(slotKey);
    };
  }, [html, slotKey, active]);

  if (!String(html || '').trim()) return null;

  const sanitized = sanitizeAdHtmlForEmbed(html);
  if (!sanitized) return null;

  const showVisible = hasVisibleAdMarkup(sanitized);

  return (
    <div
      ref={hostRef}
      className={`ad-slot-embed${className ? ` ${className}` : ''}${showVisible ? '' : ' ad-slot-embed--tracking-only'}${active ? ' ad-slot-embed--active' : ' ad-slot-embed--pending'}`}
      aria-hidden={showVisible ? undefined : true}
      aria-label={showVisible ? 'Advertisement' : undefined}
      hidden={!showVisible}
    />
  );
}
