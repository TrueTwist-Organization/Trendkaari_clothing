/** Checkout journey — 9 pages with URL paths under /checkout/:slug */
export const CHECKOUT_BASE = '/checkout';
export const CHECKOUT_STEP_COUNT = 9;

export const CHECKOUT_PHASES = [
  { id: 'bag', label: 'My Bag' },
  { id: 'savings', label: 'Savings' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'review', label: 'Review Items' },
  { id: 'summary', label: 'Order Summary' },
  { id: 'payment', label: 'Payment' },
  { id: 'done', label: 'Done' },
];

export const CHECKOUT_STEPS = [
  { id: 'bag', path: 'bag', label: 'Shopping bag', phase: 0 },
  { id: 'savings', path: 'savings', label: 'Offers & promo', phase: 1 },
  { id: 'totals', path: 'total', label: 'Order total', phase: 1 },
  { id: 'contact', path: 'contact', label: 'Contact details', phase: 2 },
  { id: 'address', path: 'address', label: 'Delivery address', phase: 2 },
  { id: 'review', path: 'review', label: 'Review items', phase: 3 },
  { id: 'summary', path: 'summary', label: 'Order summary', phase: 4 },
  { id: 'payment', path: 'payment', label: 'Payment', phase: 5 },
  { id: 'success', path: 'success', label: 'Order placed', phase: 6 },
];

export const SUCCESS_STEP_INDEX = 8;
export const DEFAULT_CHECKOUT_SLUG = 'bag';

export function getPhaseIndex(stepIndex) {
  return CHECKOUT_STEPS[stepIndex]?.phase ?? 0;
}

export function stepsInPhase(phaseIndex) {
  return CHECKOUT_STEPS.filter((s) => s.phase === phaseIndex).length;
}

export function stepIndexInPhase(stepIndex) {
  const phase = getPhaseIndex(stepIndex);
  const stepsInP = CHECKOUT_STEPS.filter((s) => s.phase === phase);
  const id = CHECKOUT_STEPS[stepIndex]?.id;
  return Math.max(0, stepsInP.findIndex((s) => s.id === id));
}
