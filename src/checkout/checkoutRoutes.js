import {
  CHECKOUT_BASE,
  CHECKOUT_STEPS,
  DEFAULT_CHECKOUT_SLUG,
  SUCCESS_STEP_INDEX,
} from './checkoutSteps';

export const CHECKOUT_ERROR_SLUG = 'error';

export function checkoutPathForStep(stepIndex) {
  const slug = CHECKOUT_STEPS[stepIndex]?.path ?? DEFAULT_CHECKOUT_SLUG;
  return `${CHECKOUT_BASE}/${slug}`;
}

export function stepIndexFromSlug(slug) {
  const normalized = String(slug || DEFAULT_CHECKOUT_SLUG).toLowerCase();
  if (normalized === CHECKOUT_ERROR_SLUG) return -1;
  if (normalized === 'account') {
    return CHECKOUT_STEPS.findIndex((s) => s.id === 'contact');
  }
  const idx = CHECKOUT_STEPS.findIndex((s) => s.path === normalized);
  return idx >= 0 ? idx : 0;
}

export function isCheckoutErrorSlug(slug) {
  return String(slug || '').toLowerCase() === CHECKOUT_ERROR_SLUG;
}

export function slugFromStepIndex(stepIndex) {
  return CHECKOUT_STEPS[stepIndex]?.path ?? DEFAULT_CHECKOUT_SLUG;
}

export function parseCheckoutRoute(pathname) {
  const segments = String(pathname || '').split('/').filter(Boolean);
  if (segments[0] !== 'checkout') return null;
  const slug = segments[1] || DEFAULT_CHECKOUT_SLUG;
  return { slug, stepIndex: stepIndexFromSlug(slug) };
}

export function isCheckoutPath(pathname) {
  return parseCheckoutRoute(pathname) !== null;
}

export function normalizeCheckoutSlug(slug) {
  if (slug === CHECKOUT_ERROR_SLUG) return CHECKOUT_ERROR_SLUG;
  if (slug === 'account') return 'contact';
  const idx = stepIndexFromSlug(slug);
  return idx >= 0 ? slugFromStepIndex(idx) : DEFAULT_CHECKOUT_SLUG;
}

export function isSuccessSlug(slug) {
  return stepIndexFromSlug(slug) === SUCCESS_STEP_INDEX;
}
