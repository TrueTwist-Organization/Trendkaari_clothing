import { updateStore } from './store.js';

export const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Parse order.date (en-IN) or ISO createdAt. */
export function parseOrderPlacedAt(order) {
  if (order?.createdAt) {
    const d = new Date(order.createdAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (!order?.date) return null;

  const direct = Date.parse(order.date);
  if (!Number.isNaN(direct)) return new Date(direct);

  const m = String(order.date).match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i
  );
  if (!m) return null;

  let hour = Number(m[4]);
  if (m[7]?.toLowerCase() === 'pm' && hour < 12) hour += 12;
  if (m[7]?.toLowerCase() === 'am' && hour === 12) hour = 0;

  return new Date(
    Number(m[3]),
    Number(m[2]) - 1,
    Number(m[1]),
    hour,
    Number(m[5]),
    Number(m[6] || 0)
  );
}

/** Move Pending orders past the cancel window to Processing (confirmed). */
export function autoConfirmExpiredPendingOrders(orders, now = Date.now()) {
  if (!Array.isArray(orders)) return 0;

  let confirmed = 0;
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    if (order.status !== 'Pending') continue;

    const placedAt = parseOrderPlacedAt(order);
    if (!placedAt) continue;
    if (now - placedAt.getTime() < CANCEL_WINDOW_MS) continue;

    orders[i] = {
      ...order,
      status: 'Processing',
      confirmedAt: new Date(now).toISOString(),
    };
    confirmed += 1;
  }

  return confirmed;
}

export async function runAutoConfirmJob() {
  let confirmed = 0;
  await updateStore((store) => {
    confirmed = autoConfirmExpiredPendingOrders(store.orders);
    return store;
  });
  return confirmed;
}
