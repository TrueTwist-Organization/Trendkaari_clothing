/** Inject analytics / pixel scripts into <head> so tag detectors find them. */

import { sanitizeAdHtmlForEmbed } from './adHtml.js';

const injected = new Set();

const TRACKING_SRC_RE =
  /googletagmanager\.com\/gtag|google-analytics\.com|sc-static\.net\/scevent|connect\.facebook\.net|analytics\.tiktok\.com|static\.ads-twitter\.com/i;

const TRACKING_INLINE_RE =
  /\bgtag\s*\(|\bsnaptr\s*\(|\bfbq\s*\(|\bttq\s*\(|\btwq\s*\(|window\.dataLayer/i;

function scriptFingerprint(script) {
  const src = script.getAttribute('src') || '';
  const content = (script.textContent || '').trim();
  return src ? `src:${src}` : `inline:${content.slice(0, 240)}`;
}

export function isTrackingScriptElement(script) {
  if (!script || script.tagName !== 'SCRIPT') return false;
  const src = script.getAttribute('src') || '';
  const content = script.textContent || '';
  return TRACKING_SRC_RE.test(src) || TRACKING_INLINE_RE.test(content);
}

/** Remove analytics/pixel <script> tags — body slots should only render display ads. */
export function stripTrackingScriptsFromHtml(html = '') {
  const text = sanitizeAdHtmlForEmbed(html);
  if (!text) return '';

  const wrap = document.createElement('div');
  wrap.innerHTML = text;
  wrap.querySelectorAll('script').forEach((script) => {
    if (isTrackingScriptElement(script)) script.remove();
  });
  return wrap.innerHTML.trim();
}

/** Move tracking scripts from admin ad HTML into document.head (once per script). */
export function injectTrackingScriptsFromHtml(html = '', sourceKey = 'tracking') {
  if (typeof document === 'undefined') return;

  const text = sanitizeAdHtmlForEmbed(html);
  if (!text) return;

  const wrap = document.createElement('div');
  wrap.innerHTML = text;

  wrap.querySelectorAll('script').forEach((oldScript) => {
    if (!isTrackingScriptElement(oldScript)) return;

    const fingerprint = `${sourceKey}:${scriptFingerprint(oldScript)}`;
    if (injected.has(fingerprint)) return;
    injected.add(fingerprint);

    const script = document.createElement('script');
    [...oldScript.attributes].forEach((attr) => {
      script.setAttribute(attr.name, attr.value);
    });
    script.textContent = oldScript.textContent;
    document.head.appendChild(script);
  });
}
