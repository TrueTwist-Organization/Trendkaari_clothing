import PlacedAdSlot from '../components/PlacedAdSlot';
import CheckoutStepExtras from './CheckoutStepExtras';
import { CHECKOUT_STEPS } from './checkoutSteps';
import { refreshAllGptSlots } from '../utils/googletag';
import { useEffect } from 'react';

export function checkoutAdKeysForStep(stepIndex) {
  const id = CHECKOUT_STEPS[stepIndex]?.id ?? 'unknown';
  return {
    top: `checkout_step_${id}_top`,
    bottom: `checkout_step_${id}_bottom`,
  };
}

/** Two ad slots (top + bottom) for each checkout step page. */
export default function CheckoutStepPageShell({
  step,
  adCodes = {},
  children,
  cartItems = [],
  subtotal = 0,
  allProducts = [],
  onAddToCart,
  onSelectProduct,
}) {
  const keys = checkoutAdKeysForStep(step);

  // GPT slots mount inside the checkout drawer — refresh after open + step change
  useEffect(() => {
    const t1 = window.setTimeout(refreshAllGptSlots, 400);
    const t2 = window.setTimeout(refreshAllGptSlots, 1500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [step, adCodes]);

  return (
    <div className="co-step-page-with-ads">
      <PlacedAdSlot adCodes={adCodes} placement={keys.top} variant="checkout" />
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
      <PlacedAdSlot
        adCodes={adCodes}
        placement={keys.bottom}
        allowDuplicateSource
        variant="checkout"
      />
    </div>
  );
}
