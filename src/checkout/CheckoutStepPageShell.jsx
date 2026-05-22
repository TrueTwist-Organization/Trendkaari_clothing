import PageAdSlot from '../components/PageAdSlot';
import { CHECKOUT_STEPS } from './checkoutSteps';

export function checkoutAdKeysForStep(stepIndex) {
  const id = CHECKOUT_STEPS[stepIndex]?.id ?? 'unknown';
  return {
    top: `checkout_step_${id}_top`,
    bottom: `checkout_step_${id}_bottom`,
  };
}

/** Two ad slots (top + bottom) for each checkout step page. */
export default function CheckoutStepPageShell({ step, ad, children }) {
  const keys = checkoutAdKeysForStep(step);
  return (
    <div className="co-step-page-with-ads">
      <PageAdSlot code={ad(keys.top)} label={keys.top} variant="checkout" />
      {children}
      <PageAdSlot code={ad(keys.bottom)} label={keys.bottom} variant="checkout" />
    </div>
  );
}
