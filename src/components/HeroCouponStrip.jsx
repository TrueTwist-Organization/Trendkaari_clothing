import { SITE_LOGO_ALT, SITE_LOGO_SRC, SITE_NAME } from '../constants/brand';
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
      : DEFAULT_OFFER.subline,
    code: String(match.code || DEFAULT_OFFER.code).toUpperCase(),
    spine: isFlat ? `SAVE ₹${discount}` : `UPTO ${discount}% OFF`,
  };
}

export default function HeroCouponStrip({ coupons = [], onShopNow, onOpenApp }) {
  const offer = pickFeaturedCoupon(coupons);

  const handleShop = () => {
    onShopNow?.();
  };

  const handleApp = () => {
    if (onOpenApp) {
      onOpenApp();
      return;
    }
    handleShop();
  };

  return (
    <section className="hero-coupon-strip" aria-label="Special offers">
      <div className="hero-coupon-strip__wrap">
        <div className="hero-coupon-strip__ticket">
          <article className="hero-coupon-strip__panel hero-coupon-strip__panel--offer">
            <div className="hero-coupon-strip__scallop hero-coupon-strip__scallop--left" aria-hidden />
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
            <div className="hero-coupon-strip__tear" aria-hidden />
          </article>

          <article className="hero-coupon-strip__panel hero-coupon-strip__panel--brand">
            <button type="button" className="hero-coupon-strip__brand-hit" onClick={handleApp}>
              <img
                className="hero-coupon-strip__logo"
                src={SITE_LOGO_SRC}
                alt={SITE_LOGO_ALT}
                loading="lazy"
              />
              <div className="hero-coupon-strip__brand-copy">
                <span className="hero-coupon-strip__brand-name">{SITE_NAME}</span>
                <span className="hero-coupon-strip__brand-cta">
                  SHOP
                  <br />
                  NEW ARRIVALS
                </span>
              </div>
            </button>
          </article>
        </div>

        <aside className="hero-coupon-strip__spine" aria-label={offer.spine}>
          <span className="hero-coupon-strip__spine-text">{offer.spine}</span>
          <span className="hero-coupon-strip__spine-new">NEW</span>
        </aside>
      </div>
    </section>
  );
}
