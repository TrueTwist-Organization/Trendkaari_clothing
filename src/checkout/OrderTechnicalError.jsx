import { AlertTriangle, CircleAlert, RotateCcw } from 'lucide-react';
import './OrderTechnicalError.css';

export default function OrderTechnicalError({
  onSelectProductsAgain,
  onReviewCart,
  detailMessage,
}) {
  return (
    <div className="co-fail-root co-silk-enter" role="alert" aria-live="polite">
      <div className="co-fail-inner">
        <header className="co-fail-hero">
          <div className="co-fail-badge" aria-hidden>
            <AlertTriangle size={36} strokeWidth={1.75} />
          </div>
          <p className="co-fail-eyebrow">Order failed</p>
          <h1 className="co-fail-title">Technical Error</h1>
          <p className="co-fail-lead">
            We could not complete your order due to a technical issue. Your bag has been cleared so
            you can start fresh — <strong>select your products again</strong>, add them to your bag,
            and complete checkout from the beginning.
          </p>
          {detailMessage && (
            <p className="co-fail-detail-msg">{detailMessage}</p>
          )}
        </header>

        <section className="co-fail-card">
          <h2 className="co-fail-card__head">What happened?</h2>
          <ul className="co-fail-list">
            <li className="co-fail-list__item">
              <span className="co-fail-list__icon" aria-hidden>
                <CircleAlert size={18} />
              </span>
              <div>
                <strong>Payment / server error</strong>
                <p>Our system could not finish processing. This is usually temporary.</p>
              </div>
            </li>
            <li className="co-fail-list__item">
              <span className="co-fail-list__icon" aria-hidden>
                <RotateCcw size={18} />
              </span>
              <div>
                <strong>Start your order again</strong>
                <p>
                  Go back to the collection, pick your items, and complete all checkout steps from
                  the beginning.
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="co-fail-card co-fail-card--next">
          <h2 className="co-fail-card__head co-fail-card__head--gold">What to do next</h2>
          <ol className="co-fail-steps">
            <li>Select your products again from the shop</li>
            <li>Add items to your bag</li>
            <li>Enter details and place order again</li>
          </ol>
        </section>

        <div className="co-cta-row co-fail-actions">
          <button type="button" className="co-btn-primary" onClick={onSelectProductsAgain}>
            Select products again
          </button>
          <button type="button" className="co-btn-back" onClick={onReviewCart}>
            Open empty bag
          </button>
        </div>
      </div>
    </div>
  );
}
