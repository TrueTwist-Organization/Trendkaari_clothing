import AdSlotEmbed from './AdSlotEmbed';
import { claimAdSource } from '../utils/adDedupe';
import { hasVisibleAdMarkup, sanitizeAdHtmlForEmbed } from '../utils/adHtml';
import './SiteTopAdStrip.css';

/** One ad below header — homepage uses home_below_header when set, else site common. */
export default function SiteTopAdStrip({
  globalCode,
  globalSlotKey = 'site_common_ad',
  homeBelowHeaderCode,
  showHomeSlot = false,
}) {
  const homeCode = String(homeBelowHeaderCode || '').trim();
  const commonCode = String(globalCode || '').trim();

  const useHome = showHomeSlot && homeCode;
  const code = useHome ? homeCode : commonCode;
  const slotKey = useHome ? 'home_below_header' : globalSlotKey;
  const sourceKey = useHome ? 'home_below_header' : globalSlotKey;

  if (!code) return null;
  if (!claimAdSource(sourceKey, slotKey)) return null;

  const sanitized = sanitizeAdHtmlForEmbed(code);
  const visible = hasVisibleAdMarkup(sanitized);

  if (!visible) {
    return <AdSlotEmbed html={code} slotKey={slotKey} className="ad-slot-embed--tracking-only" />;
  }

  return (
    <div className="site-top-ad-strip" data-has-ads="true">
      <AdSlotEmbed html={code} slotKey={slotKey} className="ad-slot-embed--global" />
    </div>
  );
}
