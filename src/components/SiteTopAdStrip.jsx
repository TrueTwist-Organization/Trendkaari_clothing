import AdSlotEmbed from './AdSlotEmbed';
import { claimAdSource } from '../utils/adDedupe';
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

  return (
    <div className="site-top-ad-strip" data-has-ads="true">
      <AdSlotEmbed html={code} slotKey={slotKey} className="ad-slot-embed--global" />
    </div>
  );
}
