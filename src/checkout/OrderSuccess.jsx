import { useState } from 'react';
import { SITE_NAME } from '../constants/brand';
import {
  CircleCheck,
  Package,
  Truck,
  Calendar,
  Hash,
  Copy,
  Check,
  ShoppingBag,
  MapPin,
} from 'lucide-react';

const DELIVERY_STEPS = [
  { label: 'Confirmed', icon: Package },
  { label: 'Packed', icon: ShoppingBag },
  { label: 'Shipped', icon: Truck },
  { label: 'Out for delivery', icon: MapPin },
  { label: 'Delivered', icon: CircleCheck },
];

export default function OrderSuccess({
  order,
  grandTotal,
  orderEta,
  itemCount,
  successPause,
  transition,
  onContinueShopping,
}) {
  const [trackingCopied, setTrackingCopied] = useState(false);
  const orderTotal = order.grandTotal ?? grandTotal;
  const eta = order.eta || orderEta || '3–5 business days';
  const trackingId = order.trackingId || order.id;
  const activeDeliveryStep = 1;

  const copyTracking = async () => {
    try {
      await navigator.clipboard.writeText(String(trackingId));
      setTrackingCopied(true);
      setTimeout(() => setTrackingCopied(false), 2200);
    } catch {
      alert(`Tracking ID: ${trackingId}`);
    }
  };

  return (
    <div
      className={`co-success-root ${successPause ? 'co-success-pause' : ''} ${transition || 'co-burst-enter'}`}
    >
      <div className="co-success-inner">
        <header className="co-success-hero">
          <div className="co-success-badge" aria-hidden>
            <CircleCheck size={42} strokeWidth={1.35} />
          </div>
          <p className="co-success-eyebrow">Thank you for shopping with {SITE_NAME}</p>
          <h1 className="co-success-title">Order confirmed</h1>
          <p className="co-success-sub">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} · arriving in {eta}
          </p>
        </header>

        <article className="co-success-card">
          <div className="co-success-card__head">
            <Package size={18} strokeWidth={1.75} aria-hidden />
            <span>Order summary</span>
          </div>
          <dl className="co-success-meta">
            <div className="co-success-meta__item">
              <dt>
                <Hash size={14} aria-hidden /> Order ID
              </dt>
              <dd>{order.id}</dd>
            </div>
            <div className="co-success-meta__item">
              <dt>
                <ShoppingBag size={14} aria-hidden /> Total paid
              </dt>
              <dd className="co-success-meta__highlight">₹{orderTotal}</dd>
            </div>
            <div className="co-success-meta__item">
              <dt>
                <Calendar size={14} aria-hidden /> Delivery
              </dt>
              <dd>{eta}</dd>
            </div>
            <div className="co-success-meta__item co-success-meta__item--wide">
              <dt>
                <Truck size={14} aria-hidden /> Tracking
              </dt>
              <dd className="co-success-tracking-row">
                <code className="co-success-tracking-code">{trackingId}</code>
                <button
                  type="button"
                  className="co-success-copy-btn"
                  onClick={copyTracking}
                  aria-label="Copy tracking ID"
                >
                  {trackingCopied ? <Check size={14} /> : <Copy size={14} />}
                  {trackingCopied ? 'Copied' : 'Copy'}
                </button>
              </dd>
            </div>
          </dl>
        </article>

        <section className="co-success-journey" aria-label="Delivery progress">
          <h2 className="co-success-journey__title">
            <Truck size={17} strokeWidth={1.75} aria-hidden />
            Delivery progress
          </h2>
          <ol className="co-journey-steps">
            {DELIVERY_STEPS.map((stepInfo, i) => {
              const StepIcon = stepInfo.icon;
              const isDone = i <= activeDeliveryStep;
              const isCurrent = i === activeDeliveryStep + 1;
              return (
                <li
                  key={stepInfo.label}
                  className={`co-journey-step ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
                >
                  <span className="co-journey-step__dot">
                    <StepIcon size={14} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="co-journey-step__label">{stepInfo.label}</span>
                </li>
              );
            })}
          </ol>
          <p className="co-success-journey__note">
            We&apos;ll send SMS updates when your order ships.
          </p>
        </section>

        <div className="co-success-actions">
          <button type="button" className="co-btn-primary co-btn-success-main" onClick={onContinueShopping}>
            Continue shopping
          </button>
          <button
            type="button"
            className="co-btn-back co-btn-success-track"
            onClick={() => alert(`Track your order: ${trackingId}`)}
          >
            Track order
          </button>
        </div>
      </div>
    </div>
  );
}
