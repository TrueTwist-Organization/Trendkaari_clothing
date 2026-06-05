import AdSlotEmbed from './AdSlotEmbed';
import './PageAdSlot.css';

/** Page ad strip — hidden when slot has no saved code. */
export default function PageAdSlot({ code, label, variant = 'section', eager = true }) {
  if (!String(code || '').trim()) return null;

  return (
    <div
      className={`page-ad-slot-wrap page-ad-slot-wrap--${variant}`}
      data-ad-slot={label || undefined}
    >
      <AdSlotEmbed
        html={code}
        slotKey={label || undefined}
        className={`ad-slot-embed--page ad-slot-embed--${variant}`}
        eager={eager}
      />
    </div>
  );
}
