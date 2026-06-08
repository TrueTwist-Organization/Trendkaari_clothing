import { SITE_NAME } from '../constants/brand';
import './HeroCouponStrip.css';

const DEFAULT_OFFER = {
  headline: 'EXTRA 30% OFF',
  subline: 'On your 1st order',
  code: 'SALE100',
  spine: 'UPTO ₹500 OFF',
};

function pickFeaturedCoupon(coupons = []) {
  const list = Array.isArray(coupons) ? coupons : [];
  const match =
    list.find((c) => /sale|new|first|festive/i.test(String(c.code || ''))) || list[0];
  if (!match) return DEFAULT_OFFER;

  const discount = match.discount;
  const isFlat = match.discountType === 'flat';
  const headline = isFlat ? `EXTRA ₹${discount} OFF` : `EXTRA ${discount}% OFF`;

  return {
    headline,
    subline: match.minPurchase
      ? `On orders above ₹${match.minPurchase}`
      : 'On your 1st order',
    code: String(match.code || DEFAULT_OFFER.code).toUpperCase(),
    spine: isFlat ? `UPTO ₹${discount} OFF` : `UPTO ${discount}% OFF`,
  };
}

export default function HeroCouponStrip({ coupons = [], onShopNow, onOpenApp }) {
  const offer = pickFeaturedCoupon(coupons);

  const handleBrandClick = () => {
    if (onOpenApp) {
      onOpenApp();
      return;
    }
    onShopNow?.();
  };

  return (
    <section className="hero-coupon-strip" aria-label="Special offers">
      <div className="hero-coupon-strip__inner">
        <div className="hero-coupon-strip__dots" aria-hidden>
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i} className={`hero-coupon-strip__dot${i === 5 ? ' is-active' : ''}`} />
          ))}
        </div>

        <div className="hero-coupon-strip__row">
          <article className="hero-coupon-strip__coupon hero-coupon-strip__coupon--offer">
            <img
              className="hero-coupon-strip__models"
              src="/banners/promo-couple-luxe.png"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div className="hero-coupon-strip__offer-text">
              <h2 className="hero-coupon-strip__headline">{offer.headline}</h2>
              <p className="hero-coupon-strip__subline">{offer.subline}</p>
            </div>
            <div className="hero-coupon-strip__code-pill">
              <span className="hero-coupon-strip__code-label">USE CODE:</span>
              <strong>{offer.code}</strong>
            </div>
          </article>

          <article className="hero-coupon-strip__coupon hero-coupon-strip__coupon--brand">
            <button type="button" className="hero-coupon-strip__brand-hit" onClick={handleBrandClick}>
              <span className="hero-coupon-strip__brand-mark">{SITE_NAME}</span>
              <span className="hero-coupon-strip__brand-cta">
                SHOP
                <br />
                NEW ARRIVALS
              </span>
            </button>
          </article>

          <aside className="hero-coupon-strip__spine" aria-label={offer.spine}>
            <span className="hero-coupon-strip__spine-text">{offer.spine}</span>
            <span className="hero-coupon-strip__spine-new">NEW</span>
          </aside>
        </div>
      </div>
    </section>
  );
}
