import {
  CHECKOUT_BASE,
  CHECKOUT_STEPS,
  DEFAULT_CHECKOUT_SLUG,
  SUCCESS_STEP_INDEX,
} from './checkoutSteps';

export function checkoutPathForStep(stepIndex) {
  const slug = CHECKOUT_STEPS[stepIndex]?.path ?? DEFAULT_CHECKOUT_SLUG;
  return `${CHECKOUT_BASE}/${slug}`;
}

export function stepIndexFromSlug(slug) {
  const normalized = String(slug || DEFAULT_CHECKOUT_SLUG).toLowerCase();
  const idx = CHECKOUT_STEPS.findIndex((s) => s.path === normalized);
  return idx >= 0 ? idx : 0;
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
  const idx = stepIndexFromSlug(slug);
  return slugFromStepIndex(idx);
}

export function isSuccessSlug(slug) {
  return stepIndexFromSlug(slug) === SUCCESS_STEP_INDEX;
}
