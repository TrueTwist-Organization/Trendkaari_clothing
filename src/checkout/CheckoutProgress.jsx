import { CHECKOUT_STEPS } from './checkoutSteps';

export default function CheckoutProgress({ currentStep }) {
  const meta = CHECKOUT_STEPS[currentStep];
  return (
    <div className="co-progress-wrap" role="navigation" aria-label="Checkout progress">
      <p className="co-step-counter">
        Step <strong>{currentStep + 1}</strong> of <strong>{CHECKOUT_STEPS.length}</strong>
        <span className="co-step-counter-sep">·</span>
        <span className="co-step-counter-label">{meta?.label}</span>
      </p>
      <div className="co-progress-track" aria-hidden>
        {CHECKOUT_STEPS.map((s, i) => (
          <span
            key={s.id}
            className={`co-progress-dot ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}
            title={s.label}
          />
        ))}
      </div>
      <div className="co-progress-steps co-progress-steps--compact">
        {CHECKOUT_STEPS.map((s, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div
              key={s.id}
              className={`co-progress-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}
            >
              <div className="co-progress-circle" aria-current={active ? 'step' : undefined}>
                {done ? (
                  <svg className="co-check-svg" viewBox="0 0 24 24" aria-hidden>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="co-progress-emoji" aria-hidden>
                    {s.icon}
                  </span>
                )}
              </div>
              <span className="co-progress-label">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
