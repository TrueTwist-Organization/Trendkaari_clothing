import { useEffect, useRef } from 'react';
import './AdSlotEmbed.css';

/** Inject admin HTML/scripts so &lt;script&gt; tags actually execute */
export default function AdSlotEmbed({ html, className = '' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = '';
    const text = String(html || '').trim();
    if (!text) return;

    const wrap = document.createElement('div');
    wrap.innerHTML = text;
    host.appendChild(wrap);

    wrap.querySelectorAll('script').forEach((oldScript) => {
      const script = document.createElement('script');
      [...oldScript.attributes].forEach((attr) => {
        script.setAttribute(attr.name, attr.value);
      });
      script.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(script, oldScript);
    });
  }, [html]);

  if (!String(html || '').trim()) return null;

  return (
    <div
      ref={hostRef}
      className={`ad-slot-embed${className ? ` ${className}` : ''}`}
      aria-label="Advertisement"
    />
  );
}
