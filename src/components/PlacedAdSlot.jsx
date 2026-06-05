import PageAdSlot from './PageAdSlot';
import { resolveAdCode } from '../utils/resolveAdCode';
import { claimAdSource } from '../utils/adDedupe';

/** Renders only the ad code saved for this exact placement in admin. */
export default function PlacedAdSlot({
  adCodes,
  placement,
  variant = 'section',
  ownerKey,
  allowDuplicateSource = false,
}) {
  const { code, resolvedFrom } = resolveAdCode(adCodes, placement);
  if (!code) return null;

  const source = resolvedFrom || placement;
  const owner = ownerKey || placement;
  if (!allowDuplicateSource && !claimAdSource(source, owner, code)) return null;

  return <PageAdSlot code={code} label={placement} variant={variant} />;
}
