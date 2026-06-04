import PageAdSlot from '../components/PageAdSlot';
import CheckoutStepExtras from './CheckoutStepExtras';
import { CHECKOUT_STEPS } from './checkoutSteps';

export function checkoutAdKeysForStep(stepIndex) {
  const id = CHECKOUT_STEPS[stepIndex]?.id ?? 'unknown';
  return {
    top: `checkout_step_${id}_top`,
    bottom: `checkout_step_${id}_bottom`,
  };
}

function resolveCheckoutAd(ad, key, fallbackKey) {
  const code = ad(key);
  if (String(code || '').trim()) return { code, label: key };
  const fallback = ad(fallbackKey);
  if (String(fallback || '').trim()) return { code: fallback, label: fallbackKey };
  return { code: '', label: key };
}

/** Two ad slots (top + bottom) for each checkout step page. */
export default function CheckoutStepPageShell({
  step,
  ad,
  children,
  cartItems = [],
  subtotal = 0,
  allProducts = [],
  onAddToCart,
  onSelectProduct,
}) {
  const keys = checkoutAdKeysForStep(step);
  const top = resolveCheckoutAd(ad, keys.top, 'checkout_all_steps_top');
  const bottom = resolveCheckoutAd(ad, keys.bottom, 'checkout_all_steps_bottom');

  return (
    <div className="co-step-page-with-ads">
      <PageAdSlot
        key={`${step}-${top.label}`}
        code={top.code}
        label={top.label}
        variant="checkout"
      />
      <div className="co-step-page-stack">
        {children}
        <CheckoutStepExtras
          step={step}
          cartItems={cartItems}
          subtotal={subtotal}
          allProducts={allProducts}
          onAddToCart={onAddToCart}
          onSelectProduct={onSelectProduct}
        />
      </div>
      <PageAdSlot
        key={`${step}-${bottom.label}`}
        code={bottom.code}
        label={bottom.label}
        variant="checkout"
      />
    </div>
  );
}
