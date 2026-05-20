const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

const NON_CANCELLABLE_STATUSES = new Set([
  'cancelled',
  'processing',
  'delivered',
  'shipped',
  'out for delivery',
]);

/** Parse order.date from en-IN locale or ISO createdAt. */
export function getOrderPlacedAt(order) {
  if (order?.createdAt) {
    const iso = new Date(order.createdAt);
    if (!Number.isNaN(iso.getTime())) return iso;
  }
  const raw = order?.date;
  if (!raw) return null;

  const direct = Date.parse(raw);
  if (!Number.isNaN(direct)) return new Date(direct);

  const m = String(raw).match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i
  );
  if (!m) return null;

  const day = Number(m[1]);
  const month = Number(m[2]) - 1;
  const year = Number(m[3]);
  let hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = Number(m[6] || 0);
  const meridiem = m[7]?.toLowerCase();

  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;

  return new Date(year, month, day, hour, minute, second);
}

export function getCancelWindowRemainingMs(order) {
  const placed = getOrderPlacedAt(order);
  if (!placed) return 0;
  return Math.max(0, CANCEL_WINDOW_MS - (Date.now() - placed.getTime()));
}

export function canCancelOrder(order) {
  const status = String(order?.status || '').toLowerCase();
  if (status !== 'pending') return false;
  if (NON_CANCELLABLE_STATUSES.has(status)) return false;
  return getCancelWindowRemainingMs(order) > 0;
}

export function formatCancelTimeLeft(ms) {
  if (ms <= 0) return '';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m left to cancel`;
  return `${minutes}m left to cancel`;
}
