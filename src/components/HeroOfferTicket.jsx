import './HeroOfferTicket.css';

export default function HeroOfferTicket() {
  return (
    <div className="hero-offer-ticket" aria-label="First purchase offer: Flat ₹500 off">
      <div className="hero-offer-ticket__body">
        <p className="hero-offer-ticket__amount">
          <span className="hero-offer-ticket__flat">FLAT</span>
          <span className="hero-offer-ticket__price">
            <span className="hero-offer-ticket__rupee">₹</span>500 OFF
          </span>
        </p>
      </div>

      <div className="hero-offer-ticket__perforation" aria-hidden="true">
        <span className="hero-offer-ticket__notch hero-offer-ticket__notch--top" />
        <span className="hero-offer-ticket__dash" />
        <span className="hero-offer-ticket__notch hero-offer-ticket__notch--bottom" />
      </div>

      <div className="hero-offer-ticket__stub">
        <p className="hero-offer-ticket__stub-text">On Your 1st Purchase</p>
        <svg
          className="hero-offer-ticket__torn-edge"
          viewBox="0 0 12 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M0,0 H8 L12,4 L7,8 L12,12 L7,16 L12,20 L7,24 L12,28 L7,32 L12,36 L7,40 L12,44 L7,48 L12,52 L7,56 L12,60 L7,64 L12,68 L7,72 L12,76 L7,80 L12,84 L7,88 L12,92 L8,100 H0 Z"
          />
        </svg>
      </div>
    </div>
  );
}
