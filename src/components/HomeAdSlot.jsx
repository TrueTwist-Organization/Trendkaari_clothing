import PageAdSlot from './PageAdSlot';
import { resolveAdCode } from '../utils/resolveAdCode';
import { claimAdSource } from '../utils/adDedupe';

/** Homepage section ad — one saved unit per page (no duplicate fallbacks). */
export default function HomeAdSlot({ adCodes, placement, code, label }) {
  const resolved =
    placement && adCodes
      ? resolveAdCode(adCodes, placement)
      : { code, resolvedFrom: label || placement, label: label || placement };

  if (!String(resolved.code || '').trim()) return null;

  const source = resolved.resolvedFrom || placement || label;
  const owner = placement || label || source;
  if (!claimAdSource(source, owner, resolved.code)) return null;

  return (
    <PageAdSlot
      code={resolved.code}
      label={placement || label}
      variant="section"
    />
  );
}
