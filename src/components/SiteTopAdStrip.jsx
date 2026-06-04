import AdSlotEmbed from './AdSlotEmbed';
import PageAdSlot from './PageAdSlot';
import './SiteTopAdStrip.css';

/** Full-width ad strip below fixed header — avoids logo overlap on ads. */
export default function SiteTopAdStrip({
  globalCode,
  globalSlotKey = 'site_common_ad',
  homeBelowHeaderCode,
  showHomeSlot = false,
}) {
  const hasGlobal = Boolean(String(globalCode || '').trim());
  const hasHome = showHomeSlot && Boolean(String(homeBelowHeaderCode || '').trim());

  if (!hasGlobal && !hasHome) return null;

  return (
    <div className="site-top-ad-strip" data-has-ads="true">
      {hasGlobal && (
        <AdSlotEmbed
          html={globalCode}
          slotKey={globalSlotKey}
          className="ad-slot-embed--global"
        />
      )}
      {hasHome && (
        <PageAdSlot
          code={homeBelowHeaderCode}
          label="home_below_header"
          variant="global-top"
        />
      )}
    </div>
  );
}
