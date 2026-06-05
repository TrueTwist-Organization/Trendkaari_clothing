import AdSlotEmbed from './AdSlotEmbed';
import { claimAdSource } from '../utils/adDedupe';
import { hasVisibleAdMarkup, sanitizeAdHtmlForEmbed } from '../utils/adHtml';
import { stripTrackingScriptsFromHtml } from '../utils/injectTrackingScripts';
import './SiteTopAdStrip.css';

/** Header strip — only the ad code saved for the given slot key. */
export default function SiteTopAdStrip({ code, slotKey }) {
  const trimmed = stripTrackingScriptsFromHtml(String(code || '').trim());
  if (!trimmed || !slotKey) return null;
  if (!claimAdSource(slotKey, slotKey, trimmed)) return null;

  const sanitized = sanitizeAdHtmlForEmbed(trimmed);
  const visible = hasVisibleAdMarkup(sanitized);

  if (!visible) {
    return (
      <AdSlotEmbed html={trimmed} slotKey={slotKey} className="ad-slot-embed--tracking-only" eager />
    );
  }

  return (
    <div className="site-top-ad-strip" data-has-ads="true">
      <AdSlotEmbed html={trimmed} slotKey={slotKey} className="ad-slot-embed--global" eager />
    </div>
  );
}
