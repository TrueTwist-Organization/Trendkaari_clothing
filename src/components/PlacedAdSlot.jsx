import PageAdSlot from './PageAdSlot';
import { resolveAdCode } from '../utils/resolveAdCode';
import { claimAdSource } from '../utils/adDedupe';

/** Category / product ad with dedupe — same saved unit won't stack twice on one page. */
export default function PlacedAdSlot({
  adCodes,
  placement,
  variant = 'section',
  extraFallbacks = [],
  allowGlobal = false,
  ownerKey,
  allowDuplicateSource = false,
}) {
  const { code, resolvedFrom } = resolveAdCode(adCodes, placement, extraFallbacks, { allowGlobal });
  if (!String(code || '').trim()) return null;

  const source = resolvedFrom || placement;
  const owner = ownerKey || placement;
  if (!allowDuplicateSource && !claimAdSource(source, owner)) return null;

  return <PageAdSlot code={code} label={placement} variant={variant} />;
}
